export interface Player {
  id: string;
  name: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  color: string;
  doublesCount: number;
  ready: boolean;
}

// One distinct, vivid color per join slot (max 6 players). Keep in sync with
// the client palette in artifacts/dawaar/constants/colors.ts (`players`).
export const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F59E0B', '#06B6D4'];
export const STARTING_MONEY = 15000;

export function makePlayer(id: string, name: string, token: string, colorIndex: number): Player {
  return {
    id,
    name,
    token,
    money: STARTING_MONEY,
    position: 0,
    properties: [],
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    color: PLAYER_COLORS[colorIndex] ?? PLAYER_COLORS[0],
    doublesCount: 0,
    ready: false,
  };
}
