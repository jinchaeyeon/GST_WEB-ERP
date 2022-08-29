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
import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";

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
import DepartmentsDDL from "../components/DropDownLists/DepartmentsDDL";
import DoexdivDDL from "../components/DropDownLists/DoexdivDDL";
import OrdstsDDL from "../components/DropDownLists/OrdstsDDL";
import OrdtypeDDL from "../components/DropDownLists/OrdtypeDDL";
import UsersDDL from "../components/DropDownLists/UsersDDL";
import LocationDDL from "../components/DropDownLists/LocationDDL";
import {
  chkScrollHandler,
  convertDateToStr,
  UseCommonQuery,
} from "../components/CommonFunction";
import DetailWindow from "../components/Windows/SA_B2000_Window";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  commonCodeDefaultValue,
  departmentsQuery,
  doexdivQuery,
  finynRadioButtonData,
  itemacntQuery,
  locationQuery,
  ordstsQuery,
  pageSize,
  qtyunitQuery,
  taxdivQuery,
  usersQuery,
} from "../components/CommonString";

const SA_B2000: React.FC = () => {
  const DATA_ITEM_KEY = "ordnum";
  const DETAIL_DATA_ITEM_KEY = "ordseq";
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

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.ordnum]: true });

      setDetailFilters((prev) => ({
        ...prev,
        location: rowData.location,
        ordnum: rowData.ordnum,
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: 10,
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    frdt: new Date(),
    todt: new Date(),
    finyn: "%",
    poregnum: "",
    ordnum: "",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: 10,
    orgdiv: "01",
    location: "01",
    ordnum: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_WEB_SA_A2000_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "HEADER",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": locationVal.sub_code ? locationVal.sub_code : "01",
      "@p_dtgb": "B",
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_ordnum": filters.ordnum,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_person": usersVal.sub_code,
      "@p_finyn": filters.finyn,
      "@p_dptcd": departmentsVal.sub_code,
      "@p_ordsts": ordstsVal.sub_code,
      "@p_doexdiv": doexdivVal.sub_code,
      "@p_ordtype": ordtypeVal.sub_code,
      "@p_poregnum": filters.poregnum,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_WEB_SA_A2000_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": detailFilters.orgdiv,
      "@p_location": detailFilters.location,
      "@p_dtgb": "",
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ordnum": detailFilters.ordnum,
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_itemcd": "",
      "@p_itemnm": "",
      "@p_person": "",
      "@p_finyn": "",
      "@p_dptcd": "",
      "@p_ordsts": "",
      "@p_doexdiv": "",
      "@p_ordtype": "",
      "@p_poregnum": "",
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
    setLocationVal({ sub_code: "01", code_name: "본사" });
    fetchMainGrid();
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
        setSelectedState({ [firstRowData.ordnum]: true });

        setDetailFilters((prev) => ({
          ...prev,
          location: firstRowData.location,
          ordnum: firstRowData.ordnum,
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

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
      location: selectedRowData.location,
      ordnum: selectedRowData.ordnum,
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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onCopyClick = () => {
    const ordnum = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item.ordnum === ordnum
    );

    setDetailFilters((prev) => ({
      ...prev,
      location: selectedRowData.location,
      ordnum: selectedRowData.ordnum,
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
        <Title>수주처리</Title>

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
              <th>납기일자</th>
              <td colSpan={3} className="item-box">
                <DatePicker
                  name="frdt"
                  defaultValue={filters.frdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
                ~
                <DatePicker
                  name="todt"
                  defaultValue={filters.todt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                />
              </td>

              <th>사업장</th>
              <td>
                <LocationDDL />
              </td>
              <th>부서</th>
              <td>
                <DepartmentsDDL />
              </td>

              <th>담당자</th>
              <td>
                <UsersDDL />
              </td>
            </tr>

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

              <th>수주상태</th>
              <td>
                <OrdstsDDL />
              </td>

              <th>수주형태</th>
              <td>
                <OrdtypeDDL />
              </td>

              <th>내수구분</th>
              <td>
                <DoexdivDDL />
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

              <th>수주번호</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.ordnum}
                  onChange={filterInputChange}
                />
              </td>

              <th>PO번호</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.poregnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>완료여부</th>
              <td>
                <RadioGroup
                  name="finyn"
                  data={finynRadioButtonData}
                  layout={"horizontal"}
                  defaultValue={filters.finyn}
                  onChange={filterRadioChange}
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
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                수주생성
              </Button>
              <Button
                onClick={onCopyClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="copy"
              >
                수주복사
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                수주삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "310px" }}
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
            <GridColumn
              field="orddt"
              title="수주일자"
              cell={DateCell}
              footerCell={mainTotalFooterCell}
              width="100px"
            />
            <GridColumn
              field="dlvdt"
              title="납기일자"
              cell={DateCell}
              width="100px"
              //width={calculateWidth("dlvdt")}
            />
            <GridColumn field="ordnum" title="수주번호" width="120px" />
            <GridColumn field="custnm" title="업체명" width="170px" />
            <GridColumn field="ordsts" title="수주상태" width="100px" />
            <GridColumn field="doexdiv" title="내수구분" width="100px" />
            <GridColumn field="taxdiv" title="과세구분" width="100px" />
            <GridColumn
              field="out_qty"
              title="출하수량"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="sale_qty"
              title="판매수량"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="qty"
              title="수주수량"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="specialamt"
              title="발주금액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="금액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="totamt"
              title="합계금액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn field="location" title="사업장" width="120px" />
            <GridColumn field="dptcd" title="부서" width="120px" />
            <GridColumn field="person" title="담당자" width="120px" />
            <GridColumn field="quokey" title="견적번호" width="120px" />
            <GridColumn field="remark" title="비고" width="120px" />
            <GridColumn field="finyn" title="완료여부" width="120px" />
          </Grid>
        </ExcelExport>
      </GridContainer>

      <GridContainer>
        <GridTitleContainer>
          <GridTitle>상세정보</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "310px" }}
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
          <GridColumn
            field="itemcd"
            title="품목코드"
            width="160px"
            footerCell={detailTotalFooterCell}
          />
          <GridColumn field="itemnm" title="품목명" width="180px" />
          <GridColumn field="insiz" title="규격" width="200px" />
          <GridColumn field="itemacnt" title="품목계정" width="120px" />
          <GridColumn
            field="qty"
            title="수주량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="qtyunit" title="단위" width="120px" />
          <GridColumn
            field="specialunp"
            title="발주단가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="specialamt"
            title="발주금액"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="unp"
            title="단가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="wonamt"
            title="금액"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="taxamt"
            title="세액"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="totamt"
            title="합계금액"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="remark" title="비고" width="120px" />
          <GridColumn field="purcustnm" title="발주처" width="120px" />
          <GridColumn
            field="outqty"
            title="출하수량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="sale_qty"
            title="판매수량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="finyn" title="완료여부" width="120px" />
          <GridColumn field="bf_qty" title="LOT수량" width="120px" />
          <GridColumn field="lotnum" title="LOT NO" width="120px" />
        </Grid>
      </GridContainer>
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          ordnum={detailFilters.ordnum}
          isCopy={isCopy}
          reloadData={reloadData}
          para={detailParameters}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          getVisible={setCustWindowVisible}
          workType={workType}
          getData={getCustData}
          para={undefined}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          getVisible={setItemWindowVisible}
          workType={"FILTER"}
          getData={getItemData}
          para={undefined}
        />
      )}
    </>
  );
};

export default SA_B2000;
