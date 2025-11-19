import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '../calculatorCore';

describe('calculatorCore', () => {
  describe('evaluateExpression', () => {
    it('returns an error message when input is empty', () => {
      expect(evaluateExpression('')).toEqual({
        error: '계산할 값을 입력해 주세요.',
      });
    });

    it('sums comma or colon separated numbers', () => {
      expect(evaluateExpression('1,2:3')).toMatchObject({ result: 6 });
    });

    it('handles mixed operators and parentheses', () => {
      const { result, error } = evaluateExpression('1 + 2 * (3 + 4)');
      expect(error).toBeUndefined();
      expect(result).toBe(15);
    });

    it('guards against consecutive operators', () => {
      const { error } = evaluateExpression('1++2');
      expect(error).toBe('연산자 사이에 숫자가 필요해요.');
    });
  });
});
