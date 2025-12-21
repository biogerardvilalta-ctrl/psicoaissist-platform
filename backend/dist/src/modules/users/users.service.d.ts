import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/users.dto';
export declare class UsersService {
    private readonly prisma;
    private readonly encryptionService;
    private readonly logger;
    constructor(prisma: PrismaService, encryptionService: EncryptionService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(page?: number, limit?: number): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<UserResponseDto>;
    findByEmail(email: string): Promise<UserResponseDto | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
    updateDashboardLayout(id: string, layout: any): Promise<UserResponseDto>;
    changeRole(id: string, newRole: UserRole): Promise<UserResponseDto>;
    private mapToResponseDto;
}
