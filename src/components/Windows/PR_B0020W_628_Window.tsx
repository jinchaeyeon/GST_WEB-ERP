import { Button } from "@progress/kendo-react-buttons";
import { TextArea } from "@progress/kendo-react-inputs";
import { useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  getHeight,
  getWindowDeviceHeight,
  UseBizComponent,
} from "../CommonFunction";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import Window from "./WindowComponent/Window";

type TKendoWindow = {
  setVisible(t: boolean): void;
  setData(str: any): void;
  data: any;
};

var height = 0;
var height3 = 0;
const KendoWindow = ({ setVisible, setData, data }: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 300) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 300,
  });

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_PAC",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height3 = getHeight(".BottomContainer"); //하단 버튼부분
    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height3
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height3
    );
  }, []);
  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height3
    );
  };
  const onClose = () => {
    setVisible(false);
  };

  const [filters, setFilters] = useState({
    Ingredients: data.Ingredients,
    ingredgb: data.ingredgb,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectData = () => {
    setData(filters);
    onClose();
  };

  return (
    <Window
      titles={"성분"}
      positions={position}
      Close={onClose}
      modals={false}
      onChangePostion={onChangePostion}
    >
      <FormBoxWrap style={{ height: isMobile ? mobileheight : webheight }}>
        <FormBox>
          <tbody>
            <tr>
              <th>줄개수</th>
              <td>
                <BizComponentRadioGroup
                  name="ingredgb"
                  value={filters.ingredgb}
                  bizComponentId="R_PAC"
                  bizComponentData={bizComponentData}
                  changeData={filterRadioChange}
                />
              </td>
            </tr>
            <tr>
              <th>내용</th>
              <td>
                <TextArea
                  value={filters.Ingredients}
                  name="Ingredients"
                  rows={filters.ingredgb}
                  onChange={filterInputChange}
                  style={{
                    fontSize:
                      filters.ingredgb == 1
                        ? "18px"
                        : filters.ingredgb == 2
                        ? "15px"
                        : filters.ingredgb == 3
                        ? "13px"
                        : "11.8px",
                  }}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={selectData}>
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
