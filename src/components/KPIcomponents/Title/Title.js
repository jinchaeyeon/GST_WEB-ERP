const GridTitle = (props) => {
  return (
    <>
      <div
        className="flex flex-wrap align-items-center justify-content-between gap-2"
        style={{ padding: "5px 0px" }}
      >
        <span className="text-xl text-900 font-bold">{props.title}</span>
      </div>
    </>
  );
};

export default GridTitle;
