import express, { Request, Response } from 'express';
import cors from 'cors';
import { marked } from 'marked';
import JSZip from 'jszip';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

async function generatePdf(html: string, options: any = {}) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless as any,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
}

function wrapHtml(content: string, css = '') {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.5; padding: 20px; }
    ${css}
  </style></head><body>${content}</body></html>`;
}

app.post('/api/convert', async (req: Request, res: Response) => {
  try {
    const { markdown, config = {}, outputFormat = 'pdf', customCss = '', watermark = '' } = req.body;
    if (!markdown) return res.status(400).json({ error: 'Markdown content is required' });

    const htmlContent = marked.parse(markdown) as string;
    let finalCss = customCss;
    if (watermark) {
      finalCss += `body::after { content: "${watermark}"; position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px;
        color: rgba(0,0,0,0.1); z-index: 9999; pointer-events: none; white-space: nowrap; }`;
    }

    const fullHtml = wrapHtml(htmlContent, finalCss);
    if (outputFormat === 'html') {
      res.setHeader('Content-Type', 'text/html');
      return res.send(fullHtml);
    }

    const pdfBuffer = await generatePdf(fullHtml, {
      format: config.paperSize || 'A4',
      margin: config.margins || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="converted-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

app.post('/api/convert-batch', async (req: Request, res: Response) => {
  try {
    const { items, globalConfig = {} } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array is required' });

    const zip = new JSZip();
    for (const item of items) {
      const config = { ...globalConfig, ...item.config };
      const fullHtml = wrapHtml(marked.parse(item.markdown) as string, config.customCss || '');
      const pdfBuffer = await generatePdf(fullHtml, {
        format: config.paperSize || 'A4',
        margin: config.margins || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      });
      zip.file(`${item.name || 'document'}.pdf`, pdfBuffer);
    }

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=converted-batch.zip');
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Batch conversion failed: ' + error.message });
  }
});

app.get('/api/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

export default app;
