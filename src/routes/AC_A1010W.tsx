import React, { useState } from "react";
import {
  ButtonContainer,
  FilterBox,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  convertDateToStr,
  findMessage,
  getMenuName,
  handleKeyPressSearch,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { TPermissions } from "../store/types";
const AC_A1010W: React.FC = () => {
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyymm: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "AC_A1010W_001");
      } else {
        // setPage(initialPageState); // 페이지 초기화
        // resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
    </>
  );
};

export default AC_A1010W;
