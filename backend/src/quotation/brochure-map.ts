export interface BrochureMapping {
  patterns: string[];
  url: string;
}

export const BROCHURE_MAPPINGS: BrochureMapping[] = [
  {
    patterns: ['v-cross', 'vcross', 'v cross', 'v-cross 4x4', 'v-cross 4x2'],
    url: 'https://assets.contentstack.io/v3/assets/blt04fb7dc282801dd0/bltb3c0cc339be4b01a/v-cross-brochure-2025.pdf',
  },
  {
    patterns: ['d-max', 'dmax', 'd max', 'd-max hi-lander', 'hi-lander'],
    url: 'https://example.com/brochures/d-max.pdf',
  },
  {
    patterns: ['x-series', 'x series', 'xseries'],
    url: 'https://example.com/brochures/x-series.pdf',
  },
  {
    patterns: ['mu-x', 'mux', 'mu x'],
    url: 'https://example.com/brochures/mu-x.pdf',
  },
];

// Optional: allow runtime extensions via process.env.BROCHURE_EXTRA (JSON string)
try {
  const extra = process.env.BROCHURE_EXTRA;
  if (extra) {
    const arr = JSON.parse(extra);
    if (Array.isArray(arr)) {
      for (const m of arr) {
        if (m && Array.isArray(m.patterns) && typeof m.url === 'string') {
          BROCHURE_MAPPINGS.push({
            patterns: m.patterns.map((p: string) => p.toLowerCase()),
            url: m.url,
          });
        }
      }
    }
  }
} catch {}
