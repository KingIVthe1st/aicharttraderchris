import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll progress indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Header background opacity based on scroll
  const headerBg = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["rgba(10, 10, 26, 0.6)", "rgba(10, 10, 26, 0.95)"],
  );

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, #1eaedb 0%, #7c3aed 50%, #ec4899 100%)",
        }}
      />

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{ backgroundColor: headerBg }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo with enhanced animation */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </motion.div>
                <div className="absolute inset-0 blur-lg animate-pulse bg-purple-500/50" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                AI Chart Trader
              </span>
              <motion.span
                className="px-2 py-0.5 text-xs font-black bg-gradient-to-r from-purple-500 to-cyan-400 text-white rounded-md"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(147, 51, 234, 0)",
                    "0 0 20px rgba(147, 51, 234, 0.5)",
                    "0 0 0px rgba(147, 51, 234, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                3.0
              </motion.span>
            </motion.div>

            {/* Desktop Navigation with staggered animation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                  {/* Underline animation */}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <motion.div
              className="hidden lg:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.a
                href="/signin"
                className="text-white/80 hover:text-white transition-colors duration-200 px-6 py-2 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log In
              </motion.a>
              <motion.a
                href="/billing"
                className="btn-primary !px-6 !py-2 text-sm relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Get Started</span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.a>
            </motion.div>

            {/* Mobile Menu Button */}
            <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <Dialog.Trigger asChild>
                <motion.button
                  className="lg:hidden text-white p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-dark-800 p-6 z-50 animate-slide-in-right">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                        <div className="absolute inset-0 blur-lg animate-pulse bg-purple-500/50" />
                      </div>
                      <span className="text-2xl font-bold gradient-text">
                        AI Chart Trader
                      </span>
                      <span className="px-2 py-0.5 text-xs font-black bg-gradient-to-r from-purple-500 to-cyan-400 text-white rounded-md">
                        3.0
                      </span>
                    </div>
                    <Dialog.Close asChild>
                      <button className="text-white/80 hover:text-white p-2">
                        <X className="w-6 h-6" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link, index) => (
                      <motion.a
                        key={link.name}
                        href={link.href}
                        className="text-white/80 hover:text-white transition-colors duration-200 text-lg font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        {link.name}
                      </motion.a>
                    ))}
                    <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                      <a
                        href="/signin"
                        className="text-white/80 hover:text-white transition-colors duration-200 py-3 text-lg font-medium text-left"
                      >
                        Log In
                      </a>
                      <a
                        href="/billing"
                        className="btn-primary w-full !py-3"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </a>
                    </div>
                  </nav>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
