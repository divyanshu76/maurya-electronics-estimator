// ============================================================
// BUSINESS CONFIGURATION — Edit here to update business info
// ============================================================
export const businessConfig = {
  name: "Maurya Electronics",
  tagline: "Electrical Materials & Services",
  address: "Mohammadpur (Barahiya), Haldharpur–Mau",
  phone: "9654922408",
  logo: "/Logo.png",
  gstNumber: "",
  heroImage: "",
  footerText: "Thank you for choosing Maurya Electronics.\nComputer-generated estimate.",
  watermarkVisible: true,
  watermarkOpacity: 0.05,
};

// ============================================================
// ADMIN CONFIGURATION
// ============================================================
export const ADMIN_PASSWORD_KEY = "me_admin_password";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

// ============================================================
// STORAGE KEYS
// ============================================================
export const STORAGE_KEYS = {
  ESTIMATES: "me_estimates",
  CATEGORIES: "me_categories",
  MATERIALS: "me_materials",
  BUSINESS_CONFIG: "me_business_config",
  ADMIN_PASSWORD: "me_admin_password",
  ESTIMATE_COUNTER: "me_estimate_counter",
} as const;
