import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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

type IWindow = {
  data?: any;
  setVisible(t: boolean): void;
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({ data, setVisible, modal = false, pathname }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 500,
    height: 220,
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

  const onPrintWndClick = () => {
    window.scrollTo(0, 0);
    setPreviewVisible((prev) => !prev);
  };

  return (
    <>
      <Window
        title={"출력형태"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
          <FormBox>
            <tbody>
              <tr>
                <td>
                  <div className="filter-item-wrap">
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="print"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </div>
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
          title={"미리보기"}
          onClose={() => {
            setPreviewVisible((prev) => !prev);
          }}
          initialHeight={794}
          initialWidth={1123}
        >
          <ReplaceTaxReport Type={filters.print} data={data} />
        </Window>
      )}
    </>
  );
};

export default CopyWindow;
