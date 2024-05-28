import { ReactNode, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { FilterBoxWrap } from "../../CommonStyled";
import { isFilterHideState2, isFilterheightstate2, isMobileState } from "../../store/atoms";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";

type TChildren = {
  children: ReactNode;
};
const WindowFilterContainer = ({ children }: TChildren) => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  const [isFilterheightstates2, setIsFilterheightstates2] =
    useRecoilState(isFilterheightstate2);

  const toggleFilterHide = () => {
    setisFilterHideStates2((prev) => !prev);
  };

  useEffect(() => {
    var height = 0;
    var container = document.querySelector(".filterBox2");
    if (container?.clientHeight != undefined) {
      height = container == undefined ? 0 : container.clientHeight;
      setIsFilterheightstates2(isMobile ? height + 30 : height);
    } else {
      setIsFilterheightstates2(isMobile ? 30 : 0);
    }
  }, [isFilterHideStates2, isMobile]);

  return (
    <>
      <div className="visible-mobile-only2" style={{ textAlign: "right" }}>
        <FilterHideToggleButton
          isFilterHide={isFilterHideStates2}
          toggleFilterHide={toggleFilterHide}
        />
      </div>
      {(!isFilterHideStates2 || !isMobile) && (
        <div className="filterBox2">
          <FilterBoxWrap>{children}</FilterBoxWrap>
        </div>
      )}
    </>
  );
};

export default WindowFilterContainer;
