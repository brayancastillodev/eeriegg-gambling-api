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
  flip: undefined;
  confirm: undefined;
}
