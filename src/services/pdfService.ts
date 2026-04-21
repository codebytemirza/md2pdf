import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function generatePdf(html: string, options: any = {}) {
  let browser = null;
  
  try {
    const isProd = process.env.NODE_ENV === 'production';
    
    browser = await puppeteer.launch({
      args: isProd ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProd ? await chromium.executablePath() : '/usr/bin/google-chrome',
      headless: chromium.headless as any,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
