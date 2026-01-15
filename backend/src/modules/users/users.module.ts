import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, EncryptionModule, PaymentsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }