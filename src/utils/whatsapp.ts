// Alle WhatsApp-Links der Website gehen an die Werkstatt-Nummer
export const WHATSAPP_NUMBER = '4917641744443';

export const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
