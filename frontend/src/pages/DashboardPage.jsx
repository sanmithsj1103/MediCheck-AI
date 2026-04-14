import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Stethoscope,
  History,
  UserCircle,
  CalendarCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const quickActions = [
    {
      title: 'New Symptom Check',
      description: 'Start an AI-powered health assessment',
      icon: Stethoscope,
      color: 'from-primary-500 to-primary-600',
      path: '/symptom-input',
      cta: 'Start Now',
    },
    {
      title: 'Find Hospitals',
      description: 'Find clinics & book an appointment directly',
      icon: CalendarCheck,
      color: 'from-emerald-500 to-teal-600',
      path: '/book-appointment/new',
      cta: 'Book Now',
    },
    {
      title: 'Assessment History',
      description: 'View your past health assessments',
      icon: History,
      color: 'from-violet-500 to-purple-600',
      path: '/history',
      cta: 'View History',
    },
    {
      title: 'Medical Profile',
      description: 'Update your health information',
      icon: UserCircle,
      color: 'from-accent-500 to-orange-600',
      path: '/profile',
      cta: 'Update Profile',
    },
  ];

  const stats = [
    { label: 'Assessments', value: '0', icon: Activity, color: 'text-primary-600 bg-primary-50' },
    { label: 'Appointments', value: '0', icon: CalendarCheck, color: 'text-success-600 bg-success-50' },
    { label: 'Avg. Response', value: '<1 min', icon: Clock, color: 'text-accent-600 bg-accent-50' },
    { label: 'Health Score', value: '—', icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="page-title">
          Welcome back, <span className="text-gradient-primary">{firstName}</span> 👋
        </h1>
        <p className="page-subtitle">Here&apos;s an overview of your health dashboard.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div key={i} variants={fadeUp} custom={i + 3}>
                <Link to={action.path} className="block card-interactive p-6 h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{action.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600">
                    {action.cta}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Assessments Placeholder */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Assessments</h2>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No assessments yet</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            Start your first symptom check to see your health assessments here.
          </p>
          <Link to="/symptom-input" className="btn-primary mt-6 inline-flex">
            Start Symptom Check
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardPage;
