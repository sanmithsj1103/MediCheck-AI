"""
MediCheck AI — Expanded symptom-disease knowledge base.
Covers 41 conditions across all major medical categories.
Powers both the rule-based engine AND generates training data for the ML model.
"""

DISEASE_SYMPTOM_MAP = {
    # ── Infectious & Fever ──────────────────────────────────────────
    "Common Cold": {
        "symptoms": ["runny nose", "nasal congestion", "sneezing", "sore throat", "mild cough",
                     "mild fever", "fatigue", "headache", "watery eyes"],
        "urgency": "low", "specialist": "General Physician",
        "recommendations": [
            "Rest and drink plenty of fluids (8+ glasses/day).",
            "Use OTC antihistamines or decongestants if needed.",
            "Steam inhalation helps relieve nasal congestion.",
            "Visit a doctor if symptoms worsen or last beyond 10 days."
        ]
    },
    "Influenza (Flu)": {
        "symptoms": ["high fever", "severe body aches", "chills", "extreme fatigue", "dry cough",
                     "sore throat", "headache", "weakness", "loss of appetite"],
        "urgency": "medium", "specialist": "General Physician",
        "recommendations": [
            "Rest completely — avoid any physical exertion.",
            "Stay well hydrated with water and electrolyte drinks.",
            "Paracetamol (500mg every 6h) for fever — avoid aspirin.",
            "Seek medical care immediately if breathing becomes difficult or fever exceeds 104°F."
        ]
    },
    "COVID-19": {
        "symptoms": ["fever", "dry cough", "loss of smell", "loss of taste", "shortness of breath",
                     "fatigue", "body aches", "headache", "sore throat", "diarrhea", "chest pain"],
        "urgency": "medium", "specialist": "General Physician / Infectious Disease",
        "recommendations": [
            "Isolate yourself immediately to prevent spread to others.",
            "Monitor oxygen saturation — seek ER if SpO2 drops below 94%.",
            "Take a COVID-19 RAT test and report positive results.",
            "Call 108 or go to ER if breathing worsens significantly."
        ]
    },
    "Dengue Fever": {
        "symptoms": ["sudden high fever", "severe headache", "pain behind eyes", "joint pain",
                     "muscle pain", "skin rash", "nausea", "vomiting", "bleeding gums",
                     "easy bruising", "low platelet count"],
        "urgency": "high", "specialist": "General Physician / Infectious Disease",
        "recommendations": [
            "Go to hospital immediately — dengue can be life-threatening.",
            "Do NOT take aspirin or ibuprofen (increases bleeding risk).",
            "Stay hydrated with ORS and coconut water.",
            "Get CBC test to monitor platelet count every 24 hours."
        ]
    },
    "Malaria": {
        "symptoms": ["cyclical fever", "chills", "profuse sweating", "severe headache", "nausea",
                     "vomiting", "muscle pain", "fatigue", "anemia", "enlarged spleen"],
        "urgency": "high", "specialist": "Infectious Disease Specialist",
        "recommendations": [
            "Get a malaria rapid diagnostic test or blood smear at the nearest clinic immediately.",
            "Do NOT self-medicate — drug type depends on the malaria species.",
            "Use mosquito nets and repellent to protect your household.",
            "Complete the full course of antimalarials even if you feel better."
        ]
    },
    "Typhoid Fever": {
        "symptoms": ["sustained high fever", "abdominal pain", "headache", "fatigue",
                     "constipation", "diarrhea", "rose-colored spots", "weakness",
                     "loss of appetite", "slow heart rate"],
        "urgency": "high", "specialist": "General Physician / Gastroenterologist",
        "recommendations": [
            "Get a Widal test or blood culture done today — do not delay.",
            "Antibiotic treatment (usually ciprofloxacin or azithromycin) is mandatory.",
            "Eat only bland, soft, easily digestible food.",
            "Boil or purify all drinking water strictly."
        ]
    },
    "Chikungunya": {
        "symptoms": ["sudden fever", "severe joint pain", "joint swelling", "muscle pain",
                     "headache", "fatigue", "skin rash", "joint stiffness"],
        "urgency": "medium", "specialist": "General Physician",
        "recommendations": [
            "Rest and stay hydrated — no specific antiviral treatment exists.",
            "Take paracetamol for fever and pain; avoid NSAIDs initially.",
            "Joint pain may persist for weeks — physiotherapy can help.",
            "Use mosquito repellent and eliminate standing water near home."
        ]
    },
    "Leptospirosis": {
        "symptoms": ["high fever", "severe headache", "muscle pain", "red eyes",
                     "jaundice", "abdominal pain", "rash", "chills", "vomiting"],
        "urgency": "high", "specialist": "Infectious Disease Specialist",
        "recommendations": [
            "Seek medical care immediately — leptospirosis can cause organ failure.",
            "Antibiotic treatment (doxycycline or penicillin) must be started promptly.",
            "Avoid contact with floodwater or waterlogged areas.",
            "Report any contact with rodents or contaminated water to your doctor."
        ]
    },

    # ── Respiratory ─────────────────────────────────────────────────
    "Pneumonia": {
        "symptoms": ["high fever", "productive cough", "chest pain", "shortness of breath",
                     "rapid breathing", "fatigue", "chills", "bluish lips", "confusion"],
        "urgency": "high", "specialist": "Pulmonologist",
        "recommendations": [
            "Go to a hospital immediately — pneumonia requires prompt antibiotic treatment.",
            "A chest X-ray is needed to confirm the diagnosis.",
            "Monitor oxygen saturation — go to ER if below 94%.",
            "Complete the full antibiotic course even after feeling better."
        ]
    },
    "Tuberculosis (TB)": {
        "symptoms": ["persistent cough", "coughing blood", "night sweats", "weight loss",
                     "fatigue", "fever", "chest pain", "loss of appetite"],
        "urgency": "high", "specialist": "Pulmonologist / Infectious Disease",
        "recommendations": [
            "Get a sputum test and chest X-ray done immediately.",
            "TB is curable — DOTS therapy requires 6 months of consistent medication.",
            "Wear a mask and isolate from others until confirmed non-infectious.",
            "Free treatment available at all government health centers in India."
        ]
    },
    "Asthma": {
        "symptoms": ["wheezing", "shortness of breath", "chest tightness", "cough",
                     "difficulty breathing", "breathlessness at night", "breathlessness with exertion"],
        "urgency": "medium", "specialist": "Pulmonologist",
        "recommendations": [
            "Use your rescue inhaler (salbutamol) immediately.",
            "Sit upright — do not lie down during an attack.",
            "Call 108 if no relief within 15 minutes of inhaler use.",
            "Identify and avoid triggers: dust, smoke, pollen, cold air."
        ]
    },
    "Chronic Obstructive Pulmonary Disease (COPD)": {
        "symptoms": ["chronic cough", "breathlessness", "increased mucus production",
                     "wheezing", "chest tightness", "fatigue", "frequent respiratory infections"],
        "urgency": "medium", "specialist": "Pulmonologist",
        "recommendations": [
            "Stop smoking immediately — it's the most important step.",
            "Use bronchodilators as prescribed without skipping doses.",
            "Practice breathing exercises (pursed-lip breathing, diaphragmatic breathing).",
            "Get flu and pneumonia vaccines annually."
        ]
    },
    "Bronchitis": {
        "symptoms": ["persistent cough", "coughing mucus", "chest discomfort",
                     "mild fever", "fatigue", "shortness of breath", "wheezing"],
        "urgency": "low", "specialist": "General Physician",
        "recommendations": [
            "Rest and stay well hydrated.",
            "Use a humidifier or steam inhaler to loosen mucus.",
            "Avoid smoking and secondhand smoke.",
            "See a doctor if fever is high or symptoms last more than 3 weeks."
        ]
    },

    # ── Cardiovascular ──────────────────────────────────────────────
    "Heart Attack (Myocardial Infarction)": {
        "symptoms": ["crushing chest pain", "chest pain", "chest tightness", "left arm pain",
                     "jaw pain", "shortness of breath", "cold sweats", "sweating", "nausea",
                     "lightheadedness", "pain radiating to back", "palpitations"],
        "urgency": "high", "specialist": "Cardiologist / Emergency",
        "recommendations": [
            "CALL 108 IMMEDIATELY — every minute of delay causes permanent heart damage.",
            "Chew one 325mg aspirin immediately (if not allergic).",
            "Sit or lie down — do not walk or exert yourself.",
            "Do not drive yourself; wait for emergency services."
        ]
    },
    "Hypertension": {
        "symptoms": ["headache", "dizziness", "blurred vision", "chest pain",
                     "shortness of breath", "nosebleed", "palpitations", "ringing in ears"],
        "urgency": "medium", "specialist": "Cardiologist",
        "recommendations": [
            "Check BP immediately — if above 180/120 mmHg, go to ER.",
            "Reduce salt intake to less than 5g per day.",
            "Take prescribed antihypertensive medication without missing doses.",
            "Avoid caffeine, alcohol, and smoking."
        ]
    },
    "Arrhythmia": {
        "symptoms": ["irregular heartbeat", "palpitations", "chest fluttering",
                     "dizziness", "shortness of breath", "fainting", "fatigue"],
        "urgency": "medium", "specialist": "Cardiologist",
        "recommendations": [
            "Avoid caffeine, alcohol, and stimulants.",
            "An ECG is needed to diagnose the type of arrhythmia.",
            "Call 108 immediately if you faint or feel like you will.",
            "Take prescribed antiarrhythmic medication consistently."
        ]
    },
    "Deep Vein Thrombosis (DVT)": {
        "symptoms": ["leg pain", "leg swelling", "leg warmth", "leg redness",
                     "calf tenderness", "visible veins", "leg cramps"],
        "urgency": "high", "specialist": "Vascular Surgeon",
        "recommendations": [
            "Seek medical attention today — DVT can cause a fatal pulmonary embolism.",
            "Do not massage the affected leg — it can dislodge the clot.",
            "A Doppler ultrasound is needed to confirm the clot.",
            "Anticoagulant therapy (blood thinners) will be prescribed."
        ]
    },

    # ── Gastrointestinal ────────────────────────────────────────────
    "Gastroenteritis": {
        "symptoms": ["nausea", "vomiting", "diarrhea", "stomach pain", "stomach cramps",
                     "bloating", "low-grade fever", "fatigue", "loss of appetite"],
        "urgency": "low", "specialist": "General Physician",
        "recommendations": [
            "Rehydrate with ORS solution (1 packet in 1 litre of clean water).",
            "Follow BRAT diet: Bananas, Rice, Applesauce, Toast.",
            "Avoid dairy, fatty foods, and caffeine for 48 hours.",
            "Go to hospital if vomiting/diarrhea lasts beyond 48h or blood appears."
        ]
    },
    "Acid Reflux (GERD)": {
        "symptoms": ["heartburn", "chest burning after eating", "acid regurgitation",
                     "bloating", "nausea", "sour taste in mouth", "difficulty swallowing",
                     "chronic cough", "hoarse voice"],
        "urgency": "low", "specialist": "Gastroenterologist",
        "recommendations": [
            "Avoid spicy, fatty, acidic foods and chocolate.",
            "Eat smaller, more frequent meals — don't lie down for 2+ hours after eating.",
            "Elevate the head of your bed by 6–8 inches.",
            "Proton pump inhibitors (omeprazole) are effective — consult your doctor."
        ]
    },
    "Appendicitis": {
        "symptoms": ["sudden abdominal pain", "pain that moves to lower right abdomen",
                     "nausea", "vomiting", "fever", "loss of appetite",
                     "abdominal rigidity", "pain worsens with movement"],
        "urgency": "high", "specialist": "General Surgeon / Emergency",
        "recommendations": [
            "Go to the emergency room immediately — appendicitis requires urgent surgery.",
            "Do not eat, drink, or take pain medication until evaluated by a doctor.",
            "Do not apply heat to the abdomen.",
            "Time is critical — a ruptured appendix is life-threatening."
        ]
    },
    "Irritable Bowel Syndrome (IBS)": {
        "symptoms": ["abdominal cramping", "bloating", "gas", "diarrhea", "constipation",
                     "alternating bowel habits", "mucus in stool", "abdominal pain relieved by defecation"],
        "urgency": "low", "specialist": "Gastroenterologist",
        "recommendations": [
            "Keep a food diary to identify and avoid trigger foods.",
            "Increase dietary fiber gradually (oats, fruits, vegetables).",
            "Manage stress — IBS symptoms worsen with anxiety.",
            "Antispasmodics (mebeverine) can help with cramping."
        ]
    },
    "Peptic Ulcer": {
        "symptoms": ["burning stomach pain", "stomach pain when hungry", "nausea",
                     "bloating", "heartburn", "dark stools", "vomiting blood",
                     "pain relieved by eating or antacids"],
        "urgency": "medium", "specialist": "Gastroenterologist",
        "recommendations": [
            "Get tested for H. pylori infection — it's the most common cause.",
            "Avoid NSAIDs (ibuprofen, aspirin) — they worsen ulcers.",
            "Stop smoking and limit alcohol consumption.",
            "Take proton pump inhibitors and H. pylori antibiotics as prescribed."
        ]
    },
    "Jaundice": {
        "symptoms": ["yellowing of skin", "yellow eyes", "dark urine", "pale stools",
                     "fatigue", "abdominal pain", "fever", "itching", "nausea"],
        "urgency": "high", "specialist": "Gastroenterologist / Hepatologist",
        "recommendations": [
            "Go to a doctor today — jaundice indicates a serious liver or bile duct problem.",
            "Blood tests (LFT, bilirubin, hepatitis markers) are needed urgently.",
            "Avoid alcohol completely.",
            "Stay hydrated and follow a low-fat diet until diagnosed."
        ]
    },

    # ── Neurological ────────────────────────────────────────────────
    "Migraine": {
        "symptoms": ["throbbing headache", "one-sided headache", "nausea", "vomiting",
                     "light sensitivity", "sound sensitivity", "visual aura",
                     "dizziness", "neck stiffness"],
        "urgency": "medium", "specialist": "Neurologist",
        "recommendations": [
            "Lie down in a dark, quiet room immediately.",
            "Take prescribed triptans or paracetamol at onset of aura.",
            "Apply an ice pack or cold cloth to your forehead.",
            "Stay hydrated and track your triggers (food, stress, sleep changes)."
        ]
    },
    "Stroke": {
        "symptoms": ["sudden facial drooping", "facial drooping", "arm weakness", "speech difficulty",
                     "sudden severe headache", "vision loss", "balance problems",
                     "confusion", "dizziness", "numbness on one side", "face drooping"],
        "urgency": "high", "specialist": "Neurologist / Emergency",
        "recommendations": [
            "CALL 108 IMMEDIATELY — stroke treatment must begin within 4.5 hours.",
            "Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 108.",
            "Do not give food, water, or medication.",
            "Note the exact time symptoms started — critical for treatment decisions."
        ]
    },
    "Meningitis": {
        "symptoms": ["severe headache", "stiff neck", "high fever", "light sensitivity",
                     "nausea", "vomiting", "confusion", "skin rash (purple spots)",
                     "seizures", "altered consciousness"],
        "urgency": "high", "specialist": "Neurologist / Emergency",
        "recommendations": [
            "CALL 108 IMMEDIATELY — bacterial meningitis is fatal within hours if untreated.",
            "Do not wait for all symptoms to appear — act on any 3 of these symptoms.",
            "Intravenous antibiotics must be started within the hour.",
            "A lumbar puncture (spinal tap) will be done to confirm diagnosis."
        ]
    },
    "Epilepsy / Seizure": {
        "symptoms": ["convulsions", "loss of consciousness", "muscle jerking", "staring spells",
                     "temporary confusion", "uncontrolled movements", "loss of bladder control",
                     "sudden fear", "strange sensations"],
        "urgency": "high", "specialist": "Neurologist",
        "recommendations": [
            "Call 108 if the seizure lasts more than 5 minutes or if it's the first time.",
            "Lay the person on their side to prevent choking — do NOT restrain them.",
            "Remove nearby sharp objects; cushion their head.",
            "Do NOT put anything in the mouth."
        ]
    },

    # ── Endocrine & Metabolic ───────────────────────────────────────
    "Type 2 Diabetes": {
        "symptoms": ["excessive thirst", "frequent urination", "fatigue", "blurred vision",
                     "slow wound healing", "unexplained weight loss", "tingling in hands or feet",
                     "recurrent infections", "dark patches on skin"],
        "urgency": "medium", "specialist": "Endocrinologist / Diabetologist",
        "recommendations": [
            "Check blood glucose level immediately.",
            "If glucose > 300 mg/dL or ketones present, go to ER.",
            "Schedule HbA1c, kidney function, and lipid profile tests.",
            "Start a low-glycaemic diet and daily 30-minute walks."
        ]
    },
    "Hypoglycemia": {
        "symptoms": ["shakiness", "sweating", "confusion", "rapid heartbeat",
                     "dizziness", "hunger", "irritability", "pale skin",
                     "weakness", "fainting"],
        "urgency": "medium", "specialist": "Endocrinologist",
        "recommendations": [
            "Consume 15–20g of fast sugar immediately: glucose tablets, juice, or regular cola.",
            "Recheck blood glucose in 15 minutes — repeat if still below 70 mg/dL.",
            "Follow with a protein and complex carb snack (e.g. peanut butter on bread).",
            "Review insulin dosage and meal timing with your diabetologist."
        ]
    },
    "Hypothyroidism": {
        "symptoms": ["fatigue", "weight gain", "cold intolerance", "constipation",
                     "dry skin", "hair loss", "depression", "slow heart rate",
                     "muscle weakness", "puffy face"],
        "urgency": "low", "specialist": "Endocrinologist",
        "recommendations": [
            "TSH blood test is needed to confirm hypothyroidism.",
            "Levothyroxine is the standard treatment — take on empty stomach.",
            "Do not take calcium supplements within 4 hours of thyroid medication.",
            "Regular TSH monitoring every 6–12 months once stable."
        ]
    },
    "Hyperthyroidism": {
        "symptoms": ["weight loss", "rapid heartbeat", "palpitations", "tremors",
                     "excessive sweating", "heat intolerance", "anxiety",
                     "diarrhea", "bulging eyes", "hair thinning"],
        "urgency": "medium", "specialist": "Endocrinologist",
        "recommendations": [
            "TSH, T3, T4 blood tests are needed urgently.",
            "Antithyroid drugs (methimazole or PTU) are the first-line treatment.",
            "Avoid iodine-rich foods (seaweed, iodized salt in excess).",
            "Beta-blockers may be prescribed to control heart rate while awaiting treatment."
        ]
    },

    # ── Musculoskeletal ─────────────────────────────────────────────
    "Rheumatoid Arthritis": {
        "symptoms": ["joint pain", "joint swelling", "morning stiffness", "joint warmth",
                     "fatigue", "fever", "weight loss", "symmetrical joint involvement",
                     "reduced range of motion"],
        "urgency": "medium", "specialist": "Rheumatologist",
        "recommendations": [
            "Get anti-CCP and rheumatoid factor blood tests done.",
            "Disease-modifying antirheumatic drugs (DMARDs) prevent joint destruction.",
            "Gentle physical therapy preserves joint function.",
            "Avoid smoking — it significantly worsens RA."
        ]
    },
    "Osteoarthritis": {
        "symptoms": ["joint pain after activity", "joint stiffness", "loss of flexibility",
                     "grinding sensation in joint", "bone spurs", "joint swelling",
                     "pain worsens with movement"],
        "urgency": "low", "specialist": "Orthopedic Surgeon / Rheumatologist",
        "recommendations": [
            "Weight loss significantly reduces load on weight-bearing joints.",
            "Low-impact exercise (swimming, cycling) maintains joint mobility.",
            "Paracetamol or topical NSAIDs for pain management.",
            "Physiotherapy for muscle strengthening around the joint."
        ]
    },
    "Lower Back Pain": {
        "symptoms": ["lower back pain", "back stiffness", "pain radiating to leg",
                     "numbness in legs", "muscle spasms", "pain worsens on standing",
                     "pain worsens on bending"],
        "urgency": "low", "specialist": "Orthopedic Surgeon / Physiotherapist",
        "recommendations": [
            "Apply ice (first 48h) then heat to the affected area.",
            "Gentle stretching and core strengthening exercises are key.",
            "Avoid prolonged bed rest — light movement helps recovery.",
            "Seek urgent care if you have bowel/bladder changes or leg weakness."
        ]
    },

    # ── Urinary & Kidney ────────────────────────────────────────────
    "Urinary Tract Infection (UTI)": {
        "symptoms": ["burning urination", "frequent urination", "urgent need to urinate",
                     "cloudy urine", "blood in urine", "lower abdominal pain",
                     "lower back pain", "pelvic pain", "foul-smelling urine"],
        "urgency": "medium", "specialist": "Urologist / General Physician",
        "recommendations": [
            "Drink 2–3 litres of water daily to flush out bacteria.",
            "A urine culture test identifies the bacteria and guides antibiotic choice.",
            "Do not delay treatment — UTIs can spread to kidneys.",
            "Complete the full antibiotic course even if symptoms resolve early."
        ]
    },
    "Kidney Stones": {
        "symptoms": ["severe flank pain", "pain radiating to groin", "blood in urine",
                     "painful urination", "nausea", "vomiting", "frequent urination",
                     "cloudy urine", "fever with chills"],
        "urgency": "high", "specialist": "Urologist",
        "recommendations": [
            "Seek medical care today — a CT scan is needed to assess the stone.",
            "Drink 2–3 litres of water to help pass small stones naturally.",
            "Strong painkillers (diclofenac or tramadol) are needed for the pain.",
            "Avoid high-oxalate foods (spinach, nuts, beets) and excess salt."
        ]
    },

    # ── Skin ────────────────────────────────────────────────────────
    "Skin Allergy / Urticaria": {
        "symptoms": ["skin rash", "itching", "hives", "skin redness", "swelling",
                     "raised welts", "burning skin", "skin warmth"],
        "urgency": "low", "specialist": "Dermatologist / Allergist",
        "recommendations": [
            "Take cetirizine (10mg) or loratadine (10mg) antihistamine.",
            "Apply calamine lotion or 1% hydrocortisone cream to affected areas.",
            "Identify and avoid the allergen.",
            "Call 108 immediately if throat swelling or breathing difficulty occurs (anaphylaxis)."
        ]
    },
    "Psoriasis": {
        "symptoms": ["thick silvery scales", "red patches on skin", "dry cracked skin",
                     "itching", "burning sensation", "swollen joints", "nail changes",
                     "scalp scales"],
        "urgency": "low", "specialist": "Dermatologist",
        "recommendations": [
            "Moisturise daily with fragrance-free creams — prevents flares.",
            "Topical corticosteroids and vitamin D analogues are first-line treatment.",
            "Avoid triggers: stress, infections, certain medications.",
            "Severe cases may require biologics — consult a dermatologist."
        ]
    },

    # ── Mental Health ───────────────────────────────────────────────
    "Anxiety / Panic Attack": {
        "symptoms": ["palpitations", "chest tightness", "shortness of breath", "dizziness",
                     "sweating", "trembling", "numbness", "intense fear", "feeling of doom",
                     "dry mouth", "hyperventilation"],
        "urgency": "medium", "specialist": "Psychiatrist / Psychologist",
        "recommendations": [
            "Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.",
            "Ground yourself: name 5 things you see, 4 you can touch, 3 you hear.",
            "If experiencing for the first time, rule out cardiac causes first.",
            "Cognitive Behavioural Therapy (CBT) is highly effective for panic disorder."
        ]
    },
    "Depression": {
        "symptoms": ["persistent low mood", "loss of interest", "fatigue", "sleep disturbance",
                     "appetite changes", "concentration problems", "feelings of worthlessness",
                     "withdrawal from social activities", "hopelessness"],
        "urgency": "medium", "specialist": "Psychiatrist / Psychologist",
        "recommendations": [
            "Please speak to a doctor or mental health professional today.",
            "Depression is a medical condition — it responds well to treatment.",
            "Regular exercise (30 min/day) has clinically significant antidepressant effects.",
            "iCall helpline: 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)"
        ]
    },

    # ── Women's Health ──────────────────────────────────────────────
    "PCOS (Polycystic Ovary Syndrome)": {
        "symptoms": ["irregular periods", "missed periods", "excessive hair growth",
                     "acne", "weight gain", "thinning hair", "skin darkening",
                     "difficulty getting pregnant", "pelvic pain"],
        "urgency": "low", "specialist": "Gynecologist / Endocrinologist",
        "recommendations": [
            "Blood tests (FSH, LH, testosterone, insulin) and pelvic ultrasound needed.",
            "Weight loss of even 5–10% significantly improves PCOS symptoms.",
            "Inositol supplements and low-GI diet help with insulin resistance.",
            "Hormonal contraceptives can regulate cycles — discuss with your gynecologist."
        ]
    },

    # ── Anemia ──────────────────────────────────────────────────────
    "Iron Deficiency Anemia": {
        "symptoms": ["fatigue", "weakness", "pale skin", "shortness of breath",
                     "dizziness", "cold hands and feet", "brittle nails",
                     "headache", "chest pain", "rapid heartbeat"],
        "urgency": "low", "specialist": "General Physician / Hematologist",
        "recommendations": [
            "CBC blood test will confirm anemia and iron studies.",
            "Iron supplements (ferrous sulfate) — take on empty stomach with vitamin C.",
            "Increase dietary iron: red meat, legumes, leafy greens, seeds.",
            "Avoid tea/coffee within 1 hour of iron supplements (blocks absorption)."
        ]
    },
}

