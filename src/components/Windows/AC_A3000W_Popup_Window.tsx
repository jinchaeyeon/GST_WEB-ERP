import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { Iparameters, TPermissions } from "../../store/types";
import MonthCalendar from "../Calendars/MonthCalendar";
import YearCalendar from "../Calendars/YearCalendar";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  reload(arr: any): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};

const lastMonth = (date: Date) => {
  return new Date(date.getFullYear(), 12, 0);
};

var height = 0;
var height2 = 0;

const CopyWindow = ({
  setVisible,
  reload,
  modal = false
}: IWindow) => {
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
    left: isMobile == true ? 0 : (deviceWidth - 700) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 300) / 2,
    width: isMobile == true ? deviceWidth : 700,
    height: isMobile == true ? deviceHeight : 300,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분

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

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        todt: lastMonth(new Date()),
        depdiv: defaultOption.find((item: any) => item.id == "depdiv")
          ?.valueCode,
        fxcode: defaultOption.find((item: any) => item.id == "fxcode")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    fxcode: "",
    depdiv: "",
    fxyrmm: new Date(),
  });

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = async () => {
    if (!permissions.save) return;
    let data: any;
    const para: Iparameters = {
      procedureName: "P_AC_A3000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": filters.depdiv == "A" ? "Monthdep" : "Yeardep",
        "@p_orgdiv": filters.orgdiv,
        "@p_depdiv": filters.depdiv,
        "@p_fxcode": filters.fxcode == "000" ? "" : filters.fxcode,
        "@p_fxyrmm": convertDateToStr(filters.fxyrmm).substring(0, 4),
        "@p_frdt": convertDateToStr(filters.frdt).substring(0, 6),
        "@p_todt": convertDateToStr(filters.todt).substring(0, 6),
        "@p_userid": userId,
        "@p_pc": pc,
      },
    };
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      reload(data.returnString);
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  return (
    <>
      <Window
        titles={"감가상각비현황팝업"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <FormBoxWrap
          className="WindowFormBoxWrap"
          style={{
            height: isMobile ? mobileheight : webheight,
          }}
        >
          <FormBox>
            <tbody>
              <tr>
                <th>상각구분</th>
                <td colSpan={3}>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="depdiv"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>상각년도</th>
                <td>
                  <DatePicker
                    name="fxyrmm"
                    value={filters.fxyrmm}
                    format="yyyy"
                    onChange={filterInputChange}
                    placeholder=""
                    calendar={YearCalendar}
                  />
                </td>
                <th>자산분류</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="fxcode"
                      value={filters.fxcode}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>상각년월</th>
                <td colSpan={3}>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="frdt"
                      value={filters.frdt}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                    ~
                    <DatePicker
                      name="todt"
                      value={filters.todt}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            {permissions.save && (
              <Button themeColor={"primary"} onClick={selectData}>
                확인
              </Button>
            )}
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
    </>
  );
};

export default CopyWindow;
