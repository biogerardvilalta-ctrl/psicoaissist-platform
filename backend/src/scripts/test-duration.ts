
import * as fs from 'fs';
import * as path from 'path';

async function testDuration() {
    console.log('--- Starting Duration Calculation Test ---');

    // Create a dummy file if one doesn't exist for testing (just empty or random bytes might fail metadata, but let's see)
    // Actually, let's try to verify if we can import the libraries first.

    console.log('1. Testing music-metadata import...');
    try {
        const { parseFile } = await import('music-metadata');
        console.log('✅ music-metadata imported successfully');
    } catch (e) {
        console.error('❌ Failed to import music-metadata:', e);
    }

    console.log('2. Testing get-audio-duration import...');
    try {
        const { getAudioDurationInSeconds } = await import('get-audio-duration');
        console.log('✅ get-audio-duration imported successfully');
    } catch (e) {
        console.error('❌ Failed to import get-audio-duration:', e);
    }

    console.log('--- Test Complete ---');
}

testDuration().catch(console.error);
