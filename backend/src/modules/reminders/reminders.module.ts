
import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { EmailModule } from '../email/email.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule, EmailModule, EncryptionModule],
    providers: [RemindersService],
})
export class RemindersModule { }
