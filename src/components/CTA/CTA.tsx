import { ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 bg-dark-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-96 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Glassmorphism card */}
          <div className="glass-card p-12 lg:p-16 text-center shadow-card-hover">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-8">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
              Ready to Get <span className="gradient-text">Started?</span>
            </h2>

            {/* Description */}
            <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Join thousands of traders making smarter decisions with AI-powered analysis.
              Start your free trial today—no credit card required.
            </p>

            {/* CTA Button */}
            <button className="btn-primary group inline-flex items-center space-x-2 !text-lg">
              <span>Start Free Analysis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
