import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dto/clients.dto';
import { Request } from 'express';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(req: Request & {
        user: any;
    }, createClientDto: CreateClientDto): Promise<ClientResponseDto>;
    findAll(req: Request & {
        user: any;
    }): Promise<ClientResponseDto[]>;
    findOne(req: Request & {
        user: any;
    }, id: string): Promise<ClientResponseDto>;
    remove(req: Request & {
        user: any;
    }, id: string): Promise<void>;
    update(req: Request & {
        user: any;
    }, id: string, updateClientDto: UpdateClientDto): Promise<ClientResponseDto>;
}
