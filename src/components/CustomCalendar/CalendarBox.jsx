import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarBox.css';
import moment from 'moment';
import { useContext } from 'react';
import { ColorThemeContext } from "./ColorThemeContext";

export default function CalendarBox({
  date: selectedDate,
  handleDate,
  schedule,
  closeDetail,
}) {
  const { colorTheme } = useContext(ColorThemeContext);

  const show = ({ date, view }) => {
    if (view === 'month') {
      const month = date.getMonth() + '월';
      let html = [];
      const scheduleList = Object.keys(schedule).includes(
        `${date.getMonth()}월`
      )
        ? schedule[month]
            .filter(
              (todo) => todo.date === moment(date).format('YYYY년 MM월 DD일')
            )
            .sort((a, b) => a.idx - b.idx)
        : [];

      const korean = /[ㄱ-ㅎ|ㅏ-ㅣ-가-힣]/;
      for (let i = 0; i < scheduleList.length; i++) {
        if (i === 2) break;
        const selectedColor =
          scheduleList[i].color === 'pink'
            ? '#ff8f8f'
            : scheduleList[i].color === 'yellow'
            ? '#fbde7e'
            : '#8cbc59';
        html.push(
          <div
            key={scheduleList[i].id}
            style={{ backgroundColor: selectedColor }}
          >
            {korean.test(scheduleList[i].title)
              ? scheduleList[i].title.length > 4
                ? scheduleList[i].title.substring(0, 4) + '..'
                : scheduleList[i].title
              : scheduleList[i].title.length > 5
              ? scheduleList[i].title.substring(0, 5) + '..'
              : scheduleList[i].title}
          </div>
        );
      }
      return <div className="scheduleBox">{html}</div>;
    }
  };
  return (
    <div className="container">
      <Calendar
        onChange={handleDate}
        value={selectedDate}
        formatDay={(locale, date) =>
          date.toLocaleString('en', { day: 'numeric' })
        }
        next2Label={null}
        prev2Label={null}
        tileContent={show}
        onClickDay={closeDetail}
        className={`${
          colorTheme === 'pink'
            ? 'pink'
            : colorTheme === 'yellow'
            ? 'yellow'
            : 'green'
        }`}
      />
    </div>
  );
}
