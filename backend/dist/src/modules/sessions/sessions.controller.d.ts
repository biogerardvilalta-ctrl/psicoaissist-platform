import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/sessions.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(req: any, createSessionDto: CreateSessionDto): Promise<{
        id: any;
        clientId: any;
        userId: any;
        startTime: any;
        endTime: any;
        status: any;
        sessionType: any;
        notes: string;
        transcription: string;
        methodology: any;
        duration: any;
        clientName: string;
        client: any;
        aiMetadata: any;
    }>;
    findAll(req: any): Promise<{
        id: any;
        clientId: any;
        userId: any;
        startTime: any;
        endTime: any;
        status: any;
        sessionType: any;
        notes: string;
        transcription: string;
        methodology: any;
        duration: any;
        clientName: string;
        client: any;
        aiMetadata: any;
    }[]>;
    findByDateRange(req: any, start: string, end: string): Promise<{
        id: any;
        clientId: any;
        userId: any;
        startTime: any;
        endTime: any;
        status: any;
        sessionType: any;
        notes: string;
        transcription: string;
        methodology: any;
        duration: any;
        clientName: string;
        client: any;
        aiMetadata: any;
    }[]>;
    getAvailability(req: any, date: string): Promise<{
        date: string;
        slots: string[];
    }>;
    findOne(req: any, id: string): Promise<{
        id: any;
        clientId: any;
        userId: any;
        startTime: any;
        endTime: any;
        status: any;
        sessionType: any;
        notes: string;
        transcription: string;
        methodology: any;
        duration: any;
        clientName: string;
        client: any;
        aiMetadata: any;
    }>;
    update(req: any, id: string, updateSessionDto: UpdateSessionDto): Promise<{
        id: any;
        clientId: any;
        userId: any;
        startTime: any;
        endTime: any;
        status: any;
        sessionType: any;
        notes: string;
        transcription: string;
        methodology: any;
        duration: any;
        clientName: string;
        client: any;
        aiMetadata: any;
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
