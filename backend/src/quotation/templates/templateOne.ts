import type { Helpers } from './default';

export async function renderOne(
  data: any,
  _opts: { preview?: boolean; templateKey?: string } | undefined,
  helpers: Helpers,
): Promise<string> {
  const logo = await helpers.loadLogoBase64();
  const dateRaw = data?.quotationDate ? data.quotationDate : Date.now();
  const date = new Date(dateRaw).toLocaleDateString('th-TH', {
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
  const additions = data?.additionCosts || {};
  const accessories: any[] = (data?.accessories || [])
    .map((a: any) => a.assName)
    .filter(Boolean);
  const priceVal = Number(car?.price ?? 0);
  const discountVal = Number((data?.cashPlans?.specialDiscount ?? 0) || 0);
  const additionVal = Number((data?.cashPlans?.additionPrice ?? 0) || 0);
  const netVal = priceVal - discountVal + additionVal;

  const brochureUrl = helpers.createBrochureUrl(car?.modelGName);
  let brochureQr = '';
  if (brochureUrl) brochureQr = await helpers.getQrDataUrl(brochureUrl, 120);

  const instAll = (data?.installmentPlans || []) as any[];
  const installmentHtml =
    instAll && instAll.length
      ? helpers.buildInstallmentTable(instAll, car)
      : '';

  const sharedCss = helpers.buildSharedCss();
  const css = `
    ${sharedCss}
    body{background:#fff}
    .page{max-width:820px;margin:0 auto;padding:18px 24px;font-family:'Sarabun',sans-serif;color:#111}
    .top-right{position:relative}
    .doc-no{position:absolute;right:0;top:0;text-align:right;font-weight:700}
    .date-line{position:absolute;right:0;top:28px;font-size:13px;color:#333}
    .logo-wrap{text-align:center;margin-top:6px}
    .company{font-weight:700;text-align:center;font-size:20px;margin-top:6px}
    .company-small{text-align:center;font-size:12px;color:#444;margin-top:4px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;margin-top:14px}
    .left{width:58%;font-size:13px}
    .right{width:40%;text-align:right}
    .detail{margin:6px 0}
    .detail strong{display:inline-block;width:90px}
    .main-table{width:100%;border-collapse:collapse;margin-top:8px}
    .main-table th,.main-table td{border:1px solid #777;padding:8px;font-size:13px}
    .main-table thead th{background:#fff}
    .install-section{margin-top:10px}
    .acc-table{width:100%;border-collapse:collapse;margin-top:12px}
    .acc-table th,.acc-table td{border-bottom:1px solid #ddd;padding:8px;text-align:left}
    .note-list{margin-top:16px;font-size:12px;line-height:1.5}
    .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px}
    .qr{width:120px}
    .sign{width:220px;text-align:right;font-size:12px}
    .car-placeholder{width:260px;height:160px;border:1px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#777;background:#fff}
  `;

  const detailsHtml = `
    <div class="detail"><strong>เรื่อง</strong> ใบเสนอราคา</div>
    <div class="detail"><strong>เรียน</strong> ${customer?.firstName ?? '-'} ${customer?.lastName ?? ''}</div>
    <div class="detail"><strong>รุ่น/ย่อย</strong> ${car?.modelGName ?? '-'} ${car?.modelSub ? ` / ${car.modelSub}` : ''}</div>
    <div class="detail"><strong>สีตัวถัง</strong> ${car?.color ?? '-'}</div>
    <div class="detail"><strong>แรงม้า</strong> ${car?.horsepower ?? '-'}</div>
    <div class="detail"><strong>แรงบิด</strong> ${car?.torque ?? '-'}</div>
  `;

  const accRows = accessories
    .map(
      (a: string, i: number) =>
        `<tr><td style="width:40px">${i + 1}</td><td>${a}</td><td style="width:120px;text-align:right">-</td><td style="width:120px;text-align:right">-</td></tr>`,
    )
    .join('');

  const noteSource = additions?.note ?? additions?.noteText ?? '';
  const noteLines = (noteSource || '')
    .toString()
    .split(/\r?\n/)
    .map((l: string) => l.trim())
    .filter(Boolean);
  const noteHtml = noteLines.length
    ? `<ul>${noteLines.map((l: string) => `<li>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('')}</ul>`
    : '<div>-</div>';

  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div class="page">
      <div class="top-right"><div class="doc-no">${docNo}</div><div class="date-line">วันที่ ${date}</div></div>
      <div class="logo-wrap">${logo ? `<img src="${logo}" style="height:64px"/>` : ''}</div>
      <div class="company">บริษัท อีซูซุเชียงราย จำกัด</div>
      <div class="company-small">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000 • โทร. 053-711605</div>

      <div class="head">
        <div class="left">${detailsHtml}</div>
        <div class="right">${car?.imageUrl ? `<img src="${car.imageUrl}" style="max-width:260px;max-height:160px;object-fit:contain"/>` : `<div class="car-placeholder">(พื้นที่ว่างสำหรับรูปภาพรถ)</div>`}</div>
      </div>

      <div class="install-section">
        <table class="main-table"><thead><tr><th>รายละเอียด</th><th style="width:130px">ราคา</th><th style="width:120px">ส่วนลด</th><th style="width:120px">ส่วนเพิ่ม</th><th style="width:130px">ราคาสุทธิ</th></tr></thead>
        <tbody>
          <tr><td>${car?.modelGName ?? '-'}</td><td style="text-align:right">${helpers.thBaht(priceVal)}</td><td style="text-align:right">${helpers.thBaht(discountVal)}</td><td style="text-align:right">${helpers.thBaht(additionVal)}</td><td style="text-align:right">${helpers.thBaht(netVal)}</td></tr>
        </tbody></table>

        <!-- installment table (reused helper output) -->
        ${installmentHtml}
      </div>

      <div class="acc-section">
        <h4>อุปกรณ์ตกแต่ง</h4>
        <table class="acc-table"><thead><tr><th style="width:40px">ลำดับ</th><th>รายการ</th><th style="width:120px">ราคาต่อหน่วย</th><th style="width:120px">จำนวนเงิน</th></tr></thead><tbody>
          ${accRows}
        <tr><td colspan="3" style="text-align:right;font-weight:700">รวมเป็นเงิน</td><td style="text-align:right;font-weight:700">${helpers.thBaht((data?.accessories || []).reduce((s: any, a: any) => s + (a.price || 0), 0))}</td></tr>
        </tbody></table>
      </div>

      <div class="note-list"><strong>หมายเหตุ</strong>${noteHtml}</div>

      <div class="footer">
        <div class="qr">${brochureQr ? `<img src="${brochureQr}" style="width:100%;height:auto"/>` : ''}</div>
        <div class="sign">ผู้เสนอราคา<br/><br/>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ')}<br/>(ที่ปรึกษาการขาย)<br/>โทร. ${staff?.phoneNumber || ''}</div>
      </div>

    </div></body></html>`;
}
