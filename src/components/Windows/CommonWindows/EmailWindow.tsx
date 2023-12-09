import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../../CommonStyled";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  Input,
  InputChangeEvent,
  TextArea,
} from "@progress/kendo-react-inputs";

type TKendoWindow = {
  setVisible(isVisible: boolean): void;
  modal?: boolean;
};

const KendoWindow = ({ setVisible, modal = false }: TKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 460,
    height: 500,
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

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState({
    senduser: "",
    recieveuser: "",
    title: "",
    contents: "",
  });

  const onSend = () => {};

  return (
    <Window
      title={"Email"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap border={true}>
        <FormBox>
          <tbody>
            <tr>
              <th style={{ width: "20%" }}>보내는 사람</th>
              <td>
                <Input
                  name="senduser"
                  type="text"
                  value={filters.senduser}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th style={{ width: "20%" }}>받는 사람</th>
              <td>
                <Input
                  name="recieveuser"
                  type="text"
                  value={filters.recieveuser}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th style={{ width: "20%" }}>제목</th>
              <td>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={InputChange}
                />
              </td>
            </tr>
            <tr>
              <th style={{ width: "20%" }}>내용</th>
              <td>
                <TextArea
                  value={filters.contents}
                  name="contents"
                  rows={9}
                  onChange={InputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onSend}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
