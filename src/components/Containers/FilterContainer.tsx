import { ReactNode, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { FilterBoxWrap } from "../../CommonStyled";
import { isFilterHideState, isFilterheightstate } from "../../store/atoms";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";

type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children }: TChildren) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [isFilterHide, setIsFilterHide] = useState(isMobile);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const [isFilterheightstates, setIsFilterheightstates] =
    useRecoilState(isFilterheightstate);

  const toggleFilterHide = () => {
    setIsFilterHideStates(!isFilterHide);
    setIsFilterHide((prev) => !prev);
  };

  useEffect(() => {
    var height = 0;
    var container = document.querySelector(".filterBox");
    if (container?.clientHeight != undefined) {
      height = container == undefined ? 0 : container.clientHeight;
      setIsFilterheightstates(height);
    }
  }, [isFilterHide]);

  return (
    <>
      <div className="visible-mobile-only" style={{ textAlign: "right" }}>
        <FilterHideToggleButton
          isFilterHide={isFilterHide}
          toggleFilterHide={toggleFilterHide}
        />
      </div>
      {!isFilterHide && (
        <div className="filterBox">
          <FilterBoxWrap>{children}</FilterBoxWrap>
        </div>
      )}
    </>
  );
};

export default FilterContainer;
