import { ReactNode, useEffect } from "react";
import { useRecoilState } from "recoil";
import { FilterBoxWrap } from "../../CommonStyled";
import { isFilterHideState, isFilterheightstate } from "../../store/atoms";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";

type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children }: TChildren) => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const [isFilterheightstates, setIsFilterheightstates] =
    useRecoilState(isFilterheightstate);

  const toggleFilterHide = () => {
    setIsFilterHideStates((prev) => !prev);
  };

  useEffect(() => {
    var height = 0;
    var container = document.querySelector(".filterBox");
    if (container?.clientHeight != undefined) {
      height = container == undefined ? 0 : container.clientHeight;
      setIsFilterheightstates(isMobile ? height + 30 : height);
    } else {
      setIsFilterheightstates(isMobile ? 30 : 0);
    }
  }, [isFilterHideStates]);

  return (
    <>
      <div className="visible-mobile-only" style={{ textAlign: "right" }}>
        <FilterHideToggleButton
          isFilterHide={isFilterHideStates}
          toggleFilterHide={toggleFilterHide}
        />
      </div>
      {(!isFilterHideStates || !isMobile) && (
        <div className="filterBox">
          <FilterBoxWrap>{children}</FilterBoxWrap>
        </div>
      )}
    </>
  );
};

export default FilterContainer;
