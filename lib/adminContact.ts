const configuredAdminWhatsApp = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER?.trim() ?? '';

export const adminWhatsAppNumber = configuredAdminWhatsApp.replace(/\D/g, '');

export const hasAdminWhatsAppNumber = /^\d{10,15}$/.test(adminWhatsAppNumber);
