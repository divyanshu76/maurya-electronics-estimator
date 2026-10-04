// ============================================================
// SVG ICON SYSTEM — Consistent electrical material icons
// ============================================================





// All icons as inline SVG returning JSX-compatible strings
// We use a lookup map to render the right icon per key

export const ICON_KEYS = [
  "switch",
  "socket",
  "indicator",
  "regulator",
  "holder",
  "plate",
  "accessories",
  "board",
  "light",
  "fan",
  "mcb",
  "wire",
  "pipe",
  "box",
  "default",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

// SVG path data for each icon
const svgPaths: Record<string, string> = {
  switch: `
    <rect x="3" y="5" width="18" height="14" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="9" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="11.5" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
  `,
  socket: `
    <rect x="3" y="5" width="18" height="14" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="9" cy="11" r="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="15" cy="11" r="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="12" y1="14" x2="12" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,
  indicator: `
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  `,
  regulator: `
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 4 A8 8 0 0 1 20 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="12" x2="12" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  `,
  holder: `
    <rect x="7" y="3" width="10" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" stroke-width="1.5"/>
    <path d="M9 17 L9 21 M15 17 L15 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="12" cy="6.5" r="1.5" fill="currentColor" opacity="0.6"/>
  `,
  plate: `
    <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="6" y="7" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
  `,
  accessories: `
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,
  board: `
    <rect x="2" y="6" width="20" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="5" y="9" width="4" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <rect x="10" y="9" width="4" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <rect x="15" y="9" width="4" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <line x1="5" y1="15" x2="19" y2="15" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
  `,
  light: `
    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 0 1 6 9a6 6 0 0 1 6-6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 6v3M10 8h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  `,
  fan: `
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <path d="M12 10 C10 7 7 7 7 10 C7 13 12 12 12 10Z" fill="currentColor" opacity="0.7"/>
    <path d="M14 12 C17 10 17 7 14 7 C11 7 12 12 14 12Z" fill="currentColor" opacity="0.7"/>
    <path d="M12 14 C14 17 17 17 17 14 C17 11 12 12 12 14Z" fill="currentColor" opacity="0.7"/>
    <path d="M10 12 C7 14 7 17 10 17 C13 17 12 12 10 12Z" fill="currentColor" opacity="0.7"/>
  `,
  mcb: `
    <rect x="6" y="2" width="12" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="9" y="5" width="6" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
  `,
  wire: `
    <path d="M3 12 C3 12 6 6 9 12 C12 18 15 6 18 12 C21 18 21 12 21 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  pipe: `
    <rect x="2" y="9" width="20" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1" stroke-dasharray="3,3"/>
  `,
  box: `
    <path d="M12 3L22 8.5V15.5L12 21L2 15.5V8.5L12 3Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="2" y1="8.5" x2="22" y2="8.5" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
  `,
  default: `
    <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  `,
};

export function getMaterialIcon(
  key: string,
  size = 24,
  color = "currentColor"
): string {
  const paths = svgPaths[key] || svgPaths.default;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" color="${color}">${paths}</svg>`;
}

// React component for use in JSX

export function MaterialIcon({
  iconKey,
  size = 28,
  color = "#142B4A",
  className,
}: {
  iconKey: string;
  size?: number;
  color?: string;
  className?: string;
}): React.ReactElement {
  const paths = svgPaths[iconKey] || svgPaths.default;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
      className={className}
      aria-hidden="true"
    >
      <g dangerouslySetInnerHTML={{ __html: paths }} />
    </svg>
  );
}
