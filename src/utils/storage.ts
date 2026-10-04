import type { Estimate, Category, Material, BusinessConfig } from "../types";
import { STORAGE_KEYS, businessConfig as defaultBusinessConfig } from "../config/businessConfig";
import { defaultCategories, defaultMaterials } from "../data/catalog";

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("localStorage write failed:", key);
  }
}

// ============================================================
// ESTIMATES
// ============================================================

export function getEstimates(): Estimate[] {
  return getItem<Estimate[]>(STORAGE_KEYS.ESTIMATES, []);
}

export function saveEstimate(estimate: Estimate): void {
  const estimates = getEstimates();
  const existingIdx = estimates.findIndex((e) => e.id === estimate.id);
  if (existingIdx >= 0) {
    estimates[existingIdx] = estimate;
  } else {
    estimates.push(estimate);
  }
  setItem(STORAGE_KEYS.ESTIMATES, estimates);
}

export function deleteEstimate(id: string): void {
  const estimates = getEstimates().filter((e) => e.id !== id);
  setItem(STORAGE_KEYS.ESTIMATES, estimates);
}

export function getEstimateById(id: string): Estimate | undefined {
  return getEstimates().find((e) => e.id === id);
}

// ============================================================
// ESTIMATE COUNTER
// ============================================================

export function getNextEstimateCounter(): number {
  const current = getItem<number>(STORAGE_KEYS.ESTIMATE_COUNTER, 0);
  const next = current + 1;
  setItem(STORAGE_KEYS.ESTIMATE_COUNTER, next);
  return next;
}

// ============================================================
// CATEGORIES
// ============================================================

export function getCategories(): Category[] {
  const stored = getItem<Category[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (!stored) {
    setItem(STORAGE_KEYS.CATEGORIES, defaultCategories);
    return defaultCategories;
  }
  return stored;
}

export function saveCategories(categories: Category[]): void {
  setItem(STORAGE_KEYS.CATEGORIES, categories);
}

// ============================================================
// MATERIALS
// ============================================================

export function getMaterials(): Material[] {
  const stored = getItem<Material[] | null>(STORAGE_KEYS.MATERIALS, null);
  if (!stored) {
    setItem(STORAGE_KEYS.MATERIALS, defaultMaterials);
    return defaultMaterials;
  }
  return stored;
}

export function saveMaterials(materials: Material[]): void {
  setItem(STORAGE_KEYS.MATERIALS, materials);
}

// ============================================================
// BUSINESS CONFIG
// ============================================================

export function getBusinessConfig(): BusinessConfig {
  return getItem<BusinessConfig>(STORAGE_KEYS.BUSINESS_CONFIG, defaultBusinessConfig);
}

export function saveBusinessConfig(config: BusinessConfig): void {
  setItem(STORAGE_KEYS.BUSINESS_CONFIG, config);
}

// ============================================================
// ADMIN AUTH
// ============================================================

export function getAdminPassword(): string {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || "admin123";
}

export function setAdminPassword(password: string): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
}

export function checkAdminPassword(input: string): boolean {
  return input === getAdminPassword();
}
