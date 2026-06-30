import puppeteer from "puppeteer";

export async function generatePdfFromHtml(html: string): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
    });

    await page.waitForNetworkIdle();

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });
  } finally {
    await browser.close();
  }
}

export function buildReportHtml(params: {
  title: string;
  orgName: string;
  generatedAt: string;
  sections: { heading: string; content: string }[];
}): string {
  const { title, orgName, generatedAt, sections } = params;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #111827; font-size: 13px; line-height: 1.6; }
    .header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f9fafb; border: 1px solid #e5e7eb; padding: 7px 10px; text-align: left; font-weight: 600; color: #374151; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    td { border: 1px solid #e5e7eb; padding: 7px 10px; color: #374151; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .badge { display: inline-block; padding: 1px 7px; font-size: 10px; font-weight: 600; border: 1px solid; }
    .badge-critical { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
    .badge-high { background: #fff7ed; border-color: #fdba74; color: #ea580c; }
    .badge-medium { background: #fffbeb; border-color: #fcd34d; color: #d97706; }
    .badge-low { background: #f0fdf4; border-color: #86efac; color: #16a34a; }
    .badge-open { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
    .badge-closed { background: #f9fafb; border-color: #e5e7eb; color: #6b7280; }
    .badge-resolved { background: #f0fdf4; border-color: #86efac; color: #16a34a; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-box { border: 1px solid #e5e7eb; padding: 12px; }
    .stat-box .label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; }
    .stat-box .value { font-size: 26px; font-weight: 700; color: #111827; margin-top: 2px; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 10px; color: #9ca3af; margin-top: 32px; }
    p { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <h1>${title}</h1>
        <div class="meta">${orgName} · Generated ${generatedAt}</div>
      </div>
      <div style="font-size:18px; font-weight:800; letter-spacing:-0.03em;">AuditFlow</div>
    </div>
  </div>

  ${sections
    .map(
      (s) => `
    <div class="section">
      <h2>${s.heading}</h2>
      ${s.content}
    </div>
  `,
    )
    .join("")}

  <div class="footer">
    Confidential — ${orgName} · AuditFlow Enterprise Compliance Platform · ${generatedAt}
  </div>
</body>
</html>`;
}
