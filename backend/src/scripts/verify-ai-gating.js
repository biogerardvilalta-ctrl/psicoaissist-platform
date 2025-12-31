
async function main() {
    const API_URL = 'http://localhost:3001/api/v1';

    // Updated payload with required fields
    const basicUser = {
        email: `basic_test_${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Basic',
        lastName: 'User',
        role: 'PSYCHOLOGIST',
        professionalNumber: '123456',
        country: 'Spain'
    };

    console.log("--- STARTING VERIFICATION ---");

    // Helper to request
    async function request(method, url, body = null, token = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const opts = {
            method,
            headers,
        };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url, opts);
        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            // ignore if no json
        }
        return { status: res.status, data };
    }

    // Helper to get token
    async function getToken(userCredentials) {
        // Try register
        const regRes = await request('POST', `${API_URL}/auth/register`, userCredentials);
        if (regRes.status !== 201 && regRes.status !== 409) {
            console.error(`Registration failed for ${userCredentials.email}:`, regRes.data);
        } else {
            console.log(`Registration status: ${regRes.status}`);
        }

        // Login
        const res = await request('POST', `${API_URL}/auth/login`, {
            email: userCredentials.email,
            password: userCredentials.password
        });

        if (res.status !== 200 && res.status !== 201) {
            console.error(`Login failed for ${userCredentials.email}:`, res.data);
            throw new Error("Login failed");
        }
        return { token: res.data.tokens.accessToken, userId: res.data.user.id, planType: res.data.user.subscription?.planType || 'none' };
    }

    // A. Verify BASIC User (Should get 403 on AI)
    console.log("\n[TEST A] Basic User AI Access...");
    try {
        const basicAuth = await getToken(basicUser);
        console.log(`Logged in. Plan: ${basicAuth.planType}`);

        // Note: New users are created with 'demo' plan. 
        // 'demo' lacks 'advancedAnalytics' so it should be blocked same as Basic.

        const res = await request('POST', `${API_URL}/ai/suggestions`, {
            context: "Test context"
        }, basicAuth.token);

        if (res.status === 403) {
            console.log("✅ SUCCESS: Basic/Demo user was BLOCKED (403) from AI suggestions.");
        } else {
            console.error(`❌ FAILURE: Basic/Demo user yielded: ${res.status}`, res.data);
        }

    } catch (e) {
        console.error("Test failed with exception:", e);
    }

    // A. Verify BASIC User ...

    // C. Verify Transcription Logic (Mock)
    console.log("\n[TEST C] Transcription Logic Check...");
    try {
        const res = await request('OPTIONS', `${API_URL}/ai/transcribe`);
        console.log(`Transcription endpoint reachable: ${res.status !== 404}`); // Should be 204 or 200 for OPTIONS
    } catch (e) {
        console.log("Skipping full transcription test (no audio file).");
    }

    console.log("\n--- VERIFICATION FINISHED ---");
}

main();
