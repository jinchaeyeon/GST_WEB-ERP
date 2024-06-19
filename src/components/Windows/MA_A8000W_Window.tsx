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
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import * as React from "react";
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
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import RadioGroupCell from "../Cells/RadioGroupCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  numberWithCommas,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AccountWindow from "./CommonWindows/AccountWindow";
import CodeWindow from "./CommonWindows/CodeWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import DepositWindow from "./CommonWindows/DepositWindow";
import MA_A8000W_Acnt_Window from "./MA_A8000W_Acnt_Window";
import Window from "./WindowComponent/Window";

let temp = 0;
let deletedMainRows: object[] = [];

type TdataArr = {
  row_status_s: string[];
  paymentseq_s: string[];
  drcrdiv_s: string[];
  acntcd_s: string[];
  rcvcustcd_s: string[];
  rcvcustnm_s: string[];
  amt_s: string[];
  notediv_s: string[];
  notenum_s: string[];
  pubdt_s: string[];
  enddt_s: string[];
  pubbank_s: string[];
  pubperson_s: string[];
  bankcd_s: string[];
  acntnum_s: string[];
  stdrmkcd_s: string[];
  remark1_s: string[];
  doexdiv_s: string[];
  closeyn_s: string[];
  dptcd_s: string[];
  taxnum_s: string[];
  advanceinfo_s: string[];
  custcd_s: string[];
  custnm_s: string[];
  datnum_s: string[];
};

