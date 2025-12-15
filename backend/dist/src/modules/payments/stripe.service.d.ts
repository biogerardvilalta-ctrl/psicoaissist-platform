import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import stripeConfig from '../../config/stripe.config';
export declare class StripeService {
    private config;
    private stripe;
    private isDemoMode;
    private readonly logger;
    constructor(config: ConfigType<typeof stripeConfig>);
    createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.Customer> | {
        id: string;
        email: string;
        name: string;
        metadata: Record<string, string>;
        created: number;
        object: string;
    }>;
    createSubscription(customerId: string, priceId: string): Promise<Stripe.Response<Stripe.Subscription> | {
        id: string;
        customer: string;
        status: string;
        items: {
            data: {
                price: {
                    id: string;
                };
            }[];
        };
        created: number;
        object: string;
    }>;
    createCheckoutSession(priceId: string, customerId?: string, metadata?: Record<string, string>): Promise<Stripe.Response<Stripe.Checkout.Session> | {
        id: string;
        url: string;
        object: string;
        mode: string;
        customer: string;
        metadata: Record<string, string>;
        success_url: string;
        cancel_url: string;
    }>;
    createPortalSession(customerId: string): Promise<Stripe.Response<Stripe.BillingPortal.Session> | {
        id: string;
        url: string;
        object: string;
        customer: string;
        return_url: string;
    }>;
    cancelSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription> | {
        id: string;
        status: string;
        canceled_at: number;
        object: string;
    }>;
    updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Response<Stripe.Subscription> | {
        id: string;
        items: {
            data: {
                id: string;
                price: {
                    id: string;
                };
            }[];
        };
        object: string;
    }>;
    constructWebhookEvent(payload: any, signature: string): Promise<Stripe.AccountApplicationAuthorizedEvent | Stripe.AccountApplicationDeauthorizedEvent | Stripe.AccountExternalAccountCreatedEvent | Stripe.AccountExternalAccountDeletedEvent | Stripe.AccountExternalAccountUpdatedEvent | Stripe.AccountUpdatedEvent | Stripe.ApplicationFeeCreatedEvent | Stripe.ApplicationFeeRefundUpdatedEvent | Stripe.ApplicationFeeRefundedEvent | Stripe.BalanceAvailableEvent | Stripe.BillingPortalConfigurationCreatedEvent | Stripe.BillingPortalConfigurationUpdatedEvent | Stripe.BillingPortalSessionCreatedEvent | Stripe.CapabilityUpdatedEvent | Stripe.CashBalanceFundsAvailableEvent | Stripe.ChargeCapturedEvent | Stripe.ChargeDisputeClosedEvent | Stripe.ChargeDisputeCreatedEvent | Stripe.ChargeDisputeFundsReinstatedEvent | Stripe.ChargeDisputeFundsWithdrawnEvent | Stripe.ChargeDisputeUpdatedEvent | Stripe.ChargeExpiredEvent | Stripe.ChargeFailedEvent | Stripe.ChargePendingEvent | Stripe.ChargeRefundUpdatedEvent | Stripe.ChargeRefundedEvent | Stripe.ChargeSucceededEvent | Stripe.ChargeUpdatedEvent | Stripe.CheckoutSessionAsyncPaymentFailedEvent | Stripe.CheckoutSessionAsyncPaymentSucceededEvent | Stripe.CheckoutSessionCompletedEvent | Stripe.CheckoutSessionExpiredEvent | Stripe.ClimateOrderCanceledEvent | Stripe.ClimateOrderCreatedEvent | Stripe.ClimateOrderDelayedEvent | Stripe.ClimateOrderDeliveredEvent | Stripe.ClimateOrderProductSubstitutedEvent | Stripe.ClimateProductCreatedEvent | Stripe.ClimateProductPricingUpdatedEvent | Stripe.CouponCreatedEvent | Stripe.CouponDeletedEvent | Stripe.CouponUpdatedEvent | Stripe.CreditNoteCreatedEvent | Stripe.CreditNoteUpdatedEvent | Stripe.CreditNoteVoidedEvent | Stripe.CustomerCreatedEvent | Stripe.CustomerDeletedEvent | Stripe.CustomerDiscountCreatedEvent | Stripe.CustomerDiscountDeletedEvent | Stripe.CustomerDiscountUpdatedEvent | Stripe.CustomerSourceCreatedEvent | Stripe.CustomerSourceDeletedEvent | Stripe.CustomerSourceExpiringEvent | Stripe.CustomerSourceUpdatedEvent | Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionDeletedEvent | Stripe.CustomerSubscriptionPausedEvent | Stripe.CustomerSubscriptionPendingUpdateAppliedEvent | Stripe.CustomerSubscriptionPendingUpdateExpiredEvent | Stripe.CustomerSubscriptionResumedEvent | Stripe.CustomerSubscriptionTrialWillEndEvent | Stripe.CustomerSubscriptionUpdatedEvent | Stripe.CustomerTaxIdCreatedEvent | Stripe.CustomerTaxIdDeletedEvent | Stripe.CustomerTaxIdUpdatedEvent | Stripe.CustomerUpdatedEvent | Stripe.CustomerCashBalanceTransactionCreatedEvent | Stripe.FileCreatedEvent | Stripe.FinancialConnectionsAccountCreatedEvent | Stripe.FinancialConnectionsAccountDeactivatedEvent | Stripe.FinancialConnectionsAccountDisconnectedEvent | Stripe.FinancialConnectionsAccountReactivatedEvent | Stripe.FinancialConnectionsAccountRefreshedBalanceEvent | Stripe.FinancialConnectionsAccountRefreshedOwnershipEvent | Stripe.FinancialConnectionsAccountRefreshedTransactionsEvent | Stripe.IdentityVerificationSessionCanceledEvent | Stripe.IdentityVerificationSessionCreatedEvent | Stripe.IdentityVerificationSessionProcessingEvent | Stripe.IdentityVerificationSessionRedactedEvent | Stripe.IdentityVerificationSessionRequiresInputEvent | Stripe.IdentityVerificationSessionVerifiedEvent | Stripe.InvoiceCreatedEvent | Stripe.InvoiceDeletedEvent | Stripe.InvoiceFinalizationFailedEvent | Stripe.InvoiceFinalizedEvent | Stripe.InvoiceMarkedUncollectibleEvent | Stripe.InvoicePaidEvent | Stripe.InvoicePaymentActionRequiredEvent | Stripe.InvoicePaymentFailedEvent | Stripe.InvoicePaymentSucceededEvent | Stripe.InvoiceSentEvent | Stripe.InvoiceUpcomingEvent | Stripe.InvoiceUpdatedEvent | Stripe.InvoiceVoidedEvent | Stripe.InvoiceitemCreatedEvent | Stripe.InvoiceitemDeletedEvent | Stripe.IssuingAuthorizationCreatedEvent | Stripe.IssuingAuthorizationRequestEvent | Stripe.IssuingAuthorizationUpdatedEvent | Stripe.IssuingCardCreatedEvent | Stripe.IssuingCardUpdatedEvent | Stripe.IssuingCardholderCreatedEvent | Stripe.IssuingCardholderUpdatedEvent | Stripe.IssuingDisputeClosedEvent | Stripe.IssuingDisputeCreatedEvent | Stripe.IssuingDisputeFundsReinstatedEvent | Stripe.IssuingDisputeSubmittedEvent | Stripe.IssuingDisputeUpdatedEvent | Stripe.IssuingTokenCreatedEvent | Stripe.IssuingTokenUpdatedEvent | Stripe.IssuingTransactionCreatedEvent | Stripe.IssuingTransactionUpdatedEvent | Stripe.MandateUpdatedEvent | Stripe.PaymentIntentAmountCapturableUpdatedEvent | Stripe.PaymentIntentCanceledEvent | Stripe.PaymentIntentCreatedEvent | Stripe.PaymentIntentPartiallyFundedEvent | Stripe.PaymentIntentPaymentFailedEvent | Stripe.PaymentIntentProcessingEvent | Stripe.PaymentIntentRequiresActionEvent | Stripe.PaymentIntentSucceededEvent | Stripe.PaymentLinkCreatedEvent | Stripe.PaymentLinkUpdatedEvent | Stripe.PaymentMethodAttachedEvent | Stripe.PaymentMethodAutomaticallyUpdatedEvent | Stripe.PaymentMethodDetachedEvent | Stripe.PaymentMethodUpdatedEvent | Stripe.PayoutCanceledEvent | Stripe.PayoutCreatedEvent | Stripe.PayoutFailedEvent | Stripe.PayoutPaidEvent | Stripe.PayoutReconciliationCompletedEvent | Stripe.PayoutUpdatedEvent | Stripe.PersonCreatedEvent | Stripe.PersonDeletedEvent | Stripe.PersonUpdatedEvent | Stripe.PlanCreatedEvent | Stripe.PlanDeletedEvent | Stripe.PlanUpdatedEvent | Stripe.PriceCreatedEvent | Stripe.PriceDeletedEvent | Stripe.PriceUpdatedEvent | Stripe.ProductCreatedEvent | Stripe.ProductDeletedEvent | Stripe.ProductUpdatedEvent | Stripe.PromotionCodeCreatedEvent | Stripe.PromotionCodeUpdatedEvent | Stripe.QuoteAcceptedEvent | Stripe.QuoteCanceledEvent | Stripe.QuoteCreatedEvent | Stripe.QuoteFinalizedEvent | Stripe.RadarEarlyFraudWarningCreatedEvent | Stripe.RadarEarlyFraudWarningUpdatedEvent | Stripe.RefundCreatedEvent | Stripe.RefundUpdatedEvent | Stripe.ReportingReportRunFailedEvent | Stripe.ReportingReportRunSucceededEvent | Stripe.ReportingReportTypeUpdatedEvent | Stripe.ReviewClosedEvent | Stripe.ReviewOpenedEvent | Stripe.SetupIntentCanceledEvent | Stripe.SetupIntentCreatedEvent | Stripe.SetupIntentRequiresActionEvent | Stripe.SetupIntentSetupFailedEvent | Stripe.SetupIntentSucceededEvent | Stripe.SigmaScheduledQueryRunCreatedEvent | Stripe.SourceCanceledEvent | Stripe.SourceChargeableEvent | Stripe.SourceFailedEvent | Stripe.SourceMandateNotificationEvent | Stripe.SourceRefundAttributesRequiredEvent | Stripe.SourceTransactionCreatedEvent | Stripe.SourceTransactionUpdatedEvent | Stripe.SubscriptionScheduleAbortedEvent | Stripe.SubscriptionScheduleCanceledEvent | Stripe.SubscriptionScheduleCompletedEvent | Stripe.SubscriptionScheduleCreatedEvent | Stripe.SubscriptionScheduleExpiringEvent | Stripe.SubscriptionScheduleReleasedEvent | Stripe.SubscriptionScheduleUpdatedEvent | Stripe.TaxSettingsUpdatedEvent | Stripe.TaxRateCreatedEvent | Stripe.TaxRateUpdatedEvent | Stripe.TerminalReaderActionFailedEvent | Stripe.TerminalReaderActionSucceededEvent | Stripe.TestHelpersTestClockAdvancingEvent | Stripe.TestHelpersTestClockCreatedEvent | Stripe.TestHelpersTestClockDeletedEvent | Stripe.TestHelpersTestClockInternalFailureEvent | Stripe.TestHelpersTestClockReadyEvent | Stripe.TopupCanceledEvent | Stripe.TopupCreatedEvent | Stripe.TopupFailedEvent | Stripe.TopupReversedEvent | Stripe.TopupSucceededEvent | Stripe.TransferCreatedEvent | Stripe.TransferReversedEvent | Stripe.TransferUpdatedEvent | Stripe.TreasuryCreditReversalCreatedEvent | Stripe.TreasuryCreditReversalPostedEvent | Stripe.TreasuryDebitReversalCompletedEvent | Stripe.TreasuryDebitReversalCreatedEvent | Stripe.TreasuryDebitReversalInitialCreditGrantedEvent | Stripe.TreasuryFinancialAccountClosedEvent | Stripe.TreasuryFinancialAccountCreatedEvent | Stripe.TreasuryFinancialAccountFeaturesStatusUpdatedEvent | Stripe.TreasuryInboundTransferCanceledEvent | Stripe.TreasuryInboundTransferCreatedEvent | Stripe.TreasuryInboundTransferFailedEvent | Stripe.TreasuryInboundTransferSucceededEvent | Stripe.TreasuryOutboundPaymentCanceledEvent | Stripe.TreasuryOutboundPaymentCreatedEvent | Stripe.TreasuryOutboundPaymentExpectedArrivalDateUpdatedEvent | Stripe.TreasuryOutboundPaymentFailedEvent | Stripe.TreasuryOutboundPaymentPostedEvent | Stripe.TreasuryOutboundPaymentReturnedEvent | Stripe.TreasuryOutboundTransferCanceledEvent | Stripe.TreasuryOutboundTransferCreatedEvent | Stripe.TreasuryOutboundTransferExpectedArrivalDateUpdatedEvent | Stripe.TreasuryOutboundTransferFailedEvent | Stripe.TreasuryOutboundTransferPostedEvent | Stripe.TreasuryOutboundTransferReturnedEvent | Stripe.TreasuryReceivedCreditCreatedEvent | Stripe.TreasuryReceivedCreditFailedEvent | Stripe.TreasuryReceivedCreditSucceededEvent | Stripe.TreasuryReceivedDebitCreatedEvent | Stripe.InvoiceitemUpdatedEvent | Stripe.OrderCreatedEvent | Stripe.RecipientCreatedEvent | Stripe.RecipientDeletedEvent | Stripe.RecipientUpdatedEvent | Stripe.SkuCreatedEvent | Stripe.SkuDeletedEvent | Stripe.SkuUpdatedEvent | {
        id: string;
        type: string;
        data: {
            object: any;
        };
        object: string;
    }>;
    getSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription> | {
        id: string;
        status: string;
        customer: string;
        items: {
            data: {
                price: {
                    id: string;
                    nickname: string;
                };
            }[];
        };
        object: string;
    }>;
    getCustomer(customerId: string): Promise<(Stripe.Customer & {
        lastResponse: {
            headers: {
                [key: string]: string;
            };
            requestId: string;
            statusCode: number;
            apiVersion?: string;
            idempotencyKey?: string;
            stripeAccount?: string;
        };
    }) | (Stripe.DeletedCustomer & {
        lastResponse: {
            headers: {
                [key: string]: string;
            };
            requestId: string;
            statusCode: number;
            apiVersion?: string;
            idempotencyKey?: string;
            stripeAccount?: string;
        };
    }) | {
        id: string;
        email: string;
        name: string;
        object: string;
    }>;
    listSubscriptions(customerId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>> | {
        data: {
            id: string;
            customer: string;
            status: string;
            items: {
                data: {
                    price: {
                        id: string;
                        nickname: string;
                    };
                }[];
            };
            object: string;
        }[];
        object: string;
    }>;
    getPlans(): {
        basic: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
            };
        };
        pro: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
            };
        };
        premium: {
            priceId: string;
            amount: number;
            currency: string;
            interval: string;
            name: string;
            features: {
                maxClients: number;
                transcriptionHours: number;
                reportsPerMonth: number;
                supportLevel: string;
                advancedAnalytics: boolean;
                apiAccess: boolean;
                customBranding: boolean;
                ssoIntegration: boolean;
                prioritySupport: boolean;
            };
        };
    };
    getPlan(planName: string): any;
    isInDemoMode(): boolean;
}
