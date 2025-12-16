export declare class PdfService {
    generateReportPdf(reportData: any): Promise<Buffer>;
    private drawHeader;
    private addFooter;
    private parseHtmlContent;
}
