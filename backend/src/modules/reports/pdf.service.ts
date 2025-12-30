import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

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
            const branding = reportData.branding || {};
            const PRIMARY_COLOR = branding.primaryColor || '#4F46E5'; // Indigo 600 or Custom
            const SECONDARY_COLOR = branding.secondaryColor || '#1E293B'; // Slate 800 or Custom
            const ACCENT_COLOR = '#F1F5F9'; // Slate 100
            const TEXT_COLOR = '#334155'; // Slate 700

            // --- Sidebar Decoration ---
            // Draw a sidebar strip on every page
            const range = doc.bufferedPageRange(); // Will apply at end, but we can do first page now

            // --- Header & Logo ---
            this.drawHeader(doc, PRIMARY_COLOR, SECONDARY_COLOR, branding);

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
            doc.font('Helvetica').text(new Date().toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 70, startY + 65);

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

            // --- Signature Block ---
            // --- Signature Block ---
            // Calculate required space for signature (~150pt)
            const requiredSpace = 150;
            // Check usage against margin-adjusted bottom
            const bottomMargin = 50;
            const spaceRemaining = doc.page.height - doc.y - bottomMargin;

            // Only add page if we really don't have space
            if (spaceRemaining < requiredSpace) {
                doc.addPage();
            }

            doc.moveDown(2);

            // --- Mandatory Legal Disclaimer (3.2) ---
            doc.moveDown(2);
            const disclaimerY = doc.y;
            doc.rect(50, disclaimerY, 495, 45).fill('#F8FAFC');
            doc.fillColor('#64748B').fontSize(9);
            doc.text(
                'Aquest informe ha estat redactat amb el suport d’una eina d’intel·ligència artificial i revisat, validat i assumit per un/a professional col·legiat/da.',
                60,
                disclaimerY + 12, // Manual padding inside box
                { width: 475, align: 'center' }
            );
            // Reset Y after text with absolute positioning inside box
            doc.y = disclaimerY + 45;

            doc.moveDown(2);

            doc.font('Helvetica-Bold').fontSize(11).fillColor(TEXT_COLOR);
            doc.text('Signat: El/La Psicòleg/òloga', 50, doc.y, { align: 'left' });

            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(11);
            doc.text(reportData.psychologistName || '[Nom i Cognoms]', { align: 'left' });

            doc.moveDown(0.2);
            doc.text(`Núm. Col·legiat/da: ${reportData.professionalNumber || '[Núm]'}`, { align: 'left' });

            // --- Footer & Pagination ---
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);

                // Sidebar Strip
                doc.rect(0, 0, 15, doc.page.height).fill(PRIMARY_COLOR);

                // Footer
                this.addFooter(doc, i + 1, pages.count, reportData.psychologistName, reportData.professionalNumber);
            }

            doc.end();
        });
    }

    private drawHeader(doc: PDFKit.PDFDocument, primary: string, secondary: string, branding: any = {}) {
        // Logo Rendering
        let logoDrawn = false;

        if (branding.showLogo !== false && branding.logoUrl) {
            try {
                // Determine file path. branding.logoUrl is likely '/uploads/logos/filename.ext'
                // We need to strip the leading slash or map URL to file system

                // Assuming logoUrl starts with /uploads/logos/
                const relativePath = branding.logoUrl.startsWith('/') ? branding.logoUrl.substring(1) : branding.logoUrl;
                const logoPath = join(process.cwd(), relativePath);

                if (existsSync(logoPath)) {
                    // Draw image
                    doc.image(logoPath, 50, 45, { width: 50 }); // Adjust position and size
                    logoDrawn = true;
                }
            } catch (e) {
                console.error("Failed to load logo image:", e);
            }
        }

        if (!logoDrawn && branding.showLogo !== false) {
            // Fallback to circle placeholder
            doc.circle(70, 60, 20).fill(primary);
            const letter = (branding.companyName || 'P').charAt(0).toUpperCase();
            doc.font('Helvetica-Bold').fontSize(20).fillColor('white').text(letter, 63, 53);
        }

        const title = branding.companyName || 'PsicoAIssist';
        const subtitle = branding.companyName ? 'Informe Clínico Personalizado' : 'Asistente Clínico Inteligente';

        // Adjust text position based on logo presence? 
        // Current placeholder is at x=70 (center). Image is at x=50, width 50. Center roughly same.
        // Title starts at x=100.

        doc.font('Helvetica-Bold').fontSize(20).fillColor(secondary).text(title, 110, 45);
        doc.font('Helvetica').fontSize(10).fillColor('#64748B').text(subtitle, 110, 68);

        doc.moveTo(350, 60).lineTo(545, 60).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
    }

    private addFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number, psychologistName?: string, professionalNumber?: string) {
        // Temporarily disable bottom margin to allow writing in the footer area without triggering auto-addPage
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        const bottom = doc.page.height - 40; // Write inside the margin area (margin was 50)

        doc.moveTo(50, bottom - 15).lineTo(545, bottom - 15).lineWidth(0.5).strokeColor('#E2E8F0').stroke();

        // Professional Info
        if (psychologistName) {
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569');
            doc.text(`${psychologistName}`, 50, bottom - 10, { width: 300, lineBreak: false });
            doc.font('Helvetica').fontSize(8).fillColor('#64748B');
            if (professionalNumber) {
                // Ensure text calls do not trigger flow weirdness
                doc.text(`Col. Nº ${professionalNumber}`, 50, bottom + 2, { lineBreak: false });
            }
        }

        doc.font('Helvetica').fontSize(8).fillColor('#94A3B8');
        doc.text('Este documento contiene información clínica confidencial. El uso está restringido al profesional autorizado.', 200, bottom, { width: 220, align: 'center', lineBreak: false });

        doc.text(`Página ${pageNum} de ${totalPages}`, 450, bottom, { align: 'right', width: 100, lineBreak: false });

        // Restore margin
        doc.page.margins.bottom = oldBottomMargin;
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
