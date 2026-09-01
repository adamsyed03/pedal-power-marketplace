export const GAME_PRIZE_LABELS = Object.freeze({
  lock: 'Besplatan lanac',
  gloves: 'Rukavice za vožnju',
  helmet: 'Kaciga',
});

export function normalizeGamePrize(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !Object.hasOwn(GAME_PRIZE_LABELS, value)) throw new Error('INVALID_GAME_PRIZE');
  return value;
}

export function applyGamePrizeToDelivery(prize, deliveryMethod, delivery) {
  return delivery;
}

export function attachGamePrize(items, prize) {
  if (!prize) return items;
  return items.map((item, index) => index === 0
    ? { ...item, gamePrize: prize, gamePrizeLabel: GAME_PRIZE_LABELS[prize] }
    : item);
}
