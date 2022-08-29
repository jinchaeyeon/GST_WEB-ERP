import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
} from "@progress/kendo-react-grid";

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
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input, RadioGroupChangeEvent } from "@progress/kendo-react-inputs";

import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useApi } from "../hooks/api";
import {
  ordstsState,
  ordtypeState,
  departmentsState,
  usersState,
  doexdivState,
  locationState,
} from "../store/atoms";
import { Iparameters } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/SY_A0010_Window";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  clientWidth,
  commonCodeDefaultValue,
  departmentsQuery,
  doexdivQuery,
  finynRadioButtonData,
  gnvWidth,
  gridMargin,
  itemacntQuery,
  locationQuery,
  ordstsQuery,
  pageSize,
  qtyunitQuery,
  taxdivQuery,
  usersQuery,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";

const numberField = [
  "col_code_length",
  "col_numref1",
  "col_numref2",
  "col_numref3",
  "col_numref4",
  "col_numref5",
];

const Page: React.FC = () => {
  const DATA_ITEM_KEY = "group_code";
  const DETAIL_DATA_ITEM_KEY = "sub_code";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_menu_group", setBizComponentData);

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

      setDetailFilters((prev) => ({
        ...prev,
        group_code: rowData.group_code,
      }));

      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);

  const [workType, setWorkType] = useState("");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  const [locationVal, setLocationVal] = useRecoilState(locationState);
  const ordstsVal = useRecoilValue(ordstsState);
  const ordtypeVal = useRecoilValue(ordtypeState);
  const departmentsVal = useRecoilValue(departmentsState);
  const usersVal = useRecoilValue(usersState);
  const doexdivVal = useRecoilValue(doexdivState);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: RadioGroupChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
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
    pgSize: pageSize,
    group_category: "",
    group_code: "",
    group_name: "",
    memo: "",
    userid: "admin",
    sub_code: "",
    subcode_name: "",
    comment: "",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: pageSize,
    group_code: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_WEB_SY_A0010_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_group_category": filters.group_category,
      "@p_group_code": filters.group_code,
      "@p_group_name": filters.group_name,
      "@p_memo": filters.memo,
      "@p_userid": "admin",
      "@p_sub_code": filters.sub_code,
      "@p_subcode_name": filters.subcode_name,
      "@p_comment": filters.comment,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_WEB_SY_A0010_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_group_category": "",
      "@p_group_code": detailFilters.group_code,
      "@p_group_name": "",
      "@p_memo": "",
      "@p_userid": "",
      "@p_sub_code": "",
      "@p_subcode_name": "",
      "@p_comment": "",
    },
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    orgdiv: "01",
    ordnum: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_WEB_SA_A2000_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_service_id": "",
      "@p_orgdiv": paraDataDeleted.orgdiv,
      "@p_location": "",
      "@p_ordnum": paraDataDeleted.ordnum,
      "@p_poregnum": "",
      "@p_project": "",
      "@p_ordtype": "",
      "@p_ordsts": "",
      "@p_taxdiv": "",
      "@p_orddt": "",
      "@p_dlvdt": "",
      "@p_dptcd": "",
      "@p_person": "",
      "@p_amtunit": "",
      "@p_portnm": "",
      "@p_finaldes": "",
      "@p_paymeth": "",
      "@p_prcterms": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_rcvcustcd": "",
      "@p_rcvcustnm": "",
      "@p_wonchgrat": "0",
      "@p_uschgrat": "0",
      "@p_doexdiv": "",
      "@p_remark": "",
      "@p_attdatnum": "",
      "@p_userid": "",
      "@p_pc": "",
      "@p_ship_method": "",
      "@p_dlv_method": "",
      "@p_hullno": "",
      "@p_rowstatus_s": "",
      "@p_chk_s": "",
      "@p_ordseq_s": "",
      "@p_poregseq_s": "",
      "@p_itemcd_s": "",
      "@p_itemnm_s": "",
      "@p_itemacnt_s": "",
      "@p_insiz_s": "",
      "@p_bnatur_s": "",
      "@p_qty_s": "",
      "@p_qtyunit_s": "",
      "@p_totwgt_s": "",
      "@p_wgtunit_s": "",
      "@p_len_s": "",
      "@p_totlen_s": "",
      "@p_lenunit_s": "",
      "@p_thickness_s": "",
      "@p_width_s": "",
      "@p_length_s": "",
      "@p_unpcalmeth_s": "",
      "@p_unp_s": "",
      "@p_amt_s": "",
      "@p_taxamt_s": "",
      "@p_dlramt_s": "",
      "@p_wonamt_s": "",
      "@p_remark_s": "",
      "@p_pac_s": "",
      "@p_finyn_s": "",
      "@p_specialunp_s": "",
      "@p_lotnum_s": "",
      "@p_dlvdt_s": "",
      "@p_specialamt_s": "",
      "@p_heatno_s": "",
      "@p_bf_qty_s": "",
      "@p_form_id": "",
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

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
  };

  const fetchDetailGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetailDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
  };

  useEffect(() => {
    if (customOptionData !== null) {
      setLocationVal({ sub_code: "01", code_name: "본사" });
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    resetDetailGrid();
    fetchDetailGrid();
  }, [detailFilters]);

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

        setDetailFilters((prev) => ({
          ...prev,
          group_code: firstRowData.group_code,
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [customOptionData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const resetDetailGrid = () => {
    setDetailPgNum(1);
    setDetailDataResult(process([], detailDataState));
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

    setDetailFilters((prev) => ({
      ...prev,
      group_code: selectedRowData.group_code,
    }));
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
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };

  const onDetailScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };
  const calculateWidth = (field: any) => {
    let maxWidth = 0;
    mainDataResult.data.forEach((item) => {
      const size = calculateSize(item[field], {
        font: "Source Sans Pro",
        fontSize: "16px",
      }); // pass the font properties based on the application
      if (size.width > maxWidth) {
        maxWidth = size.width;
      }
    });

    return maxWidth;
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    //alert(detailDataResult.total);
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  const onAddClick = () => {
    setIsCopy(false);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onCopyClick = () => {
    const ordnum = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item.ordnum === ordnum
    );

    setDetailFilters((prev) => ({
      ...prev,
      group_code: selectedRowData.group_code,
    }));

    setIsCopy(true);
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const onDeleteClick = (e: any) => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const ordnum = Object.getOwnPropertyNames(selectedState)[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      ordnum: ordnum,
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.result.isSuccess === true) {
      alert("삭제가 완료되었습니다.");

      resetAllGrid();
      fetchMainGrid();
    } else {
      alert(
        "[" +
          data.result.statusCode +
          "] 처리 중 오류가 발생하였습니다. " +
          data.result.resultMessage
      );
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.ordnum = "";
    paraDataDeleted.orgdiv = "01";
  };

  const reloadData = (workType: string) => {
    //수정한 경우 행선택 유지, 신규건은 첫번째 행 선택
    if (workType === "U") {
      setIfSelectFirstRow(false);
    } else {
      setIfSelectFirstRow(true);
    }

    resetAllGrid();
    fetchMainGrid();
    fetchDetailGrid();
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
  const getCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const getItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서)
  const [ordstsListData, setOrdstsListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [doexdivListData, setDoexdivListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [taxdivListData, setTaxdivListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [locationListData, setLocationListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [usersListData, setUsersListData] = useState([commonCodeDefaultValue]);

  const [departmentsListData, setDepartmentsListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    commonCodeDefaultValue,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    commonCodeDefaultValue,
  ]);

  UseCommonQuery(ordstsQuery, setOrdstsListData);
  UseCommonQuery(doexdivQuery, setDoexdivListData);
  UseCommonQuery(taxdivQuery, setTaxdivListData);
  UseCommonQuery(locationQuery, setLocationListData);
  UseCommonQuery(usersQuery, setUsersListData);
  UseCommonQuery(departmentsQuery, setDepartmentsListData);
  UseCommonQuery(itemacntQuery, setItemacntListData);
  UseCommonQuery(qtyunitQuery, setQtyunitListData);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  useEffect(() => {
    // setMainDataResult((prev) => {
    //   const rows = prev.data.map((row: any) => ({
    //     ...row,
    //     ordsts: ordstsListData.find((item: any) => item.sub_code === row.ordsts)
    //       ?.code_name,
    //   }));
    //   return {
    //     data: [...prev.data, ...rows],
    //     total: prev.total,
    //   };
    // });
  }, [ordstsListData]);

  return (
    <>
      <TitleContainer>
        <Title>공통코드정보</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>유형분류</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="group_category"
                    value={filters.group_category}
                    bizComponentId="L_menu_group"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField={"name"}
                  />
                )}
              </td>

              <th>그룹코드</th>
              <td>
                <Input
                  name="group_code"
                  type="text"
                  value={filters.group_code}
                  onChange={filterInputChange}
                />
              </td>
              <th>그룹코드명</th>
              <td>
                <Input
                  name="group_name"
                  type="text"
                  value={filters.group_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>코멘트</th>
              <td>
                <Input
                  name="comment"
                  type="text"
                  value={filters.comment}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>세부코드</th>
              <td>
                <Input
                  name="sub_code"
                  type="text"
                  value={filters.sub_code}
                  onChange={filterInputChange}
                />
              </td>
              <th>세부코드명</th>
              <td>
                <Input
                  name="subcode_name"
                  type="text"
                  value={filters.subcode_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>메모</th>
              <td>
                <Input
                  name="memo"
                  type="text"
                  value={filters.memo}
                  onChange={filterInputChange}
                />
              </td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainerWrap>
        <GridContainer width={"500px"}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  생성
                </Button>
                <Button
                  onClick={onCopyClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="copy"
                >
                  복사
                </Button>
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "700px" }}
              data={process(
                mainDataResult.data.map((row) => ({
                  ...row,
                  ordsts: ordstsListData.find(
                    (item: any) => item.sub_code === row.ordsts
                  )?.code_name,
                  doexdiv: doexdivListData.find(
                    (item: any) => item.sub_code === row.doexdiv
                  )?.code_name,
                  taxdiv: taxdivListData.find(
                    (item: any) => item.sub_code === row.taxdiv
                  )?.code_name,
                  location: locationListData.find(
                    (item: any) => item.sub_code === row.location
                  )?.code_name,
                  person: usersListData.find(
                    (item: any) => item.sub_code === row.person
                  )?.code_name,
                  dptcd: departmentsListData.find(
                    (item: any) => item.sub_code === row.dptcd
                  )?.code_name,
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
              <GridColumn cell={CommandCell} width="55px" />

              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["gvwList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.id.replace("col_", "")}
                        title={item.caption}
                        width={item.width}
                        cell={numberField.includes(item.id) ? NumberCell : ""}
                        footerCell={
                          item.sortOrder === 1 ? mainTotalFooterCell : ""
                        }
                      ></GridColumn>
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>

        <GridContainer
          width={clientWidth - gnvWidth - gridMargin - 15 - 500 + "px"}
        >
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "700px" }}
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code === row.itemacnt
                )?.code_name,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.qtyunit
                )?.code_name,
              })),
              detailDataState
            )}
            {...detailDataState}
            onDataStateChange={onDetailDataStateChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detailDataResult.total}
            onScroll={onDetailScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["gvwDetail"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.id.replace("col_", "")}
                      title={item.caption}
                      width={item.width}
                      cell={numberField.includes(item.id) ? NumberCell : ""}
                      footerCell={
                        item.sortOrder === 2 ? detailTotalFooterCell : ""
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          group_code={detailFilters.group_code}
          isCopy={isCopy}
          reloadData={reloadData}
          para={detailParameters}
        />
      )}
    </>
  );
};

export default Page;
