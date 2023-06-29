import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";

const CardBox = (props) => {
  const size = useWindowSize();
  console.log(size);
  function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
    useEffect(() => {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      // Add event listener
      window.addEventListener("resize", handleResize);
      // Call handler right away so state gets updated with initial window size
      handleResize();
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
  }

  return (
    <>
      <Card
        style={{
          height: "150px",
          width: "100%",
          marginRight: "15px",
          backgroundColor: props.backgroundColor,
          color: "white",
        }}
        title={props.title}
      >
        <p
          style={{
            fontSize: size.width < 600 ? "1.8rem" : "3.3rem",
            fontWeight: "900",
            color: "white",
            marginTop: 0,
          }}
        >
          {props.data}
        </p>
      </Card>
    </>
  );
};

export default CardBox;
