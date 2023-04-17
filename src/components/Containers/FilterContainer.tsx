import React, { ReactNode, useState } from "react";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";
import { FilterBoxWrap } from "../../CommonStyled";
type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children }: TChildren) => {
  const [isFilterHide, setIsFilterHide] = useState(false);

  return (
    <>
      <div className="visible-mobile-only " style={{ textAlign: "right" }}>
        <FilterHideToggleButton
          isFilterHide={isFilterHide}
          toggleFilterHide={() => setIsFilterHide((prev) => !prev)}
        />
      </div>
      {isFilterHide && <FilterBoxWrap>{children}</FilterBoxWrap>}
    </>
  );
};

export default FilterContainer;
