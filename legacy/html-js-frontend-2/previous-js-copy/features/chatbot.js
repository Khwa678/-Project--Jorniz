/* ============================================
   HEALTHY UNIVERSE — RULE-BASED CHATBOT
   js/chatbot.js
   Add: <script src="js/chatbot.js"></script>
   just before </body> in index.html
   ============================================ */

/* ─────────────────────────────────────────────
   FLOW DATA
───────────────────────────────────────────── */
const HU_FLOWS = {
  welcome: {
    message:
      "👋 Hi! I'm your <strong>HU Health Assistant</strong>.\nI can help with symptoms, health tips, medications, and more.\n\nWhat can I help you with today?",
    quickReplies: [
      { label: "🩺 Check Symptoms", next: "symptoms_menu" },
      { label: "❤️ Heart Health", next: "heart_menu" },
      { label: "🧠 Mental Wellness", next: "mental_menu" },
      { label: "🥗 Nutrition & Diet", next: "nutrition_menu" },
      { label: "💊 Medications", next: "meds_menu" },
      { label: "👨‍⚕️ Find a Doctor", next: "find_doctor" },
      { label: "🚨 Emergency", next: "emergency" },
    ],
  },

  /* ─── SYMPTOMS ─── */
  symptoms_menu: {
    message: "Which area are you experiencing symptoms in?",
    quickReplies: [
      { label: "🤕 Head / Neck", next: "symptoms_head" },
      { label: "🫀 Chest", next: "symptoms_chest" },
      { label: "🤢 Stomach / Gut", next: "symptoms_stomach" },
      { label: "🌡️ Fever / Flu", next: "symptoms_fever" },
      { label: "✨ Skin", next: "symptoms_skin" },
      { label: "🦴 Back / Joints", next: "symptoms_back" },
      { label: "← Main Menu", next: "welcome" },
    ],
  },

  symptoms_head: {
    message: "What kind of head or neck symptom are you experiencing?",
    quickReplies: [
      { label: "Headache", next: "symptom_headache" },
      { label: "Dizziness", next: "symptom_dizziness" },
      { label: "Sore Throat", next: "symptom_sorethroat" },
      { label: "Neck Pain", next: "symptom_neckpain" },
      { label: "← Back", next: "symptoms_menu" },
    ],
  },

  symptom_headache: {
    message:
      "💊 <strong>Headache Guidance:</strong>\n\n• Drink plenty of water — dehydration is a common cause\n• Rest in a quiet, dark room\n• Paracetamol (500–1000 mg) if needed\n• Apply a cold or warm compress to forehead/neck\n\n⚠️ <strong>See a doctor if:</strong> headache is sudden and severe, or comes with fever, vision changes, or stiff neck.",
    quickReplies: [
      { label: "Book a Consultation", next: "find_doctor" },
      { label: "Back to Symptoms", next: "symptoms_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_dizziness: {
    message:
      "💊 <strong>Dizziness Guidance:</strong>\n\n• Sit or lie down immediately to avoid falls\n• Stay hydrated and eat something if you haven't\n• Avoid sudden changes in position\n• Rest and monitor your blood pressure if possible\n\n⚠️ <strong>Emergency care if:</strong> dizziness comes with chest pain, difficulty speaking, or loss of consciousness.",
    quickReplies: [
      { label: "Book a Consultation", next: "find_doctor" },
      { label: "Back to Symptoms", next: "symptoms_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_sorethroat: {
    message:
      "💊 <strong>Sore Throat Guidance:</strong>\n\n• Gargle warm salt water (½ tsp in 250 ml)\n• Warm fluids — honey + ginger tea works great\n• Throat lozenges or sprays for pain relief\n• Rest your voice\n\n⚠️ <strong>See a doctor if:</strong> high fever, difficulty swallowing, or symptoms last more than 7 days.",
    quickReplies: [
      { label: "Book a Consultation", next: "find_doctor" },
      { label: "Back to Symptoms", next: "symptoms_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_neckpain: {
    message:
      "💊 <strong>Neck Pain Guidance:</strong>\n\n• Ice first 48 hrs, then switch to heat\n• Gentle neck stretches and rotations\n• Maintain good posture — especially at screens\n• Ibuprofen (with food) for inflammation\n\n⚠️ <strong>See a doctor if:</strong> pain radiates down arms, or you have numbness or tingling in hands.",
    quickReplies: [
      { label: "Book Orthopedic", next: "find_doctor" },
      { label: "Back to Symptoms", next: "symptoms_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptoms_chest: {
    message:
      "⚠️ Chest symptoms can sometimes be serious. What are you experiencing?",
    quickReplies: [
      { label: "Chest Pain / Pressure", next: "symptom_chestpain" },
      { label: "Shortness of Breath", next: "symptom_breathless" },
      { label: "Heart Palpitations", next: "symptom_palpitations" },
      { label: "← Back", next: "symptoms_menu" },
    ],
  },

  symptom_chestpain: {
    message:
      "🚨 <strong>Important — Chest Pain Warning:</strong>\n\n<strong>Call 112 IMMEDIATELY if:</strong>\n• Pain is crushing, squeezing, or pressure-like\n• Pain spreads to jaw, left arm, or back\n• You feel sweaty, nauseous, or short of breath\n\n<strong>If mild and none of the above:</strong>\n• Could be acidity, muscle strain, or anxiety\n• Still — see a doctor promptly for evaluation.\n\nNever ignore chest pain.",
    quickReplies: [
      { label: "🚨 Emergency Info", next: "emergency" },
      { label: "Book Cardiologist", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_breathless: {
    message:
      "🚨 <strong>Shortness of Breath:</strong>\n\n• Sit upright in a chair — don't lie flat\n• Stay calm and breathe slowly and deeply\n• Use any prescribed inhalers if you have them\n\n⚠️ <strong>Call 112 if:</strong> sudden onset, severe difficulty, bluish lips or fingertips, or it comes with chest pain.",
    quickReplies: [
      { label: "🚨 Emergency Info", next: "emergency" },
      { label: "Book Consultation", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_palpitations: {
    message:
      "💊 <strong>Heart Palpitations:</strong>\n\n• Sit down and rest immediately\n• Try slow, deep belly breathing\n• Avoid caffeine, nicotine, and alcohol\n• Stay hydrated\n\n💡 <strong>Common triggers:</strong> stress, caffeine, dehydration, poor sleep\n\n⚠️ <strong>See a doctor if:</strong> frequent, last more than a few minutes, or come with dizziness or chest pain.",
    quickReplies: [
      { label: "Book Cardiologist", next: "find_doctor" },
      { label: "Heart Health Tips", next: "heart_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptoms_stomach: {
    message: "What stomach or digestive symptoms are you experiencing?",
    quickReplies: [
      { label: "Nausea / Vomiting", next: "symptom_nausea" },
      { label: "Stomach Pain", next: "symptom_stomachpain" },
      { label: "Diarrhea", next: "symptom_diarrhea" },
      { label: "Constipation", next: "symptom_constipation" },
      { label: "← Back", next: "symptoms_menu" },
    ],
  },

  symptom_nausea: {
    message:
      "💊 <strong>Nausea / Vomiting:</strong>\n\n• Sip clear fluids — water, ORS, or coconut water\n• Eat small, bland meals (rice, toast, banana)\n• Avoid spicy, fatty, or strong-smelling foods\n• Ginger tea can help settle the stomach\n\n⚠️ <strong>See a doctor if:</strong> vomiting blood, severely dehydrated, or symptoms persist beyond 48 hours.",
    quickReplies: [
      { label: "Book Consultation", next: "find_doctor" },
      { label: "Back to Stomach", next: "symptoms_stomach" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_stomachpain: {
    message:
      "💊 <strong>Abdominal Pain:</strong>\n\n• Rest and avoid heavy meals\n• Warm compress on the abdomen may help\n• Antacids for upper stomach pain (possible acidity)\n• Stay hydrated\n\n⚠️ <strong>Seek emergency care if:</strong> sudden severe pain, fever, or pain in lower right abdomen (possible appendix).",
    quickReplies: [
      { label: "🚨 Emergency Info", next: "emergency" },
      { label: "Book Consultation", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_diarrhea: {
    message:
      "💊 <strong>Diarrhea Guidance:</strong>\n\n• ORS is key — prevents dangerous dehydration\n• BRAT diet: Banana, Rice, Applesauce, Toast\n• Avoid dairy, caffeine, and fatty foods\n• Curd or probiotics help restore gut flora\n\n⚠️ <strong>See a doctor if:</strong> blood in stool, fever above 38.5°C, or symptoms last more than 3 days.",
    quickReplies: [
      { label: "Book Consultation", next: "find_doctor" },
      { label: "Nutrition Tips", next: "nutrition_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_constipation: {
    message:
      "💊 <strong>Constipation Relief:</strong>\n\n• Drink 8–10 glasses of water daily\n• Increase fiber — fruits, vegetables, whole grains\n• Light exercise stimulates digestion\n• Warm water with lemon each morning\n• Prunes, papaya, and figs are natural laxatives\n\n💡 No bowel movement for 3+ days? See a doctor.",
    quickReplies: [
      { label: "Book Consultation", next: "find_doctor" },
      { label: "Nutrition Tips", next: "nutrition_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptoms_fever: {
    message:
      "💊 <strong>Fever / Flu Guidance:</strong>\n\n• Rest as much as possible\n• Stay hydrated — water, soups, and juices\n• Paracetamol (as directed) to reduce fever\n• Light blanket if you're shivering\n• Monitor temperature every few hours\n\n⚠️ <strong>See a doctor if:</strong>\n• Fever above 103°F / 39.4°C\n• Persists more than 3 days\n• Difficulty breathing, rash, or confusion",
    quickReplies: [
      { label: "Book Consultation", next: "find_doctor" },
      { label: "More Symptoms", next: "symptoms_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptoms_skin: {
    message: "What skin concern are you experiencing?",
    quickReplies: [
      { label: "Rash / Itching", next: "symptom_rash" },
      { label: "Acne", next: "symptom_acne" },
      { label: "Dry / Eczema", next: "symptom_dryness" },
      { label: "← Back", next: "symptoms_menu" },
    ],
  },

  symptom_rash: {
    message:
      "💊 <strong>Rash / Itching:</strong>\n\n• Apply a cool damp cloth for immediate relief\n• Calamine lotion or 1% hydrocortisone cream\n• Avoid scratching — it worsens and can infect\n• Oral antihistamines like Cetirizine reduce itching\n\n⚠️ <strong>Emergency care if:</strong> rash spreads rapidly, covers most of the body, or comes with breathing difficulty.",
    quickReplies: [
      { label: "Book Dermatologist", next: "find_doctor" },
      { label: "Back to Skin", next: "symptoms_skin" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_acne: {
    message:
      "💊 <strong>Acne Care Tips:</strong>\n\n• Wash face twice daily with a gentle, non-comedogenic cleanser\n• Use oil-free moisturizer\n• Apply benzoyl peroxide or salicylic acid treatments\n• <strong>Never</strong> squeeze or pop pimples\n• Stay hydrated and reduce sugar intake\n\n💡 Persistent or severe acne? A dermatologist can prescribe effective treatments.",
    quickReplies: [
      { label: "Book Dermatologist", next: "find_doctor" },
      { label: "Back to Skin", next: "symptoms_skin" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptom_dryness: {
    message:
      "💊 <strong>Dry Skin / Eczema:</strong>\n\n• Moisturize immediately after bathing while skin is still damp\n• Use fragrance-free, hypoallergenic moisturizers\n• Avoid hot water — use lukewarm baths/showers\n• Wear soft, breathable cotton fabrics\n• Stay hydrated from the inside\n\n💊 For eczema flare-ups, a dermatologist may prescribe topical steroids.",
    quickReplies: [
      { label: "Book Dermatologist", next: "find_doctor" },
      { label: "Back to Skin", next: "symptoms_skin" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  symptoms_back: {
    message:
      "💊 <strong>Back / Joint Pain:</strong>\n\n• Ice first 48–72 hrs of acute pain, then switch to heat\n• Gentle stretching — light movement beats bed rest\n• Ibuprofen or Naproxen (with food) for inflammation\n• Maintain good posture with lumbar support\n• Sleep on a medium-firm mattress\n\n⚠️ <strong>See a doctor if:</strong> pain radiates down legs, numbness or tingling, or pain follows an injury.",
    quickReplies: [
      { label: "Book Orthopedic", next: "find_doctor" },
      { label: "Back to Symptoms", next: "symptoms_menu" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  /* ─── HEART HEALTH ─── */
  heart_menu: {
    message: "💓 What would you like to know about heart health?",
    quickReplies: [
      { label: "Blood Pressure Guide", next: "heart_bp" },
      { label: "⚠️ Warning Signs", next: "heart_warning" },
      { label: "Heart-Healthy Diet", next: "heart_diet" },
      { label: "Exercise Tips", next: "heart_exercise" },
      { label: "Cholesterol", next: "heart_cholesterol" },
      { label: "← Main Menu", next: "welcome" },
    ],
  },

  heart_bp: {
    message:
      "📊 <strong>Blood Pressure Guide:</strong>\n\n• <strong>Normal:</strong> &lt;120/80 mmHg ✅\n• <strong>Elevated:</strong> 120–129 / &lt;80\n• <strong>High Stage 1:</strong> 130–139 / 80–89\n• <strong>High Stage 2:</strong> ≥140 / ≥90 ⚠️\n\n<strong>Lifestyle tips to lower BP:</strong>\n• Reduce salt (&lt;5g/day)\n• Exercise 30 min/day\n• Maintain healthy weight\n• Limit alcohol\n• Meditate daily to manage stress",
    quickReplies: [
      { label: "Book Cardiologist", next: "find_doctor" },
      { label: "Heart Diet Tips", next: "heart_diet" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  heart_warning: {
    message:
      "🚨 <strong>Heart Attack Warning Signs:</strong>\n\n• Chest pain, pressure, squeezing, or tightness\n• Pain spreading to arm, jaw, neck, or back\n• Shortness of breath\n• Cold sweat, nausea, or lightheadedness\n• Sudden overwhelming fatigue\n\n<strong>Women may also experience:</strong>\n• Unusual fatigue or nausea\n• Neck, jaw, or back pain\n\n⛑️ <strong>Call 112 IMMEDIATELY. Don't drive yourself.</strong>",
    quickReplies: [
      { label: "🚨 Emergency Info", next: "emergency" },
      { label: "Book Cardiologist", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  heart_diet: {
    message:
      "🥗 <strong>Heart-Healthy Diet:</strong>\n\n✅ <strong>Eat more:</strong>\n• Fruits & vegetables (5 servings/day)\n• Whole grains: oats, brown rice, barley\n• Lean proteins: fish, legumes, tofu\n• Healthy fats: olive oil, nuts, avocado\n• Omega-3 fish: salmon, sardines, mackerel\n\n❌ <strong>Limit:</strong>\n• Saturated & trans fats\n• Sodium (processed foods)\n• Added sugars & sugary drinks\n• Fried and ultra-processed foods",
    quickReplies: [
      { label: "More Nutrition Tips", next: "nutrition_menu" },
      { label: "Exercise Tips", next: "heart_exercise" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  heart_exercise: {
    message:
      "🏃 <strong>Exercise for Heart Health:</strong>\n\n🎯 <strong>Target:</strong> 150 min/week of moderate aerobic exercise\n\n<strong>Best exercises:</strong>\n• Brisk walking\n• Swimming\n• Cycling\n• Yoga & stretching\n• Dancing!\n\n💡 <strong>Tips:</strong>\n• Start slow, increase gradually\n• Warm up 5 min, cool down after\n• Listen to your body\n• Consult a doctor first if you have existing conditions",
    quickReplies: [
      { label: "Heart Diet Tips", next: "heart_diet" },
      { label: "Book Cardiologist", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  heart_cholesterol: {
    message:
      "📊 <strong>Cholesterol Guide:</strong>\n\n<strong>Healthy levels:</strong>\n• Total: &lt;200 mg/dL\n• LDL (bad): &lt;100 mg/dL ✅\n• HDL (good): &gt;60 mg/dL ✅\n• Triglycerides: &lt;150 mg/dL\n\n<strong>How to improve:</strong>\n• Increase fiber — oats, beans, fruits\n• Exercise regularly\n• Quit smoking\n• Limit saturated fats\n• Omega-3 fatty acids raise good HDL",
    quickReplies: [
      { label: "Heart Diet Tips", next: "heart_diet" },
      { label: "Book Cardiologist", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  /* ─── MENTAL WELLNESS ─── */
  mental_menu: {
    message: "🧠 Mental health matters. What would you like to explore?",
    quickReplies: [
      { label: "😰 Stress & Anxiety", next: "mental_anxiety" },
      { label: "😔 Depression", next: "mental_depression" },
      { label: "😴 Sleep Issues", next: "mental_sleep" },
      { label: "🧘 Mindfulness", next: "mental_mindfulness" },
      { label: "🆘 Crisis Support", next: "mental_crisis" },
      { label: "← Main Menu", next: "welcome" },
    ],
  },

  mental_anxiety: {
    message:
      "🧘 <strong>Managing Stress & Anxiety:</strong>\n\n🌬️ <strong>Try Box Breathing right now:</strong>\n1. Inhale slowly for 4 counts\n2. Hold for 4 counts\n3. Exhale slowly for 4 counts\n4. Hold for 4 counts\n— Repeat 4 times.\n\n<strong>Daily practices that help:</strong>\n• Exercise reduces cortisol naturally\n• Limit caffeine intake\n• Set realistic expectations and boundaries\n• Talk to someone you trust\n• Journaling helps process anxious thoughts",
    quickReplies: [
      { label: "Mindfulness Tips", next: "mental_mindfulness" },
      { label: "Book Psychiatrist", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  mental_depression: {
    message:
      "💙 <strong>You're not alone. Depression is real and treatable.</strong>\n\n<strong>Self-care steps:</strong>\n• Keep a daily routine — even small tasks help\n• Stay connected with people you care about\n• Physical activity — even a 15-min walk matters\n• Aim for 7–9 hours of sleep\n• Eat regular, nourishing meals\n\n💬 <strong>Professional help is the most effective treatment.</strong> A psychiatrist or therapist can make a profound difference.",
    quickReplies: [
      { label: "Book Psychiatrist", next: "find_doctor" },
      { label: "🆘 Crisis Support", next: "mental_crisis" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  mental_sleep: {
    message:
      "😴 <strong>Sleep Hygiene Tips:</strong>\n\n• Consistent sleep & wake times — even weekends\n• No screens 1 hour before bed\n• Keep bedroom dark, cool (18–22°C), and quiet\n• Avoid caffeine after 2 PM\n• No heavy meals 2–3 hours before bed\n\n🧘 <strong>Wind-down routine:</strong>\n• Read a physical book\n• Light stretching or yoga\n• Warm bath or shower\n• 5-minute breathing meditation\n\n💡 Adults need 7–9 hours nightly.",
    quickReplies: [
      { label: "Mindfulness Tips", next: "mental_mindfulness" },
      { label: "Book Psychiatrist", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  mental_mindfulness: {
    message:
      "🧘 <strong>5-Minute Mindfulness Practice:</strong>\n\n1. Sit comfortably, close your eyes\n2. Focus entirely on your breathing\n3. Notice each inhale and exhale\n4. When thoughts arise — acknowledge, then return to breath\n5. Open eyes slowly after 5 minutes\n\n<strong>Apps to try:</strong> Headspace, Calm, Insight Timer\n\n<strong>Benefits:</strong> Reduces anxiety, improves focus, lowers BP, better sleep\n\n💡 Even 5 minutes daily makes a real difference!",
    quickReplies: [
      { label: "Sleep Tips", next: "mental_sleep" },
      { label: "Anxiety Tips", next: "mental_anxiety" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  mental_crisis: {
    message:
      "💙 <strong>You are not alone. Help is available right now.</strong>\n\n🆘 <strong>India Crisis Helplines:</strong>\n• iCall: <strong>9152987821</strong>\n• Vandrevala Foundation: <strong>1860-2662-345</strong>\n• NIMHANS: <strong>080-46110007</strong>\n• National Health Helpline: <strong>104</strong>\n\n🚨 <strong>If in immediate danger, call 112.</strong>\n\nPlease reach out to a trusted person or mental health professional. Your wellbeing matters most.",
    quickReplies: [
      { label: "Book Psychiatrist", next: "find_doctor" },
      { label: "Anxiety Tips", next: "mental_anxiety" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  /* ─── NUTRITION ─── */
  nutrition_menu: {
    message: "🥗 What nutrition topic can I help you with?",
    quickReplies: [
      { label: "Balanced Diet Basics", next: "nutrition_basics" },
      { label: "Weight Management", next: "nutrition_weight" },
      { label: "Diabetes Diet", next: "nutrition_diabetes" },
      { label: "Immunity Boosters", next: "nutrition_immunity" },
      { label: "Vitamins & Minerals", next: "nutrition_vitamins" },
      { label: "← Main Menu", next: "welcome" },
    ],
  },

  nutrition_basics: {
    message:
      "🍽️ <strong>Balanced Diet Basics:</strong>\n\n<strong>The ideal plate:</strong>\n• 50% — Fruits & Vegetables\n• 25% — Whole Grains\n• 25% — Lean Protein\n+ A small amount of healthy fats\n\n<strong>Daily targets:</strong>\n• Water: 8–10 glasses\n• Fiber: 25–35g\n• Protein: 0.8g per kg body weight\n\n🌿 <strong>Indian superfoods:</strong> Turmeric, Amla, Moringa, Dal, Curd, Ragi, Millets\n\nEat the rainbow — variety is key!",
    quickReplies: [
      { label: "Immunity Boosters", next: "nutrition_immunity" },
      { label: "Vitamins Guide", next: "nutrition_vitamins" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  nutrition_weight: {
    message:
      "📊 <strong>Healthy Weight Management:</strong>\n\n<strong>Your BMI = </strong>Weight(kg) ÷ Height(m)²\n• &lt;18.5: Underweight\n• 18.5–24.9: Normal ✅\n• 25–29.9: Overweight\n• ≥30: Obese\n\n<strong>Sustainable tips:</strong>\n• Aim for 0.5–1 kg/week loss\n• 500 cal/day deficit is safe and sustainable\n• Never skip meals — eat 3–4 balanced meals\n• Avoid crash diets completely\n• Sleep 7–9 hours — it affects hunger hormones!",
    quickReplies: [
      { label: "Book Nutritionist", next: "find_doctor" },
      { label: "Diet Basics", next: "nutrition_basics" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  nutrition_diabetes: {
    message:
      "🩸 <strong>Diabetes-Friendly Diet:</strong>\n\n✅ <strong>Good choices:</strong>\n• Low GI foods: oats, barley, dal, leafy greens\n• Lean proteins: eggs, fish, paneer, chicken\n• Healthy fats: nuts, seeds, olive oil\n• Bitter gourd (karela), fenugreek (methi)\n\n❌ <strong>Limit or avoid:</strong>\n• White rice, maida, refined carbs\n• Sugary drinks, sweets, fruit juices\n• Fried and ultra-processed foods\n\n⏰ Eat every 2–3 hours in small portions to stabilize blood sugar.",
    quickReplies: [
      { label: "Book Nutritionist", next: "find_doctor" },
      { label: "Diet Basics", next: "nutrition_basics" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  nutrition_immunity: {
    message:
      "🛡️ <strong>Immunity-Boosting Foods:</strong>\n\n• <strong>Vitamin C:</strong> Amla, citrus fruits, bell peppers\n• <strong>Zinc:</strong> Nuts, pumpkin seeds, legumes\n• <strong>Vitamin D:</strong> Sunlight 15 min/day, eggs, fatty fish\n• <strong>Probiotics:</strong> Curd, buttermilk, fermented foods\n• <strong>Antioxidants:</strong> Turmeric + black pepper, garlic, ginger\n\n💊 <strong>Daily habits matter most:</strong>\n• 7–9 hours of sleep\n• Regular moderate exercise\n• Manage chronic stress",
    quickReplies: [
      { label: "Vitamins Guide", next: "nutrition_vitamins" },
      { label: "Diet Basics", next: "nutrition_basics" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  nutrition_vitamins: {
    message:
      "🧪 <strong>Common Deficiencies in India:</strong>\n\n• <strong>Vitamin D:</strong> Sunlight 15–20 min/day, eggs, fish, supplements\n• <strong>Vitamin B12:</strong> Eggs, dairy, meat — vegetarians need supplements\n• <strong>Iron:</strong> Spinach, dates, lentils — pair with Vitamin C to absorb\n• <strong>Calcium:</strong> Dairy, ragi, sesame, dark leafy greens\n• <strong>Iodine:</strong> Always use iodized salt, seafood\n\n💡 Get a blood panel done yearly to know your levels!",
    quickReplies: [
      { label: "Book Nutritionist", next: "find_doctor" },
      { label: "Immunity Boosters", next: "nutrition_immunity" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  /* ─── MEDICATIONS ─── */
  meds_menu: {
    message: "💊 What medication information do you need?",
    quickReplies: [
      { label: "Common OTC Meds", next: "meds_otc" },
      { label: "Drug Interactions", next: "meds_interactions" },
      { label: "Side Effects", next: "meds_sideeffects" },
      { label: "Storage Tips", next: "meds_storage" },
      { label: "← Main Menu", next: "welcome" },
    ],
  },

  meds_otc: {
    message:
      "💊 <strong>Common OTC Medications:</strong>\n\n• <strong>Pain/Fever:</strong> Paracetamol 500–1000 mg (max 4g/day)\n• <strong>Inflammation:</strong> Ibuprofen 400 mg (with food)\n• <strong>Allergy/Itch:</strong> Cetirizine 10 mg once daily\n• <strong>Acidity:</strong> Pantoprazole, Omeprazole, or Antacids\n• <strong>Diarrhea:</strong> ORS + Probiotics, Loperamide\n• <strong>Cough:</strong> Honey-ginger tea, OTC syrups\n\n⚠️ Always read labels, follow doses, and check expiry dates.",
    quickReplies: [
      { label: "Drug Interactions", next: "meds_interactions" },
      { label: "Storage Tips", next: "meds_storage" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  meds_interactions: {
    message:
      "⚠️ <strong>Drug Interactions to Know:</strong>\n\n• Blood thinners + Aspirin → bleeding risk\n• Paracetamol + Alcohol → liver damage\n• Ibuprofen + BP medications → reduced effect\n• Antibiotics + Dairy → reduced absorption\n• Statins + Grapefruit juice → toxicity risk\n\n💡 <strong>Always:</strong>\n• Tell your doctor ALL medications you take\n• Include supplements, vitamins, herbal remedies\n• Use one pharmacy when possible\n• Never stop a medication without asking your doctor",
    quickReplies: [
      { label: "Side Effects Info", next: "meds_sideeffects" },
      { label: "Book Consultation", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  meds_sideeffects: {
    message:
      "💊 <strong>Managing Common Side Effects:</strong>\n\n• <strong>Nausea:</strong> Take meds with food or at bedtime\n• <strong>Drowsiness:</strong> Take at night, avoid driving\n• <strong>Photosensitivity:</strong> Wear sunscreen and cover up\n• <strong>Dry mouth:</strong> Sip water often, use sugar-free gum\n• <strong>Constipation:</strong> Increase fiber and water intake\n\n🚨 <strong>Stop medication and see a doctor immediately for:</strong>\n• Severe rash, swelling, or breathing difficulty\n• Any unexpected severe or worsening symptoms",
    quickReplies: [
      { label: "Drug Interactions", next: "meds_interactions" },
      { label: "Book Consultation", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  meds_storage: {
    message:
      "🌡️ <strong>Medication Storage Tips:</strong>\n\n• Store at room temperature (15–25°C) unless label says otherwise\n• Keep away from heat, light, and moisture\n• <strong>Don't</strong> store in bathrooms — humidity degrades medicine\n• Keep in original packaging with labels intact\n• Store out of reach of children and pets\n\n❄️ <strong>Refrigerated meds</strong> (insulin, some eye drops): keep at 2–8°C, never freeze\n\n🗑️ <strong>Dispose of expired meds:</strong> Return to a pharmacy — never flush",
    quickReplies: [
      { label: "Common OTC Meds", next: "meds_otc" },
      { label: "Book Consultation", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  /* ─── FIND DOCTOR ─── */
  find_doctor: {
    message:
      "👨‍⚕️ <strong>Book a Consultation</strong>\n\nOur platform has verified specialists in:\n• Cardiology, Psychiatry, Nutrition\n• Dermatology, Orthopedics, Pediatrics\n• General Physician and more\n\n🪙 Pay with HU Coins or wallet balance\n⭐ Avg. rating: 4.8 &nbsp;&nbsp; ⏱️ Avg. wait: ~8 min\n\nTap below to view available doctors →",
    quickReplies: [
      { label: "🏥 Go to Consultations", next: "navigate_consultations" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },

  navigate_consultations: {
    message: "Taking you to the Consultations page now! 👨‍⚕️",
    quickReplies: [],
    action: "navigate_consultations",
  },

  /* ─── EMERGENCY ─── */
  emergency: {
    message:
      "🚨 <strong>EMERGENCY CONTACTS — INDIA:</strong>\n\n🚑 <strong>Ambulance:</strong> 102\n🚒 <strong>Fire:</strong> 101\n👮 <strong>Police:</strong> 100\n📞 <strong>All emergencies:</strong> 112\n\n💙 <strong>Health Helplines:</strong>\n• COVID / Health: 1075\n• Mental Health (iCall): 9152987821\n• Women Safety: 1091\n\n⚠️ <strong>If someone is unresponsive:</strong>\n1. Call 112 immediately\n2. Start CPR if trained\n3. Don't move if spinal injury possible\n4. Stay on the line with the operator",
    quickReplies: [
      { label: "Book Consultation", next: "find_doctor" },
      { label: "🏠 Main Menu", next: "welcome" },
    ],
  },
};

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
let huChatOpen = false;
let huChatMsgs = null;
let huChatInput = null;
let huChatBadge = null;

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  huChatMsgs = document.getElementById("hu-chat-messages");
  huChatInput = document.getElementById("hu-chat-input");
  huChatBadge = document.getElementById("hu-chat-badge");

  // Enter key to send
  if (huChatInput) {
    huChatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        huSendMsg();
      }
    });
  }

  // Esc to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && huChatOpen) toggleHUChat();
  });

  // Notification badge after 3 s
  setTimeout(() => {
    if (!huChatOpen && huChatBadge) huChatBadge.classList.add("visible");
  }, 3000);
});

/* ─────────────────────────────────────────────
   TOGGLE CHAT OPEN / CLOSED
───────────────────────────────────────────── */
function toggleHUChat() {
  huChatOpen = !huChatOpen;
  const win = document.getElementById("hu-chat-window");
  const btn = document.getElementById("hu-chat-btn");
  win.classList.toggle("open", huChatOpen);
  btn.classList.toggle("active", huChatOpen);

  if (huChatOpen) {
    if (huChatBadge) huChatBadge.classList.remove("visible");
    if (huChatMsgs && huChatMsgs.children.length === 0) {
      setTimeout(() => huRenderFlow("welcome"), 320);
    }
    setTimeout(huScrollBottom, 380);
    setTimeout(() => huChatInput && huChatInput.focus(), 440);
  }
}

/* ─────────────────────────────────────────────
   RENDER A FLOW NODE
───────────────────────────────────────────── */
function huRenderFlow(nodeId) {
  const node = HU_FLOWS[nodeId];
  if (!node) return;

  if (node.action === "navigate_consultations") {
    huAddBotMsg(node.message, []);
    setTimeout(() => {
      const navBtn = document.querySelector(
        '.nav-link[onclick*="consultations"]',
      );
      navigate("consultations", navBtn);
      toggleHUChat();
    }, 900);
    return;
  }

  huAddBotMsg(node.message, node.quickReplies);
}

/* ─────────────────────────────────────────────
   ADD BOT MESSAGE WITH TYPING DELAY
───────────────────────────────────────────── */
function huAddBotMsg(text, quickReplies = []) {
  const typing = huAddTyping();
  const delay = 650 + Math.random() * 450;

  setTimeout(() => {
    typing.remove();

    const msgEl = document.createElement("div");
    msgEl.className = "hu-msg hu-msg-bot";
    msgEl.innerHTML = `
      <div class="hu-msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"/>
          <path d="M9 11V7a3 3 0 0 1 6 0v4"/>
          <circle cx="9"  cy="16" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none"/>
        </svg>
      </div>
      <div class="hu-msg-content">
        <div class="hu-msg-bubble">${huFmt(text)}</div>
      </div>
    `;
    huChatMsgs.appendChild(msgEl);
    requestAnimationFrame(() => msgEl.classList.add("visible"));

    if (quickReplies && quickReplies.length > 0) {
      const qrEl = document.createElement("div");
      qrEl.className = "hu-qr-wrap";
      quickReplies.forEach((qr) => {
        const btn = document.createElement("button");
        btn.className = "hu-qr-btn";
        btn.textContent = qr.label;
        btn.onclick = () => huHandleQR(qr.label, qr.next);
        qrEl.appendChild(btn);
      });
      huChatMsgs.appendChild(qrEl);
      setTimeout(() => qrEl.classList.add("visible"), 80);
    }

    huScrollBottom();
  }, delay);
}

/* ─────────────────────────────────────────────
   ADD USER MESSAGE
───────────────────────────────────────────── */
function huAddUserMsg(text) {
  const msgEl = document.createElement("div");
  msgEl.className = "hu-msg hu-msg-user visible";
  msgEl.innerHTML = `<div class="hu-msg-bubble">${huEsc(text)}</div>`;
  huChatMsgs.appendChild(msgEl);
  huScrollBottom();
}

/* ─────────────────────────────────────────────
   HANDLE QUICK REPLY CLICK
───────────────────────────────────────────── */
function huHandleQR(label, next) {
  // Disable all existing quick-reply groups
  document
    .querySelectorAll(".hu-qr-wrap button")
    .forEach((b) => (b.disabled = true));
  document
    .querySelectorAll(".hu-qr-wrap")
    .forEach((el) => el.classList.add("hu-qr-disabled"));
  huAddUserMsg(label);
  setTimeout(() => huRenderFlow(next), 180);
}

/* ─────────────────────────────────────────────
   HANDLE FREE-TEXT SEND
───────────────────────────────────────────── */
function huSendMsg() {
  if (!huChatInput) return;
  const text = huChatInput.value.trim();
  if (!text) return;
  huChatInput.value = "";
  document
    .querySelectorAll(".hu-qr-wrap button")
    .forEach((b) => (b.disabled = true));
  document
    .querySelectorAll(".hu-qr-wrap")
    .forEach((el) => el.classList.add("hu-qr-disabled"));
  huAddUserMsg(text);

  const lower = text.toLowerCase();
  const kwMap = [
    [["headache", "migraine"], "symptom_headache"],
    [["dizz", "vertigo", "lightheaded"], "symptom_dizziness"],
    [["sore throat", "throat pain"], "symptom_sorethroat"],
    [["neck pain", "stiff neck"], "symptom_neckpain"],
    [
      ["chest pain", "heart attack", "chest tight", "chest pressure"],
      "symptom_chestpain",
    ],
    [
      ["breathless", "short of breath", "can't breathe", "breathing"],
      "symptom_breathless",
    ],
    [
      ["palpitation", "heartbeat", "racing heart", "fast heart"],
      "symptom_palpitations",
    ],
    [["fever", "flu", "cold", "chills", "temperature"], "symptoms_fever"],
    [["nausea", "vomit", "throwing up", "sick to stomach"], "symptom_nausea"],
    [["stomach ache", "belly pain", "abdomen", "tummy"], "symptom_stomachpain"],
    [["diarr", "loose motion", "loose stool"], "symptom_diarrhea"],
    [["constip", "hard stool", "no bowel"], "symptom_constipation"],
    [["rash", "itch", "hives", "urticaria"], "symptom_rash"],
    [["acne", "pimple", "breakout", "blackhead"], "symptom_acne"],
    [["dry skin", "eczema", "dermatitis"], "symptom_dryness"],
    [
      ["back pain", "joint pain", "knee", "shoulder pain", "bone pain"],
      "symptoms_back",
    ],
    [["blood pressure", "bp", "hypertension", "hypotension"], "heart_bp"],
    [["cholesterol", "ldl", "hdl", "triglyceride"], "heart_cholesterol"],
    [["heart warning", "heart attack sign", "cardiac"], "heart_warning"],
    [["heart", "cardio", "cardiovascular"], "heart_menu"],
    [
      ["anxious", "anxiety", "stress", "panic", "worry", "nervous"],
      "mental_anxiety",
    ],
    [
      ["depress", "hopeless", "sad", "low mood", "feel empty"],
      "mental_depression",
    ],
    [["sleep", "insomnia", "can't sleep", "awake at night"], "mental_sleep"],
    [["mindful", "meditat", "calm", "relax"], "mental_mindfulness"],
    [
      ["crisis", "suicide", "suicidal", "self harm", "want to die"],
      "mental_crisis",
    ],
    [
      ["mental health", "psychiatrist", "therapy", "counselling"],
      "mental_menu",
    ],
    [
      ["bmi", "weight loss", "lose weight", "overweight", "obese"],
      "nutrition_weight",
    ],
    [["diabetes", "blood sugar", "diabetic", "insulin"], "nutrition_diabetes"],
    [["immunity", "immune", "boost immune"], "nutrition_immunity"],
    [["vitamin", "mineral", "supplement", "deficiency"], "nutrition_vitamins"],
    [
      ["diet", "nutrition", "eat healthy", "food", "meal plan"],
      "nutrition_basics",
    ],
    [
      ["side effect", "adverse effect", "reaction to medicine"],
      "meds_sideeffects",
    ],
    [
      ["drug interaction", "mixing medicine", "combine tablets"],
      "meds_interactions",
    ],
    [
      ["store medicine", "store tablet", "drug storage", "expiry date"],
      "meds_storage",
    ],
    [
      ["medicine", "medication", "drug", "tablet", "pill", "capsule"],
      "meds_otc",
    ],
    [
      ["book doctor", "see doctor", "find doctor", "consult", "appoint"],
      "find_doctor",
    ],
    [["emergency", "ambulance", "urgent", "112", "call for help"], "emergency"],
    [
      ["hello", "hi", "hey", "start", "help", "menu", "what can you"],
      "welcome",
    ],
  ];

  let matched = null;
  for (const [kws, target] of kwMap) {
    if (kws.some((kw) => lower.includes(kw))) {
      matched = target;
      break;
    }
  }

  if (matched) {
    setTimeout(() => huRenderFlow(matched), 200);
  } else {
    setTimeout(() => {
      huAddBotMsg("I didn't quite catch that. Here's what I can help with:", [
        { label: "🩺 Check Symptoms", next: "symptoms_menu" },
        { label: "❤️ Heart Health", next: "heart_menu" },
        { label: "🧠 Mental Wellness", next: "mental_menu" },
        { label: "🥗 Nutrition", next: "nutrition_menu" },
        { label: "💊 Medications", next: "meds_menu" },
        { label: "👨‍⚕️ Find a Doctor", next: "find_doctor" },
        { label: "🚨 Emergency", next: "emergency" },
      ]);
    }, 200);
  }
}

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */
function huAddTyping() {
  const el = document.createElement("div");
  el.className = "hu-msg hu-msg-bot hu-typing-row visible";
  el.innerHTML = `
    <div class="hu-msg-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"/>
        <path d="M9 11V7a3 3 0 0 1 6 0v4"/>
        <circle cx="9"  cy="16" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </div>
    <div class="hu-msg-content">
      <div class="hu-msg-bubble hu-typing-bubble">
        <span class="hu-dot"></span>
        <span class="hu-dot"></span>
        <span class="hu-dot"></span>
      </div>
    </div>
  `;
  huChatMsgs.appendChild(el);
  huScrollBottom();
  return el;
}

/* ─────────────────────────────────────────────
   CLEAR CHAT (reset to welcome)
───────────────────────────────────────────── */
function huClearChat() {
  if (huChatMsgs) {
    huChatMsgs.innerHTML = "";
    setTimeout(() => huRenderFlow("welcome"), 300);
  }
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function huScrollBottom() {
  requestAnimationFrame(() => {
    if (huChatMsgs) huChatMsgs.scrollTop = huChatMsgs.scrollHeight;
  });
}

function huEsc(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function huFmt(t) {
  return String(t)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}
