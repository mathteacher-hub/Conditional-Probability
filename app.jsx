// app.jsx — Main learning page

const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "warm",
  "doorStyle": "classic",
  "sheetEndpoint": "" // NHỚ DÁN LẠI LINK GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY
} /*EDITMODE-END*/;

function HeroDoorsArt() {
  return (
    <svg viewBox="0 0 280 120" className="hero-art" aria-hidden="true">
      <g>
        <rect x="14" y="20" width="64" height="92" rx="3" fill="var(--gold)" stroke="var(--gold-deep)" strokeWidth="2" />
        <rect x="108" y="20" width="64" height="92" rx="3" fill="var(--gold)" stroke="var(--gold-deep)" strokeWidth="2" />
        <rect x="202" y="20" width="64" height="92" rx="3" fill="var(--gold)" stroke="var(--gold-deep)" strokeWidth="2" />
        <text x="46" y="72" textAnchor="middle" fontFamily="var(--serif)" fontSize="36" fontWeight="700" fill="var(--gold-deep)">1</text>
        <text x="140" y="72" textAnchor="middle" fontFamily="var(--serif)" fontSize="36" fontWeight="700" fill="var(--gold-deep)">2</text>
        <text x="234" y="72" textAnchor="middle" fontFamily="var(--serif)" fontSize="36" fontWeight="700" fill="var(--gold-deep)">3</text>
        <circle cx="46" cy="6" r="3" fill="var(--ink-mute)" />
        <circle cx="140" cy="6" r="5" fill="var(--gold-deep)" />
        <circle cx="234" cy="6" r="3" fill="var(--ink-mute)" />
      </g>
    </svg>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme to body
  useE(() => {
    document.body.classList.remove('theme-warm', 'theme-night', 'theme-sage');
    document.body.classList.add('theme-' + t.theme);
  }, [t.theme]);

  // ── Game tally state ──
  const [tally, setTally] = useS({
    swap: { wins: 0, total: 0 },
    stay: { wins: 0, total: 0 }
  });
  
  function recordOutcome(strategy, won) {
    setTally((prev) => ({
      ...prev,
      [strategy]: {
        wins: prev[strategy].wins + (won ? 1 : 0),
        total: prev[strategy].total + 1
      }
    }));
  }

  function resetStats() {
    setTally({ swap: { wins: 0, total: 0 }, stay: { wins: 0, total: 0 } });
  }

  // ── Student info & answers ──
  const [info, setInfo] = useS({ name: '', classroom: '' });
  const [a1, setA1] = useS(null);
  
  // State cho Khảo sát ngoại khoá
  const [gender, setGender] = useS(''); 
  const [badminton, setBadminton] = useS('');
  
  const [submitted, setSubmitted] = useS(false);
  const [submitStatus, setSubmitStatus] = useS({ state: 'idle', msg: '' });

  async function handleSubmit() {
    if (!info.name.trim() || !info.classroom.trim()) {
      setSubmitStatus({ state: 'err', msg: 'Vui lòng điền Họ tên và Lớp.' });
      return;
    }
    if (!gender || !badminton) {
      setSubmitStatus({ state: 'err', msg: 'Vui lòng hoàn thành mục Khảo sát ngoại khóa.' });
      return;
    }
    if (!a1) {
      setSubmitStatus({ state: 'err', msg: 'Vui lòng trả lời Câu 1.' });
      return;
    }

    setSubmitStatus({ state: 'sending', msg: 'Đang gửi...' });
    
    const payload = {
      timestamp: new Date().toLocaleString('vi-VN'),
      name: info.name.trim(),
      classroom: info.classroom.trim(),
      gender: gender,
      badminton: badminton,
      games_played: tally.swap.total + tally.stay.total,
      swap_total: tally.swap.total,
      swap_wins: tally.swap.wins,
      stay_total: tally.stay.total,
      stay_wins: tally.stay.wins,
      q1_answer: a1
    };

    const result = await submitToSheet(t.sheetEndpoint, payload);
    if (result.ok) {
      setSubmitted(true);
      setSubmitStatus({
        state: 'ok',
        msg: result.demo ?
        'Đã ghi nhận (chế độ demo). Cài đặt Google Sheet URL trong Tweaks để lưu thật.' :
        'Đã gửi câu trả lời thành công. Cảm ơn bạn!'
      });
    } else {
      setSubmitStatus({ state: 'err', msg: 'Lỗi gửi: ' + (result.error || 'không xác định') });
    }
  }

  return (
    <div>
      <div className="page">
        <div className="topbar">
          <span className="brand">Xác suất có điều kiện — Lớp 12</span>
          <span></span>
        </div>

        {/* ─── HERO ─── */}
        <section className="hero">
          <h1 className="h1-with-num"><span className="num">01</span>Bài toán <em>Monty&nbsp;Hall</em></h1>
          <div className="hero-body">
            <p className="lede">
              Bạn đang tham gia một game-show. Trước mặt là <strong>ba cánh cửa</strong>: đằng sau một cửa là <strong>chiếc xe ô tô</strong>, hai cửa còn lại là <strong>hai con dê</strong>. Bạn chọn một cửa. Sau đó MC — người biết rõ phần thưởng nằm ở đâu — mở một trong hai cửa còn lại, và đằng sau đó là một con dê. MC quay sang hỏi: <em>"Bạn muốn đổi sang cửa kia, hay giữ nguyên cửa đã chọn?"</em>
            </p>
            <div className="hero-aside">
              <HeroDoorsArt />
              <div className="hero-question">
                <span className="q-mark">?</span>
                <span className="q-text">Bạn sẽ làm gì để cơ hội thắng là cao nhất — <strong>đổi cửa</strong> hay <strong>giữ nguyên</strong>?</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── GAME + STATS ─── */}
        <section className="section">
          <h2 className="h2-with-num"><span className="num">02</span>Hãy thử chơi vài lượt</h2>
          <p>Chọn một cửa, xem MC mở cửa dê, rồi quyết định <strong>đổi</strong> hoặc <strong>giữ</strong>. Mỗi lượt sẽ được ghi vào thống kê của bạn bên dưới.</p>
          <MontyHallGame
            doorStyle={t.doorStyle}
            tally={tally}
            onTallyChange={recordOutcome} />
          
          <MontyStats tally={tally} onReset={resetStats} />
        </section>
