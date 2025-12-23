
import { UserRole } from '@prisma/client';

console.log('UserRole keys:', Object.keys(UserRole));
console.log('UserRole.AGENDA_MANAGER:', UserRole.AGENDA_MANAGER);

if (UserRole.AGENDA_MANAGER === 'AGENDA_MANAGER') {
    console.log('SUCCESS: UserRole.AGENDA_MANAGER is correctly defined.');
} else {
    console.error('FAILURE: UserRole.AGENDA_MANAGER is missing or incorrect.');
    process.exit(1);
}
