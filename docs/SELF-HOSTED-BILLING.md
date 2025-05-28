# Suna Self-Hosted Billing Configuration

This guide provides detailed instructions for setting up Stripe billing in your self-hosted Suna instance for both staging and production environments.

## Overview

When self-hosting Suna, you can configure the billing system to work with your own Stripe account. This allows you to:

- Collect payments directly to your Stripe account
- Manage subscription tiers and pricing
- Process upgrades, downgrades, and cancellations
- Track usage and billing status

All billing functionality remains within your control and completely independent from Kortix.

## Prerequisites

- A Stripe account (create one at [stripe.com](https://stripe.com) if needed)
- Admin access to your Stripe dashboard
- A properly configured self-hosted Suna instance

## Step 1: Create Stripe Products and Price Plans

1. **Log in to your Stripe Dashboard** at https://dashboard.stripe.com/
2. **Create a Product**:
   - Go to Products > Add Product
   - Name it (e.g., "Suna Subscription")
   - Set a description (optional)
   - Take note of the product ID (will look like `prod_XXXXX`)
3. **Create Price Plans**:
   - For each tier (Free, Pro, Custom, etc.)
   - Set the appropriate pricing
   - Make them recurring (monthly)
   - Save each price ID (will look like `price_XXXXX`)

The default tiers in Suna are:

| Tier | Description | Hours | Default Price |
|------|-------------|-------|--------------|
| Free | Basic tier | 1 hour | $0 |
| Pro | Standard tier | 2 hours | $20 |
| Custom (6h) | Custom tier | 6 hours | $50 |
| Custom (12h) | Custom tier | 12 hours | $100 |
| Custom (25h) | Custom tier | 25 hours | $200 |
| Custom (50h) | Custom tier | 50 hours | $400 |
| Custom (125h) | Custom tier | 125 hours | $800 |
| Custom (200h) | Custom tier | 200 hours | $1000 |

## Step 2: Configure Stripe Webhooks

1. **Create a Webhook Endpoint**:
   - Go to Developers > Webhooks > Add Endpoint
   - Set the endpoint URL to `https://your-domain.com/api/billing/webhook`
   - Select events to listen for (at minimum):
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
2. **Get the Webhook Secret**:
   - After creating the webhook, Stripe will show you a signing secret
   - Save this value for configuration

## Step 3: Update Environment Variables

### For Staging Environment

Add these to your `backend/.env` file:

```
# Environment Mode
ENV_MODE=staging

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_test_api_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Optional: Override the default product IDs if needed
STRIPE_PRODUCT_ID_STAGING=prod_your_product_id

# Optional: Override the default price IDs if different from config.py
STRIPE_FREE_TIER_ID_STAGING=price_your_free_tier_id
STRIPE_TIER_2_20_ID_STAGING=price_your_tier_2_id
STRIPE_TIER_6_50_ID_STAGING=price_your_tier_6_id
STRIPE_TIER_12_100_ID_STAGING=price_your_tier_12_id
STRIPE_TIER_25_200_ID_STAGING=price_your_tier_25_id
STRIPE_TIER_50_400_ID_STAGING=price_your_tier_50_id
STRIPE_TIER_125_800_ID_STAGING=price_your_tier_125_id
STRIPE_TIER_200_1000_ID_STAGING=price_your_tier_200_id
```

### For Production Environment

```
# Environment Mode
ENV_MODE=production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_api_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Optional: Override the default product IDs if needed
STRIPE_PRODUCT_ID_PROD=prod_your_product_id

# Optional: Override the default price IDs if different from config.py
STRIPE_FREE_TIER_ID_PROD=price_your_free_tier_id
STRIPE_TIER_2_20_ID_PROD=price_your_tier_2_id
STRIPE_TIER_6_50_ID_PROD=price_your_tier_6_id
STRIPE_TIER_12_100_ID_PROD=price_your_tier_12_id
STRIPE_TIER_25_200_ID_PROD=price_your_tier_25_id
STRIPE_TIER_50_400_ID_PROD=price_your_tier_50_id
STRIPE_TIER_125_800_ID_PROD=price_your_tier_125_id
STRIPE_TIER_200_1000_ID_PROD=price_your_tier_200_id
```

## Step 4: Update Frontend Configuration

Update your frontend environment file (`frontend/.env.local`):

```
# Set the appropriate environment mode
NEXT_PUBLIC_ENV_MODE=STAGING  # or PRODUCTION
```

## Step 5: Testing the Stripe Integration

### For Staging Environment

1. Use Stripe test mode
2. Use test credit cards for payments:
   - Success: `4242 4242 4242 4242`
   - Require authentication: `4000 0025 0000 3155`
   - Payment fails: `4000 0000 0000 9995`
3. Test the subscription flow
4. Check webhook delivery in Stripe dashboard

### For Production Environment

1. Switch to Stripe live mode
2. Use real payment methods
3. Monitor real transactions

## Local Development Testing

For local development and testing, you can use the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:8000/api/billing/webhook
```

## Important Notes

1. **Price IDs**: The application already has default price IDs defined in `config.py`. If you use the same IDs in your Stripe account, you don't need to override them in the environment variables.

2. **Security**:
   - Never commit your Stripe secret keys to version control
   - Use environment variables or a secure secret manager
   - Use test keys for staging and live keys for production

3. **Database Tables**: The billing system uses tables in the `basejump` schema of your Supabase database. Make sure this schema is properly set up and exposed in your Supabase project.

4. **Self-Hosted Independence**: Even when using Stripe in production mode, all payments go to your own Stripe account. You remain completely independent from Kortix.

5. **Local Mode**: In local development mode (`ENV_MODE=local`), billing checks are disabled and all usage is free.

## Troubleshooting

### Common Issues

1. **Webhook Errors**
   - Check that your webhook URL is accessible from the internet
   - Verify the webhook secret is correctly set in your environment
   - Check the Stripe dashboard for failed webhook deliveries

2. **Payment Processing Issues**
   - Ensure your Stripe account is properly set up and verified
   - Check for any restrictions on your Stripe account
   - Verify the correct API keys are being used (test vs. live)

3. **Missing Billing UI**
   - Confirm that `NEXT_PUBLIC_ENV_MODE` is set correctly in frontend environment
   - Ensure the frontend is correctly communicating with the backend

For additional support, refer to the [Stripe API Documentation](https://stripe.com/docs/api) or the [Suna GitHub repository](https://github.com/kortix-ai/suna).