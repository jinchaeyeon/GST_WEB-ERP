import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState
} from "@progress/kendo-react-grid";
import {
  Input,
  InputChangeEvent
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  toDate
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AccountWindow from "./CommonWindows/AccountWindow";
import DepositWindow from "./CommonWindows/DepositWindow";

type IWindow = {
  workType: "N" | "U";
  data?: IData[];
  setVisible(t: boolean): void;
  setData(data: object, filter: object): void;
  modal?: boolean;
};

type IData = {
  location: string;
  reqdt: string;
  seq: string;
};

type TdataArr = {
  reqdt_s: string[];
  seq_s: string[];
};

interface IAccountData {
  acntcd: string;
  acntnm: string;
}

const FormContext = createContext<{
  acntcd: string;
  setAcntcd: (d: any) => void;
  acntnm: string;
  setAcntnm: (d: any) => void;
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
    acntcd,
    acntnm,
    setAcntcd,
    setAcntnm,
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
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd(data.acntcd);
    setAcntnm(data.acntnm);
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
          onClick={onAccountWndClick}
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
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
        />
      )}
    </>
  );
};

interface IDepositData {
  acntsrtnm: string;
  acntsrtnum: string;
  bankacntnum: string;
}

const FormContext2 = createContext<{
  acntsrtnm: string;
  setAcntsrtnm: (d: any) => void;
  acntsrtnum: string;
  setAcntsrtnum: (d: any) => void;
  bankacntnum: string;
  setBankacntnum: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const ColumnCommandCell2 = (props: GridCellProps) => {
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
    acntsrtnm,
    setAcntsrtnm,
    acntsrtnum,
    setAcntsrtnum,
    bankacntnum,
    setBankacntnum,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext2);
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
  const [depositWindowVisible, setDepositWindowVisible] =
    useState<boolean>(false);

  const onDepositWndClick = () => {
    setDepositWindowVisible(true);
  };

  const setDepositData = (data: IDepositData) => {
    setAcntsrtnm(data.acntsrtnm);
    setAcntsrtnum(data.acntsrtnum);
    setBankacntnum(data.bankacntnum);
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
          onClick={onDepositWndClick}
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
      {depositWindowVisible && (
        <DepositWindow
          setVisible={setDepositWindowVisible}
          setData={setDepositData}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_AC001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "drcrdiv" ? "L_AC001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  modal = false,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 700,
  });
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [acntcd, setAcntcd] = useState<string>("");
  const [acntnm, setAcntnm] = useState<string>("");
  const [acntsrtnm, setAcntsrtnm] = useState<string>("");
  const [acntsrtnum, setAcntsrtnum] = useState<string>("");
  const [bankacntnum, setBankacntnum] = useState<string>("");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  useEffect(() => {
    if (acntcd != "" && acntcd != undefined) {
      const newData = mainDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              acntcd: acntcd,
              acntnm: acntnm,
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
    }
  }, [acntcd, acntnm]);

  useEffect(() => {
    if (acntsrtnum != "" && acntsrtnum != undefined) {
      const newData = mainDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              acntnumnm: acntsrtnm,
              acntnum: acntsrtnum,
              bankacntnum: bankacntnum,
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
    }
  }, [acntsrtnm, acntsrtnum, bankacntnum]);

  //공통코드 리스트 조회 ()
  const [drcrdivListData, setDrcrdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const drcrdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC001")
      );

      fetchQuery(drcrdivQueryStr, setDrcrdivListData);
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

  const processApi = useApi();

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    position: "",
    reqdt_s: "",
    seq_s: "",
    frdt: new Date(),
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_MA_A9001W_Sub2_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": "01",
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_reqdt_s": filters.reqdt_s,
        "@p_seq_s": filters.seq_s,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
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
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
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

  useEffect(() => {
    if (data != undefined) {
      let dataArr: TdataArr = {
        reqdt_s: [],
        seq_s: [],
      };
      data.map((item: any) => {
        dataArr.reqdt_s.push(item.reqdt);
        dataArr.seq_s.push(item.seq);
      });
      setFilters((prev) => ({
        ...prev,
        location: data[0].location,
        seq_s: dataArr.seq_s.join("|"),
        reqdt_s: dataArr.reqdt_s.join("|"),
        isSearch: true,
      }));
    }
  }, []);

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    let valid = true;
    mainDataResult.data.map((item) => {
      if (item.qty == 0 && valid == true) {
        alert("수량을 채워주세요.");
        valid = false;
        return false;
      }
    });

    if (valid == true) {
      try {
        if (mainDataResult.data.length == 0) {
          throw findMessage(messagesData, "MA_A9001W_002");
        } else if (
          convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
          convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
          convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
          convertDateToStr(filters.frdt).substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "MA_A9001W_001");
        } else if (
          filters.location == null ||
          filters.location == "" ||
          filters.location == undefined
        ) {
          throw findMessage(messagesData, "MA_A9001W_003");
        } else {
          if (valid == true) {
            setData(mainDataResult.data, filters);
            onClose();
          }
        }
      } catch (e) {
        alert(e);
      }
    }
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
    let valid = true;
    if (
      field == "rowstatus" ||
      (dataItem.drcrdiv == "2" && field == "amt_1") ||
      (dataItem.drcrdiv == "1" && field == "amt_2") ||
      field == "taxnum"
    ) {
      valid = false;
      return false;
    }

    if (valid == true) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
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
              amt_1: item.drcrdiv == "2" ? 0 : item.amt_1,
              amt_2: item.drcrdiv == "1" ? 0 : item.amt_2,
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

  return (
    <>
      <Window
        title={"지급처리"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
          <FormBox>
            <tbody>
              <tr>
                <th>지급일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="frdt"
                      value={filters.frdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
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
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <FormContext.Provider
          value={{
            acntcd,
            acntnm,
            setAcntcd,
            setAcntnm,
            mainDataState,
            setMainDataState,
            // fetchGrid,
          }}
        >
          <FormContext2.Provider
            value={{
              acntsrtnm,
              setAcntsrtnm,
              acntsrtnum,
              setAcntsrtnum,
              bankacntnum,
              setBankacntnum,
              mainDataState,
              setMainDataState,
              // fetchGrid,
            }}
          >
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "450px" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    rowstatus:
                      row.rowstatus == null ||
                      row.rowstatus == "" ||
                      row.rowstatus == undefined
                        ? ""
                        : row.rowstatus,
                    enddt:
                      row.enddt == null ||
                      row.enddt == "" ||
                      row.enddt == undefined
                        ? new Date()
                        : toDate(row.enddt),
                    pubdt:
                      row.pubdt == null ||
                      row.pubdt == "" ||
                      row.pubdt == undefined
                        ? new Date()
                        : toDate(row.pubdt),
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
                  field="drcrdiv"
                  title="차대구분"
                  width="120px"
                  cell={CustomComboBoxCell}
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn
                  field="amt_1"
                  title="차변금액"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="amt_2"
                  title="대변금액"
                  width="100px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="acntcd"
                  title="계정과목코드"
                  cell={ColumnCommandCell}
                  width="120px"
                />
                <GridColumn field="acntnm" title="계정과목명" width="120px" />
                <GridColumn
                  field="acntnum"
                  title="예적금코드"
                  cell={ColumnCommandCell2}
                  width="120px"
                />
                <GridColumn
                  field="acntnumnm"
                  title="예적금코드명"
                  width="120"
                />
                <GridColumn field="remark" title="비고" width="150px" />
                <GridColumn field="taxnum" title="계산서번호" width="120px" />
                <GridColumn
                  field="enddt"
                  title="만기일자"
                  width="120px"
                  cell={DateCell}
                />
                <GridColumn field="pubbank" title="발행은행명" width="120px" />
                <GridColumn
                  field="pubdt"
                  title="발행일자"
                  width="120px"
                  cell={DateCell}
                />
                <GridColumn
                  field="fornamt"
                  title="외화금액"
                  width="100px"
                  cell={NumberCell}
                  footerCell={gridSumQtyFooterCell}
                />
                <GridColumn field="pubperson" title="발행인" width="120px" />
              </Grid>
            </GridContainer>
          </FormContext2.Provider>
        </FormContext.Provider>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
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
    </>
  );
};

export default CopyWindow;
