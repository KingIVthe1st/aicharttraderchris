import { motion } from "framer-motion";
import { Crown, Check, Zap, ArrowRight } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";
import MagneticButton from "../ui/MagneticButton";

const Pricing = () => {
  const features = [
    "Unlimited AI chart analysis",
    "Personalized Soul Blueprint",
    "Live Cosmic Timing Dashboard",
    "17-Point NEO Scoring",
    "Planetary Hour & Hora Grid",
    "Enemy Hour Alerts",
    "Environmental Energy Awareness",
    "Cosmic overlay on chart analysis",
  ];

  return (
    <section id="pricing" className="relative py-32 px-4 overflow-hidden cosmic-section">
      {/* Star field */}
      <div className="star-field" />

      {/* Cosmic background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(109,91,255,0.06),transparent_70%)]"></div>

      {/* Decorative blur circles with animation */}
      <motion.div
        className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-nebula-500/10 to-aurora-500/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-aurora-500/10 to-solar-500/10 blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header with scroll reveal */}
        <ScrollReveal className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-full shadow-lg mb-8"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: [
                "0 0 0px rgba(109, 91, 255, 0)",
                "0 0 30px rgba(109, 91, 255, 0.4)",
                "0 0 0px rgba(109, 91, 255, 0)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <span className="text-sm font-bold text-white uppercase tracking-wide">
              Professional Plan
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Unlock Cosmic Fusion
          </h2>

          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium mb-6">
            AI chart analysis fused with 4-civilization cosmic timing and your
            personalized Soul Blueprint
          </p>
        </ScrollReveal>

        {/* Pricing Card with enhanced animations */}
        <ScrollReveal delay={0.2}>
          <motion.div
            className="max-w-lg mx-auto"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="glass-premium backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-nebula-500/20 relative">
              {/* Animated gradient border glow */}
              <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-nebula-500 via-aurora-500 to-nebula-500 opacity-0 hover:opacity-100 transition-opacity duration-500" />

              {/* Header Banner with shimmer — cosmic gradient */}
              <div className="bg-gradient-to-r from-nebula-500 via-aurora-500 to-nebula-500 text-white px-6 py-4 text-center relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-200%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <div className="flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide relative z-10">
                  <Crown className="w-4 h-4" />
                  <span>PROFESSIONAL ACCESS</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="p-10 text-center relative">
                <div className="mb-8">
                  {/* Price with cosmic shimmer */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-6xl font-black bg-gradient-to-r from-nebula-400 via-aurora-400 to-solar-400 bg-clip-text text-transparent">
                      $97
                    </span>
                    <span className="text-lg text-white/40 font-medium ml-2">
                      /month
                    </span>
                  </motion.div>
                </div>

                {/* Features List with staggered animation */}
                <div className="space-y-4 mb-8 text-left">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 group/feature"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <motion.div
                        className="w-6 h-6 bg-gradient-to-r from-solar-400 to-solar-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        <Check className="h-3 w-3 text-cosmic-950" />
                      </motion.div>
                      <span className="text-white/70 font-medium text-sm group-hover/feature:text-white transition-colors">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button with magnetic effect — cosmic gradient */}
                <MagneticButton
                  as="a"
                  href="/billing"
                  className="group w-full px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-nebula-500 via-aurora-500 to-nebula-500 hover:from-nebula-400 hover:via-aurora-400 hover:to-nebula-400 shadow-xl hover:shadow-2xl rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                  strength={0.15}
                >
                  <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  Get Started Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </MagneticButton>

                {/* Subtext */}
                <p className="mt-4 text-sm text-white/40 font-medium">
                  Cancel anytime - No questions asked
                </p>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>

        {/* Bottom Section with scroll reveal */}
        <ScrollReveal delay={0.4} className="text-center mt-16">
          <motion.div
            className="inline-flex flex-col sm:flex-row items-center gap-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl max-w-2xl mx-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-black text-white mb-2">
                Ready for AI + Cosmic Fusion?
              </h3>
              <p className="text-white/50 font-medium">
                Join traders who fuse AI with ancient cosmic wisdom
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-aurora-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span>Instant Setup</span>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Pricing;
