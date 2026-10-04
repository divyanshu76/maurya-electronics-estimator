import type { EstimateItem } from "../types";

// ============================================================
// CALCULATION ENGINE — Single source of truth
// ============================================================

/**
 * Calculate amount for a single item
 */
export function calculateItemAmount(quantity: number, rate: number): number {
  if (!isValidPositiveNumber(quantity) || !isValidNonNegativeNumber(rate)) return 0;
  return Math.round(quantity * rate * 100) / 100;
}

/**
 * Calculate grand total from all items
 */
export function calculateGrandTotal(items: EstimateItem[]): number {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
}

/**
 * Calculate total quantity across all items
 */
export function calculateTotalQuantity(items: EstimateItem[]): number {
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

/**
 * Count distinct estimate rows
 */
export function calculateItemCount(items: EstimateItem[]): number {
  return items.length;
}

/**
 * Sanitize quantity — must be positive number
 */
export function sanitizeQuantity(value: unknown): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num) || num < 0) return 0;
  return num;
}

/**
 * Sanitize rate — must be non-negative number
 */
export function sanitizeRate(value: unknown): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num) || num < 0) return 0;
  return num;
}

function isValidPositiveNumber(value: number): boolean {
  return typeof value === "number" && isFinite(value) && value > 0;
}

function isValidNonNegativeNumber(value: number): boolean {
  return typeof value === "number" && isFinite(value) && value >= 0;
}

// ============================================================
// CURRENCY FORMATTING (INR)
// ============================================================

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const inrFormatterNoSymbol = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

export function formatINRPlain(amount: number): string {
  return inrFormatterNoSymbol.format(amount);
}

// ============================================================
// ESTIMATE NUMBER GENERATION
// ============================================================

export function generateEstimateNumber(counter: number): string {
  const year = new Date().getFullYear();
  const paddedCounter = String(counter).padStart(4, "0");
  return `ME-${year}-${paddedCounter}`;
}

// ============================================================
// ID GENERATION
// ============================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
