export type Helpers = {
  loadLogoBase64: () => Promise<string>;
  thFormatNumber: (n?: number | null) => string;
  thBaht: (n?: number | null) => string;
  createBrochureUrl: (s?: string | null) => string | null;
  getQrDataUrl: (u: string, size?: number) => Promise<string>;
  buildSharedCss: () => string;
  buildInstallmentTable: (inst: any[], car: any) => string;
};

export async function renderDefault(
  data: any,
  opts: { preview?: boolean } | undefined,
  helpers: Helpers,
): Promise<string> {
  const isPreview = !!opts?.preview;
  const logo = await helpers.loadLogoBase64();
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
  const brochureUrl = helpers.createBrochureUrl(car?.modelGName);
  let brochureQr = '';
  if (brochureUrl) {
    brochureQr = await helpers.getQrDataUrl(brochureUrl, 120);
  }
  const extras: string[] = [];
  if (add?.cmi) extras.push('พรบ.');
  if (add?.insurance) extras.push('ประกันภัย');
  if (add?.fuelValue) extras.push(`ค่าน้ำมัน ${helpers.thBaht(add.fuelValue)}`);
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
    ? helpers.buildInstallmentTable(instAll, car)
    : '';
  const cashHtml = isCash
    ? `<div class="section"><table class="cash-table"><thead><tr><th>ส่วนลด</th><th>ส่วนเพิ่ม</th><th>ราคาสุทธิ</th></tr></thead><tbody><tr><td>${helpers.thBaht(cash?.specialDiscount)}</td><td>${helpers.thBaht(cashAddition)}</td><td>${helpers.thBaht(cash?.totalPrice)}</td></tr></tbody></table></div>`
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
  return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet"><style>${helpers.buildSharedCss()}</style></head><body><div class="content"><div class="header"><div class="brand">${logo ? `<img class="logo" src="${logo}"/>` : ''}<div class="company-text"><div class="company-name">บริษัท อีซูซุเชียงราย จำกัด</div><div class="company-addr">145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000</div><div class="company-tel">โทร. 053-711605</div></div></div><div class="right-meta"><div class="date-line">วันที่ ${date}</div><div class="doc-no">${docNo}</div></div></div><h1>ใบเสนอราคา</h1><div style="font-size:13px; margin-bottom:6px">เรียน ${customer?.firstName ?? ''} ${customer?.lastName ?? ''}</div><div class="car-section"><div class="car-photo">${car?.imageUrl ? `<img src="${car.imageUrl}"/>` : 'รูปภาพรถ'}</div><div class="car-info"><div><strong>รุ่นปีรถ:</strong> ${car?.modelClass ?? ''}</div><div><strong>รุ่นรถ:</strong> ${car?.modelGName ?? ''}</div><div><strong>สีตัวถัง:</strong> ${car?.color ?? ''}</div><div><strong>แรงม้า:</strong> ${car?.horsepower ?? '190'} แรงม้า</div><div><strong>แรงบิด:</strong> ${car?.torque ?? '450'} นิวตัน-เมตร</div></div><div class="qr-block"><div class="qr-box">${brochureQr ? `<img class="qr-img" src="${brochureQr}"/>` : brochureUrl ? '<span class="muted" style="font-size:11px">QR error</span>' : '<span class="muted" style="font-size:11px">No QR</span>'}</div><div class="qr-label">รายละเอียด<br/>เพิ่มเติม</div></div></div><div class="section"><span style="text-decoration:underline">เงื่อนไขการชำระ : ${paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'installment' ? 'ผ่อนชำระ' : ''}</span></div>${cashHtml}${installmentHtml}${accessoriesHtml}<div class="section"><div class="section-title">หมายเหตุ</div><div class="note-box"><ul class="note-list">${noteItems}</ul></div><div class="thanks">บริษัท อีซูซุเชียงราย จำกัด ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้ความสนใจในผลิตภัณฑ์ของทางบริษัทและหวังเป็นอย่างยิ่งว่าเราจะได้รับการตอบรับที่ดีจากท่าน</div></div></div><div class="staff-footer">ผู้เสนอราคา<br/>${[staff?.firstName, staff?.lastName].filter(Boolean).join(' ')}<br/>(ที่ปรึกษาการขาย)<br/>โทร. ${staff?.phoneNumber ?? ''}</div></body></html>`;
}
