/* ============================================
   HEALTHY UNIVERSE - DATA
   js/data.js
   ============================================ */

const POSTS = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    role: "Cardiologist",
    time: "2h ago",
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop&crop=face",
    title: "5 Science-Backed Ways to Lower Your Blood Pressure Naturally 🫀",
    text: "As a cardiologist, I often get asked about natural ways to manage blood pressure. Here are my top evidence-based recommendations that can make a real difference...",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=500&fit=crop",
    trusted: true,
    likes: 1243,
    comments: 89,
    shares: 156,
    tags: ["#Cardiology", "#Heart Health", "#Prevention"],
    views: "12.5K",
    liked: true,
    saved: false,
    earnings: 3.2,
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Certified Nutritionist",
    time: "4h ago",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    title: "The Perfect Anti-Inflammatory Breakfast Bowl 🥗",
    text: "Start your day right with this nutrient-dense recipe packed with omega-3s, antioxidants, and fiber. Your gut will thank you!",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=900&h=500&fit=crop",
    trusted: true,
    likes: 987,
    comments: 64,
    shares: 203,
    tags: ["#Nutrition", "#AntiInflammatory", "#GutHealth"],
    views: "9.1K",
    liked: false,
    saved: true,
    earnings: 1.8,
  },
  {
    id: 3,
    name: "James Cooper",
    role: "Personal Trainer & Coach",
    time: "6h ago",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    title: "30-Day Mobility Challenge! 🤸",
    text: "Want to improve your flexibility and reduce pain? Join me for this transformative challenge. Daily 10-minute routines that fit into any schedule.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=500&fit=crop",
    trusted: false,
    likes: 856,
    comments: 67,
    shares: 92,
    tags: ["#Fitness", "#Mobility", "#Challenge"],
    views: "9.2K",
    liked: false,
    saved: false,
    earnings: 0.95,
  },
  {
    id: 4,
    name: "Dr. Michael Chen",
    role: "Psychiatrist",
    time: "1d ago",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    title: "Breaking the Stigma: Why Therapy is for Everyone 🧠",
    text: "Mental health care shouldn't be a luxury or something to be ashamed of. In this post I share my journey and why every person deserves support and understanding.",
    image:
      "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=900&h=500&fit=crop",
    trusted: true,
    likes: 3412,
    comments: 245,
    shares: 890,
    tags: ["#MentalHealth", "#Psychiatry", "#Wellness"],
    views: "41K",
    liked: false,
    saved: false,
    earnings: 12.6,
  },
];

const NOTIFICATIONS = [
  {
    id: 1,
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=80&h=80&fit=crop&crop=face",
    name: "Dr. Sarah Mitchell",
    action: "liked your post",
    quote: '"The Perfect Anti-Inflammatory Breakfast Bowl"',
    time: "5m ago",
    iconType: "heart",
    unread: true,
  },
  {
    id: 2,
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop&crop=face",
    name: "James Cooper",
    action: "commented on your post",
    quote: "Great advice! I've been recommending this to my clients.",
    time: "1h ago",
    iconType: "comment",
    unread: true,
  },
  {
    id: 3,
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face",
    name: "Dr. Michael Chen",
    action: "started following you",
    quote: null,
    time: "3h ago",
    iconType: "follow",
    unread: false,
  },
  {
    id: 4,
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face",
    name: "Maria Santos",
    action: "liked your comment",
    quote: '"This is exactly what I needed to hear today!"',
    time: "5h ago",
    iconType: "heart",
    unread: false,
  },
  {
    id: 5,
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    name: "Dr. Emily Watson",
    action: "shared your post",
    quote: '"Understanding Anxiety: A Clinical Perspective"',
    time: "1d ago",
    iconType: "share",
    unread: false,
  },
];

const CREATORS = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Cardiologist",
    followers: "18.4K followers",
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Maria Santos",
    role: "Nutritionist",
    followers: "9.2K followers",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "James Cooper",
    role: "Personal Trainer",
    followers: "5.7K followers",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=100&h=100&fit=crop&crop=face",
    verified: false,
  },
  {
    name: "Dr. Priya Nair",
    role: "Dermatologist",
    followers: "22.1K followers",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Dr. Arjun Patel",
    role: "Orthopedic Surgeon",
    followers: "12.8K followers",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Neha Gupta",
    role: "Yoga & Wellness Coach",
    followers: "3.9K followers",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    verified: false,
  },
];

