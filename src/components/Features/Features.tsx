import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Target,
  ShieldCheck,
} from "lucide-react";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "../ui/ScrollReveal";

const Features = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  // Global mouse tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const section = sectionRef.current;
    section?.addEventListener("mousemove", handleMouseMove);
    return () => section?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      gradient: "from-purple-500 to-cyan-500",
      glowColor: "rgba(147, 51, 234, 0.3)",
      title: "AI Chart Analysis",
      description:
        "Upload any trading chart and get instant AI-powered technical analysis — pattern recognition, support/resistance levels, and actionable trade setups.",
      image: "/images/ai-generated/ai-brain-sphere.png",
    },
    {
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-500",
      glowColor: "rgba(16, 185, 129, 0.3)",
      title: "Live Cosmic Dashboard",
      description:
        "Real-time planetary hours, Hora Grid, and environmental energy readings — all personalized to your Soul Blueprint and updated throughout the day.",
      image: "/images/ai-generated/dashboard-holographic.png",
    },
    {
      icon: Target,
      gradient: "from-blue-500 to-indigo-500",
      glowColor: "rgba(59, 130, 246, 0.3)",
      title: "Personalized Soul Blueprint",
      description:
        "Your unique cosmic profile spanning Vedic astrology, Chinese zodiac, Western numerology, and Mayan calendar — the foundation of your trading identity.",
      image: "/images/ai-generated/hero-cinematic-bg.png",
    },
    {
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-500",
      glowColor: "rgba(249, 115, 22, 0.3)",
      title: "17-Point NEO Scoring",
      description:
        "A comprehensive Numerological-Environmental-Orbital score combining personal numerology, environmental energy, and planetary alignment into one clear number.",
      image: "/images/ai-generated/hero-candlesticks.png",
    },
    {
      icon: ShieldCheck,
      gradient: "from-pink-500 to-rose-500",
      glowColor: "rgba(236, 72, 153, 0.3)",
      title: "Enemy Hour Alerts",
      description:
        "Get warned before trading during cosmically unfavorable hours. Enemy hour detection keeps you from entering positions when cosmic energy works against you.",
      image: "/images/ai-generated/risk-shield.png",
    },
    {
      icon: ArrowUpRight,
      gradient: "from-violet-500 to-purple-500",
      glowColor: "rgba(139, 92, 246, 0.3)",
      title: "Environmental Energy Awareness",
      description:
        "Moon phase, solar activity, and geomagnetic field data fused into your trading context — because the environment shapes market psychology.",
      image: "/images/ai-generated/dashboard-isometric.png",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-gradient-to-b from-[#050511] via-[#0a0a1a] to-[#050511]"
    >
      {/* Background effects */}
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="container-custom relative z-10">
        {/* Section Header with scroll reveal */}
        <ScrollReveal className="text-center mb-16 space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 animated-border rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white/80">
              Cosmic Fusion Suite
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-[-0.02em]">
            Six pillars. One fusion.
            <span className="block ai-text-shimmer">Cosmic conviction.</span>
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            AI technical analysis fused with 4-civilization cosmic timing.
            Your Soul Blueprint, planetary hours, and environmental energy
            unite into one powerful trading system.
          </p>
        </ScrollReveal>

        {/* Features Grid with staggered reveal */}
        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={index}>
                <FeatureCard
                  feature={feature}
                  Icon={Icon}
                  mousePosition={mousePosition}
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Bottom CTA with reveal */}
        <ScrollReveal delay={0.4} className="text-center mt-16">
          <motion.div
            className="inline-flex items-center gap-6 p-6 glass-premium glass-sheen rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-left">
              <div className="font-bold text-white">
                Ready to fuse AI with cosmic wisdom?
              </div>
              <div className="text-sm text-white/50">
                Create your Soul Blueprint and start trading
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <motion.a
              href="/signup"
              className="btn-primary btn-magnetic"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your Blueprint
            </motion.a>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// Separate component for feature cards with spotlight effect
interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    glowColor: string;
    title: string;
    description: string;
    image: string;
  };
  Icon: React.ComponentType<{ className?: string }>;
  mousePosition: { x: number; y: number };
}

const FeatureCard = ({ feature, Icon, mousePosition }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localMouse, setLocalMouse] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (cardRef.current && isHovered) {
      const rect = cardRef.current.getBoundingClientRect();
      const x =
        ((mousePosition.x -
          (rect.left -
            (cardRef.current.offsetParent as HTMLElement)?.offsetLeft || 0)) /
          rect.width) *
        100;
      const y =
        ((mousePosition.y -
          (rect.top -
            (cardRef.current.offsetParent as HTMLElement)?.offsetTop || 0)) /
          rect.height) *
        100;
      setLocalMouse({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    }
  }, [mousePosition, isHovered]);

  return (
    <motion.div
      ref={cardRef}
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Volumetric glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-2xl -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{ background: feature.glowColor }}
        transition={{ duration: 0.3 }}
      />

      {/* Card with spotlight border effect */}
      <div
        className="relative h-full rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        }}
      >
        {/* Spotlight border effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(400px circle at ${localMouse.x}% ${localMouse.y}%, ${feature.glowColor}, transparent 40%)`,
          }}
        />

        {/* Inner border */}
        <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a1a] overflow-hidden">
          {/* Card content */}
          <div className="h-full p-6 relative">
            {/* Feature Image */}
            <div className="relative h-40 -mx-6 -mt-6 mb-6 overflow-hidden">
              <motion.img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.7 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/60 to-transparent" />

              {/* Icon overlay with enhanced animation */}
              <motion.div
                className={`absolute bottom-4 left-6 w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="w-7 h-7 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-300">
              {feature.title}
            </h3>
            <p className="text-white/50 leading-relaxed text-sm">
              {feature.description}
            </p>

            {/* Learn more link with animation */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              <a
                href="#"
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-purple-400 transition-colors"
              >
                Learn more
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </motion.div>

            {/* Specular highlight - top edge */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Features;
