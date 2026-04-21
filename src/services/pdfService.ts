import { jsPDF } from 'jspdf';
import { convert } from 'html-to-text';

export async function generatePdf(html: string, options: any = {}) {
  // Convert HTML to simple text format
  const text = convert(html, {
    wordwrap: 100, // Wrap at approximately 100 characters per line
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }
    ]
  });

  // Create document
  const format = options.format === 'Letter' ? 'letter' : 'a4';
  const doc = new jsPDF({
    format: format,
    unit: 'mm',
  });

  // Calculate generic text dimensions
  const lines = doc.splitTextToSize(text, 180); // Width of content area (A4 is 210mm wide)
  let y = 15; // Top margin
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 7;

  // Render text to pages
  for (let i = 0; i < lines.length; i++) {
    if (y > pageHeight - 15) {
      doc.addPage();
      y = 15;
    }
    doc.text(lines[i], 15, y);
    y += lineHeight;
  }

  // Generate binary Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
