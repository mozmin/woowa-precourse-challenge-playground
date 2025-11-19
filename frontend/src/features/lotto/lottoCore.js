export const TICKET_PRICE = 1000;
export const NUMBER_MIN = 1;
export const NUMBER_MAX = 45;

export const RANKS = [
  {
    id: 'first',
    label: '1등',
    matches: 6,
    requiresBonus: null,
    prize: 2000000000,
  },
  {
    id: 'second',
    label: '2등',
    matches: 5,
    requiresBonus: true,
    prize: 30000000,
  },
  {
    id: 'third',
    label: '3등',
    matches: 5,
    requiresBonus: false,
    prize: 1500000,
  },
  { id: 'fourth', label: '4등', matches: 4, requiresBonus: null, prize: 50000 },
  { id: 'fifth', label: '5등', matches: 3, requiresBonus: null, prize: 5000 },
];

const ensureInteger = (value, message) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(message);
  }
  return parsed;
};

export const parseWinningNumbers = (values) => {
  if (!Array.isArray(values) || values.length !== 6) {
    throw new Error('당첨 번호 6개를 모두 입력해 주세요.');
  }

  const numbers = values.map((value) => {
    const parsed = ensureInteger(value, '당첨 번호는 정수여야 해요.');
    if (parsed < NUMBER_MIN || parsed > NUMBER_MAX) {
      throw new Error('번호는 1부터 45 사이여야 해요.');
    }
    return parsed;
  });

  const unique = new Set(numbers);
  if (unique.size !== numbers.length) {
    throw new Error('중복되지 않도록 번호를 입력해 주세요.');
  }

  return numbers;
};

export const parseBonusNumber = (value, winningNumbers) => {
  const parsed = ensureInteger(value, '보너스 번호는 정수여야 해요.');
  if (parsed < NUMBER_MIN || parsed > NUMBER_MAX) {
    throw new Error('보너스 번호는 1부터 45 사이여야 해요.');
  }
  if (winningNumbers.includes(parsed)) {
    throw new Error('보너스 번호는 당첨 번호와 겹칠 수 없어요.');
  }
  return parsed;
};

const createTicket = (randomFn = Math.random) => {
  const numbers = new Set();
  while (numbers.size < 6) {
    const candidate =
      NUMBER_MIN + Math.floor(randomFn() * (NUMBER_MAX - NUMBER_MIN + 1));
    numbers.add(candidate);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

export const generateTickets = (amount, randomFn = Math.random) => {
  const parsedAmount = ensureInteger(amount, '구입 금액은 정수여야 해요.');
  if (parsedAmount < TICKET_PRICE) {
    throw new Error('최소 1000원 이상 입력해 주세요.');
  }
  if (parsedAmount % TICKET_PRICE !== 0) {
    throw new Error('1000원 단위로 입력해 주세요.');
  }

  const count = parsedAmount / TICKET_PRICE;
  return Array.from({ length: count }, () => createTicket(randomFn));
};

export const evaluateTickets = (tickets, winningNumbers, bonusNumber) => {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    throw new Error('발행된 로또가 없어요.');
  }

  const winningSet = new Set(winningNumbers);
  const counts = RANKS.reduce((acc, rank) => ({ ...acc, [rank.id]: 0 }), {});

  let totalPrize = 0;

  tickets.forEach((ticket) => {
    const matchCount = ticket.filter((number) => winningSet.has(number)).length;
    const hasBonus = ticket.includes(bonusNumber);

    const matchedRank = RANKS.find((rank) => {
      if (rank.matches !== matchCount) {
        return false;
      }
      if (rank.requiresBonus === null) {
        return true;
      }
      return rank.requiresBonus === hasBonus;
    });

    if (!matchedRank) {
      return;
    }

    counts[matchedRank.id] += 1;
    totalPrize += matchedRank.prize;
  });

  const investment = tickets.length * TICKET_PRICE;
  const profitRate = Number(((totalPrize / investment) * 100).toFixed(1));

  return {
    counts,
    totalPrize,
    investment,
    profitRate: Number.isFinite(profitRate) ? profitRate : 0,
  };
};
