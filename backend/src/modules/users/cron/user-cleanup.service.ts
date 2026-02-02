import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UsersService } from '../users.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserCleanupService {
    private readonly logger = new Logger(UserCleanupService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
    ) { }

    /**
     * Run every night at midnight to anonymize users deleted > 90 days ago
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.log('Running User Cleanup Job...');

        // 90 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        try {
            // Find eligible users
            // Users who are DELETED and were updated (marked as deleted) before the cutoff date
            // Note: We assume 'updatedAt' reflects the deletion time appropriately because remove() updates it.
            // Ideally we would have a 'deletedAt' column, but reusing updatedAt for DELETED status is acceptable given the schema constraints.
            // However, to be safe, we check if they are DELETED status.
            const usersToAnonymize = await this.prisma.user.findMany({
                where: {
                    status: UserStatus.DELETED,
                    updatedAt: {
                        lt: cutoffDate,
                    },
                    // Exclude already anonymized users to avoid redundant processing
                    // Simple check: Email not containing '@anonymized.local'
                    email: {
                        not: {
                            contains: '@anonymized.local'
                        }
                    }
                },
                select: { id: true, email: true }
            });

            if (usersToAnonymize.length === 0) {
                this.logger.log('No users found for anonymization.');
                return;
            }

            this.logger.log(`Found ${usersToAnonymize.length} users to anonymize.`);

            for (const user of usersToAnonymize) {
                try {
                    await this.usersService.anonymize(user.id);
                    this.logger.log(`Successfully anonymized user: ${user.id}`);
                } catch (err) {
                    this.logger.error(`Failed to anonymize user ${user.id}: ${err.message}`);
                }
            }

            this.logger.log('User Cleanup Job Completed.');
        } catch (error) {
            this.logger.error(`Error during User Cleanup Job: ${error.message}`);
        }
    }
}
