export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  css: string;
}

export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimalist Clean',
    description: 'Ultra-clean layout with Inter font and spacious margins.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
      body { font-family: 'Inter', sans-serif; line-height: 1.7; color: #1a1a1a; padding: 25mm; max-width: 100%; }
      h1 { font-size: 2.5em; margin-bottom: 0.5em; color: #000; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }
      h2 { font-size: 1.8em; margin-top: 1.5em; color: #333; }
      p { margin-bottom: 1.2em; text-align: justify; }
      code { background: #f5f5f5; padding: 3px 6px; border-radius: 6px; font-family: monospace; font-size: 0.9em; }
      pre { background: #1a1a1a; color: #fff; padding: 20px; border-radius: 12px; overflow-x: auto; font-size: 0.85em; margin: 2em 0; }
    `
  },
  {
    id: 'academic',
    name: 'Academic Journal',
    description: 'Serif fonts, justified text, and formal structure.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
      body { font-family: 'Lora', serif; line-height: 1.5; padding: 30mm; text-align: justify; color: #333; }
      h1 { text-align: center; font-variant: small-caps; font-size: 2.2em; margin-bottom: 2em; }
      h2 { border-bottom: 0.8pt solid #000; margin-top: 1.5em; font-size: 1.4em; }
      blockquote { font-style: italic; margin: 2em; color: #555; }
    `
  },
  {
    id: 'technical',
    name: 'Tech Blue Doc',
    description: 'Modern technical look with brand blue accents.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Outfit:wght@400;700&display=swap');
      body { font-family: 'Outfit', sans-serif; padding: 20mm; color: #1e293b; line-height: 1.6; }
      h1, h2, h3 { color: #2563eb; font-weight: 700; }
      h1 { border-left: 8px solid #2563eb; padding-left: 20px; font-size: 2.4em; margin-bottom: 1em; }
      code, pre { font-family: 'JetBrains Mono', monospace; }
      pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
      blockquote { border-left: 4px solid #cbd5e1; padding-left: 1rem; color: #64748b; font-style: italic; }
    `
  },
  {
    id: 'brutalist',
    name: 'Neo Brutalist',
    description: 'Bold typography, thick borders, and high contrast.',
    css: `
      body { font-family: 'Helvetica Black', 'Arial Black', sans-serif; padding: 20mm; background: #fff; color: #000; }
      h1 { text-transform: uppercase; font-size: 4em; line-height: 0.8; margin-bottom: 0.5em; -webkit-text-stroke: 2px #000; color: transparent; }
      h2 { background: #000; color: #fff; padding: 5px 15px; display: inline-block; margin-top: 2em; }
      pre { border: 4px solid #000; padding: 20px; box-shadow: 10px 10px 0px #000; font-weight: bold; }
    `
  },
  {
    id: 'midnight',
    name: 'Midnight Reader',
    description: 'Elegant dark mode for digital consumption.',
    css: `
      body { background: #0f172a; color: #f1f5f9; font-family: 'Inter', sans-serif; padding: 25mm; line-height: 1.8; }
      h1, h2 { color: #38bdf8; letter-spacing: -0.02em; }
      h1 { font-size: 3em; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
      pre { background: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 10px; }
      code { color: #f472b6; background: rgba(244, 114, 182, 0.1); padding: 2px 5px; border-radius: 4px; }
    `
  },
  {
    id: 'magazine',
    name: 'Editorial Mag',
    description: 'Magazine style with vertical headers and dual column.',
    css: `
      body { font-family: 'Playfair Display', serif; color: #1a1a1a; padding: 30mm; line-height: 1.4; }
      h1 { font-size: 5em; font-weight: 900; line-height: 0.9; margin-bottom: 1em; text-transform: lowercase; }
      h2 { font-family: sans-serif; text-transform: uppercase; letter-spacing: 4px; font-size: 0.9em; color: #888; }
      p { column-count: 2; column-gap: 30px; widows: 3; orphans: 3; }
    `
  },
  {
    id: 'swiss',
    name: 'Swiss Modern',
    description: 'Helvetica-focused, grid-based aesthetic.',
    css: `
      body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20mm; color: #333; }
      h1 { font-size: 60px; font-weight: 900; letter-spacing: -3px; line-height: 1; margin: 0 0 40px 0; }
      h2 { font-size: 24px; font-weight: 700; border-top: 4px solid #000; padding-top: 10px; margin-top: 50px; }
      p { font-size: 14px; width: 60%; }
    `
  },
  {
    id: 'vintage',
    name: 'Vintage Scroll',
    description: 'Warm tones, classic serif, and parchment feel.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');
      body { background-color: #fcf6e8; font-family: 'EB Garamond', serif; padding: 30mm; color: #433e37; line-height: 1.6; }
      h1 { color: #7c2d12; border-bottom: 1px solid #7c2d12; font-style: italic; text-align: center; font-size: 2.5em; }
      blockquote { border: 1px solid #d4d4d4; padding: 20px; font-style: italic; background: rgba(255,255,255,0.3); }
    `
  },
  {
    id: 'blueprint',
    name: 'Engineering Print',
    description: 'White lines on a distinctive blueprint blue.',
    css: `
      body { background: #0047ab; color: #fff; font-family: 'Courier Prime', monospace; padding: 20mm; }
      h1 { border: 2px solid #fff; padding: 15px; text-transform: uppercase; text-align: center; font-size: 2em; }
      h2 { border-bottom: 1px dashed rgba(255,255,255,0.5); margin-top: 2em; }
      pre { background: rgba(0,0,0,0.2); border: 1px solid #fff; padding: 20px; }
    `
  },
  {
    id: 'terminal',
    name: 'Hacker Console',
    description: 'Green on black, matrix-inspired technical style.',
    css: `
      body { background: #000; color: #00ff00; font-family: 'Monaco', 'Consolas', monospace; padding: 20mm; }
      h1::before { content: "> "; }
      h1 { font-size: 1.8em; border-bottom: 1px solid #00ff00; }
      pre { border-left: 4px solid #00ff00; padding-left: 20px; background: #050505; }
      code { color: #fff; background: #333; }
    `
  },
  {
    id: 'pastel',
    name: 'Pastel Dreams',
    description: 'Soft purples and rounded aesthetics.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap');
      body { font-family: 'Quicksand', sans-serif; padding: 25mm; color: #4c1d95; line-height: 1.6; }
      h1 { color: #d946ef; font-size: 3em; text-shadow: 2px 2px #fdf4ff; }
      h2 { color: #8b5cf6; }
      pre { border-radius: 30px; background: #f5f3ff; border: none; padding: 25px; }
    `
  },
  {
    id: 'gothic',
    name: 'Noir Gothic',
    description: 'High drama, deep purples and high-contrast serifs.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;900&display=swap');
      body { background: #000; color: #d1d5db; font-family: 'Cinzel', serif; padding: 30mm; }
      h1 { color: #7e22ce; font-size: 4em; border-bottom: 3px double #7e22ce; text-align: center; }
      blockquote { border-right: 4px solid #7e22ce; border-left: none; padding: 20px; text-align: right; font-style: italic; }
    `
  },
  {
    id: 'eco',
    name: 'Eco Forest',
    description: 'Natural greens and sustainable vibe.',
    css: `
      body { background: #f0fdf4; color: #166534; font-family: 'Helvetica', sans-serif; padding: 25mm; }
      h1 { color: #14532d; border-bottom: 4px solid #4ade80; }
      pre { background: #dcfce7; border-radius: 12px; color: #14532d; }
    `
  },
  {
    id: 'neon',
    name: 'Cyberpunk Neon',
    description: 'Vibrant pinks and cyans on deep black.',
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;700&display=swap');
      body { background: #0b0213; color: #fff; font-family: 'Space Grotesk', sans-serif; padding: 20mm; }
      h1 { color: #ff00ff; text-shadow: 0 0 10px #ff00ff; border: 1px solid #00ffff; padding: 10px; }
      pre { border: 1px solid #ff00ff; box-shadow: 0 0 15px rgba(255, 0, 255, 0.3); }
    `
  },
  {
    id: 'resume',
    name: 'Expert CV',
    description: 'Structured for resumes and professional bios.',
    css: `
      body { font-family: 'Helvetica', sans-serif; padding: 15mm; color: #333; line-height: 1.4; }
      h1 { font-size: 28px; margin: 0; color: #1a1a1a; }
      h2 { font-size: 16px; text-transform: uppercase; color: #2563eb; border-bottom: 1px solid #e5e7eb; margin-top: 15px; }
      p { font-size: 11px; margin-bottom: 8px; }
    `
  },
  {
    id: 'legal',
    name: 'Legal Brief',
    description: 'Double spaced with line numbering support.',
    css: `
      body { font-family: 'Times New Roman', serif; padding: 1in; line-height: 2; }
      h1 { text-align: center; text-decoration: underline; font-size: 14pt; }
      h2 { font-size: 12pt; text-transform: uppercase; }
      p { margin-bottom: 2em; }
    `
  },
  {
    id: 'book',
    name: 'Fiction Novel',
    description: 'Classic book layout with indented paragraphs.',
    css: `
      body { font-family: 'Georgia', serif; padding: 40mm; line-height: 1.6; font-size: 11pt; }
      h1 { text-align: center; margin-bottom: 3em; font-weight: normal; }
      p { margin: 0; text-indent: 1.5em; }
      p:first-of-type { text-indent: 0; }
    `
  },
  {
    id: 'presentation',
    name: 'Pitch Deck',
    description: 'Landscape-optimized with huge headlines.',
    css: `
      @page { size: landscape; }
      body { font-family: 'Helvetica', sans-serif; padding: 20mm; background: #fff; }
      h1 { font-size: 80px; font-weight: 900; color: #2563eb; margin: 100px 0; text-align: center; }
      h2 { font-size: 40px; border-bottom: 10px solid #2563eb; }
    `
  },
  {
    id: 'manifesto',
    name: 'Bold Manifesto',
    description: 'Radical, oversized serif headings.',
    css: `
      body { font-family: 'Georgia', serif; padding: 30mm; color: #111; }
      h1 { font-size: 6em; font-weight: 900; line-height: 0.8; letter-spacing: -4px; margin-bottom: 0.5em; }
      p { font-size: 1.5em; line-height: 1.2; text-align: justify; }
    `
  },
  {
    id: 'standard',
    name: 'Standard Office',
    description: 'The ubiquitous corporate appearance.',
    css: `
      body { font-family: 'Calibri', 'Arial', sans-serif; padding: 20mm; color: #000; }
      h1 { color: #2b579a; font-size: 24pt; font-weight: normal; }
      h2 { color: #2b579a; font-size: 18pt; border-bottom: 1px solid #2b579a; }
    `
  }
];
