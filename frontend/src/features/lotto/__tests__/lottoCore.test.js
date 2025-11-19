import { describe, it, expect } from 'vitest';
import { TICKET_PRICE, generateTickets, evaluateTickets } from '../lottoCore';

const createCyclingRandom = () => {
  let current = 0;
  return () => {
    const value = (current % 45) / 45;
    current += 1;
    return value;
  };
};

describe('lottoCore', () => {
  it('generates predictable tickets with a custom random function', () => {
    const randomFn = createCyclingRandom();
    const tickets = generateTickets(TICKET_PRICE * 2, randomFn);
    expect(tickets).toHaveLength(2);
    tickets.forEach((ticket) => {
      expect(ticket).toHaveLength(6);
      expect(new Set(ticket).size).toBe(6);
    });
  });

  it('evaluates rank counts and profit rate', () => {
    const tickets = [
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 7],
    ];
    const winningNumbers = [1, 2, 3, 4, 5, 6];
    const bonusNumber = 7;

    const stats = evaluateTickets(tickets, winningNumbers, bonusNumber);

    expect(stats.counts.first).toBe(1);
    expect(stats.counts.second).toBe(1);
    expect(stats.totalPrize).toBe(2000000000 + 30000000);
    expect(stats.profitRate).toBe(101500000);
  });
});