const SUGGESTED_USERS = [
  {
    name: "Dr. Priya Nair",
    role: "Dermatologist",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "Maria Santos",
    role: "Nutritionist",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face",
    verified: true,
  },
  {
    name: "James Cooper",
    role: "Personal Trainer",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=80&h=80&fit=crop&crop=face",
    verified: false,
  },
];

let DOCTORS = [
  {
    id: "d1",
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiologist",
    hospital: "Apollo Hospital, Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
    reviews: 312,
    experience: 14,
    consultations: 2840,
    status: "online",
    price: 800,
    coins: 1600,
    tags: ["Heart Disease", "Hypertension", "ECG"],
    nextSlot: "Today, 3:00 PM",
  },
  {
    id: "d2",
    name: "Dr. Michael Chen",
    specialty: "Psychiatrist",
    hospital: "NIMHANS, Bangalore",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    reviews: 198,
    experience: 10,
    consultations: 1560,
    status: "busy",
    price: 600,
    coins: 1200,
    tags: ["Anxiety", "Depression", "CBT"],
    nextSlot: "Today, 5:00 PM",
  },
  {
    id: "d3",
    name: "Dr. Priya Nair",
    specialty: "Dermatologist",
    hospital: "Fortis Hospital, Delhi",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
    reviews: 421,
    experience: 12,
    consultations: 3200,
    status: "online",
    price: 700,
    coins: 1400,
    tags: ["Acne", "Skin Allergy", "Hair Loss"],
    nextSlot: "Today, 2:30 PM",
  },
  {
    id: "d4",
    name: "Dr. Arjun Patel",
    specialty: "Orthopedic",
    hospital: "Medanta Hospital, Gurgaon",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.7,
    reviews: 267,
    experience: 16,
    consultations: 2100,
    status: "online",
    price: 900,
    coins: 1800,
    tags: ["Knee Pain", "Spine", "Sports Injury"],
    nextSlot: "Tomorrow, 10:00 AM",
  },
  {
    id: "d5",
    name: "Maria Santos",
    specialty: "Nutritionist",
    hospital: "Online Practice",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    reviews: 184,
    experience: 7,
    consultations: 980,
    status: "online",
    price: 400,
    coins: 800,
    tags: ["Weight Loss", "Gut Health", "Diet Plans"],
    nextSlot: "Today, 1:00 PM",
  },
  {
    id: "d6",
    name: "Dr. Emily Watson",
    specialty: "Pediatrician",
    hospital: "Rainbow Children's Hospital",
    avatar:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.9,
    reviews: 356,
    experience: 11,
    consultations: 2670,
    status: "online",
    price: 650,
    coins: 1300,
    tags: ["Child Health", "Vaccination", "Growth"],
    nextSlot: "Today, 4:30 PM",
  },
  {
    id: "d7",
    name: "Dr. James Okonkwo",
    specialty: "General Physician",
    hospital: "Practo Online Clinic",
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.6,
    reviews: 512,
    experience: 9,
    consultations: 4200,
    status: "online",
    price: 350,
    coins: 700,
    tags: ["Fever", "Cold & Flu", "Diabetes"],
    nextSlot: "Available Now",
  },
  {
    id: "d8",
    name: "Dr. Neha Sharma",
    specialty: "Cardiologist",
    hospital: "Max Hospital, Chennai",
    avatar:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    reviews: 143,
    experience: 8,
    consultations: 890,
    status: "busy",
    price: 750,
    coins: 1500,
    tags: ["Cholesterol", "Heart Failure", "Pacemaker"],
    nextSlot: "Tomorrow, 9:00 AM",
  },
];

