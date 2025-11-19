const NAME_DELIMITER = /[,，]/;
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 5;
const MIN_ATTEMPTS = 1;
const MAX_ATTEMPTS = 10;

const randomInt = (randomFn) => Math.floor(randomFn() * 10);

export const parseCarNames = (rawInput) => {
  const trimmed = (rawInput ?? '').trim();
  if (!trimmed) {
    throw new Error('참가할 자동차 이름을 입력해 주세요.');
  }

  const names = trimmed
    .split(NAME_DELIMITER)
    .map((value) => value.trim())
    .filter(Boolean);

  if (names.length === 0) {
    throw new Error('자동차 이름을 최소 1개 이상 입력해야 해요.');
  }

  const unique = new Set();
  names.forEach((name) => {
    if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
      throw new Error('자동차 이름은 1자 이상 5자 이하로 입력해 주세요.');
    }
    if (unique.has(name)) {
      throw new Error('자동차 이름은 중복될 수 없어요.');
    }
    unique.add(name);
  });

  return Array.from(unique);
};

export const parseAttempts = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error('시도 횟수는 정수여야 해요.');
  }
  if (parsed < MIN_ATTEMPTS || parsed > MAX_ATTEMPTS) {
    throw new Error('시도 횟수는 1에서 10 사이로 입력해 주세요.');
  }
  return parsed;
};

export const simulateRace = (names, attempts, randomFn = Math.random) => {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('경주할 자동차가 없습니다.');
  }
  const rounds = parseAttempts(attempts);
  const cars = names.map((name) => ({ name, distance: 0 }));
  const history = [];

  for (let round = 1; round <= rounds; round += 1) {
    const snapshot = cars.map((car) => {
      const shouldMove = randomInt(randomFn) >= 4;
      if (shouldMove) {
        car.distance += 1;
      }
      return {
        name: car.name,
        distance: car.distance,
        moved: shouldMove,
      };
    });
    history.push({
      round,
      states: snapshot,
    });
  }

  const maxDistance = Math.max(...cars.map((car) => car.distance));
  const winners = cars
    .filter((car) => car.distance === maxDistance)
    .map((car) => car.name);

  return {
    history,
    winners,
    maxDistance,
  };
};

export const constants = {
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_ATTEMPTS,
  MAX_ATTEMPTS,
};
