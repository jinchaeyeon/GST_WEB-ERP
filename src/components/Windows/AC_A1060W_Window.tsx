import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
import {
  Input,
  InputChangeEvent,
  NumericTextBox,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import RadioGroupCell from "../Cells/RadioGroupCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat,
  getGridItemChangedData,
  getHeight,
  numberWithCommas,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CodeWindow from "./CommonWindows/CodeWindow";
import DepositWindow from "./CommonWindows/DepositWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  data?: any;
  setVisible(t: boolean): void;
  setData(str: string): void;
  modal?: boolean;
  pathname: string;
};

const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;

type TdataArr = {
  rowstatus_s: string[];
  collectnum_s: string[];
  collectseq_s: string[];
  drcrdiv_s: string[];
  acntcd_s: string[];
  amt1_s: string[];
  amt2_s: string[];
  remark_s: string[];
  taxnum_s: string[];
  acntnum_s: string[];
  notenum_s: string[];
  enddt_s: string[];
  pubbank_s: string[];
  pubdt_s: string[];
  pubperson_s: string[];
  fornamt_s: string[];
  salerat_s: string[];
  saleamt_s: string[];
};

const FormContext3 = createContext<{
  stdrmakcd: string;
  setstdrmakcd: (d: any) => void;
  stdrmaknm: string;
  setstdrmaknm: (d: any) => void;
  acntcd: string;
  setAcntcd: (d: any) => void;
  acntnm: string;
  setAcntnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext4 = createContext<{
  acntnum: string;
  setAcntnum: (d: any) => void;
  acntnumnm: string;
  setacntnumnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

interface ICodeData {
  stdrmkcd: string;
  stdrmknm1: string;
  acntcd: string;
  acntnm: string;
}

interface IDepositData {
  acntsrtnm: string;
  acntsrtnum: string;
  bankacntnum: string;
}

const ColumnCommandCell3 = (props: GridCellProps) => {
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
    stdrmakcd,
    stdrmaknm,
    acntcd,
    acntnm,
    setstdrmakcd,
    setstdrmaknm,
    setAcntcd,
    setAcntnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext3);
  let isInEdit = field == dataItem.inEdit;
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
  const [codeWindowVisible, setCodeWindowVisible] = useState<boolean>(false);

  const onCodeWndClick = () => {
    setCodeWindowVisible(true);
  };

  const setCodeData = (data: ICodeData) => {
    setstdrmakcd(data.stdrmkcd);
    setstdrmaknm(data.stdrmknm1);
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
          onClick={onCodeWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {codeWindowVisible && (
        <CodeWindow setVisible={setCodeWindowVisible} setData={setCodeData} />
      )}
    </>
  );
};

const ColumnCommandCell4 = (props: GridCellProps) => {
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
    acntnum,
    acntnumnm,
    setAcntnum,
    setacntnumnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext4);
  let isInEdit = field == dataItem.inEdit;
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
    setAcntnum(data.acntsrtnum);
    setacntnumnm(data.acntsrtnm);
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
      {render == undefined
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

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_DRCR", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "drcrdiv" ? "R_DRCR" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const CopyWindow = ({
  data,
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 600) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 600,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //하단 버튼부분
    height3 = getHeight(".FormBoxWrap");
    height4 = getHeight(".WindowButtonContainer");

    setMobileHeight(deviceHeight - height);
    setMobileHeight2(deviceHeight - height - height2 - height4);
    setWebHeight(position.height - height - height2 - height3 - height4);
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(position.height - height - height2 - height3 - height4);
  };

  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [acntcd, setAcntcd] = useState<string>("");
  const [acntnm, setAcntnm] = useState<string>("");
  const [stdrmakcd, setstdrmakcd] = useState<string>("");
  const [stdrmaknm, setstdrmaknm] = useState<string>("");
  const [acntnumnm, setacntnumnm] = useState<string>("");
  const [acntnum, setAcntnum] = useState<string>("");
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002, L_BA028, L_BA005, L_BA020",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            acntcd: acntcd,
            acntnm: acntnm,
            stdrmakcd: stdrmakcd,
            stdrmaknm: stdrmaknm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [stdrmakcd, stdrmaknm]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            acntnumnm: acntnumnm,
            acntnum: acntnum,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
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
  }, [acntnumnm, acntnum]);

  const onClose = () => {
    setVisible(false);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const sessionPosition = UseGetValueFromSessionItem("position");
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    position: sessionPosition,
    outkey_s: "",
    wonchgrat: 0,
    isSearch: false,
    find_row_value: "",
    pgNum: 1,
  });

  const [information, setInformation] = useState({
    location: "",
    indt: new Date(),
    position: "",
    doexdiv: "",
    amtunit: "",
    wonchgrat: 0,
  });

  useEffect(() => {
    if (data != undefined) {
      if (data.length > 0) {
        async function getWonchgrat(data: any[]) {
          let datas: any;
          const queryStr =
            "SELECT wonchgrat FROM ba015t WHERE amtunit = '" +
            data[data.length - 1].amtunit +
            "' AND basedt = ( select MAX(basedt) FROM ba015t WHERE basedt <= '" +
            convertDateToStr(new Date()) +
            "' AND amtunit = '" +
            data[data.length - 1].amtunit +
            "')";

          const bytes = require("utf8-bytes");
          const convertedQueryStr = bytesToBase64(bytes(queryStr));

          let query = {
            query: convertedQueryStr,
          };

          try {
            datas = await processApi<any>("query", query);
          } catch (error) {
            datas = null;
          }

          if (datas.isSuccess == true) {
            const rows = datas.tables[0].Rows;
            const rowCount = datas.tables[0].RowCount;

            if (rowCount > 0) {
              return rows[0].wonchgrat;
            } else {
              return 1;
            }
          } else {
            return 1;
          }
        }

        getWonchgrat(data).then((res) => {
          if (
            data[data.length - 1].amtunit == "" ||
            (data[data.length - 1].amtunit == "KRW" && res == 0)
          ) {
            let array: any[] = [];

            data.map((item: any) => {
              array.push(item.ref_key);
            });

            setFilters((prev) => ({
              ...prev,
              location: data[data.length - 1].location,
              position: data[data.length - 1].position,
              outkey_s: array.join("|"),
              wonchgrat: 1,
              isSearch: true,
            }));
            setInformation({
              location: data[data.length - 1].location,
              indt: new Date(),
              position: data[data.length - 1].position,
              doexdiv: data[data.length - 1].doexdiv,
              amtunit: data[data.length - 1].amtunit,
              wonchgrat: 1,
            });
          } else {
            let array: any[] = [];

            data.map((item: any) => {
              array.push(item.ref_key);
            });

            setFilters((prev) => ({
              ...prev,
              location: data[data.length - 1].location,
              position: data[data.length - 1].position,
              outkey_s: array.join("|"),
              wonchgrat: res,
              isSearch: true,
            }));
            setInformation({
              location: data[data.length - 1].location,
              indt: new Date(),
              position: data[data.length - 1].position,
              doexdiv: data[data.length - 1].doexdiv,
              amtunit: data[data.length - 1].amtunit,
              wonchgrat: res,
            });
          }
        });
      }
    }
  }, []);

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1060W_Sub1_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_outkey_s": filters.outkey_s,
        "@p_wonchgrat": filters.wonchgrat,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        rowstatus: "N",
      }));

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
    // 필터 isSearch false처리, pgNum 세팅
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
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

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
          const newData2 = item;
          newData2.rowstatus = "D";
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

    const cust = mainDataResult.data.filter((item) => item.custcd != "");

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntcd: "",
      acntnm: "",
      acntnum: "",
      acntnumnm: "",
      amt_1: 0,
      amt_2: 0,
      collectnum: "",
      collectseq: 0,
      custcd: cust[0].custcd,
      custnm: cust[0].custnm,
      drcrdiv: "1",
      enddt: "99991231",
      fornamt: 0,
      location: "",
      mngitemcd1: "",
      notenum: "",
      orgdiv: sessionOrgdiv,
      pubbank: "",
      pubdt: "99991231",
      pubperson: "",
      remark: "",
      remark1: "",
      saleamt: 0,
      salenum: "",
      salerat: 0,
      stdrmakcd: "",
      stdrmaknm: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
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
    let valid = true;

    if (field == "amt_1") {
      if (dataItem.drcrdiv == "1") {
        valid = true;
      } else {
        valid = false;
      }
    }

    if (field == "amt_2") {
      if (dataItem.drcrdiv == "2") {
        valid = true;
      } else {
        valid = false;
      }
    }

    if (
      field != "rowstatus" &&
      field != "custcd" &&
      field != "custnm" &&
      field != "acntcd" &&
      field != "acntnm" &&
      field != "salenum" &&
      valid == true
    ) {
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

  const selectData = (selectedData: any) => {
    let sum = 0;
    let sum2 = 0;
    let valid = true;
    mainDataResult.data.map((item) => {
      sum += item.amt_1;
      sum2 += item.amt_2;

      if (
        (item.acntcd == "1110130" || item.acntcd == "1110131") &&
        item.acntnum == ""
      ) {
        valid = false;
      }
    });

    if (sum != sum2) {
      alert("차변의 합계금액과 대변의 합계금액이 맞지 않습니다.");
      return false;
    }

    if (valid != true) {
      alert("계정이 보통예금인 경우 예적금 코드는 필수값입니다.");
      return false;
    }

    if (
      information.location == "" ||
      information.doexdiv == "" ||
      information.amtunit == ""
    ) {
      alert("필수값을 채워주세요.");
      return false;
    }

    let dataArr: TdataArr = {
      rowstatus_s: [],
      collectnum_s: [],
      collectseq_s: [],
      drcrdiv_s: [],
      acntcd_s: [],
      amt1_s: [],
      amt2_s: [],
      remark_s: [],
      taxnum_s: [],
      acntnum_s: [],
      notenum_s: [],
      enddt_s: [],
      pubbank_s: [],
      pubdt_s: [],
      pubperson_s: [],
      fornamt_s: [],
      salerat_s: [],
      saleamt_s: [],
    };

    mainDataResult.data.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        collectnum = "",
        collectseq = "",
        drcrdiv = "",
        acntcd = "",
        amt_1 = "",
        amt_2 = "",
        remark = "",
        salenum = "",
        acntnum = "",
        notenum = "",
        enddt = "",
        pubbank = "",
        pubdt = "",
        pubperson = "",
        fornamt = "",
        salerat = "",
        saleamt = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.collectnum_s.push(collectnum == undefined ? "" : collectnum);
      dataArr.collectseq_s.push(collectseq == undefined ? 0 : collectseq);
      dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
      dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
      dataArr.amt1_s.push(amt_1);
      dataArr.amt2_s.push(amt_2);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
      dataArr.taxnum_s.push(salenum == undefined ? "" : salenum);
      dataArr.acntnum_s.push(acntnum == undefined ? "" : acntnum);
      dataArr.notenum_s.push(notenum == undefined ? "" : notenum);
      dataArr.enddt_s.push(
        enddt == "99991231" || enddt == undefined ? "" : enddt
      );
      dataArr.pubbank_s.push(pubbank == undefined ? "" : pubbank);
      dataArr.pubdt_s.push(
        pubdt == "99991231" || pubdt == undefined ? "" : pubdt
      );
      dataArr.pubperson_s.push(pubperson == undefined ? "" : pubperson);
      dataArr.fornamt_s.push(fornamt == undefined ? 0 : fornamt);
      dataArr.salerat_s.push(salerat == undefined ? 0 : salerat);
      dataArr.saleamt_s.push(saleamt == undefined ? 0 : saleamt);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      location: information.location,
      position: information.position,
      custcd: data[data.length - 1].custcd,
      custnm: data[data.length - 1].custnm,
      indt: convertDateToStr(information.indt),
      doexdiv: information.doexdiv,
      amtunit: information.amtunit,
      wonchgrat: information.wonchgrat,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      collectnum_s: dataArr.collectnum_s.join("|"),
      collectseq_s: dataArr.collectseq_s.join("|"),
      drcrdiv_s: dataArr.drcrdiv_s.join("|"),
      acntcd_s: dataArr.acntcd_s.join("|"),
      amt1_s: dataArr.amt1_s.join("|"),
      amt2_s: dataArr.amt2_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      taxnum_s: dataArr.taxnum_s.join("|"),
      acntnum_s: dataArr.acntnum_s.join("|"),
      notenum_s: dataArr.notenum_s.join("|"),
      enddt_s: dataArr.enddt_s.join("|"),
      pubbank_s: dataArr.pubbank_s.join("|"),
      pubdt_s: dataArr.pubdt_s.join("|"),
      pubperson_s: dataArr.pubperson_s.join("|"),
      fornamt_s: dataArr.fornamt_s.join("|"),
      salerat_s: dataArr.salerat_s.join("|"),
      saleamt_s: dataArr.saleamt_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    location: "",
    position: "",
    custcd: "",
    custnm: "",
    indt: "",
    doexdiv: "",
    amtunit: "",
    wonchgrat: 0,
    rowstatus_s: "",
    collectnum_s: "",
    collectseq_s: "",
    drcrdiv_s: "",
    acntcd_s: "",
    amt1_s: "",
    amt2_s: "",
    remark_s: "",
    taxnum_s: "",
    acntnum_s: "",
    notenum_s: "",
    enddt_s: "",
    pubbank_s: "",
    pubdt_s: "",
    pubperson_s: "",
    fornamt_s: "",
    salerat_s: "",
    saleamt_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A1060W_Sub1_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_indt": ParaData.indt,
      "@p_doexdiv": ParaData.doexdiv,
      "@p_amtunit": ParaData.amtunit,
      "@p_wonchgrat": ParaData.wonchgrat,

      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_collectnum_s": ParaData.collectnum_s,
      "@p_collectseq_s": ParaData.collectseq_s,
      "@p_drcrdiv_s": ParaData.drcrdiv_s,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_amt1_s": ParaData.amt1_s,
      "@p_amt2_s": ParaData.amt2_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_taxnum_s": ParaData.taxnum_s,
      "@p_acntnum_s": ParaData.acntnum_s,
      "@p_notenum_s": ParaData.notenum_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_pubbank_s": ParaData.pubbank_s,
      "@p_pubdt_s": ParaData.pubdt_s,
      "@p_pubperson_s": ParaData.pubperson_s,
      "@p_fornamt_s": ParaData.fornamt_s,
      "@p_salerat_s": ParaData.salerat_s,
      "@p_saleamt_s": ParaData.saleamt_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1060W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setData(data.returnString);
      setVisible(false);

      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: sessionOrgdiv,
        location: "",
        position: "",
        custcd: "",
        custnm: "",
        indt: "",
        doexdiv: "",
        amtunit: "",
        wonchgrat: 0,
        rowstatus_s: "",
        collectnum_s: "",
        collectseq_s: "",
        drcrdiv_s: "",
        acntcd_s: "",
        amt1_s: "",
        amt2_s: "",
        remark_s: "",
        taxnum_s: "",
        acntnum_s: "",
        notenum_s: "",
        enddt_s: "",
        pubbank_s: "",
        pubdt_s: "",
        pubperson_s: "",
        fornamt_s: "",
        salerat_s: "",
        saleamt_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <Window
        titles={"수금전표생성"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        {isMobile ? (
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <FormBoxWrap
                className="FormBoxWrap"
                style={{ height: mobileheight }}
              >
                <ButtonContainer style={{ justifyContent: "end" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>사업장</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="location"
                            value={information.location}
                            bizComponentId="L_BA002"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1060W"
                            className="required"
                          />
                        )}
                      </td>
                      <th>수금일자</th>
                      <td>
                        <DatePicker
                          name="indt"
                          value={information.indt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          className="required"
                          placeholder=""
                        />
                      </td>
                      <th>사업부</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="position"
                            value={information.position}
                            bizComponentId="L_BA028"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1060W"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>내수구분</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="doexdiv"
                            value={information.doexdiv}
                            bizComponentId="L_BA005"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1060W"
                            className="required"
                          />
                        )}
                      </td>
                      <th>화폐단위</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="amtunit"
                            value={information.amtunit}
                            bizComponentId="L_BA020"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                            para="AC_A1060W"
                            className="required"
                          />
                        )}
                      </td>
                      <th>원화환율</th>
                      <td>
                        <NumericTextBox
                          name="wonchgrat"
                          value={information.wonchgrat}
                          onChange={InputChange}
                          className="required"
                          format="n0"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <FormContext3.Provider
                  value={{
                    stdrmakcd,
                    stdrmaknm,
                    acntcd,
                    acntnm,
                    setAcntcd,
                    setAcntnm,
                    setstdrmakcd,
                    setstdrmaknm,
                    mainDataState,
                    setMainDataState,
                    // fetchGrid,
                  }}
                >
                  <FormContext4.Provider
                    value={{
                      acntnumnm,
                      acntnum,
                      setacntnumnm,
                      setAcntnum,
                      mainDataState,
                      setMainDataState,
                      // fetchGrid,
                    }}
                  >
                    <GridContainer>
                      <GridTitleContainer className="WindowButtonContainer">
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(0);
                              }
                            }}
                            icon="chevron-left"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                          <div>
                            <Button
                              onClick={onAddClick}
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
                          </div>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <Grid
                        style={{ height: mobileheight2 }}
                        data={process(
                          mainDataResult.data.map((row) => ({
                            ...row,
                            pubdt: row.pubdt
                              ? new Date(dateformat(row.pubdt))
                              : new Date(dateformat("99991231")),
                            enddt: row.enddt
                              ? new Date(dateformat(row.enddt))
                              : new Date(dateformat("99991231")),
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
                          field="custcd"
                          title="업체코드"
                          width="120px"
                          footerCell={mainTotalFooterCell}
                        />
                        <GridColumn
                          field="custnm"
                          title="업체명"
                          width="120px"
                        />
                        <GridColumn
                          field="drcrdiv"
                          title="차대구분"
                          width="150px"
                          cell={CustomRadioCell}
                        />
                        <GridColumn
                          field="amt_1"
                          title="차변금액"
                          width="100px"
                          cell={NumberCell}
                          footerCell={editNumberFooterCell}
                        />
                        <GridColumn
                          field="amt_2"
                          title="대변금액"
                          width="100px"
                          cell={NumberCell}
                          footerCell={editNumberFooterCell}
                        />
                        <GridColumn
                          field="acntcd"
                          title="계정과목코드"
                          width="120px"
                        />
                        <GridColumn
                          field="acntnm"
                          title="계정명"
                          width="120px"
                        />
                        <GridColumn field="remark" title="비고" width="200px" />
                        <GridColumn
                          field="remark1"
                          title="비고(400)"
                          width="400px"
                        />
                        <GridColumn
                          field="salenum"
                          title="판매번호"
                          width="150px"
                        />
                        <GridColumn
                          field="stdrmakcd"
                          title="단축코드"
                          width="150px"
                          cell={ColumnCommandCell3}
                        />
                        <GridColumn
                          field="acntnum"
                          title="예적금코드"
                          width="120px"
                          cell={ColumnCommandCell4}
                        />
                        <GridColumn
                          field="acntnumnm"
                          title="예적금명"
                          width="120px"
                        />
                        <GridColumn
                          field="enddt"
                          title="만기일자"
                          width="120px"
                          cell={DateCell}
                        />
                        <GridColumn
                          field="pubbank"
                          title="발행은행명"
                          width="120px"
                        />
                        <GridColumn
                          field="pubdt"
                          title="발행일자"
                          width="120px"
                          cell={DateCell}
                        />
                        <GridColumn
                          field="pubperson"
                          title="발행인"
                          width="120px"
                        />
                        <GridColumn
                          field="fornamt"
                          title="외화금액"
                          width="100px"
                          cell={NumberCell}
                        />
                        <GridColumn
                          field="salerat"
                          title="당시환율"
                          width="100px"
                          cell={NumberCell}
                        />
                        <GridColumn
                          field="saleamt"
                          title="관리금액"
                          width="100px"
                          cell={NumberCell}
                        />
                        <GridColumn
                          field="notenum"
                          title="어음번호"
                          width="120px"
                        />
                      </Grid>
                    </GridContainer>
                  </FormContext4.Provider>
                </FormContext3.Provider>
                <BottomContainer className="BottomContainer">
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
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap border={true} className="FormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>사업장</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="location"
                          value={information.location}
                          bizComponentId="L_BA002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1060W"
                          className="required"
                        />
                      )}
                    </td>
                    <th>수금일자</th>
                    <td>
                      <DatePicker
                        name="indt"
                        value={information.indt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        className="required"
                        placeholder=""
                      />
                    </td>
                    <th>사업부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="position"
                          value={information.position}
                          bizComponentId="L_BA028"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1060W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>내수구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="doexdiv"
                          value={information.doexdiv}
                          bizComponentId="L_BA005"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1060W"
                          className="required"
                        />
                      )}
                    </td>
                    <th>화폐단위</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="amtunit"
                          value={information.amtunit}
                          bizComponentId="L_BA020"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A1060W"
                          className="required"
                        />
                      )}
                    </td>
                    <th>원화환율</th>
                    <td>
                      <NumericTextBox
                        name="wonchgrat"
                        value={information.wonchgrat}
                        onChange={InputChange}
                        className="required"
                        format="n0"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <FormContext3.Provider
              value={{
                stdrmakcd,
                stdrmaknm,
                acntcd,
                acntnm,
                setAcntcd,
                setAcntnm,
                setstdrmakcd,
                setstdrmaknm,
                mainDataState,
                setMainDataState,
                // fetchGrid,
              }}
            >
              <FormContext4.Provider
                value={{
                  acntnumnm,
                  acntnum,
                  setacntnumnm,
                  setAcntnum,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <GridContainer>
                  <GridTitleContainer className="WindowButtonContainer">
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
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
                    style={{ height: webheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        pubdt: row.pubdt
                          ? new Date(dateformat(row.pubdt))
                          : new Date(dateformat("99991231")),
                        enddt: row.enddt
                          ? new Date(dateformat(row.enddt))
                          : new Date(dateformat("99991231")),
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
                      field="custcd"
                      title="업체코드"
                      width="120px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn field="custnm" title="업체명" width="120px" />
                    <GridColumn
                      field="drcrdiv"
                      title="차대구분"
                      width="150px"
                      cell={CustomRadioCell}
                    />
                    <GridColumn
                      field="amt_1"
                      title="차변금액"
                      width="100px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="amt_2"
                      title="대변금액"
                      width="100px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="acntcd"
                      title="계정과목코드"
                      width="120px"
                    />
                    <GridColumn field="acntnm" title="계정명" width="120px" />
                    <GridColumn field="remark" title="비고" width="200px" />
                    <GridColumn
                      field="remark1"
                      title="비고(400)"
                      width="400px"
                    />
                    <GridColumn
                      field="salenum"
                      title="판매번호"
                      width="150px"
                    />
                    <GridColumn
                      field="stdrmakcd"
                      title="단축코드"
                      width="150px"
                      cell={ColumnCommandCell3}
                    />
                    <GridColumn
                      field="acntnum"
                      title="예적금코드"
                      width="120px"
                      cell={ColumnCommandCell4}
                    />
                    <GridColumn
                      field="acntnumnm"
                      title="예적금명"
                      width="120px"
                    />
                    <GridColumn
                      field="enddt"
                      title="만기일자"
                      width="120px"
                      cell={DateCell}
                    />
                    <GridColumn
                      field="pubbank"
                      title="발행은행명"
                      width="120px"
                    />
                    <GridColumn
                      field="pubdt"
                      title="발행일자"
                      width="120px"
                      cell={DateCell}
                    />
                    <GridColumn
                      field="pubperson"
                      title="발행인"
                      width="120px"
                    />
                    <GridColumn
                      field="fornamt"
                      title="외화금액"
                      width="100px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="salerat"
                      title="당시환율"
                      width="100px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="saleamt"
                      title="관리금액"
                      width="100px"
                      cell={NumberCell}
                    />
                    <GridColumn
                      field="notenum"
                      title="어음번호"
                      width="120px"
                    />
                  </Grid>
                </GridContainer>
              </FormContext4.Provider>
            </FormContext3.Provider>
            <BottomContainer className="BottomContainer">
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
          </>
        )}
      </Window>
    </>
  );
};

export default CopyWindow;
