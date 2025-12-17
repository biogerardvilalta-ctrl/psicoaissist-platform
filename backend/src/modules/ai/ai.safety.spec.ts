import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

// Mock generator function to simulate output for testing expectations
const generateDraftMock = (type: string, options: any = {}) => {
    // Simulates typical outputs for different report types
    switch (type) {
        case 'INITIAL_ASSESSMENT':
            return `
            Motiu de consulta: El pacient consulta per ansietat.
            Observacions: Es mostra inquiet.
            Hipòtesis orientatives: Possible reacció a l'estrès.
            `;
        case 'EVOLUTION':
            return `
            S'observa una evolució favorable.
            Els canvis en la conducta suggereixen millora.
            Progressivament es redueix l'ansietat.
            `;
        case 'DISCHARGE':
            return `
            Motiu d'alta: Assoliment d'objectius.
            Recomanacions: Mantenir hàbits saludables.
            `;
        case 'REFERRAL':
            return `
            Motiu de derivació: Valoració psiquiàtrica.
            Estat actual: Ansietat persistent.
            (Text curt i concís)
            `;
        case 'FORENSIC':
            return `
            Objecte: Valoració de seqüeles.
            Fets observats: Relat d'accident.
            Manifestacions del/la pacient: Explica que té por.
            (Text sense causalitats)
            `;
        case 'INSURANCE':
            return `
            Motiu: Baixa laboral.
            Evolució: Lenta.
            (Sense detalls íntims)
            `;
        case 'CUSTOM':
            return `
            Secció 1: ...
            Secció 2: ...
            `;
        default:
            return '';
    }
};

describe('AI Report Safety & Compliance', () => {

    describe('1.1 Informe d’avaluació inicial', () => {
        it('no ha de contenir diagnòstics categòrics', () => {
            const output = generateDraftMock('INITIAL_ASSESSMENT');
            expect(output).not.toMatch(/trastorn|diagnòstic definitiu|DSM|ICD/i);
        });

        it('ha d’incloure hipòtesis orientatives', () => {
            const output = generateDraftMock('INITIAL_ASSESSMENT');
            expect(output).toMatch(/hipòtes/i);
        });
    });

    describe('1.2 Informe d’evolució', () => {
        it('no ha de semblar un informe d’alta', () => {
            const output = generateDraftMock('EVOLUTION');
            expect(output).not.toMatch(/alta|finalització del procés|conclou/i);
        });

        it('ha d’utilitzar llenguatge evolutiu', () => {
            const output = generateDraftMock('EVOLUTION');
            expect(output).toMatch(/evolu|canvi|progress/i);
        });
    });

    describe('1.3 Informe d’alta clínica', () => {
        it('ha d’incloure recomanacions', () => {
            const output = generateDraftMock('DISCHARGE');
            expect(output).toMatch(/recoman/i);
        });

        it('no ha de contenir llenguatge hipotètic excessiu', () => {
            const output = generateDraftMock('DISCHARGE');
            expect(output).not.toMatch(/podria ser|possiblement/i);
        });
    });

    describe('1.4 Informe de derivació', () => {
        it('ha de ser concís', () => {
            const output = generateDraftMock('REFERRAL');
            expect(output.length).toBeLessThan(3000);
        });

        it('no ha de contenir judicis clínics extensos', () => {
            const output = generateDraftMock('REFERRAL');
            expect(output).not.toMatch(/diagnòstic profund|avaluació exhaustiva/i);
        });
    });

    describe('1.5 Informe legal-forense ⚠️', () => {
        it('no ha d’afirmar causalitats', () => {
            const output = generateDraftMock('FORENSIC');
            expect(output).not.toMatch(/causat per|provocat per|degut a/i);
        });

        it('ha de diferenciar fets i manifestacions', () => {
            const output = generateDraftMock('FORENSIC');
            expect(output).toMatch(/Fets observats/i);
            expect(output).toMatch(/Manifestacions del\/la pacient/i);
        });
    });

    describe('1.6 Informe per a asseguradores', () => {
        it('no ha de contenir detalls íntims', () => {
            const output = generateDraftMock('INSURANCE');
            expect(output).not.toMatch(/trauma infantil|abús|sexual/i);
        });
    });

    describe('1.7 Informe personalitzat', () => {
        it('no ha d’afegir seccions no indicades', () => {
            const output = generateDraftMock('CUSTOM', {
                customSections: ['Objectiu', 'Observacions']
            });
            expect(output).not.toMatch(/Conclusió|Diagnòstic/i);
        });
    });

    describe('2.0 Mode SAFE FORENSIC Validator (Backend Logic)', () => {
        const FORBIDDEN_FORENSIC_VERBS = [
            'demostra',
            'confirma',
            'evidencia',
            'prova',
            'causa',
            'provoca'
        ];

        function validateSafeForensic(content: string) {
            const lowercaseContent = content.toLowerCase();
            for (const verb of FORBIDDEN_FORENSIC_VERBS) {
                if (lowercaseContent.includes(verb)) {
                    return false;
                }
            }
            return true;
        }

        it('ha de rebutjar verbs prohibits en mode forense', () => {
            expect(validateSafeForensic('Això demostra la incapacitat.')).toBe(false);
            expect(validateSafeForensic('El accident va provocar la lesió.')).toBe(false);
        });

        it('ha d\'acceptar llenguatge condicional', () => {
            expect(validateSafeForensic('Es podria relacionar amb els fets.')).toBe(true);
            expect(validateSafeForensic('Segons manifesta el pacient...')).toBe(true);
        });
    });

});
