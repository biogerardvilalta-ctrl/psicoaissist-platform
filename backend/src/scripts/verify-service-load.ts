import { Test, TestingModule } from '@nestjs/testing';
import { UsageLimitsService } from '../modules/payments/usage-limits.service';
import { PrismaService } from '../common/prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
    user: {
        findUnique: async () => null,
        update: async () => null,
    },
};

async function verifyService() {
    console.log('Attempting to load UsageLimitsService...');
    try {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsageLimitsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        const service = module.get<UsageLimitsService>(UsageLimitsService);
        console.log('UsageLimitsService loaded successfully.');

        // Test the new method if accessible
        if (service.getNextMonthlyResetDate) {
            const date = service.getNextMonthlyResetDate(new Date('2023-01-01'));
            console.log('getNextMonthlyResetDate execution result:', date.toISOString());
        } else {
            console.error('getNextMonthlyResetDate method missing on instance!');
        }

    } catch (error) {
        console.error('Failed to load UsageLimitsService:', error);
        process.exit(1);
    }
}

verifyService();
