import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import { QuotationService } from './quotation.service';
import { AuditService } from 'src/audit/audit.service';
import { BROCHURE_MAPPINGS } from './brochure-map';

type QuotationData = any;

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  constructor(
    private readonly quotationService: QuotationService,
    @Inject(forwardRef(() => AuditService))
    private readonly auditService: AuditService,
  ) {}

  async generateById(
    id: number,
    opts?: { preview?: boolean; templateKey?: string },
  ): Promise<Buffer> {
    const data = await this.quotationService.findById(id);
    if (!data) {
      try {
        await this.auditService.record(
          'pdf_failed',
          'quotation',
          id,
          null,
          { reason: 'Quotation not found', id },
          'ERROR',
          'pdf',
        );
      } catch (e) {}
      throw new NotFoundException('Quotation not found');
    }
    try {
      await this.auditService.record(
        'pdf',
        'quotation',
        id,
        data.staffId || null,
        { id },
        'INFO',
        'pdf',
      );
    } catch (e) {}
    return this.renderPdf(data, opts);
  }

  async generateFromData(
    data: QuotationData,
    opts?: { preview?: boolean; templateKey?: string },
  ): Promise<Buffer> {
    return this.renderPdf(data, opts);
  }

  private async renderPdf(
    data: QuotationData,
    opts?: { preview?: boolean; templateKey?: string },
  ): Promise<Buffer> {
    const html = await this.buildHtml(data, opts);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private async buildHtml(
    data: QuotationData,
    opts?: { preview?: boolean; templateKey?: string },
  ): Promise<string> {
    const templateKey = (
      opts?.templateKey ||
      (data as any)?.templateKey ||
      'standard'
    ).toString();
    // Template mapping for backward compatibility
    if (templateKey === 'default' || templateKey === 'standard')
      return this.buildHtmlStandard(data, opts);
    if (templateKey === 'template1') return this.buildHtmlTemplate1(data, opts);
    if (templateKey === 'template2') return this.buildHtmlTemplate2(data, opts);
    return this.buildHtmlStandard(data, opts);
  }

  private async loadLogoBase64(): Promise<string> {
    const envPath = process.env.LOGO_PATH
      ? path.resolve(process.env.LOGO_PATH)
      : null;
    const candidates = [
      envPath,
      path.resolve(process.cwd(), 'public/assets/isuzu-quotation-logo.png'),
      path.resolve(
        process.cwd(),
        'backend/public/assets/isuzu-quotation-logo.png',
      ),
      path.resolve(__dirname, '../../public/assets/isuzu-quotation-logo.png'),
      path.resolve(__dirname, '../../assets/isuzu-quotation-logo.png'),
    ].filter(Boolean) as string[];
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
    return Number.isNaN(num) ? '0' : num.toLocaleString('th-TH');
  }
  private thBaht(n?: number | null): string {
    return `${this.thFormatNumber(n)} ฿`;
  }
  private createBrochureUrl(modelGName?: string | null): string | null {
    const name = (modelGName || '').toLowerCase().trim();
    if (!name) return null;
    for (const mapping of BROCHURE_MAPPINGS) {
      if (mapping.patterns.some((p) => name.includes(p))) return mapping.url;
    }
    return null;
  }
  private async getQrDataUrl(url: string, size = 120): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: Math.max(80, Math.min(240, size)),
        margin: 1,
      });
    } catch {
      return '';
    }
  }

  private async buildHtmlStandard(
    data: QuotationData,
    opts?: { preview?: boolean },
  ): Promise<string> {
    const isPreview = !!opts?.preview;
    const logo = await this.loadLogoBase64();
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
    const add = data?.additionCosts || {};
    const paymentMethod = data?.paymentMethod || '';
    const isCash = paymentMethod === 'cash' && data?.cashPlans;
    const isInstallment = paymentMethod === 'installment';
    const cash = data?.cashPlans || {};
    const cashAddition = cash?.additionPrice ?? cash?.specialAddition ?? null;
    const instAll = (data?.installmentPlans || []) as any[];
    const brochureUrl = this.createBrochureUrl(car?.modelGName);
    let brochureQr = '';
    if (brochureUrl) {
      brochureQr = await this.getQrDataUrl(brochureUrl, 120);
      if (!brochureQr)
        this.logger.warn(`Failed to generate QR for URL: ${brochureUrl}`);
    } else {
      this.logger.debug(`No brochure mapping for model: ${car?.modelGName}`);
    }
    const extras: string[] = [];
    if (add?.cmi) extras.push('พรบ.');
    if (add?.insurance) extras.push('ประกันภัย');
    if (add?.fuelValue) extras.push(`ค่าน้ำมัน ${this.thBaht(add.fuelValue)}`);
    const accessories: string[] = (data?.accessories || [])
      .map((a: any) => a.assName)
      .filter((n: any) => !!n);
    const fullList = [...extras, ...accessories];
    const PREVIEW_MAX_ITEMS = 20;
    const list = isPreview ? fullList.slice(0, PREVIEW_MAX_ITEMS) : fullList;
    const overflow = isPreview ? Math.max(fullList.length - list.length, 0) : 0;
    const rows = Math.ceil(list.length / 2);
    const left = list.slice(0, rows);
    const right = list.slice(rows);
    const noteSource = add?.note ?? add?.noteText ?? '';
    const noteLines = (noteSource || '')
      .toString()
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);
    const noteItems = noteLines.length
      ? noteLines
          .map(
            (l) => `<li>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`,
          )
          .join('')
      : '<li class="muted">-</li>';
    const installmentHtml = isInstallment
      ? this.buildInstallmentTable(instAll, car)
      : '';
    const cashHtml = isCash
      ? `<div class="section"><table class="cash-table"><thead><tr><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th></tr></thead><tbody><tr><td>${this.thBaht(cash?.specialDiscount)}</td><td>${this.thBaht(cashAddition)}</td><td>${this.thBaht(cash?.totalPrice)}</td></tr></tbody></table></div>`
      : '';
    const accessoriesHtml = `<div class="section"><div class="section-title">อุปกรณ์ตกแต่ง</div><table class="acc-table"><colgroup><col style="width:8%"/><col style="width:42%"/><col style="width:8%"/><col style="width:42%"/></colgroup><thead><tr><th>ลำดับ</th><th>รายการ</th><th>ลำดับ</th><th>รายการ</th></tr></thead><tbody>${Array.from(
      { length: rows },
    )
      .map((_, i) => {
        const l = left[i] ?? '';
        const r = right[i] ?? '';
        const lNo = l ? i + 1 : '';
        const rNo = r ? i + rows + 1 : '';
        return `<tr><td>${lNo}</td><td style="text-align:left">${l}</td><td>${rNo}</td><td style="text-align:left">${r}</td></tr>`;
      })
      .join(
        '',
      )}${overflow > 0 ? `<tr><td colspan="4" style="text-align:center" class="muted">เพิ่มเติมอีก ${overflow} รายการ…</td></tr>` : ''}</tbody></table></div>`;
    return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet"><style>${this.buildSharedCss()}</style></head><body><div class="content"><div class="header"><div class="brand">${logo ? `<img class="logo" src="${logo}"/>` : ''}<div class="company-text"><div class="company-name">บริษัท อีซูซุเชียงราย จำกัด</div><div class="company-addr">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000</div><div class="company-tel">โทร. 053-711605</div></div></div><div class="right-meta"><div class="date-line">วันที่ ${date}</div><div class="doc-no">${docNo}</div></div></div><h1>ใบเสนอราคา</h1><div style="font-size:13px; margin-bottom:6px">เรียน ${customer?.firstName ?? ''} ${customer?.lastName ?? ''}</div><div class="car-section"><div class="car-photo">${car?.imageUrl ? `<img src="${car.imageUrl}"/>` : 'รูปภาพรถ'}</div><div class="car-info"><div><strong>รุ่นปีรถ:</strong> ${car?.modelClass ?? ''}</div><div><strong>รุ่นรถ:</strong> ${car?.modelGName ?? ''}</div><div><strong>สีตัวถัง:</strong> ${car?.color ?? ''}</div><div><strong>แรงม้า:</strong> ${car?.horsepower ?? '190'} แรงม้า</div><div><strong>แรงบิด:</strong> ${car?.torque ?? '450'} นิวตัน-เมตร</div></div><div class="qr-block"><div class="qr-box">${brochureQr ? `<img class="qr-img" src="${brochureQr}"/>` : brochureUrl ? '<span class="muted" style="font-size:11px">QR error</span>' : '<span class="muted" style="font-size:11px">No QR</span>'}</div><div class="qr-label">รายละเอียด<br/>เพิ่มเติม</div></div></div><div class="section"><span style="text-decoration:underline">เงื่อนไขการชำระ : ${paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'installment' ? 'ผ่อนชำระ' : ''}</span></div>${cashHtml}${installmentHtml}${accessoriesHtml}<div class="section"><div class="section-title">หมายเหตุ</div><div class="note-box"><ul class="note-list">${noteItems}</ul></div><div class="thanks">บริษัท อีซูซุเชียงราย จำกัด ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้ความสนใจในผลิตภัณฑ์ของทางบริษัทและหวังเป็นอย่างยิ่งว่าเราจะได้รับการตอบรับที่ดีจากท่าน</div></div></div><div class="staff-footer">ผู้เสนอราคา<br/>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ')}<br/>(ที่ปรึกษาการขาย)<br/>โทร. ${staff?.phoneNumber ?? ''}</div></div></body></html>`;
  }

  private buildInstallmentTable(instAll: any[], car: any): string {
    if (!instAll?.length) return '';
    let orderIndex = 0;
    const rows = instAll
      .map((order: any) => {
        orderIndex++;
        const net =
          (car?.price ?? 0) -
          (order?.specialDiscount ?? 0) +
          (order?.additionPrice ?? 0);
        const down = Math.round(((order?.downPaymentPercent ?? 0) / 100) * net);
        const loan = net - down;
        const plans: any[] = (order?.planDetails || []).filter(
          (p: any) =>
            p &&
            p.interestRate !== null &&
            p.interestRate !== undefined &&
            `${p.interestRate}` !== '',
        );
        if (!plans.length) return '';
        return plans
          .map((p: any, i: number) => {
            const period = p.period;
            const rate = p.interestRate;
            let monthly: number | null = null;
            if (period && rate != null) {
              if (Number(rate) === 0) monthly = Math.round(loan / period);
              else {
                const mr = Number(rate) / 100 / 12;
                const f = Math.pow(1 + mr, period);
                monthly = Math.round(loan * ((mr * f) / (f - 1)));
              }
            }
            return `<tr>${i === 0 ? `<td rowspan=\"${plans.length}\">${orderIndex}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(car?.price)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(order?.specialDiscount)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(order?.additionPrice)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(net)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(down)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(loan)}</td>` : ''}<td>${period ?? '-'}</td><td>${rate == null ? '-' : rate + '%'}</td><td>${monthly == null ? '-' : this.thBaht(monthly)}</td></tr>`;
          })
          .join('');
      })
      .join('');
    return `<div class=\"section\"><table class=\"install-table\"><thead><tr><th>ลำดับ</th><th>ราคารถ</th><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th><th>เงินดาวน์</th><th>ยอดจัด</th><th>จำนวนเดือน</th><th>ดอกเบี้ย</th><th>ค่างวด/เดือน</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  private buildSharedCss(): string {
    return `@page{size:A4;margin:15mm;}body{font-family:'Sarabun',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#111;}h1{font-size:22px;text-align:center;margin:8px 0 10px;}table{width:100%;border-collapse:collapse;font-size:11px;}th,td{border:1px solid #d1d5db;padding:4px 5px;text-align:center;}th{background:#f3f4f6;font-weight:600;}.header{display:flex;justify-content:space-between;align-items:flex-start;}.brand{display:flex;gap:10px;align-items:flex-start;}.logo{height:50px;}.company-text{line-height:1.25;}.company-name{font-weight:700;font-size:16px;}.company-addr,.company-tel{font-size:11px;color:#444;}.right-meta{text-align:right;font-size:12px;}.date-line{font-weight:600;margin-bottom:4px;}.car-section{display:flex;gap:16px;align-items:flex-start;margin-bottom:8px;}.car-photo{width:120px;height:120px;border:1px solid #e5e7eb;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;background:#fafafa;}.car-photo img{width:100%;height:100%;object-fit:contain;}.car-info{flex:1;font-size:13px;line-height:1.4;display:grid;gap:4px;}.qr-block{width:120px;text-align:center;display:flex;flex-direction:column;gap:6px;}.qr-box{width:120px;height:120px;border:1px solid #e5e7eb;border-radius:4px;display:flex;align-items:center;justify-center;background:#fff;}.qr-img{width:100%;height:100%;object-fit:contain;}.qr-label{font-size:11px;font-weight:600;line-height:1.2;}.section{margin-top:10px;}.section-title{font-weight:600;margin:0 0 6px;font-size:13px;}.note-box{border:1px solid #e5e7eb;background:#fafafa;border-radius:4px;padding:8px 10px;}.note-list{margin:0;padding-left:18px;line-height:1.5;}.muted{color:#666;}.thanks{margin-top:14px;font-size:11px;line-height:1.55;text-indent:2em;text-align:justify;}.staff-footer{position:fixed;bottom:0;right:0;text-align:right;font-size:12px;line-height:1.3;}.content{position:relative;padding-bottom:70px;}`;
  }

  /**
   * Template 1 - Modern Professional Layout with Card Design
   */
  private async buildHtmlTemplate1(
    data: QuotationData,
    opts?: { preview?: boolean },
  ): Promise<string> {
    const isPreview = !!opts?.preview;
    const logo = await this.loadLogoBase64();
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
    const add = data?.additionCosts || {};
    const paymentMethod = data?.paymentMethod || '';
    const isCash = paymentMethod === 'cash' && data?.cashPlans;
    const isInstallment = paymentMethod === 'installment';
    const cash = data?.cashPlans || {};
    const cashAddition = cash?.additionPrice ?? cash?.specialAddition ?? null;
    const instAll = (data?.installmentPlans || []) as any[];

    const brochureUrl = this.createBrochureUrl(car?.modelGName);
    let brochureQr = '';
    if (brochureUrl) {
      brochureQr = await this.getQrDataUrl(brochureUrl, 100);
      if (!brochureQr)
        this.logger.warn(`Failed to generate QR for URL: ${brochureUrl}`);
    }

    const extras: string[] = [];
    if (add?.cmi) extras.push('พรบ.');
    if (add?.insurance) extras.push('ประกันภัย');
    if (add?.fuelValue) extras.push(`ค่าน้ำมัน ${this.thBaht(add.fuelValue)}`);

    const accessories: string[] = (data?.accessories || [])
      .map((a: any) => a.assName)
      .filter((n: any) => !!n);

    const fullList = [...extras, ...accessories];
    const PREVIEW_MAX_ITEMS = 24;
    const list = isPreview ? fullList.slice(0, PREVIEW_MAX_ITEMS) : fullList;
    const overflow = isPreview ? Math.max(fullList.length - list.length, 0) : 0;

    const rows = Math.ceil(list.length / 3);
    const col1 = list.slice(0, rows);
    const col2 = list.slice(rows, rows * 2);
    const col3 = list.slice(rows * 2);

    const noteSource = add?.note ?? add?.noteText ?? '';
    const noteLines = (noteSource || '')
      .toString()
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const noteItems = noteLines.length
      ? noteLines
          .map(
            (l) => `<li>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`,
          )
          .join('')
      : '<li class="muted">ไม่มีหมายเหตุเพิ่มเติม</li>';

    const installmentHtml = isInstallment
      ? this.buildTemplate1InstallmentTable(instAll, car)
      : '';

    const cashHtml = isCash
      ? `<div class="t1-card"><div class="t1-card-header"><div class="t1-card-icon">💰</div><div class="t1-card-title">รายละเอียดการชำระเงินสด</div></div><table class="t1-payment-table"><tr><th>ส่วนลด</th><td>${this.thBaht(cash?.specialDiscount)}</td></tr><tr><th>ส่วนเพิ่ม</th><td>${this.thBaht(cashAddition)}</td></tr><tr class="highlight-row"><th>ราคาสุทธิ</th><td>${this.thBaht(cash?.totalPrice)}</td></tr></table></div>`
      : '';

    const accessoriesHtml = `<div class="t1-card"><div class="t1-card-header"><div class="t1-card-icon">🎁</div><div class="t1-card-title">อุปกรณ์ตกแต่งเสริม</div></div><table class="t1-acc-table"><colgroup><col style="width:5%"/><col style="width:28%"/><col style="width:5%"/><col style="width:28%"/><col style="width:5%"/><col style="width:28%"/></colgroup><thead><tr><th>ลำดับ</th><th>รายการ</th><th>ลำดับ</th><th>รายการ</th><th>ลำดับ</th><th>รายการ</th></tr></thead><tbody>${Array.from(
      { length: rows },
    )
      .map((_, i) => {
        const c1 = col1[i] ?? '';
        const c2 = col2[i] ?? '';
        const c3 = col3[i] ?? '';
        // Calculate actual item numbers sequentially
        const n1 = c1 ? (i + 1) : '';
        const n2 = c2 ? (col1.length + i + 1) : '';
        const n3 = c3 ? (col1.length + col2.length + i + 1) : '';
        return `<tr><td>${n1}</td><td style="text-align:left;padding-left:8px">${c1}</td><td>${n2}</td><td style="text-align:left;padding-left:8px">${c2}</td><td>${n3}</td><td style="text-align:left;padding-left:8px">${c3}</td></tr>`;
      })
      .join(
        '',
      )}${overflow > 0 ? `<tr><td colspan="6" style="text-align:center;padding:8px" class="muted">และอีก ${overflow} รายการ…</td></tr>` : ''}</tbody></table></div>`;

    return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/><title>Quotation - Template 1</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>${this.buildTemplate1Css()}</style></head><body><div class="t1-page"><div class="t1-header-band"></div><div class="t1-container"><div class="t1-header"><div class="t1-company-block"><div class="t1-logo-wrap">${logo ? `<img src="${logo}" class="t1-logo"/>` : '<div class="t1-logo-placeholder">LOGO</div>'}</div><div class="t1-company-info"><div class="t1-company-name">บริษัท อีซูซุเชียงราย จำกัด</div><div class="t1-company-details">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000<br/>โทร. 053-711605</div></div></div><div class="t1-doc-block"><div class="t1-doc-no">${docNo}</div><div class="t1-doc-date">วันที่: ${date}</div></div></div><div class="t1-title-section"><h1>ใบเสนอราคา</h1></div><div class="t1-customer-card"><div class="t1-customer-label">เรียน</div><div class="t1-customer-name">${[customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || '-'}</div><div class="t1-customer-detail">โทรศัพท์: ${customer?.phoneNumber || '-'}</div></div><div class="t1-car-card"><div class="t1-car-badge">${paymentMethod === 'cash' ? '💵 เงินสด' : paymentMethod === 'installment' ? '📊 ผ่อนชำระ' : '💳 การชำระเงิน'}</div><div class="t1-car-content"><div class="t1-car-image">${car?.imageUrl ? `<img src="${car.imageUrl}" alt="Car"/>` : '<div class="t1-car-placeholder">รูปภาพรถยนต์</div>'}</div><div class="t1-car-specs"><div class="t1-spec-row"><span class="t1-spec-label">รุ่นปี:</span><span class="t1-spec-value">${car?.modelClass || '-'}</span></div><div class="t1-spec-row"><span class="t1-spec-label">รุ่นรถ:</span><span class="t1-spec-value">${car?.modelGName || '-'}</span></div><div class="t1-spec-row"><span class="t1-spec-label">สีตัวถัง:</span><span class="t1-spec-value">${car?.color || '-'}</span></div><div class="t1-spec-row"><span class="t1-spec-label">แรงม้า:</span><span class="t1-spec-value">${car?.horsepower ?? '190'} แรงม้า</span></div><div class="t1-spec-row"><span class="t1-spec-label">แรงบิด:</span><span class="t1-spec-value">${car?.torque ?? '450'} นิวตัน-เมตร</span></div><div class="t1-price-row"><span class="t1-spec-label">ราคา:</span><span class="t1-price">${this.thBaht(car?.price)}</span></div></div>${brochureQr ? `<div class="t1-qr-block"><img src="${brochureQr}" class="t1-qr"/><div class="t1-qr-text">สแกนดู<br/>รายละเอียด</div></div>` : ''}</div></div>${cashHtml}${installmentHtml}${accessoriesHtml}<div class="t1-card"><div class="t1-card-header"><div class="t1-card-icon">📝</div><div class="t1-card-title">หมายเหตุ</div></div><ul class="t1-note-list">${noteItems}</ul><div class="t1-disclaimer">บริษัท อีซูซุเชียงราย จำกัด ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้ความสนใจในผลิตภัณฑ์ของบริษัท และหวังเป็นอย่างยิ่งว่าจะได้รับการตอบรับที่ดีจากท่าน ราคาและเงื่อนไขอาจมีการเปลี่ยนแปลงโดยไม่ต้องแจ้งล่วงหน้า</div></div></div><div class="t1-footer"><div class="t1-footer-content"><div class="t1-staff-card"><div class="t1-staff-label">ผู้เสนอราคา</div><div class="t1-staff-name">${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ') || '-'}</div><div class="t1-staff-title">( ที่ปรึกษาการขาย )</div><div class="t1-staff-contact">โทร. ${staff?.phoneNumber || '-'}</div></div></div></div></div></body></html>`;
  }

  private buildTemplate1InstallmentTable(instAll: any[], car: any): string {
    if (!instAll?.length) return '';
    let orderIndex = 0;
    const rows = instAll
      .map((order: any) => {
        orderIndex++;
        const net =
          (car?.price ?? 0) -
          (order?.specialDiscount ?? 0) +
          (order?.additionPrice ?? 0);
        const down = Math.round(((order?.downPaymentPercent ?? 0) / 100) * net);
        const loan = net - down;
        const plans: any[] = (order?.planDetails || []).filter(
          (p: any) =>
            p &&
            p.interestRate !== null &&
            p.interestRate !== undefined &&
            `${p.interestRate}` !== '',
        );
        if (!plans.length) return '';
        return plans
          .map((p: any, i: number) => {
            const period = p.period;
            const rate = p.interestRate;
            let monthly: number | null = null;
            if (period && rate != null) {
              if (Number(rate) === 0) monthly = Math.round(loan / period);
              else {
                const mr = Number(rate) / 100 / 12;
                const f = Math.pow(1 + mr, period);
                monthly = Math.round(loan * ((mr * f) / (f - 1)));
              }
            }
            return `<tr>${i === 0 ? `<td rowspan="${plans.length}">${orderIndex}</td>` : ''}${i === 0 ? `<td rowspan="${plans.length}">${this.thBaht(car?.price)}</td>` : ''}${i === 0 ? `<td rowspan="${plans.length}">${this.thBaht(order?.specialDiscount)}</td>` : ''}${i === 0 ? `<td rowspan="${plans.length}">${this.thBaht(order?.additionPrice)}</td>` : ''}${i === 0 ? `<td rowspan="${plans.length}" class="highlight-cell">${this.thBaht(net)}</td>` : ''}${i === 0 ? `<td rowspan="${plans.length}">${this.thBaht(down)}</td>` : ''}${i === 0 ? `<td rowspan="${plans.length}">${this.thBaht(loan)}</td>` : ''}<td>${period ?? '-'}</td><td>${rate == null ? '-' : rate + '%'}</td><td class="highlight-cell">${monthly == null ? '-' : this.thBaht(monthly)}</td></tr>`;
          })
          .join('');
      })
      .join('');
    return `<div class="t1-card"><div class="t1-card-header"><div class="t1-card-icon">💳</div><div class="t1-card-title">แผนผ่อนชำระ</div></div><table class="t1-install-table"><thead><tr><th>ลำดับ</th><th>ราคารถ</th><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th><th>เงินดาวน์</th><th>ยอดจัด</th><th>จำนวนเดือน</th><th>ดอกเบี้ย</th><th>ค่างวด/เดือน</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  private buildTemplate1Css(): string {
    return `
      @page { size: A4; margin: 6mm 8mm 20mm 8mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Sarabun', sans-serif;
        font-size: 9.5px;
        color: #2c3e50;
        line-height: 1.3;
        background: #f8f9fa;
      }
      .t1-page {
        position: relative;
        background: #fff;
      }
      .t1-header-band {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5mm;
        background: linear-gradient(135deg, #980000 0%, #c41e3a 100%);
      }
      .t1-container {
        padding: 10mm 6mm 18mm 6mm;
        position: relative;
      }
      .t1-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e0e0e0;
      }
      .t1-company-block {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .t1-logo-wrap {
        width: 65px;
        height: 65px;
      }
      .t1-logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .t1-logo-placeholder {
        width: 100%;
        height: 100%;
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: #999;
        background: #f5f5f5;
        border-radius: 4px;
      }
      .t1-company-info {
        line-height: 1.2;
      }
      .t1-company-name {
        font-size: 13px;
        font-weight: 700;
        color: #980000;
        margin-bottom: 2px;
      }
      .t1-company-details {
        font-size: 8.5px;
        color: #666;
      }
      .t1-doc-block {
        text-align: right;
      }
      .t1-doc-no {
        font-size: 12px;
        font-weight: 700;
        color: #980000;
        background: #fff3cd;
        padding: 3px 10px;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 3px;
        border: 1px solid #ffd54f;
      }
      .t1-doc-date {
        font-size: 9px;
        color: #666;
      }
      .t1-title-section {
        text-align: center;
        margin: 8px 0 6px;
      }
      .t1-title-section h1 {
        font-size: 20px;
        font-weight: 700;
        color: #980000;
        margin-bottom: 2px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .t1-subtitle {
        font-size: 10px;
        color: #999;
        font-weight: 500;
        letter-spacing: 2px;
      }
      .t1-customer-card {
        background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
        border-left: 4px solid #980000;
        padding: 6px 10px;
        margin-bottom: 6px;
        border-radius: 0 6px 6px 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }
      .t1-customer-label {
        font-size: 8.5px;
        color: #666;
        font-weight: 500;
        margin-bottom: 2px;
      }
      .t1-customer-name {
        font-size: 13px;
        font-weight: 700;
        color: #980000;
        margin-bottom: 2px;
      }
      .t1-customer-detail {
        font-size: 8.5px;
        color: #666;
      }
      .t1-car-card {
        position: relative;
        background: #fff;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      }
      .t1-car-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #980000 0%, #c41e3a 100%);
        color: #fff;
        padding: 3px 16px;
        border-radius: 20px;
        font-size: 9.5px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(152,0,0,0.3);
      }
      .t1-car-content {
        display: flex;
        gap: 10px;
        margin-top: 6px;
      }
      .t1-car-image {
        width: 110px;
        height: 90px;
        flex-shrink: 0;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #fafafa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .t1-car-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .t1-car-placeholder {
        font-size: 8px;
        color: #999;
      }
      .t1-car-specs {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .t1-spec-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 6px;
        background: #f8f9fa;
        border-radius: 3px;
      }
      .t1-spec-label {
        font-weight: 600;
        color: #666;
        font-size: 9px;
      }
      .t1-spec-value {
        color: #2c3e50;
        font-size: 9px;
      }
      .t1-price-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 8px;
        background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
        border-radius: 4px;
        margin-top: 2px;
        border: 1px solid #ffd54f;
      }
      .t1-price {
        font-size: 12px;
        font-weight: 700;
        color: #980000;
      }
      .t1-qr-block {
        width: 75px;
        text-align: center;
        flex-shrink: 0;
      }
      .t1-qr {
        width: 70px;
        height: 70px;
        border: 2px solid #980000;
        border-radius: 6px;
        padding: 2px;
        background: #fff;
      }
      .t1-qr-text {
        font-size: 7.5px;
        color: #666;
        margin-top: 3px;
        line-height: 1.2;
        font-weight: 600;
      }
      .t1-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 6px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .t1-card-header {
        background: linear-gradient(135deg, #980000 0%, #c41e3a 100%);
        color: #fff;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .t1-card-icon {
        font-size: 14px;
      }
      .t1-card-title {
        font-size: 10.5px;
        font-weight: 600;
        flex: 1;
      }
      .t1-payment-table,
      .t1-install-table,
      .t1-acc-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 8.5px;
      }
      .t1-payment-table tr {
        border-bottom: 1px solid #e0e0e0;
      }
      .t1-payment-table tr:last-child {
        border-bottom: none;
      }
      .t1-payment-table th {
        text-align: left;
        padding: 6px 10px;
        font-weight: 600;
        color: #666;
        background: #f8f9fa;
        width: 40%;
      }
      .t1-payment-table td {
        padding: 6px 10px;
        text-align: right;
        color: #2c3e50;
        font-weight: 500;
      }
      .highlight-row th,
      .highlight-row td {
        background: #fff3cd !important;
        font-weight: 700 !important;
        color: #980000 !important;
        font-size: 10px !important;
      }
      .t1-install-table {
        margin: 0;
      }
      .t1-install-table th,
      .t1-install-table td {
        border: 1px solid #e0e0e0;
        padding: 3px 4px;
        text-align: center;
      }
      .t1-install-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #666;
        font-size: 8px;
      }
      .t1-install-table td {
        background: #fff;
        font-size: 8.5px;
      }
      .t1-install-table .highlight-cell {
        background: #fff3cd !important;
        font-weight: 700;
        color: #980000;
      }
      .t1-acc-table {
        margin: 0;
      }
      .t1-acc-table th,
      .t1-acc-table td {
        border: 1px solid #e0e0e0;
        padding: 3px 4px;
        text-align: center;
      }
      .t1-acc-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #666;
        font-size: 8px;
      }
      .t1-acc-table td {
        background: #fff;
        font-size: 8.5px;
      }
      .t1-note-list {
        margin: 0;
        padding: 8px 10px 8px 24px;
        list-style: disc;
        color: #2c3e50;
        font-size: 8.5px;
        line-height: 1.5;
      }
      .t1-note-list li {
        margin-bottom: 2px;
      }
      .t1-disclaimer {
        padding: 6px 10px;
        background: #f8f9fa;
        border-top: 1px solid #e0e0e0;
        font-size: 7.5px;
        line-height: 1.4;
        color: #666;
        text-align: justify;
      }
      .muted {
        color: #999;
        font-style: italic;
      }
      .t1-footer {
        position: fixed;
        bottom: 6mm;
        left: 8mm;
        right: 8mm;
        background: #fff;
        border-top: 2px solid #980000;
        padding-top: 6px;
      }
      .t1-footer-content {
        display: flex;
        justify-content: flex-end;
      }
      .t1-staff-card {
        text-align: center;
        min-width: 180px;
      }
      .t1-staff-label {
        font-size: 9px;
        color: #666;
        font-weight: 500;
        margin-bottom: 4px;
      }
      .t1-staff-name {
        font-size: 11px;
        font-weight: 700;
        color: #980000;
        margin-bottom: 3px;
      }
      .t1-staff-title {
        font-size: 9px;
        color: #666;
        padding-top: 24px;
        margin-top: 4px;
        border-top: 1px solid #980000;
        margin-left: 25px;
        margin-right: 25px;
      }
      .t1-staff-contact {
        font-size: 8.5px;
        color: #666;
        margin-top: 4px;
      }
    `;
  }

  /**
   * Template 2 - Isuzu Chiang Rai formal layout with logo header
   */
  private async buildHtmlTemplate2(
    data: QuotationData,
    opts?: { preview?: boolean },
  ): Promise<string> {
    const isPreview = !!opts?.preview;
    const logo = await this.loadLogoBase64();
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
    const add = data?.additionCosts || {};
    const paymentMethod = data?.paymentMethod || '';
    const isCash = paymentMethod === 'cash' && data?.cashPlans;
    const isInstallment = paymentMethod === 'installment';
    const cash = data?.cashPlans || {};
    const cashAddition = cash?.additionPrice ?? cash?.specialAddition ?? null;
    const instAll = (data?.installmentPlans || []) as any[];

    const brochureUrl = this.createBrochureUrl(car?.modelGName);
    let brochureQr = '';
    if (brochureUrl) {
      brochureQr = await this.getQrDataUrl(brochureUrl, 100);
      if (!brochureQr)
        this.logger.warn(`Failed to generate QR for URL: ${brochureUrl}`);
    }

    const extras: string[] = [];
    if (add?.cmi) extras.push('กรมธรรม์ภาคบังคับ');
    if (add?.insurance) extras.push('สติกเกอร์รันบัลลือ');
    if (add?.fuelValue) extras.push(`ค่าน้ำมัน`);

    const accessories: any[] = (data?.accessories || []).filter(
      (a: any) => a && a.assName,
    );

    const noteSource = add?.note ?? add?.noteText ?? '';
    const noteLines = (noteSource || '')
      .toString()
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const noteItems = noteLines.length
      ? noteLines
          .map(
            (l) =>
              `<li style="margin-bottom:3px">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`,
          )
          .join('')
      : '<li style="color:#999">ไม่มีหมายเหตุ</li>';

    // Build installment table rows
    let installmentRows = '';
    if (isInstallment && instAll.length) {
      let orderIndex = 0;
      instAll.forEach((order: any) => {
        orderIndex++;
        const net =
          (car?.price ?? 0) -
          (order?.specialDiscount ?? 0) +
          (order?.additionPrice ?? 0);
        const downPercent = order?.downPaymentPercent ?? 0;
        const down = Math.round((downPercent / 100) * net);
        const loan = net - down;
        const plans: any[] = (order?.planDetails || []).filter(
          (p: any) =>
            p &&
            p.interestRate !== null &&
            p.interestRate !== undefined &&
            `${p.interestRate}` !== '',
        );
        if (!plans.length) return;

        plans.forEach((p: any, i: number) => {
          const period = p.period;
          const rate = p.interestRate;
          let monthly: number | null = null;
          if (period && rate != null) {
            if (Number(rate) === 0) monthly = Math.round(loan / period);
            else {
              const mr = Number(rate) / 100 / 12;
              const f = Math.pow(1 + mr, period);
              monthly = Math.round(loan * ((mr * f) / (f - 1)));
            }
          }

          const downPaymentText = `${downPercent}% หรือ บท ${this.thFormatNumber(down)} บาท`;

          installmentRows += `<tr>${i === 0 ? `<td rowspan="${plans.length}" style="border-right:1px solid #ddd">${orderIndex}</td>` : ''}<td style="border-right:1px solid #ddd">${downPaymentText}</td><td style="border-right:1px solid #ddd">${this.thFormatNumber(loan)}</td><td style="border-right:1px solid #ddd;text-align:center">${period ?? '-'}</td><td style="border-right:1px solid #ddd;text-align:center">${rate == null ? '-' : rate + '%'}</td><td style="text-align:right;font-weight:600">${monthly == null ? '-' : this.thFormatNumber(monthly)}</td></tr>`;
        });
      });
    }

    // Build accessories table (2-column layout like standard)
    const rows = Math.ceil(accessories.length / 2);
    const left = accessories.slice(0, rows).map((a) => a.assName);
    const right = accessories.slice(rows).map((a) => a.assName);
    const overflow = accessories.length > 20 ? accessories.length - 20 : 0;

    const accRows = Array.from({ length: Math.min(rows, 10) })
      .map((_, i) => {
        const l = left[i] ?? '';
        const r = right[i] ?? '';
        const lNo = l ? i + 1 : '';
        const rNo = r ? i + rows + 1 : '';
        return `<tr><td>${lNo}</td><td style="text-align:left">${l}</td><td>${rNo}</td><td style="text-align:left">${r}</td></tr>`;
      })
      .join('');

    const accOverflow =
      overflow > 0
        ? `<tr><td colspan="4" style="text-align:center;color:#666">เพิ่มเติมอีก ${overflow} รายการ…</td></tr>`
        : '';

    // Build cash payment table
    let cashTableHtml = '';
    if (isCash) {
      cashTableHtml = `
      <table class="t2-table">
        <thead>
          <tr>
            <th>รายละเอียด</th>
            <th>ราคา</th>
            <th>ส่วนลด</th>
            <th>ส่วนเพิ่ม</th>
            <th>ราคาสุทธิ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>NEW ISUZU D-MAX 2024</td>
            <td style="text-align:right">${this.thFormatNumber(car?.price)} ฿</td>
            <td style="text-align:right">${this.thFormatNumber(cash?.specialDiscount)} ฿</td>
            <td style="text-align:right">${this.thFormatNumber(cashAddition)} ฿</td>
            <td style="text-align:right;font-weight:700">${this.thFormatNumber(cash?.totalPrice)} บาท</td>
          </tr>
        </tbody>
      </table>`;
    }

    return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8"/>
  <title>Quotation Template 2</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${this.buildTemplate2Css()}
  </style>
</head>
<body>
  <div class="t2-container">
    <!-- Header -->
    <div class="t2-header">
      <div class="t2-logo-wrapper">
        ${logo ? `<img src="${logo}" class="t2-logo" alt="Isuzu Logo"/>` : '<div class="t2-logo-placeholder">LOGO</div>'}
      </div>
      <div class="t2-doc-info">
        <div class="t2-doc-no">${docNo}</div>
        <div class="t2-doc-date">วันที่ ${date}</div>
      </div>
    </div>

    <!-- Company Info -->
    <div class="t2-company">
      <div class="t2-company-name">บริษัท อีซูซุเชียงราย จำกัด</div>
      <div class="t2-company-addr">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000</div>
      <div class="t2-company-tel">โทร. 053-711605</div>
    </div>

    <!-- Customer Section -->
    <div class="t2-customer">
      <div class="t2-customer-label">ใบเสนอราคา</div>
      <div class="t2-customer-to">เรียน <strong>${[customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || 'จีรัจ รักฏ์ นันทางษ์'}</strong></div>
    </div>

    <!-- Car Details with Image -->
    <div class="t2-car-section">
      <div class="t2-car-details">
        <div class="t2-car-row"><span class="t2-car-label">รุ่นปี:</span> <span>${car?.modelClass || 'NEW ISUZU D-MAX 2024'}</span></div>
        <div class="t2-car-row"><span class="t2-car-label">รุ่นรถ:</span> <span>${car?.modelGName || 'V-Cross 4x4'}</span></div>
        <div class="t2-car-row"><span class="t2-car-label">สีตัวถัง:</span> <span>${car?.color || 'Elbrus Gray Opaque'}</span></div>
        <div class="t2-car-row"><span class="t2-car-label">แรงม้า:</span> <span>${car?.horsepower ?? '190'} แรงม้า</span></div>
        <div class="t2-car-row"><span class="t2-car-label">แรงบิด:</span> <span>${car?.torque ?? '450'} นิวตัน-เมตร</span></div>
      </div>
      <div class="t2-car-image">
        ${car?.imageUrl ? `<img src="${car.imageUrl}" alt="Car" style="width:100%;height:100%;object-fit:contain"/>` : '<div style="color:#999;font-size:12px">รูปภาพรถยนต์</div>'}
      </div>
    </div>

    <!-- Payment Method Title -->
    <div class="t2-section-title">เงื่อนไขการชำระ: ${paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'installment' ? 'ผ่อนชำระ' : '-'}</div>

    ${cashTableHtml}

    ${
      isInstallment && installmentRows
        ? `
    <table class="t2-table">
      <thead>
        <tr>
          <th>รายละเอียด</th>
          <th>ราคา</th>
          <th>ส่วนลด</th>
          <th>ส่วนเพิ่ม</th>
          <th>ราคาสุทธิ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>NEW ISUZU D-MAX 2024</td>
          <td style="text-align:right">${this.thFormatNumber(car?.price)} ฿</td>
          <td style="text-align:right">5,000 ฿</td>
          <td style="text-align:right">3,000 ฿</td>
          <td style="text-align:right;font-weight:700">${this.thFormatNumber(car?.price)} ฿</td>
        </tr>
      </tbody>
    </table>
    <table class="t2-table" style="margin-top:8px">
      <thead>
        <tr>
          <th rowspan="2">ลำดับ</th>
          <th rowspan="2">เงินดาวน์</th>
          <th rowspan="2">ยอดจัดไฟแนนซ์</th>
          <th colspan="2">จำนวนเดือนชำระ (อิงเงินดาวน์%)</th>
          <th rowspan="2">จำนวนเงิน</th>
        </tr>
        <tr>
          <th style="font-size:9px">36 (0.5%)</th>
          <th style="font-size:9px">48 (1%)</th>
        </tr>
      </thead>
      <tbody>
        ${installmentRows}
      </tbody>
    </table>`
        : ''
    }

    <!-- Accessories Table -->
    ${
      accessories.length > 0
        ? `
    <div class="t2-section-title">อุปกรณ์ตกแต่ง</div>
    <table class="t2-table">
      <colgroup>
        <col style="width:8%"/>
        <col style="width:42%"/>
        <col style="width:8%"/>
        <col style="width:42%"/>
      </colgroup>
      <thead>
        <tr>
          <th>ลำดับ</th>
          <th>รายการ</th>
          <th>ลำดับ</th>
          <th>รายการ</th>
        </tr>
      </thead>
      <tbody>
        ${accRows}
        ${accOverflow}
      </tbody>
    </table>`
        : ''
    }

    <!-- Notes Section -->
    <div class="t2-section-title">หมายเหตุ</div>
    <div class="t2-notes">
      <ul style="margin:0;padding-left:20px;line-height:1.6">
        ${noteItems}
      </ul>
    </div>

    <!-- Footer -->
    <div class="t2-footer">
      <div class="t2-footer-left">
        ${brochureQr ? `<div class="t2-qr-container"><div class="t2-qr-label">ดูข้อมูลโบรชัวร์</div><img src="${brochureQr}" class="t2-qr-image" alt="QR Code"/></div>` : ''}
        <div class="t2-disclaimer">บริษัท อีซูซุเชียงราย จำกัด ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้ความสนใจในผลิตภัณฑ์ของทางบริษัท ราคาและเงื่อนไขอาจมีการเปลี่ยนแปลงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</div>
      </div>
      <div class="t2-footer-right">
        ผู้เสนอราคา<br/>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ') || '-'}<br/>(ที่ปรึกษาการขาย)<br/>โทร.${staff?.phoneNumber || '-'}
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  private buildTemplate2Css(): string {
    return `
      @page { size: A4; margin: 6mm 8mm 18mm 8mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Sarabun', sans-serif;
        font-size: 9.5px;
        color: #000;
        line-height: 1.3;
        background: #fff;
      }
      .t2-container {
        max-width: 194mm;
        margin: 0 auto;
        padding-bottom: 140px;
      }
      .t2-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 5px;
        padding-bottom: 4px;
        position: relative;
      }
      .t2-logo-wrapper {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 130px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .t2-logo {
        width: 130px;
        height: auto;
        max-height: 50px;
        object-fit: contain;
      }
      .t2-logo-placeholder {
        width: 130px;
        height: 45px;
        border: 2px solid #4CAF50;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
        font-weight: 600;
        font-size: 10px;
        background: #fff;
      }
      .t2-doc-info {
        text-align: right;
        margin-left: auto;
      }
      .t2-doc-no {
        font-size: 14px;
        font-weight: 700;
        color: #000;
        margin-bottom: 2px;
      }
      .t2-doc-date {
        font-size: 9.5px;
        color: #333;
      }
      .t2-company {
        text-align: center;
        margin-bottom: 5px;
      }
      .t2-company-name {
        font-size: 13px;
        font-weight: 700;
        color: #000;
        margin-bottom: 2px;
      }
      .t2-company-addr,
      .t2-company-tel {
        font-size: 8.5px;
        color: #333;
        line-height: 1.2;
      }
      .t2-customer {
        margin-bottom: 6px;
        background: #fafafa;
        padding: 6px 10px;
        border-left: 2px solid #666;
        border-radius: 0;
      }
      .t2-customer-label {
        font-size: 11px;
        font-weight: 700;
        margin-bottom: 2px;
        color: #333;
      }
      .t2-customer-to {
        font-size: 10.5px;
      }
      .t2-car-section {
        display: flex;
        gap: 10px;
        margin-bottom: 6px;
        align-items: flex-start;
      }
      .t2-car-details {
        flex: 1;
      }
      .t2-car-row {
        margin-bottom: 2px;
        font-size: 9.5px;
      }
      .t2-car-label {
        display: inline-block;
        min-width: 60px;
        font-weight: 600;
      }
      .t2-car-image {
        width: 160px;
        height: 130px;
        border: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: #fafafa;
      }
      .t2-section-title {
        font-size: 11px;
        font-weight: 700;
        margin: 6px 0 4px 0;
        color: #000;
        padding: 4px 0;
        background: transparent;
        border-left: none;
        border-bottom: 1px solid #ddd;
        border-radius: 0;
      }
      .t2-notes {
        background: #fff;
        border: 1px solid #ddd;
        padding: 6px 10px;
        margin-bottom: 6px;
        font-size: 9.5px;
      }
      .t2-footer {
        position: fixed;
        bottom: 6mm;
        left: 8mm;
        right: 8mm;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-size: 9.5px;
        padding-top: 10px;
        border-top: 2px solid #000;
      }
      .t2-footer-left {
        flex: 1;
        max-width: 50%;
      }
      .t2-footer-right {
        flex-shrink: 0;
        width: auto;
        text-align: right;
        font-size: 10.5px;
        line-height: 1.2;
      }
      .t2-qr-container {
        text-align: left;
        margin-bottom: 6px;
      }
      .t2-qr-label {
        font-weight: 700;
        font-size: 10px;
        margin-bottom: 4px;
        color: #000;
      }
      .t2-qr-image {
        width: 100px;
        height: 100px;
        border: 1px solid #ddd;
        padding: 3px;
        background: #fff;
        margin-bottom: 6px;
      }
      .t2-disclaimer {
        font-size: 8.5px;
        line-height: 1.4;
        color: #333;
        text-align: justify;
      }
      .t2-container {
        padding-bottom: 140px;
      }
      .t2-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 8.5px;
        border: 1px solid #ddd;
        margin-bottom: 6px;
      }
      .t2-table thead tr {
        background: #f5f5f5;
      }
      .t2-table th {
        padding: 3px 4px;
        text-align: center;
        font-weight: 600;
        border: 0.5px solid #ddd;
        font-size: 8px;
        color: #333;
      }
      .t2-table tbody tr {
        background: #fff;
      }
      .t2-table tbody tr:nth-child(even) {
        background: #fafafa;
      }
      .t2-table td {
        padding: 3px 4px;
        border: 0.5px solid #ddd;
      }
      .t2-total-row {
        background: #f5f5f5 !important;
        font-weight: 700;
      }
    `;
  }
}
