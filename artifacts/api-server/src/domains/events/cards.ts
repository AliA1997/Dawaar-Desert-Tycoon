import type { Player } from '../players/types.js';
import type { GameState, BoardProperty, GameLog } from '../turns/state.js';

export function applyCardAction(
  action: string,
  playerId: string,
  players: Player[],
  board: BoardProperty[],
  _state: GameState,
  _diceTotal: number,
  _logs: GameLog[],
): { newPlayers: Player[]; newBoard: BoardProperty[] } {
  let newPlayers = [...players];
  const newBoard = [...board];
  const player = newPlayers.find(p => p.id === playerId)!;

  switch (action) {
    case 'go_to_go':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: 0, money: p.money + 2000 } : p);
      break;
    case 'go_to_beijing': {
      const beijingPos = board.findIndex(s => s.name === 'Beijing');
      if (beijingPos >= 0) {
        if (player.position > beijingPos) newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
        newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: beijingPos } : p);
      }
      break;
    }
    case 'go_to_jakarta': {
      const jakartaPos = board.findIndex(s => s.name === 'Jakarta');
      if (jakartaPos >= 0) {
        if (player.position > jakartaPos) newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
        newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: jakartaPos } : p);
      }
      break;
    }
    case 'go_to_jail': {
      const jailPosC = board.findIndex(s => s.type === 'jail');
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: jailPosC, inJail: true, jailTurns: 0 } : p);
      break;
    }
    case 'collect_500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 500 } : p);
      break;
    case 'collect_1500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 1500 } : p);
      break;
    case 'collect_2000':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
      break;
    case 'collect_2500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2500 } : p);
      break;
    case 'collect_200':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 200 } : p);
      break;
    case 'collect_1000_each': {
      const amount = 1000;
      let total = 0;
      newPlayers = newPlayers.map(p => {
        if (p.id !== playerId && !p.isBankrupt) { total += amount; return { ...p, money: p.money - amount }; }
        return p;
      });
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + total } : p);
      break;
    }
    case 'pay_1000':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - 1000 } : p);
      break;
    case 'pay_1500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - 1500 } : p);
      break;
    case 'pay_500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - 500 } : p);
      break;
    case 'nearest_railroad': {
      const railroads = board.map((s, i) => s.type === 'railroad' ? i : -1).filter(i => i >= 0);
      const pos = player.position;
      const nearest = railroads.find(r => r > pos) ?? railroads[0];
      if (nearest < pos) newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: nearest } : p);
      break;
    }
    case 'back_3':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: (p.position - 3 + board.length) % board.length } : p);
      break;
  }

  return { newPlayers, newBoard };
}