# ── Red-flag combinations → always high urgency ────────────────────────────
HIGH_URGENCY_RED_FLAGS = [
    ["chest pain", "shortness of breath"],
    ["chest pain", "sweating"],
    ["chest pain", "left arm pain"],
    ["chest pain", "jaw pain"],
    ["difficulty breathing", "lips blue"],
    ["severe abdominal pain", "fever"],
    ["high fever", "stiff neck"],
    ["sudden severe headache"],
    ["loss of consciousness"],
    ["seizure"],
    ["coughing blood"],
    ["vomiting blood"],
    ["facial drooping", "arm weakness"],
    ["blood in stool", "severe pain"],
    ["sudden vision loss"],
    ["severe chest pain", "back pain"],
    ["high fever", "confusion"],
    ["purple rash", "fever"],
    ["facial drooping", "arm weakness"],
    ["facial drooping", "speech difficulty"],
    ["facial drooping", "weakness"],
]

# ── Symptom aliases → canonical names ──────────────────────────────────────
SYMPTOM_ALIASES = {
    # Fever
    "temperature": "fever", "high temperature": "high fever", "pyrexia": "fever",
    "feeling hot": "fever", "feverish": "fever", "burning up": "fever",
    # Pain  
    "ache": "pain", "aches": "body aches", "pain": "pain",
    "tummy ache": "stomach pain", "belly pain": "stomach pain",
    "tummy pain": "stomach pain", "stomach ache": "stomach pain",
    # Respiratory
    "breathlessness": "shortness of breath", "breathing difficulty": "shortness of breath",
    "cant breathe": "shortness of breath", "hard to breathe": "difficulty breathing",
    "blocked nose": "nasal congestion", "stuffy nose": "nasal congestion",
    "phlegm": "productive cough", "mucus cough": "productive cough",
    # GI
    "throwing up": "vomiting", "puking": "vomiting", "sick to stomach": "nausea",
    "feel like vomiting": "nausea", "loose stools": "diarrhea", "loose motion": "diarrhea",
    "watery stools": "diarrhea", "upset stomach": "stomach pain",
    # General
    "tired": "fatigue", "exhausted": "fatigue", "no energy": "fatigue",
    "weak": "weakness", "feel weak": "weakness",
    "dizzy": "dizziness", "lightheaded": "dizziness", "spinning": "dizziness",
    "itchy": "itching", "itchy skin": "itching",
    "skin rash": "rash", "red skin": "redness",
    # Heart
    "heart racing": "palpitations", "fast heartbeat": "palpitations",
    "heart pounding": "palpitations", "irregular pulse": "irregular heartbeat",
    # Hindi common terms (transliterated)
    "bukhar": "fever", "sar dard": "headache", "khasi": "cough",
    "pet dard": "stomach pain", "ulti": "vomiting", "chakkar": "dizziness",
    "thakaan": "fatigue", "naak behna": "runny nose", "gala dard": "sore throat",
    "sans lena mushkil": "shortness of breath", "seena dard": "chest pain",
    # Cardiac
    "crushing pain": "chest pain", "crushing chest pain": "chest pain", "left arm numb": "left arm pain",
    "arm numb": "left arm pain", "numb arm": "left arm pain",
    "tight chest": "chest tightness", "squeezing chest": "chest pain",
    # Stroke/neuro
    "face drooping": "facial drooping", "face droop": "facial drooping",
    "face is drooping": "facial drooping", "drooping face": "facial drooping",
    "arm is weak": "arm weakness", "arm weak": "arm weakness",
    "slurred speech": "speech difficulty", "cannot speak": "speech difficulty",
    "trouble speaking": "speech difficulty",
    # General
    "feel sick": "nausea", "shaking": "trembling", "belly ache": "stomach pain",
    "cannot breathe": "shortness of breath", "skin yellow": "yellowing of skin",
    "yellow skin": "yellowing of skin", "eyes yellow": "yellow eyes",
    "backache": "lower back pain", "burning pee": "burning urination",
}

