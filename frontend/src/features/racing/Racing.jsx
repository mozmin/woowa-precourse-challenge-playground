import { useMemo, useState } from 'react';
import {
  constants,
  parseAttempts,
  parseCarNames,
  simulateRace,
} from './racingCore';
import './Racing.css';

const DEFAULT_NAMES = '포비, 네오, 라이언';
const DEFAULT_ATTEMPTS = '5';

function Racing() {
  const [carInput, setCarInput] = useState(DEFAULT_NAMES);
  const [attemptInput, setAttemptInput] = useState(DEFAULT_ATTEMPTS);
  const [raceResult, setRaceResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const previewCars = useMemo(() => {
    try {
      return parseCarNames(carInput);
    } catch {
      return [];
    }
  }, [carInput]);

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      const cars = parseCarNames(carInput);
      const parsedAttempts = parseAttempts(attemptInput);
      const result = simulateRace(cars, parsedAttempts);
      setRaceResult(result);
      setAttempts(parsedAttempts);
      setError('');
    } catch (submissionError) {
      setError(submissionError.message);
      setRaceResult(null);
    }
  };

  const trackLength = useMemo(() => {
    if (!raceResult) {
      return 0;
    }
    return Math.max(attempts, raceResult.maxDistance || 1);
  }, [attempts, raceResult]);

  return (
    <section className="racing">
      <div className="racing__grid">
        <form className="racing__config" onSubmit={handleSubmit}>
          <div>
            <p className="racing__eyebrow">Week 3</p>
            <h2 className="racing__title">자동차 경주</h2>
            <p className="racing__subtitle">
              자동차 이름과 시도 횟수를 입력하면, 순간적으로 레이스를
              시뮬레이션해서 우승자를 보여줄게요.
            </p>
          </div>

          <label className="racing__label" htmlFor="car-input">
            자동차 이름 (쉼표로 구분)
          </label>
          <textarea
            id="car-input"
            className="racing__textarea"
            value={carInput}
            rows={2}
            onChange={(event) => setCarInput(event.target.value)}
          />

          <div className="racing__chips">
            {previewCars.map((name) => (
              <span className="racing-chip" key={name}>
                {name}
              </span>
            ))}
            {previewCars.length === 0 && (
              <span className="racing-chip racing-chip--ghost">
                참가자를 입력해 주세요
              </span>
            )}
          </div>

          <label className="racing__label" htmlFor="attempt-input">
            시도 횟수 ({constants.MIN_ATTEMPTS} ~ {constants.MAX_ATTEMPTS})
          </label>
          <div className="racing__attempts">
            <input
              id="attempt-input"
              type="number"
              min={constants.MIN_ATTEMPTS}
              max={constants.MAX_ATTEMPTS}
              value={attemptInput}
              onChange={(event) => setAttemptInput(event.target.value)}
            />
            <div className="racing__attempts-bar">
              <div
                className="racing__attempts-fill"
                style={{
                  width: `${
                    ((Number(attemptInput) - constants.MIN_ATTEMPTS) /
                      (constants.MAX_ATTEMPTS - constants.MIN_ATTEMPTS)) *
                      100 || 0
                  }%`,
                }}
              />
            </div>
          </div>

          <button type="submit" className="racing__start">
            레이스 시작
          </button>

          {error && (
            <p className="racing__error" role="alert">
              {error}
            </p>
          )}
        </form>

        <div className="racing__board">
          {raceResult ? (
            <>
              <div className="racing__summary">
                <p className="racing__badge">RESULT</p>
                <h3>우승자</h3>
                <p className="racing__winners">
                  {raceResult.winners.join(', ')}{' '}
                  <span>({raceResult.maxDistance}칸)</span>
                </p>
              </div>

              <div className="racing__timeline">
                {raceResult.history.map((round) => (
                  <div className="racing-round" key={round.round}>
                    <div className="racing-round__header">
                      <span className="racing-round__dot" />
                      <span>{round.round}회차</span>
                    </div>
                    <div className="racing-round__lanes">
                      {round.states.map((state) => {
                        const progress =
                          trackLength === 0
                            ? 0
                            : Math.round((state.distance / trackLength) * 100);
                        return (
                          <div className="racing-lane" key={state.name}>
                            <span className="racing-lane__name">
                              {state.name}
                            </span>
                            <div className="racing-lane__track">
                              <div
                                className={`racing-lane__progress ${
                                  state.moved
                                    ? 'racing-lane__progress--boost'
                                    : ''
                                }`}
                                style={{ width: `${progress}%` }}
                              >
                                <span className="racing-lane__car" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="racing__placeholder">
              <p>레이스를 시작하면, 회차별 이동 경로가 이곳에 표시됩니다.</p>
              <span>🏁</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Racing;
