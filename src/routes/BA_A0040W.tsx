import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
} from "@progress/kendo-react-grid";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import calculateSize from "calculate-size";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/SA_A2000W_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";

const DATA_ITEM_KEY = "itemcd";
const SUB_DATA_ITEM_KEY2 = "itemcd";

const BA_A0040: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY2);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        useyn: defaultOption.find((item: any) => item.id === "useyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_SA002,L_BA005,L_BA029,L_BA002,L_sysUserMaster_001,L_dptcd_001,L_BA061,L_BA015,L_finyn",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [ordstsListData, setOrdstsListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [departmentsListData, setDepartmentsListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const ordstsQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SA002")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA029")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const departmentQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const finynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_finyn")
      );

      fetchQuery(ordstsQueryStr, setOrdstsListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(departmentQueryStr, setDepartmentsListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(finynQueryStr, setFinynListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subData2State, setSubData2State] = useState<State>({
    sort: [],
  });

  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subData2Result, setSubData2Result] = useState<DataResult>(
    process([], subData2State)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubData2State, setSelectedsubData2State] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSub2PgNum] = useState(1);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    useyn: "Y",
    custcd: "",
    custnm: "",
    itemcd_s: "",
    spec: "",
    location: "01",
    remark: "",
    bnatur: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0040W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": filters.itemacnt,
      "@p_useyn": filters.useyn,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd_s": filters.itemcd_s,
      "@p_spec": filters.spec,
      // "@p_location": filters.location,
      "@p_remark": filters.remark,
      // "@p_bnatur":filters.bnatur,
      // "@p_itemlvl1": filters.itemlvl1,
      // "@p_itemlvl2": filters.itemlvl2,
      // "@p_itemlvl3": filters.itemlvl3,
      "@p_find_row_value": mainPgNum,
    },
  };

  const subParameter: Iparameters = {
    procedureName: "P_BA_A0040W_Q",
    pageNumber: subPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": filters.itemacnt,
      "@p_useyn": filters.useyn,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd_s": filters.itemcd_s,
      "@p_spec": filters.spec,
      // "@p_location": filters.location,
      "@p_remark": filters.remark,
      // "@p_bnatur":filters.bnatur,
      // "@p_itemlvl1": filters.itemlvl1,
      // "@p_itemlvl2": filters.itemlvl2,
      // "@p_itemlvl3": filters.itemlvl3,
      "@p_find_row_value": mainPgNum,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      console.log(rows);
      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.ordnum]: true });

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setSelectedState(newSelectedState);
    if (tabSelected === 1) {
      //   fetchGrid("MCHART", selectedRowData.custcd);
    } else if (tabSelected === 2) {
      //   fetchGrid("QCHART", selectedRowData.custcd);
    }
  };

  const onSubData2SelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    setSelectedsubData2State(newSelectedState);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  const onSub2ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSub2PgNum((prev) => prev + 1);
  };


  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubData2StateChange = (event: GridDataStateChangeEvent) => {
    setSubData2State(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  useEffect(() => {
    // search();
  }, [tabSelected]);

  const handleSelectTab = (e: any) => {
    // onRefreshClick();
    setTabSelected(e.selected);
    // resetGrid();
  };

  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubData2SortChange = (e: any) => {
    setSubData2State((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };
  return (
    <>
      <TitleContainer>
        <Title>품목관리</Title>

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
      <FilterBoxWrap>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목계정</th>
              <td>
                <Input
                  name="itenacnt"
                  type="text"
                  value={filters.itemacnt}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="useyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>사양</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
                />
              </td>
              <th>비고</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
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
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "40vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                // ordsts: ordstsListData.find(
                //   (item: any) => item.sub_code === row.ordsts
                // )?.code_name,
                // doexdiv: doexdivListData.find(
                //   (item: any) => item.sub_code === row.doexdiv
                // )?.code_name,
                // taxdiv: taxdivListData.find(
                //   (item: any) => item.sub_code === row.taxdiv
                // )?.code_name,
                // location: locationListData.find(
                //   (item: any) => item.sub_code === row.location
                // )?.code_name,
                // person: usersListData.find(
                //   (item: any) => item.user_id === row.person
                // )?.user_name,
                // dptcd: departmentsListData.find(
                //   (item: any) => item.dptcd === row.dptcd
                // )?.dptnm,
                // finyn: finynListData.find(
                //   (item: any) => item.code === row.finyn
                // )?.name,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
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
            onSelectionChange={onSelectionChange}
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
              field="itemnm"
              title="품목명"
              footerCell={mainTotalFooterCell}
              width="140px"
            />
            <GridColumn field="itemcd" title="품목코드" width="200px" />
            <GridColumn field="spec" title="사양" width="140px" />
            <GridColumn field="insiz" title="규격" width="160px" />
            <GridColumn field="itemacnt" title="품목계정" width="140px" />
            <GridColumn field="invunit" title="수량단위" width="100px" />
            <GridColumn
              field="useyn"
              title="사용여부"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn
              field="safeqty"
              title="안전재고량"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn
              field="purleadtime"
              title="구매리드타임"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn field="cnt" title="첨부" width="140px" />
            <GridColumn field="custnm" title="업체명" width="160px" />
            <GridColumn field="remark" title="비고" width="250px" />
            <GridColumn field="bnatur" title="재질" width="140px" />
          </Grid>
        </ExcelExport>
      </GridContainer>
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="상세정보"></TabStripTab>
        <TabStripTab title="단가">
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>단가정보</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "40vh" }}
              data={process(
                subData2Result.data.map((row) => ({
                  ...row,
                  // ordsts: ordstsListData.find(
                  //   (item: any) => item.sub_code === row.ordsts
                  // )?.code_name,
                  // doexdiv: doexdivListData.find(
                  //   (item: any) => item.sub_code === row.doexdiv
                  // )?.code_name,
                  // taxdiv: taxdivListData.find(
                  //   (item: any) => item.sub_code === row.taxdiv
                  // )?.code_name,
                  // location: locationListData.find(
                  //   (item: any) => item.sub_code === row.location
                  // )?.code_name,
                  // person: usersListData.find(
                  //   (item: any) => item.user_id === row.person
                  // )?.user_name,
                  // dptcd: departmentsListData.find(
                  //   (item: any) => item.dptcd === row.dptcd
                  // )?.dptnm,
                  // finyn: finynListData.find(
                  //   (item: any) => item.code === row.finyn
                  // )?.name,
                  [SELECTED_FIELD]: selectedsubData2State[idGetter2(row)],
                })),
                subData2State
              )}
              {...subData2State}
              onDataStateChange={onSubData2StateChange}
              //선택 기능
              dataItemKey={SUB_DATA_ITEM_KEY2}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onSubData2SelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={subData2Result.total}
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onSubData2SortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn field="recdt" title="적용일" width="140px" />
              <GridColumn field="unpitem" title="단가항목" width="250px" />
              <GridColumn field="amtunit" title="화폐단위" width="140px" />
              <GridColumn field="itemacnt" title="품목계정" width="140px" />
              <GridColumn field="unp" title="단가" width="250px" />
              <GridColumn field="remark" title="비고" width="250px" />
            </Grid>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default BA_A0040;
