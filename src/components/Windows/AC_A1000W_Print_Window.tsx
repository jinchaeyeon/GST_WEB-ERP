import { Button } from "@progress/kendo-react-buttons";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  GetPropertyValueByName,
  UseCustomOption,
  getHeight,
  getWindowDeviceHeight
} from "../CommonFunction";
import ReplaceTaxReport from "../Prints/ReplaceTaxReport";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import Window from "./WindowComponent/Window";

type IWindow = {
  data?: any;
  setVisible(t: boolean): void;
  modal?: boolean;
};
var height = 0;
var height2 = 0;
const CopyWindow = ({ data, setVisible, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 220) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 220,
  });
  const [position2, setPosition2] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //조회버튼있는 title부분

      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height2
      );
      setWebHeight(
        getWindowDeviceHeight(false, position.height) - height - height2
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };

  const onChangePostion2 = (position: any) => {
    setPosition2(position);
  };

  const [previewVisible, setPreviewVisible] = React.useState<boolean>(false);

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState({
    print: "",
  });

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        print: defaultOption.find((item: any) => item.id == "print")?.valueCode,
      }));
    }
  }, [customOptionData]);

  const onClose = () => {
    setVisible(false);
  };

  const onPrintWndClick = () => {
    setPreviewVisible((prev) => !prev);
  };

  return (
    <>
      <Window
        titles={"출력형태"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <FormBoxWrap
          style={{
            height: isMobile ? mobileheight : webheight,
            overflow: "auto",
          }}
        >
          <FormBox>
            <tbody>
              <tr>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="print"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={onPrintWndClick}>
              확인
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
      {previewVisible && (
        <Window
          titles={"미리보기"}
          positions={position2}
          Close={() => setPreviewVisible((prev) => !prev)}
          modals={false}
          onChangePostion={onChangePostion2}
        >
          <ReplaceTaxReport Type={filters.print} data={data} />
        </Window>
      )}
    </>
  );
};

export default CopyWindow;
