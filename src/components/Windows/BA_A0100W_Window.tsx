import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { getHeight, getWindowDeviceHeight } from "../CommonFunction";
import Window from "./WindowComponent/Window";

type TKendoWindow = {
  setVisible(t: boolean): void;
  setData(number: number): void;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

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
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, []);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };

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
      onChangePostion={onChangePostion}
    >
      <FormBoxWrap style={{ height: isMobile ? mobileheight : webheight }}>
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
      <BottomContainer className="BottomContainer">
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
