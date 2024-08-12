import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { TPermissions } from "../../store/types";
import YearCalendar from "../Calendars/YearCalendar";
import {
  UsePermissions,
  getHeight,
  getWindowDeviceHeight
} from "../CommonFunction";
import Window from "./WindowComponent/Window";
type IKendoWindow = {
  setVisible(t: boolean): void;
  reload(str: number): void;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({ setVisible, reload, modal = false }: IKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 250) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 250,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //조회버튼있는 title부분

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

  const [Information, setInformation] = useState<any>({
    yyyy: new Date(),
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const onConfirmClick = () => {
    reload(Information.yyyy);
    onClose();
  };
  return (
    <Window
      titles={"연도 설정"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <FormBoxWrap
        border={true}
        style={{ height: isMobile ? mobileheight : webheight }}
      >
        <FormBox>
          <tbody>
            <tr>
              <th style={{ width: "15%" }}>년도설정</th>
              <td>
                <DatePicker
                  name="yyyy"
                  format="yyyy"
                  value={Information.yyyy}
                  onChange={InputChange}
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          {permissions.save && (
            <Button themeColor={"primary"} onClick={onConfirmClick}>
              확인
            </Button>
          )}
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
