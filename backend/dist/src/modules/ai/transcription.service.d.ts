export declare class TranscriptionService {
    private openai;
    constructor();
    transcribeAudio(file: Express.Multer.File): Promise<string>;
}
