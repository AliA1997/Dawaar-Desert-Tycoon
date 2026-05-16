// Backward-compatibility re-export facade.
// Game rules now live under `src/domains/<name>/`. This file exists so older
// import paths (`./game/gameState`) keep working while the codebase is
// migrated. Prefer importing directly from `../domains/<name>/...` in new code.
export {
  type GameStatus,
  type BoardProperty,
  type GameLog,
  type TradeOffer,
  type PendingTaxChoice,
  type GameState,
  createInitialBoard,
} from '../domains/turns/state.js';
export type { Player } from '../domains/players/types.js';
export { createGame, joinGame, setReady, startGame, endTurn, payJail } from '../domains/turns/lifecycle.js';
export { rollDice } from '../domains/dice/roll.js';
export { buyProperty } from '../domains/properties/buy.js';
export { buildHouse, sellHouse } from '../domains/properties/build.js';
export { mortgageProperty } from '../domains/properties/mortgage.js';
export { auctionBuy } from '../domains/properties/auction.js';
export { chooseTax } from '../domains/economy/tax.js';
export { claimAdReward } from '../domains/economy/reward.js';
export { proposeTrade, acceptTrade, declineTrade } from '../domains/trading/trade.js';
