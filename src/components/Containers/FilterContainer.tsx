import { ReactNode, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { FilterBoxWrap } from "../../CommonStyled";
import { isFilterHideState, isFilterheightstate } from "../../store/atoms";
import FilterHideToggleButton from "../Buttons/FilterHideToggleButton";

type TChildren = {
  children: ReactNode;
};
const FilterContainer = ({ children }: TChildren) => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const [isFilterheightstates, setIsFilterheightstates] =
    useRecoilState(isFilterheightstate);

  const toggleFilterHide = () => {
    setIsFilterHideStates((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const newDeviceWidth = document.documentElement.clientWidth;
      const newIsMobile = newDeviceWidth <= 1200;
      setIsMobile(newIsMobile);
      if (newIsMobile) {
        setIsFilterHideStates(true); // 모바일 닫힌 상태로 설정
      } else {        
        setIsFilterHideStates(false); // 데스크톱 열린 상태로 설정
      }
    };
  
    // 초기 렌더링 시 실행
    handleResize();
  
    // 화면 크기 변경 이벤트에 대한 이벤트 리스너 추가
    window.addEventListener("resize", handleResize);
  
    // 컴포넌트가 unmount될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    var height = 0;
    var container = document.querySelector(".filterBox");
    if (container?.clientHeight != undefined) {
      height = container == undefined ? 0 : container.clientHeight;
      setIsFilterheightstates(isMobile ? height + 30 : height);
    } else {
      setIsFilterheightstates(isMobile ? 30 : 0);
    }
  }, [isFilterHideStates, isMobile]);

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
