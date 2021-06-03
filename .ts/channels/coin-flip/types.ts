export interface ICoinFlipEventMap {
  confirmed: { gameId: string; userId: string; time: Date };
  joined: { gameId: string; userId: string; time: Date };
  created: { gameId: string; time: Date };
  left: { gameId: string; userId: string; time: Date };
  result: { gameId: string; winner: { userId: string }; time: Date };
}

export interface ICoinFlipActionMap {
  join: { gameId: string };
  create: undefined;
  leave: { gameId: string };
  start: { gameId: string };
  confirm: undefined;
}

export interface ICoinFlipJobParams {
  gameId: string;
  player1: string;
  player2: string;
}
export interface ICoinFlipGameStateUpdate {
  player1?: string;
  player2?: string;
  result?: {
    winner: string;
    value: number;
  };
}
export interface ICoinFlipGameState extends ICoinFlipGameStateUpdate {
  id: string;
  lastUpdate: Date;
}