/* ============================================
   ✨ JOBS DATA
   ============================================ */

  let JOBS = [
  {
    id: "j1",
    title: "Senior Cardiologist",
    company: "Apollo Hospitals",
    companyLogo:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=80&h=80&fit=crop",
    location: "Mumbai, Maharashtra",
    type: "Full-Time",
    specialty: "Cardiology",
    salary: "₹18L – ₹28L/yr",
    experience: "5+ years",
    posted: "2 days ago",
    deadline: "Dec 30, 2025",
    applicants: 34,
    tags: ["MBBS", "MD Cardiology", "Echo"],
    description:
      "Apollo Hospitals is seeking an experienced Cardiologist to join our cardiac care team. You will perform diagnostic and interventional cardiology procedures, manage complex cardiac cases, and lead a team of junior doctors.",
    featured: true,
    saved: false,
    applied: false,
  },
  {
    id: "j2",
    title: "Psychiatry Resident (PGY-2)",
    company: "NIMHANS",
    companyLogo:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&h=80&fit=crop",
    location: "Bangalore, Karnataka",
    type: "Residency",
    specialty: "Psychiatry",
    salary: "₹75K – ₹90K/mo",
    experience: "1-2 years",
    posted: "1 day ago",
    deadline: "Jan 15, 2026",
    applicants: 89,
    tags: ["MBBS", "MD Psychiatry", "CBT"],
    description:
      "NIMHANS invites applications for PGY-2 Psychiatry Residency positions. Residents will rotate through inpatient, outpatient, and specialty clinics under senior supervision.",
    featured: false,
    saved: true,
    applied: false,
  },
  {
    id: "j3",
    title: "Clinical Nutritionist",
    company: "Max Healthcare",
    companyLogo:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=80&h=80&fit=crop",
    location: "Delhi NCR",
    type: "Full-Time",
    specialty: "Nutrition",
    salary: "₹6L – ₹10L/yr",
    experience: "2-4 years",
    posted: "3 days ago",
    deadline: "Jan 5, 2026",
    applicants: 52,
    tags: ["BSc Nutrition", "Clinical Diet", "Diabetes"],
    description:
      "Max Healthcare is looking for a Clinical Nutritionist to provide evidence-based dietary counselling for patients with chronic conditions including diabetes, obesity and renal disease.",
    featured: false,
    saved: false,
    applied: false,
  },
  {
    id: "j4",
    title: "Dermatology Internship",
    company: "Kaya Skin Clinic",
    companyLogo:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=80&h=80&fit=crop",
    location: "Pune, Maharashtra",
    type: "Internship",
    specialty: "Dermatology",
    salary: "₹15K – ₹25K/mo",
    experience: "Fresher",
    posted: "Today",
    deadline: "Dec 20, 2025",
    applicants: 120,
    tags: ["MBBS Final Year", "Dermatology", "Cosmetic"],
    description:
      "Exciting 6-month internship opportunity at Kaya Skin Clinic. Interns will shadow senior dermatologists, assist in cosmetic procedures, and gain hands-on experience in laser treatments and skin diagnostics.",
    featured: true,
    saved: false,
    applied: false,
  },
  {
    id: "j5",
    title: "Orthopedic Surgeon",
    company: "Fortis Hospitals",
    companyLogo:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=80&h=80&fit=crop",
    location: "Chennai, Tamil Nadu",
    type: "Full-Time",
    specialty: "Orthopedics",
    salary: "₹20L – ₹35L/yr",
    experience: "7+ years",
    posted: "4 days ago",
    deadline: "Jan 20, 2026",
    applicants: 18,
    tags: ["MS Ortho", "Joint Replacement", "Spine Surgery"],
    description:
      "Fortis Hospitals Chennai is seeking a skilled Orthopedic Surgeon specializing in joint replacement and minimally invasive spine surgery. Lead a dynamic team and serve a high patient volume.",
    featured: false,
    saved: false,
    applied: false,
  },
  {
    id: "j6",
    title: "Pediatric Nurse Practitioner",
    company: "Rainbow Children's Hospital",
    companyLogo:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=80&h=80&fit=crop",
    location: "Hyderabad, Telangana",
    type: "Part-Time",
    specialty: "Pediatrics",
    salary: "₹4L – ₹6L/yr",
    experience: "1-3 years",
    posted: "5 days ago",
    deadline: "Dec 25, 2025",
    applicants: 67,
    tags: ["BSc Nursing", "Pediatrics", "NP Certified"],
    description:
      "Rainbow Children's Hospital is hiring part-time Pediatric Nurse Practitioners for weekend and evening shifts. Work closely with pediatricians in outpatient and inpatient settings.",
    featured: false,
    saved: true,
    applied: false,
  },
  {
    id: "j7",
    title: "Medical Content Writer",
    company: "Healthy Universe",
    companyLogo:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80&h=80&fit=crop",
    location: "Remote",
    type: "Part-Time",
    specialty: "General Health",
    salary: "₹3L – ₹5L/yr",
    experience: "Fresher",
    posted: "Today",
    deadline: "Dec 31, 2025",
    applicants: 203,
    tags: ["MBBS", "Writing", "Healthcare"],
    description:
      "Healthy Universe is looking for medically qualified content writers to create evidence-based health articles, social media posts, and educational content for our platform. Work from anywhere.",
    featured: true,
    saved: false,
    applied: false,
  },
  {
    id: "j8",
    title: "General Physician – Teleconsult",
    company: "Practo",
    companyLogo:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=80&h=80&fit=crop",
    location: "Remote",
    type: "Full-Time",
    specialty: "General Physician",
    salary: "₹8L – ₹14L/yr",
    experience: "2+ years",
    posted: "2 days ago",
    deadline: "Jan 10, 2026",
    applicants: 145,
    tags: ["MBBS", "Teleconsultation", "General Medicine"],
    description:
      "Join Practo's growing network of online general physicians. Conduct video and chat consultations from the comfort of your home. Flexible hours, high patient volume, and instant payments.",
    featured: false,
    saved: false,
    applied: false,
  },
];

