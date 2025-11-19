import { useMemo, useState } from 'react';
import {
  TICKET_PRICE,
  RANKS,
  generateTickets,
  parseWinningNumbers,
  parseBonusNumber,
  evaluateTickets,
} from './lottoCore';
import './Lotto.css';

const DEFAULT_WINNING_NUMBERS = ['1', '5', '7', '26', '28', '43'];
const DEFAULT_BONUS_NUMBER = '30';
const TOTAL_STEPS = 3;

const NUMBER_COLORS = ['yellow', 'orange', 'blue', 'red', 'green', 'gray'];

const formatCurrency = (value) =>
  `${value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} 원`;

function Lotto() {
  const [amount, setAmount] = useState('8000');
  const [winningNumbers, setWinningNumbers] = useState(DEFAULT_WINNING_NUMBERS);
  const [bonusNumber, setBonusNumber] = useState(DEFAULT_BONUS_NUMBER);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  const ticketCount = useMemo(() => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return 0;
    }
    return Math.floor(numericAmount / TICKET_PRICE);
  }, [amount]);

  const handleNumberChange = (index, value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setWinningNumbers((prev) =>
      prev.map((prevValue, idx) => (idx === index ? sanitized : prevValue))
    );
  };

  const handleBonusChange = (value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setBonusNumber(sanitized);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const normalizedWinning = parseWinningNumbers(winningNumbers);
      const normalizedBonus = parseBonusNumber(bonusNumber, normalizedWinning);
      const numericAmount = Number(amount);
      const generatedTickets = generateTickets(numericAmount);
      const evaluation = evaluateTickets(
        generatedTickets,
        normalizedWinning,
        normalizedBonus
      );
      setTickets(generatedTickets);
      setStats(evaluation);
      setStep(1);
      setError('');
    } catch (submissionError) {
      setError(submissionError.message);
      setStep(0);
    }
  };

  const goToStep = (nextStep) => {
    if (nextStep < 0 || nextStep >= TOTAL_STEPS) {
      return;
    }
    if (nextStep > 0 && !stats) {
      return;
    }
    setStep(nextStep);
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <form className="lotto__form" onSubmit={handleSubmit}>
          <h2 className="lotto__title">로또</h2>

          <label className="lotto__label" htmlFor="lotto-amount">
            구입금액을 입력하세요 (1000원당 1장)
          </label>
          <div className="lotto__amount-field">
            <input
              id="lotto-amount"
              className="lotto__amount-input"
              type="number"
              min={TICKET_PRICE}
              step={TICKET_PRICE}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <span className="lotto__amount-suffix">원</span>
          </div>
          <p className="lotto__hint">
            현재 입력 금액으로는 총{' '}
            <strong>{ticketCount.toLocaleString('ko-KR')}</strong>장의 로또를
            발행해요.
          </p>

          <p className="lotto__label">당첨 번호를 입력하세요</p>
          <div className="lotto__numbers">
            {winningNumbers.map((value, index) => (
              <input
                key={index}
                type="number"
                min="1"
                max="45"
                className={`lotto-number lotto-number--${NUMBER_COLORS[index]}`}
                value={value}
                onChange={(event) =>
                  handleNumberChange(index, event.target.value)
                }
              />
            ))}

            <span className="lotto-number lotto-number--plus">+</span>

            <input
              type="number"
              min="1"
              max="45"
              className="lotto-number lotto-number--bonus"
              value={bonusNumber}
              onChange={(event) => handleBonusChange(event.target.value)}
            />
          </div>

          <button type="submit" className="lotto__primary">
            번호 발행
          </button>

          {error && (
            <p className="lotto__error" role="alert">
              {error}
            </p>
          )}
        </form>
      );
    }

    if (step === 1) {
      return (
        <section className="lotto__panel">
          <h2 className="lotto__title">로또</h2>
          <ul className="lotto__ticket-list">
            {tickets.map((ticket, index) => (
              <li key={`${ticket.join('-')}-${index}`}>
                <span className="lotto__ticket-label">
                  자동 {String(index + 1).padStart(2, '0')}
                </span>
                <span className="lotto__ticket-numbers">
                  {ticket
                    .map((number) => String(number).padStart(2, '0'))
                    .join(' ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      );
    }

    if (step === 2 && stats) {
      return (
        <section className="lotto__panel">
          <h2 className="lotto__title">결과</h2>

          <ul className="lotto__result-list">
            {RANKS.map((rank) => (
              <li key={rank.id}>
                <span className="lotto__result-label">
                  {rank.label} -{' '}
                  {rank.matches === 5 && rank.requiresBonus === true
                    ? '5개 + 보너스'
                    : `${rank.matches}개`}
                </span>
                <span className="lotto__result-count">
                  {stats.counts[rank.id] ?? 0}개
                </span>
              </li>
            ))}
          </ul>

          <div className="lotto__result-summary">
            <p>총 상금: {formatCurrency(stats.totalPrize)}</p>
            <p>수익률: {stats.profitRate}%</p>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="lotto">
      <div className="lotto__content">{renderStepContent()}</div>

      <div className="lotto__nav">
        <button
          type="button"
          className="lotto__nav-button"
          aria-label="이전 단계"
          onClick={() => goToStep(step - 1)}
          disabled={step === 0}
        >
          <span className="lotto__nav-icon lotto__nav-icon--prev" />
        </button>

        <button
          type="button"
          className="lotto__nav-button"
          aria-label="다음 단계"
          onClick={() => goToStep(step + 1)}
          disabled={step === TOTAL_STEPS - 1 || !stats}
        >
          <span className="lotto__nav-icon lotto__nav-icon--next" />
        </button>
      </div>
    </div>
  );
}

export default Lotto;
