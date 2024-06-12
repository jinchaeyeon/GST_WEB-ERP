import { DataResult, State, process } from "@progress/kendo-data-query";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import FileViewers from "../components/Viewer/FileViewers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

var height = 0;
var height2 = 0;

const AC_B8080W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_B8080W", setMessagesData);
  const [tabSelected, setTabSelected] = useState<number>(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B8080W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, tabSelected, webheight, webheight2]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        reqdt: setDefaultDate(customOptionData, "reqdt"),
        taxyy: setDefaultDate(customOptionData, "taxyy"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        chasu: defaultOption.find((item: any) => item.id == "chasu")?.valueCode,
        gisu: defaultOption.find((item: any) => item.id == "gisu")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 스테이트
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  //그리드 데이터 결과값
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    taxyy: new Date(),
    reqdt: new Date(),
    gisu: "01",
    chasu: "01",
    isSearch: false,
  });

  const [url, setUrl] = useState<string>("");
  const [url2, setUrl2] = useState<string>("");

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_B8080_01",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
        "@p_reqdt": convertDateToStr(filters.reqdt),
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_B8080_02",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
        "@p_gisu": filters.gisu,
        "@p_chasu": filters.chasu,
        "@p_reqdt": convertDateToStr(filters.reqdt),
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl2(URL.createObjectURL(blob));
      } else {
        setUrl2("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      fetchMainGrid();
    }
  }, [filters]);

  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      fetchMainGrid();
    } else {
      fetchMainGrid2();
    }
    setTabSelected(e.selected);
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.taxyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "AC_B8080W_001");
      } else if (
        convertDateToStr(filters.reqdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.reqdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.reqdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.reqdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8080W_001");
      } else if (
        filters.location == null ||
        filters.location == undefined ||
        filters.location == ""
      ) {
        throw findMessage(messagesData, "AC_B8080W_001");
      } else if (
        filters.chasu == null ||
        filters.chasu == undefined ||
        filters.chasu == ""
      ) {
        throw findMessage(messagesData, "AC_B8080W_001");
      } else {
        if (tabSelected == 0) {
          fetchMainGrid();
        } else {
          fetchMainGrid2();
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>수출실적명세서</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              disable={true}
              permissions={permissions}
              pathname="AC_B8080W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>

      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>신고년도</th>
              <td>
                <DatePicker
                  name="taxyy"
                  format="yyyy"
                  value={filters.taxyy}
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>신고기수</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gisu"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>차수</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="chasu"
                    value={filters.chasu}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                    textField="name"
                    valueField="code"
                  />
                )}
              </td>
              <th>작성일</th>
              <td>
                <DatePicker
                  name="reqdt"
                  format="yyyy-MM-dd"
                  value={filters.reqdt}
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab title="수출실적 일괄제출명세서">
          <GridContainer>
            <div
              style={{
                height: isMobile ? mobileheight : webheight,
              }}
            >
              {url != "" ? (
                <FileViewers fileUrl={url} isMobile={isMobile} />
              ) : (
                ""
              )}
            </div>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="수출실적명세서">
          <GridContainer>
            <div
              style={{
                height: isMobile ? mobileheight2 : webheight2,
              }}
            >
              {url2 != "" ? (
                <FileViewers fileUrl={url2} isMobile={isMobile} />
              ) : (
                ""
              )}
            </div>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
    </>
  );
};

export default AC_B8080W;
