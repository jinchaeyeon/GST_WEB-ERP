import { ReactNode, useState } from "react";
import { FilterBoxWrap } from "../../CommonStyled";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";
type TChildren = {
  children: ReactNode;
  updateSwiper?:any
};
const FilterContainer = ({ children, updateSwiper}: TChildren) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [isFilterHide, setIsFilterHide] = useState(isMobile);

  const toggleFilterHide = () => {
    setIsFilterHide(prev => !prev);
    updateSwiper();  // 필터 토글 시 Swiper 업데이트
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
