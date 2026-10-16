// Central contact details for the storefront footer.
//
// Values come from Vite env vars so they can differ per environment
// (local .env, Netlify, etc.) without touching code:
//
//   VITE_WHATSAPP_NUMBER — digits only, e.g. 96512345678
//   VITE_CONTACT_EMAIL   — e.g. hello@crownkwt.com
//
// Fallbacks keep the UI working when env vars are missing at build time.

const FALLBACK_WHATSAPP_NUMBER = "96522222222";
const FALLBACK_CONTACT_EMAIL = "hello@crownkwt.com";

const rawWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || "";
const whatsAppDigits = String(rawWhatsApp).replace(/\D/g, "");

export const WHATSAPP_NUMBER =
    whatsAppDigits.length >= 8 ? whatsAppDigits : FALLBACK_WHATSAPP_NUMBER;

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_EMAIL =
    import.meta.env.VITE_CONTACT_EMAIL || FALLBACK_CONTACT_EMAIL;
