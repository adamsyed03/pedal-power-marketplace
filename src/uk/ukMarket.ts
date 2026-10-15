export const UK_PHONE_DISPLAY = '+44 7403 113911';
export const UK_PHONE_HREF = 'tel:+447403113911';
export const UK_WHATSAPP_DISPLAY = '+44 7403 113911';
export const UK_WHATSAPP_NUMBER = '447403113911';

export type UkProductKey = 'cargo' | 'core' | 'glide' | 'fold';

// UK launch prices are isolated from the Serbian catalogue and checkout.
// They are expressions-of-interest prices, shown VAT-inclusive.
export const UK_PRODUCT_PRICES: Record<UkProductKey, { current: string; amount: number }> = {
  cargo: { current: '£1,299', amount: 1299 },
  core: { current: '£1,700', amount: 1700 },
  glide: { current: '£1,699', amount: 1699 },
  fold: { current: '£1,099', amount: 1099 },
};

export const UK_PRODUCT_COPY: Record<UkProductKey, {
  name: string;
  category: string;
  description: string;
  positioning: string;
  points: string[];
}> = {
  cargo: {
    name: 'Cargo',
    category: 'Premium utility e-bike',
    description: 'A premium utility e-bike for longer journeys, everyday adventure and carrying more with confidence.',
    positioning: 'Built for ambitious days and longer routes.',
    points: ['Premium European design', 'Pogon app control', 'Utility-focused frame', 'Hydraulic braking', 'Connected security features', 'VAT included'],
  },
  core: {
    name: 'Core',
    category: 'Premium folding e-bike',
    description: 'A versatile premium folding e-bike that brings comfort, character and flexibility to every journey.',
    positioning: 'Adventure-ready versatility in a folding format.',
    points: ['Premium European design', 'Pogon app control', 'Folding frame', 'Hydraulic braking', 'Connected security features', 'VAT included'],
  },
  glide: {
    name: 'Glide',
    category: 'Flagship urban e-bike',
    description: 'Our flagship high-tech urban e-bike, created for riders who want a more considered way to explore.',
    positioning: 'Flagship technology. Effortless urban discovery.',
    points: ['Premium European design', 'Pogon app control', 'Urban comfort frame', 'NFC unlocking', 'Connected security features', 'VAT included'],
  },
  fold: {
    name: 'Fold',
    category: 'Compact folding e-bike',
    description: 'A compact folding commuter designed for spontaneous plans, smaller spaces and a wider sense of possibility.',
    positioning: 'Compact freedom for wherever the day leads.',
    points: ['Premium European design', 'Pogon app control', 'Compact folding format', 'Urban commuter focus', 'Register for availability', 'VAT included'],
  },
};
