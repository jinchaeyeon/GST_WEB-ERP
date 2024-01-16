import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { createContext, useContext, useEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { ICustData, IWindowPosition } from "../../hooks/interfaces";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  convertDateToStr,
  getGridItemChangedData,
  toDate,
} from "../CommonFunction";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import UserWindow from "../Windows/CommonWindows/PrsnnumWindow";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../../store/atoms";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: string): void;
  pathname: string;
  workType: "N" | "U" | "C";
  para?: any;
  modal?: boolean;
};
const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;

const FormContext = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setCustcd(data.custcd);
    setCustnm(data.custnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onCustWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "dptcd" ? "L_dptcd_001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  const textField = field === "dptcd" ? "dptnm" : "code_name";
  const valueField = field === "dptcd" ? "dptcd" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

const KendoWindow = ({
  setVisible,
  setData,
  para,
  workType,
  pathname,
  modal = false,
}: IKendoWindow) => {
  const idGetter = getter(DATA_ITEM_KEY);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: 900,
  });
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [worktype, setWorkType] = useState<string>(workType);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

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

  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");

  const onClose = () => {
    setVisible(false);
  };

  const search = () => {};

  const [filters, setFilters] = useState({
    expenseseq1: 0,
    expenseno: "",
    location: "01",
    expensedt: new Date(),
    position: "",
    auto_transfer: "",
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    dptnm: "",
    isSearch: true,
    find_row_value: "",
    pgNum: 1,
  });

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

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [name]: value,
            [EDIT_FIELD]: name,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );
    setTempResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  interface IUser {
    user_id: string;
    user_name: string;
    dptcd: string;
    dptnm: string;
  }

  const setUserData = (data: IUser) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        prsnnum: data.user_id,
        prsnnm: data.user_name,
        dptcd: data.dptcd,
        dptnm: data.dptnm,
      };
    });
  };

  const setCustData = (data: ICustData) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            custcd: data.custcd,
            custnm: data.custnm,
          }
        : {
            ...item,
          }
    );
    setTempResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const [userWindowVisible, setUserWindowVisible] = useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onUserWndClick = () => {
    setUserWindowVisible(true);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
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
  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
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

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "totamt" && field != "taxamt" && field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            rcvcustcd: custcd,
            rcvcustnm: custnm,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [custcd, custnm]);

  useEffect(() => {
    if (worktype != "N" && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if ((worktype === "U" || worktype === "C") && para != undefined) {
      setFilters((prev) => ({
        ...prev,
        expenseseq1: para.expenseseq1,
        expenseno: para.expenseno,
        location: para.location,
        expensedt: para.expensedt == "" ? new Date() : toDate(para.expensedt),
        position: para.position,
        auto_transfer: para.auto_transfer,
        prsnnum: para.prsnnum,
        prsnnm: para.prsnnm,
        dptcd: para.dptcd,
        dptnm: para.dptnm,
        isSearch: true,
        find_row_value: "",
        pgNum: 1,
      }));
    }
  }, []);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1020W_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": "01",
        "@p_strdt": "",
        "@p_enddt": "",
        "@p_location": "",
        "@p_prsnnum": "",
        "@p_dptcd": "",
        "@p_expensedt": convertDateToStr(filters.expensedt),
        "@p_expenseseq1": filters.expenseseq1,
        "@p_prsnnm": "",
        "@p_appsts": "",
        "@p_position": "",
        "@p_acntdiv": "",
        "@p_dtgb": "",
        "@p_expensedt_s": "",
        "@p_expenseseq1_s": "",
        "@p_serviceId": companyCode,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (workType == "C") {
        const newData = rows.map((item: any) => ({
          ...item,
          rowstatus: "N",
          attdatnum: "",
        }));
        setWorkType("N");
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters((prev) => ({
      ...prev,
      expenseno: workType == "C" ? "" : prev.expenseno,
      expensedt: workType == "C" ? new Date() : prev.expensedt,
      expenseseq1: workType == "C" ? 0 : prev.expenseseq1,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntcd: "",
      acntnm: "",
      actkey: "",
      amt: 0,
      amtunit: "",
      attdatnum: "",
      auto_transfer: "",
      cardcd: "",
      carddt: convertDateToStr(new Date()),
      chk: "N",
      creditcd: "",
      creditnm: "",
      custcd: "",
      custnm: "",
      dptcd: workType == "N" ? filters.dptcd : para.dptcd,
      etax: "",
      expensedt: "",
      expenseno: "",
      expenseseq1: 0,
      expenseseq2: 0,
      files: "",
      fxassetcd: "",
      incidentalamt: 0,
      indt: "",
      insiz: "",
      itemacnt: "",
      itemcd: "",
      itemnm: "",
      ma210t_recdt: "",
      ma210t_seq1: 0,
      ma210t_seq2: 0,
      ordnum: "",
      orgdiv: "01",
      printdiv: "",
      qty: 0,
      rcvcustcd: "",
      rcvcustnm: "",
      remark: "",
      taxamt: 0,
      taxdiv: "",
      taxnum: "",
      taxtype: "",
      totamt: 0,
      unp: 0,
      usekind: "A",
      wonamt: 0,
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  return (
    <Window
      title={
        worktype === "N"
          ? "지출결의서생성"
          : worktype === "C"
          ? "지출결의서복사"
          : "지출결의서정보"
      }
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th>결의서 No</th>
              <td>
                <Input
                  name="expenseno"
                  type="text"
                  value={filters.expenseno}
                  className="readonly"
                />
              </td>
              <th>신청일자</th>
              <td>
                <DatePicker
                  name="expensedt"
                  value={filters.expensedt}
                  format="yyyy-MM-dd"
                  className="readonly"
                  placeholder=""
                  disabled={true}
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
              <th>사업부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>요청자 사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                  className="required"
                />
                <ButtonInInput>
                  <Button
                    type="button"
                    icon="more-horizontal"
                    fillMode="flat"
                    onClick={onUserWndClick}
                  />
                </ButtonInInput>
              </td>
              <th>요청자 성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  className="readonly"
                />
              </td>
              <th>요청자 부서</th>
              <td>
                <Input
                  name="dptnm"
                  type="text"
                  value={filters.dptnm}
                  className="readonly"
                />
              </td>
              <th>이체구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="auto_transfer"
                    value={filters.auto_transfer}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <FormContext.Provider
        value={{
          custcd,
          custnm,
          setCustcd,
          setCustnm,
          mainDataState,
          setMainDataState,
          // fetchGrid,
        }}
      >
        <GridContainer height={position.height - 600 + "px"}>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                //onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: `calc(100% - 35px)` }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                carddt: row.carddt != "" ? toDate(row.carddt) : new Date(),
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="carddt"
              title="사용일"
              width="120px"
              cell={DateCell}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="rcvcustcd"
              title="사용처"
              width="150px"
              cell={ColumnCommandCell}
            />
            <GridColumn field="rcvcustnm" title="사용처명" width="150px" />
            <GridColumn field="remark" title="품의내역" width="200px" />
            <GridColumn
              field="dptcd"
              title="비용부서"
              width="120px"
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field="amt"
              title="지출금액"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="totamt"
              title="합계"
              width="100px"
              cell={NumberCell}
            />
          </Grid>
        </GridContainer>
      </FormContext.Provider>
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th>고객사코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].custcd
                  }
                  onChange={InputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>고객사명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].custnm
                  }
                  className="readonly"
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button
            themeColor={"primary"}
            //onClick={onConfirmClick}
          >
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {userWindowVisible && (
        <UserWindow
          setVisible={setUserWindowVisible}
          workType={"N"}
          setData={setUserData}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
