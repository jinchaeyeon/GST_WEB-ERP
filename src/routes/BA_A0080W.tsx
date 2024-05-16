import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import ExcelUploadButtons from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NameCell from "../components/Cells/NameCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getGridItemChangedData,
  getItemQuery,
  getQueryFromBizComponent,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CopyWindow from "../components/Windows/BA_A0080W_Copy_Window";
import CopyWindow2 from "../components/Windows/BA_A0080W_UnitCopy_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { heightstate, isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/BA_A0080W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

let temp = 0;
export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

let itemacnt2 = "";
type TItemInfo = {
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
};

const defaultItemInfo = {
  itemcd: "",
  itemno: "",
  itemnm: "",
  insiz: "",
  model: "",
  itemacnt: "",
  itemacntnm: "",
  bnatur: "",
  spec: "",
  invunit: "",
  invunitnm: "",
  unitwgt: "",
  wgtunit: "",
  wgtunitnm: "",
  maker: "",
  dwgno: "",
  remark: "",
  itemlvl1: "",
  itemlvl2: "",
  itemlvl3: "",
  extra_field1: "",
  extra_field2: "",
  extra_field7: "",
  extra_field6: "",
  extra_field8: "",
  packingsiz: "",
  unitqty: "",
  color: "",
  gubun: "",
  qcyn: "",
  outside: "",
  itemthick: "",
  itemlvl4: "",
  itemlvl5: "",
  custitemnm: "",
};

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
const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "sub_code";
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

const DateField = ["recdt"];
const CommandField = ["itemcd"];
const NumberField = ["unp"];
const CustomComboField = ["itemacnt", "amtunit"];
const requiredField = ["itemcd", "unp", "recdt"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 화폐단위, 품목계정
  UseBizComponent("L_BA020,L_BA061", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "itemacnt" ? "L_BA061" : field == "amtunit" ? "L_BA020" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

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
  const { setItemInfo } = useContext(FormContext);
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

  const [itemWindowVisible2, setItemWindowVisible2] = useState<boolean>(false);

  const onItemWndClick2 = () => {
    setItemWindowVisible2(true);
  };

  const setItemData2 = (data: IItemData) => {
    setItemInfo((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
      itemacnt: itemacnt2,
    }));
  };
  //BA_A0080W에만 사용
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {dataItem["rowstatus"] == "N" ? (
        <>
          {isInEdit ? (
            <Input value={value} onChange={handleChange} type="text" />
          ) : (
            value
          )}
          <ButtonInGridInput>
            <Button
              name="itemcd"
              onClick={onItemWndClick2}
              icon="more-horizontal"
              fillMode="flat"
            />
          </ButtonInGridInput>
        </>
      ) : (
        value
      )}
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {itemWindowVisible2 && (
        <ItemsWindow
          setVisible={setItemWindowVisible2}
          workType={"ROW_ADD"}
          setData={setItemData2}
          modal={true}
        />
      )}
    </>
  );
};

