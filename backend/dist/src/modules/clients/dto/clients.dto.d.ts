import { RiskLevel } from '@prisma/client';
export declare class CreateClientDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    diagnosis?: string;
    notes?: string;
    riskLevel?: RiskLevel;
    birthDate?: string;
    tags?: string[];
    sendEmailReminders?: boolean;
    sendWhatsappReminders?: boolean;
}
export declare class CreateClientEncryptedDto {
    encryptedData: string;
    keyId: string;
    riskLevel?: RiskLevel;
    tags?: string[];
    sendEmailReminders?: boolean;
    sendWhatsappReminders?: boolean;
}
declare const UpdateClientDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateClientDto>>;
export declare class UpdateClientDto extends UpdateClientDto_base {
    isActive?: boolean;
}
export declare class ClientResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    riskLevel: RiskLevel;
    isActive: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    lastSessionAt?: Date;
    sendEmailReminders: boolean;
    sendWhatsappReminders: boolean;
}
export {};
