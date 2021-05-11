import * as uuid from "uuid";


const PubSub = {
  subscribe(roomId:string, name: string){

  }
}

export class SocketRoom<EventMap> {
  private attendees = new Map<string, boolean>()
  public readonly id = uuid.v4();
  constructor(public readonly name: string) {}

  join(id: string): void {
    this.attendees.set(id, true);
  }

  leave(id: string): void {
    this.attendees.delete(id);
  }

  hasJoined(id: string): boolean {
    return !!this.attendees.get(id);
  }

  emit<E extends keyof EventMap>(event: E, data: EventMap[E]) {

  }
}
