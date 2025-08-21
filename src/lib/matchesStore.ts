export type Match = {
  id: string;
  matchType: 'public' | 'private';
  gameMode: string;
  firstTo: number;
  platform: string;
  region: string;
  teamSize: string;
  entryFee: number;
  createdAt: string; // ISO string
};

const store = new Map<string, Match>();

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function createMatch(input: Omit<Match, 'id' | 'createdAt'> & { createdAt?: string }): Match {
  const id = generateId();
  const match: Match = {
    id,
    createdAt: input.createdAt || new Date().toISOString(),
    matchType: input.matchType,
    gameMode: input.gameMode,
    firstTo: typeof input.firstTo === 'string' ? parseInt(input.firstTo, 10) : input.firstTo,
    platform: input.platform,
    region: input.region,
    teamSize: input.teamSize,
    entryFee: typeof input.entryFee === 'string' ? parseFloat(input.entryFee) : input.entryFee,
  };
  store.set(id, match);
  return match;
}

export function getMatch(id: string): Match | undefined {
  return store.get(id);
}