const MY_APPLICATIONS = [];


/* ============================================
   WALLET & TRANSACTIONS DATA
   ============================================ */
const TRANSACTIONS = [
  {
    id: "t1",
    type: "earning",
    title: "Post Revenue",
    description: "5 Science-Backed Ways to Lower Blood Pressure",
    amount: 3.20,
    currency: "USD",
    date: "2025-01-15",
    time: "2:34 PM",
    status: "completed",
    icon: "📝"
  },
  {
    id: "t2",
    type: "earning",
    title: "Video Views",
    description: "Heart Health Myths Debunked",
    amount: 1.85,
    currency: "USD",
    date: "2025-01-15",
    time: "11:20 AM",
    status: "completed",
    icon: "🎬"
  },
  {
    id: "t3",
    type: "withdrawal",
    title: "Bank Transfer",
    description: "HDFC Bank ****4521",
    amount: -50.00,
    currency: "USD",
    date: "2025-01-14",
    time: "4:15 PM",
    status: "completed",
    icon: "🏦"
  },
  {
    id: "t4",
    type: "coins",
    title: "HU Coins Earned",
    description: "Daily login bonus",
    amount: 50,
    currency: "coins",
    date: "2025-01-14",
    time: "9:00 AM",
    status: "completed",
    icon: "🪙"
  },
  {
    id: "t5",
    type: "spending",
    title: "Consultation Payment",
    description: "Dr. Sarah Mitchell - Cardiology",
    amount: -800,
    currency: "coins",
    date: "2025-01-13",
    time: "3:45 PM",
    status: "completed",
    icon: "👩‍⚕️"
  },
  {
    id: "t6",
    type: "earning",
    title: "Referral Bonus",
    description: "Dr. Priya Nair joined via your link",
    amount: 5.00,
    currency: "USD",
    date: "2025-01-13",
    time: "10:30 AM",
    status: "completed",
    icon: "🎁"
  },
  {
    id: "t7",
    type: "earning",
    title: "Post Revenue",
    description: "Mental Health: Breaking the Stigma",
    amount: 12.60,
    currency: "USD",
    date: "2025-01-12",
    time: "6:20 PM",
    status: "completed",
    icon: "📝"
  },
  {
    id: "t8",
    type: "coins",
    title: "HU Coins Earned",
    description: "Completed health quiz",
    amount: 100,
    currency: "coins",
    date: "2025-01-12",
    time: "2:00 PM",
    status: "completed",
    icon: "🎯"
  },
  {
    id: "t9",
    type: "withdrawal",
    title: "UPI Transfer",
    description: "michael@upi",
    amount: -25.00,
    currency: "USD",
    date: "2025-01-10",
    time: "5:30 PM",
    status: "completed",
    icon: "📱"
  },
  {
    id: "t10",
    type: "pending",
    title: "Pending Earnings",
    description: "Processing from 3 posts",
    amount: 8.45,
    currency: "USD",
    date: "2025-01-15",
    time: "Ongoing",
    status: "pending",
    icon: "⏳"
  }
];

const WALLET_STATS = {
  totalEarned: 1420.00,
  thisMonth: 124.50,
  lastMonth: 98.30,
  pendingPayout: 8.45,
  totalWithdrawn: 1295.50,
  huCoins: 2340,
  huCoinsValue: 234
};

