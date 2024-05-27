import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import Window from "./WindowComponent/Window";

type TKendoWindow = {
  setVisible(t: boolean): void;
  setData(number: number): void;
  modal?: boolean;
};

const KendoWindow = ({ setVisible, setData, modal = false }: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 250) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 220) / 2,
    width: isMobile == true ? deviceWidth : 250,
    height: isMobile == true ? deviceHeight : 220,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setInitialVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const [initialVal, setInitialVal] = useState({
    number: 0,
  });

  const onSaveClick = () => {
    setData(initialVal.number);
    onClose();
  };

  return (
    <Window
      titles={"일괄생성"}
      positions={position}
      Close={onClose}
      modals={modal}
    >
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th>일괄등록</th>
              <td>
                <Input
                  name="number"
                  type="number"
                  value={initialVal.number}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onSaveClick}>
            저장
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
