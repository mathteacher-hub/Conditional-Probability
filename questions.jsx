// questions.jsx — Student info form + two questions + Google Sheets submission

const { useState: useStateQ } = React;

// Q1 — Multiple choice: intuition about which strategy
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
  explanation: {
    correct: 'Đúng. Khi đổi cửa, xác suất thắng là 2/3 ≈ 66.7%, gấp đôi so với khi giữ nguyên (1/3).',
    wrong: 'Chưa đúng. Đáp án là ĐỔI CỬA. Xác suất thắng khi đổi là 2/3, gấp đôi xác suất khi giữ (1/3). Hãy đọc lý do ở Câu 2.'
  }
};

// Q2 — Essay: explain why
const Q2 = {
  id: 'q2_explain',
  title: 'Vì sao xác suất thắng khi đổi cửa là 2/3 (chứ không phải 1/2)?',
  hint: 'Trả lời ngắn 2–4 câu. Có thể dùng khái niệm xác suất có điều kiện P(A|B) hoặc liệt kê các trường hợp.',
  modelAnswer: [
    'Lúc đầu, xác suất chọn đúng cửa có xe là 1/3, xác suất chọn nhầm (chọn cửa dê) là 2/3.',
    'Khi MC mở một cửa dê, thông tin này KHÔNG làm thay đổi xác suất ban đầu của cửa bạn chọn — vẫn là 1/3.',
    'Vì tổng xác suất bằng 1, nên toàn bộ 2/3 xác suất còn lại "dồn" vào cánh cửa còn chưa mở. Do đó đổi cửa cho xác suất thắng = 2/3.',
    'Dùng công thức Bayes: P(xe ở cửa kia | MC mở cửa dê) = 2/3.'
  ]
};

function StudentInfoFields({ info, onChange }) {
  return (
    <div className="form-row">
      <div>
        <div className="form-label">Họ và tên</div>
        <input
          className="form-input"
          type="text"
          placeholder="VD: Nguyễn Văn An"
          value={info.name}
          onChange={e => onChange({ ...info, name: e.target.value })}
        />
      </div>
      <div>
        <div className="form-label">Lớp</div>
        <input
          className="form-input"
          type="text"
          placeholder="VD: 11A2"
          value={info.classroom}
          onChange={e => onChange({ ...info, classroom: e.target.value })}
        />
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
          <label
            key={opt.id}
            className={'choice' + (answer === opt.id ? ' is-selected' : '')}
            onClick={() => !submitted && onAnswer(opt.id)}
          >
            <span className="radio" />
            <span className="text">
              {opt.text}
              <small>{opt.sub}</small>
            </span>
          </label>
        ))}
      </div>

      {submitted && answer && (
        <div className={'feedback' + (answer === Q1.correct ? '' : ' is-wrong')}>
          <div className="verdict">
            {answer === Q1.correct ? '✓ Câu trả lời đúng' : '✗ Chưa đúng'}
          </div>
          <p>{answer === Q1.correct ? Q1.explanation.correct : Q1.explanation.wrong}</p>
          <p style={{marginTop:8}}>
            <span className="key">P(thắng | đổi) = 2/3</span>{' '}
            <span className="key">P(thắng | giữ) = 1/3</span>
          </p>
        </div>
      )}
    </div>
  );
}

function Question2({ answer, onAnswer, submitted }) {
  return (
    <div className="q-card">
      <div className="q-number">Câu hỏi 02 · Tự luận</div>
      <h3 className="q-title">{Q2.title}</h3>
      <p className="q-hint">{Q2.hint}</p>

      <textarea
        className="form-textarea"
        placeholder="Viết câu trả lời của bạn ở đây..."
        value={answer}
        disabled={submitted}
        onChange={e => onAnswer(e.target.value)}
      />

      {submitted && (
        <div className="feedback">
          <div className="verdict">★ Lời giải mẫu</div>
          {Q2.modelAnswer.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      )}
    </div>
  );
}

// ─── Submission ──────────────────────────────────────────────────────────
async function submitToSheet(endpoint, payload) {
  // Two paths:
  // 1) Google Apps Script Web App: POST JSON to the /exec URL
  // 2) Firebase: use a placeholder — student replaces this stub
  if (!endpoint || endpoint.includes('YOUR_DEPLOYMENT')) {
    // Demo mode — just log
    console.log('[Submission demo] Payload:', payload);
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors', // Apps Script doesn't return CORS headers by default
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    // With no-cors we can't read the response, so we assume success if fetch didn't throw
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

Object.assign(window, {
  StudentInfoFields, Question1, Question2, submitToSheet, Q1, Q2
});
