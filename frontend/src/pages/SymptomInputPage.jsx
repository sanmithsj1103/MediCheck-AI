import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Mic, MousePointerClick, ArrowRight, Globe } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const modes = [
  {
    id: 'text',
    title: 'Text Chat',
    description: 'Type your symptoms naturally in a conversational format. The AI will ask follow-up questions to better understand your condition.',
    icon: MessageCircle,
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    features: ['Natural conversation', 'Symptom suggestions', 'Detailed analysis'],
    path: '/symptom-input/text',
  },
  {
    id: 'voice',
    title: 'Voice Chat',
    description: 'Speak your symptoms in English or Hindi. The AI listens, understands, and responds with voice — like talking to a real doctor.',
    icon: Mic,
    color: 'from-accent-500 to-orange-600',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    features: ['English & Hindi', 'Real-time transcription', 'Voice responses'],
    path: '/symptom-input/voice',
    badge: 'Multi-language',
  },
  {
    id: 'quick-select',
    title: 'Quick Select',
    description: 'Tap on body parts and select symptoms from a visual guide. Perfect when you want a fast, guided experience without typing.',
    icon: MousePointerClick,
    color: 'from-success-500 to-emerald-600',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
    features: ['Body part selector', 'Severity rating', 'Fastest method'],
    path: '/symptom-input/quick-select',
  },
];

function SymptomInputPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="page-title">How would you like to describe your symptoms?</h1>
        <p className="page-subtitle">Choose an input method that feels most comfortable for you.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((mode, i) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i + 1}
            >
              <Link
                to={mode.path}
                className={`block card-interactive p-6 h-full relative overflow-hidden border-2 ${mode.borderColor} border-opacity-0 hover:border-opacity-100 transition-all duration-300`}
              >
                {mode.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {mode.badge}
                  </span>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-800">{mode.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{mode.description}</p>

                <ul className="mt-4 space-y-1.5">
                  {mode.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.color}`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-primary-600">
                  Start {mode.title}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default SymptomInputPage;
