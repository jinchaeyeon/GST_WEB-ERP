import React, { ReactNode, useState } from "react";
import FilterHideToggleButtonBox from "./Buttons/FilterHideToggleButtonBox";
import { FilterBoxWrap } from "../CommonStyled";
type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children }: TChildren) => {
  const [isFilterHide, setIsFilterHide] = useState(false);

  return (
    <>
      <FilterHideToggleButtonBox
        isFilterHide={isFilterHide}
        toggleFilterHide={() => setIsFilterHide((prev) => !prev)}
      />
      {isFilterHide && <FilterBoxWrap>{children}</FilterBoxWrap>}
    </>
  );
};

export default FilterContainer;
