
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY is missing in .env');
    process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
});

async function createOnboardingPack() {
    try {
        console.log('🚀 Creating "Pack On-boarding" in Stripe...');

        const product = await stripe.products.create({
            name: 'Pack On-boarding',
            description: 'Configuración personalizada de servidor y dominio',
        });

        console.log(`✅ Product created: ${product.id}`);

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 5000, // 50.00 EUR
            currency: 'eur',
            // one-time is implicit if recurring is not specified, but let's be explicit if needed or just leave default
        });

        console.log(`✅ Price created: ${price.id}`);
        console.log('\n👇 COPY THIS INTO YOUR .env FILE:');
        console.log(`STRIPE_PRICE_ONBOARDING_PACK="${price.id}"`);

    } catch (error) {
        console.error('❌ Error creating product/price:', error);
    }
}

createOnboardingPack();
