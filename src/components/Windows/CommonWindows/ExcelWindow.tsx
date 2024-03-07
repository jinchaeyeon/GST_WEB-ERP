import { List, ListItem, ListItemText } from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import { BottomContainer, ButtonContainer } from "../../../CommonStyled";
import { IWindowPosition } from "../../../hooks/interfaces";

type IWindow = {
  setVisible(t: boolean): void;
  name: any[];
  setDownload(data: any): void;
  modal?: boolean;
};

const ExcelWindow = ({
  setVisible,
  name,
  setDownload,
  modal = false,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 830,
    height: 400,
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

  const onDownLoad = (index: any) => {
    setDownload(index);
  };

  return (
    <Window
      title={"엑셀 팝업"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <List dense={true} style={{height: `${position.height-150}px`}}>
        {name.map((item: any, index: any) => (
          <ListItem
            secondaryAction={
              <Button
                themeColor={"primary"}
                fillMode={"outline"}
                onClick={() => onDownLoad(index)}
              >
                다운로드
              </Button>
            }
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
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

export default ExcelWindow;
