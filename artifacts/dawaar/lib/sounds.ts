import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// Fire-and-forget SFX. Players are created lazily and reused; every call is
// best-effort — a failed playback (web autoplay policy, codec issue) must
// never break gameplay.

const SOURCES = {
  land:         require('../assets/sounds/land.wav'),
  jail:         require('../assets/sounds/went_to_jail.wav'),
  chance:       require('../assets/sounds/chance.wav'),
  community:    require('../assets/sounds/community.wav'),
  receiveMoney: require('../assets/sounds/received_money.mp3'),
  spendMoney:   require('../assets/sounds/spend_money.mp3'),
  win:          require('../assets/sounds/win.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let audioModeSet = false;

export function playSound(name: SoundName): void {
  try {
    if (!audioModeSet) {
      audioModeSet = true;
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      players[name] = player;
    }
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // sound is decorative — ignore failures
  }
}

/** SFX for landing on a board space, by space type. */
export function landingSound(spaceType: string): SoundName {
  switch (spaceType) {
    case 'jail':
    case 'go_to_jail': return 'jail';
    case 'chance':     return 'chance';
    case 'community':  return 'community';
    case 'tax':        return 'spendMoney';
    default:           return 'land';
  }
}
