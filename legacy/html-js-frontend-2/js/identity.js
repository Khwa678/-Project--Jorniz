(function (global) {
  var USER_TYPE_LABELS = {
    general_user: "General User", creator: "Creator", job_seeker: "Job Seeker",
    recruiter: "Recruiter", doctor: "Doctor", seller: "Seller",
    pharmacy_partner: "Pharmacy Partner", diagnostic_partner: "Diagnostic Partner",
    advertiser: "Advertiser",
  };
  var LEGACY_TYPES = {
    patient: "general_user", "general user": "general_user", doctor: "doctor",
    "ayurvedic doctor": "doctor", "homeopathic doctor": "doctor",
    "unani practitioner": "doctor", naturopath: "doctor", nurse: "doctor",
    dentist: "doctor", physiotherapist: "doctor", psychologist: "doctor",
    nutritionist: "doctor", researcher: "creator", pharmacist: "pharmacy_partner",
    employer: "recruiter",
  };

  function canonicalType(value) {
    var key = String(value || "general_user").trim().toLowerCase().replace(/[-_]+/g, " ");
    var canonical = key.replace(/\s+/g, "_");
    return USER_TYPE_LABELS[canonical] ? canonical : LEGACY_TYPES[key] || "general_user";
  }

  function normalizeUser(raw) {
    if (!raw) return null;
    var user = Object.assign({}, raw);
    user.user_type = canonicalType(user.user_type || user.role);
    user.system_role = user.system_role || "member";
    user.profile = Object.assign({}, user.profile || {});
    if (user.user_type === "doctor") {
      if (!user.profile.specialty && user.specialty) user.profile.specialty = user.specialty;
      if (!user.profile.hospital && user.hospital) user.profile.hospital = user.hospital;
      if (!user.profile.avatar && user.avatar_url) user.profile.avatar = user.avatar_url;
    }
    return user;
  }

  function typeLabel(user) {
    var normalized = normalizeUser(user) || {};
    return USER_TYPE_LABELS[normalized.user_type] || "General User";
  }

  function professionalLabel(user) {
    var normalized = normalizeUser(user) || {};
    var profile = normalized.profile || {};
    return profile.specialty || profile.title || normalized.specialty || typeLabel(normalized);
  }

  function organization(user) {
    var normalized = normalizeUser(user) || {};
    var profile = normalized.profile || {};
    return profile.hospital || profile.company_name || profile.store_name || normalized.hospital || "";
  }

  function normalizeDoctor(raw) {
    var source = raw && raw.profile && canonicalType(raw.user_type) === "doctor"
      ? Object.assign({}, raw.profile, { name: raw.name, user_id: raw.id, is_verified: raw.is_verified })
      : Object.assign({}, raw || {});
    var available = source.available_days || source.tags || [];
    if (typeof available === "string") {
      try { available = JSON.parse(available); }
      catch (e) { available = available.split(",").map(function (item) { return item.trim(); }).filter(Boolean); }
    }
    var fee = Number(source.consultation_fee != null ? source.consultation_fee : source.fee != null ? source.fee : source.price || 0);
    return Object.assign({}, source, {
      id: source.id, user_id: source.user_id || source.addedBy || source.added_by || null,
      name: source.name || "Doctor", specialty: source.specialty || "General Medicine",
      hospital: source.hospital || "Independent Practice", avatar: source.avatar || source.avatar_url || "",
      is_verified: Boolean(source.is_verified || source.verified || source.verification_status === "approved"),
      experience_years: Number(source.experience_years != null ? source.experience_years : source.experience || 0),
      consultation_fee: fee,
      reviews_count: Number(source.reviews_count != null ? source.reviews_count : source.reviews || 0),
      consultation_count: Number(source.consultation_count != null ? source.consultation_count : source.consultations || 0),
      rating: Number(source.rating || 0), available_days: available,
      availability_status: source.availability_status || source.status || "online",
      next_available: source.next_available || source.nextSlot || source.next_slot || "Available by appointment",
      coin_price: Math.round(fee * 10),
    });
  }

  function storeSession(accessToken, user, refreshToken) {
    localStorage.setItem("hu_token", accessToken);
    localStorage.setItem("hu_user", JSON.stringify(normalizeUser(user)));
    if (refreshToken) localStorage.setItem("hu_refresh_token", refreshToken);
  }

  function clearSession() {
    localStorage.removeItem("hu_token");
    localStorage.removeItem("hu_refresh_token");
    localStorage.removeItem("hu_user");
  }

  global.JornizIdentity = {
    USER_TYPE_LABELS: USER_TYPE_LABELS, canonicalType: canonicalType,
    normalizeUser: normalizeUser, normalizeDoctor: normalizeDoctor,
    typeLabel: typeLabel, professionalLabel: professionalLabel,
    organization: organization, storeSession: storeSession, clearSession: clearSession,
  };
})(window);
