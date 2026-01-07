import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { PrismaService } from '../src/common/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const paymentsService = app.get(PaymentsService);
    const prismaService = app.get(PrismaService);

    console.log('🚀 Starting Webhook Simulation...');

    // 1. Get a user to test with (e.g., the first user)
    const user = await prismaService.user.findFirst();
    if (!user) {
        console.error('❌ No user found to test with.');
        await app.close();
        return;
    }

    console.log(`👤 Testing with user: ${user.email} (${user.id})`);

    // 2. Ensure user has a stripeCustomerId
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        customerId = 'cus_test_' + Math.random().toString(36).substring(7);
        await prismaService.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId }
        });
        console.log(`📝 Assigned temp Stripe Customer ID: ${customerId}`);
    }

    // 3. Mock Stripe Invoice
    const mockInvoice: any = {
        id: 'in_test_simulation_' + Date.now(),
        customer: customerId,
        subscription: 'sub_test_simulation_' + Date.now(),
        amount_paid: 2900,
        currency: 'eur',
        status: 'paid',
    };

    // 4. Call the private method (using simplified access)
    console.log('⚡ Triggering handleInvoicePaymentSucceeded...');
    try {
        // Accessing private method via type casting to any
        await (paymentsService as any).handleInvoicePaymentSucceeded(mockInvoice);
        console.log('✅ Webhook simulation completed successfully!');
        console.log('🔔 You should receive a notification in the frontend now.');
    } catch (error) {
        console.error('❌ Simulation failed:', error);
    }

    await app.close();
    process.exit(0);
}

bootstrap();
