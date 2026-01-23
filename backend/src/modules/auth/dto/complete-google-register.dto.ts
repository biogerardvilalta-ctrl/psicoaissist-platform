import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteGoogleRegisterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    professionalNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    country: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referralCode?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    acceptTerms: boolean;
}
