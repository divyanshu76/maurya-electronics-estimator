import { supabase } from '../lib/supabase';
import type { Estimate, BusinessConfig, Material } from '../types';

export const SUPABASE_MIGRATION_KEY = 'maurya_supabase_migration_v1';

// ---------------------------------------------------------------------------
// INITIALIZATION / MIGRATION
// ---------------------------------------------------------------------------

export async function checkAndMigrateData() {
  if (localStorage.getItem(SUPABASE_MIGRATION_KEY) === 'completed') {
    return true; // Already migrated
  }

  try {
    // 1. Migrate Estimates
    const localEstimates = localStorage.getItem('maurya_estimates');
    if (localEstimates) {
      const estimates: Estimate[] = JSON.parse(localEstimates);
      for (const est of estimates) {
        // Check if exists
        const { data: existing } = await supabase
          .from('estimates')
          .select('id')
          .eq('estimate_number', est.estimateNumber)
          .single();

        if (!existing) {
          await supabase.from('estimates').insert({
            estimate_number: est.estimateNumber,
            customer_name: est.customer.name,
            customer_phone: est.customer.phone || null,
            customer_address: est.customer.address || null,
            items: est.items,
            total_items: est.totalItems,
            total_quantity: est.totalQuantity,
            subtotal: est.grandTotal, // simplification
            grand_total: est.grandTotal,
            notes: null, // handle notes if they existed
            created_at: est.createdAt,
            updated_at: est.updatedAt
          });
        }
      }
    }

    // 2. We don't migrate Business Config automatically here unless we want to override the cloud one.
    // The cloud business_settings row is the source of truth.

    localStorage.setItem(SUPABASE_MIGRATION_KEY, 'completed');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// ESTIMATES
// ---------------------------------------------------------------------------

export async function fetchEstimates(): Promise<Estimate[]> {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching estimates:', error);
    // Fallback to local storage if offline
    const local = localStorage.getItem('maurya_estimates');
    return local ? JSON.parse(local) : [];
  }

  // Map to frontend Estimate type
  return data.map(row => ({
    id: row.id,
    estimateNumber: row.estimate_number,
    date: row.created_at,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone || undefined,
      address: row.customer_address || undefined
    },
    items: row.items,
    totalItems: row.total_items,
    totalQuantity: row.total_quantity,
    grandTotal: row.grand_total,
    status: 'saved',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function saveEstimateSupabase(estimate: Estimate): Promise<boolean> {
  // Try cloud first
  const { error } = await supabase.from('estimates').insert({
    estimate_number: estimate.estimateNumber,
    customer_name: estimate.customer.name,
    customer_phone: estimate.customer.phone || null,
    customer_address: estimate.customer.address || null,
    items: estimate.items,
    total_items: estimate.totalItems,
    total_quantity: estimate.totalQuantity,
    subtotal: estimate.grandTotal,
    grand_total: estimate.grandTotal,
    notes: null,
    created_at: estimate.createdAt,
    updated_at: estimate.updatedAt
  });

  if (error) {
    console.error('Error saving estimate to Supabase:', error);
    // Offline fallback - preserve locally
    const local = localStorage.getItem('maurya_estimates');
    const estimates = local ? JSON.parse(local) : [];
    estimates.push(estimate);
    localStorage.setItem('maurya_estimates', JSON.stringify(estimates));
    return false;
  }
  return true;
}

export async function deleteEstimateSupabase(estimateNumber: string): Promise<boolean> {
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('estimate_number', estimateNumber);
    
  if (error) {
    console.error('Error deleting estimate:', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// BUSINESS SETTINGS
// ---------------------------------------------------------------------------

export async function fetchBusinessSettings(): Promise<Partial<BusinessConfig> | null> {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }

  return {
    name: data.business_name,
    tagline: data.tagline,
    phone: data.phone,
    address: data.address,
    logo: data.logo_url || '/logo.png',
    heroImage: data.hero_image_url || undefined,
    heroBackground: data.hero_background_url || undefined,
    footerText: data.pdf_notes || undefined,
  };
}

export async function updateBusinessSettings(settings: any): Promise<boolean> {
  const { error } = await supabase
    .from('business_settings')
    .update(settings)
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all (we only have 1 row)

  if (error) {
    console.error('Error updating settings:', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// PRODUCTS / MATERIALS
// ---------------------------------------------------------------------------

export async function fetchProducts(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data.map((p, index) => ({
    id: p.id,
    name: p.name,
    categoryId: p.category || 'accessories',
    icon: 'accessories', // fallback icon
    variants: [],
    enabled: p.is_active,
    sortOrder: index + 1,
    rate: p.rate
  })) as any; 
}

export async function syncProductsSupabase(materials: Material[]): Promise<boolean> {
  const payload = materials.map(m => ({
    id: m.id,
    name: m.name,
    category: m.categoryId,
    is_active: m.enabled,
    rate: (m as any).rate || 0,
    unit: 'pcs'
  }));

  const { error } = await supabase.from('products').upsert(payload);
  
  if (error) {
    console.error('Error syncing products to Supabase:', error);
    return false;
  }
  return true;
}

export async function uploadFileToSupabase(file: File, folder: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('business-assets')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('business-assets')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
