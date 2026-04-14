import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Activity, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AssessmentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/assessments/user/${user.uid}`);
        setAssessments(response.data.assessments || []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Failed to load your assessment history.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const getUrgencyConfig = (level) => {
    switch(level) {
      case 'high':
        return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'medium':
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <CheckCircle2 className="w-4 h-4" /> };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Assessment History</h1>
          <p className="text-slate-500">Review your past health assessments</p>
        </div>
        
        {/* Search / Filter Placeholder */}
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search symptoms..." 
            className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No History Yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            You haven't completed any assessments yet. Once you do, they will appear here.
          </p>
          <button 
            onClick={() => navigate('/symptom-input')}
            className="px-6 py-2.5 bg-cyan-600 text-white hover:bg-cyan-700 transition-colors rounded-full font-medium flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> Start Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const config = getUrgencyConfig(assessment.urgencyLevel);
            const date = new Date(assessment.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            });
            const topCondition = assessment.predictedConditions?.[0]?.name || "Unknown Condition";
            
            return (
              <div 
                key={assessment.id}
                onClick={() => navigate(`/results/${assessment.id}`)}
                className="bg-white hover:bg-slate-50 transition-colors rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-slate-500">{date}</span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${config.bg} ${config.color} border ${config.border}`}>
                      {config.icon} {assessment.urgencyLevel.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{topCondition}</h3>
                  <p className="text-sm text-slate-600 line-clamp-1">
                    <span className="font-medium text-slate-800">Symptoms:</span> {assessment.symptoms?.join(', ')}
                  </p>
                </div>
                
                <div className="flex items-center text-cyan-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  View Full Report <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
