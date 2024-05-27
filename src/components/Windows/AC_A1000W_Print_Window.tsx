import { Button } from "@progress/kendo-react-buttons";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseMessages,
} from "../CommonFunction";
import ReplaceTaxReport from "../Prints/ReplaceTaxReport";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import Window from "./WindowComponent/Window";

type IWindow = {
  data?: any;
  setVisible(t: boolean): void;
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({ data, setVisible, modal = false, pathname }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 220) / 2,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 220,
  });

  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
    window.scrollTo(0, 0);
    setPreviewVisible((prev) => !prev);
  };

  return (
    <>
      <Window
        titles={"출력형태"}
        positions={position}
        Close={onClose}
        modals={modal}
      >
        <FormBoxWrap>
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
        <BottomContainer>
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
          positions={{
            width:
              isMobile == true ? document.documentElement.clientWidth : 1123,
            height:
              isMobile == true ? document.documentElement.clientHeight : 764,
            left:
              isMobile == true
                ? 0
                : (document.documentElement.clientWidth - 1123) / 2,
            top:
              isMobile == true
                ? 0
                : (document.documentElement.clientHeight - 794) / 2,
          }}
          Close={() => setPreviewVisible((prev) => !prev)}
          modals={modal}
        >
          <ReplaceTaxReport Type={filters.print} data={data} />
        </Window>
      )}
    </>
  );
};

export default CopyWindow;
