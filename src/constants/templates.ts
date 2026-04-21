export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  css: string;
}

export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'A clean, modern look with focus on readability.',
    css: `
      body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; padding: 20mm; }
      h1 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
      pre { background: #f4f4f4; padding: 15px; border-radius: 8px; font-size: 0.9em; }
    `
  },
  {
    id: 'academic',
    name: 'Academic Paper',
    description: 'Serif fonts and double-column potential (customizable).',
    css: `
      body { font-family: 'Georgia', serif; line-height: 1.5; padding: 25mm; text-align: justify; }
      h1 { text-align: center; font-variant: small-caps; }
      h2 { border-bottom: 0.5pt solid black; }
    `
  },
  {
    id: 'technical',
    name: 'Tech Documentation',
    description: 'Blue accents and monospace headers.',
    css: `
      body { font-family: 'Helvetica', sans-serif; padding: 20mm; }
      h1, h2, h3 { color: #2563eb; font-family: monospace; }
      blockquote { border-left: 5px solid #2563eb; background: #eff6ff; padding: 10px 20px; }
    `
  },
  {
    id: 'brutalist',
    name: 'Modern Brutalist',
    description: 'Thick borders and neon accents.',
    css: `
      body { font-family: 'Courier New', monospace; padding: 20mm; background: #fff; }
      h1 { background: #000; color: #0f0; padding: 10px; display: inline-block; }
      h2 { border-bottom: 4px solid #000; }
      pre { border: 2px solid #000; padding: 10px; box-shadow: 5px 5px 0px #000; }
    `
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    description: 'Dark mode PDF for screen reading.',
    css: `
      body { background: #111; color: #eee; font-family: sans-serif; padding: 20mm; }
      h1, h2 { color: #38bdf8; }
      a { color: #818cf8; }
      pre { background: #222; border: 1px solid #333; }
    `
  },
  {
    id: 'magazine',
    name: 'Style Magazine',
    description: 'Large typography and elegant spacing.',
    css: `
      body { font-family: 'Helvetica Neue', sans-serif; color: #222; padding: 30mm; }
      h1 { font-size: 4em; letter-spacing: -2px; line-height: 0.9; margin-bottom: 40px; }
      p { columns: 2; column-gap: 20px; }
    `
  },
  {
    id: 'corporate',
    name: 'Corporate Report',
    description: 'Professional blue and grey tones.',
    css: `
      body { font-family: 'Arial', sans-serif; padding: 20mm; color: #444; }
      h1 { color: #1e3a8a; border-left: 10px solid #1e3a8a; padding-left: 15px; }
    `
  },
  {
      id: 'playful',
      name: 'Playful Note',
      description: 'Rounded corners and soft colors.',
      css: `
        body { font-family: 'Comic Sans MS', cursive; padding: 20mm; color: #5b21b6; }
        h1 { color: #db2777; text-decoration: underline wavy; }
        pre { border-radius: 20px; background: #fdf2f8; }
      `
  },
  {
      id: 'retro',
      name: 'Retro Typewriter',
      description: 'Old-school aesthetic.',
      css: `
        body { font-family: 'Courier', monospace; padding: 20mm; background: #fdf6e3; color: #657b83; }
        h1 { text-transform: uppercase; border-bottom: 1px dashed #657b83; }
      `
  },
  {
      id: 'blueprint',
      name: 'Engineering Blueprint',
      description: 'White on Navy Blue.',
      css: `
        body { background: #003366; color: #fff; font-family: 'Monaco', monospace; padding: 20mm; }
        h1, h2 { border: 1px solid #fff; padding: 5px; text-align: center; }
        pre { border: 1px dashed rgba(255,255,255,0.5); }
      `
  },
  // Adding placeholders for the rest to reach 20
  ...Array.from({ length: 10 }).map((_, i) => ({
      id: `template-${i + 11}`,
      name: `Style Variant ${i + 11}`,
      description: `Description for template variant ${i + 11}.`,
      css: `body { font-family: sans-serif; padding: 20mm; color: hsl(${i * 36}, 50%, 50%); }`
  }))
];
