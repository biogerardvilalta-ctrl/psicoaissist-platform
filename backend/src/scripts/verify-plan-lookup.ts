
import { PLAN_FEATURES, PlanLimits } from '../modules/payments/plan-features';

async function verifyPlanLookup() {
    console.log('--- Verifying Plan Lookup Logic ---');

    const testCases = [
        { input: 'pro', expected: PlanLimits.UNLIMITED },
        { input: 'PRO', expected: PlanLimits.UNLIMITED },
        { input: 'Pro', expected: PlanLimits.UNLIMITED },
        { input: 'basic', expected: PlanLimits.BASIC_MAX_CLIENTS },
        { input: 'BASIC', expected: PlanLimits.BASIC_MAX_CLIENTS },
    ];

    for (const test of testCases) {
        console.log(`Testing plan type: "${test.input}"`);

        // Simulation of current potentially buggy logic (direct access)
        const directAccessFeature = PLAN_FEATURES[test.input];

        // Simulation of fixed logic (normalized access)
        const normalizedInput = test.input.toLowerCase();
        const normalizedAccessFeature = PLAN_FEATURES[normalizedInput];

        console.log(`  > Direct Access (Current): ${directAccessFeature ? 'FOUND' : 'UNDEFINED'}`);
        if (directAccessFeature) {
            console.log(`    Max Clients: ${directAccessFeature.maxClients}`);
        } else {
            console.log(`    Max Clients: (Undefined -> defaults to 3 in frontend/backend)`);
        }

        console.log(`  > Normalized Access (Fix): ${normalizedAccessFeature ? 'FOUND' : 'UNDEFINED'}`);
        if (normalizedAccessFeature) {
            console.log(`    Max Clients: ${normalizedAccessFeature.maxClients}`);
        }

        if (directAccessFeature === undefined && normalizedAccessFeature !== undefined) {
            console.log('  RESULT: \x1b[31mFAIL (Case Mismatch)\x1b[0m - Current logic fails for this case.');
        } else {
            console.log('  RESULT: \x1b[32mPASS\x1b[0m');
        }
        console.log('-----------------------------------');
    }
}

verifyPlanLookup();
