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

export const PLAYER_COLORS = ['#C0392B', '#2980B9', '#27AE60', '#8E44AD', '#F39C12', '#1ABC9C'];
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
