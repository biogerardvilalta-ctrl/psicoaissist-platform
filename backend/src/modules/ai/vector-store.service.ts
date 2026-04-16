import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface DocumentChunk {
    id: string;
    source: string;
    heading: string;
    text: string;
    embedding: number[];
}

interface EmbeddingsCache {
    version: string;
    docsHash: string;
    chunks: DocumentChunk[];
}

@Injectable()
export class VectorStoreService implements OnModuleInit {
    private readonly logger = new Logger(VectorStoreService.name);
    private chunks: DocumentChunk[] = [];

    private readonly DOCS_PATH = path.resolve(__dirname, '../../../../../../docs');
    private readonly CACHE_PATH = path.resolve(__dirname, '../../../data/embeddings-cache.json');
    private readonly CACHE_VERSION = '1.0';
    private readonly EMBEDDING_MODEL = 'gemini-embedding-001';
    private readonly CHUNK_SIZE = 700;
    private readonly CHUNK_OVERLAP = 100;
    private readonly TOP_K = 5;

    constructor(private configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        this.logger.log('[VectorStore] Initializing...');
        try {
            await this.loadOrBuildIndex();
            this.logger.log(`[VectorStore] Ready. ${this.chunks.length} chunks loaded.`);
        } catch (error) {
            this.logger.error('[VectorStore] Failed to initialize — falling back to full-doc mode.', error);
        }
    }

    isReady(): boolean {
        return this.chunks.length > 0;
    }

    async search(query: string, topK: number = this.TOP_K): Promise<string> {
        if (!this.isReady()) return '';

        try {
            const queryEmbedding = await this.embedText(query, 'RETRIEVAL_QUERY');
            const scored = this.chunks
                .map(chunk => ({ chunk, score: this.cosineSimilarity(queryEmbedding, chunk.embedding) }))
                .sort((a, b) => b.score - a.score)
                .slice(0, topK);

            this.logger.log(
                `[VectorStore] Top ${topK} for "${query.substring(0, 50)}...": ` +
                scored.map(s => `${s.chunk.source}(${s.score.toFixed(3)})`).join(', ')
            );

            return scored.map((s, i) =>
                `--- Fragment ${i + 1} (origen: ${s.chunk.source} | seccio: ${s.chunk.heading}) ---\n${s.chunk.text}`
            ).join('\n\n');
        } catch (error) {
            this.logger.error('[VectorStore] Search error:', error);
            return '';
        }
    }

    private async loadOrBuildIndex(): Promise<void> {
        const docContents = this.readAllDocs();
        const currentHash = this.hashContent(docContents.join('\n'));

        const cacheDir = path.dirname(this.CACHE_PATH);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        if (fs.existsSync(this.CACHE_PATH)) {
            try {
                const cache: EmbeddingsCache = JSON.parse(fs.readFileSync(this.CACHE_PATH, 'utf-8'));
                if (cache.version === this.CACHE_VERSION && cache.docsHash === currentHash) {
                    this.chunks = cache.chunks;
                    this.logger.log(`[VectorStore] Cache hit — ${this.chunks.length} chunks from disk.`);
                    return;
                }
                this.logger.log('[VectorStore] Cache stale — regenerating...');
            } catch {
                this.logger.warn('[VectorStore] Cache parse error — regenerating...');
            }
        } else {
            this.logger.log('[VectorStore] No cache — building index...');
        }

        await this.buildAndSaveIndex(docContents, currentHash);
    }

    private readAllDocs(): string[] {
        const docFiles = [
            'DOCUMENTACION.md',
            '00-resumen-ejecutivo.md',
            '01-especificaciones-tecnicas.md',
            '02-stack-tecnologico.md',
        ];
        const contents: string[] = [];

        for (const file of docFiles) {
            const filePath = path.join(this.DOCS_PATH, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                contents.push(`<!-- SOURCE: ${file} -->\n${content}`);
                this.logger.log(`[VectorStore] Loaded: ${file} (${content.length} chars)`);
            } else {
                this.logger.warn(`[VectorStore] Doc not found: ${filePath}`);
            }
        }
        return contents;
    }

    private async buildAndSaveIndex(docContents: string[], docsHash: string): Promise<void> {
        const rawChunks = this.chunkDocuments(docContents);
        this.logger.log(`[VectorStore] ${rawChunks.length} chunks. Embedding...`);

        const chunksWithEmbeddings: DocumentChunk[] = [];
        const BATCH_SIZE = 5;

        for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
            const batch = rawChunks.slice(i, i + BATCH_SIZE);
            const embeddings = await Promise.all(
                batch.map(c => this.embedText(c.text, 'RETRIEVAL_DOCUMENT'))
            );
            batch.forEach((chunk, j) => {
                chunksWithEmbeddings.push({ ...chunk, embedding: embeddings[j] });
            });
            this.logger.log(`[VectorStore] ${Math.min(i + BATCH_SIZE, rawChunks.length)}/${rawChunks.length} embedded`);
            if (i + BATCH_SIZE < rawChunks.length) {
                await new Promise(r => setTimeout(r, 200));
            }
        }

        const cache: EmbeddingsCache = { version: this.CACHE_VERSION, docsHash, chunks: chunksWithEmbeddings };
        fs.writeFileSync(this.CACHE_PATH, JSON.stringify(cache), 'utf-8');
        this.chunks = chunksWithEmbeddings;
        this.logger.log(`[VectorStore] Saved ${chunksWithEmbeddings.length} chunks to cache.`);
    }

    private chunkDocuments(docContents: string[]): Omit<DocumentChunk, 'embedding'>[] {
        const chunks: Omit<DocumentChunk, 'embedding'>[] = [];

        for (const content of docContents) {
            const sourceMatch = content.match(/<!-- SOURCE: (.+?) -->/);
            const source = sourceMatch ? sourceMatch[1] : 'document';
            const body = content.replace(/<!-- SOURCE: .+? -->/, '').trim();
            const sections = body.split(/(?=^## )/m);

            for (const section of sections) {
                const headingMatch = section.match(/^#{1,3} (.+)/m);
                const heading = headingMatch ? headingMatch[1].trim() : 'General';

                if (section.length <= this.CHUNK_SIZE) {
                    if (section.trim().length > 50) {
                        chunks.push({ id: crypto.randomUUID(), source, heading, text: section.trim() });
                    }
                } else {
                    for (const sub of this.splitWithOverlap(section, this.CHUNK_SIZE, this.CHUNK_OVERLAP)) {
                        if (sub.trim().length > 30) {
                            chunks.push({ id: crypto.randomUUID(), source, heading, text: sub.trim() });
                        }
                    }
                }
            }
        }
        return chunks;
    }

    private splitWithOverlap(text: string, size: number, overlap: number): string[] {
        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            let end = Math.min(start + size, text.length);
            if (end < text.length) {
                const bp = text.lastIndexOf('\n', end);
                if (bp > start + size * 0.5) end = bp;
            }
            chunks.push(text.slice(start, end));
            start = end - overlap;
            if (start >= text.length) break;
        }
        return chunks;
    }

    private async embedText(text: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[]> {
        const apiKey = (this.configService.get<string>('GEMINI_API_KEY') || '').trim();
        if (!apiKey) throw new Error('GEMINI_API_KEY not set');

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: { parts: [{ text: text.substring(0, 8000) }] },
                taskType,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini Embedding API ${response.status}: ${err}`);
        }
        const data = await response.json();
        return data.embedding?.values ?? [];
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length || a.length === 0) return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dot / denom;
    }

    private hashContent(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
