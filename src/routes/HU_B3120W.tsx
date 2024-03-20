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

const HU_B3120W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //엑셀 내보내기
  let _export: any;

  const exportExcel = () => {};

  const search = () => {};

  return (
    <>
      <TitleContainer>
        <Title>개인별 명세</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B3120W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
    </>
  );
};

export default HU_B3120W;
