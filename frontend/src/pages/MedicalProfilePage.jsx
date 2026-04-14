import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Activity, AlertCircle, Phone, Save, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function MedicalProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    bloodGroup: "",
    height: "",
    weight: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    familyHistory: "",
    lifestyle: { smoking: "No", alcohol: "No", exercise: "None" },
    emergencyContact: { name: "", phone: "", relation: "" }
  });

  // Fetch initial profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const data = response.data.profile;
        
        // Convert arrays to comma-separated strings for easy editing in basic inputs
        setProfile({
          ...data,
          allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : data.allergies || "",
          chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions.join(', ') : data.chronicConditions || "",
          currentMedications: Array.isArray(data.currentMedications) ? data.currentMedications.join(', ') : data.currentMedications || "",
          familyHistory: Array.isArray(data.familyHistory) ? data.familyHistory.join(', ') : data.familyHistory || "",
          lifestyle: data.lifestyle || { smoking: "No", alcohol: "No", exercise: "None" },
          emergencyContact: data.emergencyContact || { name: "", phone: "", relation: "" }
        });
      } catch (error) {
        toast.error("Failed to load medical profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setProfile(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Parse strings back to arrays
    const parseArray = (str) => str.split(',').map(s => s.trim()).filter(s => s !== "");
    
    const payload = {
      ...profile,
      allergies: parseArray(profile.allergies),
      chronicConditions: parseArray(profile.chronicConditions),
      currentMedications: parseArray(profile.currentMedications),
      familyHistory: parseArray(profile.familyHistory),
    };

    try {
      await api.put('/users/profile', payload);
      toast.success("Medical profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Profile</h1>
          <p className="text-slate-500">Keep your health details up to date for more accurate AI triage.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-medium rounded-full transition-all shadow-sm flex items-center gap-2 self-start"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Vitals Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-900">Physical Vitals</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Blood Group</label>
              <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all">
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Height (cm)</label>
              <input type="number" name="height" value={profile.height} onChange={handleChange} placeholder="175" className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight (kg)</label>
              <input type="number" name="weight" value={profile.weight} onChange={handleChange} placeholder="70" className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-900">Medical History</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Allergies (comma separated)</label>
              <input type="text" name="allergies" value={profile.allergies} onChange={handleChange} placeholder="Peanuts, Penicillin..." className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chronic Conditions</label>
              <input type="text" name="chronicConditions" value={profile.chronicConditions} onChange={handleChange} placeholder="Asthma, Diabetes..." className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Medications</label>
              <input type="text" name="currentMedications" value={profile.currentMedications} onChange={handleChange} placeholder="Lisinopril 10mg, Metformin..." className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Family History</label>
              <input type="text" name="familyHistory" value={profile.familyHistory} onChange={handleChange} placeholder="Heart disease, Hypertension..." className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Lifestyle & Emergency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
               <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><User className="w-5 h-5" /></div>
               <h2 className="text-lg font-bold text-slate-900">Lifestyle</h2>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Smoking Status</label>
                  <select name="smoking" value={profile.lifestyle.smoking} onChange={(e) => handleChange(e, 'lifestyle')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none">
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Regularly">Regularly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Alcohol Consumption</label>
                  <select name="alcohol" value={profile.lifestyle.alcohol} onChange={(e) => handleChange(e, 'lifestyle')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none">
                    <option value="No">No</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Regularly">Regularly</option>
                  </select>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
               <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Phone className="w-5 h-5" /></div>
               <h2 className="text-lg font-bold text-slate-900">Emergency Contact</h2>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Name</label>
                  <input type="text" name="name" value={profile.emergencyContact.name} onChange={(e) => handleChange(e, 'emergencyContact')} placeholder="Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input type="text" name="phone" value={profile.emergencyContact.phone} onChange={(e) => handleChange(e, 'emergencyContact')} placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Relation</label>
                  <input type="text" name="relation" value={profile.emergencyContact.relation} onChange={(e) => handleChange(e, 'emergencyContact')} placeholder="Spouse" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
                </div>
             </div>
          </div>
        </div>

      </form>
    </motion.div>
  );
}
