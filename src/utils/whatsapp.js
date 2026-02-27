export function formatPhoneForWA(phone) {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
}

export function buildWAUrl(phone, message) {
  const digits = formatPhoneForWA(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function applyTemplate(text, client) {
  return text.replace(/\{name\}/g, client?.name || 'there');
}

export const WA_TEMPLATES = [
  {
    id: 'general',
    label: 'General Greeting',
    text: "Hello {name}, I'm reaching out from UAE Real Estate. How can I assist you today?",
  },
  {
    id: 'viewing',
    label: 'Viewing Reminder',
    text: 'Dear {name}, this is a reminder for your upcoming property viewing. Please confirm your attendance. Thank you.',
  },
  {
    id: 'new_prop',
    label: 'New Property Match',
    text: 'Hi {name}, we found a property that matches your requirements! Would you like to schedule a viewing?',
  },
  {
    id: 'followup',
    label: 'Follow Up',
    text: 'Hi {name}, following up on your property search. Have you had a chance to consider our recommendations?',
  },
  {
    id: 'deal',
    label: 'Deal Update',
    text: 'Dear {name}, we have an important update regarding your property deal. Please contact us at your earliest convenience.',
  },
  {
    id: 'payment',
    label: 'Payment Reminder',
    text: 'Dear {name}, this is a friendly reminder about your upcoming payment. Please get in touch if you have any questions.',
  },
];
