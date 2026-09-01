export const EMPTY_BOARD = Object.freeze(Array(9).fill(null));
// Competitive rounds can still be lost, so 44.5% friendly rounds calibrates
// the first attempt to roughly a 50% player win rate in our simulations.
export const FRIENDLY_GAME_RATE = 0.445;

export const WINNING_LINES = Object.freeze([
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]);

export function gameResult(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
}

export function availableMoves(board) {
  return board.flatMap((cell, index) => cell ? [] : [index]);
}

const winningMove = (board, mark) => availableMoves(board).find((index) => {
  const next = [...board];
  next[index] = mark;
  return gameResult(next)?.winner === mark;
});

const minimaxCache = new Map();

const minimaxScore = (board, maximizing) => {
  const cacheKey = `${board.map((cell) => cell || '-').join('')}:${maximizing ? '1' : '0'}`;
  if (minimaxCache.has(cacheKey)) return minimaxCache.get(cacheKey);
  const result = gameResult(board);
  if (result?.winner === 'O') return 10;
  if (result?.winner === 'X') return -10;
  if (result?.winner === 'draw') return 0;

  const scores = availableMoves(board).map((index) => {
    const next = [...board];
    next[index] = maximizing ? 'O' : 'X';
    return minimaxScore(next, !maximizing);
  });
  const score = maximizing ? Math.max(...scores) : Math.min(...scores);
  minimaxCache.set(cacheKey, score);
  return score;
};

const bestMove = (board) => {
  let bestScore = -Infinity;
  let move = availableMoves(board)[0];
  for (const index of availableMoves(board)) {
    const next = [...board];
    next[index] = 'O';
    const score = minimaxScore(next, false);
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  }
  return move;
};

const strategicMove = (moves, random) => {
  if (!moves.length) return undefined;
  const scored = moves.map((index) => ({ index, score: index === 4 ? 5 : [0, 2, 6, 8].includes(index) ? 3 : 1 }));
  if (random() < 0.72) {
    const topScore = Math.max(...scored.map((entry) => entry.score));
    const top = scored.filter((entry) => entry.score === topScore);
    return top[Math.floor(random() * top.length)].index;
  }
  return moves[Math.floor(random() * moves.length)];
};

export function createBotStyle(random = Math.random, attemptNumber = 1) {
  if (attemptNumber >= 2) return 'assisted';
  return random() < FRIENDLY_GAME_RATE ? 'friendly' : 'competitive';
}

export function chooseBotMove(board, style = 'friendly', random = Math.random) {
  const moves = availableMoves(board);
  if (!moves.length) return undefined;

  if (style === 'assisted') {
    const block = winningMove(board, 'X');
    const nonWinningMoves = moves.filter((index) => {
      const next = [...board];
      next[index] = 'O';
      return gameResult(next)?.winner !== 'O';
    });
    const openings = nonWinningMoves.filter((index) => index !== block);
    const candidates = openings.length ? openings : nonWinningMoves.length ? nonWinningMoves : moves;
    return candidates[Math.floor(random() * candidates.length)];
  }

  const finish = winningMove(board, 'O');
  if (finish !== undefined) return finish;

  const block = winningMove(board, 'X');
  if (block !== undefined) {
    const blockChance = style === 'friendly' ? 0.18 : 0.92;
    if (random() < blockChance) return block;
    const alternatives = moves.filter((index) => index !== block);
    if (alternatives.length) return strategicMove(alternatives, random);
  }

  if (style === 'competitive' && random() < 0.84) return bestMove(board);
  return strategicMove(moves, random);
}