const BA_A0080: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });

    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage(initialPageState);
  };
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  //FormContext에서 받아오기위해 state
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  let deviceWidth = window.innerWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = 0;
  var height2 = 0;
  var container = document.querySelector(".ButtonContainer");
  var container2 = document.querySelector(".ButtonContainer2");
  if (container?.clientHeight != undefined) {
    height = container == undefined ? 0 : container.clientHeight;
  }
  if (container2?.clientHeight != undefined) {
    height2 = container2 == undefined ? 0 : container2.clientHeight;
  }
  let isMobile = deviceWidth <= 1200;
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("BA_A0080W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("BA_A0080W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setSubFilters((prev) => ({
        ...prev,
        unpitem: defaultOption.find((item: any) => item.id == "unpitem")
          ?.valueCode,
        amtunit: defaultOption.find((item: any) => item.id == "amtunit")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015, L_BA171, L_BA172, L_BA173",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA173")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );

      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
    }
  }, [bizComponentData]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] ==
      parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            itemcd: itemInfo.itemcd,
            itemno: itemInfo.itemno,
            itemnm: itemInfo.itemnm,
            insiz: itemInfo.insiz,
            itemacnt: itemInfo.itemacnt,
            model: itemInfo.model,
            bnatur: itemInfo.bnatur,
            spec: itemInfo.spec,
            //invunit
            qtyunit: itemInfo.invunit,
            invunitnm: itemInfo.invunitnm,
            unitwgt: itemInfo.unitwgt,
            wgtunit: itemInfo.wgtunit,
            wgtunitnm: itemInfo.wgtunitnm,
            maker: itemInfo.maker,
            dwgno: itemInfo.dwgno,
            remark: itemInfo.remark,
            itemlvl1: itemInfo.itemlvl1,
            itemlvl2: itemInfo.itemlvl2,
            itemlvl3: itemInfo.itemlvl3,
            extra_field1: itemInfo.extra_field1,
            extra_field2: itemInfo.extra_field2,
            extra_field7: itemInfo.extra_field7,
            extra_field6: itemInfo.extra_field6,
            extra_field8: itemInfo.extra_field8,
            packingsiz: itemInfo.packingsiz,
            unitqty: itemInfo.unitqty,
            color: itemInfo.color,
            gubun: itemInfo.gubun,
            qcyn: itemInfo.qcyn,
            outside: itemInfo.outside,
            itemthick: itemInfo.itemthick,
            itemlvl4: itemInfo.itemlvl4,
            itemlvl5: itemInfo.itemlvl5,
            custitemnm: itemInfo.custitemnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
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
  }, [itemInfo]);

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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [CopyWindowVisible, setCopyWindowVisible] = useState<boolean>(false);
  const [CopyWindowVisible2, setCopyWindowVisible2] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    unpitem: "SYS01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    amtunit: "KRW",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0080W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": subfilters.orgdiv,
        "@p_itemcd": subfilters.itemcd,
        "@p_itemnm": subfilters.itemnm,
        "@p_insiz": subfilters.insiz,
        "@p_itemacnt": filters.itemacnt,
        "@p_unpitem": subfilters.unpitem,
        "@p_amtunit": subfilters.amtunit,
        "@p_company_code ": companyCode,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.itemcd +
                "-" +
                row.itemacnt +
                "-" +
                row.recdt +
                "-" +
                row.amtunit ==
              filters.find_row_value
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
            : rows.find(
                (row: any) =>
                  row.itemcd +
                    "-" +
                    row.itemacnt +
                    "-" +
                    row.recdt +
                    "-" +
                    row.amtunit ==
                  filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
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

  //그리드 데이터 조회
  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0080W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": subfilters.orgdiv,
        "@p_itemcd": subfilters.itemcd,
        "@p_itemnm": subfilters.itemnm,
        "@p_insiz": subfilters.insiz,
        "@p_itemacnt": subfilters.itemacnt,
        "@p_unpitem": subfilters.unpitem,
        "@p_amtunit": subfilters.amtunit,
        "@p_company_code ": companyCode,
        "@p_find_row_value": subfilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.sub_code == subfilters.find_row_value
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }
      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt >= 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.sub_code == subfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });

          setFilters((prev) => ({
            ...prev,
            itemacnt: selectedRow.sub_code,
            isSearch: true,
          }));
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });

          setFilters((prev) => ({
            ...prev,
            itemacnt: rows[0].sub_code,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setSubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchItemData = React.useCallback(
    async (itemcd: string) => {
      let data: any;
      const queryStr = getItemQuery({ itemcd: itemcd, itemnm: "" });
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
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const {
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          } = rows[0];
          setItemInfo({
            itemcd,
            itemno,
            itemnm,
            insiz,
            model,
            itemacnt,
            itemacntnm,
            bnatur,
            spec,
            invunit,
            invunitnm,
            unitwgt,
            wgtunit,
            wgtunitnm,
            maker,
            dwgno,
            remark,
            itemlvl1,
            itemlvl2,
            itemlvl3,
            extra_field1,
            extra_field2,
            extra_field7,
            extra_field6,
            extra_field8,
            packingsiz,
            unitqty,
            color,
            gubun,
            qcyn,
            outside,
            itemthick,
            itemlvl4,
            itemlvl5,
            custitemnm,
          });
        } else {
          const newData = mainDataResult.data.map((item: any) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
              ? {
                  ...item,
                  itemcd: item.itemcd,
                  itemno: "",
                  itemnm: "",
                  insiz: "",
                  model: "",
                  itemacnt: "",
                  itemacntnm: "",
                  bnatur: "",
                  spec: "",
                  invunit: "",
                  invunitnm: "",
                  unitwgt: "",
                  wgtunit: "",
                  wgtunitnm: "",
                  maker: "",
                  dwgno: "",
                  remark: "",
                  itemlvl1: "",
                  itemlvl2: "",
                  itemlvl3: "",
                  extra_field1: "",
                  extra_field2: "",
                  extra_field7: "",
                  extra_field6: "",
                  extra_field8: "",
                  packingsiz: "",
                  unitqty: "",
                  color: "",
                  gubun: "",
                  qcyn: "",
                  outside: "",
                  itemthick: "",
                  itemlvl4: "",
                  itemlvl5: "",
                  custitemnm: "",
                  [EDIT_FIELD]: undefined,
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
        }
      }
    },
    [mainDataResult]
  );

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subfilters.isSearch &&
      permissions !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
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

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setPage(initialPageState);
    setFilters((prev) => ({
      ...prev,
      itemacnt: selectedRowData.sub_code,
      pgNum: 1,
      isSearch: true,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "품목계정";
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  //그리드 푸터
  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onCopyWndClick = () => {
    try {
      if (filters.itemacnt != "") {
        setCopyWindowVisible(true);
      } else {
        throw findMessage(messagesData, "BA_A0080W_007");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onCopyWndClick2 = () => {
    setCopyWindowVisible2(true);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setSubFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const setCopyData = (data: any) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    try {
      data.map((item: any) => {
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          amtunit: subfilters.amtunit,
          bnatur: item.bnatur,
          insiz: item.insiz,
          invunit: item.invunit,
          itemacnt: filters.itemacnt,
          itemcd: item.itemcd,
          itemlvl1: item.itemlvl1,
          itemlvl2: item.itemlvl2,
          itemlvl3: item.itemlvl3,
          itemnm: item.itemnm,
          itemno: item.itemno,
          position: "",
          recdt: convertDateToStr(new Date()),
          remark: item.remark,
          spec: item.spec,
          unp: item.unp,
          rowstatus: "N",
        };
        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setPage((prev) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev: any) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev: any) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        subfilters.unpitem == "" ||
        subfilters.unpitem == null ||
        subfilters.unpitem == undefined
      ) {
        throw findMessage(messagesData, "BA_A0080W_009");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
        }));
        setSubFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        deletedMainRows = [];
        if(swiper) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const enterEdit = (dataItem: any, field: string) => {
    let valid = false;

    if (
      (field == "recdt" && dataItem.rowstatus != "N") ||
      (field == "itemcd" && dataItem.rowstatus != "N") ||
      (field == "itemacnt" && dataItem.rowstatus != "N") ||
      (field == "amtunit" && dataItem.rowstatus != "N") ||
      field == "rowstatus" ||
      field == "itemnm" ||
      field == "insiz" ||
      field == "itemlvl1" ||
      field == "itemlvl2" ||
      field == "itemlvl3" ||
      field == "spec"
    ) {
      valid = true;
    }

    if (valid == false) {
      const newData = mainDataResult.data.map((item: { [x: string]: any }) =>
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
      setMainDataResult((prev: { total: any }) => {
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
      if (editedField !== "itemcd") {
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
      } else {
        mainDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY]) {
            fetchItemData(item.itemcd);
          }
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev: any) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onAddClick = () => {
    mainDataResult.data.map((item: { num: number }) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    try {
      if (filters.itemacnt != "") {
        itemacnt2 = filters.itemacnt;
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp,
          amtunit: subfilters.amtunit,
          bnatur: "",
          insiz: "",
          invunit: "",
          itemacnt: filters.itemacnt,
          itemcd: "",
          itemlvl1: "",
          itemlvl2: "",
          itemlvl3: "",
          itemnm: "",
          itemno: "",
          position: "",
          recdt: convertDateToStr(new Date()),
          remark: "",
          spec: "",
          unp: 0,
          rowstatus: "N",
        };
        setMainDataResult((prev: { data: any; total: number }) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setPage((prev: { take: number }) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
      } else {
        throw findMessage(messagesData, "BA_A0080W_001");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    orgdiv: sessionOrgdiv,
    user_id: userId,
    form_id: "BA_A0080W",
    pc: pc,
    unpitem: "",
    rowstatus: "",
    itemcd: "",
    unp: "",
    itemacnt: "",
    remark: "",
    recdt: "",
    amtunit: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0080W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_unpitem_s": paraData.unpitem,
      "@p_rowstatus_s": paraData.rowstatus,
      "@p_itemcd_s": paraData.itemcd,
      "@p_itemacnt_s": paraData.itemacnt,
      "@p_unp_s": paraData.unp,
      "@p_remark_s": paraData.remark,
      "@p_userid": paraData.user_id,
      "@p_recdt_s": paraData.recdt,
      "@p_amtunit_s": paraData.amtunit,
      "@p_form_id": paraData.form_id,
      "@p_pc": paraData.pc,
    },
  };

  type TdataArr = {
    unpitem: string[];
    rowstatus: string[];
    itemcd: string[];
    unp: string[];
    itemacnt: string[];
    remark: string[];
    recdt: string[];
    amtunit: string[];
  };

  const onSaveClick = async () => {
    console.log("저장");

    let valid = true;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    try {
      dataItem.map((item: any) => {
        if (
          item.recdt.substring(0, 4) < "1997" ||
          item.recdt.substring(6, 8) > "31" ||
          item.recdt.substring(6, 8) < "01" ||
          item.recdt.substring(6, 8).length != 2
        ) {
          throw findMessage(messagesData, "BA_A0080W_002");
        }
        if (item.unp == 0) {
          throw findMessage(messagesData, "BA_A0080W_003");
        }
        if (item.itemcd == "") {
          throw findMessage(messagesData, "BA_A0080W_004");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    let dataArr: TdataArr = {
      unpitem: [],
      rowstatus: [],
      itemcd: [],
      unp: [],
      itemacnt: [],
      remark: [],
      recdt: [],
      amtunit: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        unpitem = "",
        rowstatus = "",
        itemcd = "",
        unp = "",
        itemacnt = "",
        remark = "",
        recdt = "",
        amtunit = "",
      } = item;

      dataArr.rowstatus.push(rowstatus);
      dataArr.unpitem.push(unpitem == "" ? subfilters.unpitem : unpitem);
      dataArr.itemcd.push(itemcd);
      dataArr.unp.push(unp);
      dataArr.itemacnt.push(itemacnt);
      dataArr.remark.push(remark);
      dataArr.recdt.push(recdt);
      dataArr.amtunit.push(amtunit);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        unpitem = "",
        rowstatus = "",
        itemcd = "",
        unp = "",
        itemacnt = "",
        remark = "",
        recdt = "",
        amtunit = "",
      } = item;
      dataArr.rowstatus.push(rowstatus);
      dataArr.unpitem.push(
        unpitem == "" || unpitem == undefined ? subfilters.unpitem : unpitem
      );
      dataArr.itemcd.push(itemcd);
      dataArr.unp.push(unp);
      dataArr.itemacnt.push(itemacnt);
      dataArr.remark.push(remark);
      dataArr.recdt.push(recdt);
      dataArr.amtunit.push(amtunit);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: sessionOrgdiv,
      user_id: userId,
      form_id: "BA_A0080W",
      pc: pc,
      unpitem: dataArr.unpitem.join("|"),
      rowstatus: dataArr.rowstatus.join("|"),
      itemcd: dataArr.itemcd.join("|"),
      unp: dataArr.unp.join("|"),
      itemacnt: dataArr.itemacnt.join("|"),
      remark: dataArr.remark.join("|"),
      recdt: dataArr.recdt.join("|"),
      amtunit: dataArr.amtunit.join("|"),
    }));
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 0 && filters.pgNum > 0;
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: "",
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
              ? prev.pgNum - 1
              : prev.pgNum
            : prev.pgNum,
          isSearch: true,
        }));
      } else {
        setFilters((prev: any) => ({
          ...prev,
          find_row_value: data.returnString,
          pgNum: prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData != undefined && paraData.itemcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
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
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    //newData 생성
    setMainDataResult((prev: { total: number }) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      let valid = true;

      jsonArr.map((item: any) => {
        Object.keys(item).map((items: any) => {
          if (
            items != "단가" &&
            items != "비고" &&
            items != "품목명" &&
            items != "품목코드"
          ) {
            valid = false;
          }
        });
      });

      if (valid == true) {
        let dataArr: TdataArr = {
          unpitem: [],
          rowstatus: [],
          itemcd: [],
          unp: [],
          itemacnt: [],
          remark: [],
          recdt: [],
          amtunit: [],
        };
        jsonArr.forEach((item: any, idx: number) => {
          const {
            unpitem = "",
            품목코드 = "",
            품목명 = "",
            단가 = "",
            비고 = "",
            itemacnt = "",
            recdt = "",
            amtunit = "",
          } = item;

          dataArr.rowstatus.push("N");
          dataArr.unpitem.push(unpitem == "" ? subfilters.unpitem : unpitem);
          dataArr.itemcd.push(품목코드);
          dataArr.unp.push(단가);
          dataArr.itemacnt.push(
            itemacnt == ""
              ? Object.getOwnPropertyNames(selectedsubDataState)[0]
              : itemacnt
          );
          dataArr.remark.push(비고);
          dataArr.recdt.push(
            recdt == "" ? convertDateToStr(new Date()) : recdt
          );
          dataArr.amtunit.push(amtunit == "" ? subfilters.amtunit : amtunit);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          orgdiv: sessionOrgdiv,
          user_id: userId,
          form_id: "BA_A0080W",
          pc: pc,
          unpitem: dataArr.unpitem.join("|"),
          rowstatus: dataArr.rowstatus.join("|"),
          itemcd: dataArr.itemcd.join("|"),
          unp: dataArr.unp.join("|"),
          itemacnt: dataArr.itemacnt.join("|"),
          remark: dataArr.remark.join("|"),
          recdt: dataArr.recdt.join("|"),
          amtunit: dataArr.amtunit.join("|"),
        }));
      } else {
        alert("양식이 맞지 않습니다.");
      }
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>단가관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="BA_A0080W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>단가항목</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="unpitem"
                    value={subfilters.unpitem}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>화폐단위</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="amtunit"
                    value={subfilters.amtunit}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={subfilters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={subfilters.itemcd}
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
                  value={subfilters.itemnm}
                  onChange={filterInputChange}
                />
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
              <GridContainer
                style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>품목계정</GridTitle>
                  <ButtonContainer>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyWndClick2}
                      icon="copy"
                      title="단가복사"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  ref={(exporter) => (_export = exporter)}
                  data={subDataResult.data}
                  fileName="단가관리"
                >
                  <Grid
                    style={{ height: deviceHeight - height }}
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                      })),
                      subDataState
                    )}
                    {...subDataState}
                    onDataStateChange={onSubDataStateChange}
                    //선택 기능
                    dataItemKey={SUB_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSubDataSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubDataSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder == 0
                                  ? subTotalFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <FormContext.Provider
              value={{
                itemInfo,
                setItemInfo,
              }}
            >
              <SwiperSlide
                key={1}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <GridContainer
                  style={{
                    width: `${deviceWidth - 30}px`,
                    overflow: "auto",
                  }}
                >
                  <GridTitleContainer className="ButtonContainer2">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="arrow-left"
                      >
                        이전
                      </Button>
                      <div>
                        {permissions && (
                          <ExcelUploadButtons
                            saveExcel={saveExcel}
                            permissions={permissions}
                            style={{ marginLeft: "15px" }}
                            disabled={filters.itemacnt == "" ? true : false}
                          />
                        )}
                        <Button
                          title="Export Excel"
                          onClick={onAttachmentsWndClick}
                          icon="file"
                          fillMode="outline"
                          themeColor={"primary"}
                        >
                          엑셀양식
                        </Button>

                        <Button
                          onClick={onAddClick}
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                          disabled={filters.itemacnt == "" ? true : false}
                        ></Button>
                        <Button
                          onClick={onDeleteClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                        ></Button>
                        <Button
                          themeColor={"primary"}
                          fillMode="outline"
                          onClick={onCopyWndClick}
                          icon="folder-open"
                          title="품목참조"
                          disabled={filters.itemacnt == "" ? true : false}
                        ></Button>
                        <Button
                          onClick={onSaveClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                        ></Button>
                      </div>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="단가관리"
                  >
                    <Grid
                      style={{ height: deviceHeight - height2 }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          recdt: row.recdt
                            ? new Date(dateformat(row.recdt))
                            : new Date(dateformat("99991231")),
                          itemlvl1: itemlvl1ListData.find(
                            (item: any) => item.sub_code == row.itemlvl1
                          )?.code_name,
                          itemlvl2: itemlvl2ListData.find(
                            (item: any) => item.sub_code == row.itemlvl2
                          )?.code_name,
                          itemlvl3: itemlvl3ListData.find(
                            (item: any) => item.sub_code == row.itemlvl3
                          )?.code_name,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
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
                      //incell 수정 기능
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
                        customOptionData.menuCustomColumnOptions[
                          "grdList"
                        ]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                          (item: any, idx: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={idx}
                                id={item.id}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  DateField.includes(item.fieldName)
                                    ? DateCell
                                    : CustomComboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : NumberField.includes(item.fieldName)
                                    ? NumberCell
                                    : CommandField.includes(item.fieldName)
                                    ? ColumnCommandCell
                                    : NameCell
                                }
                                className={
                                  requiredField.includes(item.fieldName)
                                    ? "required"
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
                </GridContainer>
              </SwiperSlide>
            </FormContext.Provider>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`22%`}>
              <GridTitleContainer>
                <GridTitle>품목계정</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode="outline"
                    onClick={onCopyWndClick2}
                    icon="copy"
                    title="단가복사"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export = exporter)}
                data={subDataResult.data}
                fileName="단가관리"
              >
                <Grid
                  style={{ height: "81.6vh" }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubDataSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList2"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            footerCell={
                              item.sortOrder == 0
                                ? subTotalFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <FormContext.Provider
              value={{
                itemInfo,
                setItemInfo,
              }}
            >
              <GridContainer width={`calc(78% - ${GAP}px)`}>
                <GridTitleContainer>
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer>
                    {permissions && (
                      <ExcelUploadButtons
                        saveExcel={saveExcel}
                        permissions={permissions}
                        style={{ marginLeft: "15px" }}
                        disabled={filters.itemacnt == "" ? true : false}
                      />
                    )}
                    <Button
                      title="Export Excel"
                      onClick={onAttachmentsWndClick}
                      icon="file"
                      fillMode="outline"
                      themeColor={"primary"}
                    >
                      엑셀양식
                    </Button>

                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={filters.itemacnt == "" ? true : false}
                    ></Button>
                    <Button
                      onClick={onDeleteClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyWndClick}
                      icon="folder-open"
                      title="품목참조"
                      disabled={filters.itemacnt == "" ? true : false}
                    ></Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="단가관리"
                >
                  <Grid
                    style={{ height: "81.6vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        recdt: row.recdt
                          ? new Date(dateformat(row.recdt))
                          : new Date(dateformat("99991231")),
                        itemlvl1: itemlvl1ListData.find(
                          (item: any) => item.sub_code == row.itemlvl1
                        )?.code_name,
                        itemlvl2: itemlvl2ListData.find(
                          (item: any) => item.sub_code == row.itemlvl2
                        )?.code_name,
                        itemlvl3: itemlvl3ListData.find(
                          (item: any) => item.sub_code == row.itemlvl3
                        )?.code_name,
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
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
                    //incell 수정 기능
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
                      customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : CustomComboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : NumberField.includes(item.fieldName)
                                  ? NumberCell
                                  : CommandField.includes(item.fieldName)
                                  ? ColumnCommandCell
                                  : NameCell
                              }
                              className={
                                requiredField.includes(item.fieldName)
                                  ? "required"
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
              </GridContainer>
            </FormContext.Provider>
          </GridContainerWrap>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
          modal={true}
        />
      )}
      {CopyWindowVisible && (
        <CopyWindow
          setVisible={setCopyWindowVisible}
          setData={setCopyData}
          itemacnt={filters.itemacnt}
          modal={true}
          pathname="BA_A0080W"
        />
      )}
      {CopyWindowVisible2 && (
        <CopyWindow2
          setVisible={setCopyWindowVisible2}
          modal={true}
          pathname="BA_A0080W"
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={"BA_A0080W"}
          modal={true}
        />
      )}
    </>
  );
};

export default BA_A0080;
