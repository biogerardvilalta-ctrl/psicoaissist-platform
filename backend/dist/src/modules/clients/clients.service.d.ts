import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto, CreateClientEncryptedDto } from './dto/clients.dto';
export declare class ClientsService {
    private readonly prisma;
    private readonly encryptionService;
    private readonly logger;
    constructor(prisma: PrismaService, encryptionService: EncryptionService);
    private packEncryptedData;
    private unpackEncryptedData;
    create(userId: string, createClientDto: CreateClientDto | CreateClientEncryptedDto): Promise<ClientResponseDto>;
    findAll(userId: string): Promise<ClientResponseDto[]>;
    findOne(userId: string, clientId: string): Promise<ClientResponseDto>;
    update(userId: string, clientId: string, updateClientDto: UpdateClientDto): Promise<ClientResponseDto>;
    remove(userId: string, clientId: string): Promise<void>;
}
