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

const PR_A0000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const search = () => {};

  return (
    <>
      <TitleContainer>
        <Title>현장관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              disable={true}
              permissions={permissions}
              pathname="PR_A0000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
    </>
  );
};

export default PR_A0000W;
