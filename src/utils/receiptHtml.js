/**
 * Builds the 80mm thermal receipt HTML string from a sale object.
 * Used by both the Checkout page (manual reprint) and the Print Station (auto-print).
 */
export function buildReceiptHtml(data, cashierName) {
  const items = (data.items || []).map(i => `
    <tr>
      <td style="padding:3px 0;border-bottom:1px dotted #ddd">
        <div style="font-weight:600;font-size:12px">${i.productName}</div>
        <div style="color:#666;font-size:11px">₹${parseFloat(i.unitPrice).toFixed(2)} × ${i.quantity}</div>
      </td>
      <td style="text-align:right;padding:3px 0;border-bottom:1px dotted #ddd;font-weight:600;font-size:12px;vertical-align:top">
        ₹${parseFloat(i.lineTotal).toFixed(2)}
      </td>
    </tr>
  `).join('')

  const discountRow = data.discountValue
    ? `<tr>
        <td style="color:#666;font-size:12px">Discount</td>
        <td style="text-align:right;color:#c0392b;font-size:12px">-₹${parseFloat(data.discountValue).toFixed(2)}</td>
       </tr>` : ''

  const customerBlock = data.customerName && data.customerName !== 'Walk-in Customer'
    ? `<hr class="divider">
       <div style="margin-bottom:6px">
         <div style="font-size:10px;color:#666;font-weight:600;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.5px">Bill To</div>
         <div style="font-size:12px;font-weight:600">${data.customerName}</div>
         ${data.customerVillage ? `<div style="font-size:11px;color:#555">${data.customerVillage}</div>` : ''}
         ${data.customerPhone ? `<div style="font-size:11px;color:#555">📞 ${data.customerPhone}</div>` : ''}
       </div>` : ''

  const creditBlock = data.isCredit
    ? `<div style="margin-top:8px;padding:6px 8px;background:#fff0f0;border-radius:6px;border:1px solid #f5c6c3">
         <div style="font-size:11px;color:#c0392b;font-weight:600">⚠️ Credit Sale</div>
         <div style="font-size:10px;color:#c0392b">Amount due: ₹${parseFloat(data.grandTotal).toFixed(2)}</div>
       </div>` : ''

  const dateStr = new Date(data.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${data.receiptNo}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Helvetica Neue',Arial,sans-serif; width:80mm; padding:4mm 4mm 2mm 4mm; font-size:12px; color:#000; background:#fff; }
    @media print {
      /* size: 80mm auto — height matches content so no blank paper after the last line */
      @page { size:80mm auto; margin:0; }
      body { padding:3mm 3mm 1mm 3mm; }
      .no-print { display:none !important; }
    }
    .center { text-align:center; }
    .divider { border:none; border-top:1px dashed #999; margin:6px 0; }
    .divider-solid { border:none; border-top:1px solid #000; margin:6px 0; }
    table { width:100%; border-collapse:collapse; }
    .info-row { display:flex; justify-content:space-between; margin:2px 0; font-size:11px; }
    .total-row td { font-weight:700; font-size:14px; padding-top:6px; }
  </style>
</head>
<body>

  <div class="center" style="margin-bottom:6px">
    <div style="font-size:16px;font-weight:800;letter-spacing:0.5px">Vijayasree Traders</div>
    <div style="font-size:10px;color:#333;line-height:1.6;margin-top:3px">
      Dr No: 4-126-4, VKM Complex (Santhagate)<br>
      Madanapalli, Chittoor(D) - 517325<br>
      📞 9440799079
    </div>
  </div>

  <hr class="divider-solid">

  <div style="font-size:10px;color:#333;line-height:1.7;margin-bottom:4px">
    <div><span style="color:#666">F.No:</span> CTR/35/ADA/FR/2021/26769</div>
    <div><span style="color:#666">P.L.No:</span> CTR/35/JDA/PD/2021/8621, SD/2016/10273</div>
    <div><span style="color:#666">GSTIN:</span> 37AAIPUJ1637K1Z8</div>
    <div><span style="color:#666">State:</span> Andhra Pradesh &nbsp;|&nbsp; Code: 37</div>
  </div>

  <hr class="divider">

  <div style="margin-bottom:6px">
    <div class="info-row"><span style="color:#666">Receipt No</span><span style="font-weight:600">${data.receiptNo}</span></div>
    <div class="info-row"><span style="color:#666">Date & Time</span><span>${dateStr}</span></div>
    <div class="info-row"><span style="color:#666">Cashier</span><span>${cashierName || 'Staff'}</span></div>
    <div class="info-row">
      <span style="color:#666">Payment</span>
      <span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;
        background:${data.isCredit ? '#fff0f0' : '#f0fff4'};
        color:${data.isCredit ? '#c0392b' : '#1a7a1a'};
        border:1px solid ${data.isCredit ? '#f5c6c3' : '#b2dfdb'}">
        ${data.isCredit ? '📋 CREDIT SALE' : (data.paymentMethod || 'CASH')}
      </span>
    </div>
  </div>

  ${customerBlock}

  <hr class="divider">

  <div style="font-size:10px;color:#666;font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Items</div>
  <table><tbody>${items}</tbody></table>

  <hr class="divider">

  <table>
    <tr>
      <td style="font-size:12px;color:#555;padding:2px 0">Subtotal</td>
      <td style="text-align:right;font-size:12px;padding:2px 0">₹${parseFloat(data.subtotal).toFixed(2)}</td>
    </tr>
    ${discountRow}
    <tr><td colspan="2"><hr class="divider" style="margin:4px 0"></td></tr>
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right">₹${parseFloat(data.grandTotal).toFixed(2)}</td>
    </tr>
  </table>

  ${creditBlock}

  <hr class="divider" style="margin-top:8px">

  <div style="text-align:center;margin-top:6px;font-size:11px;color:#555;line-height:1.7">
    <div style="font-weight:600">Thank you for your purchase!</div>
    <div>Goods once sold will not be taken back</div>
    <div>GST Invoice available on request</div>
    <div style="margin-top:3px;font-size:10px;color:#999">Vijayasree Traders · (2025-2026)</div>
  </div>

  <!-- Fallback button — hidden during print, shown only in the preview window -->
  <button class="no-print"
    onclick="window.print()"
    style="display:block;width:100%;padding:12px;margin-top:14px;background:#1a3c1a;
           color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
    🖨️ Print Receipt
  </button>

  <script>
    // Auto-trigger print as soon as the popup finishes loading — no extra tap needed
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>

</body>
</html>`
}

/**
 * Opens the receipt in a new popup window and triggers the browser print dialog.
 * On iOS with AirPrint set up, the cashier just taps Print in the dialog.
 */
export function openReceiptAndPrint(data, cashierName) {
  const w = window.open('', '_blank', 'width=380,height=800')
  if (!w) return // popup was blocked
  w.document.write(buildReceiptHtml(data, cashierName))
  w.document.close()
  w.focus()
}