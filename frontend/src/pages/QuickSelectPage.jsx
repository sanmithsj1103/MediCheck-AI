import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, Search, Activity, 
  Wind, Heart, Zap, AlertTriangle, 
  Thermometer, Baby, Brain, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = [
  { id: 'fever', label: 'Fever & Infection', icon: Thermometer, color: 'rose', symptoms: ['Fever', 'High Fever', 'Chills', 'Sweating', 'Rose-colored spots'] },
  { id: 'respiratory', label: 'Respiratory', icon: Wind, color: 'blue', symptoms: ['Cough', 'Dry Cough', 'Productive Cough', 'Shortness of Breath', 'Wheezing', 'Chest Tightness', 'Difficulty Breathing'] },
  { id: 'cardiac', label: 'Heart & Chest', icon: Heart, color: 'red', symptoms: ['Chest Pain', 'Chest Tightness', 'Palpitations', 'Irregular Heartbeat', 'Left Arm Pain', 'Jaw Pain', 'Crushing Chest Pain'] },
  { id: 'pain', label: 'Pain & Body', icon: Activity, color: 'amber', symptoms: ['Headache', 'Severe Headache', 'Muscle Pain', 'Joint Pain', 'Back Pain', 'Body Aches', 'Neck Stiffness'] },
  { id: 'gi', label: 'Stomach & GI', icon: Zap, color: 'emerald', symptoms: ['Stomach Pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Acid Regurgitation', 'Heartburn', 'Dark Stools', 'Vomiting Blood'] },
  { id: 'neuro', label: 'Neurological', icon: Brain, color: 'indigo', symptoms: ['Dizziness', 'Confusion', 'Fainting', 'Loss of Consciousness', 'Seizure', 'Facial Drooping', 'Speech Difficulty', 'Numbness'] },
  { id: 'skin', label: 'Skin & Allergy', icon: ShieldAlert, color: 'cyan', symptoms: ['Rash', 'Itching', 'Hives', 'Skin Redness', 'Yellowing of skin', 'Yellow eyes', 'Bleeding gums'] },
];

export default function QuickSelectPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('fever');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const navigate = useNavigate();

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
      ? prev.filter(s => s !== symptom) 
      : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.post('/symptoms/analyze', {
        symptoms: selectedSymptoms,
        input_method: 'quick-select'
      });
      
      const data = response.data;
      
      // Save this specific assessment locally for a moment so results page can catch it
      // or rely on the assessment_id if the backend generated one.
      // In the new /analyze endpoint we don't save to DB automatically in my last implementation
      // for QuickSelect, we usually go straight to results.
      
      toast.success("Symptoms analyzed successfully!");
      navigate(`/results/new`, { state: { result: data } });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze symptoms.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredSymptoms = searchQuery 
    ? CATEGORIES.flatMap(c => c.symptoms).filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : CATEGORIES.find(c => c.id === activeCategory)?.symptoms || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/symptom-input')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quick Select</h1>
            <p className="text-slate-500">Select symptoms from the categories below</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search symptoms..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
        {/* Sidebar Categories */}
        <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id && !searchQuery
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-white border border-slate-100 text-slate-600 hover:border-cyan-300'
              }`}
            >
              <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'text-slate-400'}`} />
              {cat.label}
              {selectedSymptoms.some(s => cat.symptoms.includes(s)) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Symptom Grid */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            {searchQuery ? `Search results for "${searchQuery}"` : CATEGORIES.find(c => c.id === activeCategory)?.label}
            <span className="text-xs font-normal text-slate-400 ml-2">({filteredSymptoms.length} items)</span>
          </h3>

          <div className="flex-1 overflow-y-auto content-start">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
               {filteredSymptoms.map(symptom => (
                 <button
                   key={symptom}
                   onClick={() => toggleSymptom(symptom)}
                   className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium transition-all ${
                     selectedSymptoms.includes(symptom)
                     ? 'bg-cyan-50 border-cyan-500 text-cyan-700 ring-1 ring-cyan-500'
                     : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-cyan-200'
                   }`}
                 >
                   {symptom}
                   {selectedSymptoms.includes(symptom) && <Check className="w-4 h-4" />}
                 </button>
               ))}
               {filteredSymptoms.length === 0 && (
                 <div className="col-span-full py-12 text-center">
                   <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                   <p className="text-slate-500">No symptoms found matching your search.</p>
                 </div>
               )}
             </div>
          </div>

          {/* Selected Symptoms Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedSymptoms.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No symptoms selected yet.</p>
              ) : (
                selectedSymptoms.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold border border-cyan-200">
                    {s}
                    <button onClick={() => toggleSymptom(s)} className="hover:text-cyan-900 transition-colors">
                      <Zap className="w-3 h-3 fill-current" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 || isAnalyzing}
              className="w-full md:w-auto px-8 py-3.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <Activity className="w-5 h-5 animate-spin" /> : 'Analyze Selected Symptoms'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
