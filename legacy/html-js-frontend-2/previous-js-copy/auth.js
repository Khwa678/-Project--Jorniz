const roleSelect = document.getElementById("signup-role");
const specialtyContainer = document.getElementById("specialty-container");
const specialtySelect = document.getElementById("signup-specialty");

const specialties = {
  Doctor: [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Endocrinologist",
    "ENT Specialist",
    "Gastroenterologist",
    "Gynecologist",
    "Neurologist",
    "Nephrologist",
    "Oncologist",
    "Ophthalmologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Plastic Surgeon",
    "Psychiatrist",
    "Pulmonologist",
    "Radiologist",
    "Rheumatologist",
    "Urologist",
    "Anesthesiologist",
    "Emergency Medicine",
    "Pathologist",
  ],

  "Ayurvedic Doctor": [
    "General Ayurveda",
    "Kayachikitsa (Internal Medicine)",
    "Panchakarma",
    "Shalya Tantra (Surgery)",
    "Shalakya Tantra (ENT & Ophthalmology)",
    "Kaumarbhritya (Pediatrics)",
    "Prasuti & Stri Roga (Gynecology & Obstetrics)",
    "Rasayana (Rejuvenation)",
    "Agada Tantra (Toxicology)",
    "Other",
  ],

  "Homeopathic Doctor": [
    "General Homeopathy",
    "Pediatric Homeopathy",
    "Dermatological Homeopathy",
    "Chronic Disease Management",
    "Constitutional Medicine",
    "Materia Medica Specialist",
    "Repertoirization Specialist",
    "Psychosomatic Homeopathy",
    "Other",
  ],
  Nurse: [
    "Registered Nurse (RN)",
    "Nurse Practitioner",
    "ICU Nurse",
    "Emergency Nurse",
    "Pediatric Nurse",
    "Oncology Nurse",
    "Surgical Nurse",
    "Community Health Nurse",
    "Critical Care Nurse",
    "Other",
  ],

  "Medical Student": [
    "MBBS",
    "BDS",
    "BAMS",
    "BHMS",
    "BUMS",
    "MD",
    "MS",
    "DM",
    "MCh",
    "Intern",
    "Resident Doctor",
  ],

  Dentist: [
    "General Dentist",
    "Orthodontist",
    "Oral Surgeon",
    "Endodontist",
    "Periodontist",
    "Prosthodontist",
    "Pediatric Dentist",
    "Oral Pathologist",
    "Other",
  ],

  Pharmacist: [
    "Clinical Pharmacist",
    "Hospital Pharmacist",
    "Retail Pharmacist",
    "Industrial Pharmacist",
    "Community Pharmacist",
    "Research Pharmacist",
    "Other",
  ],

  Physiotherapist: [
    "Sports Physiotherapy",
    "Orthopedic Physiotherapy",
    "Neurological Physiotherapy",
    "Pediatric Physiotherapy",
    "Geriatric Physiotherapy",
    "Cardiopulmonary Physiotherapy",
    "Other",
  ],

  Psychologist: [
    "Clinical Psychologist",
    "Counseling Psychologist",
    "Educational Psychologist",
    "Sports Psychologist",
    "Industrial Psychologist",
    "Child Psychologist",
    "Other",
  ],

  Nutritionist: [
    "Clinical Nutritionist",
    "Sports Nutritionist",
    "Pediatric Nutritionist",
    "Dietitian",
    "Weight Management Specialist",
    "Wellness Coach",
    "Other",
  ],

  Researcher: [
    "Clinical Research",
    "Biomedical Research",
    "Public Health",
    "Genetics",
    "Immunology",
    "Cancer Research",
    "Pharmaceutical Research",
    "Medical AI",
    "Other",
  ],

  "Fitness Professional": [
    "Personal Trainer",
    "Strength Coach",
    "Yoga Instructor",
    "Pilates Instructor",
    "Fitness Coach",
    "CrossFit Trainer",
    "Sports Coach",
    "Other",
  ],

  "Healthcare Professional": [
    "Lab Technician",
    "Radiology Technician",
    "Occupational Therapist",
    "Speech Therapist",
    "Medical Assistant",
    "Paramedic",
    "Hospital Administrator",
    "Healthcare Manager",
    "Public Health Professional",
    "Social Worker",
    "Other",
  ],
};

roleSelect.addEventListener("change", function () {
  const role = this.value;

  specialtySelect.innerHTML = "";

  // Hide for Patient or empty selection
  if (role === "" || role === "Patient") {
    specialtyContainer.style.display = "none";
    return;
  }

  specialtyContainer.style.display = "block";

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select your specialization";
  specialtySelect.appendChild(defaultOption);

  // Add options
  // specialties[role].forEach(function (item) {
  //   const option = document.createElement("option");
  //   option.value = item;
  //   option.textContent = item;
  //   specialtySelect.appendChild(option);
  // });
  // NEW CODE:
  const roleSpecialties = specialties[role] || ["General Practice", "Other"];

  roleSpecialties.forEach(function (item) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    specialtySelect.appendChild(option);
  });
});
