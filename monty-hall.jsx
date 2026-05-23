// monty-hall.jsx — Interactive Monty Hall game + statistics + auto-run
// Exports to window: MontyHallGame, MontyStats, ProbabilityTree

const { useState, useEffect, useRef, useCallback } = React;

// ─── Game logic helpers ─────────────────────────────────────────────────
function randInt(n) { return Math.floor(Math.random() * n); }

/**
 * Simulate one Monty Hall round.
 * Returns { car, firstPick, hostOpens, swapWin, stayWin }
 */
function simulateRound() {
  const car = randInt(3);
  const firstPick = randInt(3);
  // Host opens a door that is not the player's pick and not the car
  const available = [0, 1, 2].filter(d => d !== firstPick && d !== car);
  const hostOpens = available[randInt(available.length)];
  const swapTo = [0, 1, 2].find(d => d !== firstPick && d !== hostOpens);
  const stayWin = firstPick === car;
  const swapWin = swapTo === car;
  return { car, firstPick, hostOpens, swapTo, swapWin, stayWin };
}

// ─── Door component ──────────────────────────────────────────────────────
function Door({ index, doorStyle, state, content, onClick, label }) {
  // state: 'closed' | 'open-goat' | 'open-car' | 'chosen' | 'host-opened'
  const isOpen = state === 'open-goat' || state === 'open-car' || state === 'host-opened';
  const isChosen = state === 'chosen' || (label && label.includes('chọn'));
  const isWinner = state === 'open-car';

  return (
    <div className="door-wrap">
      <div
        className={[
          'door',
          'style-' + doorStyle,
          isOpen ? 'is-open' : '',
          isChosen ? 'is-chosen' : '',
          isWinner ? 'is-winner' : '',
          state === 'disabled' ? 'is-disabled' : ''
        ].join(' ')}
        onClick={() => state !== 'disabled' && state !== 'host-opened' && onClick && onClick(index)}
      >
        <div className="panel" />
        <span className="knob" />
        <span className="number">{index + 1}</span>
        <div className="reveal">
  {state === 'open-car' && (
    <div className="reveal-icon car">
      <img src="xe.jpg" alt="Xe ô tô"
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
    </div>
  )}
  {(state === 'open-goat' || state === 'host-opened') && (
    <div className="reveal-icon goat">
      <img src="dê.jpg" alt="Con dê"
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
    </div>
  )}
</div>
  );
}

