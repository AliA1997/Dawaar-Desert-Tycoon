export interface AuctionBid {
  id: string;
  name: string;
  color?: string;
  bid: number;
}

/**
 * Pure auction resolver shared between server and client tests.
 *
 * Rules:
 *  - bids of 0 (or negative) are treated as a "pass" and ignored
 *  - if no positive bids remain, returns null (auction closes, no buy)
 *  - otherwise, the highest positive bid wins (first-seen wins on ties)
 *
 * The client uses the same algorithm in its auction modal. The auction-expiry
 * code path passes the LATEST human bid (read from a ref, not a stale closure)
 * into this function — see `handleAuction` in `artifacts/dawaar/app/game.tsx`.
 */
export function pickAuctionWinner(bids: AuctionBid[]): AuctionBid | null {
  const positive = bids.filter(b => b.bid > 0);
  if (positive.length === 0) return null;
  return positive.reduce((best, b) => (b.bid > best.bid ? b : best), positive[0]);
}
