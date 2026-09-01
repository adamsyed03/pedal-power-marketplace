export const GAME_PRIZE_STORAGE_KEY = 'pogon_tic_tac_toe_prize';

export const GAME_PRIZE_LABELS = {
  lock: 'Besplatan lanac',
  gloves: 'Rukavice za vožnju',
  helmet: 'Kaciga',
} as const;

export type GamePrizeKey = keyof typeof GAME_PRIZE_LABELS;

type StoredGamePrize = {
  prize: GamePrizeKey;
  claimedAt: string;
};

export const isGamePrize = (value: unknown): value is GamePrizeKey =>
  typeof value === 'string' && value in GAME_PRIZE_LABELS;

export function readStoredGamePrize(): StoredGamePrize | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GAME_PRIZE_STORAGE_KEY) || 'null');
    return parsed && isGamePrize(parsed.prize) && typeof parsed.claimedAt === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function storeGamePrize(prize: GamePrizeKey) {
  const stored = { prize, claimedAt: new Date().toISOString() };
  window.localStorage.setItem(GAME_PRIZE_STORAGE_KEY, JSON.stringify(stored));
  return stored;
}
