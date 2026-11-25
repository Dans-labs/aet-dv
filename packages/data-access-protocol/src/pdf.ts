import { jsPDF } from 'jspdf';
import type { FieldConfig } from './formConfig';

const openSansNormalUrl = new URL('./fonts/OpenSans-Regular.ttf', import.meta.url).href;
const openSansMediumUrl = new URL('./fonts/OpenSans-Medium.ttf', import.meta.url).href;
const glegooBoldUrl = new URL('./fonts/Glegoo-Bold.ttf', import.meta.url).href;

async function loadFont(doc: jsPDF, url: string, file: string, name: string, style: string) {
  const buf = await (await fetch(url)).arrayBuffer();
  let bin = '';
  new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
  doc.addFileToVFS(file, btoa(bin));
  doc.addFont(file, name, style);
}

const MARGIN = 25.4;
const HEADER_Y = 12.5; 

export async function buildPdf(title: string, fields: Record<string, FieldConfig>, values: Record<string, string>): Promise<Blob> {
  const doc = new jsPDF();
  await Promise.all([
    loadFont(doc, glegooBoldUrl, 'Glegoo-Bold.ttf', 'Glegoo', 'medium'),
    loadFont(doc, openSansNormalUrl, 'OpenSans-Regular.ttf', 'OpenSans', 'normal'),
    loadFont(doc, openSansMediumUrl, 'OpenSans-Medium.ttf', 'OpenSans', 'medium')
  ]);

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const width = pageW - MARGIN * 2;
  let y = MARGIN;

  const write = (text: string, bold = false, header = false) => {
    doc.setFont(header ? 'Glegoo' : 'OpenSans', bold ? 'medium' : 'normal');
    for (const line of doc.splitTextToSize(text, width)) {
      if (y > pageH - MARGIN) { doc.addPage(); y = MARGIN; }
      doc.text(line, MARGIN, y);
      y += 6;
    }
  };

  doc.setTextColor(220, 37, 31);
  doc.setFontSize(16);
  y += 2;
  write(title, true, true);
  y += 4;

  for (const [name, f] of Object.entries(fields)) {
    if (f.type === 'header') {
      y += 2;
      doc.setFontSize(13);
      doc.setTextColor(0, 58, 73);
      write(f.label, true, true);
      y += 3;
      continue;
    }
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    write(f.label, true);
    const answer = f.options?.find(o => o.value === values[name])?.label ?? values[name] ?? '';
    const extra = values[`${name}Elaboration`];
    write(extra ? `${answer}: ${extra}` : answer || '-');
    y += 3;
  }

  const total = doc.getNumberOfPages();
  doc.setFont('OpenSans', 'normal');
  doc.setFontSize(9);
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('OpenSans', 'normal');
    doc.setTextColor(0, 126, 169);
    doc.text('DANS Data Access Protocol', MARGIN, HEADER_Y);
    doc.text(`Page ${i}/${total}`, pageW - MARGIN, HEADER_Y, { align: 'right' });
  }

  return doc.output('blob');
}