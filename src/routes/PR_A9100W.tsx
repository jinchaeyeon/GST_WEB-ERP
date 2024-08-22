import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import YearCalendar from "../components/Calendars/YearCalendar";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getItemQuery,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import ItemsMultiWindow from "../components/Windows/CommonWindows/ItemsMultiWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading, sessionItemState } from "../store/atoms";
import { gridList } from "../store/columns/PR_A9100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

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
    if (dataItem["rowstatus"] == "N") {
      setItemWindowVisible2(true);
    } else {
      alert("품목코드는 수정이 불가합니다.");
    }
  };
  const setItemData2 = (data: IItemData) => {
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
    } = data;
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
          onClick={onItemWndClick2}
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

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
let deletedRows: any[] = [];
let targetRowIndex: null | number = null;
let temp = 0;
let temp2 = 0;
const requiredField = ["itemcd", "lotnum", "qty"];
const numberField = ["qty", "totwgt"];
const numberField2 = ["qty"];
const customField = ["itemcd"];

const comboBoxField = ["proccd"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  // 공정,대분류,중분류,소분류,품목계정,단위,중량단위
  UseBizComponent("L_PR010", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "proccd" ? "L_PR010" : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

var height = 0;
var height2 = 0;

const PR_A9100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pc = UseGetValueFromSessionItem("pc");

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setWebHeight(getDeviceHeight(true) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        ymdYyymm: setDefaultDate(customOptionData, "ymdYyymm"),
        cboLocation: defaultOption.find((item: any) => item.id == "cboLocation")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010,L_BA171,L_BA172,L_BA173,L_BA061,L_BA015,L_BA017",
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [wgtListData, setWgtListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setWgtListData(getBizCom(bizComponentData, "L_BA017"));
    }
  }, [bizComponentData]);

  const [sessionItem] = useRecoilState(sessionItemState);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

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
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const addItemData = (data: IItemData[]) => {
    mainDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    data.map((item) => {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp2,
        bnatur: item.bnatur,
        chk: "",
        insert_form_id: "",
        insert_pc: "",
        insert_time: "",
        insert_userid: "",
        insiz: item.insiz,
        invunit: item.invunit,
        itemacnt: item.itemacnt,
        itemcd: item.itemcd,
        itemlvl1: item.itemlvl1,
        itemlvl2: item.itemlvl2,
        itemlvl3: item.itemlvl3,
        itemnm: item.itemnm,
        last_update_time: "",
        location: sessionLocation,
        lotnum: "",
        orgdiv: sessionOrgdiv,
        pgmdiv: "",
        proccd: "",
        qty: 0,
        totwgt: 0,
        wgtunit: item.wgtunit,
        yyyymm: convertDateToStr(filters.ymdYyymm).substring(0, 6),
        rowstatus: "N",
      };
      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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
    });
  };

  useEffect(() => {
    (async () => {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] ==
        parseInt(Object.getOwnPropertyNames(selectedState)[0])
          ? {
              ...item,
              itemcd: itemInfo.itemcd,
              itemno: itemInfo.itemno,
              itemnm: itemInfo.itemnm,
              insiz: itemInfo.insiz,
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
              itemacnt: itemInfo.itemacnt,
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
    })();
  }, [itemInfo]);

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
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A9100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code == "orgdiv"
        )?.value,
        "@p_yyyymm": convertDateToStr(filters.ymdYyymm),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.cboItemacnt,
        "@p_proccd": filters.cboProccd,
        "@p_lotnum": filters.lotnum,
        "@p_location": filters.cboLocation,
        "@p_insiz": filters.insiz,
        "@p_find_row_value": filters.find_row_value,
      },
    };
    setLoading(true);
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
            (row: any) =>
              row.itemcd + "-" + row.proccd + "-" + row.lotnum ==
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
                  row.itemcd + "-" + row.proccd + "-" + row.lotnum ==
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
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
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;

    if (field == "itemcd" || field == "proccd" || field == "lotnum") {
      if (dataItem.rowstatus == "N") {
        valid = true;
      } else {
        valid = false;
      }
    }

    if (
      field != "rowstatus" &&
      field != "itemnm" &&
      field != "itemlvl1" &&
      field != "itemlvl2" &&
      field != "itemlvl3" &&
      field != "insiz" &&
      field != "bnatur" &&
      field != "itemacnt" &&
      field != "invunit" &&
      field != "wgtunit" &&
      field != "insert_time" &&
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
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
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
      if (editedField !== "itemcd") {
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
        mainDataResult.data.map((item: { [x: string]: any; itemcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY]) {
            fetchItemData(item.itemcd);
          }
        });
      }
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

  const fetchItemData = React.useCallback(
    async (itemcd: string) => {
      if (!permissions.view) return;

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
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      bnatur: "",
      chk: "",
      insert_form_id: "",
      insert_pc: "",
      insert_time: "",
      insert_userid: "",
      insiz: "",
      invunit: "",
      itemacnt: "",
      itemcd: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemnm: "",
      last_update_time: "",
      location: sessionLocation,
      lotnum: "",
      orgdiv: sessionOrgdiv,
      pgmdiv: "",
      proccd: "",
      qty: 0,
      totwgt: 0,
      wgtunit: "",
      yyyymm: convertDateToStr(filters.ymdYyymm).substring(0, 6),
      rowstatus: "N",
    };
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
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

  const onRemoveClick = () => {
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
          deletedRows.push(newData2);
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
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0 && deletedRows.length == 0) return false;

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
      (sessionItem) => sessionItem.code == "location"
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
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      deletedRows = []; //초기화
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

    paraData.work_type = ""; //초기화
  };

  const userId = UseGetValueFromSessionItem("user_id");

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    rowstatus_s: "",
    orgdiv: sessionItem.find((sessionItem) => sessionItem.code == "orgdiv")
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
    form_id: "PR_A9100W",
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
    if (paraData.work_type !== "" && permissions.save) fetchGridSaved();
  }, [paraData, permissions]);

  const search = () => {
    try {
      if (convertDateToStr(filters.ymdYyymm).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "PR_A9100W_004");
      } else if (
        filters.cboLocation == "" ||
        filters.cboLocation == undefined ||
        filters.cboLocation == null
      ) {
        throw findMessage(messagesData, "PR_A9100W_005");
      } else {
        deletedRows = [];
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
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
              <th>연월</th>
              <td>
                <DatePicker
                  name="ymdYyymm"
                  value={filters.ymdYyymm}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                  placeholder=""
                  className="required"
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
                    className="required"
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
      <FormContext.Provider
        value={{
          itemInfo,
          setItemInfo,
        }}
      >
        <GridContainer>
          <GridTitleContainer className="ButtonContainer">
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onItemMultiWndClick}
                icon="folder-open"
                themeColor={"primary"}
                disabled={permissions.save ? false : true}
              >
                품목참조
              </Button>
              <Button
                onClick={onAddClick}
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
          </GridTitleContainer>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
            fileName={getMenuName()}
          >
            <Grid
              style={{ height: isMobile ? mobileheight : webheight }}
              data={process(
                mainDataResult.data.map((row, num) => ({
                  ...row,
                  itemacnt: itemacntListData.find(
                    (items: any) => items.sub_code == row.itemacnt
                  )?.code_name,
                  itemlvl1: itemlvl1ListData.find(
                    (item: any) => item.sub_code == row.itemlvl1
                  )?.code_name,
                  itemlvl2: itemlvl2ListData.find(
                    (item: any) => item.sub_code == row.itemlvl2
                  )?.code_name,
                  itemlvl3: itemlvl3ListData.find(
                    (item: any) => item.sub_code == row.itemlvl3
                  )?.code_name,
                  invunit: qtyunitListData.find(
                    (item: any) => item.sub_code == row.invunit
                  )?.code_name,
                  wgtunit: wgtListData.find(
                    (item: any) => item.sub_code == row.wgtunit
                  )?.code_name,
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
                customOptionData.menuCustomColumnOptions["grdList"]
                  ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  ?.map(
                    (item: any, num: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={num}
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            numberField.includes(item.fieldName)
                              ? NumberCell
                              : comboBoxField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : customField.includes(item.fieldName)
                              ? ColumnCommandCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : numberField2.includes(item.fieldName)
                              ? editNumberFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
            </Grid>
          </ExcelExport>
        </GridContainer>
      </FormContext.Provider>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={editIndex == undefined ? "FILTER" : "ROW_ADD"}
          setData={setItemData}
          modal={true}
        />
      )}

      {itemMultiWindowVisible && (
        <ItemsMultiWindow
          setVisible={setItemMultiWindowVisible}
          setData={addItemData}
          modal={true}
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
