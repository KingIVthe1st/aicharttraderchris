import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  LineChart,
  Brain,
  TrendingUp,
  Shield,
  BarChart3,
} from "lucide-react";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "../ui/ScrollReveal";

// Partner/technology logos for the marquee (using text representations for now)
const techLogos = [
  { name: "OpenAI", icon: "🤖" },
  { name: "Bloomberg", icon: "📊" },
  { name: "Reuters", icon: "📰" },
  { name: "TradingView", icon: "📈" },
  { name: "CME Group", icon: "🏛️" },
  { name: "NYSE", icon: "🗽" },
  { name: "AWS", icon: "☁️" },
  { name: "Cloudflare", icon: "⚡" },
];

const LogoCarousel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax for background elements
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.5, 1, 1, 0.5],
  );

  const capabilities = [
    {
      icon: Brain,
      title: "GPT-5.1 Powered",
      description:
        "Advanced AI for deep market analysis with institutional-grade insights",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: LineChart,
      title: "Multi-Timeframe",
      description: "Analyze across all major timeframes simultaneously",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get actionable trade setups in seconds, not hours",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative py-20 overflow-hidden bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900"
    >
      {/* Animated background elements with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <motion.div
          className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/50 rounded-full"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      <motion.div
        className="container-custom relative z-10"
        style={{ opacity }}
      >
        {/* Section Header */}
        <ScrollReveal className="text-center mb-12 space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: [
                "0 0 0px rgba(30, 174, 219, 0)",
                "0 0 20px rgba(30, 174, 219, 0.2)",
                "0 0 0px rgba(30, 174, 219, 0)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
              },
            }}
          >
            <motion.div
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-white/90">
              Cutting-Edge Technology
            </span>
          </motion.div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Professional Trading Analysis,{" "}
            <motion.span
              className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Powered by AI
            </motion.span>
          </h2>
        </ScrollReveal>

        {/* Infinite Logo Marquee - Trust Signals */}
        <ScrollReveal delay={0.2} className="mb-16">
          <div className="relative overflow-hidden py-6">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark-900 to-transparent z-10" />

            {/* Marquee container */}
            <motion.div
              className="flex gap-12"
              animate={{
                x: [0, -1200],
              }}
              transition={{
                x: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {/* Double the logos for seamless loop */}
              {[...techLogos, ...techLogos, ...techLogos].map((logo, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl whitespace-nowrap"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="text-2xl">{logo.icon}</span>
                  <span className="text-white/70 font-medium">{logo.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <p className="text-center text-white/40 text-sm mt-4">
            Powered by world-class data providers & infrastructure
          </p>
        </ScrollReveal>

        {/* Capabilities Grid with staggered reveal */}
        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          staggerDelay={0.15}
        >
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <StaggerItem key={index}>
                <motion.div
                  className="group relative h-full"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Card */}
                  <div className="relative h-full flex flex-col items-center justify-center p-8 glass-card hover:bg-white/10 transition-all duration-300 shadow-card-hover">
                    {/* Animated gradient border on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${capability.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`}
                    />

                    {/* Specular highlight */}
                    <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    {/* Icon with enhanced animation */}
                    <motion.div
                      className={`relative w-16 h-16 mb-6 bg-gradient-to-r ${capability.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                      whileHover={{
                        scale: 1.15,
                        rotate: 5,
                      }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                      {/* Glow effect */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${capability.gradient} rounded-2xl blur-lg opacity-50`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-3 text-center">
                      {capability.title}
                    </h3>
                    <p className="text-sm text-white/60 text-center leading-relaxed">
                      {capability.description}
                    </p>

                    {/* Glass sheen on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Bottom stats row */}
        <ScrollReveal delay={0.5} className="mt-16">
          <motion.div
            className="flex flex-wrap justify-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { value: "50K+", label: "Active Traders", icon: TrendingUp },
              { value: "99.9%", label: "Uptime", icon: Shield },
              { value: "2.3M", label: "Analyses Daily", icon: BarChart3 },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors"
                  whileHover={{ rotate: 10 }}
                >
                  <stat.icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <motion.div
                    className="text-2xl font-black text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollReveal>
      </motion.div>
    </section>
  );
};

export default LogoCarousel;
