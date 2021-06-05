export interface ICoinFlipEventMap {
  confirmed: { gameId: string; userId: string; time: Date };
  joined: { gameId: string; userId: string; time: Date };
  created: { gameId: string; time: Date };
  left: { gameId: string; userId: string; time: Date };
  result: {
    gameId: string;
    winner: { userId: string; value: number };
    time: Date;
  };
}

export interface ICoinFlipActionMap {
  join: { gameId: string };
  create: undefined;
  leave: { gameId: string };
  ready: { gameId: string };
}

export interface ICoinFlipGameStateUpdate {
  initiator?: string;
  opponent?: string;
  initiator_ready?: Date;
  opponent_ready?: Date;
  result?: {
    winner: string;
    value: number;
  };
}
export interface ICoinFlipGameState extends ICoinFlipGameStateUpdate {
  id: string;
  lastUpdate: Date;
  initiator: string;
}
