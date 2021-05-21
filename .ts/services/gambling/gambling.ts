export class GamblingService {
  async getRandomInteger(max: number): Promise<number> {

    // NOTE: this is a mocked function
    // TODO: implement safe random function
    return Math.floor(Math.random() * max);
  }
}
