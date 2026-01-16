export class CryptoService {
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly IV_LENGTH = 16; // 16 bytes (to match Node's crypto.randomBytes(16) used in backend)
    private static readonly TAG_LENGTH = 128; // 128 bits = 16 bytes

    static async encrypt(data: any, keyBase64: string): Promise<string> {
        try {
            // 1. Prepare Key
            const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));

            const cryptoKey = await window.crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );

            // 2. Prepare IV
            const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

            // 3. Encrypt
            const encodedData = new TextEncoder().encode(JSON.stringify(data));

            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: this.TAG_LENGTH,
                },
                cryptoKey,
                encodedData
            );

            // 4. Pack [IV(16)][Tag(16)][Cipher]
            // WebCrypto's AES-GCM result (encryptedBuffer) contains Cipher + Tag appended at the end automatically?
            // "The ciphertext is appended with the authentication tag." -> Yes.
            // So encryptedBuffer = Cipher + Tag.
            // Backend expects: [IV(16)] [Tag(16)] [Cipher].
            // But WebCrypto returns [Cipher] [Tag].
            // So we need to splitting it.

            const encryptedBytes = new Uint8Array(encryptedBuffer);
            const tagLengthBytes = this.TAG_LENGTH / 8; // 16 bytes
            const cipherLength = encryptedBytes.length - tagLengthBytes;

            const cipher = encryptedBytes.slice(0, cipherLength);
            const tag = encryptedBytes.slice(cipherLength);

            // Construct packed buffer: IV + Tag + Cipher
            const packed = new Uint8Array(iv.length + tag.length + cipher.length);
            packed.set(iv, 0);
            packed.set(tag, iv.length);
            packed.set(cipher, iv.length + tag.length);

            // 5. Convert to Base64
            // Using a simple method for larger buffers
            return this.arrayBufferToBase64(packed);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    private static arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return window.btoa(binary);
    }

    static async encryptRSA(data: any, publicKeyPem: string): Promise<string | null> {
        try {
            if (!window.crypto || !window.crypto.subtle) {
                console.warn('Web Crypto API not available (likely insecure context). Falling back to plaintext.');
                return null; // Fallback to plaintext handled by caller
            }

            // Import public key
            const pemHeader = "-----BEGIN PUBLIC KEY-----";
            const pemFooter = "-----END PUBLIC KEY-----";
            const pemContents = publicKeyPem.substring(
                publicKeyPem.indexOf(pemHeader) + pemHeader.length,
                publicKeyPem.indexOf(pemFooter)
            ).replace(/\n/g, "").trim();

            const binaryDerString = window.atob(pemContents);
            const binaryDer = new Uint8Array(binaryDerString.length);
            for (let i = 0; i < binaryDerString.length; i++) {
                binaryDer[i] = binaryDerString.charCodeAt(i);
            }

            const key = await window.crypto.subtle.importKey(
                "spki",
                binaryDer.buffer,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256"
                },
                false,
                ["encrypt"]
            );

            // Encrypt data
            const encoded = new TextEncoder().encode(JSON.stringify(data));
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                key,
                encoded
            );

            return this.arrayBufferToBase64(new Uint8Array(encryptedBuffer));
        } catch (error) {
            console.error('RSA Encryption failed:', error);
            // Don't throw, let it fall back
            return null;
        }
    }
}
