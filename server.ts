import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import { marked } from "marked";
import fs from "fs";
import { fileURLToPath } from "url";
import JSZip from "jszip";
import { generatePdf } from "./src/services/pdfService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
app.post("/api/convert", async (req, res) => {
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

app.post("/api/convert-batch", async (req, res) => {
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
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  setupVite().then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
