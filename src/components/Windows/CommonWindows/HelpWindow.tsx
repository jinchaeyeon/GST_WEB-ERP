import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  Title,
  TitleContainer
} from "../../../CommonStyled";
import { IWindowPosition } from "../../../hooks/interfaces";

type IWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};

const UserWindow = ({ setVisible, modal = false }: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 830,
    height: 900,
  });

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };


  return (
    <Window
      title={"도움말"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <TitleContainer>
        <Title>메뉴얼</Title>
      </TitleContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default UserWindow;
