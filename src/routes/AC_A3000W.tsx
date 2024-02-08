import { ExcelExport } from "@progress/kendo-react-excel-export";
import React, { useState } from "react";
import {
  ButtonContainer,
  Title,
  TitleContainer
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  UsePermissions
} from "../components/CommonFunction";
import { TPermissions } from "../store/types";

const AC_A3000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {
 
  };

  return (
    <>
      <TitleContainer>
        <Title>감가상각비현황</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A3000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
    </>
  );
};

export default AC_A3000W;
