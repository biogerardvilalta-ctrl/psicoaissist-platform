import { Injectable } from '@nestjs/common';
import { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer, AlignmentType, BorderStyle } from 'docx';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

@Injectable()
export class WordService {

    async generateReportDocx(reportData: any): Promise<Buffer> {
        // --- Branding & Colors ---
        const branding = reportData.branding || {};
        const primaryColor = branding.primaryColor || '#4F46E5';
        const primaryColorClean = primaryColor.replace('#', '');

        // --- Header Content ---
        const headerChildren = this.createHeader(branding, primaryColorClean);

        // --- Footer Content ---
        const footerChildren = this.createFooter(reportData.psychologistName, reportData.professionalNumber);

        // --- Main Content Sections ---
        const contentChildren: any[] = [];

        // 1. Title
        contentChildren.push(
            new Paragraph({
                text: reportData.title || 'INFORME CLÍNICO',
                heading: 'Heading1',
                alignment: AlignmentType.LEFT,
                spacing: {
                    after: 400,
                },
                run: {
                    color: primaryColorClean,
                    bold: true,
                    size: 48, // 24pt
                }
            })
        );

        // 2. Metadata Box (Simulation with Paragraphs and shading, as Boxes are complex)
        contentChildren.push(this.createMetadataField('PACIENTE:', reportData.clientName || 'N/A'));
        contentChildren.push(this.createMetadataField('TIPO DE INFORME:', reportData.type || 'General'));
        contentChildren.push(this.createMetadataField('FECHA DE EMISIÓN:', new Date().toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })));
        contentChildren.push(this.createMetadataField('ID REFERENCIA:', `REF-${Date.now().toString().slice(-8)}`));

        contentChildren.push(new Paragraph({ spacing: { after: 600 } })); // Spacer

        // 3. Body Content
        const parsedContent = this.parseHtmlToDocx(reportData.content || '(Sin contenido)', primaryColorClean);
        contentChildren.push(...parsedContent);

        // 4. Disclaimer & Signature
        contentChildren.push(new Paragraph({ spacing: { before: 600 } }));

        // Disclaimer Box simulation
        contentChildren.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Aquest informe ha estat redactat amb el suport d’una eina d’intel·ligència artificial i revisat, validat i assumit per un/a professional col·legiat/da.',
                        italics: true,
                        color: '64748B',
                        size: 18 // 9pt
                    })
                ],
                alignment: AlignmentType.CENTER,
                border: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                    left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                    right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                },
                shading: {
                    fill: 'F8FAFC'
                },
                spacing: {
                    before: 200,
                    after: 400
                },
                indent: {
                    left: 720, // ~0.5 inch
                    right: 720
                }
            })
        );

        // Signature
        contentChildren.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Signat: El/La Psicòleg/òloga',
                        bold: true,
                        size: 22
                    })
                ],
                spacing: {
                    before: 400
                }
            })
        );
        contentChildren.push(
            new Paragraph({
                text: reportData.psychologistName || '[Nom i Cognoms]',
                spacing: { before: 100 }
            })
        );
        contentChildren.push(
            new Paragraph({
                text: `Núm. Col·legiat/da: ${reportData.professionalNumber || '[Núm]'}`,
            })
        );


        // --- Document Assembly ---
        const doc = new Document({
            sections: [{
                headers: {
                    default: new Header({
                        children: headerChildren
                    }),
                },
                footers: {
                    default: new Footer({
                        children: footerChildren
                    }),
                },
                properties: {},
                children: contentChildren,
            }],
        });

        return await Packer.toBuffer(doc);
    }

    private createHeader(branding: any, primaryColor: string): Paragraph[] {
        const children: any[] = [];

        // Logo
        if (branding.showLogo !== false && branding.logoUrl) {
            try {
                const relativePath = branding.logoUrl.startsWith('/') ? branding.logoUrl.substring(1) : branding.logoUrl;
                const logoPath = join(process.cwd(), relativePath);

                if (existsSync(logoPath)) {
                    const imageBuffer = readFileSync(logoPath);
                    children.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 50,
                                        height: 50,
                                    },
                                } as any),
                                new TextRun({ // Spacer
                                    text: "\t",
                                }),
                                new TextRun({
                                    text: branding.companyName || 'PsicoAIssist',
                                    bold: true,
                                    size: 40, // 20pt
                                    color: '1E293B', // Secondary/Slate
                                })
                            ],
                            alignment: AlignmentType.LEFT
                        })
                    );
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: branding.companyName ? 'Informe Clínico Personalizado' : 'Asistente Clínico Inteligente',
                                    color: '64748B',
                                    size: 20
                                })
                            ],
                            indent: {
                                left: 1440 // Align under title roughly
                            },
                            border: {
                                bottom: {
                                    color: "E2E8F0",
                                    space: 1,
                                    style: BorderStyle.SINGLE,
                                    size: 6
                                }
                            },
                            spacing: {
                                after: 400
                            }
                        })
                    );
                    return children;
                }
            } catch (e) {
                console.error("WordService: Failed to add logo", e);
            }
        }

        // Fallback Header without image
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: branding.companyName || 'PsicoAIssist',
                        bold: true,
                        size: 40,
                        color: '1E293B',
                    })
                ],
                border: {
                    bottom: {
                        color: "E2E8F0",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6
                    }
                },
                spacing: {
                    after: 400
                }
            })
        );

        return children;
    }

    private createFooter(psychologistName: string, professionalNumber: string): Paragraph[] {
        return [
            new Paragraph({
                children: [
                    new TextRun({
                        text: psychologistName || '',
                        bold: true,
                        size: 18,
                        color: '475569'
                    }),
                    new TextRun({
                        text: ` | Col. Nº ${professionalNumber || 'N/A'}`,
                        size: 16,
                        color: '64748B'
                    }),
                ],
                border: {
                    top: {
                        color: "E2E8F0",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6
                    }
                },
                spacing: {
                    before: 200
                }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Este documento contiene información clínica confidencial.',
                        size: 16,
                        color: '94A3B8'
                    })
                ],
                alignment: AlignmentType.CENTER
            })
        ];
    }

    private createMetadataField(label: string, value: string): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({
                    text: label + " ",
                    bold: true,
                    size: 20
                }),
                new TextRun({
                    text: value,
                    size: 20
                })
            ]
        });
    }

    private parseHtmlToDocx(html: string, headerColor: string): Paragraph[] {
        // Re-using the regex logic from PdfService but mapping to Paragraphs
        let processedHtml = html
            // Tables -> Lines
            .replace(/<tr[^>]*>/g, '\n')
            .replace(/<\/td>\s*<td[^>]*>/g, ' | ')
            .replace(/<\/tr>/g, '')
            .replace(/<table[^>]*>/g, '\n')
            .replace(/<\/table>/g, '\n')
            // Headers
            .replace(/<h[1][^>]*>(.*?)<\/h[1]>/g, '\n#H1#$1\n')
            .replace(/<h[2][^>]*>(.*?)<\/h[2]>/g, '\n#H2#$1\n')
            .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/g, '\n#H3#$1\n')
            // Lists
            .replace(/<ul>/g, '\n')
            .replace(/<\/ul>/g, '\n')
            .replace(/<li>/g, '\n• ')
            .replace(/<\/li>/g, '')
            // Basic formatting
            .replace(/<b>(.*?)<\/b>/g, '#B#$1#B#')
            .replace(/<strong>(.*?)<\/strong>/g, '#B#$1#B#')
            // Paragraphs
            .replace(/<p[^>]*>/g, '\n')
            .replace(/<\/p>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<div[^>]*>/g, '\n')
            .replace(/<\/div>/g, '')
            .replace(/<hr\s*\/?>/g, '\n');

        // Decode entities
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

        const paragraphs: Paragraph[] = [];
        const lines = processedHtml.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.startsWith('#H1#')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.replace(/#H1#/g, ''),
                    heading: 'Heading1',
                    spacing: { before: 200, after: 100 },
                    run: { color: headerColor, size: 32, bold: true }
                }));
            } else if (trimmed.startsWith('#H2#')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.replace(/#H2#/g, ''),
                    heading: 'Heading2',
                    spacing: { before: 150, after: 50 },
                    run: { color: headerColor, size: 26, bold: true }
                }));
            } else if (trimmed.startsWith('#H3#')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.replace(/#H3#/g, ''),
                    heading: 'Heading3',
                    spacing: { before: 100 },
                    run: { color: '475569', size: 22, bold: true }
                }));
            } else if (trimmed.startsWith('•')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.replace('•', '').trim(),
                    bullet: { level: 0 }
                }));
            } else {
                // Check for Bold markers #B#
                const parts = trimmed.split('#B#');
                const children: TextRun[] = [];

                parts.forEach((part, index) => {
                    // Even indices are normal, Odd are bold (assuming correct pairing)
                    if (part) {
                        children.push(new TextRun({
                            text: part,
                            bold: index % 2 !== 0
                        }));
                    }
                });

                paragraphs.push(new Paragraph({
                    children: children,
                    spacing: { after: 100 },
                    alignment: AlignmentType.JUSTIFIED
                }));
            }
        });

        return paragraphs;
    }
}
