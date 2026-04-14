import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Shield,
  Stethoscope,
  Clock,
  MapPin,
  ArrowRight,
  Heart,
  Brain,
  Zap,
  CheckCircle2,
  Star,
  MessageCircle,
  Mic,
  MousePointerClick,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI evaluates your symptoms and predicts possible conditions with confidence scores.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Urgency Triage',
    description: 'Instant urgency classification — Low, Medium, or High — so you know exactly what to do next.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: MessageCircle,
    title: '3 Input Modes',
    description: 'Text chat, voice conversation, or quick-select — choose whatever feels most natural to you.',
    color: 'from-accent-500 to-orange-600',
  },
  {
    icon: MapPin,
    title: 'Nearby Clinics',
    description: 'Find nearby hospitals and specialists with real-time distance, ratings, and available slots.',
    color: 'from-success-500 to-emerald-600',
  },
  {
    icon: Clock,
    title: 'Instant Booking',
    description: 'Book appointments with just a few taps — select a time, verify with OTP, and you\'re confirmed.',
    color: 'from-warning-500 to-amber-600',
  },
  {
    icon: Heart,
    title: 'Health History',
    description: 'Your complete medical profile and assessment history — all in one secure, private place.',
    color: 'from-danger-500 to-rose-600',
  },
];

const inputModes = [
  {
    icon: MessageCircle,
    title: 'Text Chat',
    description: 'Type your symptoms naturally',
    color: 'bg-primary-500',
  },
  {
    icon: Mic,
    title: 'Voice Chat',
    description: 'Speak in English or Hindi',
    color: 'bg-accent-500',
  },
  {
    icon: MousePointerClick,
    title: 'Quick Select',
    description: 'Tap body parts & symptoms',
    color: 'bg-success-500',
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">MediCheck <span className="text-primary-500">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm !py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm !py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                AI-Powered Health Assessment
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Your health, understood{' '}
              <span className="text-gradient-primary">in minutes</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Tell MediCheck AI your symptoms — through text, voice, or quick-select.
              Get instant condition predictions, urgency triage, and book a doctor right away.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto">
                Start Free Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary btn-lg w-full sm:w-auto">
                I Have an Account
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-500" /> Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary-500" /> Private & secure
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-warning-500" /> Medical-grade AI
              </span>
            </motion.div>
          </div>

          {/* Input Modes Showcase */}
          <motion.div
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={5}
          >
            {inputModes.map((mode, i) => {
              const Icon = mode.icon;
              return (
                <div
                  key={i}
                  className="card-hover p-6 text-center"
                >
                  <div className={`w-12 h-12 rounded-2xl ${mode.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800">{mode.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{mode.description}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need, <span className="text-gradient-primary">one place</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              From symptom check to appointment booking — MediCheck AI handles your entire health journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="card-hover p-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeUp}
                  custom={i}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              How it <span className="text-gradient-primary">works</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Three simple steps to get personalized health guidance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Describe Symptoms',
                desc: 'Use text, voice, or tap to tell us how you feel. Our AI asks smart follow-up questions.',
                color: 'text-primary-500',
                bg: 'bg-primary-50',
              },
              {
                step: '02',
                title: 'Get AI Analysis',
                desc: 'Receive predicted conditions, urgency level, and specialist recommendations instantly.',
                color: 'text-accent-500',
                bg: 'bg-accent-50',
              },
              {
                step: '03',
                title: 'Book a Doctor',
                desc: 'Find nearby clinics, choose a time slot, verify with OTP, and your appointment is set.',
                color: 'text-success-600',
                bg: 'bg-success-50',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-2xl font-extrabold ${item.color}`}>{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to take control of your health?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of users who trust MediCheck AI for quick, reliable health assessments.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 font-bold w-full sm:w-auto"
            >
              Start Free Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-white">MediCheck AI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MediCheck AI. For informational purposes only — not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
