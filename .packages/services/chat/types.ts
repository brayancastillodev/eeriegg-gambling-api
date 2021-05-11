export interface IChatMessage {
  user: {
    id: string;
    name: string;
  };
  text: string;
}
export interface IChatEventMap {
  message: IChatMessage;
}
