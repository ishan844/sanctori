import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, animate, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const CartIcon = ({ hasItems }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const prevHasItems = useRef(false);

    // Detect when items are first added
    useEffect(() => {
        if (hasItems && !prevHasItems.current) {
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 600);
        }
        prevHasItems.current = hasItems;
    }, [hasItems]);

    // Every 10 seconds, flash the tooltip if there are items (visible for 5s)
    useEffect(() => {
        if (!hasItems) return;
        const interval = setInterval(() => {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 5000);
        }, 10000);
        return () => clearInterval(interval);
    }, [hasItems]);

    return (
        <div className="relative flex items-center" style={{ perspective: '600px' }}>
            <motion.button
                className="cursor-pointer outline-none hover:opacity-80 relative"
                animate={justAdded ? { scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, -8, 8, -4, 0] } : {}}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                aria-label="Shopping basket"
            >
                {/* Basket / bag icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    {hasItems ? (
                        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        />
                    ) : (
                        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            strokeDasharray="3 3" opacity="0.4"
                        />
                    )}
                </svg>

                {/* Badge dot */}
                <AnimatePresence>
                    {hasItems && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Periodic "few things are waiting" tooltip — 3D jump-out container */}
            <AnimatePresence>
                {showTooltip && hasItems && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.6,
                            y: -8,
                            rotateX: -25,
                            filter: 'blur(6px)',
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            rotateX: 0,
                            filter: 'blur(0px)',
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.85,
                            y: 4,
                            rotateX: 15,
                            filter: 'blur(4px)',
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                            mass: 0.8,
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="absolute top-full mt-3 right-0 translate-x-2 whitespace-nowrap"
                    >
                        <div
                            className="relative px-4 py-2.5 border border-secondary/15 rounded-md shadow-lg"
                            style={{
                                background: '#f3efe8',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* Small arrow pointing up toward the cart icon */}
                            <div
                                className="absolute top-0 right-3 -translate-y-full"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '5px solid transparent',
                                    borderRight: '5px solid transparent',
                                    borderBottom: '5px solid rgba(var(--color-secondary-rgb, 45,30,16), 0.15)',
                                }}
                            />
                            <span className="font-gotham text-secondary/80 text-[10px] uppercase tracking-[0.14em] font-medium">
                                few things are waiting
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Header = ({ cartHasItems }) => {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    // Force scroll to top and mark mounted after a brief guard delay
    React.useEffect(() => {
        window.scrollTo(0, 0);
        // Give the browser a tick to settle before we listen for scroll/wheel
        const mountTimer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(mountTimer);
    }, []);

    React.useEffect(() => {
        if (!isMounted) return;

        // Track scrollY for when body scroll is unlocked
        const unsubScroll = scrollY.on("change", (latest) => {
            if (latest > 1) setIsScrolled(true);
            else setIsScrolled(false);
        });

        // Also detect first wheel event — needed because scrollY doesn't
        // change while body scroll is locked during the hero animation
        const handleWheel = (e) => {
            if (Math.abs(e.deltaY) > 0) setIsScrolled(true);
        };
        window.addEventListener('wheel', handleWheel, { passive: true });

        return () => {
            unsubScroll();
            window.removeEventListener('wheel', handleWheel);
        };
    }, [scrollY, isMounted]);

    const isCollapsed = isScrolled && !isHovered;

    // Ultra-slow, deliberate transition — decoupled from scroll speed
    const slowTransition = { duration: 2.4, ease: [0.22, 0.61, 0.36, 1] };

    return (
        <>
            <header
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="bg-tertiary font-gotham sticky top-0 z-50 hidden lg:block border-b border-secondary/25"
            >
                <motion.div
                    initial={{ height: 'auto', opacity: 1 }}
                    animate={{
                        height: isCollapsed ? 0 : 'auto',
                        opacity: isCollapsed ? 0 : 1,
                    }}
                    transition={slowTransition}
                    className="overflow-hidden"
                >
                    {/* Utility bar + Logo — only this part collapses */}
                    <div className="flex flex-col justify-center pt-6">
                        <div className="font-gotham flex items-start justify-between px-8 py-2">
                            <div className="gap-4.5 flex">
                                <button className="cursor-pointer outline-none hover:opacity-80"><img width="24" height="24" src="/assets/support_agent.svg" alt="support_agent" /></button>
                                <button className="cursor-pointer outline-none hover:opacity-80"><img width="24" height="24" src="/assets/newsletter.svg" alt="mail icon" /></button>
                            </div>
                            <div className="flex items-center gap-6">
                                <a className="font-gotham text-secondary hover-underline py-2 text-[12px] uppercase" href="/login">Member login</a>
                            </div>
                        </div>
                        <a href="/"><img className="w-46.5 mx-auto h-24" src="/assets/logo.svg" alt="logo" /></a>
                    </div>
                </motion.div>

                {/* Nav links — always visible */}
                <div className="font-gotham text-secondary flex w-full items-center justify-center overflow-visible py-4 text-center text-[13px] font-normal uppercase bg-tertiary relative">
                    <div className="flex w-full items-center justify-center">
                        <a className="relative mx-16 my-2 cursor-pointer transition after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current" href="/products">PRODUCTS</a>
                        <div className="bg-secondary/25 h-6 w-px"></div>
                        <a className="underline-on-hover mx-16 my-2 cursor-pointer transition" href="/member-info">MEMBERSHIP INFORMATION</a>
                        <div className="bg-secondary/25 h-6 w-px"></div>
                        <a className="underline-on-hover mx-16 my-2 cursor-pointer transition" href="/producer-guide">PRODUCER GUIDE</a>
                        <div className="bg-secondary/25 h-6 w-px"></div>
                        <a className="underline-on-hover mx-16 my-2 cursor-pointer transition" href="/about">ABOUT SANCTORY</a>
                    </div>
                    {/* Cart icon pinned to right side of nav bar — visible even when collapsed */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <CartIcon hasItems={cartHasItems} />
                    </div>
                </div>
            </header>

            <header className="bg-tertiary sticky top-0 z-50 flex h-fit items-start justify-between px-5 py-6 transition-transform duration-500 lg:hidden">
                <button className="z-40 flex size-9 h-8 flex-col justify-between p-2 focus:outline-none sm:size-10" aria-label="Open menu">
                    <span className="bg-secondary block h-0.5 w-full rounded transition-all duration-300"></span>
                    <span className="bg-secondary block h-0.5 w-full rounded transition-all duration-300"></span>
                    <span className="bg-secondary block h-0.5 w-full rounded transition-all duration-300"></span>
                </button>
                <a className="bg-tertiary absolute -bottom-5 left-1/2 flex w-full -translate-x-1/2 items-center justify-center pb-2 transition-transform duration-500" href="/">
                    <img className="w-29.25 z-50 h-full" src="/assets/logo.svg" alt="logo" />
                </a>
                <div className="flex items-center gap-4">
                    <a className="font-gotham text-secondary hover-underline pt-2 text-[12px] uppercase" href="/login">Member login</a>
                    <CartIcon hasItems={cartHasItems} />
                </div>
            </header>
        </>
    );
};

const Footer = () => (
    <div className="z-50! bg-tertiary font-gotham px-13 border-t border-secondary/25 flex w-full flex-wrap gap-8 py-20 lg:justify-center lg:gap-0">
        <div className="font-gotham text-secondary/50 min-w-37.5 max-w-75 flex grow flex-col gap-5 text-[13px] font-normal uppercase *:space-y-[10%]">
            <h1 className="text-secondary text-sm! font-medium">Customer Support</h1>
            <a className="space-y-[10%]" href="/#">FAQs/HELP</a>
            <a className="space-y-[10%]" href="/#">Shipping &amp; Delivery</a>
            <a href="/#">Returns &amp; Exchanges</a>
            <a href="/#">Order Tracking</a>
            <a href="?modal=contact">contact us</a>
        </div>
        <div className="font-gotham text-secondary/50 min-w-37.5 max-w-75 flex grow flex-col gap-5 text-[13px] font-normal uppercase *:space-y-[10%]">
            <h1 className="text-secondary text-sm font-medium">COMPANY INFORMATION</h1>
            <a href="/#">Our Story</a>
            <a href="/#">Brand philosophy</a>
            <a href="/#">Newsletter Archive</a>
        </div>
        <div className="font-gotham text-secondary/50 min-w-37.5 max-w-75 flex grow flex-col gap-5 text-[13px] font-normal uppercase *:space-y-[10%]">
            <h1 className="text-secondary text-sm font-medium">LEGAL</h1>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Cookie Policy</span>
            <span>Collaboration Policy</span>
            <span>Membership Policy</span>
            <span>Copyright Notice</span>
            <span>Sitemap</span>
        </div>
        <div className="font-gotham text-secondary/50 min-w-37.5 max-w-75 flex grow flex-col gap-5 text-[13px] font-normal uppercase *:space-y-[10%]">
            <h1 className="text-secondary text-sm font-medium">My membership</h1>
            <span>profile</span>
            <span>wishlist</span>
            <span>order history</span>
            <span>addresses</span>
        </div>
        <div className="font-gotham text-secondary/50 min-w-37.5 max-w-100 flex grow flex-col gap-5 text-[13px] font-normal uppercase">
            <h1 className="text-secondary space-y-[10%] text-sm font-medium">Community</h1>
            <span className="space-y-[10%]">SUBSCRIBE TO OUR NEWSLETTER</span>
            <div className="mb-6 flex flex-row gap-0">
                <input className="placeholder:font-gotham text-secondary/75 placeholder:text-[13px]! placeholder:text-secondary/75 bg-tertiary! border-b border-secondary/25 w-full space-y-[10%] py-3 text-[13px] outline-none placeholder:font-normal" placeholder="Enter your email id" spellCheck="false" type="email" />
                <button className="font-gotham text-secondary hover:opacity-75 cursor-pointer px-3 py-1 text-[12px] font-medium uppercase tracking-[5%] transition-all duration-200 sm:px-6 sm:py-3 sm:text-[13px]">SUBSCRIBE</button>
            </div>
            <div className="flex flex-col items-start justify-center gap-2 mt-4">
                <span className="font-gotham text-secondary text-[13px] font-medium uppercase">Follow US ON</span>
                <div className="text-secondary flex items-center justify-center gap-3 mt-2">
                    <a target="_blank" href="https://www.instagram.com/thesanctory/"><img loading="lazy" src="/assets/instagram.svg" width="16" height="16" alt="instagram logo" className="opacity-75 hover:opacity-100 transition-opacity" /></a>
                    <a target="_blank" href="https://www.linkedin.com/company/sanctory/"><img loading="lazy" src="/assets/linkedin.svg" width="16" height="16" alt="linkedin logo" className="opacity-75 hover:opacity-100 transition-opacity" /></a>
                </div>
            </div>
        </div>
    </div>
);


const ProvenanceJourney = () => {
    const sectionRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const pillars = [
        {
            heading: "The Gir Breed",
            description: "Not all cows are the same. Gir cattle have grazed the grasslands of Saurashtra for centuries — their milk carries a natural richness that cross-bred or commercial herds simply don't produce. This ghee starts with that milk, and nothing else.",
            bullets: [
                "Products made without industrial shortcuts",
                "Traditional or generational knowledge in practice",
                "Small-batch, seasonal or naturally limited production",
                "Full traceability and respect for origin",
                "No additives, artificial enhancements or plastic packaging",
                "Honest materials and honest methods",
                "A lived story, not a manufactured one"
            ]
        },
        {
            heading: "The Bilona Method",
            description: "Most ghee is made by separating cream directly from milk. The bilona method does something different — milk is first cultured into curd, then hand-churned to extract butter, then slowly clarified over an open flame. Longer, slower, and increasingly rare. The difference is in every spoon.",
            bullets: [
                "Milk from free-grazing Gir cows across Saurashtra",
                "Set overnight in earthen clay pots, not steel",
                "Hand-churned at dawn using a wooden bilona",
                "Curd cultured naturally — no starter packets",
                "Slow-simmered in small batches until golden",
                "Sealed the same day with no preservatives",
                "Fewer than a hundred batches made each year"
            ]
        },
        {
            heading: "Small Batch, Always",
            description: "Each batch is made in quantities small enough to oversee completely. No shortcuts, no scaling, no compromise. When a batch is gone, it's gone. The next one is made the same way, from the beginning.",
            bullets: [
                "Single-origin A2 ghee from a known herd",
                "Glass jar, hand-labelled and batch-numbered",
                "No plastic, no fillers, no artificial anything",
                "Aroma and colour that shifts with the season",
                "A flavour profile you won't find in stores",
                "Complete provenance on every jar",
                "Made for people who notice the difference"
            ]
        }
    ];

    // Track scroll position within the section to determine active pillar
    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const sectionTop = -rect.top;
            const sectionHeight = sectionRef.current.scrollHeight - window.innerHeight;
            const progress = Math.max(0, Math.min(1, sectionTop / sectionHeight));
            const newIndex = Math.min(
                pillars.length - 1,
                Math.floor(progress * pillars.length)
            );
            setActiveIndex(newIndex);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pillars.length]);

    return (
        <section
            ref={sectionRef}
            className="w-full bg-tertiary border-t border-secondary/25 relative"
            style={{ height: `${pillars.length * 100}vh` }}
        >
            {/* Sticky container — both columns stay fixed while section scrolls */}
            <div
                className="sticky top-0 h-screen w-full flex flex-col lg:flex-row overflow-hidden"
            >
                {/* LEFT COLUMN — Full-height illustration */}
                <div className="hidden lg:block lg:w-[48%] h-full relative overflow-hidden">
                    <img
                        src="/assets/provenance_illustration.png"
                        alt="Provenance illustration — Saurashtra landscape with Gir cattle"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Soft right-edge fade into the text column */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to right, transparent 70%, var(--color-tertiary, #f3efe8) 100%)',
                        }}
                    />
                    {/* Subtle bottom gradient for depth */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 30%)',
                        }}
                    />
                </div>

                {/* RIGHT COLUMN — Sticky text panel */}
                <div className="w-full lg:w-[52%] h-full flex flex-col px-8 lg:px-20 xl:px-28 relative">
                    {/* Section title — pushed to top */}
                    <div className="pt-20 lg:pt-32 pb-10">
                        <h2 className="font-rosemode text-secondary text-[24px] lg:text-[29px] xl:text-[36px] leading-[1.15]">
                            The Provenance Journey
                        </h2>
                    </div>

                    {/* Text content — centered in the remaining space */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="relative min-h-[400px]">
                            {/* Vertical scroll progress bar — aligned with content heading */}
                            <div
                                className="absolute -right-12 lg:-right-20 top-0 h-full flex items-start pointer-events-none"
                                style={{ width: '24px' }}
                            >
                                <div
                                    className="relative rounded-full"
                                    style={{
                                        width: '3px',
                                        height: '100%',
                                        backgroundColor: 'rgba(36, 36, 36, 0.08)',
                                    }}
                                >
                                    <div
                                        className="absolute left-0 w-full rounded-full"
                                        style={{
                                            height: `${100 / pillars.length}%`,
                                            top: `${(activeIndex / pillars.length) * 100}%`,
                                            backgroundColor: 'var(--color-secondary, #242424)',
                                            opacity: 0.35,
                                            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                        }}
                                    />
                                </div>
                            </div>
                        {pillars.map((pillar, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 flex flex-col"
                                style={{
                                    opacity: activeIndex === i ? 1 : 0,
                                    transform: activeIndex === i
                                        ? 'translateY(0)'
                                        : activeIndex > i
                                            ? 'translateY(-24px)'
                                            : 'translateY(24px)',
                                    transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                    pointerEvents: activeIndex === i ? 'auto' : 'none',
                                }}
                            >
                                {/* Heading */}
                                <h3 className="font-gotham text-secondary text-[22px] lg:text-[24px] xl:text-[29px] uppercase tracking-[0.05em] font-bold mb-6 leading-tight">
                                    {pillar.heading}
                                </h3>

                                {/* Divider */}
                                <div
                                    className="h-px bg-secondary/20 mb-8"
                                    style={{
                                        width: activeIndex === i ? '64px' : '0px',
                                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
                                    }}
                                />

                                {/* Description */}
                                <p className="font-gotham text-secondary/70 text-sm lg:text-base xl:text-lg font-normal leading-[180%] max-w-xl">
                                    {pillar.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

            {/* MOBILE FALLBACK — stacked layout, no sticky behavior */}
            <div className="lg:hidden absolute inset-0 bg-tertiary px-6 py-20">
                {/* Mobile illustration */}
                <div className="w-full h-64 mb-12 overflow-hidden">
                    <img
                        src="/assets/provenance_illustration.png"
                        alt="Provenance illustration"
                        className="w-full h-full object-cover"
                    />
                </div>

                <h2 className="font-rosemode text-secondary text-[24px] leading-[1.15] mb-12">
                    The Provenance Journey
                </h2>

                <div className="flex flex-col gap-16">
                    {pillars.map((pillar, i) => (
                        <div key={i} className="flex flex-col">
                            <span className="font-gotham text-secondary/30 text-[12px] uppercase tracking-[0.25em] font-medium mb-4">
                                0{i + 1} / 0{pillars.length}
                            </span>
                            <h3 className="font-gotham text-secondary text-base uppercase tracking-[0.1em] font-bold mb-3">
                                {pillar.heading}
                            </h3>
                            <div className="w-10 h-px bg-secondary/20 mb-5" />
                            <p className="font-gotham text-secondary/70 text-xs font-normal leading-[185%] mb-6">
                                {pillar.description}
                            </p>
                            <ul className="flex flex-col gap-2 pl-0 list-none">
                                {pillar.bullets.map((bullet, j) => (
                                    <li key={j} className="font-gotham text-secondary/65 text-[13px] font-normal leading-[170%] flex items-start gap-3">
                                        <span className="mt-[8px] w-[5px] h-[5px] rounded-full bg-secondary/35 flex-shrink-0" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TOTAL_FRAMES = 60;
const FRAME_PATH = '/assets/ghee-frames/frame_';

const ProductHero = ({ isAddedToBasket, setIsAddedToBasket }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const framesRef = useRef([]);
    const currentFrameRef = useRef(0);
    const scrollProgress = useMotionValue(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState('500ml');
    const [showCheck, setShowCheck] = useState(false);
    const [tastingOpen, setTastingOpen] = useState(false);

    const sizeOptions = {
        '300ml': { label: '300ml', price: '£22', tooltip: 'Lasts about 2 weeks for 4 people.' },
        '500ml': { label: '500ml', price: '£35', tooltip: 'Lasts about a month for 4 people.' },
    };

    // Remove black background by making dark pixels transparent
    const removeBlackBg = (ctx, w, h) => {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const brightness = (r + g + b) / 3;
            if (brightness < 30) {
                data[i + 3] = 0; // fully transparent
            } else if (brightness < 60) {
                data[i + 3] = Math.round((brightness - 30) / 30 * 255); // smooth fade
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    // Preload all frames
    useEffect(() => {
        const images = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `${FRAME_PATH}${String(i).padStart(3, '0')}.jpg`;
            img.onload = () => {
                if (i === 1 && canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    canvasRef.current.width = img.naturalWidth;
                    canvasRef.current.height = img.naturalHeight;
                    ctx.drawImage(img, 0, 0);
                    removeBlackBg(ctx, img.naturalWidth, img.naturalHeight);
                }
            };
            images[i - 1] = img;
        }
        framesRef.current = images;
    }, []);

    // Draw frame based on scroll
    useEffect(() => {
        const unsubscribe = scrollProgress.on('change', (progress) => {
            const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
            if (frameIndex === currentFrameRef.current) return;
            currentFrameRef.current = frameIndex;

            const canvas = canvasRef.current;
            const img = framesRef.current[frameIndex];
            if (!canvas || !img || !img.complete) return;

            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            removeBlackBg(ctx, canvas.width, canvas.height);
        });
        return unsubscribe;
    }, [scrollProgress]);

    // Wheel-event driven animation with scroll lock
    const animPhaseRef = useRef('idle'); // 'idle' | 'animating' | 'complete'

    // Lock body scroll on mount — hero is the first section
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Wheel-event driven animation with body scroll lock
    // Bottle moves ONLY while actively scrolling — no free-flowing tweens
    useEffect(() => {
        const SENSITIVITY = 0.0015; // Low = slow, deliberate progression

        const handleWheel = (e) => {
            const progress = scrollProgress.get();

            // If body is locked (animation phase), drive the bottle directly
            if (document.body.style.overflow === 'hidden') {
                e.preventDefault();

                if (e.deltaY > 0) {
                    const newProgress = Math.min(1, progress + e.deltaY * SENSITIVITY);
                    scrollProgress.set(newProgress);

                    if (newProgress >= 1) {
                        // Bottle animation complete — unlock page scrolling
                        document.body.style.overflow = '';
                        animPhaseRef.current = 'complete';
                    }
                }

                if (e.deltaY < 0 && progress > 0) {
                    const newProgress = Math.max(0, progress + e.deltaY * SENSITIVITY);
                    scrollProgress.set(newProgress);
                }
                return;
            }

            // Body is unlocked — normal scrolling
            // We NO LONGER re-lock if user scrolls back to the very top.
            // The animation plays ONE TIME on scroll, and then stays in the final state forever.
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [scrollProgress]);

    const bottleScale = useTransform(scrollProgress, [0, 1], [0.6, 2.2]);
    const bottleY = useTransform(scrollProgress, [0, 1], [50, 250]);
    const bottleX = useTransform(scrollProgress, [0, 1], [-50, 100]);
    // 3D tilt: straight at start → tilts mid-scroll → straightens at end
    const bottleTiltX = useTransform(scrollProgress, [0, 0.2, 0.5, 0.8, 1], [0, 15, 18, 15, 0]);
    // Background fades out as the bottle reaches its final form
    const bgOpacity = useTransform(scrollProgress, [0, 0.3, 0.9], [1, 1, 0]);

    // Details and thumbnails fade in only at the very end
    const detailsOpacity = useTransform(scrollProgress, [0.85, 1], [0, 1]);
    const pointerEvents = useTransform(scrollProgress, v => v > 0.95 ? "auto" : "none");

    return (
        <div ref={containerRef} className="relative w-full bg-tertiary" style={{ height: '100dvh', minHeight: '100vh', marginTop: '-1px' }}>
            <div className="w-full overflow-hidden flex items-center justify-center relative" style={{ height: '100dvh', minHeight: '100vh' }}>
                {/* Background image that fades out with scroll */}
                <motion.div
                    style={{ opacity: bgOpacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    className="z-0 pointer-events-none"
                >
                    <img
                        src="/assets/hero_bg.png"
                        alt="Saurashtra farmhouse at dawn"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-tertiary/90 lg:from-transparent via-tertiary/50 to-tertiary/95"></div>
                </motion.div>

                {/* Content Container */}
                <div className="relative z-20 max-w-[100rem] mx-auto w-full px-6 lg:px-[84px] h-full flex flex-col lg:flex-row items-center lg:items-start justify-between py-14 lg:pb-24 lg:pt-28">

                    {/* Left: Thumbnail Carousel — minimal image-only strip */}
                    <motion.div
                        style={{ opacity: detailsOpacity, pointerEvents }}
                        className="hidden lg:flex flex-col gap-6 absolute left-6 lg:left-[24px] top-[15%] z-30"
                    >
                        <img
                            src="/assets/carousel-img1.png"
                            alt="Ghee jar"
                            onClick={() => setSelectedImage(null)}
                            className={`w-[94px] h-auto object-contain cursor-pointer transition-all duration-300 ${selectedImage === null ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
                        />
                        <img
                            src="/assets/carousel-img2.png"
                            alt="Gift box packaging"
                            onClick={() => setSelectedImage('/assets/carousel-img2.png')}
                            className={`w-[84px] h-auto object-contain cursor-pointer transition-all duration-300 ${selectedImage === '/assets/carousel-img2.png' ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
                        />
                    </motion.div>

                    {/* The Jar — scroll-scrubbed frame sequence */}
                    <div className="w-full lg:w-[50%] h-[50vh] lg:h-full flex items-end justify-center lg:justify-start self-end" style={{ perspective: '1200px' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                            style={{ y: bottleY, x: bottleX, scale: bottleScale, rotateX: bottleTiltX, originY: 1, originX: 0.5, aspectRatio: '9/16' }}
                            className="h-[90%] lg:h-[85%] max-w-full drop-shadow-2xl origin-bottom relative flex items-center justify-center"
                        >
                            <canvas
                                ref={canvasRef}
                                className={`h-full w-auto transition-opacity duration-500 max-w-full ${selectedImage ? 'opacity-0' : 'opacity-100'}`}
                            />
                            <div className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-500 pointer-events-none ${selectedImage ? 'opacity-100' : 'opacity-0'}`}>
                                {selectedImage && (
                                    <img src={selectedImage} className={`h-full w-auto object-contain max-w-full mix-blend-multiply ${selectedImage === '/assets/carousel-img2.png' ? 'scale-[0.5] translate-y-[10px]' : 'scale-100'}`} alt="Selected product view" />
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: The Product Details */}
                    <motion.div
                        style={{ opacity: detailsOpacity, pointerEvents }}
                        className="w-full lg:w-[42%] flex flex-col items-start text-left z-30 mt-8 lg:mt-0 lg:pt-10 lg:pr-4"
                    >
                        {/* Category / Subtitle */}
                        <div className="flex items-center gap-4 mb-4 w-full">
                            <div className="h-px w-8 bg-secondary/50"></div>
                            <span className="font-gotham text-secondary/75 text-[11px] uppercase tracking-[0.2em] font-medium">Saurashtra, India</span>
                        </div>

                        {/* Title & Price */}
                        <div className="flex flex-col w-full mb-5">
                            <h1 className="font-rosemode text-secondary text-[34px] lg:text-[48px] leading-none mb-1">Gir Bilona Ghee</h1>
                            <span className="font-gotham text-secondary text-base lg:text-lg font-light">{sizeOptions[selectedSize].price} <span className="text-[13px] text-secondary/50 ml-2">/ {sizeOptions[selectedSize].label}</span></span>
                        </div>

                        {/* Description */}
                        <div className="font-gotham text-secondary/60 text-[13px] lg:text-sm font-normal leading-[180%] mb-8">
                            <span className="block whitespace-nowrap"><em>Bilona method — milk set overnight in clay, hand-churned at dawn.</em></span>
                            <span className="block">Fewer than a hundred batches made this way each year.</span>
                        </div>

                        {/* Selectors / Add to Cart area */}
                        <div className="w-full flex flex-col gap-5 mb-8">
                            {/* Size Selector */}
                            <div className="flex flex-col gap-2">
                                <span className="font-gotham text-secondary/80 text-[11px] uppercase tracking-[0.1em]">Size</span>
                                <div className="flex gap-2">
                                    {Object.entries(sizeOptions).map(([key, opt]) => (
                                        <div key={key} className="relative group">
                                            <button
                                                onClick={() => setSelectedSize(key)}
                                                className={`px-5 py-2 rounded-full border text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer font-gotham font-medium ${selectedSize === key
                                                    ? 'border-secondary bg-secondary text-tertiary'
                                                    : 'border-secondary/25 text-secondary/60 hover:border-secondary/60 hover:text-secondary'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                            {/* Tooltip */}
                                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-secondary text-tertiary font-gotham text-[11px] font-normal normal-case tracking-normal whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-700">
                                                {opt.tooltip}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-secondary"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Frequency */}
                            <div className="flex flex-col gap-2">
                                <span className="font-gotham text-secondary/80 text-[11px] uppercase tracking-[0.1em]">Delivery Frequency</span>
                                <div className="flex gap-2 w-full">
                                    <button className="flex-1 py-3 border border-secondary text-secondary text-[13px] uppercase tracking-wider hover:bg-secondary hover:text-tertiary transition-colors cursor-pointer">One-Time</button>
                                    <button className="flex-1 py-3 border border-secondary/20 text-secondary/50 text-[13px] uppercase tracking-wider hover:border-secondary transition-colors cursor-pointer">Subscribe</button>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => {
                                    if (!isAddedToBasket) {
                                        setShowCheck(true);
                                        setTimeout(() => {
                                            setShowCheck(false);
                                            setIsAddedToBasket(true);
                                        }, 1100);
                                    }
                                }}
                                layout
                                className={`relative w-full py-3 text-[13px] font-medium uppercase tracking-[0.15em] cursor-pointer overflow-hidden border ${isAddedToBasket
                                    ? 'bg-tertiary text-secondary border-secondary/30'
                                    : 'bg-secondary text-tertiary border-secondary'
                                    }`}
                                style={{ transition: 'background-color 800ms cubic-bezier(0.23, 1, 0.32, 1), color 800ms cubic-bezier(0.23, 1, 0.32, 1), border-color 800ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                                whileTap={!isAddedToBasket && !showCheck ? { scale: 0.97 } : {}}
                                transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <AnimatePresence mode="wait">
                                    {showCheck ? (
                                        <motion.span
                                            key="check"
                                            className="flex items-center justify-center gap-2 w-full"
                                            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <motion.path
                                                    d="M5 13l4 4L19 7"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 }}
                                                />
                                            </svg>
                                            <span>Added</span>
                                        </motion.span>
                                    ) : isAddedToBasket ? (
                                        <motion.span
                                            key="go"
                                            className="flex items-center justify-center gap-2.5 w-full"
                                            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <span>Go to Basket</span>
                                            <motion.svg
                                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                initial={{ x: -4, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                                            >
                                                <path d="M5 12h14" />
                                                <path d="M12 5l7 7-7 7" />
                                            </motion.svg>
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="add"
                                            className="flex items-center justify-center w-full"
                                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            Add to Basket
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>

                        {/* Footer specs */}
                        <div className="w-full flex flex-col pt-6 border-t border-secondary/20">
                            {/* Tasting Notes Accordion */}
                            <div className="flex flex-col">
                                <button
                                    onClick={() => setTastingOpen(prev => !prev)}
                                    className="flex justify-between items-center w-full group cursor-pointer py-2 bg-transparent border-none outline-none"
                                >
                                    <span className="font-gotham text-secondary text-[13px] uppercase tracking-wider">Tasting Notes</span>
                                    <motion.svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                        className="text-secondary/50 group-hover:text-secondary transition-colors"
                                        animate={{ rotate: tastingOpen ? 180 : 0 }}
                                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </motion.svg>
                                </button>

                                <AnimatePresence>
                                    {tastingOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-5 pt-2 font-gotham text-secondary text-[13px] font-light leading-[200%]">
                                                {[
                                                    'Rich and nutty with a quiet sweetness underneath. ',
                                                    'A clean finish — no heaviness, no aftertaste. ',
                                                    'The depth varies slightly batch to batch depending on season and pasture. ',
                                                    'That\u2019s not inconsistency. ',
                                                    'That\u2019s what real ghee tastes like.'
                                                ].map((line, i) => (
                                                    <motion.span
                                                        key={i}
                                                        style={{ display: 'inline' }}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            duration: 1,
                                                            ease: [0.16, 1, 0.3, 1],
                                                            delay: i * 0.3
                                                        }}
                                                    >
                                                        {line}
                                                    </motion.span>
                                                ))}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex justify-between items-center w-full group cursor-pointer py-2 border-t border-secondary/10">
                                <span className="font-gotham text-secondary text-[13px] uppercase tracking-wider">Shipping Information</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/50 group-hover:text-secondary transition-colors">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

const rituals = [
    { title: "At Dawn", text: "A single spoon stirred into warm water before the day begins. Ayurveda calls this the first act of care.", img: "/assets/ritual_1.png" },
    { title: "Over Dal", text: "Just before serving. Watch it pool, then disappear into the warmth below.", img: "/assets/ritual_2.png" },
    { title: "On Sourdough", text: "Spread slowly. The salt in the bread, the sweetness in the ghee — nothing else is needed.", img: "/assets/ritual_3.png" },
    { title: "In the Pan", text: "The smoke point is high. The flavour is higher. This is the fat that doesn't apologise for itself.", img: "/assets/ritual_4.png" }
];

const UsageAccordion = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="w-full bg-tertiary overflow-hidden border-t border-secondary/25">
            <div className="max-w-[100rem] mx-auto px-3 lg:px-[40px] py-16 lg:py-32">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="font-rosemode text-secondary text-[26px] lg:text-[34px] leading-none mb-12"
                >
                    A Few Ways to Use It
                </motion.h2>

                {/* Desktop: horizontal accordion */}
                <div
                    className="hidden lg:flex gap-5 w-full"
                    style={{ height: '420px' }}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {rituals.map((ritual, i) => {
                        const isActive = hoveredIndex === i;
                        const hasHover = hoveredIndex !== null;

                        return (
                            <motion.div
                                key={i}
                                onMouseEnter={() => setHoveredIndex(i)}
                                className="relative overflow-hidden cursor-pointer border border-secondary/10"
                                style={{
                                    flex: isActive ? '4 1 0%' : hasHover ? '0.6 1 0%' : '1 1 0%',
                                    transition: 'flex 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                    minWidth: 0,
                                }}
                            >
                                {/* === COLLAPSED STATE (default) === */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        opacity: isActive ? 0 : 1,
                                        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                                        pointerEvents: isActive ? 'none' : 'auto',
                                    }}
                                >
                                    {/* Background image */}
                                    <img
                                        src={ritual.img}
                                        alt={ritual.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ opacity: 0.9 }}
                                    />
                                    {/* Vignette gradient */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                                        }}
                                    />
                                    {/* Title at bottom */}
                                    <div className="absolute inset-0 flex items-end justify-start p-6">
                                        <div className="flex items-end gap-4">
                                            <span className="font-gotham text-tertiary/40 text-[11px] font-medium tracking-[0.2em]">
                                                0{i + 1}
                                            </span>
                                            <h3 className="font-gotham text-tertiary text-[13px] font-medium uppercase tracking-[0.1em] whitespace-nowrap">
                                                {ritual.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* === EXPANDED STATE (two-column: text left, image right) === */}
                                <div
                                    className="absolute inset-0 flex flex-row"
                                    style={{
                                        opacity: isActive ? 1 : 0,
                                        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.08s',
                                        pointerEvents: isActive ? 'auto' : 'none',
                                    }}
                                >
                                    {/* Left column — text with light bg */}
                                    <div
                                        className="relative flex flex-col justify-end p-10 bg-floural-white"
                                        style={{ width: '50%', minWidth: 0 }}
                                    >
                                        {/* Counter — top-left, large with fade */}
                                        <span
                                            className="absolute top-4 left-8 font-gotham text-secondary/[0.07] text-[64px] font-semibold leading-none select-none pointer-events-none"
                                            style={{
                                                opacity: isActive ? 1 : 0,
                                                transform: isActive ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.92)',
                                                transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.08s',
                                                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                                                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                                            }}
                                        >
                                            0{i + 1}
                                        </span>
                                        <h3
                                            className="font-gotham text-secondary text-lg font-medium uppercase tracking-[0.05em] mb-5"
                                            style={{
                                                transform: isActive ? 'translateY(0)' : 'translateY(16px)',
                                                opacity: isActive ? 1 : 0,
                                                transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
                                            }}
                                        >
                                            {ritual.title}
                                        </h3>
                                        <div
                                            className="w-10 h-px bg-secondary/20 mb-5"
                                            style={{
                                                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                                                transformOrigin: 'left',
                                                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.22s',
                                            }}
                                        />
                                        <p
                                            className="font-gotham text-secondary/70 text-[13px] font-normal leading-[180%] max-w-sm"
                                            style={{
                                                transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                                                opacity: isActive ? 1 : 0,
                                                transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
                                            }}
                                        >
                                            {ritual.text}
                                        </p>
                                    </div>

                                    {/* Right column — image with radial gradient fade from center */}
                                    <div
                                        className="relative"
                                        style={{ width: '50%', minWidth: 0 }}
                                    >
                                        <img
                                            src={ritual.img}
                                            alt={ritual.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            style={{
                                                maskImage: 'radial-gradient(ellipse 85% 80% at 60% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 75%, transparent 100%)',
                                                WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 60% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.15) 75%, transparent 100%)',
                                                transform: isActive ? 'scale(1.02)' : 'scale(1.08)',
                                                transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                                            }}
                                        />
                                        {/* Subtle dark wash for depth */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: 'linear-gradient(to right, rgba(30,28,25,0.5) 0%, transparent 40%)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile: stacked cards */}
                <div className="flex flex-col gap-6 lg:hidden">
                    {rituals.map((ritual, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex flex-col items-start gap-5"
                        >
                            <div className="w-full aspect-square bg-secondary/10 overflow-hidden relative">
                                <img src={ritual.img} alt={ritual.title} className="w-full h-full object-cover opacity-90" />
                                {/* Vignette gradient for mobile cards */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.08) 60%, transparent 100%)',
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-gotham text-secondary/40 text-[12px] font-medium tracking-[0.2em]">0{i + 1}</span>
                                <h3 className="font-gotham text-secondary text-base font-medium uppercase tracking-[5%]">{ritual.title}</h3>
                                <p className="font-gotham text-secondary/75 text-xs font-normal leading-[175%]">{ritual.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ReviewSection = ({ isAddedToBasket, setIsAddedToBasket }) => {
    const [showCheck, setShowCheck] = useState(false);
    const reviews = [
        {
            rating: 5,
            date: "a day ago",
            title: "UNLIKE ANY GHEE I'VE TASTED",
            body: "The depth of flavor is incredible. It has this quiet, nutty sweetness that completely transforms my morning dal. You can tell it's made in small batches with real care. A staple in my kitchen now.",
            author: "Karan J",
            memberSince: "2y"
        },
        {
            rating: 5,
            date: "18 days ago",
            title: "PURE GOLD IN A JAR",
            body: "I've tried many artisanal ghees, but this one is on another level. The texture is perfect—grainy just the way it should be—and the aroma when you open the jar is heavenly. Worth every penny.",
            author: "Zoe B",
            memberSince: "3m"
        },
        {
            rating: 5,
            date: "18 days ago",
            title: "THE BILONA DIFFERENCE",
            body: "You can really taste the difference the Bilona method makes. It's lighter, more fragrant, and feels much more 'alive' than store-bought options. I use it for everything from frying to finishing. Exceptional quality.",
            author: "Caleb D",
            memberSince: "4d"
        }
    ];

    return (
        <section className="w-full bg-tertiary border-t border-secondary/20 overflow-hidden">
            <div className="max-w-[100rem] mx-auto">
                {/* Section Header */}
                <div className="w-full py-12 lg:py-20 border-b border-secondary/20 text-center">
                    <h2 className="font-rosemode text-secondary text-[28px] lg:text-[34px] uppercase tracking-[-0.02em]">The Reviews Are In</h2>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch">
                    {/* Left Column: Image */}
                    <div className="w-full lg:w-[45%] aspect-[4/5] lg:aspect-auto border-b lg:border-b-0 lg:border-r border-secondary/20">
                        <img 
                            src="/assets/piller-art.webp" 
                            alt="Reviews illustration" 
                            className="w-full h-full object-cover grayscale-[0.1] opacity-95"
                        />
                    </div>

                    {/* Right Column: Content */}
                    <div className="w-full lg:w-[55%] flex flex-col bg-floural-white/30">
                        {/* Rating Summary */}
                        <div className="p-10 lg:p-16 border-b border-secondary/15">
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-gotham text-[64px] lg:text-[84px] font-light leading-none text-secondary tracking-tighter">5</span>
                                <div className="flex gap-1 text-secondary mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                    ))}
                                </div>
                                <span className="font-gotham text-secondary/40 text-[12px] uppercase tracking-[0.2em] mt-4 font-medium">{reviews.length} reviews</span>
                            </div>
                        </div>

                        {/* Individual Reviews */}
                        <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-hide lg:max-h-none">
                            {reviews.map((review, idx) => (
                                <div key={idx} className="p-10 lg:p-16 border-b border-secondary/10 last:border-b-0">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-1 text-secondary">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                            ))}
                                        </div>
                                        <span className="font-gotham text-secondary/40 text-[11px] uppercase tracking-[0.15em] font-medium">{review.date}</span>
                                    </div>
                                    <h3 className="font-gotham text-secondary text-[14px] lg:text-[15px] font-bold uppercase tracking-[0.08em] mb-4 leading-tight">
                                        {review.title}
                                    </h3>
                                    <p className="font-gotham text-secondary/75 text-[14px] font-normal leading-[185%] mb-8">
                                        {review.body}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className="font-gotham text-secondary text-[12px] font-semibold uppercase tracking-wider">{review.author}</span>
                                        {review.memberSince && (
                                            <div className="flex items-center gap-1.5 text-[#C87541]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                                <span className="text-[10px] font-gotham uppercase tracking-[0.12em] font-bold">Member since {review.memberSince}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Bar: Action */}
                        <div className="p-10 lg:p-12 border-t border-secondary/20 bg-floural-white flex flex-col sm:flex-row items-center justify-between gap-8 mt-auto">
                            <motion.button
                                onClick={() => {
                                    if (!isAddedToBasket) {
                                        setShowCheck(true);
                                        setTimeout(() => {
                                            setShowCheck(false);
                                            setIsAddedToBasket(true);
                                        }, 1100);
                                    }
                                }}
                                layout
                                className={`relative w-full sm:w-auto px-12 py-3 text-[13px] font-medium uppercase tracking-[0.15em] cursor-pointer overflow-hidden border ${isAddedToBasket
                                    ? 'bg-tertiary text-secondary border-secondary/30'
                                    : 'bg-secondary text-tertiary border-secondary'
                                    }`}
                                style={{ transition: 'background-color 800ms cubic-bezier(0.23, 1, 0.32, 1), color 800ms cubic-bezier(0.23, 1, 0.32, 1), border-color 800ms cubic-bezier(0.23, 1, 0.32, 1)' }}
                                whileTap={!isAddedToBasket && !showCheck ? { scale: 0.97 } : {}}
                                transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <AnimatePresence mode="wait">
                                    {showCheck ? (
                                        <motion.span
                                            key="check"
                                            className="flex items-center justify-center gap-2 w-full"
                                            initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <motion.path
                                                    d="M5 13l4 4L19 7"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 }}
                                                />
                                            </svg>
                                            <span>Added</span>
                                        </motion.span>
                                    ) : isAddedToBasket ? (
                                        <motion.span
                                            key="go"
                                            className="flex items-center justify-center gap-2.5 w-full"
                                            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            <span>Go to Basket</span>
                                            <motion.svg
                                                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                initial={{ x: -4, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                                            >
                                                <path d="M5 12h14" />
                                                <path d="M12 5l7 7-7 7" />
                                            </motion.svg>
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="add"
                                            className="flex items-center justify-center w-full"
                                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                                            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                                        >
                                            Add to Basket
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                            <div className="flex items-baseline gap-2">
                                <span className="font-gotham text-secondary/40 text-[12px] uppercase font-medium">Price</span>
                                <span className="font-gotham text-secondary text-[22px] font-light tracking-wide">£35.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

function App() {
    const [isAddedToBasket, setIsAddedToBasket] = useState(false);

    // Global smooth scroll — makes page scrolling feel slow, calm, and deliberate
    useEffect(() => {
        // Prevent browser from restoring old scroll position on reload
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        let target = 0;
        let current = 0;
        let rafId = null;
        const EASE = 0.06; // Lower = slower/smoother glide

        const onWheel = (e) => {
            // Don't interfere while hero animation has body locked
            if (document.body.style.overflow === 'hidden') return;

            e.preventDefault();
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            target = Math.max(0, Math.min(maxScroll, target + e.deltaY));
        };

        const tick = () => {
            if (document.body.style.overflow !== 'hidden') {
                const diff = target - current;
                if (Math.abs(diff) > 0.5) {
                    current += diff * EASE;
                    window.scrollTo(0, current);
                } else if (Math.abs(diff) > 0) {
                    current = target;
                    window.scrollTo(0, current);
                }
            } else {
                // While locked, keep in sync so there's no jump on unlock
                target = window.scrollY;
                current = window.scrollY;
            }
            rafId = requestAnimationFrame(tick);
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        rafId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('wheel', onWheel);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div className="bg-tertiary text-secondary min-h-screen">
            <Header cartHasItems={isAddedToBasket} />
            <main>
                {/* 1. PRODUCT HERO */}
                <ProductHero isAddedToBasket={isAddedToBasket} setIsAddedToBasket={setIsAddedToBasket} />

                {/* 2. THE PROVENANCE JOURNEY */}
                <ProvenanceJourney />

                {/* RITUALS SECTION — Horizontal Accordion */}
                <UsageAccordion />

                {/* 3. REVIEWS & CERTIFICATIONS */}
                <ReviewSection isAddedToBasket={isAddedToBasket} setIsAddedToBasket={setIsAddedToBasket} />

            </main>
            <Footer />
        </div>
    );
}

export default App;