// ─── Main game ───────────────────────────────────────────────────────────
function MontyHallGame({ doorStyle, onTallyChange, tally }) {
  // phase: 'idle' | 'picked' | 'hostOpened' | 'final'
  const [phase, setPhase] = useState('idle');
  const [car, setCar] = useState(null);
  const [pick, setPick] = useState(null);
  const [hostOpens, setHostOpens] = useState(null);
  const [finalPick, setFinalPick] = useState(null);
  const [strategy, setStrategy] = useState(null); // 'stay' | 'swap'

  function reset() {
    setPhase('idle');
    setCar(randInt(3));
    setPick(null);
    setHostOpens(null);
    setFinalPick(null);
    setStrategy(null);
  }

  useEffect(() => { reset(); /* eslint-disable-next-line */ }, []);

  function handlePick(i) {
    if (phase !== 'idle') return;
    setPick(i);
    // Host picks a goat-door that isn't the player's pick
    const choices = [0, 1, 2].filter(d => d !== i && d !== car);
    const open = choices[randInt(choices.length)];
    setHostOpens(open);
    setPhase('picked');
    setTimeout(() => setPhase('hostOpened'), 600);
  }

  function decide(s) {
    if (phase !== 'hostOpened') return;
    setStrategy(s);
    const swapTo = [0, 1, 2].find(d => d !== pick && d !== hostOpens);
    const fp = s === 'swap' ? swapTo : pick;
    setFinalPick(fp);
    setPhase('final');
    const won = fp === car;
    onTallyChange(s, won);
  }

  // Determine door states
  function doorState(i) {
    if (phase === 'idle') return 'closed';
    if (phase === 'picked') {
      return i === pick ? 'chosen' : 'closed';
    }
    if (phase === 'hostOpened') {
      if (i === hostOpens) return 'host-opened';
      if (i === pick) return 'chosen';
      return 'closed';
    }
    // final
    if (i === finalPick) return car === i ? 'open-car' : 'open-goat';
    if (i === car) return 'open-car';
    return i === hostOpens ? 'host-opened' : 'open-goat';
  }

  function doorLabel(i) {
    if (phase === 'idle') return '';
    if (i === hostOpens && phase !== 'idle') return 'MC mở';
    if (phase === 'final') {
      if (i === finalPick) return strategy === 'swap' ? 'Bạn đổi sang' : 'Bạn giữ';
      if (i === car && i !== finalPick) return 'Xe ở đây';
      return '';
    }
    if (i === pick) return 'Bạn chọn';
    return '';
  }

  const prompts = {
    idle: 'Hãy chọn một trong ba cánh cửa.',
    picked: 'MC đang mở một cánh cửa có con dê…',
    hostOpened: `MC đã mở cửa ${hostOpens + 1}. Bạn đổi cửa hay giữ nguyên?`,
    final: strategy === 'swap'
      ? (finalPick === car ? 'Đổi cửa — Bạn thắng! 🎉' : 'Đổi cửa — Tiếc quá, dê...')
      : (finalPick === car ? 'Giữ cửa — Bạn thắng! 🎉' : 'Giữ cửa — Tiếc quá, dê...')
  };

  const steps = {
    idle: 'Bước 1 / 3',
    picked: 'Bước 2 / 3',
    hostOpened: 'Bước 2 / 3',
    final: 'Bước 3 / 3'
  };

  return (
    <div className="stage">
      <div className="game-header">
        <div className="game-step">{steps[phase]}</div>
        <div className="game-step" style={{textAlign:'right'}}>
          Cửa có xe: <span style={{fontFamily:'var(--mono)', color:'var(--ink)'}}>?</span>
          {' · '}Đã chơi: <span style={{fontFamily:'var(--mono)', color:'var(--ink)'}}>{tally.swap.total + tally.stay.total}</span>
        </div>
      </div>
      <p className="game-prompt">{prompts[phase]}</p>

      <div className="stage-floor">
        <div className="doors">
          {[0, 1, 2].map(i => (
            <Door
              key={i}
              index={i}
              doorStyle={doorStyle}
              state={doorState(i)}
              onClick={handlePick}
              label={doorLabel(i)}
            />
          ))}
        </div>
      </div>

      <div className="actions">
        {phase === 'hostOpened' && (
          <>
            <button className="btn primary" onClick={() => decide('swap')}>
              Đổi sang cửa {[0,1,2].find(d => d !== pick && d !== hostOpens) + 1}
            </button>
            <button className="btn secondary" onClick={() => decide('stay')}>
              Giữ cửa {pick + 1}
            </button>
          </>
        )}
        {phase === 'final' && (
          <button className="btn primary" onClick={reset}>Chơi lượt mới →</button>
        )}
        {phase === 'idle' && (
          <span style={{fontFamily:'var(--mono)', fontSize:12, color:'var(--ink-mute)', letterSpacing:'0.08em'}}>
            ↑ Bấm vào một cánh cửa
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Statistics (compact, student-interaction only) ──────────────────────
function MontyStats({ tally, onReset }) {
  const totalGames = tally.swap.total + tally.stay.total;
  const swapPct = tally.swap.total ? (tally.swap.wins / tally.swap.total * 100) : 0;
  const stayPct = tally.stay.total ? (tally.stay.wins / tally.stay.total * 100) : 0;

  return (
    <div className="stats-strip">
      <div className="stats-strip-head">
        <div className="stats-title">Thống kê lượt chơi của bạn</div>
        <button className="btn ghost" onClick={onReset} disabled={!totalGames}>Reset</button>
      </div>
      <div className="stats-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Số lần chơi</div>
          <div className="stat-mini-value">{totalGames}</div>
          <div className="stat-mini-sub">tổng cộng</div>
        </div>
        <div className="stat-mini swap">
          <div className="stat-mini-label"><span className="dot" />Số lần ĐỔI cửa</div>
          <div className="stat-mini-value">{tally.swap.total}</div>
          <div className="stat-mini-sub">thắng {tally.swap.wins} · tỉ lệ thắng <strong>{tally.swap.total ? swapPct.toFixed(0) + '%' : '–'}</strong></div>
        </div>
        <div className="stat-mini stay">
          <div className="stat-mini-label"><span className="dot" />Số lần GIỮ cửa</div>
          <div className="stat-mini-value">{tally.stay.total}</div>
          <div className="stat-mini-sub">thắng {tally.stay.wins} · tỉ lệ thắng <strong>{tally.stay.total ? stayPct.toFixed(0) + '%' : '–'}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ─── Probability tree ────────────────────────────────────────────────────
function ProbabilityTree() {
  return (
    <div className="tree">
      <svg className="tree-svg" viewBox="0 0 760 340" preserveAspectRatio="xMidYMid meet">
        {/* Root */}
        <circle cx="40" cy="170" r="6" fill="var(--ink)" />
        <text x="40" y="195" textAnchor="middle" className="label-small">BẮT ĐẦU</text>

        {/* Branch 1: chose car (1/3) */}
        <line x1="46" y1="170" x2="280" y2="80" className="" />
        <text x="160" y="115" className="prob">P = 1/3</text>
        <text x="160" y="130" className="label-small">Chọn đúng cửa có XE</text>

        {/* Branch 2: chose goat (2/3) */}
        <line x1="46" y1="170" x2="280" y2="260" className="win" />
        <text x="160" y="225" className="prob">P = 2/3</text>
        <text x="160" y="240" className="label-small">Chọn nhầm cửa có DÊ</text>

        {/* Node "chọn đúng" */}
        <rect x="280" y="60" width="160" height="40" rx="6" fill="var(--bg-soft)" stroke="var(--rule)" />
        <text x="360" y="85" textAnchor="middle" className="label">Bạn chọn XE</text>

        {/* Node "chọn nhầm" */}
        <rect x="280" y="240" width="160" height="40" rx="6" fill="var(--bg-soft)" stroke="var(--moss)" />
        <text x="360" y="265" textAnchor="middle" className="label">Bạn chọn DÊ</text>

        {/* After host: outcomes if you SWAP */}
        {/* Top branch: chose car, swap → lose */}
        <line x1="440" y1="80" x2="600" y2="80" />
        <rect x="600" y="60" width="140" height="40" rx="6" fill="var(--bg-card)" stroke="var(--rust)" />
        <text x="670" y="78" textAnchor="middle" className="label">Đổi → THUA</text>
        <text x="670" y="93" textAnchor="middle" className="label-small outcome-lose">xác suất 1/3</text>

        {/* Bottom branch: chose goat, swap → win */}
        <line x1="440" y1="260" x2="600" y2="260" className="win" />
        <rect x="600" y="240" width="140" height="40" rx="6" fill="var(--bg-card)" stroke="var(--moss)" />
        <text x="670" y="258" textAnchor="middle" className="label">Đổi → THẮNG</text>
        <text x="670" y="273" textAnchor="middle" className="label-small outcome-win">xác suất 2/3</text>

        {/* Legend */}
        <text x="40" y="20" className="label-small">CÂY XÁC SUẤT · CHIẾN LƯỢC "ĐỔI CỬA"</text>
      </svg>
    </div>
  );
}

Object.assign(window, { MontyHallGame, MontyStats, ProbabilityTree, simulateRound });
