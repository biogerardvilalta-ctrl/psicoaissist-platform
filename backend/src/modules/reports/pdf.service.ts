import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class PdfService {

    async generateReportPdf(reportData: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header ---
            this.addHeader(doc);

            // --- Title ---
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(18).text(reportData.title || 'Informe Clínico', { align: 'center' });

            // --- Metadata ---
            doc.moveDown();
            doc.font('Helvetica').fontSize(10);
            doc.text(`Paciente: ${reportData.clientName || 'N/A'}`);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`);
            if (reportData.type) {
                doc.text(`Tipo de Informe: ${reportData.type}`);
            }

            // --- Separator ---
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // --- Content ---
            // Simple text rendering for now. 
            // TODO: Implement parsing of basic Markdown/HTML if content is rich text
            doc.font('Helvetica').fontSize(12).text(reportData.content || '(Sin contenido)', {
                align: 'justify',
                lineGap: 4
            });

            // --- Footer ---
            this.addFooter(doc);

            doc.end();
        });
    }

    private addHeader(doc: PDFKit.PDFDocument) {
        // Example Logo placeholder or Clinic Name
        doc.fontSize(20).text('PsycoAI', 50, 50);
        doc.fontSize(10).text('Asistente Clínico Inteligente', 50, 75);
    }

    private addFooter(doc: PDFKit.PDFDocument) {
        const bottom = doc.page.height - 50;
        doc.font('Helvetica').fontSize(8).text(
            'Este documento es confidencial y contiene información clínica protegida.',
            50,
            bottom,
            { align: 'center', width: 500 }
        );
    }
}
