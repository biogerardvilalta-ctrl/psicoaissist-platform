
import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [GoogleController],
    providers: [GoogleService, PrismaService, ConfigService],
    exports: [GoogleService],
})
export class GoogleModule { }
