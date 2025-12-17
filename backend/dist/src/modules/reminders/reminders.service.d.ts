import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { EncryptionService } from '../encryption/encryption.service';
export declare class RemindersService {
    private prisma;
    private emailService;
    private encryption;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, encryption: EncryptionService);
    handleCron(): Promise<void>;
    private unpackClientData;
}
