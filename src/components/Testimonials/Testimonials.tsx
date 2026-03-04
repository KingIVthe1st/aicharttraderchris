import { motion } from "framer-motion";
import { Quote, Star, CheckCircle } from "lucide-react";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "../ui/ScrollReveal";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "The AI swing trading analysis identified a perfect cup and handle pattern I completely missed. Made a 15% return following its exact entry and exit points.",
      author: "Michael T.",
      username: "@swingtrader",
      avatar: "#6D5BFF",
    },
    {
      quote:
        "The risk management calculations have revolutionized my position sizing. My drawdowns are minimal now while my profits have increased by 28% over the last quarter.",
      author: "Sarah K.",
      username: "@tradingmom",
      avatar: "#2EC5FF",
    },
    {
      quote:
        "As a scalp trader, timing is everything. The AI analysis gives me clear levels for quick 1:2 R:R trades. I've doubled my win rate since subscribing.",
      author: "Jason L.",
      username: "@daytrader99",
      avatar: "#F6C453",
    },
  ];

  return (
    <section
      id="testimonials"
      className="relative py-16 md:py-24 overflow-hidden cosmic-section"
    >
      {/* Star field */}
      <div className="star-field" />

      {/* Cosmic background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(109,91,255,0.06),transparent_70%)]"></div>

      {/* Decorative blur circles with animation */}
      <motion.div
        className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-nebula-500/10 to-aurora-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-aurora-500/10 to-solar-500/10 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <div className="container-custom relative z-10">
        {/* Section Header with scroll reveal */}
        <ScrollReveal className="text-center mb-16 md:mb-20 space-y-6">
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-solar-400 to-solar-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-white/60 uppercase tracking-wide">
              Success Stories
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            What Traders Say
          </h2>

          {/* Rating Display with animation */}
          <motion.div
            className="flex justify-center items-center gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Star className="w-5 h-5 fill-solar-400 text-solar-400" />
                </motion.div>
              ))}
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <span className="text-xl text-white font-bold">4.8/5</span>
            <span className="text-white/50 font-medium">from 289+ reviews</span>
          </motion.div>
        </ScrollReveal>

        {/* Testimonials Grid with staggered reveal */}
        <StaggerContainer
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          staggerDelay={0.15}
        >
          {testimonials.map((testimonial, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 p-6 lg:p-8 rounded-3xl transition-all duration-300"
                whileHover={{
                  y: -12,
                  boxShadow: "0 25px 50px -12px rgba(109, 91, 255, 0.15)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Quote Icon Badge */}
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-nebula-500 to-aurora-500 rounded-2xl flex items-center justify-center shadow-xl mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Quote className="w-6 h-6 text-white" />
                </motion.div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-solar-400 text-solar-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-base md:text-lg text-white/70 font-medium leading-relaxed mb-6 flex-grow">
                  "{testimonial.quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-cosmic-900 shadow-lg"
                    style={{ backgroundColor: testimonial.avatar }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {testimonial.author.charAt(0)}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-base truncate">
                        {testimonial.author}
                      </h4>
                      {/* Verified badge */}
                      <div className="flex items-center gap-1 bg-aurora-500/20 text-aurora-400 px-2 py-1 rounded-full text-xs font-bold">
                        <CheckCircle className="h-3 w-3" />
                        <span>verified</span>
                      </div>
                    </div>
                    <p className="text-white/40 font-medium text-sm truncate">
                      {testimonial.username}
                    </p>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default Testimonials;
