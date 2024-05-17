import { useEffect, useState } from "react";

const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // component unmount시 interval을 제거합니다.
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <p>
      {time.toLocaleDateString("ko-KR")}
      {["일", "월", "화", "수", "목", "금", "토"][time.getDay()]} <br />
      <span>{time.toLocaleTimeString("ko-KR")}</span>
    </p>
  );
};

export default CurrentTime;
