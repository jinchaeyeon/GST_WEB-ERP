import React from "react";
const GridTitle = (props) => {
  return (
    <>
      <div className="flex flex-wrap align-items-center justify-content-between gap-2">
        <span className="text-xl text-900 font-bold">{props.title}</span>
      </div>
    </>
  );
};

export default GridTitle;
