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

const CM_A1000W_617: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {};

  const search = () => {};

  return (
    <>
      <TitleContainer>
        <Title>업무일지</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A1000W_617"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
    </>
  );
};

export default CM_A1000W_617;
