export declare class TranscriptionService {
    private genAI;
    constructor();
    transcribeAudio(file: Express.Multer.File): Promise<string>;
}
