import moment from "moment";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getDateRange } from "../CommonFunction";
import "./CalendarBox.css";

export default function CalendarBox({
  date: selectedDate,
  handleDate,
  schedule,
  closeDetail,
  colorList,
}) {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth < 1200;

  const show = ({ date, view }) => {
    if (view === "month") {
      let html = [];
      const scheduleList = schedule
        .filter((todo) =>
          getDateRange(todo.start, todo.end).includes(
            moment(date).format("YYYYMMDD")
          )
        )
        .sort((a, b) => a.idx - b.idx);

      const korean = /[ㄱ-ㅎ|ㅏ-ㅣ-가-힣]/;

      for (let i = 0; i < scheduleList.length; i++) {
        if (i === 2) {
          html.push(
            <div
              key={scheduleList[i].id}
              style={{
                backgroundColor: colorList.filter(
                  (item) => item.sub_code == parseInt(scheduleList[i].colorID)
                )[0]?.color,
              }}
            >
              ...
            </div>
          );
          break;
        }

        html.push(
          <div
            key={scheduleList[i].id}
            style={{
              backgroundColor: colorList.filter(
                (item) => item.sub_code == parseInt(scheduleList[i].colorID)
              )[0]?.color,
            }}
          >
            {korean.test(scheduleList[i].title)
              ? scheduleList[i].title.length > 4
                ? scheduleList[i].title.substring(0, 4) + ".."
                : scheduleList[i].title
              : scheduleList[i].title.length > 5
              ? scheduleList[i].title.substring(0, 5) + ".."
              : scheduleList[i].title}
          </div>
        );
      }

      return (
        <div
          className="scheduleBox"
          style={{ display: "flex", gap: "5px", flexDirection: "column" }}
        >
          {isMobile && scheduleList.length > 0 ? (
            <div
              key={scheduleList[0].id}
              style={{
                backgroundColor: "gray",
              }}
            />
          ) : (
            html
          )}
        </div>
      );
    }
  };
  return (
    <div className="container">
      <Calendar
        onChange={handleDate}
        value={selectedDate}
        formatDay={(locale, start) =>
          start.toLocaleString("en", { day: "numeric" })
        }
        next2Label={null}
        prev2Label={null}
        tileContent={show}
        onClickDay={closeDetail}
        className={`${"blue"}`}
      />
    </div>
  );
}
