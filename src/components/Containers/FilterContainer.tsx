import { ReactNode, useState } from "react";
import { FilterBoxWrap } from "../../CommonStyled";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";
type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children }: TChildren) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [isFilterHide, setIsFilterHide] = useState(isMobile);

  return (
    <>
      <div className="visible-mobile-only" style={{ textAlign: "right" }}>
        <FilterHideToggleButton
          isFilterHide={isFilterHide}
          toggleFilterHide={() => setIsFilterHide((prev) => !prev)}
        />
      </div>
      {!isFilterHide && <FilterBoxWrap>{children}</FilterBoxWrap>}
    </>
  );
};

export default FilterContainer;
