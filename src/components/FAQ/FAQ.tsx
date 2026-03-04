import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

const FAQ = () => {
  const faqs = [
    {
      question: "What is the 'Daily Edge' and how does it work?",
      answer:
        "Today's Edge is your daily AI-generated trading recommendation synthesized from 6 live intelligence signals including Smart Money positioning, market regime, and sentiment data. Every morning you receive one clear bias: STRONG BUY, FAVOR SUPPLY, or SIT OUT — so you know exactly what direction to favor.",
    },
    {
      question: "How is the Conviction Multiplier calculated?",
      answer:
        "The Conviction Multiplier (0.5x to 1.5x) is calculated based on how aligned the 6 intelligence signals are. When signals agree strongly, you get higher conviction (1.2x–1.5x). When signals conflict, conviction is reduced (0.5x–0.8x). This helps you size positions according to system confidence.",
    },
    {
      question: "Where does the Smart Money data come from?",
      answer:
        "Smart Money data is derived from the Commitment of Traders (COT) reports published by the CFTC. We parse and visualize institutional positioning — showing you whether hedge funds and commercial traders are net long, short, or neutral — updated weekly.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription anytime from your account settings. Simply navigate to Settings > Billing > Cancel Subscription. Your access will continue until the end of your current billing period, and you won't be charged again.",
    },
    {
      question: "What makes AI Chart Trader 3.0 different from other tools?",
      answer:
        "Unlike chart-upload tools that react to what you give them, AI Chart Trader 3.0 delivers proactive daily intelligence. You wake up to your edge — no uploads required. It combines institutional data (COT), market regime detection, strategic scoring, and AI explanations into one decision-ready dashboard.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-16 md:py-24 px-4 bg-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about AI Chart Trader 3.0
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
                  className="border-b border-gray-200 group"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex w-full items-center justify-between py-4 text-left transition-all hover:text-primary">
                      <motion.span
                        className="font-medium text-gray-900 pr-4 group-hover:text-primary transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        {faq.question}
                      </motion.span>
                      <motion.div
                        className="shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ChevronDown
                          className="h-4 w-4 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180"
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
                      <p className="text-gray-600 leading-relaxed">
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
            className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-gray-700 font-medium">Still have questions?</p>
            <motion.a
              href="#contact"
              className="text-primary font-bold hover:text-purple-600 transition-colors"
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
