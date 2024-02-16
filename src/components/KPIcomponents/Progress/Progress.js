const Progress = ({ strokeWidth, percentage, Count, TopTitle, color }) => {
  const radius = 50 - strokeWidth / 2;
  const pathDescription = `
      M 50,50 m 0,-${radius}
      a ${radius},${radius} 0 1 1 0,${2 * radius}
      a ${radius},${radius} 0 1 1 0,-${2 * radius}
    `;

  const diameter = Math.PI * 2 * radius;
  const progressStyle = {
    stroke: color,
    strokeLinecap: "round",
    strokeDasharray: `${diameter}px ${diameter}px`,
    strokeDashoffset: `${((100 - percentage) / 100) * diameter}px`,
  };

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        className={"CircularProgressbar"}
        viewBox="0 0 100 100"
        width={150}
        height={150}
      >
        <path
          className="CircularProgressbar-trail"
          d={pathDescription}
          strokeWidth={strokeWidth}
          fillOpacity={0}
          style={{
            stroke: "#d6d6d6",
          }}
        />

        <path
          className="CircularProgressbar-path"
          d={pathDescription}
          strokeWidth={strokeWidth}
          fillOpacity={0}
          style={progressStyle}
        />

        <text
          className="CircularProgressbar-text"
          x={50}
          y={50}
          style={{
            fill: color,
            fontSize: "12px",
            dominantBaseline: "central",
            textAnchor: "middle",
            fontWeight: 700,
            fontFamily: "TheJamsil5Bold",
          }}
        >
          {`${TopTitle}\r\n${Count}건`}
        </text>
      </svg>
    </div>
  );
};

export default Progress;
