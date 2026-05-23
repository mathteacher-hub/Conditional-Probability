const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "warm",
  "doorStyle": "classic",
  "sheetEndpoint": "https://script.google.com/macros/s/AKfycbwB9A_oatOCl8j3iJ5TPcJg1RtLlC6UInwvCkY3U7qghahMbKtFZwys7dEBT2Q4zkuI0A/exec"
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

  useE(() => {
    document.body.classList.remove('theme-warm', 'theme-night', 'theme-sage');
    document.body.classList.add('theme-' + t.theme);
  }, [t.theme]);

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

  const [info, setInfo] = useS({ name: '', classroom: '' });
  const [a1, setA1] = useS(null);
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
        'Đã ghi nhận. Cài đặt Google Sheet URL trong Tweaks để lưu thật.' :
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

        <section className="section">
          <h2 className="h2-with-num"><span className="num">02</span>Hãy thử chơi vài lượt</h2>
          <p>Chọn một cửa, xem MC mở cửa dê, rồi quyết định <strong>đổi</strong> hoặc <strong>giữ</strong>. Mỗi lượt sẽ được ghi vào thống kê của bạn bên dưới.</p>
          <MontyHallGame doorStyle={t.doorStyle} tally={tally} onTallyChange={recordOutcome} />
          <MontyStats tally={tally} onReset={resetStats} />
        </section>

        <section className="section">
          <h2 className="h2-with-num"><span className="num">03</span>Tổng kết bài học</h2>
          <p>Hãy hoàn thành khảo sát và trả lời câu hỏi tổng kết. Kết quả sẽ được gửi cho giáo viên.</p>

          <div className="form-card">
            <div className="form-label">Thông tin học sinh</div>
            <StudentInfoFields info={info} onChange={setInfo} />
          </div>
          
          <Question1 answer={a1} onAnswer={setA1} submitted={submitted} />

          <ExtraSurvey gender={gender} setGender={setGender} badminton={badminton} setBadminton={setBadminton} submitted={submitted} />

          <div className="submit-bar">
            <span className={'status ' + (submitStatus.state === 'ok' ? 'ok' : submitStatus.state === 'err' ? 'err' : '')}>
              {submitStatus.msg || (submitted ? '' : 'Vui lòng hoàn thành các phần trên để nộp bài.')}
            </span>
            {!submitted ?
            <button className="btn primary" onClick={handleSubmit} disabled={submitStatus.state === 'sending'}>
                {submitStatus.state === 'sending' ? 'Đang gửi…' : 'Gửi câu trả lời →'}
              </button> :
            <button className="btn secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                ↑ Quay lên đầu trang
              </button>
            }
          </div>
        </section>

        <div className="footer">
          <span>© Học liệu tương tác · Xác suất có điều kiện</span>
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Giao diện" />
        <TweakRadio label="Tông màu" value={t.theme} options={['warm', 'night', 'sage']} onChange={(v) => setTweak('theme', v)} />
        <TweakRadio label="Kiểu cửa" value={t.doorStyle} options={['classic', 'box', 'card']} onChange={(v) => setTweak('doorStyle', v)} />
        <TweakSection label="Thu thập dữ liệu" />
        <TweakText label="Google Sheet URL" value={t.sheetEndpoint} placeholder="https://script.google.com/.../exec" onChange={(v) => setTweak('sheetEndpoint', v)} />
        <div style={{ fontSize: 11, color: 'rgba(41,38,27,0.55)', lineHeight: 1.5, padding: '2px 0' }}>
          Dán URL của Google Apps Script Web App vào đây. Nếu để trống, hệ thống chạy ở chế độ demo (log ra console).
        </div>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
