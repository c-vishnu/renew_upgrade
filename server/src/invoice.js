/**
 * Server-rendered PDF invoice (tax invoice) for downloads.
 */

import fs from 'node:fs';
import PDFDocument from 'pdfkit';
import { MODULES } from './catalog.js';

const FONT_SETS = [
  { regular: 'C:/Windows/Fonts/segoeui.ttf', bold: 'C:/Windows/Fonts/segoeuib.ttf' },
  { regular: 'C:/Windows/Fonts/arial.ttf', bold: 'C:/Windows/Fonts/arialbd.ttf' },
  { regular: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', bold: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' },
  { regular: '/System/Library/Fonts/Supplemental/Arial.ttf', bold: '/System/Library/Fonts/Supplemental/Arial Bold.ttf' },
];

const exists = (file) => {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
};

const pickFonts = () => FONT_SETS.find((set) => exists(set.regular) && exists(set.bold)) || null;

const INK = '#101828';
const MUTED = '#667085';
const LINE = '#E4E7EC';
const BLUE = '#2563EB';

const PAYMENT_LABELS = { upi: 'UPI', card: 'Credit / debit card', netbanking: 'Net banking' };

function formatDate(iso) {
  const [year, month, day] = String(iso).slice(0, 10).split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
}

export function renderInvoicePdf(invoice, stream) {
  const fonts = pickFonts();
  const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `${invoice.number} - Wayvida HRMS` } });

  if (fonts) {
    doc.registerFont('body', fonts.regular);
    doc.registerFont('bold', fonts.bold);
  }
  const font = (weight) => (fonts ? (weight === 'bold' ? 'bold' : 'body') : weight === 'bold' ? 'Helvetica-Bold' : 'Helvetica');
  const money = (value) => {
    const amount = Number(value || 0).toLocaleString('en-IN');
    return fonts ? `\u20B9${amount}` : `INR ${amount}`;
  };

  const left = 48;
  const right = doc.page.width - 48;

  doc.pipe(stream);

  doc.font(font('bold')).fontSize(16).fillColor(INK).text('Wayvida HRMS', left, 48);
  doc.font(font()).fontSize(9).fillColor(MUTED)
    .text('Wayvida Technologies Pvt Ltd', left, 70)
    .text('GSTIN 32ABCDE1234F1Z5', left)
    .text('accounts@wayvida.com', left);

  doc.font(font('bold')).fontSize(20).fillColor(INK).text('Tax invoice', left, 48, { align: 'right' });
  doc.font(font()).fontSize(9).fillColor(MUTED);
  doc.text(`Invoice no. ${invoice.number}`, { align: 'right' });
  doc.text(`Invoice date ${formatDate(invoice.date)}`, { align: 'right' });
  doc.text(`Status ${invoice.status}`, { align: 'right' });

  doc.moveTo(left, 132).lineTo(right, 132).strokeColor(LINE).lineWidth(1).stroke();

  const customer = invoice.customer || {};
  doc.font(font('bold')).fontSize(9).fillColor(MUTED).text('BILLED TO', left, 148);
  doc.font(font('bold')).fontSize(11).fillColor(INK).text(customer.companyName || 'Customer', left, 164);
  doc.font(font()).fontSize(9).fillColor(MUTED);
  doc.text(`${customer.contactName || ''}`, left);
  doc.text(`${customer.email || ''}`, left);
  doc.text(`${customer.gstin ? `GSTIN ${customer.gstin}` : ''}`, left);
  doc.text(`${customer.address || ''}`, left, doc.y, { width: 230 });

  doc.font(font('bold')).fontSize(9).fillColor(MUTED).text('SUBSCRIPTION', 320, 148);
  doc.font(font()).fontSize(9).fillColor(INK);
  doc.text(`${invoice.planName} plan`, 320, 164);
  doc.fillColor(MUTED).text(`Term: ${invoice.termLabel} (${invoice.termMonths} months)`, 320);
  doc.text(`Period: ${formatDate(invoice.periodStart)} to ${formatDate(invoice.periodEnd)}`, 320);
  doc.text(`Paid via ${PAYMENT_LABELS[invoice.paymentMethod] || invoice.paymentMethod}`, 320);

  let y = Math.max(doc.y + 24, 260);
  doc.rect(left, y, right - left, 24).fillColor('#F9FAFB').fill();
  doc.font(font('bold')).fontSize(9).fillColor(MUTED);
  doc.text('DESCRIPTION', left + 12, y + 8);
  doc.text('RATE', 330, y + 8, { width: 60, align: 'right' });
  doc.text('MONTHS', 400, y + 8, { width: 50, align: 'right' });
  doc.text('AMOUNT', right - 90, y + 8, { width: 78, align: 'right' });
  y += 24;

  doc.font(font()).fontSize(9);
  for (const line of invoice.lines || []) {
    const height = 30;
    doc.moveTo(left, y + height).lineTo(right, y + height).strokeColor(LINE).stroke();
    doc.font(font('bold')).fillColor(INK).text(line.label, left + 12, y + 7, { width: 250 });
    if (line.detail) {
      doc.font(font()).fontSize(8).fillColor(MUTED)
        .text(line.detail, left + 12, y + 18, { width: 250, height: 10, ellipsis: true });
    }
    doc.font(font()).fontSize(9).fillColor(INK);
    doc.text(money(line.monthly), 330, y + 10, { width: 60, align: 'right' });
    doc.text(String(line.months), 400, y + 10, { width: 50, align: 'right' });
    doc.text(money(line.amount), right - 90, y + 10, { width: 78, align: 'right' });
    y += height;
  }

  const row = (label, value, strong) => {
    doc.font(font(strong ? 'bold' : 'bold')).fontSize(strong ? 11 : 9)
      .fillColor(strong ? INK : MUTED)
      .text(label, 330, y + 4, { width: 160, align: 'right' });
    doc.font(font('bold')).fontSize(strong ? 11 : 9).fillColor(INK)
      .text(value, right - 90, y + 4, { width: 78, align: 'right' });
    y += 18;
  };

  y += 10;
  row('Subtotal', money(invoice.subtotal));
  if (invoice.credit > 0) row(`Credit - ${invoice.creditNote || 'unused balance'}`, `- ${money(invoice.credit)}`);
  row(`GST @ ${Math.round((invoice.gstRate || 0) * 100)}%`, money(invoice.tax));
  doc.moveTo(320, y + 2).lineTo(right, y + 2).strokeColor(LINE).stroke();
  y += 6;
  row('Total paid', money(invoice.total), true);

  const modules = [...(invoice.moduleIds || []), ...(invoice.addonModuleIds || [])];
  if (modules.length) {
    const names = modules.map((id) => MODULES.find((module) => module.id === id)?.name || id);
    doc.font(font()).fontSize(8).fillColor(MUTED)
      .text(`Modules covered: ${names.join(', ')}`, left, doc.page.height - 90, { width: right - left });
  }
  doc.font(font()).fontSize(8).fillColor(MUTED)
    .text('This is a computer generated invoice and does not require a signature.', left, doc.page.height - 72,
      { width: right - left, align: 'center' });

  doc.end();
}
