import express from "express";
import { marked } from "marked";
import JSZip from "jszip";
import { generatePdf } from "./services/pdfService.js";

const api = express.Router();

// Helper to wrap HTML in basic structure and CSS
function wrapHtml(content: string, css: string = '') {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; line-height: 1.5; padding: 20px; }
          ${css}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

// API Routes
api.post("/convert", async (req, res) => {
  try {
    const { 
      markdown, 
      config = {}, 
      outputFormat = 'pdf',
      customCss = '',
      watermark = ''
    } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: "Markdown content is required" });
    }

    const htmlContent = marked.parse(markdown) as string;
    
    // Merge custom CSS if provided
    let finalCss = customCss;
    if (watermark) {
        finalCss += `
          body::after {
            content: "${watermark}";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0,0,0,0.1);
            z-index: 9999;
            pointer-events: none;
            white-space: nowrap;
          }
        `;
    }

    const fullHtml = wrapHtml(htmlContent, finalCss);

    if (outputFormat === 'html') {
        res.setHeader('Content-Type', 'text/html');
        return res.send(fullHtml);
    }

    // Default PDF using optimized service
    const pdfBuffer = await generatePdf(fullHtml, {
      format: config.paperSize || 'A4',
      margin: config.margins || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="converted-${Date.now()}.pdf"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error("Conversion error:", error);
    res.status(500).json({ error: "Conversion failed: " + error.message });
  }
});

api.post("/convert-batch", async (req, res) => {
  try {
    const { items, globalConfig = {} } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array is required" });
    }

    const zip = new JSZip();

    for (const item of items) {
      const config = { ...globalConfig, ...item.config };
      const htmlContent = marked.parse(item.markdown) as string;
      const fullHtml = wrapHtml(htmlContent, config.customCss || '');
      
      const pdfBuffer = await generatePdf(fullHtml, {
        format: config.paperSize || 'A4',
        margin: config.margins || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });
      
      zip.file(`${item.name || 'document'}.pdf`, pdfBuffer);
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=converted-batch.zip');
    res.send(content);

  } catch (error: any) {
    console.error("Batch conversion error:", error);
    res.status(500).json({ error: "Batch conversion failed: " + error.message });
  }
});

// Health check
api.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default api;
