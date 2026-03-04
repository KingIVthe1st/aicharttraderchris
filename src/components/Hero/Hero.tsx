import { useState, useEffect, useRef } from "react";
import { TrendingUp, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Chart from "../Chart";
import WaitlistModal from "../WaitlistModal";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "../ui/ScrollReveal";
import MagneticButton from "../ui/MagneticButton";
import { SplitText } from "../ui/TextReveal";

const Hero = () => {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  // Parallax effect for background
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityFade = useTransform(scrollY, [0, 400], [1, 0]);

  // Mouse tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-gradient-hero noise-overlay"
      style={
        {
          "--mouse-x": `${mousePosition.x}%`,
          "--mouse-y": `${mousePosition.y}%`,
        } as React.CSSProperties
      }
    >
      {/* CINEMATIC HERO BACKGROUND with Parallax */}
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        <img
          src="/images/ai-generated/hero-cinematic-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050511] via-[#050511]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050511]/80 via-transparent to-[#050511]/40" />
      </motion.div>

      {/* Spotlight cursor effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(30, 174, 219, 0.15), transparent 40%)`,
        }}
      />

      {/* Volumetric glow spheres with enhanced animation */}
      <motion.div
        className="hero-glow-sphere top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="hero-glow-sphere top-3/4 right-1/4 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.8, 0.5, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Floating particles with motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
            }}
            animate={{
              y: [null, "-100vh"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        className="container-custom relative z-10"
        style={{ opacity: opacityFade }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content with staggered reveal */}
          <StaggerContainer className="space-y-8" staggerDelay={0.12}>
            {/* Badge with animated border */}
            <StaggerItem>
              <div className="inline-flex items-center space-x-2 animated-border glass-sheen px-5 py-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-white/90 tracking-wide">
                  AI + Cosmic Fusion Trading
                </span>
              </div>
            </StaggerItem>

            {/* Headline with shimmer effect */}
            <StaggerItem>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-[-0.03em]">
                <span className="block text-white">AI Chart Trader</span>
                <motion.span
                  className="block ai-text-shimmer"
                  initial={{ backgroundPosition: "200% 0" }}
                  animate={{ backgroundPosition: "-200% 0" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  Cosmic Fusion
                </motion.span>
                <span className="block">
                  <SplitText
                    text="AI + Cosmic"
                    wordClassName="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
                    staggerDelay={0.04}
                    startDelay={0.3}
                  />
                </span>
                <span className="block">
                  <SplitText
                    text="Trading Intelligence"
                    wordClassName="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
                    staggerDelay={0.04}
                    startDelay={0.5}
                  />
                </span>
              </h1>
            </StaggerItem>

            {/* Description with blur reveal */}
            <StaggerItem>
              <ScrollReveal blur delay={0.2}>
                <p className="text-lg lg:text-xl text-white/60 max-w-xl leading-relaxed">
                  AI chart analysis meets 4-civilization cosmic timing and your
                  personalized Soul Blueprint — fusing technical precision with
                  ancient wisdom for unparalleled trading confidence.
                </p>
              </ScrollReveal>
            </StaggerItem>

            {/* Stats with enhanced glow */}
            <StaggerItem>
              <div className="flex items-center space-x-8">
                <motion.div
                  className="flex items-center space-x-3 glow-volumetric"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 backdrop-blur-sm">
                    <TrendingUp className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white font-mono-data">
                      17<span className="text-lg ml-1">-Point</span>
                    </div>
                    <div className="text-sm text-white/50 font-medium">
                      Cosmic Score
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 backdrop-blur-sm">
                    <Zap className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white font-mono-data">
                      4<span className="text-lg ml-1">Civilizations</span>
                    </div>
                    <div className="text-sm text-white/50 font-medium">
                      AI Vision Analysis
                    </div>
                  </div>
                </motion.div>
              </div>
            </StaggerItem>

            {/* CTAs with magnetic effect */}
            <StaggerItem>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <MagneticButton
                  as="a"
                  href="/signup"
                  className="btn-primary group relative overflow-hidden inline-flex items-center justify-center"
                  strength={0.2}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Create Your Soul Blueprint
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </MagneticButton>
                <MagneticButton
                  as="a"
                  href="#how-it-works"
                  className="btn-secondary inline-flex items-center justify-center"
                  strength={0.15}
                >
                  How It Works
                </MagneticButton>
              </div>
            </StaggerItem>

            {/* Trust indicators */}
            <StaggerItem>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-[#050511] flex items-center justify-center text-xs font-bold text-white"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      {["M", "S", "J", "A"][i]}
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-white/40">
                  Trusted by{" "}
                  <span className="text-white/60 font-semibold">50,000+</span>{" "}
                  professional traders
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right Column - Premium Dashboard Card with 3D tilt */}
          <ScrollReveal delay={0.3} direction="right" className="relative">
            {/* Volumetric glow behind card */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-pink-500/20 blur-3xl scale-110"
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [1.1, 1.15, 1.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Premium Glass Card with spotlight effect */}
            <motion.div
              className="relative spotlight-border rounded-2xl"
              whileHover={{
                scale: 1.02,
                rotateY: 5,
                rotateX: -5,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="glass-premium glass-sheen p-6 rounded-2xl relative overflow-hidden">
                {/* Holographic dashboard background */}
                <div className="absolute inset-0 opacity-10">
                  <img
                    src="/images/ai-generated/dashboard-holographic.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Specular highlight - top edge glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Live Analysis
                    </h3>
                    <span className="flex items-center space-x-2 px-3 py-1 bg-success/20 rounded-full border border-success/30">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-success">
                        Active
                      </span>
                    </span>
                  </div>

                  <Chart />

                  <div className="mt-6 space-y-3">
                    <motion.div
                      className="flex items-start space-x-3 p-4 bg-success/10 rounded-xl border border-success/20 backdrop-blur-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <TrendingUp className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-white">
                          Bullish Signal Detected
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          Strong upward momentum with 85% confidence
                        </p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {[
                        {
                          label: "Entry",
                          value: "$1,245.30",
                          color: "white/5",
                          textColor: "white",
                        },
                        {
                          label: "Target",
                          value: "+4.2%",
                          color: "success/10",
                          textColor: "success",
                          border: true,
                        },
                        {
                          label: "Stop",
                          value: "-2.0%",
                          color: "red-500/10",
                          textColor: "red-400",
                          border: true,
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          className={`text-center p-3 bg-${item.color} rounded-lg ${item.border ? `border border-${item.textColor}/20` : ""}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                        >
                          <div
                            className={`text-xs text-${item.textColor}/70 mb-1`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-sm font-bold text-${item.textColor} font-mono-data`}
                          >
                            {item.value}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </motion.div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
      />
    </section>
  );
};

export default Hero;
