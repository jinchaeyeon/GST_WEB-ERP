import { DataResult, State, process } from "@progress/kendo-data-query";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
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
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const AC_B8080W: React.FC = () => {
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [tabSelected, setTabSelected] = useState<number>(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        chasu: defaultOption.find((item: any) => item.id === "chasu").valueCode,
        gisu: defaultOption.find((item: any) => item.id === "gisu").valueCode,
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

  const [isInitSearch, setIsInitSearch] = useState(false);

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
    orgdiv: "01",
    location: "01",
    taxyy: new Date(),
    reqdt: new Date(),
    gisu: "01",
    chasu: "01",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_B8100W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_reqdt": convertDateToStr(filters.reqdt),
      "@p_taxyy": convertDateToStr(filters.taxyy).substring(0, 4),
      "@p_gisu": filters.gisu,
      "@p_chasu": filters.chasu,
      "@p_location": filters.location,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        uri: row.xlsx,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async () => {
    if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        uri: row.xlsx,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch === false && permissions !== null) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

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
      <TitleContainer>
        <Title>수출실적명세서</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
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
                {" "}
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
                  format="yyyy"
                  value={filters.reqdt}
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
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
      >
        <TabStripTab title="수출실적 일괄제출명세서">
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              {/* {mainDataResult.total > 0 ? (
            <FileViewers file={mainDataResult.data[0]} type="xlsx" />
          ) : (
            ""
          )} */}
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="수출실적명세서">
          <GridContainer>
            <ExcelExport
              data={mainDataResult2.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              {/* {mainDataResult2.total > 0 ? (
            <FileViewers file={mainDataResult2.data[0]} type="xlsx" />
          ) : (
            ""
          )} */}
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
    </>
  );
};

export default AC_B8080W;
