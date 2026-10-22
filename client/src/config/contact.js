const FALLBACK_WHATSAPP_NUMBER = "96560605828";
const FALLBACK_CONTACT_EMAIL = "info@crownkwt.com";

const rawWhatsApp = import.meta.env.VITE_WHATSAPP_NUMBER || "";
const whatsAppDigits = String(rawWhatsApp).replace(/\D/g, "");

export const WHATSAPP_NUMBER =
    whatsAppDigits.length >= 8 ? whatsAppDigits : FALLBACK_WHATSAPP_NUMBER;

export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_EMAIL =
    import.meta.env.VITE_CONTACT_EMAIL || FALLBACK_CONTACT_EMAIL;
