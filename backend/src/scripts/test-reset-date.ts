import { addMonths, isBefore, isAfter } from 'date-fns';

function getNextMonthlyResetDate(periodStart: Date): Date {
    const now = new Date();
    let nextReset = new Date(periodStart);

    // If periodStart is in the future (e.g. just subscribed?), return it.
    if (isAfter(nextReset, now)) {
        return nextReset;
    }

    // Advance by months until we pass 'now'
    while (isBefore(nextReset, now) || nextReset.getTime() === now.getTime()) {
        nextReset = addMonths(nextReset, 1);
    }

    return nextReset;
}

const testCases = [
    { start: new Date('2025-01-01'), now: new Date('2025-01-05'), expected: new Date('2025-02-01') },
    { start: new Date('2025-01-15'), now: new Date('2025-01-05'), expected: new Date('2025-01-15') }, // Start in future relative to now? No, start is 15th, now is 5th. Wait, logic says if start > now return start. 2025-01-15 > 2025-01-05. So returns Jan 15. Correct.
    { start: new Date('2024-01-01'), now: new Date('2025-01-05'), expected: new Date('2025-02-01') }, // Should jump a whole year
    { start: new Date('2024-01-31'), now: new Date('2024-02-15'), expected: new Date('2024-02-29') }, // Leap year case? 
];

// Note: The function relies on "new Date()" as "now". I can't easily mock "now" inside the function without changing it.
// So I will just strictly test the logic by copying it and allowing "now" injection or just testing "logic" generally.

// Let's modify the function LOCALLY here to accept "now" for testing purposes.
function testLogic(periodStart: Date, now: Date): Date {
    let nextReset = new Date(periodStart);

    if (isAfter(nextReset, now)) {
        return nextReset;
    }

    while (isBefore(nextReset, now) || nextReset.getTime() === now.getTime()) {
        nextReset = addMonths(nextReset, 1);
    }

    return nextReset;
}

console.log('Running Date Logic Tests...');

testCases.forEach(({ start, now, expected }, index) => {
    const result = testLogic(start, now);
    const pass = result.getTime() === expected.getTime();
    console.log(`Test ${index + 1}: ${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) {
        console.log(`  Start: ${start.toISOString()}`);
        console.log(`  Now:   ${now.toISOString()}`);
        console.log(`  Exp:   ${expected.toISOString()}`);
        console.log(`  Got:   ${result.toISOString()}`);
    }
});
