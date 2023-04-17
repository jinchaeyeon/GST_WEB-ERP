import { Button } from "@progress/kendo-react-buttons";
import React from "react";

interface IFilterHideToggleButtonBox {
  isFilterHide: boolean;
  toggleFilterHide: () => void;
}

const FilterHideToggleButtonBox = ({
  isFilterHide,
  toggleFilterHide,
}: IFilterHideToggleButtonBox) => {
  return (
    <div className="visible-mobile-only " style={{ textAlign: "right" }}>
      <Button
        onClick={toggleFilterHide}
        themeColor={"secondary"}
        fillMode={"flat"}
        icon={isFilterHide ? "x" : "chevron-down"}
        style={{
          paddingRight: 0,
        }}
      >
        조회조건
      </Button>
    </div>
  );
};

export default FilterHideToggleButtonBox;
