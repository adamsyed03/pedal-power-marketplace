import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Circle, Gift, Hand, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, Trophy, X as XIcon } from 'lucide-react';
import { chooseBotMove, createBotStyle, EMPTY_BOARD, gameResult } from '../../lib/ticTacToe.mjs';
import { GAME_PRIZE_LABELS, GamePrizeKey, readStoredGamePrize, storeGamePrize } from '../../lib/gamePrize';

type Cell = 'X' | 'O' | null;
type GamePhase = 'playing' | 'won' | 'lost' | 'draw';
type BotStyle = 'friendly' | 'competitive' | 'assisted';
type Language = 'sr' | 'en' | 'ru';

const prizeIcons = {
  lock: LockKeyhole,
  gloves: Hand,
  helmet: ShieldCheck,
} as const;

const gameCopy = {
  sr: {
    badge: 'Igraj i osvoji', close: 'Zatvori igru', title: 'Pobedi Pogon.',
    intro: 'Složi tri znaka u nizu i izaberi poklon koji dobijaš uz kupovinu Pogon bicikla.',
    thinking: 'Pogon razmišlja…', won: 'Bravo! Izaberi poklon uz kupovinu bicikla.',
    lost: 'Pogon je dobio ovu rundu.', draw: 'Nerešeno. Pokušaj ponovo.',
    attempt: (value: number) => `Pokušaj ${value} · Ti igraš prvi kao X.`,
    board: 'Iks oks tabla', cell: 'Polje', bravo: 'Bravo!',
    choose: 'Izaberi poklon koji dobijaš uz kupovinu bicikla.', saved: 'Sačuvano:',
    replay: 'Igraj ponovo', models: 'Vidi modele', savedPrize: 'Sačuvana nagrada:',
  },
  en: {
    badge: 'Play and win', close: 'Close game', title: 'Beat Pogon.',
    intro: 'Get three in a row and choose a gift included with your Pogon bike purchase.',
    thinking: 'Pogon is thinking…', won: 'Bravo! Choose a gift with your bike purchase.',
    lost: 'Pogon won this round.', draw: 'Draw. Try again.',
    attempt: (value: number) => `Attempt ${value} · You play first as X.`,
    board: 'Tic-tac-toe board', cell: 'Cell', bravo: 'Bravo!',
    choose: 'Choose a gift included with your bike purchase.', saved: 'Saved:',
    replay: 'Play again', models: 'View models', savedPrize: 'Saved gift:',
  },
  ru: {
    badge: 'Играй и выиграй', close: 'Закрыть игру', title: 'Обыграй Pogon.',
    intro: 'Собери три в ряд и выбери подарок, который получишь при покупке велосипеда Pogon.',
    thinking: 'Pogon думает…', won: 'Браво! Выбери подарок к покупке велосипеда.',
    lost: 'В этом раунде победил Pogon.', draw: 'Ничья. Попробуй снова.',
    attempt: (value: number) => `Попытка ${value} · Ты ходишь первым за X.`,
    board: 'Поле для крестиков-ноликов', cell: 'Клетка', bravo: 'Браво!',
    choose: 'Выбери подарок, который получишь при покупке велосипеда.', saved: 'Сохранено:',
    replay: 'Играть снова', models: 'Смотреть модели', savedPrize: 'Сохранённый подарок:',
  },
} as const;

const localizedPrizeLabels: Record<Language, Record<GamePrizeKey, string>> = {
  sr: GAME_PRIZE_LABELS,
  en: { lock: 'Free bike lock', gloves: 'Riding gloves', helmet: 'Helmet' },
  ru: { lock: 'Бесплатный велозамок', gloves: 'Перчатки для езды', helmet: 'Шлем' },
};

const confettiPieces = Array.from({ length: 30 }, (_, index) => ({
  color: ['#7fff00', '#ffffff', '#ffde59', '#57d7ff'][index % 4],
  x: Math.cos((index / 30) * Math.PI * 2) * (125 + (index % 5) * 18),
  y: 135 + (index % 6) * 15,
  rotation: 180 + index * 47,
  delay: (index % 8) * 0.025,
}));

