import type { Category, Material } from "../types";

// ============================================================
// DEFAULT MATERIAL CATALOG
// ============================================================

export const defaultCategories: Category[] = [
  { id: "switch-socket", name: "Switch & Socket", icon: "switch", enabled: true, sortOrder: 1 },
  { id: "sheet-plate", name: "Sheet / Plate", icon: "plate", enabled: true, sortOrder: 2 },
  { id: "accessories", name: "Accessories", icon: "accessories", enabled: true, sortOrder: 3 },
  { id: "board", name: "Board", icon: "board", enabled: true, sortOrder: 4 },
  { id: "fancy-light-fans", name: "Fancy Light & Fans", icon: "light", enabled: true, sortOrder: 5 },
  { id: "mcb-protection", name: "MCB / Protection", icon: "mcb", enabled: true, sortOrder: 6 },
  { id: "wire", name: "Wire", icon: "wire", enabled: true, sortOrder: 7 },
  { id: "pipe-box", name: "Pipe & Box", icon: "pipe", enabled: true, sortOrder: 8 },
];

export const defaultMaterials: Material[] = [
  // ── Switch & Socket ──────────────────────────────────────
  { id: "switch", name: "Switch", categoryId: "switch-socket", icon: "switch", variants: [], enabled: true, sortOrder: 1 },
  { id: "socket", name: "Socket", categoryId: "switch-socket", icon: "socket", variants: [], enabled: true, sortOrder: 2 },
  { id: "indicator", name: "Indicator", categoryId: "switch-socket", icon: "indicator", variants: [], enabled: true, sortOrder: 3 },
  { id: "regulator", name: "Regulator", categoryId: "switch-socket", icon: "regulator", variants: [], enabled: true, sortOrder: 4 },
  { id: "socket-model", name: "Socket Model", categoryId: "switch-socket", icon: "socket", variants: [], enabled: true, sortOrder: 5 },
  { id: "16a-switch", name: "16A Switch", categoryId: "switch-socket", icon: "switch", variants: [], enabled: true, sortOrder: 6 },
  { id: "16a-socket", name: "16A Socket", categoryId: "switch-socket", icon: "socket", variants: [], enabled: true, sortOrder: 7 },
  { id: "25a-socket", name: "25A Socket", categoryId: "switch-socket", icon: "socket", variants: [], enabled: true, sortOrder: 8 },
  { id: "10a-mini-mcb", name: "10A Mini MCB", categoryId: "switch-socket", icon: "mcb", variants: [], enabled: true, sortOrder: 9 },
  { id: "16a-mini-mcb", name: "16A Mini MCB", categoryId: "switch-socket", icon: "mcb", variants: [], enabled: true, sortOrder: 10 },
  { id: "holder", name: "Holder", categoryId: "switch-socket", icon: "holder", variants: [], enabled: true, sortOrder: 11 },

  // ── Sheet / Plate ─────────────────────────────────────────
  { id: "round-sheet", name: "Round Sheet", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 1 },
  { id: "fan-sheet", name: "Fan Sheet", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 2 },
  { id: "ceiling-rose", name: "Ceiling Rose", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 3 },
  { id: "18m-plate", name: "18M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 4 },
  { id: "16m-plate", name: "16M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 5 },
  { id: "12m-plate", name: "12M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 6 },
  { id: "8m-plate", name: "8M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 7 },
  { id: "6m-plate", name: "6M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 8 },
  { id: "4m-plate", name: "4M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 9 },
  { id: "3m-plate", name: "3M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 10 },
  { id: "2m-plate", name: "2M Plate", categoryId: "sheet-plate", icon: "plate", variants: [], enabled: true, sortOrder: 11 },

  // ── Accessories ───────────────────────────────────────────
  { id: "pvc-tape", name: "PVC Tape", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 1 },
  { id: "gulli", name: "Gulli", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 2 },
  { id: "scoop-35x8", name: "Scoop 35×8", categoryId: "accessories", icon: "pipe", variants: [], enabled: true, sortOrder: 3 },
  { id: "scoop-50x10", name: "Scoop 50×10", categoryId: "accessories", icon: "pipe", variants: [], enabled: true, sortOrder: 4 },
  { id: "washer-65mm", name: "Washer 6.5mm Feet", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 5 },
  { id: "kajoo-pin", name: "Kajoo Pin", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 6 },
  { id: "wall-cutting-material", name: "Wall Cutting Material", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 7 },
  { id: "medium-pipe", name: "Medium Pipe", categoryId: "accessories", icon: "pipe", variants: [], enabled: true, sortOrder: 8 },
  { id: "dibbi", name: "Dibbi", categoryId: "accessories", icon: "box", variants: [], enabled: true, sortOrder: 9 },
  { id: "band", name: "Band", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 10 },
  { id: "6-blade", name: "6 Blade", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 11 },
  { id: "5-blade", name: "5 Blade", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 12 },
  { id: "ultra-tape", name: "Ultra Tape", categoryId: "accessories", icon: "accessories", variants: [], enabled: true, sortOrder: 13 },
  { id: "cancil-box-acc", name: "Cancil Box", categoryId: "accessories", icon: "box", variants: [], enabled: true, sortOrder: 14 },

  // ── Board ─────────────────────────────────────────────────
  { id: "18m-board", name: "18M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 1 },
  { id: "16m-board", name: "16M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 2 },
  { id: "12m-board", name: "12M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 3 },
  { id: "8m-board", name: "8M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 4 },
  { id: "6m-board", name: "6M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 5 },
  { id: "4m-board", name: "4M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 6 },
  { id: "3m-board", name: "3M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 7 },
  { id: "2m-board", name: "2M Board", categoryId: "board", icon: "board", variants: [], enabled: true, sortOrder: 8 },

  // ── Fancy Light & Fans ────────────────────────────────────
  {
    id: "fancy-light",
    name: "Fancy Light",
    categoryId: "fancy-light-fans",
    icon: "light",
    variants: [
      { id: "fl-5w", name: "5W", enabled: true },
      { id: "fl-7w", name: "7W", enabled: true },
      { id: "fl-9w", name: "9W", enabled: true },
    ],
    enabled: true,
    sortOrder: 1,
  },
  { id: "deep-junction-light", name: "Deep Junction Light", categoryId: "fancy-light-fans", icon: "light", variants: [], enabled: true, sortOrder: 2 },
  { id: "exhaust-fan", name: "Exhaust Fan", categoryId: "fancy-light-fans", icon: "fan", variants: [], enabled: true, sortOrder: 3 },
  { id: "fan", name: "Fan", categoryId: "fancy-light-fans", icon: "fan", variants: [], enabled: true, sortOrder: 4 },
  { id: "tube-light", name: "Tube Light", categoryId: "fancy-light-fans", icon: "light", variants: [], enabled: true, sortOrder: 5 },

  // ── MCB / Protection ──────────────────────────────────────
  {
    id: "mcb-box",
    name: "MCB Box",
    categoryId: "mcb-protection",
    icon: "mcb",
    variants: [
      { id: "mcbbox-10m", name: "10M", enabled: true },
      { id: "mcbbox-12m", name: "12M", enabled: true },
      { id: "mcbbox-16m", name: "16M", enabled: true },
    ],
    enabled: true,
    sortOrder: 1,
  },
  { id: "mcb-changer", name: "MCB Changer", categoryId: "mcb-protection", icon: "mcb", variants: [], enabled: true, sortOrder: 2 },
  { id: "mcb-insulator", name: "MCB Insulator", categoryId: "mcb-protection", icon: "mcb", variants: [], enabled: true, sortOrder: 3 },
  { id: "rcb", name: "RCB", categoryId: "mcb-protection", icon: "mcb", variants: [], enabled: true, sortOrder: 4 },
  {
    id: "mcb",
    name: "MCB",
    categoryId: "mcb-protection",
    icon: "mcb",
    variants: [
      { id: "mcb-10a", name: "10A", enabled: true },
      { id: "mcb-16a", name: "16A", enabled: true },
      { id: "mcb-20a", name: "20A", enabled: true },
      { id: "mcb-32a", name: "32A", enabled: true },
    ],
    enabled: true,
    sortOrder: 5,
  },

  // ── Wire ──────────────────────────────────────────────────
  {
    id: "wire-8mm",
    name: "8mm Wire",
    categoryId: "wire",
    icon: "wire",
    variants: [
      { id: "w8-red", name: "Red", enabled: true },
      { id: "w8-black", name: "Black", enabled: true },
      { id: "w8-yellow", name: "Yellow", enabled: true },
    ],
    enabled: true,
    sortOrder: 1,
  },
  {
    id: "wire-4mm",
    name: "4mm Wire",
    categoryId: "wire",
    icon: "wire",
    variants: [
      { id: "w4-red", name: "Red", enabled: true },
      { id: "w4-black", name: "Black", enabled: true },
      { id: "w4-yellow", name: "Yellow", enabled: true },
    ],
    enabled: true,
    sortOrder: 2,
  },
  {
    id: "wire-2-5mm",
    name: "2.5mm Wire",
    categoryId: "wire",
    icon: "wire",
    variants: [
      { id: "w25-red", name: "Red", enabled: true },
      { id: "w25-black", name: "Black", enabled: true },
      { id: "w25-yellow", name: "Yellow", enabled: true },
    ],
    enabled: true,
    sortOrder: 3,
  },
  {
    id: "wire-1mm",
    name: "1mm Wire",
    categoryId: "wire",
    icon: "wire",
    variants: [
      { id: "w1-red", name: "Red", enabled: true },
      { id: "w1-yellow", name: "Yellow", enabled: true },
      { id: "w1-blue", name: "Blue", enabled: true },
      { id: "w1-white", name: "White", enabled: true },
      { id: "w1-black", name: "Black", enabled: true },
    ],
    enabled: true,
    sortOrder: 4,
  },
  {
    id: "wire-0-5mm",
    name: "0.5mm Wire",
    categoryId: "wire",
    icon: "wire",
    variants: [
      { id: "w05-green", name: "Green", enabled: true },
      { id: "w05-white", name: "White", enabled: true },
    ],
    enabled: true,
    sortOrder: 5,
  },
  {
    id: "wire-1-5mm",
    name: "1.5mm Wire",
    categoryId: "wire",
    icon: "wire",
    variants: [
      { id: "w15-black", name: "Black", enabled: true },
      { id: "w15-red", name: "Red", enabled: true },
    ],
    enabled: true,
    sortOrder: 6,
  },

  // ── Pipe & Box ────────────────────────────────────────────
  { id: "heavy-pipe-25mm", name: "Heavy Pipe 25mm", categoryId: "pipe-box", icon: "pipe", variants: [], enabled: true, sortOrder: 1 },
  { id: "fan-box", name: "Fan Box", categoryId: "pipe-box", icon: "box", variants: [], enabled: true, sortOrder: 2 },
  { id: "deep-junction", name: "Deep Junction", categoryId: "pipe-box", icon: "box", variants: [], enabled: true, sortOrder: 3 },
  { id: "cancil-box", name: "Cancil Box", categoryId: "pipe-box", icon: "box", variants: [], enabled: true, sortOrder: 4 },
];
