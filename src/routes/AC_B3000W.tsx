import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  LandscapePrint,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import CenterCell from "../components/Cells/CenterCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "idx";

var height = 0;

const AC_B3000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height);
        setWebHeight(getDeviceHeight(true) - height);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);

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
  UseMessages(setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        fxdiv: defaultOption.find((item: any) => item.id == "fxdiv")?.valueCode,
        fxdepsts: defaultOption.find((item: any) => item.id == "fxdepsts")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);

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
    yyyy: new Date(),
    fxdiv: "",
    fxdepsts: "",
    isSearch: false,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_B3000W_Q",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_yyyy": convertDateToStr(filters.yyyy).substr(0, 4),
      "@p_fxdiv": filters.fxdiv,
      "@p_fxdepsts": filters.fxdepsts,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[0];
      setSelectedState({ [firstRowData.itemcd]: true });
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (permissions.view && customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum, permissions, customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (
      isInitSearch == false &&
      permissions.view &&
      customOptionData !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions, customOptionData]);

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "AC_B3000W_001");
      } else {
        setDates(convertDateToStr(filters.yyyy).substring(0, 4) + "년");
        setDates2(
          convertDateToStr(
            new Date(
              filters.yyyy.getFullYear() - 1,
              filters.yyyy.getMonth(),
              filters.yyyy.getDate()
            )
          ).substring(0, 4) + "년"
        );
        setDates3(
          convertDateToStr(
            new Date(
              filters.yyyy.getFullYear() - 2,
              filters.yyyy.getMonth(),
              filters.yyyy.getDate()
            )
          ).substring(0, 4) + "년"
        );
        setDates4(
          convertDateToStr(
            new Date(
              filters.yyyy.getFullYear() - 3,
              filters.yyyy.getMonth(),
              filters.yyyy.getDate()
            )
          ).substring(0, 4) + "년"
        );
        setDates5(
          convertDateToStr(
            new Date(
              filters.yyyy.getFullYear() - 4,
              filters.yyyy.getMonth(),
              filters.yyyy.getDate()
            )
          ).substring(0, 4) + "년"
        );
        setDates6(
          convertDateToStr(
            new Date(
              filters.yyyy.getFullYear() - 5,
              filters.yyyy.getMonth(),
              filters.yyyy.getDate()
            )
          ).substring(0, 4) + "년이전"
        );
        resetAllGrid();
        fetchMainGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const componentRef = useRef(null);

  const [dates, setDates] = useState<string>(
    convertDateToStr(filters.yyyy).substring(0, 4) + "년"
  );
  const [dates2, setDates2] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyy.getFullYear() - 1,
        filters.yyyy.getMonth(),
        filters.yyyy.getDate()
      )
    ).substring(0, 4) + "년"
  );
  const [dates3, setDates3] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyy.getFullYear() - 2,
        filters.yyyy.getMonth(),
        filters.yyyy.getDate()
      )
    ).substring(0, 4) + "년"
  );
  const [dates4, setDates4] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyy.getFullYear() - 3,
        filters.yyyy.getMonth(),
        filters.yyyy.getDate()
      )
    ).substring(0, 4) + "년"
  );
  const [dates5, setDates5] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyy.getFullYear() - 4,
        filters.yyyy.getMonth(),
        filters.yyyy.getDate()
      )
    ).substring(0, 4) + "년"
  );
  const [dates6, setDates6] = useState<string>(
    convertDateToStr(
      new Date(
        filters.yyyy.getFullYear() - 5,
        filters.yyyy.getMonth(),
        filters.yyyy.getDate()
      )
    ).substring(0, 4) + "년이전"
  );

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              disable={true}
              permissions={permissions}
            />
          )}

          <ReactToPrint
            trigger={() => (
              <Button
                fillMode="outline"
                themeColor={"primary"}
                icon="print"
                disabled={permissions.print ? false : true}
              >
                출력
              </Button>
            )}
            content={() => componentRef.current}
          />
        </ButtonContainer>
      </TitleContainer>

      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준년도</th>
              <td>
                <DatePicker
                  name="yyyy"
                  value={filters.yyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
              <th>자산분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="fxdiv"
                    value={filters.fxdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>미상각여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="fxdepsts"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <Grid
          style={{ height: "800px", display: "none" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
            })),
            mainDataState
          )}
          {...mainDataState}
          onDataStateChange={onMainDataStateChange}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={mainDataResult.total}
          onScroll={onMainScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          <GridColumn
            field="fxnum"
            title="구분"
            width="80px"
            cell={CenterCell}
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="fxnm" title="품명" width="150px" />
          <GridColumn
            field="indt"
            title="구입일"
            cell={DateCell}
            width="120px"
          />
          <GridColumn
            field="fxpurcost"
            title="금액"
            width="100px"
            cell={NumberCell}
          />
          <GridColumn field="fxdepyrmm" title="내용연수" width="120px" />
          <GridColumn
            field="curdamt6"
            title={dates6}
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="curdamt5"
            title={dates5}
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="curdamt4"
            title={dates4}
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="curdamt3"
            title={dates3}
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="curdamt2"
            title={dates2}
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="curdamt1"
            title={dates}
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="totamt"
            title="합계"
            width="100px"
            cell={NumberCell}
          />
          <GridColumn
            field="chamt"
            title="잔존가액"
            width="100px"
            cell={NumberCell}
          />
        </Grid>
      </GridContainer>
      <LandscapePrint>
        <GridContainer
          style={{
            height: isMobile ? mobileheight : webheight,
            overflow: "auto",
            border: "solid 1px #e6e6e6",
            display: isMobile ? "" : "flex",
            alignItems: isMobile ? "" : "center",
          }}
        >
          <div
            id="ItemCostSheet"
            className="printable landscape"
            ref={componentRef}
          >
            <div className="title_container">
              <h1 className="title">전체 감가상각비 계상</h1>
            </div>
            <table className="main_tb">
              <colgroup>
                <col width="5%" />
                <col width="9%" />
                <col width="7%" />
                <col width="7%" />
                <col width="5%" />
                <col width="7%" />
                <col width="7%" />
                <col width="7%" />
                <col width="7%" />
                <col width="7%" />
                <col width="7%" />
                <col width="7%" />
                <col width="7%" />
              </colgroup>
              <tbody>
                <tr>
                  <th>구분</th>
                  <th>품명</th>
                  <th>구입일</th>
                  <th>금액</th>
                  <th>내용연수</th>
                  <th>{dates6}</th>
                  <th>{dates5}</th>
                  <th>{dates4}</th>
                  <th>{dates3}</th>
                  <th>{dates2}</th>
                  <th>{dates}</th>
                  <th>합계</th>
                  <th>잔존가액</th>
                </tr>
                {mainDataResult.data.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="center">{item.fxnum}</td>
                    <td className="center">{item.fxnm}</td>
                    <td className="center">{item.indt}</td>
                    <td className="number">
                      {numberWithCommas(item.fxpurcost)}
                    </td>
                    <td className="center">{item.fxdepyrmm}</td>
                    <td className="number">
                      {numberWithCommas(item.curdamt6)}
                    </td>
                    <td className="number">
                      {numberWithCommas(item.curdamt5)}
                    </td>
                    <td className="number">
                      {numberWithCommas(item.curdamt4)}
                    </td>
                    <td className="number">
                      {numberWithCommas(item.curdamt3)}
                    </td>
                    <td className="number">
                      {numberWithCommas(item.curdamt2)}
                    </td>
                    <td className="number">
                      {numberWithCommas(item.curdamt1)}
                    </td>
                    <td className="number">{numberWithCommas(item.totamt)}</td>
                    <td className="number">{numberWithCommas(item.chamt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GridContainer>
      </LandscapePrint>
    </>
  );
};

export default AC_B3000W;
