"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
let PdfService = class PdfService {
    async generateReportPdf(reportData) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            const PRIMARY_COLOR = '#4F46E5';
            const SECONDARY_COLOR = '#1E293B';
            const ACCENT_COLOR = '#F1F5F9';
            const TEXT_COLOR = '#334155';
            const range = doc.bufferedPageRange();
            this.drawHeader(doc, PRIMARY_COLOR, SECONDARY_COLOR);
            doc.moveDown(3);
            doc.font('Helvetica-Bold').fontSize(24).fillColor(PRIMARY_COLOR)
                .text(reportData.title || 'INFORME CLÍNICO', { align: 'left' });
            doc.moveDown(1);
            const startY = doc.y;
            doc.roundedRect(50, startY, 495, 85, 4).fill(ACCENT_COLOR);
            doc.fillColor(TEXT_COLOR).fontSize(10);
            doc.font('Helvetica-Bold').text('PACIENTE:', 70, startY + 15);
            doc.font('Helvetica').text(reportData.clientName || 'N/A', 70, startY + 30);
            doc.font('Helvetica-Bold').text('FECHA DE EMISIÓN:', 70, startY + 50);
            doc.font('Helvetica').text(new Date().toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 70, startY + 65);
            doc.font('Helvetica-Bold').text('TIPO DE INFORME:', 300, startY + 15);
            doc.font('Helvetica').text(reportData.type || 'General', 300, startY + 30);
            doc.font('Helvetica-Bold').text('ID REFERENCIA:', 300, startY + 50);
            doc.font('Helvetica').text(`REF-${Date.now().toString().slice(-8)}`, 300, startY + 65);
            doc.moveDown(4);
            doc.fillColor(TEXT_COLOR);
            doc.y = startY + 110;
            this.parseHtmlContent(doc, reportData.content || '(Sin contenido)', PRIMARY_COLOR);
            doc.moveDown(4);
            const signatureY = doc.y;
            if (signatureY > doc.page.height - 200) {
                doc.addPage();
            }
            doc.moveDown(2);
            doc.rect(50, doc.y, 495, 45).fill('#F8FAFC');
            doc.fillColor('#64748B').fontSize(9);
            doc.text('Aquest informe ha estat redactat amb el suport d’una eina d’intel·ligència artificial i revisat, validat i assumit per un/a professional col·legiat/da.', 60, doc.y - 35, { width: 475, align: 'center' });
            doc.moveDown(2);
            doc.font('Helvetica-Bold').fontSize(11).fillColor(TEXT_COLOR);
            doc.text('Signat: El/La Psicòleg/òloga', 50, doc.y, { align: 'left' });
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(11);
            doc.text(reportData.psychologistName || '[Nom i Cognoms]', { align: 'left' });
            doc.moveDown(0.2);
            doc.text(`Núm. Col·legiat/da: ${reportData.professionalNumber || '[Núm]'}`, { align: 'left' });
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.rect(0, 0, 15, doc.page.height).fill(PRIMARY_COLOR);
                this.addFooter(doc, i + 1, pages.count, reportData.psychologistName, reportData.professionalNumber);
            }
            doc.end();
        });
    }
    drawHeader(doc, primary, secondary) {
        doc.circle(70, 60, 20).fill(primary);
        doc.font('Helvetica-Bold').fontSize(20).fillColor('white').text('P', 63, 53);
        doc.font('Helvetica-Bold').fontSize(20).fillColor(secondary).text('PsychoAI', 100, 45);
        doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Asistente Clínico Inteligente', 100, 68);
        doc.moveTo(350, 60).lineTo(545, 60).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
    }
    addFooter(doc, pageNum, totalPages, psychologistName, professionalNumber) {
        const bottom = doc.page.height - 50;
        doc.moveTo(50, bottom - 25).lineTo(545, bottom - 25).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
        if (psychologistName) {
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569');
            doc.text(`${psychologistName}`, 50, bottom - 10, { width: 300 });
            doc.font('Helvetica').fontSize(8).fillColor('#64748B');
            if (professionalNumber) {
                doc.text(`Col. Nº ${professionalNumber}`, 50, bottom + 2);
            }
        }
        doc.font('Helvetica').fontSize(8).fillColor('#94A3B8');
        doc.text('Este documento contiene información clínica confidencial. El uso está restringido al profesional autorizado.', 200, bottom, { width: 220, align: 'center' });
        doc.text(`Página ${pageNum} de ${totalPages}`, 450, bottom, { align: 'right', width: 100 });
    }
    parseHtmlContent(doc, html, headerColor) {
        let processedHtml = html
            .replace(/<tr[^>]*>/g, '\n')
            .replace(/<\/td>\s*<td[^>]*>/g, '  |  ')
            .replace(/<\/tr>/g, '')
            .replace(/<table[^>]*>/g, '\n')
            .replace(/<\/table>/g, '\n')
            .replace(/<h[1][^>]*>(.*?)<\/h[1]>/g, '\n#H1#$1#H1#\n')
            .replace(/<h[2][^>]*>(.*?)<\/h[2]>/g, '\n#H2#$1#H2#\n')
            .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/g, '\n#H3#$1#H3#\n')
            .replace(/<ul>/g, '\n')
            .replace(/<\/ul>/g, '\n')
            .replace(/<li>/g, '\n• ')
            .replace(/<\/li>/g, '')
            .replace(/<p[^>]*>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<div[^>]*>/g, '\n')
            .replace(/<\/div>/g, '')
            .replace(/<hr\s*\/?>/g, '\n');
        processedHtml = processedHtml
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&oacute;/g, 'ó')
            .replace(/&aacute;/g, 'á')
            .replace(/&eacute;/g, 'é')
            .replace(/&iacute;/g, 'í')
            .replace(/&uacute;/g, 'ú')
            .replace(/&ntilde;/g, 'ñ')
            .replace(/&Oacute;/g, 'Ó')
            .replace(/&Aacute;/g, 'Á')
            .replace(/&Eacute;/g, 'É')
            .replace(/&Iacute;/g, 'Í')
            .replace(/&Uacute;/g, 'Ú')
            .replace(/&Ntilde;/g, 'Ñ');
        processedHtml = processedHtml.replace(/<[^>]+>/g, '');
        const lines = processedHtml.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed)
                return;
            if (trimmed.startsWith('#H1#')) {
                const text = trimmed.replace(/#H1#/g, '').trim();
                doc.moveDown(0.8);
                doc.font('Helvetica-Bold').fontSize(16).fillColor(headerColor).text(text.toUpperCase());
                doc.fillColor('#334155').fontSize(11);
            }
            else if (trimmed.startsWith('#H2#')) {
                const text = trimmed.replace(/#H2#/g, '').trim();
                doc.moveDown(0.6);
                doc.font('Helvetica-Bold').fontSize(13).fillColor(headerColor).text(text);
                doc.fillColor('#334155').fontSize(11);
            }
            else if (trimmed.startsWith('#H3#')) {
                const text = trimmed.replace(/#H3#/g, '').trim();
                doc.moveDown(0.4);
                doc.font('Helvetica-Bold').fontSize(11).fillColor('#475569').text(text);
                doc.fillColor('#334155').fontSize(11);
            }
            else if (trimmed.startsWith('•')) {
                doc.moveDown(0.2);
                doc.font('Helvetica').fontSize(11).text(trimmed, { indent: 15 });
            }
            else if (line.includes('Fdo:')) {
                doc.moveDown(2);
                doc.font('Helvetica-Oblique').fontSize(10).text(trimmed, { align: 'center' });
            }
            else {
                doc.font('Helvetica').fontSize(11).text(trimmed, { align: 'justify' });
                doc.moveDown(0.2);
            }
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map