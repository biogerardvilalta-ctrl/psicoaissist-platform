import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto, CreateClientEncryptedDto } from './dto/clients.dto';
import { Request } from 'express';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(req: Request & {
        user: any;
    }, createClientDto: CreateClientDto | CreateClientEncryptedDto): Promise<ClientResponseDto>;
    findAll(req: Request & {
        user: any;
    }, active?: string): Promise<ClientResponseDto[]>;
    findOne(req: Request & {
        user: any;
    }, id: string): Promise<ClientResponseDto>;
    remove(req: Request & {
        user: any;
    }, id: string): Promise<{
        message: string;
    }>;
    update(req: Request & {
        user: any;
    }, id: string, updateClientDto: UpdateClientDto): Promise<ClientResponseDto>;
}
