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
                margin: 50
            });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            this.addHeader(doc);
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(18).text(reportData.title || 'Informe Clínico', { align: 'center' });
            doc.moveDown();
            doc.font('Helvetica').fontSize(10);
            doc.text(`Paciente: ${reportData.clientName || 'N/A'}`);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`);
            if (reportData.type) {
                doc.text(`Tipo de Informe: ${reportData.type}`);
            }
            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
            doc.font('Helvetica').fontSize(12).text(reportData.content || '(Sin contenido)', {
                align: 'justify',
                lineGap: 4
            });
            this.addFooter(doc);
            doc.end();
        });
    }
    addHeader(doc) {
        doc.fontSize(20).text('PsycoAI', 50, 50);
        doc.fontSize(10).text('Asistente Clínico Inteligente', 50, 75);
    }
    addFooter(doc) {
        const bottom = doc.page.height - 50;
        doc.font('Helvetica').fontSize(8).text('Este documento es confidencial y contiene información clínica protegida.', 50, bottom, { align: 'center', width: 500 });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map