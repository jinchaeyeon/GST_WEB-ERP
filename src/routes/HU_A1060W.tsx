import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
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
import { Splitter, SplitterOnChangeEvent } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  dateformat,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  getPrsnnumQuery,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import FileViewers from "../components/Viewer/FileViewers";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/HU_A1060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var index = 0;

interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

type TRowsArr = {
  rowstatus_s: string[];
  datnum_s: string[];
  pubdt_s: string[];
  prsnnum_s: string[];
  kind_s: string[];
  postcd_s: string[];
  dptcd_s: string[];
  usekind_s: string[];
};

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const dateField = ["pubdt"];
const requiredField = ["pubdt", "prsnnum", "kind"];
const customComboField = ["kind", "usekind", "dptcd", "postcd"];
const commandField = ["prsnnum"];
let temp = 0;
let deletedMainRows: object[] = [];

export const FormContext = createContext<{
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  postcd: string;
  setPrsnnum: (d: any) => void;
  setPrsnnm: (d: any) => void;
  setDptcd: (d: any) => void;
  setPostcd: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
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
    prsnnum,
    prsnnm,
    dptcd,
    postcd,
    setPrsnnum,
    setPrsnnm,
    setDptcd,
    setPostcd,
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

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    if (dataItem["rowstatus"] == "N") {
      setuserWindowVisible(true);
    } else {
      alert("사번은 수정이 불가합니다.");
    }
  };

  const setUserData = (data: IPrsnnum) => {
    setPrsnnm(data.prsnnm);
    setPrsnnum(data.prsnnum);
    setDptcd(data.dptcd);
    setPostcd(data.postcd);
  };
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit && dataItem.rowstatus == "N" ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onUserWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_HU060, L_dptcd_001, L_HU005, L_HU061",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "kind"
      ? "L_HU060"
      : field == "usekind"
      ? "L_HU061"
      : field == "postcd"
      ? "L_HU005"
      : field == "dptcd"
      ? "L_dptcd_001"
      : "";

  const valueField = field == "dptcd" ? "dptcd" : undefined;
  const textField = field == "dptcd" ? "dptnm" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

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

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const HU_A1060W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".TitleContainer");
      height4 = getHeight(".FormBoxWrap");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height3);
        setMobileHeight2(getDeviceHeight(true) - height2 - height3);
        setWebHeight(getDeviceHeight(true) - height - height3);
        setWebHeight2(getDeviceHeight(true) - height2 - height3 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const pc = UseGetValueFromSessionItem("pc");

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
        kind: defaultOption.find((item: any) => item.id == "kind")?.valueCode,
        isSearch: true,
      }));

      setFilters2((prev) => ({
        ...prev,
        radType: defaultOption.find((item: any) => item.id == "radType")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [prsnnm, setPrsnnm] = useState<string>("");
  const [prsnnum, setPrsnnum] = useState<string>("");
  const [dptcd, setDptcd] = useState<string>("");
  const [postcd, setPostcd] = useState<string>("");

  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setUrl("");
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "문서 리스트";
      _export.save(optionsGridOne);
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    prsnnum: "",
    prsnnm: "",
    kind: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    datnum: "",
    kind: "",
    radType: "",
    isSearch: false,
  });

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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "list",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_kind": filters.kind,
        "@p_find_row_value": filters.find_row_value,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.datnum == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.datnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            datnum: selectedRow.datnum,
            kind: selectedRow.kind,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            datnum: rows[0].datnum,
            kind: rows[0].kind,
            isSearch: true,
          }));
        }
      } else {
        setUrl("");
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

  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };
  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.prsnnum,
      prsnnm: data.prsnnm,
    }));
  };

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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    if (selectedRowData.rowstatus != "N") {
      setFilters2((prev) => ({
        ...prev,
        datnum: selectedRowData.datnum,
        kind: selectedRowData.kind,
        isSearch: true,
      }));
    } else {
      setUrl("");
    }
    if (swiper && isMobile) {
      swiper.slideTo(1);
      swiper.update();
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const [horizontalPanes, setHorizontalPanes] = React.useState<Array<any>>([
    { size: "50%", min: "20%" },
    {},
  ]);

  const onHorizontalChange = (event: SplitterOnChangeEvent) => {
    setHorizontalPanes(event.newState);
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
      field != "datnum" &&
      field != "prsnnm" &&
      field != "postcd" &&
      field != "dptcd" &&
      dataItem.rowstatus == "N"
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
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
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
      if (editedField == "prsnnum") {
        mainDataResult.data.map(
          async (item: { [x: string]: any; prsnnum: any }) => {
            if (editIndex == item[DATA_ITEM_KEY]) {
              const prsnnum = await fetchPrsnnumData(item.prsnnum);
              if (prsnnum != null && prsnnum != undefined) {
                const newData = mainDataResult.data.map((item) =>
                  item[DATA_ITEM_KEY] ==
                  Object.getOwnPropertyNames(selectedState)[0]
                    ? {
                        ...item,
                        prsnnum: prsnnum.prsnnum,
                        prsnnm: prsnnum.prsnnm,
                        postcd: prsnnum.postcd,
                        dptcd: prsnnum.dptcd,
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
                const newData = mainDataResult.data.map((item) =>
                  item[DATA_ITEM_KEY] ==
                  Object.getOwnPropertyNames(selectedState)[0]
                    ? {
                        ...item,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        prsnnm: "",
                        postcd: "",
                        dptcd: "",
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
              }
            }
          }
        );
      } else {
        const newData = mainDataResult.data.map(
          (item: { [x: string]: string; rowstatus: string }) =>
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
      }
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

  const fetchPrsnnumData = async (prsnnum: string) => {
    if (!permissions.view) return;
    if (prsnnum == "") return;
    let data: any;
    let prsnnumInfo: any = null;

    const queryStr = getPrsnnumQuery(prsnnum);
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
      if (rows.length > 0) {
        prsnnumInfo = {
          prsnnum: rows[0].prsnnum,
          prsnnm: rows[0].prsnnm,
          postcd: rows[0].postcd,
          dptcd: rows[0].dptcd,
        };
      }
    }

    return prsnnumInfo;
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      datnum: "",
      dptcd: "",
      kind: "",
      orgdiv: sessionOrgdiv,
      perregnum: "",
      postcd: "",
      prsnnm: "",
      prsnnum: "",
      pubdt: convertDateToStr(new Date()),
      salt: "",
      usekind: "",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem.num]: true });
    setUrl("");
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data: any;

    if (mainDataResult.total > 0) {
      const select = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      if (select.rowstatus != "N") {
        alert("이미 저장된 내용은 삭제가 불가능합니다.");
      } else {
        mainDataResult.data.forEach((item: any, index: number) => {
          if (!selectedState[item[DATA_ITEM_KEY]]) {
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
            Object3.push(index);
          }
        });
        if (Math.min(...Object3) < Math.min(...Object2)) {
          data = mainDataResult.data[Math.min(...Object2)];
        } else {
          data = mainDataResult.data[Math.min(...Object3) - 1];
        }

        //newData 생성
        setMainDataResult((prev) => ({
          data: newData,
          total: prev.total - Object3.length,
        }));
        setSelectedState({
          [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
        });
        if (data != undefined) {
          setFilters2((prev) => ({
            ...prev,
            datnum: data.datnum,
            kind: data.kind,
            isSearch: true,
          }));
        } else {
          setFilters2((prev) => ({
            ...prev,
            datnum: newData[0].datnum,
            kind: newData[0].kind,
            isSearch: true,
          }));
        }
      }
    }
  };

  //FormContext로 받아온 데이터 set
  useEffect(() => {
    if (prsnnum != "") {
      const newData = mainDataResult.data.map((item) =>
        item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              prsnnm: prsnnm,
              prsnnum: prsnnum,
              dptcd: dptcd,
              postcd: postcd,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
            }
          : {
              ...item,
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
      setPrsnnum("");
      setPrsnnm("");
      setDptcd("");
      setPostcd("");
    }
  }, [prsnnm, prsnnum, dptcd, postcd]);

  const [url, setUrl] = useState("");

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const parameters = {
      para: `document-json?id=${
        filters2.kind == "1"
          ? "S2024E812FB"
          : filters2.kind == "2"
          ? "S20241AC071"
          : "S202425B48F"
      }`,
      "@p_orgdiv": filters.orgdiv,
      "@p_datnum": filters2.datnum,
      "@p_radtype": filters2.radType,
    };

    try {
      data = await processApi<any>("excel-view", parameters);
    } catch (error) {
      data = null;
    }

    if (data != null) {
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      setUrl(URL.createObjectURL(blob));
    } else {
      //데이터 없을 경우
      setUrl("");
    }

    setLoading(false);
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters2((prev) => ({
      ...prev,
      [name]: value,
      isSearch: true,
    }));
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    if (!window.confirm("한번 생성하면 삭제하지 못합니다. 생성하시겠습니까?")) {
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any) => {
      return item.rowstatus == "N" && item.rowstatus !== undefined;
    });

    let valid = true;

    dataItem.map((item) => {
      if (item.pubdt == "" || item.prsnnum == "" || item.kind == "") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return false;
    }

    if (dataItem.length == 0) return false;

    let rowsArr: TRowsArr = {
      rowstatus_s: [],
      datnum_s: [],
      pubdt_s: [],
      prsnnum_s: [],
      kind_s: [],
      postcd_s: [],
      dptcd_s: [],
      usekind_s: [],
    };

    dataItem.forEach((item: any) => {
      const {
        rowstatus = "",
        datnum = "",
        pubdt = "",
        prsnnum = "",
        kind = "",
        postcd = "",
        dptcd = "",
        usekind = "",
      } = item;

      rowsArr.rowstatus_s.push(rowstatus);
      rowsArr.datnum_s.push(datnum);
      rowsArr.pubdt_s.push(pubdt == "99991231" ? "" : pubdt);
      rowsArr.prsnnum_s.push(prsnnum);
      rowsArr.kind_s.push(kind);
      rowsArr.postcd_s.push(postcd);
      rowsArr.dptcd_s.push(dptcd);
      rowsArr.usekind_s.push(usekind);
    });

    setParaSaved((prev) => ({
      ...prev,
      workType: "N",
      rowstatus_s: rowsArr.rowstatus_s.join("|"),
      datnum_s: rowsArr.datnum_s.join("|"),
      pubdt_s: rowsArr.pubdt_s.join("|"),
      prsnnum_s: rowsArr.prsnnum_s.join("|"),
      kind_s: rowsArr.kind_s.join("|"),
      postcd_s: rowsArr.postcd_s.join("|"),
      dptcd_s: rowsArr.dptcd_s.join("|"),
      usekind_s: rowsArr.usekind_s.join("|"),
    }));
  };

  // 저장 파라미터 초기값
  const [paraSaved, setParaSaved] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    datnum_s: "",
    pubdt_s: "",
    prsnnum_s: "",
    kind_s: "",
    postcd_s: "",
    dptcd_s: "",
    usekind_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A1060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraSaved.workType,
      "@p_orgdiv": paraSaved.orgdiv,
      "@p_rowstatus_s": paraSaved.rowstatus_s,
      "@p_datnum_s": paraSaved.datnum_s,
      "@p_pubdt_s": paraSaved.pubdt_s,
      "@p_prsnnum_s": paraSaved.prsnnum_s,
      "@p_kind_s": paraSaved.kind_s,
      "@p_postcd_s": paraSaved.postcd_s,
      "@p_dptcd_s": paraSaved.dptcd_s,
      "@p_usekind_s": paraSaved.usekind_s,
      "@p_form_id": "HA_A1060W",
      "@p_pc": pc,
      "@p_userid": userId,
      "@p_company_code": companyCode,
    },
  };

  useEffect(() => {
    if (paraSaved.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [paraSaved, permissions]);

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
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: 1,
        isSearch: true,
      }));

      setParaSaved({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        datnum_s: "",
        pubdt_s: "",
        prsnnum_s: "",
        kind_s: "",
        postcd_s: "",
        dptcd_s: "",
        usekind_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const [state, setState] = useState(true);

  const onClick = () => {
    if (state == true) {
      setHorizontalPanes([{ size: "100%", min: "20%" }, {}]);
    } else {
      setHorizontalPanes([{ size: "50%", min: "20%" }, {}]);
    }
    setState(!state);
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
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
              <th>발행일자</th>
              <td>
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
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>종류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="kind"
                    value={filters.kind}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer style={{ width: "100%" }}>
                <FormContext.Provider
                  value={{
                    prsnnum,
                    prsnnm,
                    dptcd,
                    postcd,
                    setPrsnnum,
                    setPrsnnm,
                    setDptcd,
                    setPostcd,
                    mainDataState,
                    setMainDataState,
                    // fetchGrid,
                  }}
                >
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>문서 리스트</GridTitle>
                    <ButtonContainer>
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
                      <Button
                        onClick={onSaveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          pubdt: row.pubdt
                            ? new Date(dateformat(row.pubdt))
                            : new Date(dateformat("99991231")),
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
                      onSelectionChange={onSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
                      skip={page.skip}
                      take={page.take}
                      pageable={true}
                      onPageChange={pageChange}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef}
                      rowHeight={30}
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
                        editable={false}
                      />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, idx: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={idx}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    customComboField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : commandField.includes(item.fieldName)
                                      ? ColumnCommandCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </FormContext.Provider>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer style={{ width: "100%" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      style={{ marginRight: "5px" }}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                  <GridTitle>출력물</GridTitle>
                  <FormBoxWrap>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>주민등록번호 구분</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionRadioGroup
                                name="radType"
                                customOptionData={customOptionData}
                                changeData={filterRadioChange}
                              />
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridTitleContainer>
                <div
                  style={{
                    height: mobileheight2,
                  }}
                >
                  {url != "" ? (
                    <FileViewers fileUrl={url} isMobile={isMobile} />
                  ) : (
                    ""
                  )}
                </div>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <Splitter panes={horizontalPanes} onChange={onHorizontalChange}>
            <GridContainer>
              <FormContext.Provider
                value={{
                  prsnnum,
                  prsnnm,
                  dptcd,
                  postcd,
                  setPrsnnum,
                  setPrsnnm,
                  setDptcd,
                  setPostcd,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>문서 리스트</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onClick}
                      fillMode="outline"
                      themeColor={"primary"}
                    >
                      결재문서접기/펼치기
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
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        pubdt: row.pubdt
                          ? new Date(dateformat(row.pubdt))
                          : new Date(dateformat("99991231")),
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
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
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
                      editable={false}
                    />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  customComboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : commandField.includes(item.fieldName)
                                    ? ColumnCommandCell
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </FormContext.Provider>
            </GridContainer>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>출력물</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: "20%" }}>주민등록번호 구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="radType"
                            customOptionData={customOptionData}
                            changeData={filterRadioChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <div
                style={{
                  height: webheight2,
                }}
              >
                {url != "" ? (
                  <FileViewers fileUrl={url} isMobile={isMobile} />
                ) : (
                  ""
                )}
              </div>
            </GridContainer>
          </Splitter>
        </>
      )}
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
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

export default HU_A1060W;
