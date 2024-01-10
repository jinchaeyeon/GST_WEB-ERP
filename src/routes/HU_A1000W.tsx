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

const HU_A1000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const search = () => {};

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>인사관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_A1000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
    </>
  );
};

export default HU_A1000W;
