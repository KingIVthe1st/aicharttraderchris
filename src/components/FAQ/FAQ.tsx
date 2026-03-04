import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

const FAQ = () => {
  const faqs = [
    {
      question: "What is the Soul Blueprint and how is it created?",
      answer:
        "Your Soul Blueprint is a personalized cosmic profile generated from your birth data. It combines insights from four ancient civilizations — Vedic astrology, Chinese zodiac, Western numerology, and the Mayan calendar — into a unified trading identity that reveals your natural strengths, optimal trading hours, and cosmic rhythm.",
    },
    {
      question: "What is the 17-Point NEO Score?",
      answer:
        "The NEO (Numerological-Environmental-Orbital) Score is a proprietary 17-point composite that fuses your personal numerology, current environmental energy (moon phase, solar activity, geomagnetic conditions), and planetary alignment into a single actionable number. Higher scores indicate stronger cosmic alignment for trading.",
    },
    {
      question: "What are Enemy Hours and how do they affect trading?",
      answer:
        "Enemy Hours are time windows when planetary rulers conflict with your Soul Blueprint. Trading during these periods can lead to impulsive decisions and unfavorable outcomes. Our system alerts you before enemy hours begin so you can pause trading or reduce position sizes during cosmically unfavorable windows.",
    },
    {
      question: "Which four civilizations does the cosmic system draw from?",
      answer:
        "The Cosmic Fusion system integrates wisdom from four ancient traditions: Vedic astrology (planetary hours and nakshatras), Chinese zodiac (animal year, element cycles), Western numerology (life path and personal day numbers), and the Mayan calendar (Tzolkin day sign energy). Together they form a multi-dimensional cosmic timing framework.",
    },
    {
      question: "How does the AI chart analysis work with the cosmic overlay?",
      answer:
        "When you upload a trading chart, our AI performs standard technical analysis — identifying patterns, levels, and setups. You can optionally enable the cosmic overlay, which layers planetary hour energy, your NEO Score, and environmental conditions onto the analysis, giving you a fusion of technical and cosmic confluence.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription anytime from your account settings. Simply navigate to Settings > Billing > Cancel Subscription. Your access will continue until the end of your current billing period, and you won't be charged again.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-16 md:py-24 px-4 cosmic-section relative overflow-hidden"
    >
      {/* Star field background */}
      <div className="star-field" />

      {/* Decorative background elements */}
      <motion.div
        className="absolute top-0 right-1/4 w-96 h-96 bg-nebula-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header with scroll reveal */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-white/50">
            Everything you need to know about AI + Cosmic Fusion Trading
          </p>
        </ScrollReveal>

        {/* Accordion with staggered reveal */}
        <ScrollReveal delay={0.2}>
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <Accordion.Item
                  value={`item-${index}`}
                  className="border-b border-white/10 group bg-white/5 backdrop-blur-sm rounded-xl px-4 mb-2"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between py-4 text-left transition-all hover:text-aurora-400">
                      <motion.span
                        className="font-medium text-white pr-4 group-hover:text-aurora-400 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        {faq.question}
                      </motion.span>
                      <motion.div
                        className="shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ChevronDown
                          className="h-4 w-4 text-white/40 transition-transform duration-300 group-data-[state=open]:rotate-180"
                          aria-hidden="true"
                        />
                      </motion.div>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <motion.div
                      className="pb-4 pt-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-white/50 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>
        </ScrollReveal>

        {/* CTA below FAQ */}
        <ScrollReveal delay={0.5} className="mt-12 text-center">
          <motion.div
            className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-white/70 font-medium">Still have questions?</p>
            <motion.a
              href="#contact"
              className="text-aurora-400 font-bold hover:text-nebula-400 transition-colors"
              whileHover={{ x: 4 }}
            >
              Contact our team →
            </motion.a>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQ;
