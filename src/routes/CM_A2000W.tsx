import React, { useCallback, useEffect, useState, useRef } from "react";
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
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import DetailWindow from "../components/Windows/CM_A2000W_Window";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
} from "../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseGetValueFromSessionItem,
  useSysMessage,
  UseParaPc,
} from "../components/CommonFunction";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading, deletedAttadatnumsState } from "../store/atoms";
import { gridList } from "../store/columns/CM_A2000W_C";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import { Button } from "@progress/kendo-react-buttons";

const dateField = ["recdt", "reqdt", "finexpdt", "findt"];
const DATA_ITEM_KEY = "num";
const checkField = ["chooses", "loadok"];
const numberField = ["readok", "commcnt"];

const CM_A2000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
    // 삭제할 첨부파일 리스트를 담는 함수
    const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [detailWindowVisible, setDetailWindowVisible] =
  useState<boolean>(false);

  const [reload, setreload] = useState<boolean>(false);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        person: defaultOption.find((item: any) => item.id === "person")
        .valueCode,
        rcvperson: defaultOption.find((item: any) => item.id === "rcvperson")
        .valueCode,
        endyn: defaultOption.find((item: any) => item.id === "endyn")
        .valueCode,
        loadyn: defaultOption.find((item: any) => item.id === "loadyn")
        .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001",
    //사용자
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(userQueryStr, setUserListData);
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [workType, setWorkType] = useState<"N" | "U">("N");

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    person: "",
    rcvperson: "",
    endyn: "%",
    title: "",
    loadyn: "%",
    datnum: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_A2000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_person": filters.person,
      "@p_rcvperson": filters.rcvperson,
      "@p_endyn": filters.endyn,
      "@p_title": filters.title,
      "@p_loadyn": filters.loadyn,
      "@p_datnum": filters.datnum,
      "@p_userid": userId,
      "@p_find_row_value": filters.find_row_value
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
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

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  let gridRef: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.vs.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.vs.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.num]: true });

      // setWorkType("U");
      
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

  const setCopyData = (data: any, filter: any, deletedMainRows: any) => {
    let valid = true;

    const dataItem = data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    // setParaData((prev) => ({
    //   ...prev,
    //   workType: workType,
    //   reqnum: filter.reqnum,
    //   reqrev: filter.reqrev,
    //   custcd: filter.custcd,
    //   custnm: filter.custnm,
    //   modiv: filter.modiv == undefined ? "" : filter.modiv,
    //   dptcd: filter.dptcd,
    //   person: filter.person,
    //   recdt: filter.recdt,
    //   finaldes: filter.finaldes == undefined ? "" : filter.finaldes,
    //   qcmeth: filter.qcmeth == undefined ? "" : filter.qcmeth,
    //   boxmeth: filter.boxmeth == undefined ? "" : filter.boxmeth,
    //   dlv_method:filter.dlv_method == undefined ? "" : filter.dlv_method,
    //   reportyn: filter.reportyn == undefined ? "" : filter.reportyn,
    //   contractyn: filter.contractyn == undefined ? "" : filter.contractyn,
    //   attdatnum: filter.attdatnum,
    //   remark: filter.remark,
    //   project: filter.project,
    //   poregnum: filter.poregnum,
    // }));
    // if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

    // let dataArr: TdataArr = {
    //   rowstatus_s: [],
    //   reqseq_s: [],
    //   inexpdt_s: [],
    //   itemcd_s: [],
    //   itemnm_s: [],
    //   qty_s: [],
    //   qtyunit_s: [],
    //   remark_s: [],
    //   finyn_s: [],
    //   unp_s: [],
    //   amt_s: [],
    //   wonamt_s: [],
    //   taxamt_s: [],
    //   load_place_s: [],
    //   unpcalmeth_s: [],
    // };

    // dataItem.forEach((item: any, idx: number) => {
    //   const {
    //     rowstatus = "",
    //     reqseq= "", 
    //     inexpdt= "", 
    //     itemcd= "", 
    //     itemnm= "",
    //     qty= "",
    //     qtyunit= "", 
    //     remark= "",
    //     finyn= "", 
    //     unp= "",
    //     amt= "",
    //     wonamt= "",
    //     taxamt= "",
    //     load_place= "",
    //     unpcalmeth= "", 
    //   } = item;
  
    //   dataArr.rowstatus_s.push(rowstatus);
    //   dataArr.reqseq_s.push(reqseq == undefined || reqseq == "" ? 0 : reqseq);
    //   dataArr.inexpdt_s.push((inexpdt == undefined || inexpdt == "") ? convertDateToStr(new Date()) : inexpdt);
    //   dataArr.itemcd_s.push(itemcd== undefined ? "" : itemcd);
    //   dataArr.itemnm_s.push(itemnm== undefined ? "" : itemnm);
    //   dataArr.qty_s.push(qty == undefined ? 0 : qty);
    //   dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
    //   dataArr.remark_s.push(remark == undefined ? "" : remark);
    //   dataArr.finyn_s.push(finyn == undefined ? "N" : finyn);
    //   dataArr.unp_s.push(unp == undefined ? 0 : unp);
    //   dataArr.amt_s.push(amt == undefined ? 0 : amt);
    //   dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
    //   dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
    //   dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
    //   dataArr.unpcalmeth_s.push(unpcalmeth == undefined ? "" : unpcalmeth);
    // });
    // deletedMainRows.forEach((item: any, idx: number) => {
    //   const {
    //     rowstatus = "",
    //     reqseq= "",
    //     inexpdt= "",
    //     itemcd= "",
    //     itemnm= "",
    //     qty= "",
    //     qtyunit= "",
    //     remark= "",
    //     finyn= "",
    //     unp= "",
    //     amt= "",
    //     wonamt= "",
    //     taxamt= "",
    //     load_place= "",
    //     unpcalmeth= "",
    //   } = item;
    //   dataArr.rowstatus_s.push(rowstatus);
    //   dataArr.reqseq_s.push(reqseq == undefined || reqseq == "" ? 0 : reqseq);
    //   dataArr.inexpdt_s.push(inexpdt == undefined ? "" : inexpdt);
    //   dataArr.itemcd_s.push(itemcd== undefined ? "" : itemcd);
    //   dataArr.itemnm_s.push(itemnm== undefined ? "" : itemnm);
    //   dataArr.qty_s.push(qty == undefined ? 0 : qty);
    //   dataArr.qtyunit_s.push(qtyunit == undefined ? "" : qtyunit);
    //   dataArr.remark_s.push(remark == undefined ? "" : remark);
    //   dataArr.finyn_s.push(finyn == undefined ? "N" : finyn);
    //   dataArr.unp_s.push(unp == undefined ? 0 : unp);
    //   dataArr.amt_s.push(amt == undefined ? 0 : amt);
    //   dataArr.wonamt_s.push(wonamt == "" ? 0 : wonamt);
    //   dataArr.taxamt_s.push(taxamt == "" ? 0 : taxamt);
    //   dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
    //   dataArr.unpcalmeth_s.push(unpcalmeth == undefined ? "" : unpcalmeth);
    // });
    // setParaData((prev) => ({
    //   ...prev,
    //   workType: workType,
    //   rowstatus_s: dataArr.rowstatus_s.join("|"),
    //   reqseq_s: dataArr.reqseq_s.join("|"),
    //   inexpdt_s: dataArr.inexpdt_s.join("|"),
    //   itemcd_s: dataArr.itemcd_s.join("|"),
    //   itemnm_s: dataArr.itemnm_s.join("|"),
    //   qty_s: dataArr.qty_s.join("|"),
    //   qtyunit_s: dataArr.qtyunit_s.join("|"),
    //   remark_s: dataArr.remark_s.join("|"),
    //   finyn_s: dataArr.finyn_s.join("|"),
    //   unp_s: dataArr.unp_s.join("|"),
    //   amt_s: dataArr.amt_s.join("|"),
    //   wonamt_s: dataArr.wonamt_s.join("|"),
    //   taxamt_s: dataArr.taxamt_s.join("|"),
    //   load_place_s: dataArr.load_place_s.join("|"),
    //   unpcalmeth_s: dataArr.unpcalmeth_s.join("|"),
    // }));
  };

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const datas = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      recno: datas.recno,
      attdatnum: datas.attdatnum
    }));
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "D",
    recno: "",
    attdatnum: "",
  });

  
  useEffect(() => {
    if (paraDataDeleted.recno != "") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      // 첨부파일 삭제
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    //초기화
    setParaDataDeleted((prev) => ({
      work_type: "D",
      recno: "",
      attdatnum: ""
    }));
  };

 //삭제 프로시저 파라미터
 const paraDeleted: Iparameters = {
  procedureName: "P_CM_A2000W_S",
  pageNumber: 0,
  pageSize: 0,
  parameters: {
    "@p_work_type": paraDataDeleted.work_type,
    "@p_orgdiv": "01",
    "@p_location": "",
    "@p_recno": paraDataDeleted.recno,
    "@p_recdt": "",
    "@p_person": "",
    "@p_rcvperson": "",
    "@p_endyn": "",
    "@p_custcd": "",
    "@p_title": "",
    "@p_reqctns": "",
    "@p_attdatnum": "",
    "@p_reqdt": "",
    "@p_finexpdt": "",
    "@p_findt": "",
    "@p_person2": "",
    "@p_chooses": "",
    "@p_loadok": "",
    "@p_readok": "",
    "@p_form_id": "CM_A2000W",
    "@p_userid": userId,
    "@p_pc": pc,
  },
};
  return (
    <>
      <TitleContainer>
        <Title>업무지시요청</Title>

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
              <th>일자</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="frdt"
                    value={filters.frdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                  ~
                  <DatePicker
                    name="todt"
                    value={filters.todt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                </div>
              </td>
              <th>작성자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="person"
                    value={filters.person}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>수리자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="rcvperson"
                    value={filters.rcvperson}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>처리여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="endyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>제목</th>
              <td colSpan={7}>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={filterInputChange}
                />
              </td>
              <th>확인</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="loadyn"
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
                업무지시생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                업무지시삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "78vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                chooses: row.chooses == 0 ? false : true,
                loadok: row.loadok == 0 ? false : true,
                rcvperson: userListData.find(
                  (item: any) => item.user_id === row.rcvperson
                )?.user_name,
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
            <GridColumn cell={CommandCell} width="60px" />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                .map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          numberField.includes(item.fieldName)
                            ? NumberCell
                            : dateField.includes(item.fieldName)
                            ? DateCell
                            : checkField.includes(item.fieldName)
                            ? CheckBoxReadOnlyCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell
                            : undefined
                        }
                      ></GridColumn>
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          setData={setCopyData}
          data={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          reload={reload}
        />
      )}
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default CM_A2000W;

