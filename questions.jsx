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
    wrong: 'Chưa đúng. Đáp án là ĐỔI CỬA. Xác suất thắng khi đổi là 2/3, gấp đôi xác suất khi giữ (1/3). Bạn hãy xem lại cây xác suất để thấy sự chênh lệch nhé.'
  }
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
          placeholder="VD: 12A1"
          value={info.classroom}
          onChange={e => onChange({ ...info, classroom: e.target.value })}
