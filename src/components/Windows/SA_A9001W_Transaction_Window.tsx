import { Button } from "@progress/kendo-react-buttons";
import { useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { TPermissions } from "../../store/types";
import {
  UseCustomOption,
  UsePermissions,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import Window from "./WindowComponent/Window";
type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: any): void;
  pathname: string;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({
  setVisible,
  setData,
  pathname,
  modal = false,
}: IKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 230) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 230,
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

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    gubun2: "N",
  });

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const onClose = () => {
    setVisible(false);
  };

  const onConfirmClick = () => {
    setData(Information.gubun2);
    onClose();
  };

  return (
    <Window
      titles={"거래명세표 첨부여부"}
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
              <th>청구영수구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gubun2"
                    customOptionData={customOptionData}
                    changeData={RadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmClick}>
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