export function TicTacToeGame({ open, language, onClose, onViewModels }: { open: boolean; language: Language; onClose: () => void; onViewModels: () => void }) {
  const [board, setBoard] = useState<Cell[]>(() => [...EMPTY_BOARD] as Cell[]);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [attempt, setAttempt] = useState(1);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [botThinking, setBotThinking] = useState(false);
  const [botStyle, setBotStyle] = useState<BotStyle>(() => createBotStyle(Math.random, 1));
  const [claimedPrize, setClaimedPrize] = useState<GamePrizeKey | null>(() => readStoredGamePrize()?.prize ?? null);
  const [roundPrize, setRoundPrize] = useState<GamePrizeKey | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const copy = gameCopy[language];
  const prizeLabels = localizedPrizeLabels[language];

  const resolveBoard = (nextBoard: Cell[]) => {
    const result = gameResult(nextBoard);
    if (!result) return false;
    setWinningLine(result.line);
    if (result.winner === 'X') {
      setRoundPrize(null);
      setPhase('won');
    } else if (result.winner === 'O') {
      setPhase('lost');
    } else {
      setPhase('draw');
    }
    return true;
  };

  const playCell = (index: number) => {
    if (phase !== 'playing' || botThinking || board[index]) return;
    const afterPlayer = [...board];
    afterPlayer[index] = 'X';
    setBoard(afterPlayer);
    if (resolveBoard(afterPlayer)) return;

    setBotThinking(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      const move = chooseBotMove(afterPlayer, botStyle);
      if (move === undefined) {
        setBotThinking(false);
        resolveBoard(afterPlayer);
        return;
      }
      const afterBot = [...afterPlayer];
      afterBot[move] = 'O';
      setBoard(afterBot);
      setBotThinking(false);
      resolveBoard(afterBot);
    }, 420 + Math.round(Math.random() * 260));
  };

  const restart = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    setBoard([...EMPTY_BOARD] as Cell[]);
    setPhase('playing');
    setWinningLine([]);
    setRoundPrize(null);
    setBotThinking(false);
    setBotStyle(createBotStyle(Math.random, nextAttempt));
  };

  const claimPrize = (prize: GamePrizeKey) => {
    if (roundPrize) return;
    storeGamePrize(prize);
    setRoundPrize(prize);
    setClaimedPrize(prize);
  };

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  const status = botThinking
    ? copy.thinking
    : phase === 'won'
      ? copy.won
      : phase === 'lost'
        ? copy.lost
        : phase === 'draw'
          ? copy.draw
          : copy.attempt(attempt);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={phase === 'won' ? 'tic-tac-toe-result-title' : 'tic-tac-toe-title'}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/15 bg-[#0b0b0b] text-white shadow-[0_30px_100px_rgba(0,0,0,0.6)] ${phase === 'won' ? 'h-[58dvh] min-h-[25rem] max-h-[29rem] sm:h-auto sm:min-h-0 sm:max-h-none' : ''}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_5%,rgba(127,255,0,0.22),transparent_38%)]" />

            <AnimatePresence>
              {phase === 'won' && (
                <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
                  <motion.div
                    className="absolute left-1/2 top-[48%] size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7fff00]"
                    initial={{ scale: 0.2, opacity: 0.8 }}
                    animate={{ scale: 2.8, opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  {confettiPieces.map((piece, index) => (
                    <motion.span
                      key={index}
                      className="absolute left-1/2 top-[48%] h-3 w-1.5 rounded-sm"
                      style={{ backgroundColor: piece.color }}
                      initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 0 }}
                      animate={{ x: piece.x, y: [0, -110 - (index % 4) * 12, piece.y], rotate: piece.rotation, scale: [0, 1.15, 0.85], opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.45, delay: piece.delay, ease: 'easeOut', times: [0, 0.18, 0.78, 1] }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            <button type="button" onClick={onClose} aria-label={copy.close} className="absolute right-4 top-4 z-30 flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20">
              <XIcon className="size-4" />
            </button>

            <div className={`relative z-20 ${phase === 'won' ? 'flex h-full flex-col justify-center p-5 pt-14 sm:block sm:h-auto sm:p-8' : 'p-5 sm:p-8'}`}>
              <div className={phase === 'won' ? 'hidden sm:block' : ''}>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7fff00]/40 bg-[#7fff00]/10 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#9cff45]">
                  <Gift className="size-3.5" /> {copy.badge}
                </div>
                <h2 id="tic-tac-toe-title" className="mt-4 pr-10 text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">{copy.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">{copy.intro}</p>
              </div>

              <div className={`mx-auto mt-5 w-full max-w-[18rem] grid-cols-3 gap-2 ${phase === 'won' ? 'hidden sm:grid' : 'grid'}`} role="grid" aria-label={copy.board}>
                {board.map((cell, index) => {
                  const isWinner = winningLine.includes(index);
                  return (
                    <motion.button
                      key={index}
                      type="button"
                      role="gridcell"
                      aria-label={`${copy.cell} ${index + 1}${cell ? `: ${cell}` : ''}`}
                      onClick={() => playCell(index)}
                      disabled={Boolean(cell) || botThinking || phase !== 'playing'}
                      animate={isWinner ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 rgba(127,255,0,0)', '0 0 34px rgba(127,255,0,0.55)', '0 0 20px rgba(127,255,0,0.3)'] } : { scale: 1 }}
                      transition={{ duration: 0.7, delay: index * 0.05 }}
                      className={`flex aspect-square items-center justify-center rounded-2xl border text-[#8cff1a] transition disabled:cursor-default disabled:opacity-100 ${isWinner ? 'border-[#7fff00] bg-[#7fff00]/20' : 'border-white/20 bg-white/[0.08] hover:border-[#7fff00]/70 hover:bg-[#7fff00]/10'}`}
                    >
                      {cell === 'X' ? <XIcon className="size-12 stroke-[2.7]" /> : cell === 'O' ? <Circle className="size-10 stroke-[2.5] text-white" /> : null}
                    </motion.button>
                  );
                })}
              </div>

              <div className={`mt-3 min-h-9 items-center justify-center text-center text-sm font-bold text-white ${phase === 'won' ? 'hidden sm:flex' : 'flex'}`} aria-live="polite">
                {botThinking && <Sparkles className="mr-2 size-4 animate-pulse text-[#8cff1a]" />}{status}
              </div>

              {phase === 'won' && (
                <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 240, damping: 18 }} className="sm:mt-2">
                  <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-2xl border border-[#7fff00]/50 bg-[#7fff00]/15 p-4 text-white">
                    <motion.span animate={{ rotate: [0, -12, 12, -7, 7, 0], scale: [1, 1.25, 1] }} transition={{ duration: 0.8, delay: 0.3 }} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#7fff00] text-black"><Trophy className="size-6" /></motion.span>
                    <div><p id="tic-tac-toe-result-title" className="font-black text-white">{copy.bravo}</p><p className="mt-0.5 text-xs font-semibold text-white/75">{copy.choose}</p></div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    {(Object.keys(GAME_PRIZE_LABELS) as GamePrizeKey[]).map((prize, index) => {
                      const Icon = prizeIcons[prize];
                      const selected = roundPrize === prize;
                      const locked = Boolean(roundPrize && !selected);
                      return (
                        <motion.button
                          key={prize}
                          type="button"
                          onClick={() => claimPrize(prize)}
                          disabled={locked}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: locked ? 0.45 : 1, y: 0, scale: selected ? 1.03 : 1 }}
                          transition={{ delay: 0.38 + index * 0.08 }}
                          className={`flex min-h-28 flex-col items-center justify-center gap-2.5 rounded-2xl border px-1.5 py-3 text-center text-[0.7rem] font-black leading-tight transition sm:min-h-24 sm:px-2 sm:text-xs ${selected ? 'border-[#7fff00] bg-[#7fff00] text-black shadow-[0_0_28px_rgba(127,255,0,0.25)]' : 'border-white/25 bg-white/10 text-white hover:border-[#7fff00] hover:bg-[#7fff00]/15'} disabled:cursor-default`}
                        >
                          <Icon className="size-7 sm:size-6" />
                          <span>{prizeLabels[prize]}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {roundPrize && <p className="mt-2 text-center text-xs font-bold text-[#9cff45]">{copy.saved} {prizeLabels[roundPrize]}</p>}
                </motion.div>
              )}

              {phase !== 'playing' && (
                <div className={`mt-4 grid gap-2.5 ${phase === 'won' && claimedPrize ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <button type="button" onClick={restart} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-2 text-[0.7rem] font-black uppercase tracking-wide text-white transition hover:border-[#7fff00] hover:bg-white/15 sm:min-h-12 sm:px-5 sm:text-sm sm:tracking-wider">
                    <RotateCcw className="size-4" /> {copy.replay}
                  </button>
                  {claimedPrize && (
                    <button type="button" onClick={onViewModels} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#7fff00] px-2 text-[0.7rem] font-black uppercase tracking-wide text-black shadow-[0_0_25px_rgba(127,255,0,0.2)] transition hover:bg-[#a4ff4d] sm:min-h-12 sm:px-5 sm:text-sm sm:tracking-wider">
                      <Trophy className="size-4" /> {copy.models}
                    </button>
                  )}
                </div>
              )}

              {phase === 'playing' && claimedPrize && (
                <p className="mt-3 text-center text-xs text-white/65">{copy.savedPrize} <span className="font-black text-[#9cff45]">{prizeLabels[claimedPrize]}</span></p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
