import { base44 } from './base44Client';


export const getWeather = base44.functions.getWeather;

export const getServiceCategories = base44.functions.getServiceCategories;

export const ping = base44.functions.ping;

export const webpay = base44.functions.webpay;
export const generateReceiptPDF = base44.functions.generateReceiptPDF;
export const cleanupExpiredBookings = base44.functions.cleanupExpiredBookings;
export const photos_moderate = base44.functions['photos/moderate'];
export const photos_cleanup = base44.functions['photos/cleanup'];
export const rebuildSitemap = base44.functions.rebuildSitemap;
export const createBooking = base44.functions.createBooking;
export const webpayReturn = base44.functions.webpayReturn;
export const webpay_return_callback = base44.functions['webpay/return-callback'];
export const publicProperties = base44.functions.publicProperties;
export const ai_route = base44.functions['ai/route'];
export const ai_answer = base44.functions['ai/answer'];
export const revalidateProperties = base44.functions.revalidateProperties;
export const receipts_by_transaction = base44.functions['receipts/by-transaction'];
export const receipts_pdf = base44.functions['receipts/pdf'];
export const api_emergency_log = base44.functions['api/emergency/log'];
export const admin_fixPropertyStates = base44.functions['admin/fixPropertyStates'];
export const api_plans = base44.functions['api/plans'];
export const api_subscription = base44.functions['api/subscription'];
export const api_subscription_create = base44.functions['api/subscription/create'];
export const api_feature_credits = base44.functions['api/feature-credits'];
export const api_feature_credits_redeem = base44.functions['api/feature-credits/redeem'];
export const api_referrals_me = base44.functions['api/referrals/me'];
export const api_referrals_claim = base44.functions['api/referrals/claim'];
export const api_billing_webhook = base44.functions['api/billing/webhook'];
export const admin_seedProperties = base44.functions['admin/seedProperties'];
export const _probe_json = base44.functions._probe_json;
export const admin_normalizePropertyStates = base44.functions['admin/normalizePropertyStates'];
