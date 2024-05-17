import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { ICustData, IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import FilterContainer from "../Containers/FilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomersWindow from "./CommonWindows/CustomersWindow";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  const location = UseGetValueFromSessionItem("location");
  const processApi = useApi();
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

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
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        quosts: defaultOption.find((item: any) => item.id == "quosts")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA019_603, L_Requestgb, L_SA001_603, L_SA012_603, L_SA013_603, L_SA014_603, L_SA015_603, L_SA016_603, L_SA017_603, L_SA018_603, L_SA016, L_SA004, L_sysUserMaster_001",
    //견적형태, 견적상태, 담당자
    setBizComponentData
  );

  const [quotypeListData, setQuotypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [quostsListData, setQuostsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [testtypeListData, setTestTypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [requestgbListData, setrequestgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setmaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialgbListData, setmaterialgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [assaygbeListData, setassaygbeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [startschgbListData, setstartschgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [financegbListData, setfinancegbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtgbListData, setamtgbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [addordgbListData, setaddordgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [relationgbListData, setrelationgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const quotypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_SA016")
      );
      const quostsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_SA004")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      const testtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA019_603"
        )
      );
      const requestgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_Requestgb"
        )
      );
      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA001_603"
        )
      );
      const materialgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA012_603"
        )
      );
      const assaygbeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA013_603"
        )
      );
      const startschgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA014_603"
        )
      );
      const financegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA015_603"
        )
      );
      const amtgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA016_603"
        )
      );
      const addordgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA017_603"
        )
      );
      const relationgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA018_603"
        )
      );
      fetchQuery(quotypeQueryStr, setQuotypeListData);
      fetchQuery(quostsQueryStr, setQuostsListData);
      fetchQuery(personQueryStr, setPersonListData);
      fetchQuery(testtypeQueryStr, setTestTypeListData);
      fetchQuery(requestgbQueryStr, setrequestgbListData);
      fetchQuery(materialtypeQueryStr, setmaterialtypeListData);
      fetchQuery(materialgbQueryStr, setmaterialgbListData);
      fetchQuery(assaygbeQueryStr, setassaygbeListData);
      fetchQuery(startschgbQueryStr, setstartschgbListData);
      fetchQuery(financegbQueryStr, setfinancegbListData);
      fetchQuery(amtgbQueryStr, setamtgbListData);
      fetchQuery(addordgbQueryStr, setaddordgbListData);
      fetchQuery(relationgbQueryStr, setrelationgbListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: location,
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    person: "",
    custcd: "",
    custnm: "",
    materialnm: "",
    quosts: "",
    quokey: "",
    find_row_value: "",
    isSearch: true,
    pgNum: 1,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A7000W_Sub1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_person": filters.person,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_materialnm": filters.materialnm,
        "@p_quosts": filters.quosts,
        "@p_quokey": filters.quokey,
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }

    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));

    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(selectedData);
    onClose();
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = event.dataItem;
    selectData(selectedRowData);
  };

  // 부모로 데이터 전달, 창 닫기 (여러 행을 추가하는 경우 Close 제외)
  const onConfirmBtnClick = (props: any) => {
    const selectedRowData = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setData(selectedRowData);
    onClose();
  };

  return (
    <>
      <Window
        title={"시험의뢰(견적)참조 팝업"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TitleContainer style={{ float: "right" }}>
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>PJT NO.</th>
                <td>
                  <Input
                    name="quokey"
                    type="text"
                    value={filters.quokey}
                    onChange={filterInputChange}
                  />
                </td>
                <th>일자조건</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dtgb"
                      value={filters.dtgb}
                      customOptionData={customOptionData}
                      className="required"
                      changeData={filterComboBoxChange}
                      valueField="code"
                      textField="name"
                    />
                  )}
                </td>
                <td colSpan={2}>
                  <CommonDateRangePicker
                    value={{
                      start: filters.frdt,
                      end: filters.todt,
                    }}
                    onChange={(e: { value: { start: any; end: any } }) =>
                      setFilters((prev) => ({
                        ...prev,
                        frdt: e.value.start,
                        todt: e.value.end,
                      }))
                    }
                    className="required"
                  />
                </td>
                <th>영업담당자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="person"
                      value={filters.person}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      valueField="user_id"
                      textField="user_name"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>업체코드</th>
                <td>
                  <Input
                    name="custcd"
                    type="text"
                    value={filters.custcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>업체명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>시험물질명</th>
                <td>
                  <Input
                    name="materialnm"
                    type="text"
                    value={filters.materialnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>견적상태</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="quosts"
                      value={filters.quosts}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
        <GridContainer height="55vh">
          <Grid
            style={{ height: "calc(100% - 20px)" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                quotype: quotypeListData.find(
                  (item: any) => item.sub_code == row.quotype
                )?.code_name,
                quosts: quostsListData.find(
                  (item: any) => item.sub_code == row.quosts
                )?.code_name,
                person: personListData.find(
                  (item: any) => item.user_id == row.person
                )?.user_name,
                testtype: testtypeListData.find(
                  (item: any) => item.sub_code == row.testtype
                )?.code_name,
                requestgb: requestgbListData.find(
                  (item: any) => item.sub_code == row.requestgb
                )?.code_name,
                materialtype: materialtypeListData.find(
                  (item: any) => item.sub_code == row.materialtype
                )?.code_name,
                materialgb: materialgbListData.find(
                  (item: any) => item.sub_code == row.materialgb
                )?.code_name,
                assaygbe: assaygbeListData.find(
                  (item: any) => item.sub_code == row.assaygbe
                )?.code_name,
                startschgb: startschgbListData.find(
                  (item: any) => item.sub_code == row.startschgb
                )?.code_name,
                financegb: financegbListData.find(
                  (item: any) => item.sub_code == row.financegb
                )?.code_name,
                amtgb: amtgbListData.find(
                  (item: any) => item.sub_code == row.amtgb
                )?.code_name,
                addordgb: addordgbListData.find(
                  (item: any) => item.sub_code == row.addordgb
                )?.code_name,
                relationgb: relationgbListData.find(
                  (item: any) => item.sub_code == row.relationgb
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            onRowDoubleClick={onRowDoubleClick}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="quokey"
              title="PJT NO."
              width="150px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="quotype" title="견적형태" width="120px" />
            <GridColumn field="quosts" title="견적상태" width="100px" />
            <GridColumn
              field="quodt"
              title="견적일자"
              width="100px"
              cell={DateCell}
            />
            <GridColumn field="person" title="영업담당자" width="100px" />
            <GridColumn field="custnm" title="업체명" width="150px" />
            <GridColumn field="custprsnnm" title="의뢰자명" width="120px" />
            <GridColumn field="postnm" title="직위/직책" width="120px" />
            <GridColumn field="dptnm" title="부서명" width="120px" />
            <GridColumn field="address" title="주소" width="120px" />
            <GridColumn field="telno" title="전화번호" width="120px" />
            <GridColumn field="phoneno" title="휴대폰" width="120px" />
            <GridColumn field="email" title="메일" width="120px" />
            <GridColumn field="testtype" title="시험분야" width="120px" />
            <GridColumn field="requestgb" title="의뢰목적" width="120px" />
            <GridColumn field="materialtype" title="물질분야" width="120px" />
            <GridColumn field="materialgb" title="물질확보여부" width="120px" />
            <GridColumn
              field="grade1"
              title="물질확보여부점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn
              field="assaygbe"
              title="분석법 보유여부"
              width="120px"
            />
            <GridColumn
              field="grade2"
              title="분석법 보유여부점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn field="startschgb" title="시작예정" width="120px" />
            <GridColumn
              field="grade3"
              title="시작예정점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn field="financegb" title="재무/투자현황" width="120px" />
            <GridColumn
              field="grade4"
              title="재무/투자현황점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn field="amtgb" title="금액" width="120px" />
            <GridColumn
              field="grade5"
              title="금액점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn field="addordgb" title="추가수주" width="120px" />
            <GridColumn
              field="grade6"
              title="추가수주점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn
              field="relationgb"
              title="BTT관계사 확장"
              width="120px"
            />
            <GridColumn
              field="grade7"
              title="BTT관계사 확장점수"
              cell={NumberCell}
              width="100px"
            />
            <GridColumn field="materialnm" title="시험물질명" width="150px" />
            <GridColumn
              field="materialindt"
              title="물질입고예상일"
              width="100px"
              cell={DateCell}
            />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
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
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
        />
      )}
    </>
  );
};

export default CopyWindow;
