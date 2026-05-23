const { useState: useStateQ } = React;

const Q1 = {
  id: 'q1_strategy',
  title: 'Theo bạn, chiến lược nào cho xác suất thắng cao hơn?',
  hint: 'Hãy chọn dựa trên trải nghiệm thực tế bạn vừa chơi và mô phỏng ở trên.',
  options: [
    { id: 'swap', text: 'Đổi sang cửa còn lại', sub: 'Sau khi MC mở một cửa dê, đổi sang cửa còn chưa mở.' },
    { id: 'stay', text: 'Giữ cửa đã chọn ban đầu', sub: 'Không thay đổi quyết định ban đầu.' },
    { id: 'equal', text: 'Hai chiến lược có xác suất thắng bằng nhau', sub: 'Cả hai cửa còn lại đều có xác suất 1/2.' },
    { id: 'idk', text: 'Không chắc chắn', sub: 'Cần thêm thời gian phân tích.' }
  ],
  correct: 'swap',
};

function StudentInfoFields({ info, onChange }) {
  return (
    <div className="form-row">
      <div>
        <div className="form-label">Họ và tên</div>
        <input className="form-input" type="text" placeholder="VD: Nguyễn Văn An" value={info.name} onChange={e => onChange({ ...info, name: e.target.value })} />
      </div>
      <div>
        <div className="form-label">Lớp</div>
        <input className="form-input" type="text" placeholder="VD: 12A1" value={info.classroom} onChange={e => onChange({ ...info, classroom: e.target.value })} />
      </div>
    </div>
  );
}

function Question1({ answer, onAnswer, submitted }) {
  return (
    <div className="q-card">
      <div className="q-number">Câu hỏi 01 · Trắc nghiệm</div>
      <h3 className="q-title">{Q1.title}</h3>
      <p className="q-hint">{Q1.hint}</p>
      <div className="choices">
        {Q1.options.map(opt => (
          <label key={opt.id} className={'choice' + (answer === opt.id ? ' is-selected' : '')} onClick={() => !submitted && onAnswer(opt.id)}>
            <span className="radio" /><span className="text">{opt.text}<small>{opt.sub}</small></span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ExtraSurvey({ gender, setGender, badminton, setBadminton, submitted }) {
  const [show, setShow] = useStateQ(false);
  
  if (!show) {
    return (
      <div className="q-card" style={{ textAlign: 'center', padding: '40px 20px', borderLeft: '3px solid var(--teal)' }}>
        <h3 className="q-title" style={{ marginBottom: 12 }}>Khảo sát nhỏ ngoại khóa</h3>
        <p className="q-hint" style={{ margin: '0 auto 24px', maxWidth: '100%' }}>Phần này không liên quan đến bài toán, chỉ là một chút thông tin làm quen thôi nhé!</p>
        <button className="btn primary" onClick={() => setShow(true)}>Vào bài học →</button>
      </div>
    );
  }

  return (
    <div className="q-card" style={{ borderLeft: '3px solid var(--teal)' }}>
      <div className="q-number" style={{ color: 'var(--teal)' }}>Khảo sát ngoại khóa</div>
      <div className="form-row" style={{ marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div className="form-label">Em là nam hay nữ?</div>
          <div className="choices">
            <label className={'choice' + (gender === 'Nam' ? ' is-selected' : '')} onClick={() => !submitted && setGender('Nam')}><span className="radio" /><span className="text">Nam</span></label>
            <label className={'choice' + (gender === 'Nữ' ? ' is-selected' : '')} onClick={() => !submitted && setGender('Nữ')}><span className="radio" /><span className="text">Nữ</span></label>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="form-label">Em thích chơi cầu lông không?</div>
          <div className="choices">
            <label className={'choice' + (badminton === 'Có' ? ' is-selected' : '')} onClick={() => !submitted && setBadminton('Có')}><span className="radio" /><span className="text">Có</span></label>
            <label className={'choice' + (badminton === 'Không' ? ' is-selected' : '')} onClick={() => !submitted && setBadminton('Không')}><span className="radio" /><span className="text">Không</span></label>
          </div>
        </div>
      </div>
    </div>
  );
}

async function submitToSheet(endpoint, payload) {
  if (!endpoint || endpoint.includes('YOUR_DEPLOYMENT')) {
    console.log('[Submission demo] Payload:', payload);
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

Object.assign(window, {
  StudentInfoFields, Question1, ExtraSurvey, submitToSheet, Q1
});
