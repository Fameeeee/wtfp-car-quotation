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
import { TEMPLATES } from './templates';
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
      'default'
    ).toString();
    const template =
      (TEMPLATES as any)[templateKey] || (TEMPLATES as any)['default'];
    const helpers = {
      loadLogoBase64: this.loadLogoBase64.bind(this),
      thFormatNumber: this.thFormatNumber.bind(this),
      thBaht: this.thBaht.bind(this),
      createBrochureUrl: this.createBrochureUrl.bind(this),
      getQrDataUrl: this.getQrDataUrl.bind(this),
      buildSharedCss: this.buildSharedCss.bind(this),
      buildInstallmentTable: this.buildInstallmentTable.bind(this),
    };
    try {
      return await template(data, opts, helpers);
    } catch (err) {
      this.logger.error(`Template render failed (${templateKey}): ${err}`);
      return await (TEMPLATES as any).default(data, opts, helpers);
    }
  }

  private async loadLogoBase64(): Promise<string> {
    const envPath = process.env.LOGO_PATH
      ? path.resolve(process.env.LOGO_PATH)
      : null;
    const candidates = [
      envPath,
      path.resolve(
        __dirname,
        '../../../frontend/public/assets/isuzu-quotation-logo.png',
      ),
      path.resolve(
        __dirname,
        '../../frontend/public/assets/isuzu-quotation-logo.png',
      ),
      path.resolve(process.cwd(), 'public/assets/isuzu-quotation-logo.png'),
      path.resolve(
        process.cwd(),
        'backend/public/assets/isuzu-quotation-logo.png',
      ),
      path.resolve(
        process.cwd(),
        'frontend/public/assets/isuzu-quotation-logo.png',
      ),
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

  private async buildHtmlDefault(
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
    return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet"><style>${this.buildSharedCss()}</style></head><body><div class="content"><div class="header"><div class="brand">${logo ? `<img class="logo" src="${logo}"/>` : ''}<div class="company-text"><div class="company-name">บริษัท อีซูซุเชียงราย จำกัด</div><div class="company-addr">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000</div><div class="company-tel">โทร. 053-711605</div></div></div><div class="right-meta"><div class="date-line">วันที่ ${date}</div><div class="doc-no">${docNo}</div></div></div><h1>ใบเสนอราคา</h1><div style="font-size:13px; margin-bottom:6px">เรียน ${customer?.firstName ?? ''} ${customer?.lastName ?? ''}</div><div class="car-section"><div class="car-photo">${car?.imageUrl ? `<img src="${car.imageUrl}"/>` : 'รูปภาพรถ'}</div><div class="car-info"><div><strong>รุ่นปีรถ:</strong> ${car?.modelClass ?? ''}</div><div><strong>รุ่นรถ:</strong> ${car?.modelGName ?? ''}</div><div><strong>สีตัวถัง:</strong> ${car?.color ?? ''}</div><div><strong>แรงม้า:</strong> ${car?.horsepower ?? '190'} แรงม้า</div><div><strong>แรงบิด:</strong> ${car?.torque ?? '450'} นิวตัน-เมตร</div></div><div class="qr-block"><div class="qr-box">${brochureQr ? `<img class="qr-img" src="${brochureQr}"/>` : brochureUrl ? '<span class="muted" style="font-size:11px">QR error</span>' : '<span class="muted" style="font-size:11px">No QR</span>'}</div><div class="qr-label">รายละเอียด<br/>เพิ่มเติม</div></div></div><div class="section"><span style="text-decoration:underline">เงื่อนไขการชำระ : ${paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'installment' ? 'ผ่อนชำระ' : ''}</span></div>${cashHtml}${installmentHtml}${accessoriesHtml}<div class="section"><div class="section-title">หมายเหตุ</div><div class="note-box"><ul class="note-list">${noteItems}</ul></div><div class="thanks">บริษัท อีซูซุเชียงราย จำกัด ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้ความสนใจในผลิตภัณฑ์ของทางบริษัทและหวังเป็นอย่างยิ่งว่าเราจะได้รับการตอบรับที่ดีจากท่าน</div></div></div><div class="staff-footer">ผู้เสนอราคา<br/>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ')}<br/>(ที่ปรึกษาการขาย)<br/>โทร. ${staff?.phoneNumber ?? ''}</div></body></html>`;
  }

  private buildInstallmentTable(instAll: any[], car: any): string {
    if (!instAll?.length) return '';
    const rows = instAll
      .map((order: any) => {
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
            return `<tr>${i === 0 ? `<td rowspan=\"${plans.length}\">${order?.orderNumber ?? ''}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(car?.price)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(order?.specialDiscount)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(order?.additionPrice)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(net)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(down)}</td>` : ''}${i === 0 ? `<td rowspan=\"${plans.length}\">${this.thBaht(loan)}</td>` : ''}<td>${period ?? '-'}</td><td>${rate == null ? '-' : rate + '%'}</td><td>${monthly == null ? '-' : this.thBaht(monthly)}</td></tr>`;
          })
          .join('');
      })
      .join('');
    return `<div class=\"section\"><table class=\"install-table\"><thead><tr><th>ลำดับ</th><th>ราคารถ</th><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th><th>เงินดาวน์</th><th>ยอดจัด</th><th>จำนวนเดือน</th><th>ดอกเบี้ย</th><th>ค่างวด/เดือน</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  private buildSharedCss(): string {
    return `@page{size:A4;margin:15mm;}body{font-family:'Sarabun',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#111;}h1{font-size:22px;text-align:center;margin:8px 0 10px;}table{width:100%;border-collapse:collapse;font-size:11px;}th,td{border:1px solid #d1d5db;padding:4px 5px;text-align:center;}th{background:#f3f4f6;font-weight:600;}.header{display:flex;justify-content:space-between;align-items:flex-start;}.brand{display:flex;gap:10px;align-items:flex-start;}.logo{height:50px;}.company-text{line-height:1.25;}.company-name{font-weight:700;font-size:16px;}.company-addr,.company-tel{font-size:11px;color:#444;}.right-meta{text-align:right;font-size:12px;}.date-line{font-weight:600;margin-bottom:4px;}.car-section{display:flex;gap:16px;align-items:flex-start;margin-bottom:8px;}.car-photo{width:120px;height:120px;border:1px solid #e5e7eb;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;background:#fafafa;}.car-photo img{width:100%;height:100%;object-fit:contain;}.car-info{flex:1;font-size:13px;line-height:1.4;display:grid;gap:4px;}.qr-block{width:120px;text-align:center;display:flex;flex-direction:column;gap:6px;}.qr-box{width:120px;height:120px;border:1px solid #e5e7eb;border-radius:4px;display:flex;align-items:center;justify-content:center;background:#fff;}.qr-img{width:100%;height:100%;object-fit:contain;}.qr-label{font-size:11px;font-weight:600;line-height:1.2;}.section{margin-top:10px;}.section-title{font-weight:600;margin:0 0 6px;font-size:13px;}.note-box{border:1px solid #e5e7eb;background:#fafafa;border-radius:4px;padding:8px 10px;}.note-list{margin:0;padding-left:18px;line-height:1.5;}.muted{color:#666;}.thanks{margin-top:14px;font-size:11px;line-height:1.55;text-indent:2em;text-align:justify;}.staff-footer{position:fixed;bottom:0;right:0;text-align:right;font-size:12px;line-height:1.3;}.content{position:relative;padding-bottom:70px;}`;
  }

  private async buildHtmlAlt(
    data: QuotationData,
    _opts?: { preview?: boolean; templateKey?: string },
  ): Promise<string> {
    const logo = await this.loadLogoBase64();
    const rawDate = (data as any)?.quotationDate
      ? (data as any).quotationDate
      : Date.now();
    const date = new Date(rawDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const docNo = (data as any)?.id
      ? `NO.${String((data as any).id).padStart(8, '0')}`
      : 'NO.XXXXXXXX';
    const customer = data?.customer || {};
    const car = data?.carDetails || {};
    const staff = data?.staff || {};
    const additions = data?.additionCosts || {};
    const accessories: any[] = (data?.accessories || []).filter(
      (a: any) => a && a.assName,
    );
    const paymentMethod = data?.paymentMethod || '';
    const installmentPlans: any[] = (data?.installmentPlans || [])
      .flatMap((o: any) =>
        (o?.planDetails || []).map((p: any) => ({ order: o, plan: p })),
      )
      .filter((p) => p.plan && p.plan.period);
    // Compute a best (lowest monthly) plan if possible
    let bestMonthly: {
      monthly: number;
      period: number;
      rate: number;
      down: number;
      loan: number;
    } | null = null;
    for (const { order, plan } of installmentPlans) {
      const carPrice = car?.price ?? 0;
      const net =
        carPrice - (order?.specialDiscount || 0) + (order?.additionPrice || 0);
      const down = Math.round(((order?.downPaymentPercent || 0) / 100) * net);
      const loan = net - down;
      const period = Number(plan.period) || 0;
      const rate = Number(plan.interestRate) || 0;
      if (period > 0) {
        let monthly: number;
        if (rate === 0) monthly = Math.round(loan / period);
        else {
          const mr = rate / 100 / 12;
          const f = Math.pow(1 + mr, period);
          monthly = Math.round(loan * ((mr * f) / (f - 1)));
        }
        if (!bestMonthly || monthly < bestMonthly.monthly) {
          bestMonthly = { monthly, period, rate, down, loan };
        }
      }
    }
    const topAccessories = accessories
      .slice(0, 6)
      .map(
        (a, i) =>
          `<div class="acc-pill"><span>${i + 1}.</span> ${a.assName}</div>`,
      )
      .join('');
    const moreAcc =
      accessories.length > 6
        ? `<div class="acc-more">+${accessories.length - 6} รายการเพิ่มเติม</div>`
        : '';
    const additionFlags: string[] = [];
    if (additions?.cmi) additionFlags.push('พรบ.');
    if (additions?.insurance) additionFlags.push('ประกันภัย');
    if (additions?.fuelValue)
      additionFlags.push(`น้ำมัน ${this.thBaht(additions.fuelValue)}`);
    const logoTag = logo
      ? `<img class="logo" src="${logo}"/>`
      : `<div class="logo-ph">LOGO</div>`;
    const custName =
      [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '-';
    const priceLine = car?.price ? this.thBaht(car.price) : '-';
    const bestBlock = bestMonthly
      ? `<div class="best-box"><div class="best-title">แผนผ่อนที่น่าสนใจ</div><div class="best-line"><span>งวด:</span> ${bestMonthly.period} เดือน</div><div class="best-line"><span>ดอกเบี้ย:</span> ${bestMonthly.rate}%</div><div class="best-line"><span>ค่างวด:</span> ${this.thBaht(bestMonthly.monthly)}</div><div class="best-line"><span>เงินดาวน์:</span> ${this.thBaht(bestMonthly.down)}</div><div class="best-line"><span>ยอดจัด:</span> ${this.thBaht(bestMonthly.loan)}</div></div>`
      : `<div class="best-box empty">(ยังไม่มีข้อมูลผ่อน)</div>`;
    const paymentBadge = paymentMethod
      ? `<span class="badge badge-${paymentMethod}">${paymentMethod === 'cash' ? 'เงินสด' : 'ผ่อนชำระ'}</span>`
      : '';
    return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/><title>Quotation ALT</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet"><style>
      ${this.buildSharedCss()}
      body{background:#f8f9fb;}
      h1.alt{font-size:24px;margin:6px 0 14px;letter-spacing:0.5px;}
      .page{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;position:relative;min-height:1000px;}
      .top-bar{display:flex;justify-content:space-between;align-items:flex-start;}
      .logo-ph{width:110px;height:48px;border:1px dashed #bbb;display:flex;align-items:center;justify-content:center;font-size:11px;color:#666;border-radius:4px;background:#fff;}
      .meta{font-size:11px;text-align:right;line-height:1.35;}
      .meta .doc{font-weight:600;font-size:12px;margin-top:2px;}
      .split{display:grid;grid-template-columns:1.1fr 0.9fr;gap:18px;margin-top:6px;}
      .panel{border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;background:#fcfcfd;}
      .panel-title{font-size:13px;font-weight:600;margin:0 0 6px;display:flex;align-items:center;gap:6px;}
      .kv{display:grid;grid-template-columns:110px 1fr;font-size:11.5px;row-gap:3px;}
      .kv span:first-child{color:#555;}
      .badge{display:inline-block;border:1px solid #2563eb;color:#2563eb;font-size:10px;padding:2px 6px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px;}
      .badge-installment{border-color:#6366f1;color:#6366f1;}
      .badge-cash{border-color:#059669;color:#059669;}
      .acc-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
      .acc-pill{background:#eef2ff;border:1px solid #c7d2fe;padding:4px 8px;border-radius:14px;font-size:10.5px;line-height:1;display:flex;gap:4px;align-items:center;}
      .acc-more{margin-top:6px;font-size:10px;color:#555;}
      .best-box{background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 70%);color:#fff;border-radius:8px;padding:10px 12px;font-size:11.5px;display:grid;row-gap:4px;}
      .best-box.empty{background:#f1f5f9;color:#64748b;border:1px dashed #cbd5e1;}
      .best-title{font-weight:600;font-size:12.5px;margin-bottom:2px;}
      .best-line span{opacity:.85;display:inline-block;min-width:56px;}
      .price-box{display:flex;flex-direction:column;gap:6px;font-size:12px;}
      .price-tag{font-size:20px;font-weight:700;color:#111;}
      .flags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
      .flag{background:#fff8e1;border:1px solid #fcd34d;color:#92400e;font-size:10px;padding:3px 8px;border-radius:12px;}
      .notes-mini{margin-top:12px;font-size:10px;line-height:1.4;color:#555;}
      .watermark{position:absolute;top:45%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);font-size:72px;font-weight:700;color:rgba(0,0,0,0.04);pointer-events:none;letter-spacing:4px;}
      .footer-sign{margin-top:26px;font-size:11.5px;text-align:right;}
      .section-row{display:grid;grid-template-columns:1fr 0.9fr 1fr;gap:14px;margin-top:14px;}
      .mini-table{width:100%;border-collapse:collapse;font-size:10.5px;}
      .mini-table th,.mini-table td{border:1px solid #e2e8f0;padding:4px 6px;text-align:center;}
      .mini-table th{background:#f1f5f9;font-weight:600;}
    </style></head><body>
    <div class="page">
      <div class="watermark">ISUZU</div>
      <div class="top-bar">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          ${logoTag}
          <div style="line-height:1.3;">
            <div style="font-weight:700;font-size:15px;">บริษัท อีซูซุเชียงราย จำกัด</div>
            <div style="font-size:10.5px;color:#555;">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000</div>
            <div style="font-size:10.5px;color:#555;">โทร. 053-711605</div>
          </div>
        </div>
        <div class="meta"><div>${date}</div><div class="doc">${docNo}</div></div>
      </div>
      <h1 class="alt">ใบเสนอราคา ${paymentBadge}</h1>
      <div class="split">
        <div class="panel">
          <div class="panel-title">ลูกค้า</div>
          <div class="kv">
            <span>ชื่อ:</span><span>${custName}</span>
            <span>โทร:</span><span>${customer?.phoneNumber || '-'}</span>
            <span>อีเมล:</span><span>${customer?.email || '-'}</span>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">ที่ปรึกษาการขาย</div>
          <div class="kv">
            <span>ชื่อ:</span><span>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ') || '-'}</span>
            <span>โทร:</span><span>${staff?.phoneNumber || '-'}</span>
            <span>รหัส:</span><span>${staff?.staffCode || '-'}</span>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">ราคา</div>
          <div class="price-box">
            <div class="price-tag">${priceLine}</div>
            <div style="font-size:10.5px;color:#555;">(รวม/ไม่รวม ส่วนลด & ส่วนเพิ่ม แล้วแต่เงื่อนไขจริง)</div>
          </div>
        </div>
      </div>
      <div class="split" style="margin-top:14px;">
        <div class="panel">
          <div class="panel-title">ข้อมูลรถ</div>
          <div class="kv">
            <span>รุ่นปี:</span><span>${car?.modelClass || '-'}</span>
            <span>รุ่น:</span><span>${car?.modelGName || '-'}</span>
            <span>สี:</span><span>${car?.color || '-'}</span>
            <span>แรงม้า:</span><span>${car?.horsepower ?? '190'}</span>
            <span>แรงบิด:</span><span>${car?.torque ?? '450'}</span>
          </div>
          <div class="flags">${additionFlags.map((f) => `<div class='flag'>${f}</div>`).join('')}</div>
        </div>
        <div class="panel">
          <div class="panel-title">อุปกรณ์เด่น</div>
          <div class="acc-grid">${topAccessories || '<div class="muted" style="font-size:10px;">-</div>'}</div>
          ${moreAcc}
        </div>
        <div class="panel">
          ${bestBlock}
        </div>
      </div>
      <div class="section-row">
        <div class="panel">
          <div class="panel-title">หมายเหตุ</div>
          <div style="font-size:10.5px;line-height:1.45;">${
            (additions?.note || additions?.noteText || '-')
              .toString()
              .split(/\r?\n/)
              .map((l: string) =>
                l ? l.replace(/&/g, '&amp;').replace(/</g, '&lt;') : '',
              )
              .filter(Boolean)
              .slice(0, 6)
              .map((l) => `<div>• ${l}</div>`)
              .join('') || '-'
          }</div>
        </div>
        <div class="panel">
          <div class="panel-title">สรุปวิธีชำระ</div>
          <table class="mini-table">
            <thead><tr><th>ประเภท</th><th>ตัวเลขหลัก</th></tr></thead>
            <tbody>
              <tr><td>วิธี</td><td>${paymentMethod ? (paymentMethod === 'cash' ? 'เงินสด' : 'ผ่อนชำระ') : '-'}</td></tr>
              ${bestMonthly ? `<tr><td>ค่างวด</td><td>${this.thBaht(bestMonthly.monthly)}</td></tr><tr><td>ดาวน์</td><td>${this.thBaht(bestMonthly.down)}</td></tr>` : ''}
              <tr><td>ส่วนลด</td><td>${this.thBaht(data?.cashPlans?.specialDiscount || 0)}</td></tr>
              <tr><td>ส่วนเพิ่ม</td><td>${this.thBaht(data?.cashPlans?.additionPrice || 0)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="panel">
          <div class="panel-title">สถานะ</div>
          <div style="font-size:11px;line-height:1.5;">เอกสารฉบับนี้จัดทำเพื่อประกอบการพิจารณา อาจมีการเปลี่ยนแปลงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</div>
          <div class="notes-mini">จัดทำ: ${date}<br/>Reference: ${docNo}</div>
        </div>
      </div>
      <div class="footer-sign">ผู้เสนอราคา: ${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ') || '-'}</div>
    </div>
    </body></html>`;
  }
}
