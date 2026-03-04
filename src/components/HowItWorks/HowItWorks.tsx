import { motion } from "framer-motion";
import { Sunrise, TrendingUp, Target, Upload } from "lucide-react";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "../ui/ScrollReveal";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Soul Blueprint",
      description:
        "Enter your birth data and get a personalized cosmic profile spanning Vedic astrology, Chinese zodiac, numerology, and Mayan calendar — your unique trading DNA.",
      icon: Sunrise,
      gradient: "from-purple-500 to-cyan-500",
      bgGlow: "bg-purple-500/10",
    },
    {
      number: "02",
      title: "Check Today's Alignment",
      description:
        "See your personalized Hora Grid, NEO Score, and optimal trading windows. Know which hours are cosmically aligned and which are enemy hours to avoid.",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      number: "03",
      title: "Upload Your Chart",
      description:
        "AI analyzes your trading chart with an optional cosmic overlay — fusing technical patterns with planetary hour energy and environmental awareness.",
      icon: Upload,
      gradient: "from-orange-500 to-amber-500",
      bgGlow: "bg-orange-500/10",
    },
    {
      number: "04",
      title: "Trade With Confidence",
      description:
        "Execute trades backed by both technical analysis and cosmic confluence. When AI signals and cosmic timing agree, you trade with maximum conviction.",
      icon: Target,
      gradient: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/10",
    },
  ];

  return (
    <section
      className="py-24 bg-dark-900 relative overflow-hidden"
      id="how-it-works"
    >
      {/* Background decorative elements with animation */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      <div className="container-custom relative z-10">
        {/* Section header with scroll reveal */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Your Cosmic{" "}
            <span className="ai-text-shimmer">Trading Journey</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Four steps to fuse AI precision with ancient cosmic wisdom. From
            Soul Blueprint to confident execution.
          </p>

          {/* AI-Generated Dashboard Visual with parallax */}
          <motion.div
            className="mt-12 mb-8 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="max-w-3xl mx-auto relative">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-600/30 to-pink-500/30 blur-3xl scale-110 opacity-50" />

              <motion.img
                src="/images/ai-generated/dashboard-isometric.png"
                alt="AI Trading Dashboard"
                className="w-full rounded-2xl shadow-2xl shadow-primary/20 relative z-10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent rounded-2xl z-20" />
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Steps grid with staggered reveal */}
        <StaggerContainer
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          staggerDelay={0.15}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={index}>
                <motion.div
                  className="group relative glass-card glass-sheen p-8 hover:shadow-card-hover transition-all duration-700"
                  whileHover={{ y: -16, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Number badge with animation */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-dark-800 to-dark-700 rounded-full flex items-center justify-center border-2 border-white/10"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-2xl font-bold ai-text-shimmer">
                      {step.number}
                    </span>
                  </motion.div>

                  {/* Icon with enhanced animation */}
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Decorative glow on hover */}
                  <motion.div
                    className={`absolute inset-0 ${step.bgGlow} rounded-2xl -z-10 blur-xl`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Specular highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Additional info with animation */}
        <ScrollReveal delay={0.5} className="text-center mt-16">
          <motion.p
            className="text-white/50 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            AI chart analysis + 4-civilization cosmic timing + personalized
            Soul Blueprint
          </motion.p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowItWorks;
