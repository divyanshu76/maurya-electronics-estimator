import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Estimate, Category, Material, BusinessConfig } from "../types";
import {
  getEstimates,
  saveEstimate as persistEstimate,
  deleteEstimate as removeEstimate,
  getCategories,
  saveCategories,
  getMaterials,
  saveMaterials,
  getBusinessConfig,
  saveBusinessConfig,
  getNextEstimateCounter,
} from "../utils/storage";
import { supabase } from "../lib/supabase";
import { 
  checkAndMigrateData, 
  fetchEstimates, 
  fetchProducts, 
  fetchBusinessSettings,
  saveEstimateSupabase,
  deleteEstimateSupabase,
  updateBusinessSettings
} from "../utils/supabaseApi";

interface AppContextType {
  estimates: Estimate[];
  categories: Category[];
  materials: Material[];
  businessConfig: BusinessConfig;
  isAdminAuthenticated: boolean;

  // Estimates
  saveEstimate: (estimate: Estimate) => void;
  deleteEstimate: (id: string) => void;
  refreshEstimates: () => void;

  // Catalog
  updateCategories: (cats: Category[]) => void;
  updateMaterials: (mats: Material[]) => void;

  // Business
  updateBusinessConfig: (config: BusinessConfig) => void;

  // Admin auth
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;

  // Helpers
  getNextCounter: () => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    name: "Maurya Electronics",
    tagline: "Electrical Materials & Services",
    address: "Mohammadpur (Barahiya), Haldharpur–Mau",
    phone: "9654922408",
    logo: "/Logo.png",
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Load from local storage for instant render
    setEstimates(getEstimates());
    setCategories(getCategories());
    setMaterials(getMaterials());
    
    const loadedConfig = getBusinessConfig();
    if (loadedConfig.address === "Mohammadpur, Mau, Uttar Pradesh" || loadedConfig.phone === "") {
      loadedConfig.phone = "9654922408";
      loadedConfig.address = "Mohammadpur (Barahiya), Haldharpur–Mau";
      saveBusinessConfig(loadedConfig);
    }
    setBusinessConfig(loadedConfig);

    // 2. Fetch from Supabase and sync
    async function syncCloud() {
      await checkAndMigrateData();
      
      const cloudSettings = await fetchBusinessSettings();
      if (cloudSettings) {
        setBusinessConfig(prev => {
          const merged = { ...prev, ...cloudSettings };
          saveBusinessConfig(merged);
          return merged;
        });
      }

      const cloudEstimates = await fetchEstimates();
      if (cloudEstimates.length > 0) {
        setEstimates(cloudEstimates);
      }

      const cloudProducts = await fetchProducts();
      if (cloudProducts.length > 0) {
        setMaterials(cloudProducts);
      }
    }
    syncCloud();

    async function checkAdminRole(userId: string) {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (data?.role === 'admin') setIsAdminAuthenticated(true);
    }

    // 3. Auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkAdminRole(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkAdminRole(session.user.id);
      else setIsAdminAuthenticated(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const saveEstimate = useCallback(async (estimate: Estimate) => {
    // Update locally first
    persistEstimate(estimate);
    setEstimates(getEstimates());
    // Sync to cloud
    await saveEstimateSupabase(estimate);
  }, []);

  const deleteEstimate = useCallback(async (id: string) => {
    const est = getEstimates().find(e => e.id === id);
    if (est) {
      removeEstimate(id);
      setEstimates(getEstimates());
      await deleteEstimateSupabase(est.estimateNumber);
    }
  }, []);

  const refreshEstimates = useCallback(() => {
    setEstimates(getEstimates());
  }, []);

  const updateCategories = useCallback((cats: Category[]) => {
    saveCategories(cats);
    setCategories(cats);
  }, []);

  const updateMaterials = useCallback(async (mats: Material[]) => {
    saveMaterials(mats);
    setMaterials(mats);
    
    // Sync to Supabase
    // To avoid circular dependency with supabaseApi in useApp, we imported it at the top
    const { syncProductsSupabase } = await import("../utils/supabaseApi");
    await syncProductsSupabase(mats);
  }, []);

  const updateBusinessConfig = useCallback(async (config: BusinessConfig) => {
    saveBusinessConfig(config);
    setBusinessConfig(config);
    await updateBusinessSettings({
      business_name: config.name,
      tagline: config.tagline,
      phone: config.phone,
      address: config.address,
      hero_image_url: config.heroImage,
      hero_background_url: config.heroBackground,
      pdf_notes: config.footerText,
      logo_url: config.logo
    });
  }, []);

  const loginAdmin = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return false;
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role === 'admin') {
      setIsAdminAuthenticated(true);
      return true;
    }
    await supabase.auth.signOut(); // not admin
    return false;
  }, []);

  const logoutAdmin = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
  }, []);

  const getNextCounter = useCallback((): number => {
    return getNextEstimateCounter();
  }, []);

  return (
    <AppContext.Provider
      value={{
        estimates,
        categories,
        materials,
        businessConfig,
        isAdminAuthenticated,
        saveEstimate,
        deleteEstimate,
        refreshEstimates,
        updateCategories,
        updateMaterials,
        updateBusinessConfig,
        loginAdmin,
        logoutAdmin,
        getNextCounter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
