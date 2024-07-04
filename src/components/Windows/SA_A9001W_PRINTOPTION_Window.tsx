import { Button } from "@progress/kendo-react-buttons";
import { Checkbox } from "@progress/kendo-react-inputs";
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
  getWindowDeviceHeight
} from "../CommonFunction";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import Window from "./WindowComponent/Window";
type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: any): void;
  filters: any;
  pathname: string;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({
  setVisible,
  setData,
  filters,
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
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 250) / 2,
    width: isMobile == true ? deviceWidth : 800,
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

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    gubun: filters.gubun,
    Qtyyn: filters.Qtyyn,
    supplier: filters.supplier,
    reciver: filters.reciver,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value == true ? "Y" : "N",
    }));
  };
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
    setData(Information);
    onClose();
  };

  return (
    <Window
      titles={"PRINTOPTIONS"}
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
              <td colSpan={2}>
                <Checkbox
                  title="공급자"
                  label="공급자"
                  name="supplier"
                  value={Information.supplier == "Y" ? true : false}
                  onChange={InputChange}
                />
              </td>
              <th>청구영수구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gubun"
                    customOptionData={customOptionData}
                    changeData={RadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <Checkbox
                  title="공급받는자"
                  label="공급받는자"
                  name="reciver"
                  value={Information.reciver == "Y" ? true : false}
                />
              </td>
              <td colSpan={2}>
                <Checkbox
                  title="수량제외"
                  label="수량제외"
                  name="Qtyyn"
                  value={Information.Qtyyn == "Y" ? true : false}
                  onChange={InputChange}
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
