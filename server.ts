import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import { mdToPdf } from "md-to-pdf";
import fs from "fs";
import { fileURLToPath } from "url";
import JSZip from "jszip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/convert", async (req, res) => {
    try {
      const { 
        markdown, 
        config = {}, 
        outputFormat = 'pdf',
        customCss = '',
        watermark = '',
        signature = '' 
      } = req.body;

      if (!markdown) {
        return res.status(400).json({ error: "Markdown content is required" });
      }

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

      const pdfConfig: any = {
        pdf_options: {
          format: config.paperSize || 'A4',
          margin: config.margins || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
          printBackground: true,
        },
        launch_options: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      };

      if (finalCss) {
        pdfConfig.css = finalCss;
      }

      // md-to-pdf usually handles PDF. For HTML, we can get it from the library too.
      // For JPG/PNG, md-to-pdf doesn't support them directly in the same way, 
      // but we can use puppeteer screenshot if needed. 
      // However, for this implementation, we'll focus on PDF and HTML as core.
      
      const result = await mdToPdf({ content: markdown }, pdfConfig);

      if (!result || !result.content) {
        throw new Error("PDF generation returned empty content");
      }

      if (outputFormat === 'html') {
          res.setHeader('Content-Type', 'text/html');
          return res.send(result.content);
      }

      // Default PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="converted-${Date.now()}.pdf"`);
      res.setHeader('Content-Length', result.content.length);
      res.end(result.content, 'binary');

    } catch (error: any) {
      console.error("Conversion error:", error);
      res.status(500).json({ error: "Conversion failed: " + error.message });
    }
  });

  app.post("/api/convert-batch", async (req, res) => {
    try {
      const { items, globalConfig = {} } = req.body; // Array of { name, markdown, config }
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items array is required" });
      }

      const zip = new JSZip();

      for (const item of items) {
        const config = { ...globalConfig, ...item.config };
        const pdfConfig: any = {
            pdf_options: {
              format: config.paperSize || 'A4',
              margin: config.margins || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
              printBackground: true,
            },
            launch_options: {
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        };

        if (config.customCss) {
            pdfConfig.css = config.customCss;
        }

        const result = await mdToPdf({ content: item.markdown }, pdfConfig);
        zip.file(`${item.name || 'document'}.pdf`, result.content);
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

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
