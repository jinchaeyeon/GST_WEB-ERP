import { ReactNode, useState } from "react";
import { FilterBoxWrap } from "../../CommonStyled";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";
type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children}: TChildren) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [isFilterHide, setIsFilterHide] = useState(isMobile);

  const toggleFilterHide = () => {
    setIsFilterHide(prev => !prev);
     };

  return (
    <>
      <div className="visible-mobile-only" style={{ textAlign: "right" }}>
        <FilterHideToggleButton
          isFilterHide={isFilterHide}
          toggleFilterHide={toggleFilterHide}
        />
      </div>
      {!isFilterHide && <FilterBoxWrap>{children}</FilterBoxWrap>}
    </>
  );
};

export default FilterContainer;
