export interface IChatIncomingMessage {
  user: {
    id: string;
  };
  text: string;
}
export interface IChatOutgoingMessage {
  user: {
    id: string;
    name: string;
  };
  text: string;
  time: Date;
}
export interface IChatEventMap {
  message: IChatOutgoingMessage;
  joined: { userId: string; time: Date };
  left: { userId: string; time: Date };
}
export interface IChatActionMap {
  send: IChatIncomingMessage;
}
