const getRandomInteger = async (min = 0, max = 1): Promise<number> => {
  // NOTE: this is a mocked function
  // TODO: implement safe random function
  return Math.random() * (max - min) + min;
};

export const GamblingTools = {
  getRandomInteger,
};
