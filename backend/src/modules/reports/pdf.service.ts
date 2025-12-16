import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class PdfService {

    async generateReportPdf(reportData: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true // Enable buffer pages for page count
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Brand Colors ---
            const PRIMARY_COLOR = '#4F46E5'; // Indigo 600
            const SECONDARY_COLOR = '#1E293B'; // Slate 800
            const ACCENT_COLOR = '#F1F5F9'; // Slate 100
            const TEXT_COLOR = '#334155'; // Slate 700

            // --- Sidebar Decoration ---
            // Draw a sidebar strip on every page
            const range = doc.bufferedPageRange(); // Will apply at end, but we can do first page now

            // --- Header & Logo ---
            this.drawHeader(doc, PRIMARY_COLOR, SECONDARY_COLOR);

            // --- Title Section ---
            doc.moveDown(3);
            doc.font('Helvetica-Bold').fontSize(24).fillColor(PRIMARY_COLOR)
                .text(reportData.title || 'INFORME CLÍNICO', { align: 'left' });

            // --- Metadata Box ---
            doc.moveDown(1);
            const startY = doc.y;
            doc.roundedRect(50, startY, 495, 85, 4).fill(ACCENT_COLOR);

            doc.fillColor(TEXT_COLOR).fontSize(10);

            // Left Column
            doc.font('Helvetica-Bold').text('PACIENTE:', 70, startY + 15);
            doc.font('Helvetica').text(reportData.clientName || 'N/A', 70, startY + 30);

            doc.font('Helvetica-Bold').text('FECHA DE EMISIÓN:', 70, startY + 50);
            doc.font('Helvetica').text(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }), 70, startY + 65);

            // Right Column
            doc.font('Helvetica-Bold').text('TIPO DE INFORME:', 300, startY + 15);
            doc.font('Helvetica').text(reportData.type || 'General', 300, startY + 30);

            doc.font('Helvetica-Bold').text('ID REFERENCIA:', 300, startY + 50);
            doc.font('Helvetica').text(`REF-${Date.now().toString().slice(-8)}`, 300, startY + 65);

            doc.moveDown(4); // Move past the box

            // --- Content ---
            doc.fillColor(TEXT_COLOR);
            // We need to reset y to after the box manually because text() with absolute position doesn't move cursor
            doc.y = startY + 110;

            this.parseHtmlContent(doc, reportData.content || '(Sin contenido)', PRIMARY_COLOR);

            // --- Footer & Pagination ---
            // We'll apply this to all pages at the end ideally, but for now simple footer on current is fine.
            // For proper "all pages", we iterate buffered pages.

            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);

                // Sidebar Strip
                doc.rect(0, 0, 15, doc.page.height).fill(PRIMARY_COLOR);

                // Footer
                this.addFooter(doc, i + 1, pages.count);
            }

            doc.end();
        });
    }

    private drawHeader(doc: PDFKit.PDFDocument, primary: string, secondary: string) {
        // Logo Placeholder (Heart icon representation)
        // Draw a circle background
        doc.circle(70, 60, 20).fill(primary);
        // White heart-ish shape (simplified as text for now or vector path)
        doc.font('Helvetica-Bold').fontSize(20).fillColor('white').text('P', 63, 53);

        // Text Logo
        doc.font('Helvetica-Bold').fontSize(20).fillColor(secondary).text('PsycoAI', 100, 45);
        doc.font('Helvetica').fontSize(10).fillColor('#64748B').text('Asistente Clínico Inteligente', 100, 68);

        // Top right decorative line
        doc.moveTo(350, 60).lineTo(545, 60).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
    }

    private addFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number) {
        const bottom = doc.page.height - 50;

        doc.moveTo(50, bottom - 10).lineTo(545, bottom - 10).lineWidth(0.5).strokeColor('#E2E8F0').stroke();

        doc.font('Helvetica').fontSize(8).fillColor('#94A3B8');
        doc.text('Este documento contiene información clínica confidencial. El uso está restringido al profesional autorizado.', 50, bottom, { width: 350 });

        doc.text(`Página ${pageNum} de ${totalPages}`, 450, bottom, { align: 'right', width: 100 });
    }

    private parseHtmlContent(doc: PDFKit.PDFDocument, html: string, headerColor: string) {
        // 1. Pre-process specific structures
        // Replace table structure with text-based layout for PDF
        let processedHtml = html
            // Tables: layout rows as lines
            .replace(/<tr[^>]*>/g, '\n')
            .replace(/<\/td>\s*<td[^>]*>/g, '  |  ') // Cell separator
            .replace(/<\/tr>/g, '')
            .replace(/<table[^>]*>/g, '\n')
            .replace(/<\/table>/g, '\n')
            // Headers
            .replace(/<h[1][^>]*>(.*?)<\/h[1]>/g, '\n#H1#$1#H1#\n')
            .replace(/<h[2][^>]*>(.*?)<\/h[2]>/g, '\n#H2#$1#H2#\n')
            .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/g, '\n#H3#$1#H3#\n')
            // Lists
            .replace(/<ul>/g, '\n')
            .replace(/<\/ul>/g, '\n')
            .replace(/<li>/g, '\n• ')
            .replace(/<\/li>/g, '')
            // Paragraphs and breaks
            .replace(/<p[^>]*>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<div[^>]*>/g, '\n')
            .replace(/<\/div>/g, '')
            .replace(/<hr\s*\/?>/g, '\n');

        // 2. Decode entities
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

        // 3. Remove any remaining tags (cleanup)
        // Keep our markers #H1#, #H2#, etc.
        processedHtml = processedHtml.replace(/<[^>]+>/g, '');

        // 4. Process lines
        const lines = processedHtml.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('#H1#')) {
                const text = trimmed.replace(/#H1#/g, '').trim();
                doc.moveDown(0.8);
                doc.font('Helvetica-Bold').fontSize(16).fillColor(headerColor).text(text.toUpperCase());
                doc.fillColor('#334155').fontSize(11); // reset
            } else if (trimmed.startsWith('#H2#')) {
                const text = trimmed.replace(/#H2#/g, '').trim();
                doc.moveDown(0.6);
                doc.font('Helvetica-Bold').fontSize(13).fillColor(headerColor).text(text);
                doc.fillColor('#334155').fontSize(11); // reset
            } else if (trimmed.startsWith('#H3#')) {
                const text = trimmed.replace(/#H3#/g, '').trim();
                doc.moveDown(0.4);
                doc.font('Helvetica-Bold').fontSize(11).fillColor('#475569').text(text);
                doc.fillColor('#334155').fontSize(11); // reset
            } else if (trimmed.startsWith('•')) {
                doc.moveDown(0.2);
                doc.font('Helvetica').fontSize(11).text(trimmed, { indent: 15 });
            } else if (line.includes('Fdo:')) {
                // Signature simulation area
                doc.moveDown(2);
                doc.font('Helvetica-Oblique').fontSize(10).text(trimmed, { align: 'center' });
            } else {
                // Regular text
                doc.font('Helvetica').fontSize(11).text(trimmed, { align: 'justify' });
                doc.moveDown(0.2);
            }
        });
    }
}
