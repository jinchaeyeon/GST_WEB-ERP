import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap
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
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({
  setVisible,
  setData,
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
  UseCustomOption(setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 450) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 450,
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
    rtn: "01",
    report_issue_id: "",
  });

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const onConfirmClick = () => {
    if (Information.rtn == "") {
      alert("필수값을 채워주세요");
    } else {
      setData(Information);
      onClose();
    }
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
              <th>사유</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtn"
                    customOptionData={customOptionData}
                    changeData={RadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>당초 세금계산서 승인번호</th>
              <td>
                <Input
                  name="report_issue_id"
                  type="text"
                  value={Information.report_issue_id}
                  onChange={InputChange}
                  className="required"
                />
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
