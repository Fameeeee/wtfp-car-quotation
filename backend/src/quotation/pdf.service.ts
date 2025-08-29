import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import { QuotationService } from './quotation.service';

type QuotationData = any;

@Injectable()
export class PdfService {
  constructor(private readonly quotationService: QuotationService) {}

  async generateById(
    id: number,
    opts?: { preview?: boolean },
  ): Promise<Buffer> {
    const data = await this.quotationService.findById(id);
    if (!data) throw new NotFoundException('Quotation not found');
    const html = await this.buildHtml(data, opts);
    return this.renderPdf(html, opts);
  }

  async generateFromData(
    data: QuotationData,
    opts?: { preview?: boolean },
  ): Promise<Buffer> {
    const html = await this.buildHtml(data, opts);
    return this.renderPdf(html, opts);
  }

  private async renderPdf(
    html: string,
    opts?: { preview?: boolean },
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
        // In preview mode, force single page; otherwise allow multi-page output
        pageRanges: opts?.preview ? '1' : undefined,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private loadLogoBase64(): string {
    const candidates = [
      // when compiled to dist
      path.resolve(
        __dirname,
        '../../../frontend/public/assets/isuzu-quotation-logo.png',
      ),
      // when running ts-node
      path.resolve(
        __dirname,
        '../../frontend/public/assets/isuzu-quotation-logo.png',
      ),
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const b = fs.readFileSync(p);
          return `data:image/png;base64,${b.toString('base64')}`;
        }
      } catch {}
    }
    return '';
  }

  private thFormatNumber(n?: number | null): string {
    const num = Number(n ?? 0);
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString('th-TH');
  }

  private thBaht(n?: number | null): string {
    return `${this.thFormatNumber(n)} ฿`;
  }

  // Map model names to brochure URLs (extend as needed)
  private createBrochureUrl(modelGName?: string | null): string | null {
    const name = (modelGName || '').toString().toLowerCase();
    // Example mapping: V-CROSS brochure
    if (
      name.includes('v-cross') ||
      name.includes('vcross') ||
      name.includes('v cross')
    ) {
      return 'https://assets.contentstack.io/v3/assets/blt04fb7dc282801dd0/bltb3c0cc339be4b01a/v-cross-brochure-2025.pdf';
    }
    return null;
  }

  // Build a QR as data URL for the given link using local generation
  private async getQrDataUrl(url: string, size = 120): Promise<string> {
    const s = Math.max(80, Math.min(240, size));
    try {
      return await QRCode.toDataURL(url, { width: s, margin: 1 });
    } catch {
      return '';
    }
  }

  private async buildHtml(
    data: QuotationData,
    opts?: { preview?: boolean },
  ): Promise<string> {
    const isPreview = !!opts?.preview;
    const logo = this.loadLogoBase64();
  const isSaved = !!(data && data.id);
  const showWatermark = isPreview || !isSaved;
    const date = new Date(
      data?.quotationDate ? data.quotationDate : Date.now(),
    ).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const docNo = data?.id
      ? `NO.${String(data.id).padStart(8, '0')}`
      : 'NO.XXXXXXXX';

    const car = data?.carDetails || {};
    const customer = data?.customer || {};
    const staff = data?.staff || {};
    const acc: Array<{ assName?: string; name?: string; price?: number }> =
      (data?.accessories || []).map((a: any) => ({
        name: a.assName,
        price: a.price,
      })) || [];

    const add = data?.additionCosts || {};
    const paymentMethod = data?.paymentMethod || '';
    const isCash = paymentMethod === 'cash' && data?.cashPlans;
    const isInstallment =
      paymentMethod === 'installment' && data?.installmentPlans;

    // Accessories 2 columns (1..10 | 11..20)
    const extras: string[] = [];
    if (add?.cmi) extras.push('พรบ.');
    if (add?.insurance) extras.push('ประกันภัย');
    if (add?.fuelValue) extras.push(`ค่าน้ำมัน ${this.thBaht(add.fuelValue)}`);
    const accNames = acc.map((x) => x.name).filter(Boolean) as string[];
    const fullList = [...extras, ...accNames];
    const totalItems = fullList.length;
    // For preview, cap to 20 items (10 rows x 2 cols) and show "+N more"
    const PREVIEW_MAX_ITEMS = 20;
    const cappedList = isPreview
      ? fullList.slice(0, PREVIEW_MAX_ITEMS)
      : fullList;
    const overflowCount = Math.max(totalItems - cappedList.length, 0);
    const rows = Math.ceil(cappedList.length / 2);
    const left = cappedList.slice(0, rows);
    const right = cappedList.slice(rows);

    const cash = data?.cashPlans || {};
  const instAll = (data?.installmentPlans || []) as any[];
  // Always show all installment orders in the table
  const inst = instAll;

    // Format notes into a clean bullet list; bold topic before ':'
    // Accept various payload field names from different flows
    const noteSource =
      add?.note ?? add?.noteText ?? add?.note_extra ?? add?.noteExtra ?? '';
    const noteRaw = (noteSource ?? '').toString();
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const noteLines = noteRaw
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);
    // Cap notes to avoid oversized box in PDF
    const MAX_NOTE_LINES = 5;
    const MAX_NOTE_LINE_CHARS = 120;
    const clippedLines = noteLines
      .slice(0, MAX_NOTE_LINES)
      .map((line: string) =>
        line.length > MAX_NOTE_LINE_CHARS
          ? line.slice(0, MAX_NOTE_LINE_CHARS - 1) + '…'
          : line,
      );
    let noteItems = clippedLines
      .map((line: string) => {
        if (line.includes(':')) {
          const [head, ...rest] = line.split(':');
          const tail = rest.join(':').trim();
          return `<li><span class=\"note-head\">${escapeHtml(head)}:</span> ${escapeHtml(tail)}</li>`;
        }
        return `<li>${escapeHtml(line)}</li>`;
      })
      .join('');
  if (!noteItems) {
      noteItems = '<li class="muted">-</li>';
    }

  // Determine if there's content after the first page in full mode
  const hasSubsequent = !isPreview && (isCash || isInstallment || totalItems > 0 || clippedLines.length > 0);

    // QR for brochure (right-side of car details)
    const brochureUrl = this.createBrochureUrl(car?.modelGName);
    const brochureQr = brochureUrl
      ? await this.getQrDataUrl(brochureUrl, 100)
      : null;

    // HTML
    return `
<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
  @page { size: A4; margin: 15mm; }
  body { font-family: 'Sarabun', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #111; font-size: 12px; }
      .header { display:flex; align-items:center; justify-content:space-between; }
      .doc-title { text-align:center; font-size: 22px; font-weight: 700; letter-spacing: .2px; margin: 8px 0 6px; }
      .section-title { font-size: 14px; font-weight: 600; margin: 12px 0 6px; }
      .muted { color:#666; font-size: 12px; }
      .row { display:flex; gap: 12px; align-items:flex-start; }
      .col { flex:1; }
  /* Car details layout: photo | info | QR */
  .car-section { display:flex; gap: 16px; align-items:flex-start; }
  .car-photo { width:120px; height:120px; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; background:#fafafa; font-size:12px; color:#999; border-radius:4px; }
  .car-photo img { width:100%; height:100%; object-fit:contain }
  .car-info { flex:1; font-size:13px; line-height:1.45; display:grid; grid-template-columns: 1fr; row-gap: 6px; }
  .qr-block { width: 100px; text-align:center; display:flex; flex-direction:column; align-items:center; }
  .qr-box { width:100px; height:100px; border:1px solid #e5e7eb; padding:3px; border-radius:4px; display:flex; align-items:center; justify-content:center; background:#fff; }
  .qr-img { width:100%; height:100%; object-fit:contain; }
  .qr-title { font-size: 12px; font-weight: 600; margin-top: 6px; }
  table { width:100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ddd; padding: 4px; text-align: center; vertical-align: middle; }
  th { background:#f3f4f6; font-weight:600; }
      .section { margin-top: 12px; }
      .u { text-decoration: underline; }
  .note-box { border: 1px solid #e5e7eb; background: #fafafa; border-radius: 4px; padding: 8px 10px; max-height: 60mm; overflow: hidden; margin-bottom: 6mm; }
  .note-list { margin: 0; padding-left: 16px; line-height: 1.55; overflow: hidden; word-wrap: break-word; }
      .note-head { font-weight: 600; }
  /* First-page wrapper fixed to page height; reserves space for footer; forces next content to new page in full */
  .first-page { position: relative; height: calc(297mm - 30mm); box-sizing: border-box; padding-bottom: 36mm; page-break-after: ${hasSubsequent ? 'always' : 'avoid'}; overflow: hidden; z-index: 1; }
  /* Footer pinned bottom-right on the first page in all modes */
  .footer { position: absolute; bottom: 10mm; right: 0; font-size: 12px; line-height: 1.12; text-align: right; break-inside: avoid-page; page-break-inside: avoid; }
  /* Subsequent content container sits above watermark */
  .content { position: relative; z-index: 1; }
  /* Global watermark across pages */
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); color: #111; opacity: 0.06; font-size: 90px; font-weight: 700; letter-spacing: 2px; white-space: nowrap; pointer-events: none; }
  /* Keep the phone line on one line */
  .footer > div > div:last-child { white-space: nowrap; }
  /* Reduce risk of table rows forcing a page break mid-row */
  table { page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { break-inside: avoid-page; page-break-inside: avoid; }
      .logo { height: 40px; }
    </style>
  </head>
  <body>
  ${showWatermark ? '<div class="watermark">ตัวอย่างใบเสนอราคา</div>' : ''}
    <div class="first-page">
  <div class="header">
      <div>
        <div style="font-weight:700">บริษัท อีซูซุเชียงราย จำกัด</div>
        <div class="muted">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000 โทร.053-711605</div>
        <div class="muted">วันที่ ${date}</div>
      </div>
      <div style="text-align:right">
        ${logo ? `<img class="logo" src="${logo}" />` : ''}
        <div class="muted" style="margin-top:4px">${docNo}</div>
      </div>
    </div>

  <div class="doc-title">ใบเสนอราคา</div>
  <div class="section" style="font-size:13px">เรียน ${customer?.firstName ?? ''} ${customer?.lastName ?? ''}</div>

    <div class="section car-section">
      <div class="car-photo">
        ${car?.imageUrl ? `<img src="${car.imageUrl}" />` : 'รูปภาพรถ'}
      </div>
      <div class="car-info">
        <div><strong>รุ่นปีรถ:</strong> ${car?.modelClass ?? ''}</div>
        <div><strong>รุ่นรถ:</strong> ${car?.modelGName ?? ''}</div>
        <div><strong>สีตัวถัง:</strong> ${car?.color ?? ''}</div>
        <div><strong>แรงม้า:</strong> ${car?.horsepower ? `${car.horsepower} แรงม้า` : '190 แรงม้า'}</div>
        <div><strong>แรงบิด:</strong> ${car?.torque ? `${car.torque} นิวตัน-เมตร` : '450 นิวตัน-เมตร'}</div>
      </div>
      <div class="qr-block">
        <div class="qr-box">
          ${brochureQr ? `<img class="qr-img" src="${brochureQr}" />` : `<div class="muted">ไม่มีข้อมูล</div>`}
        </div>
        <div class="qr-title">รายละเอียดเพิ่มเติม</div>
      </div>
    </div>
    <div class="section"><span class="u">เงื่อนไขการชำระ : ${paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'installment' ? 'ผ่อนชำระ' : ''}</span></div>

    ${
      isPreview
        ? `
    ${
      isCash
        ? `
    <div class="section">
      <table>
        <thead><tr><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th></tr></thead>
        <tbody>
          <tr>
            <td>${this.thBaht(cash?.specialDiscount)}</td>
            <td>${this.thBaht(cash?.specialAddition)}</td>
            <td>${this.thBaht(cash?.totalPrice)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      isInstallment
        ? `
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th><th>ราคารถ</th><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th><th>เงินดาวน์</th><th>จำนวนเดือน</th><th>ดอกเบี้ย</th><th>ค่างวด/เดือน</th>
          </tr>
        </thead>
        <tbody>
          ${inst
            .map((order: any) => {
              const net =
                (car?.price ?? 0) -
                (order?.specialDiscount ?? 0) +
                (order?.additionPrice ?? 0);
              const down = Math.round(
                ((order?.downPaymentPercent ?? 0) / 100) * net,
              );
              const allPlans: any[] = order?.planDetails || [];
              const plans: any[] = allPlans.filter(
                (p: any) =>
                  p != null &&
                  p.interestRate !== null &&
                  p.interestRate !== undefined &&
                  `${p.interestRate}` !== '',
              );
              const rowSpan = Math.max(plans.length, 1);

              if (plans.length === 0) {
                return `<tr>
                  <td rowspan="1">${order?.orderNumber ?? ''}</td>
                  <td rowspan="1">${this.thBaht(car?.price)}</td>
                  <td rowspan="1">${this.thBaht(order?.specialDiscount)}</td>
                  <td rowspan="1">${this.thBaht(order?.additionPrice)}</td>
                  <td rowspan="1">${this.thBaht(net)}</td>
                  <td rowspan="1">${this.thBaht(down)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>`;
              }

              const rows = plans
                .map((p: any, i: number) => {
                  const rateVal = p?.interestRate;
                  const periodVal = p?.period;
                  const loan = net - down;
                  let monthly: number | null = null;
                  if (
                    rateVal != null &&
                    periodVal != null &&
                    Number(periodVal) > 0
                  ) {
                    const rate = Number(rateVal);
                    const period = Number(periodVal);
                    if (rate === 0) {
                      monthly = Math.round(loan / period);
                    } else {
                      const monthlyRate = rate / 100 / 12;
                      const f = Math.pow(1 + monthlyRate, period);
                      monthly = Math.round(
                        loan * ((monthlyRate * f) / (f - 1)),
                      );
                    }
                  }

                  if (i === 0) {
                    return `<tr>
                    <td rowspan="${rowSpan}">${order?.orderNumber ?? ''}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(car?.price)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(order?.specialDiscount)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(order?.additionPrice)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(net)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(down)}</td>
                    <td>${periodVal ?? '-'}</td>
                    <td>${rateVal == null ? '-' : rateVal + '%'}</td>
                    <td>${monthly == null ? '-' : this.thBaht(monthly)}</td>
                  </tr>`;
                  }

                  return `<tr>
                  <td>${periodVal ?? '-'}</td>
                  <td>${rateVal == null ? '-' : rateVal + '%'}</td>
                  <td>${monthly == null ? '-' : this.thBaht(monthly)}</td>
                </tr>`;
                })
                .join('');

              return rows;
            })
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

  <div class="section-title">อุปกรณ์ตกแต่ง</div>
    <div class="section">
      <table>
        <colgroup>
          <col style="width:8%"/>
          <col style="width:42%"/>
          <col style="width:8%"/>
          <col style="width:42%"/>
        </colgroup>
        <thead>
          <tr><th>ลำดับ</th><th>รายการ</th><th>ลำดับ</th><th>รายการ</th></tr>
        </thead>
        <tbody>
          ${Array.from({ length: rows })
            .map((_, i) => {
              const l = left[i] ?? '';
              const r = right[i] ?? '';
              const lNo = l ? i + 1 : '';
              const rNo = r ? i + rows + 1 : '';
              return `<tr><td>${lNo}</td><td style="text-align:left">${l}</td><td>${rNo}</td><td style="text-align:left">${r}</td></tr>`;
            })
            .join('')}
          ${overflowCount > 0 ? `<tr><td colspan="4" style="text-align:center; color:#666">เพิ่มเติมอีก ${overflowCount} รายการ…</td></tr>` : ''}
        </tbody>
      </table>
    </div>

  <div class="section-title">หมายเหตุ</div>
  <div class="note-box">
    <ul class="note-list">${noteItems}</ul>
  </div>
    `
        : ''
    }


  <!-- Subsequent content flows after first page in full mode -->
  <div class="content">
  ${
    !isPreview && isCash
      ? `
    <div class="section">
      <table>
        <thead><tr><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th></tr></thead>
        <tbody>
          <tr>
            <td>${this.thBaht(cash?.specialDiscount)}</td>
            <td>${this.thBaht(cash?.specialAddition)}</td>
            <td>${this.thBaht(cash?.totalPrice)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
    : ''
  }

    ${
      !isPreview && isInstallment
        ? `
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th><th>ราคารถ</th><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th><th>เงินดาวน์</th><th>จำนวนเดือน</th><th>ดอกเบี้ย</th><th>ค่างวด/เดือน</th>
          </tr>
        </thead>
        <tbody>
          ${inst
            .map((order: any) => {
              const net =
                (car?.price ?? 0) -
                (order?.specialDiscount ?? 0) +
                (order?.additionPrice ?? 0);
              const down = Math.round(
                ((order?.downPaymentPercent ?? 0) / 100) * net,
              );
              const allPlans: any[] = order?.planDetails || [];
              const plans: any[] = allPlans.filter(
                (p: any) =>
                  p != null &&
                  p.interestRate !== null &&
                  p.interestRate !== undefined &&
                  `${p.interestRate}` !== '',
              );
              const rowSpan = Math.max(plans.length, 1);

              if (plans.length === 0) {
                return `<tr>
                  <td rowspan="1">${order?.orderNumber ?? ''}</td>
                  <td rowspan="1">${this.thBaht(car?.price)}</td>
                  <td rowspan="1">${this.thBaht(order?.specialDiscount)}</td>
                  <td rowspan="1">${this.thBaht(order?.additionPrice)}</td>
                  <td rowspan="1">${this.thBaht(net)}</td>
                  <td rowspan="1">${this.thBaht(down)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>`;
              }

              const rows = plans
                .map((p: any, i: number) => {
                  const rateVal = p?.interestRate;
                  const periodVal = p?.period;
                  const loan = net - down;
                  let monthly: number | null = null;
                  if (
                    rateVal != null &&
                    periodVal != null &&
                    Number(periodVal) > 0
                  ) {
                    const rate = Number(rateVal);
                    const period = Number(periodVal);
                    if (rate === 0) {
                      monthly = Math.round(loan / period);
                    } else {
                      const monthlyRate = rate / 100 / 12;
                      const f = Math.pow(1 + monthlyRate, period);
                      monthly = Math.round(
                        loan * ((monthlyRate * f) / (f - 1)),
                      );
                    }
                  }

                  if (i === 0) {
                    return `<tr>
                    <td rowspan="${rowSpan}">${order?.orderNumber ?? ''}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(car?.price)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(order?.specialDiscount)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(order?.additionPrice)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(net)}</td>
                    <td rowspan="${rowSpan}">${this.thBaht(down)}</td>
                    <td>${periodVal ?? '-'}</td>
                    <td>${rateVal == null ? '-' : rateVal + '%'}</td>
                    <td>${monthly == null ? '-' : this.thBaht(monthly)}</td>
                  </tr>`;
                  }

                  return `<tr>
                  <td>${periodVal ?? '-'}</td>
                  <td>${rateVal == null ? '-' : rateVal + '%'}</td>
                  <td>${monthly == null ? '-' : this.thBaht(monthly)}</td>
                </tr>`;
                })
                .join('');

              return rows;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `
    : ''
    }

  ${
    !isPreview
      ? `
  <div class="section-title">อุปกรณ์ตกแต่ง</div>
    <div class="section">
      <table>
        <colgroup>
          <col style="width:8%"/>
          <col style="width:42%"/>
          <col style="width:8%"/>
          <col style="width:42%"/>
        </colgroup>
        <thead>
          <tr><th>ลำดับ</th><th>รายการ</th><th>ลำดับ</th><th>รายการ</th></tr>
        </thead>
        <tbody>
          ${Array.from({ length: rows })
            .map((_, i) => {
              const l = left[i] ?? '';
              const r = right[i] ?? '';
              const lNo = l ? i + 1 : '';
              const rNo = r ? i + rows + 1 : '';
              return `<tr><td>${lNo}</td><td style="text-align:left">${l}</td><td>${rNo}</td><td style="text-align:left">${r}</td></tr>`;
            })
            .join('')}
          ${overflowCount > 0 ? `<tr><td colspan="4" style="text-align:center; color:#666">เพิ่มเติมอีก ${overflowCount} รายการ…</td></tr>` : ''}
        </tbody>
      </table>
    </div>

  <div class="section-title">หมายเหตุ</div>
  <div class="note-box">
    <ul class="note-list">${noteItems}</ul>
  </div>`
      : ''
  }
  </div><!-- /.content -->
    <div class="footer">
      <div>
        <div>ผู้เสนอราคา</div>
        <div>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ')}</div>
        <div>(ที่ปรึกษาการขาย)</div>
        <div>Tel: ${staff?.phoneNumber ?? ''}</div>
      </div>
    </div>
  </div>
  </body>
</html>`;
  }
}
