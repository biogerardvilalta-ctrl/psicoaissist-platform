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
    tags?: string[];
}
export declare class UpdateClientDto extends CreateClientDto {
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
}
