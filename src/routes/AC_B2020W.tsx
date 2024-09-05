import { useEffect, useState } from "react";
import { TPermissions } from "../store/types";
import {
  getMenuName,
  GetPropertyValueByName,
  setDefaultDate,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../components/CommonFunction";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import { PAGE_SIZE } from "../components/CommonString";

const AC_B2020W: React.FC = () => {
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const search = () => {};
  const exportExcel = () => {};

  return (
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
  );
};

export default AC_B2020W;
