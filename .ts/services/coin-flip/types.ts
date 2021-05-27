export interface ICoinFlipEventMap {
  confirmed: { userId: string; time: Date };
  joined: { userId: string; time: Date };
  created: { gameId: string; time: Date };
  left: { userId: string; time: Date };
  result: { winner: { userId: string }; time: Date };
}

export interface ICoinFlipActionMap {
  join: { gameId: string };
  create: undefined;
  leave: undefined;
  flip: undefined;
  confirm: undefined;
}