const EARNING_SOURCES = [
  { label: "Post Revenue", amount: 856.20, percent: 60, color: "#1DB954" },
  { label: "Video Views", amount: 312.40, percent: 22, color: "#3b82f6" },
  { label: "Referrals", amount: 142.00, percent: 10, color: "#f59e0b" },
  { label: "Bonuses", amount: 109.40, percent: 8, color: "#8b5cf6" }
];


/* ============================================
   🧠 HEALTH DATA REPOSITORY (Globally Bound)
   ============================================ */
window.healthDataRepository = {
  /* ----------------------------------------------------
     1. HEART HEALTH ❤️
     ---------------------------------------------------- */
  heart_health: {
    title: "Heart Health & Cardiovascular Vitality",
    emoji: "❤️",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Aapka heart body ka sabse hard-working organ hai jo continuous pressure maintenance par kaam karta hai. Cardiovascular risk sirf cholesterol se nahi, balki <strong>ApoB (Apolipoprotein B)</strong> particles aur arterial wall inflammation se build hoti hai. Low Heart Rate Variability (HRV) indicate karta hai ki aapka autonomic nervous system chronic stress (fight-or-flight) me chal raha hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>Zone 2 Cardio Rule:</strong> Week me kam se kam 150 mins Zone 2 cardio (moderate pace jisme aap baat kar sakein par gaa na sakein) karein. Ye mitochondria ki efficiency badhata hai aur resting heart rate (RHR) ko drop karta hai.</li>
        <li><strong>Nitric Oxide Boosters:</strong> Beetroot, palak (spinach), aur garlic ko diet me shamil karein. Ye blood vessels ko dilate karke overall arterial blood pressure (BP) ko regulate karte hain.</li>
        <li><strong>The 10-Minute Post-Meal Walk:</strong> Har bade meal ke baad 10 minutes ki normal walk karein. Isse blood sugar spikes flat ho jate hain, jisse blood vessel walls par direct oxidative stress kam hota hai.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Clinical & Cardiovascular Biomarkers</h4>
      <p>Sirf basic Lipid Profile par rely karne ke bajay Advanced metrics monitor karein. ApoB, Hs-CRP (systemic inflammation marker), aur HbA1c ka combined assessment cardiac risk profiles ko accurately predict karne me help karta hai.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: Journal of the American College of Cardiology (JACC)</strong>
        <p>Evidence confirms that steady-state zone 2 aerobic adaptations actively reduce arterial stiffness index and elevate dynamic endothelial nitric oxide release pathways.</p>
      </div>
    `,
  },

  /* ----------------------------------------------------
     2. MENTAL WELLNESS 🧠
     ---------------------------------------------------- */
  mental_wellness: {
    title: "Mental Wellness & Stress Resilience",
    emoji: "🧠",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Stress humari survival ka natural response hai, lekin jab <strong>Cortisol</strong> (stress hormone) constantly elevated rehta hai, toh ye brain ke hippocampus (memory aur learning centre) ko micro-damage karta hai. Chronic anxiety aur low mood aksar neural pathways ke dopamine depletion aur constant amygdala hyperactivity ke karan hote hain.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>The Physiological Sigh:</strong> Jab bhi sudden tension ya peak stress feel ho, double-inhale karein nose se (ek deep breath aur uske upar ek choti breath) aur fir mouth se dheere se pura exhale karein. Ye instantly aapke nervous system ko autonomic rest cycle me shift karta hai.</li>
        <li><strong>Digital Dopamine Fasting:</strong> Morning wake-up ke pehle 45-60 mins tak screen bypass karein. Subah scrolling karne se brain seedha low-attention aur high-reactivity state me chala jata hai.</li>
        <li><strong>Gratitude & Rewiring:</strong> Sone se pehle pure din ke 3 positive events likhne ki habit dalein. Ye continuous neuroplasticity practice chronic anxiety levels ko permanent bypass karne me effective hai.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Neuro-Endocrine Regulation</h4>
      <p>Cortisol aur adrenaline ka elevated balance sleep aur memory processes ko interrupt karta hai. Continuous slow breathing exercises (4-7-8 breathing) directly vagus nerve pathway ko stimulate karti hain to block sympathetic spikes.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: JAMA Psychiatry (Q1 Index)</strong>
        <p>A randomized trial shows that structured mindfulness practice is clinically comparable to pharmacotherapy for managing persistent generalized anxiety markers.</p>
      </div>
    `,
  },

  /* ----------------------------------------------------
     3. NUTRITION TIPS 🥗
     ---------------------------------------------------- */
  nutrition_tips: {
    title: "Metabolic Nutrition & Insulin Optimization",
    emoji: "🥗",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Food sirf caloric intake nahi, balki genetic system ke liye information wave hai. Jab aap bar-bar refined carbohydrates aur processed foods consume karte hain, toh blood me continuous high glucose rehta hai. Overtime, aapke body cells insulin-resistant ho jate hain, jisse continuous energy-crashes aur visceral fat storage badh jata hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>The Sequential Eating Rule:</strong> Kisi bhi meal me pehle Fibers (salads, veggies) khayein, fir Proteins/Fats, aur sabse end me Carbohydrates. Is pattern se meal ka total glucose spike lagbhag 70% tak smooth aur controlled ho jata hai.</li>
        <li><strong>Eliminate Emulsifiers:</strong> Chemical stabilizers aur preservatives jo packed foods me hote hain, wo gut lining ko compromise karte hain. Baseline focus natural, single-ingredient whole foods par rakhein.</li>
        <li><strong>Hydration Buffering:</strong> Khane ke immediate pehle ya immediate baad excess pani pina avoid karein, taaki aapke stomach acid aur proteolytic enzymes ka digestive concentration weak na ho.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Metabolic Dynamics & Assays</h4>
      <p>Continuous glucose variability ko stability range me maintain karne se systemic metabolic diseases ka baseline drop ho jata hai. Fasting Insulin test cell-level insulin responsiveness analyze karne ke liye gold standard hai.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: The American Journal of Clinical Nutrition</strong>
        <p>Longitudinal studies indicate that managing postprandial glucose volatility lowers system-wide oxidative stress markers and optimizes metabolic flexibility index.</p>
      </div>
    `,
  },

  /* ----------------------------------------------------
     4. FITNESS GOALS 💪
     ---------------------------------------------------- */
  fitness_goals: {
    title: "Hypertrophy, Strength & Longevity Physiology",
    emoji: "💪",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Muscles sirf body aesthetics ke liye nahi, balki long-term life survival ka sabse bada metabolic glucose sink hain. 30 years ki age ke baad baseline muscle mass speed se kam hone lagta hai, jise <strong>Sarcopenia</strong> kehte hain. Muscle strength increase karne se skeletal system optimize hota hai aur systemic metabolic function healthy rehta hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>Progressive Overload Blueprint:</strong> Training me continuous adaptation ke liye progressive demand (higher weight, controlled range of motion, ya slow repetitions) introduce karein.</li>
        <li><strong>The Protein Target:</strong> Din me kam se kam 1.6g to 2g protein per kilogram of target weight consume karein. Amino acid signaling (leucine intake) muscle protein synthesis (MPS) ke liye trigger point hai.</li>
        <li><strong>Active Mobility:</strong> Sirf stretching nahi, joints ki active functional range aur control strength build karein taaki connective tendons load handle karne ke liye elastic aur safe rahein.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Neuromuscular & Longevity Medicine</h4>
      <p>Skeletal structural mass dynamic longevity parameters se highly linked hai. VO2 Max capacity aur physical grip-strength values statistically long-term physiological survival outcomes ke ultimate predictors hain.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: Sports Medicine Reviews</strong>
        <p>Scientific reviews indicate resistance-based stimulus directly elevates systemic growth factors and acts as a potent independent regulator of bone mass accumulation.</p>
      </div>
    `,
  },
  gut_health: {
    title: "Gut & Stomach Optimization",
    emoji: "🦠",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Aapka stomach aur intestines sirf khana digest nahi karte, balki ise <strong>"Second Brain"</strong> kaha jata hai. Humare gut me trillions of good bacteria hote hain jo mood, immunity, aur energy control karte hain. Chronic bloating, acidity, aur lethargy aksar gut microbiome ke balance bigadne se hoti hain.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>The 30-Gram Fiber Rule:</strong> Apni daily diet me complex fibers (jaise oats, dal, green vegetables) add karein taaki good bacteria grow kar sakein.</li>
        <li><strong>Probiotic Window:</strong> Din me ek baar fermented food jaise Dahi (curd) ya Chaas zaroor lein. Isse live cultures directly gut ko milte hain.</li>
        <li><strong>Circadian Fasting:</strong> Raat ke khane aur agle din ke breakfast me kam se kam 12 ghante ka gap rakhein taaki digestive tract ko repair hone ka time mile.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Clinical Indicators</h4>
      <p>Agar aapko frequent acid reflux ya sudden food intolerance ho rahi hai, toh ye low stomach acid ya leaky gut wall ka signal ho sakta hai. Is condition me processing agents aur artificial sweeteners se bilkul door rahein.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: Nature Microbiology (Q1 Index)</strong>
        <p>Research confirms that dietary changes can significantly modify the human gut microbiota composition within 24–48 hours.</p>
      </div>
    `,
  },

  neuro_brain: {
    title: "Neuroplasticity & Cognitive Power",
    emoji: "🧠",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Brain ki capability constant rehti hai ye ek myth hai. Brain me <strong>Neuroplasticity</strong> hoti hai, matlab ye naye pathways bana sakta hai. Aajkal ka low focus aur brain-fog aksar constant screen multitasking aur high dopamine spikes (social media scroll) ki wajah se hota hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>Non-Sleep Deep Rest (NSDR):</strong> Agar din me thakan mehsoos ho, toh 10-20 mins ka NSDR ya Yoga Nidra audio sunein. Ye nervous system ko instantly calm aur reboot karta hai.</li>
        <li><strong>90-Minute Focus Blocks:</strong> Brain ultra-dian rhythms par kaam karta hai. 90 mins tak phone door rakh kar intense focus karein, phir 10 mins ka complete break lein.</li>
        <li><strong>The Morning Light Hack:</strong> Uthne ke 30 mins ke andar natural sunlight ko apni aankhon me aane dein (direct sun ko nahi dekhna hai). Isse cortisol timing optimize hoti hai aur raat ko neend acchi aati hai.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Neurological Optimization</h4>
      <p>Chronic high stress humare prefrontal cortex (decision-making area) ko temporarily weak kar deta hai. Deep box breathing (4s inhale, 4s hold, 4s exhale, 4s hold) vagus nerve ko activate karke brain fog ko instantly hatati hai.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: Frontiers in Human Neuroscience</strong>
        <p>Studies show structured cognitive breaks and deep breathing exercises lower beta-wave hyperactivity, improving working memory retention.</p>
      </div>
    `,
  },

  sexual_wellness: {
    title: "Hormonal Balance & Sexual Wellness",
    emoji: "🧬",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Sexual health pure human body ke endocrine aur reproductive health ka reflection hai. Yeh sirf energy ke baare me nahi hai, balki aapke blood flow, testosterone/estrogen levels, stress hormone (cortisol), aur pelvic strength par directly depend karta hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>Cortisol Management:</strong> High stress body me sexual wellness hormones ko dabata hai. Daily 7-8 ghante ki quality sleep aur cardiovascular workouts is balance ko wapas laate hain.</li>
        <li><strong>Pelvic Floor Strength (Kegels):</strong> Both men aur women ke liye pelvic floor exercises bladder control aur reproductive blood flow ko optimize karne me madad karti hain.</li>
        <li><strong>Micronutrient Density:</strong> Zinc aur Magnesium rich foods (jaise pumpkin seeds, almonds, spinach) daily include karein, kyunki ye baseline hormone production ke building blocks hain.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Metabolic & Endocrine View</h4>
      <p>Poor circulation aur high inflammation levels reproductive stamina aur wellness ko hamper karte hain. Daily dynamic movements aur clean hydration panels circulatory health ke liye essential hain.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: The Journal of Sexual Medicine</strong>
        <p>Evidence highlights that moderate aerobic activity and stress mitigation significantly improve overall reproductive system vascular function.</p>
      </div>
    `,
  },

  sleep_recovery: {
    title: "Sleep Architecture & Circadian Recovery",
    emoji: "💤",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Neend sirf rest time nahi hai, ye aapke brain ka <strong>"Glymphatic System"</strong> (waste clearance) aur tissue repair protocol hai. Jab aap deep sleep skip karte hain, toh brain me toxic proteins accumulate hote hain aur cells properly recover nahi kar paate, jisse cognitive lag aur subah lethargy hoti hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>The 10-3-2-1-0 Rule:</strong> Sone se 10 ghante pehle caffeine band, 3 ghante pehle heavy meal band, 2 ghante pehle focus work band, 1 ghante pehle screen zero, aur subah hit the alarm button at 0 snooze!</li>
        <li><strong>Thermal Shift:</strong> Apne room ko thoda cool (around 20-22°C) rakhein. Body temperature jab drop hota hai, toh brain biologically melatonin release karke deep sleep triggers initiate karta hai.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Sleep Architecture Metrics</h4>
      <p>Deep sleep aur REM (Rapid Eye Movement) cycles ka baseline monitor karna heavy physical stress markers ko control karta hai. Resting heart rate (RHR) ko optimize rakhna recovery ke liye kafi zaroori hai.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: Sleep Medicine Reviews</strong>
        <p>Comprehensive trials validate that consistency in wake times stabilizes global hormonal parameters far more efficiently than tracking erratic high-duration weekend sleep.</p>
      </div>
    `,
  },

  skin_barrier: {
    title: "Skin Health & Epidermal Barrier Protection",
    emoji: "✨",
    overview: `
      <h4>🔬 The Science (Understand)</h4>
      <p>Aapki skin body ka sabse bada organ aur main defense shield hai. Aajkal modern environment me stress aur excessive harsh products lagane ki wajah se <strong>Epidermal Skin Barrier</strong> crash ho jata hai. Is wajah se premature wrinkles, sudden breakouts, aur redness shuru ho jati hai.</p>
      
      <h4>🎯 Life Blueprint (Implement Now)</h4>
      <ul>
        <li><strong>Minimalist Approach:</strong> Multi-step routine ki jagah simple Cleanser, Moisturizer, aur Sunscreen (CMS routine) par basic focus rakhein. Extra chemical combinations active flare-ups badhate hain.</li>
        <li><strong>Daily UV Defense:</strong> Cloud rays aur indoor lighting se hone wale cellular degradation ko rokne ke liye broad-spectrum SPF 30+ daily zaroor apply karein.</li>
      </ul>
    `,
    clinical: `
      <h4>🩺 Dermatology & Cellular Integrity View</h4>
      <p>Skin parameters directly system inflammation se map hote hain. Cellular level par oxidative stress ko drop karne ke liye daily internal hydration channels aur minimal topical irritants sabse solid layer framework hain.</p>
    `,
    resources: `
      <div class='research-card'>
        <strong>Journal Reference: Clinics in Dermatology</strong>
        <p>Scientific data points out that topical ceramide-rich formulations combined with optimized anti-inflammatory whole food diets accelerate cutaneous structural barrier repair by up to 60%.</p>
      </div>
    `,
  },
};