# ── Follow-up questions ─────────────────────────────────────────────────────
FOLLOW_UP_QUESTIONS = {
    "fever": [
        "How high is your temperature? (Fahrenheit or Celsius)",
        "How long have you had the fever?",
        "Do you have chills or are you sweating with it?",
    ],
    "headache": [
        "Where exactly is the pain — front, back, temple, or one side?",
        "Is the pain throbbing, sharp, or a dull constant pressure?",
        "Does light, noise, or movement make it worse?",
    ],
    "chest pain": [
        "Is the pain sharp, dull, or a squeezing pressure?",
        "Does it spread to your arm, jaw, neck, or back?",
        "Does it get worse when you breathe in deeply?",
    ],
    "stomach pain": [
        "Where exactly is the pain — upper, lower, left side, or right side?",
        "Is it a constant pain or does it come and go in waves?",
        "Does eating make it better or worse?",
    ],
    "cough": [
        "Is the cough dry, or are you bringing up mucus or phlegm?",
        "If there is phlegm, what colour is it?",
        "How long have you been coughing?",
    ],
    "shortness of breath": [
        "Did this come on suddenly or has it been getting gradually worse?",
        "Does it happen at rest, or only when you're physically active?",
        "Do you have any known heart or lung conditions?",
    ],
    "rash": [
        "Where on your body did the rash first appear?",
        "Is it itchy, painful, or burning?",
        "Did you eat anything new or come into contact with anything unusual recently?",
    ],
    "dizziness": [
        "Does the room seem to spin around you, or do you just feel lightheaded?",
        "Does it happen when you stand up suddenly?",
        "Have you fainted or almost fainted?",
    ],
    "joint pain": [
        "Which joints are affected — knees, hands, hips, ankles?",
        "Are the joints swollen or warm to the touch?",
        "Is the stiffness worst in the morning?",
    ],
    "fatigue": [
        "How long have you been feeling this tired?",
        "Is it affecting your ability to do daily tasks?",
        "Do you also have unexplained weight loss or night sweats?",
    ],
    "nausea": [
        "Have you actually vomited, or just felt like you might?",
        "Is it related to eating — does it happen after meals?",
        "Do you have any abdominal pain alongside the nausea?",
    ],
    "urination": [
        "Is there pain or a burning sensation when you urinate?",
        "Have you noticed any blood or unusual colour in your urine?",
        "How frequently are you going — roughly how many times in 24 hours?",
    ],
    "vision": [
        "Is the blurring in one eye or both?",
        "Did it come on suddenly or gradually?",
        "Do you also have eye pain, redness, or headache?",
    ],
    "swallowing": [
        "Is it painful to swallow, or does food feel stuck?",
        "Is it worse with solid food, liquids, or both?",
        "How long has this been happening?",
    ],
}