type IWindow = {
  setVisible(t: boolean): void;
  workType: "N" | "U";
  data: any;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  list: any;
  modal?: boolean;
  pathname: string;
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

interface IDepositData {
  acntsrtnm: string;
  acntsrtnum: string;
  bankacntnum: string;
}

interface ICustData {
  custcd: string;
  custnm: string;
}

interface IAccountData {
  acntcd: string;
  acntnm: string;
}

interface ICodeData {
  stdrmkcd: string;
  stdrmknm1: string;
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

const FormContext2 = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext3 = createContext<{
  stdrmkcd: string;
  setStdrmkcd: (d: any) => void;
  stdrmknm: string;
  setStdrmknm: (d: any) => void;
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
  acntsrtnm: string;
  setAcntsrtnm: (d: any) => void;
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
      {render == undefined
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
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext2);
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
      {render == undefined
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
    stdrmkcd,
    stdrmknm,
    acntcd,
    acntnm,
    setStdrmkcd,
    setStdrmknm,
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
    setStdrmkcd(data.stdrmkcd);
    setStdrmknm(data.stdrmknm1);
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
    acntsrtnm,
    setAcntnum,
    setAcntsrtnm,
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
    setAcntsrtnm(data.acntsrtnm);
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

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  list,
  modal = false,
  pathname,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowFormBoxWrap");
      height4 = getHeight(".WindowButtonContainer");

      setMobileHeight(getWindowDeviceHeight(false, deviceHeight) - height);
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
      );
      setWebHeight(
        getWindowDeviceHeight(false, position.height) -
          height -
          height2 -
          height3 -
          height4
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3 -
        height4
    );
  };
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [acntcd, setAcntcd] = useState<string>("");
  const [acntnm, setAcntnm] = useState<string>("");
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
  const [stdrmkcd, setStdrmkcd] = useState<string>("");
  const [stdrmknm, setStdrmknm] = useState<string>("");
  const [acntsrtnm, setAcntsrtnm] = useState<string>("");
  const [acntnum, setAcntnum] = useState<string>("");

  const DATA_ITEM_KEY = "num";

  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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

    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [name]: value,
      rowstatus: item.rowstatus == "N" ? "N" : "U",
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [name]: value,
      rowstatus: item.rowstatus == "N" ? "N" : "U",
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [DetailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const onDetailClick = () => {
    setDetailWindowVisible(true);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    indt: new Date(),
    location: "",
    position: "",
    paymentnum: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;

    let data2: any;
    const parameters: Iparameters = {
      procedureName: "P_MA_A8000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_paymentnum": data.paymentnum,
        "@p_location": filters.location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_position": filters.position,
        "@p_find_row_value": "",
      },
    };

    setLoading(true);
    try {
      data2 = await processApi<any>("procedure", parameters);
    } catch (error) {
      data2 = null;
    }

    if (data2.isSuccess == true) {
      const totalRowCnt = data2.tables[0].RowCount;
      const rows = data2.tables[0].Rows.map((row: any) => {
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
        setFilters((prev) => ({
          ...prev,
          isSearch: false,
          paymentnum: rows[0].paymentnum,
          indt: toDate(rows[0].indt),
          location: rows[0].location,
          position: rows[0].position,
        }));
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data2);
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
    if (
      filters.isSearch &&
      workType == "U" &&
      permissions.view &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    } else if (
      filters.isSearch &&
      workType == "N" &&
      customOptionData !== null
    ) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      const arr: any[] = [];
      //차변
      list.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          acntcd: "2110101",
          acntnm: "외상매입금",
          acntnum: "",
          acntsrtnm: "",
          advanceinfo: "0",
          amt: item.collecttotal,
          amt_1: item.collecttotal,
          amt_2: 0,
          amtunit: "",
          bankcd: "",
          closeyn: "",
          custcd: item.custcd,
          custnm: item.custnm,
          datnum: "",
          doexdiv: "",
          dptcd: "",
          drcrdiv: "1",
          enddt: "",
          indt: convertDateToStr(filters.indt),
          location: filters.location,
          notediv: "",
          notenum: "",
          orgdiv: filters.orgdiv,
          paymentnum: filters.paymentnum,
          paymentseq: 0,
          position: filters.position,
          pubbank: "",
          pubdt: "",
          pubperson: "",
          ratedt: "",
          rcvcustcd: "",
          rcvcustnm: "",
          remark1: item.custnm + " 지급",
          stdrmkcd: "",
          stdrmknm: "",
          taxnum: item.taxnum,
          wonchgrat: 0,
          rowstatus: "N",
        };

        arr.push(newDataItem);
      });
      //대변 셋팅
      var dr: any[] = [];
      list.map((item: { custcd: any }) => {
        if (!dr.includes(item.custcd)) {
          dr.push(item.custcd);
        }
      });

      for (var i = 0; i < dr.length; i++) {
        const datas = list.filter(
          (item: { custcd: any }) => item.custcd == dr[i]
        );

        var sum = 0;
        datas.map((item: { collecttotal: number }) => {
          sum += item.collecttotal;
        });

        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          acntcd: "1110130",
          acntnm: "보통예금",
          acntnum: "",
          acntsrtnm: "",
          advanceinfo: "0",
          amt: sum,
          amt_1: 0,
          amt_2: sum,
          amtunit: "",
          bankcd: "",
          closeyn: "",
          custcd: datas[0].custcd,
          custnm: datas[0].custnm,
          datnum: "",
          doexdiv: "",
          dptcd: "",
          drcrdiv: "2",
          enddt: "",
          indt: convertDateToStr(filters.indt),
          location: filters.location,
          notediv: "",
          notenum: "",
          orgdiv: filters.orgdiv,
          paymentnum: filters.paymentnum,
          paymentseq: 0,
          position: filters.position,
          pubbank: "",
          pubdt: "",
          pubperson: "",
          ratedt: "",
          rcvcustcd: "",
          rcvcustnm: "",
          remark1: datas[0].custnm + " 지급",
          stdrmkcd: "",
          stdrmknm: "",
          taxnum: "",
          wonchgrat: 0,
          rowstatus: "N",
        };

        arr.push(newDataItem);
      }

      setMainDataResult((prev) => {
        return {
          data: arr,
          total: arr.length == -1 ? 0 : arr.length,
        };
      });

      setSelectedState({ [arr[0][DATA_ITEM_KEY]]: true });
    }
  }, [filters, permissions, customOptionData]);

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
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = () => {
    if (!permissions.save) return;
    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

      let dataArr: TdataArr = {
        row_status_s: [],
        paymentseq_s: [],
        drcrdiv_s: [],
        acntcd_s: [],
        rcvcustcd_s: [],
        rcvcustnm_s: [],
        amt_s: [],
        notediv_s: [],
        notenum_s: [],
        pubdt_s: [],
        enddt_s: [],
        pubbank_s: [],
        pubperson_s: [],
        bankcd_s: [],
        acntnum_s: [],
        stdrmkcd_s: [],
        remark1_s: [],
        doexdiv_s: [],
        closeyn_s: [],
        dptcd_s: [],
        taxnum_s: [],
        advanceinfo_s: [],
        custcd_s: [],
        custnm_s: [],
        datnum_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          paymentseq = "",
          drcrdiv = "",
          acntcd = "",
          rcvcustcd = "",
          rcvcustnm = "",
          amt_1 = "",
          amt_2 = "",
          notediv = "",
          notenum = "",
          pubdt = "",
          enddt = "",
          pubbank = "",
          pubperson = "",
          bankcd = "",
          acntnum = "",
          stdrmkcd = "",
          remark1 = "",
          doexdiv = "",
          closeyn = "",
          dptcd = "",
          taxnum = "",
          advanceinfo = "",
          custcd = "",
          custnm = "",
          datnum = "",
        } = item;
        dataArr.row_status_s.push(rowstatus);
        dataArr.paymentseq_s.push(paymentseq == undefined ? 0 : paymentseq);
        dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
        dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
        dataArr.rcvcustcd_s.push(rcvcustcd == undefined ? "" : rcvcustcd);
        dataArr.rcvcustnm_s.push(rcvcustnm == undefined ? "" : rcvcustnm);
        dataArr.amt_s.push(drcrdiv == "1" ? amt_1 : amt_2);
        dataArr.notediv_s.push(notediv == undefined ? "" : notediv);
        dataArr.notenum_s.push(notenum == undefined ? "" : notenum);
        dataArr.pubdt_s.push(pubdt);
        dataArr.enddt_s.push(enddt);
        dataArr.pubbank_s.push(pubbank == undefined ? "" : pubbank);
        dataArr.pubperson_s.push(pubperson == undefined ? "" : pubperson);
        dataArr.bankcd_s.push(bankcd == undefined ? "" : bankcd);
        dataArr.acntnum_s.push(acntnum == undefined ? "" : acntnum);
        dataArr.stdrmkcd_s.push(stdrmkcd == undefined ? "" : stdrmkcd);
        dataArr.remark1_s.push(remark1 == undefined ? "" : remark1);
        dataArr.doexdiv_s.push(doexdiv == undefined ? "" : doexdiv);
        dataArr.closeyn_s.push(closeyn == undefined ? "" : closeyn);
        dataArr.dptcd_s.push(dptcd == undefined ? "" : dptcd);
        dataArr.taxnum_s.push(taxnum == undefined ? "" : taxnum);
        dataArr.advanceinfo_s.push(advanceinfo == undefined ? "" : advanceinfo);
        dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
        dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
        dataArr.datnum_s.push(datnum == undefined ? "" : datnum);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          paymentseq = "",
          drcrdiv = "",
          acntcd = "",
          rcvcustcd = "",
          rcvcustnm = "",
          amt_1 = "",
          amt_2 = "",
          notediv = "",
          notenum = "",
          pubdt = "",
          enddt = "",
          pubbank = "",
          pubperson = "",
          bankcd = "",
          acntnum = "",
          stdrmkcd = "",
          remark1 = "",
          doexdiv = "",
          closeyn = "",
          dptcd = "",
          taxnum = "",
          advanceinfo = "",
          custcd = "",
          custnm = "",
          datnum = "",
        } = item;
        dataArr.row_status_s.push(rowstatus);
        dataArr.paymentseq_s.push(paymentseq == undefined ? 0 : paymentseq);
        dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
        dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
        dataArr.rcvcustcd_s.push(rcvcustcd == undefined ? "" : rcvcustcd);
        dataArr.rcvcustnm_s.push(rcvcustnm == undefined ? "" : rcvcustnm);
        dataArr.amt_s.push(drcrdiv == "1" ? amt_1 : amt_2);
        dataArr.notediv_s.push(notediv == undefined ? "" : notediv);
        dataArr.notenum_s.push(notenum == undefined ? "" : notenum);
        dataArr.pubdt_s.push(pubdt);
        dataArr.enddt_s.push(enddt);
        dataArr.pubbank_s.push(pubbank == undefined ? "" : pubbank);
        dataArr.pubperson_s.push(pubperson == undefined ? "" : pubperson);
        dataArr.bankcd_s.push(bankcd == undefined ? "" : bankcd);
        dataArr.acntnum_s.push(acntnum == undefined ? "" : acntnum);
        dataArr.stdrmkcd_s.push(stdrmkcd == undefined ? "" : stdrmkcd);
        dataArr.remark1_s.push(remark1 == undefined ? "" : remark1);
        dataArr.doexdiv_s.push(doexdiv == undefined ? "" : doexdiv);
        dataArr.closeyn_s.push(closeyn == undefined ? "" : closeyn);
        dataArr.dptcd_s.push(dptcd == undefined ? "" : dptcd);
        dataArr.taxnum_s.push(taxnum == undefined ? "" : taxnum);
        dataArr.advanceinfo_s.push(advanceinfo == undefined ? "" : advanceinfo);
        dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
        dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
        dataArr.datnum_s.push(datnum == undefined ? "" : datnum);
      });

      setParaData((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: filters.orgdiv,
        paymentnum: filters.paymentnum,
        indt: convertDateToStr(filters.indt),
        location: filters.location,
        position: filters.position,
        row_status_s: dataArr.row_status_s.join("|"),
        paymentseq_s: dataArr.paymentseq_s.join("|"),
        drcrdiv_s: dataArr.drcrdiv_s.join("|"),
        acntcd_s: dataArr.acntcd_s.join("|"),
        rcvcustcd_s: dataArr.rcvcustcd_s.join("|"),
        rcvcustnm_s: dataArr.rcvcustnm_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        notediv_s: dataArr.notediv_s.join("|"),
        notenum_s: dataArr.notenum_s.join("|"),
        pubdt_s: dataArr.pubdt_s.join("|"),
        enddt_s: dataArr.enddt_s.join("|"),
        pubbank_s: dataArr.pubbank_s.join("|"),
        pubperson_s: dataArr.pubperson_s.join("|"),
        bankcd_s: dataArr.bankcd_s.join("|"),
        acntnum_s: dataArr.acntnum_s.join("|"),
        stdrmkcd_s: dataArr.stdrmkcd_s.join("|"),
        remark1_s: dataArr.remark1_s.join("|"),
        doexdiv_s: dataArr.doexdiv_s.join("|"),
        closeyn_s: dataArr.closeyn_s.join("|"),
        dptcd_s: dataArr.dptcd_s.join("|"),
        taxnum_s: dataArr.taxnum_s.join("|"),
        advanceinfo_s: dataArr.advanceinfo_s.join("|"),
        custcd_s: dataArr.custcd_s.join("|"),
        custnm_s: dataArr.custnm_s.join("|"),
        datnum_s: dataArr.datnum_s.join("|"),
      }));
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    location: "",
    position: "",
    indt: "",
    paymentnum: "",
    row_status_s: "",
    paymentseq_s: "",
    drcrdiv_s: "",
    acntcd_s: "",
    rcvcustcd_s: "",
    rcvcustnm_s: "",
    amt_s: "",
    notediv_s: "",
    notenum_s: "",
    pubdt_s: "",
    enddt_s: "",
    pubbank_s: "",
    pubperson_s: "",
    bankcd_s: "",
    acntnum_s: "",
    stdrmkcd_s: "",
    remark1_s: "",
    doexdiv_s: "",
    closeyn_s: "",
    dptcd_s: "",
    taxnum_s: "",
    advanceinfo_s: "",
    custcd_s: "",
    custnm_s: "",
    datnum_s: "",
  });

  //삭제 프로시저 파라미터
  const para: Iparameters = {
    procedureName: "P_MA_A8000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_position": ParaData.position,
      "@p_indt": ParaData.indt,
      "@p_paymentnum": ParaData.paymentnum,
      "@p_row_status_s": ParaData.row_status_s,
      "@p_paymentseq_s": ParaData.paymentseq_s,
      "@p_drcrdiv_s": ParaData.drcrdiv_s,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_rcvcustcd_s": ParaData.rcvcustcd_s,
      "@p_rcvcustnm_s": ParaData.rcvcustnm_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_notediv_s": ParaData.notediv_s,
      "@p_notenum_s": ParaData.notenum_s,
      "@p_pubdt_s": ParaData.pubdt_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_pubbank_s": ParaData.pubbank_s,
      "@p_pubperson_s": ParaData.pubperson_s,
      "@p_bankcd_s": ParaData.bankcd_s,
      "@p_acntnum_s": ParaData.acntnum_s,
      "@p_stdrmkcd_s": ParaData.stdrmkcd_s,
      "@p_remark1_s": ParaData.remark1_s,
      "@p_doexdiv_s": ParaData.doexdiv_s,
      "@p_closeyn_s": ParaData.closeyn_s,
      "@p_dptcd_s": ParaData.dptcd_s,
      "@p_taxnum_s": ParaData.taxnum_s,
      "@p_advanceinfo_s": ParaData.advanceinfo_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_datnum_s": ParaData.datnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A8000W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      reload(data.returnString);
      deletedMainRows = [];
      if (ParaData.workType == "N") {
        setVisible(false);
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
      }
      setParaData({
        workType: "",
        orgdiv: "",
        location: "",
        position: "",
        indt: "",
        paymentnum: "",
        row_status_s: "",
        paymentseq_s: "",
        drcrdiv_s: "",
        acntcd_s: "",
        rcvcustcd_s: "",
        rcvcustnm_s: "",
        amt_s: "",
        notediv_s: "",
        notenum_s: "",
        pubdt_s: "",
        enddt_s: "",
        pubbank_s: "",
        pubperson_s: "",
        bankcd_s: "",
        acntnum_s: "",
        stdrmkcd_s: "",
        remark1_s: "",
        doexdiv_s: "",
        closeyn_s: "",
        dptcd_s: "",
        taxnum_s: "",
        advanceinfo_s: "",
        custcd_s: "",
        custnm_s: "",
        datnum_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
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
    if (
      field != "rowstatus" &&
      field != "stdrmknm" &&
      field != "acntnm" &&
      field != "custnm" &&
      field != "acntsrtnum" &&
      field != "taxnum"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
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
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                chk:
                  typeof item.chk == "boolean"
                    ? item.chk
                    : item.chk == "Y"
                    ? true
                    : false,
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
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

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
      acntsrtnm: "",
      advanceinfo: "0",
      amt: 0,
      amt_1: 0,
      amt_2: 0,
      amtunit: "",
      bankcd: "",
      closeyn: "",
      custcd:
        workType == "N" ? (cust.length > 0 ? cust[0].custcd : "") : data.custcd,
      custnm:
        workType == "N" ? (cust.length > 0 ? cust[0].custnm : "") : data.custnm,
      datnum: "",
      doexdiv: "",
      dptcd: "",
      drcrdiv: "1",
      enddt: "",
      indt: convertDateToStr(filters.indt),
      location: filters.location,
      notediv: "",
      notenum: "",
      orgdiv: filters.orgdiv,
      paymentnum: filters.paymentnum,
      paymentseq: 0,
      position: filters.position,
      pubbank: "",
      pubdt: "",
      pubperson: "",
      ratedt: "",
      rcvcustcd: "",
      rcvcustnm: "",
      remark1: "",
      stdrmkcd: "",
      stdrmknm: "",
      taxnum: "",
      wonchgrat: 0,
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

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object3) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const setDatas = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    data.map((item: any) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        acntcd: item.acntcd,
        acntnm: item.acntnm,
        acntnum: "",
        acntsrtnm: "",
        advanceinfo: "0",
        amt: item.janamt,
        amt_1: item.janamt,
        amt_2: 0,
        amtunit: item.amtunit,
        bankcd: "",
        closeyn: "",
        custcd: item.custcd,
        custnm: item.custnm,
        datnum: item.datnum,
        doexdiv: "",
        dptcd: "",
        drcrdiv: "1",
        enddt: "",
        indt: convertDateToStr(filters.indt),
        location: filters.location,
        notediv: "",
        notenum: "",
        orgdiv: filters.orgdiv,
        paymentnum: filters.paymentnum,
        paymentseq: 0,
        position: filters.position,
        pubbank: "",
        pubdt: "",
        pubperson: "",
        ratedt: "",
        rcvcustcd: "",
        rcvcustnm: "",
        remark1: item.custnm + " 지급",
        stdrmkcd: "",
        stdrmknm: "",
        taxnum: "",
        wonchgrat: 0,
        rowstatus: "N",
      };

      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });

      const newDataItem2 = {
        [DATA_ITEM_KEY]: ++temp,
        acntcd: "1110130",
        acntnm: "보통예금",
        acntnum: "",
        acntsrtnm: "",
        advanceinfo: "0",
        amt: item.janamt,
        amt_1: 0,
        amt_2: item.janamt,
        amtunit: item.amtunit,
        bankcd: "",
        closeyn: "",
        custcd: item.custcd,
        custnm: item.custnm,
        datnum: item.datnum,
        doexdiv: "",
        dptcd: "",
        drcrdiv: "2",
        enddt: "",
        indt: convertDateToStr(filters.indt),
        location: filters.location,
        notediv: "",
        notenum: "",
        orgdiv: filters.orgdiv,
        paymentnum: filters.paymentnum,
        paymentseq: 0,
        position: filters.position,
        pubbank: "",
        pubdt: "",
        pubperson: "",
        ratedt: "",
        rcvcustcd: "",
        rcvcustnm: "",
        remark1: item.custnm + " 지급",
        stdrmkcd: "",
        stdrmknm: "",
        taxnum: "",
        wonchgrat: 0,
        rowstatus: "N",
      };

      setMainDataResult((prev) => {
        return {
          data: [newDataItem2, ...prev.data],
          total: prev.total + 1,
        };
      });
      setSelectedState({ [newDataItem2[DATA_ITEM_KEY]]: true });
    });
  };

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            acntcd: acntcd,
            acntnm: acntnm,
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
  }, [acntcd, acntnm]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
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
  }, [custcd, custnm]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            acntcd: acntcd,
            acntnm: acntnm,
            stdrmkcd: stdrmkcd,
            stdrmknm: stdrmknm,
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
  }, [stdrmkcd, stdrmknm]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            acntsrtnm: acntsrtnm,
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
  }, [acntsrtnm, acntnum]);

  return (
    <>
      <Window
        titles={workType == "N" ? "지급처리생성" : "지급처리수정"}
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
                className="WindowFormBoxWrap"
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
                      <th>지급번호</th>
                      <td>
                        <Input
                          name="paymentnum"
                          type="text"
                          value={filters.paymentnum}
                          className="readonly"
                        />
                      </td>
                      <th>일자</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="indt"
                            value={filters.indt}
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
            </SwiperSlide>
            <SwiperSlide key={1}>
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
                    custcd,
                    custnm,
                    setCustcd,
                    setCustnm,
                    mainDataState,
                    setMainDataState,
                    // fetchGrid,
                  }}
                >
                  <FormContext3.Provider
                    value={{
                      stdrmkcd,
                      stdrmknm,
                      acntcd,
                      acntnm,
                      setAcntcd,
                      setAcntnm,
                      setStdrmkcd,
                      setStdrmknm,
                      mainDataState,
                      setMainDataState,
                      // fetchGrid,
                    }}
                  >
                    <FormContext4.Provider
                      value={{
                        acntsrtnm,
                        acntnum,
                        setAcntsrtnm,
                        setAcntnum,
                        mainDataState,
                        setMainDataState,
                        // fetchGrid,
                      }}
                    >
                      <GridContainer>
                        <GridTitleContainer className="WindowButtonContainer">
                          <GridTitle>기본정보</GridTitle>
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
                                themeColor={"primary"}
                                onClick={onDetailClick}
                                icon="folder-open"
                                disabled={permissions.save ? false : true}
                              >
                                기초잔액
                              </Button>
                              <Button
                                onClick={onAddClick}
                                themeColor={"primary"}
                                icon="plus"
                                title="행 추가"
                                disabled={permissions.save ? false : true}
                              ></Button>
                              <Button
                                onClick={onDeleteClick}
                                fillMode="outline"
                                themeColor={"primary"}
                                icon="minus"
                                title="행 삭제"
                                disabled={permissions.save ? false : true}
                              ></Button>
                            </div>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <Grid
                          style={{ height: mobileheight2 }}
                          data={process(
                            mainDataResult.data.map((row) => ({
                              ...row,
                              rowstatus:
                                row.rowstatus == null ||
                                row.rowstatus == "" ||
                                row.rowstatus == undefined
                                  ? ""
                                  : row.rowstatus,
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
                          onItemChange={onMainItemChange}
                          cellRender={customCellRender}
                          rowRender={customRowRender}
                          editField={EDIT_FIELD}
                        >
                          <GridColumn
                            field="rowstatus"
                            title=" "
                            width="50px"
                          />
                          <GridColumn
                            field="drcrdiv"
                            title="차대구분"
                            width="150px"
                            cell={CustomRadioCell}
                            footerCell={mainTotalFooterCell}
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
                            field="stdrmkcd"
                            title="단축코드"
                            width="120px"
                            cell={ColumnCommandCell3}
                          />
                          <GridColumn
                            field="acntcd"
                            title="계정과목코드"
                            width="120px"
                            cell={ColumnCommandCell}
                          />
                          <GridColumn
                            field="stdrmknm"
                            title="단축명"
                            width="120px"
                          />
                          <GridColumn
                            field="acntnm"
                            title="계정과목명"
                            width="120px"
                          />
                          <GridColumn
                            field="custcd"
                            title="업체코드"
                            width="120px"
                            cell={ColumnCommandCell2}
                          />
                          <GridColumn
                            field="custnm"
                            title="업체명"
                            width="120px"
                          />
                          <GridColumn
                            field="acntnum"
                            title="예적금코드"
                            width="120px"
                            cell={ColumnCommandCell4}
                          />
                          <GridColumn
                            field="acntsrtnm"
                            title="예적금명"
                            width="120px"
                          />
                          <GridColumn
                            field="remark1"
                            title="적요"
                            width="200px"
                          />
                          <GridColumn
                            field="taxnum"
                            title="계산서번호"
                            width="150px"
                          />
                          <GridColumn
                            field="notenum"
                            title="어음번호"
                            width="150px"
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
                        </Grid>
                        <BottomContainer className="BottomContainer">
                          <ButtonContainer>
                            {permissions.save && (
                              <Button
                                themeColor={"primary"}
                                onClick={selectData}
                              >
                                저장
                              </Button>
                            )}
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
                    </FormContext4.Provider>
                  </FormContext3.Provider>
                </FormContext2.Provider>
              </FormContext.Provider>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <FormBoxWrap className="WindowFormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>지급번호</th>
                    <td>
                      <Input
                        name="paymentnum"
                        type="text"
                        value={filters.paymentnum}
                        className="readonly"
                      />
                    </td>
                    <th>일자</th>
                    <td>
                      <div className="filter-item-wrap">
                        <DatePicker
                          name="indt"
                          value={filters.indt}
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
                  custcd,
                  custnm,
                  setCustcd,
                  setCustnm,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <FormContext3.Provider
                  value={{
                    stdrmkcd,
                    stdrmknm,
                    acntcd,
                    acntnm,
                    setAcntcd,
                    setAcntnm,
                    setStdrmkcd,
                    setStdrmknm,
                    mainDataState,
                    setMainDataState,
                    // fetchGrid,
                  }}
                >
                  <FormContext4.Provider
                    value={{
                      acntsrtnm,
                      acntnum,
                      setAcntsrtnm,
                      setAcntnum,
                      mainDataState,
                      setMainDataState,
                      // fetchGrid,
                    }}
                  >
                    <GridContainer>
                      <GridTitleContainer className="WindowButtonContainer">
                        <GridTitle>기본정보</GridTitle>
                        <ButtonContainer>
                          <Button
                            themeColor={"primary"}
                            onClick={onDetailClick}
                            icon="folder-open"
                            disabled={permissions.save ? false : true}
                          >
                            기초잔액
                          </Button>
                          <Button
                            onClick={onAddClick}
                            themeColor={"primary"}
                            icon="plus"
                            title="행 추가"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onDeleteClick}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="minus"
                            title="행 삭제"
                            disabled={permissions.save ? false : true}
                          ></Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <Grid
                        style={{ height: webheight }}
                        data={process(
                          mainDataResult.data.map((row) => ({
                            ...row,
                            rowstatus:
                              row.rowstatus == null ||
                              row.rowstatus == "" ||
                              row.rowstatus == undefined
                                ? ""
                                : row.rowstatus,
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
                        onItemChange={onMainItemChange}
                        cellRender={customCellRender}
                        rowRender={customRowRender}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        <GridColumn
                          field="drcrdiv"
                          title="차대구분"
                          width="150px"
                          cell={CustomRadioCell}
                          footerCell={mainTotalFooterCell}
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
                          field="stdrmkcd"
                          title="단축코드"
                          width="120px"
                          cell={ColumnCommandCell3}
                        />
                        <GridColumn
                          field="acntcd"
                          title="계정과목코드"
                          width="120px"
                          cell={ColumnCommandCell}
                        />
                        <GridColumn
                          field="stdrmknm"
                          title="단축명"
                          width="120px"
                        />
                        <GridColumn
                          field="acntnm"
                          title="계정과목명"
                          width="120px"
                        />
                        <GridColumn
                          field="custcd"
                          title="업체코드"
                          width="120px"
                          cell={ColumnCommandCell2}
                        />
                        <GridColumn
                          field="custnm"
                          title="업체명"
                          width="120px"
                        />
                        <GridColumn
                          field="acntnum"
                          title="예적금코드"
                          width="120px"
                          cell={ColumnCommandCell4}
                        />
                        <GridColumn
                          field="acntsrtnm"
                          title="예적금명"
                          width="120px"
                        />
                        <GridColumn
                          field="remark1"
                          title="적요"
                          width="200px"
                        />
                        <GridColumn
                          field="taxnum"
                          title="계산서번호"
                          width="150px"
                        />
                        <GridColumn
                          field="notenum"
                          title="어음번호"
                          width="150px"
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
                      </Grid>
                    </GridContainer>
                  </FormContext4.Provider>
                </FormContext3.Provider>
              </FormContext2.Provider>
            </FormContext.Provider>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                {permissions.save && (
                  <Button themeColor={"primary"} onClick={selectData}>
                    저장
                  </Button>
                )}
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
      {DetailWindowVisible && (
        <MA_A8000W_Acnt_Window
          setVisible={setDetailWindowVisible}
          setData={setDatas}
          custcd={workType == "N" ? undefined : data.custcd}
          pathname={pathname}
        />
      )}
    </>
  );
};

export default CopyWindow;
