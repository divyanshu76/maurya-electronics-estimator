// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface MaterialVariant {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Material {
  id: string;
  name: string;
  categoryId: string;
  icon: string; // icon key for SVG lookup
  variants: MaterialVariant[];
  enabled: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  sortOrder: number;
}

export interface EstimateItem {
  id: string;
  materialId: string;
  materialNameSnapshot: string; // frozen at time of creation
  variantId?: string;
  variantNameSnapshot?: string; // frozen at time of creation
  quantity: number;
  rate: number;
  amount: number; // quantity × rate
}

export interface CustomerDetails {
  name: string;
  phone?: string;
  address?: string;
}

export type EstimateStatus = "draft" | "saved";

export interface Estimate {
  id: string;
  estimateNumber: string;
  date: string; // ISO date string
  customer: CustomerDetails;
  items: EstimateItem[];
  totalItems: number;
  totalQuantity: number;
  grandTotal: number;
  status: EstimateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  logo: string;
  gstNumber?: string;
  heroImage?: string;
  heroBackground?: string;
  footerText?: string;
  watermarkVisible?: boolean;
  watermarkOpacity?: number;
}

// For the add/edit item form
export interface ItemFormData {
  materialId: string;
  variantId?: string;
  quantity: number;
  rate: number;
}
