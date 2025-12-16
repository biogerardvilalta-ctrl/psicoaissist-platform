import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PdfService } from './pdf.service';
import { ClientsModule } from '../clients/clients.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [ClientsModule, EncryptionModule, AiModule],
    controllers: [ReportsController],
    providers: [ReportsService, PdfService],
    exports: [ReportsService, PdfService]
})
export class ReportsModule { }
