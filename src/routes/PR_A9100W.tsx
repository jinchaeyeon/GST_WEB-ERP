import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
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
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import TopButtons from "../components/Buttons/TopButtons";
import { gridList } from "../store/columns/PR_A9100W_C";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import ItemsMultiWindow from "../components/Windows/CommonWindows/ItemsMultiWindow";
import { IItemData } from "../hooks/interfaces";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import YearCalendar from "../components/Calendars/YearCalendar";
import NumberCell from "../components/Cells/NumberCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, sessionItemState } from "../store/atoms";
import { bytesToBase64 } from "byte-base64";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "idx";
let deletedRows: any[] = [];

const requiredField = ["itemcd", "lotnum", "qty"];
const numberField = ["qty", "totwgt"];
const readOnlyField = [
  "item_btn",
  "itemnm",
  "itemlvl1",
  "itemlvl2",
  "itemlvl3",
  "insiz",
  "bnatur",
  "itemacnt",
  "invunit",
  "wgtunit",
  "insert_time",
];
const comboBoxField = [
  "proccd",
  "itemlvl1",
  "itemlvl2",
  "itemlvl3",
  "itemacnt",
  "invunit",
  "wgtunit",
];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 공정,대분류,중분류,소분류,품목계정,단위,중량단위
  UseBizComponent(
    "L_PR010,L_BA171,L_BA172,L_BA173,L_BA061,L_BA015,L_BA017",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "proccd"
      ? "L_PR010"
      : field === "itemlvl1"
      ? "L_BA171"
      : field === "itemlvl2"
      ? "L_BA172"
      : field === "itemlvl3"
      ? "L_BA173"
      : field === "itemacnt"
      ? "L_BA061"
      : field === "invunit"
      ? "L_BA015"
      : field === "wgtunit"
      ? "L_BA017"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

const PR_A9100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
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
        ymdYyymm: setDefaultDate(customOptionData, "ymdYyymm"),
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA061,L_PR010", setBizComponentData);

  const [sessionItem] = useRecoilState(sessionItemState);

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
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [itemMultiWindowVisible, setItemMultiWindowVisible] =
    useState<boolean>(false);

  const onItemWndClick = () => {
    setEditIndex(undefined);
    setItemWindowVisible(true);
  };

  const onItemMultiWndClick = () => {
    setEditIndex(undefined);
    setItemMultiWindowVisible(true);
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    if (editIndex === undefined) {
      // 조회조건 세팅
      setFilters((prev) => ({
        ...prev,
        itemcd: data.itemcd,
        itemnm: data.itemnm,
      }));
    } else {
      // 그리드 행 세팅
      setMainDataResult((prev) => {
        const newData = prev.data.map((item, idx) =>
          idx === editIndex
            ? {
                ...item,
                rowstatus: item.rowstatus === "N" ? item.rowstatus : "U",
                itemcd: data.itemcd,
                itemnm: data.itemnm,
                itemlvl1: data.itemlvl1,
                itemlvl2: data.itemlvl2,
                itemlvl3: data.itemlvl3,
                insiz: data.insiz,
                bnatur: data.bnatur,
                invunit: data.invunit,
                wgtunit: data.wgtunit,
                itemacnt: data.itemacnt,
              }
            : item
        );

        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const addItemData = (data: IItemData[]) => {
    const newData = data.map((item, idx) => ({
      ...item,
      idx: mainDataResult.data.length + idx + 1,
      rowstatus: "N",
      qty: 0,
      totwgt: 0,
    }));

    setMainDataResult((prev) => {
      return {
        data: [...newData, ...prev.data],
        total: prev.total + data.length,
      };
    });
  };

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    cboOrgdiv: "",
    ymdYyymm: new Date(),
    itemcd: "",
    itemnm: "",
    cboItemacnt: "",
    cboProccd: "",
    lotnum: "",
    cboLocation: "",
    insiz: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A9100W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": sessionItem.find(
        (sessionItem) => sessionItem.code === "orgdiv"
      )?.value,
      "@p_yyyymm": convertDateToStr(filters.ymdYyymm),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_itemacnt": filters.cboItemacnt,
      "@p_proccd": filters.cboProccd,
      "@p_lotnum": filters.lotnum,
      "@p_location": filters.cboLocation,
      "@p_insiz": filters.insiz,
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
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (bizComponentData !== null && customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

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
    if (isInitSearch === false && permissions !== null) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });

    let index = 0;
    mainDataResult.data.forEach((item, idx) => {
      if (item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]) {
        index = idx;
      }
    });

    setEditIndex(index);
    if (field) setEditedField(field);
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });

    mainDataResult.data.forEach((item, index) => {
      if (editedField === "itemcd" && editIndex === index) {
        const queryStr = getItemQuery({ itemcd: item.itemcd, itemnm: "" });

        fetchItemData(queryStr);
        return false;
      }
    });
  };

  const fetchItemData = async (queryStr: string) => {
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
      const rowCount = data.tables[0].RowCount;

      if (rowCount > 0) {
        setItemData(rows[0]);
      }
    }
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const onAddClick = () => {
    let seq = mainDataResult.total + deletedRows.length + 1;

    const idx: number =
      Number(Object.getOwnPropertyNames(selectedState)[0]) ??
      //Number(planDataResult.data[0].idx) ??
      null;
    if (idx === null) return false;
    const selectedRowData = mainDataResult.data.find(
      (item) => item.idx === idx
    );

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      rowstatus: "N",
      qty: 0,
      totwgt: 0,
    };
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveClick = () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        deletedRows.push(item);
      }
    });

    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    //선택 상태 초기화
    setSelectedState({});
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0 && deletedRows.length === 0) return false;

    //검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        if (!item.itemcd) {
          throw findMessage(messagesData, "PR_A9100W_001");
        }

        if (!item.lotnum) {
          throw findMessage(messagesData, "PR_A9100W_002");
        }

        if (!item.qty) {
          throw findMessage(messagesData, "PR_A9100W_003");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    type TRowsArr = {
      rowstatus_s: string[];
      yyyymm_s: string[];
      itemcd_s: string[];
      proccd_s: string[];
      lotnum_s: string[];
      location_s: string[];
      qty_s: string[];
      totwgt_s: string[];
      pgmdiv_s: string[];
    };

    let rowsArr: TRowsArr = {
      rowstatus_s: [],
      yyyymm_s: [],
      itemcd_s: [],
      proccd_s: [],
      lotnum_s: [],
      location_s: [],
      qty_s: [],
      totwgt_s: [],
      pgmdiv_s: [],
    };

    const yyyymm = convertDateToStr(new Date()).slice(0, 4) + "00";
    const location = sessionItem.find(
      (sessionItem) => sessionItem.code === "location"
    )!.value;

    dataItem.forEach((item: any) => {
      const { rowstatus, itemcd, proccd, lotnum, qty, totwgt, pgmdiv } = item;

      rowsArr.rowstatus_s.push(rowstatus);
      rowsArr.yyyymm_s.push(yyyymm);
      rowsArr.itemcd_s.push(itemcd);
      rowsArr.proccd_s.push(proccd); // getCodeFromValue
      rowsArr.lotnum_s.push(lotnum);
      rowsArr.location_s.push(location);
      rowsArr.qty_s.push(qty);
      rowsArr.totwgt_s.push(totwgt);
      rowsArr.pgmdiv_s.push(pgmdiv);
    });

    deletedRows.forEach((item: any) => {
      const { yyyymm, itemcd, proccd, lotnum, qty, totwgt, pgmdiv } = item;

      rowsArr.rowstatus_s.push("D");
      rowsArr.yyyymm_s.push(yyyymm);
      rowsArr.itemcd_s.push(itemcd);
      rowsArr.proccd_s.push(proccd); // getCodeFromValue
      rowsArr.lotnum_s.push(lotnum);
      rowsArr.location_s.push(location);
      rowsArr.qty_s.push(qty);
      rowsArr.totwgt_s.push(totwgt);
      rowsArr.pgmdiv_s.push(pgmdiv);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "U",
      rowstatus_s: rowsArr.rowstatus_s.join("|"),
      yyyymm_s: rowsArr.yyyymm_s.join("|"),
      itemcd_s: rowsArr.itemcd_s.join("|"),
      proccd_s: rowsArr.proccd_s.join("|"),
      lotnum_s: rowsArr.lotnum_s.join("|"),
      location_s: rowsArr.location_s.join("|"),
      qty_s: rowsArr.qty_s.join("|"),
      totwgt_s: rowsArr.totwgt_s.join("|"),
      pgmdiv_s: rowsArr.pgmdiv_s.join("|"),
    }));
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      deletedRows = []; //초기화
      search();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const userId = UseGetValueFromSessionItem("user_id");

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    rowstatus_s: "",
    orgdiv: sessionItem.find((sessionItem) => sessionItem.code === "orgdiv")
      ?.value,
    yyyymm_s: "",
    itemcd_s: "",
    proccd_s: "",
    lotnum_s: "",
    location_s: "",
    qty_s: "",
    totwgt_s: "",
    pgmdiv_s: "",
    userid: userId,
    pc: pc,
    form_id: pathname,
  });

  const paraSaved: Iparameters = {
    procedureName: "P_PR_A9100W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_orgdiv": paraData.orgdiv,
      "@p_yyyymm_s": paraData.yyyymm_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_location_s": paraData.location_s,
      "@p_qty_s": paraData.qty_s,
      "@p_totwgt_s": paraData.totwgt_s,
      "@p_pgmdiv_s": paraData.pgmdiv_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [editedRowData, setEditedRowData] = useState<any>({});

  const ItemBtnCell = (props: GridCellProps) => {
    const { dataIndex } = props;

    const onRowItemWndClick = () => {
      setEditIndex(dataIndex);
      setEditedRowData(props.dataItem);
      setItemWindowVisible(true);
    };

    return (
      <td className="k-command-cell required">
        <Button
          type={"button"}
          className="k-grid-save-command"
          onClick={onRowItemWndClick}
          icon="more-horizontal"
          //disabled={isInEdit ? false : true}
        />
      </td>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>재공품기초재고등록</Title>

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
              <th>연월</th>
              <td>
                <DatePicker
                  name="ymdYyymm"
                  value={filters.ymdYyymm}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                  placeholder=""
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
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
            </tr>
            <tr>
              <th>공정</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboProccd"
                    value={filters.cboProccd}
                    bizComponentId="L_PR010"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>품목계정</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboItemacnt"
                    value={filters.cboItemacnt}
                    bizComponentId="L_BA061"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
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
            <GridTitle>기본정보</GridTitle>

            {permissions && (
              <ButtonContainer>
                <Button
                  onClick={onItemMultiWndClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                >
                  품목참조
                </Button>
                <Button
                  onClick={onAddClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                  disabled={permissions.save ? false : true}
                ></Button>
                <Button
                  onClick={onRemoveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제" 
                  disabled={permissions.save ? false : true}
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                  disabled={permissions.save ? false : true}
                ></Button>
              </ButtonContainer>
            )}
          </GridTitleContainer>
          <Grid
            style={{ height: "80vh" }}
            data={process(
              mainDataResult.data.map((row, idx) => ({
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
            //incell 수정 기능
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="rowstatus"
              title=" "
              width="40px"
              editable={false}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      headerCell={
                        requiredField.includes(item.fieldName)
                          ? RequiredHeader
                          : undefined
                      }
                      field={item.fieldName}
                      title={item.caption === "" ? " " : item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : comboBoxField.includes(item.fieldName)
                          ? CustomComboBoxCell
                          : item.fieldName === "item_btn"
                          ? ItemBtnCell
                          : undefined
                      }
                      editable={
                        readOnlyField.includes(item.fieldName) ? false : true
                      }
                      className={
                        readOnlyField.includes(item.fieldName)
                          ? "read-only"
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>

      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={editIndex === undefined ? "FILTER" : "ROW_ADD"}
          setData={setItemData}
        />
      )}

      {itemMultiWindowVisible && (
        <ItemsMultiWindow
          setVisible={setItemMultiWindowVisible}
          setData={addItemData}
        />
      )}

      {/* 컨트롤 네임 불러오기 용 */}
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
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

export default PR_A9100W;