/* ============================================
   ✨ MERGE ADMIN-ADDED JOBS & DOCTORS INTO EXISTING ARRAYS
   (Existing hardcoded JOBS/DOCTORS untouched — sirf naye push honge)
   ============================================ */

async function loadAdminAddedJobs() {
  try {
    const res = await fetch(HU_API + "/api/jobs");
    if (!res.ok) return;
    const adminJobs = await res.json();

    const existingIds = new Set(JOBS.map(j => j.id));
    adminJobs.forEach(function (aj) {
      if (!existingIds.has(aj.id)) JOBS.push(aj);
    });

    // Agar user abhi Jobs page par hai, to turant re-render karo
    const jobsList = document.getElementById("jobs-list");
    if (jobsList && typeof renderJobs === "function") renderJobs();
  } catch (e) {
    console.error("Could not load admin-added jobs:", e);
  }
}

async function loadAdminAddedDoctors() {
  try {
    const res = await fetch(HU_API + "/api/doctors");
    if (!res.ok) return;
    const payload = await res.json();
    const adminDoctors = Array.isArray(payload) ? payload : (payload.doctors || []);

    const existingIds = new Set(DOCTORS.map(d => d.id));
    adminDoctors.forEach(function (ad) {
      if (!existingIds.has(ad.id)) DOCTORS.push(huNormalizeDoctor(ad));
    });

    const doctorsGrid = document.getElementById("doctors-grid");
    if (doctorsGrid && typeof renderDoctors === "function") renderDoctors();
  } catch (e) {
    console.error("Could not load admin-added doctors:", e);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // app.js ka apna DOMContentLoaded handler pehle chalne dete hain (fake posts, feed etc.)
  // uske thodi der baad hum admin data merge karke silently array update kar dete hain
  setTimeout(function () {
    loadAdminAddedJobs();
    loadAdminAddedDoctors();
  }, 800);
});
