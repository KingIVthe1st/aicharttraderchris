import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "../ui/ScrollReveal";
import MagneticButton from "../ui/MagneticButton";

const FinalCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect for background
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.5, 1, 1, 0.5],
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Epic AI-Generated Background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        <img
          src="/images/ai-generated/cta-landscape.png"
          alt="Trading Data Landscape"
          className="w-full h-full object-cover scale-110"
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/80 to-[#0a0a1a]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10" />
      </motion.div>

      {/* Animated aurora effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30, 174, 219, 0.15), transparent)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center px-4"
        style={{ opacity }}
      >
        {/* Glowing Badge */}
        <ScrollReveal>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 20px rgba(255,255,255,0.1)",
                "0 0 0px rgba(255,255,255,0)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
              },
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-white/90">
              Join 50,000+ traders worldwide
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready for{" "}
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
              your daily edge?
            </motion.span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2} blur>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Wake up to institutional-grade intelligence. Six signals. One clear
            recommendation. Total conviction.
          </p>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <MagneticButton
              as="a"
              href="/billing"
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl font-bold text-white text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 inline-flex items-center gap-2"
              strength={0.2}
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#how-it-works"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-white text-lg hover:bg-white/20 transition-all duration-300 inline-flex items-center"
              strength={0.15}
            >
              Watch Demo
            </MagneticButton>
          </div>
        </ScrollReveal>

        {/* Trust Indicators with staggered animation */}
        <ScrollReveal delay={0.5}>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/50 text-sm">
            {[
              "Cancel anytime",
              "Instant access",
              "Live daily intelligence",
            ].map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <motion.svg
                  className="w-5 h-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  whileHover={{ scale: 1.2 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </motion.svg>
                {item}
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
