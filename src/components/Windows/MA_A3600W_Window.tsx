import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  getter,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  getSelectedState,
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "swiper/css";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IItemData, IWindowPosition } from "../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
  setDefaultDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import {
  CellRender as CellRenderGroup,
  RowRender as RowRenderGroup,
} from "../Renderers/GroupRenderers";
import { CellRender, RowRender } from "../Renderers/Renderers";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};
let temp = 0;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA116_280", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "itemtype" ? "L_BA116_280" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  setVisible,
  setData,
  modal = false,
}: IWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_LOADPLACE",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [loadplaceListData, setLoadPlaceListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setLoadPlaceListData(getBizCom(bizComponentData, "L_LOADPLACE"));
    }
  }, [bizComponentData]);

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
        itemacnt: defaultOption.find((item: any) => item.id == "itemacnt")
          ?.valueCode,
        zeroyn: defaultOption.find((item: any) => item.id == "zeroyn")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

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
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
      height3 = getHeight(".BottomContainer"); //하단 버튼부분
      height4 = getHeight(".WindowButtonContainer");
      height5 = getHeight(".WindowButtonContainer2");

      setMobileHeight(
        getWindowDeviceHeight(true, deviceHeight) -
          height -
          height2 -
          height3 -
          height4
      );
      setMobileHeight2(
        getWindowDeviceHeight(true, deviceHeight) -
          height -
          height2 -
          height3 -
          height5
      );
      setWebHeight(
        (getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3) /
          2 -
          height4
      );
      setWebHeight2(
        (getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3) /
          2 -
          height5
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height4
    );
    setWebHeight2(
      (getWindowDeviceHeight(true, position.height) -
        height -
        height2 -
        height3) /
        2 -
        height5
    );
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const setLoading = useSetRecoilState(isLoading);
  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    itemcd: "",
    itemnm: "",
    frdt: new Date(),
    todt: new Date(),
    insiz: "",
    itemacnt: "",
    zeroyn: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_P3400W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_itemacnt": filters.itemacnt,
        "@p_zeroyn": filters.zeroyn,
        "@p_itemgrade": "",
        "@p_lotnum": "",
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
          groupId: row.itemacnt + "itemacnt",
          group_category_name:
            "품목" +
            " : " +
            itemacntListData.find((item: any) => item.sub_code == row.itemacnt)
              ?.code_name,
        };
      });
      const newDataState = processWithGroups(rows, group);
      setResultState(newDataState);
      setTotal(totalRowCnt);
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

  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
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
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const onRowDoubleClick = (props: any) => {
    let valid = true;
    const selectRowList = mainDataResult.data.filter(
      (item) => item.chk == true
    );

    selectRowList.map((item) => {
      subDataResult.data.map((items) => {
        if (items.num == item.num) {
          valid = false;
        }
      });
    });

    if (valid != true) {
      alert("이미 추가된 품목입니다.");
    } else {
      selectRowList.map((selectRow) => {
        const newDataItem = {
          ...selectRow,
          chk: false,
        };
        setSubSelectedState({ [newDataItem[DATA_ITEM_KEY2]]: true });
        setSubDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: false,
      }));
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setValues(false);
    }
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

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

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult.data.forEach((item) =>
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

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
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

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSubSelectedState(newSelectedState);
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    subDataResult.data.forEach((item: any, index: number) => {
      if (!subselectedState[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSubSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
    setValues2(false);
  };

  const selectData = (selectedData: any) => {
    setData(subDataResult.data);
    onClose();
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType == "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item.num == dataItem.num
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
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
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
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

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      DATA_ITEM_KEY2
    );
  };

  const customCellRender = (td: any, props: any) => (
    <CellRenderGroup
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender = (tr: any, props: any) => (
    <RowRenderGroup
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field == "chk" || field == "now_qty" || field == "itemtype") {
      const newData = subDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit2 = () => {
    const newData = subDataResult.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setSubDataResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  return (
    <>
      <Window
        titles={"재고참조"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <TitleContainer className="WindowTitleContainer">
          <Title></Title>
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
              disabled={permissions.view ? false : true}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <WindowFilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>일자</th>
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
                <th>품목계정</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="itemacnt"
                      value={
                        filters.itemacnt == undefined ? "" : filters.itemacnt
                      }
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>재고수량</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="zeroyn"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange}
                    />
                  )}
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
                <th>규격</th>
                <td>
                  <Input
                    name="insiz"
                    type="text"
                    value={filters.insiz}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </WindowFilterContainer>
        <GridContainer>
          <GridTitleContainer className="WindowButtonContainer">
            <ButtonContainer>
              <Button
                onClick={onRowDoubleClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={newData.map((item: { items: any[] }) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                load_place: loadplaceListData.find(
                  (item: any) => item.sub_code == row.load_place
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
            }))}
            //스크롤 조회 기능
            fixedScroll={true}
            //그룹기능
            group={group}
            groupable={true}
            onExpandChange={onExpandChange}
            expandField="expanded"
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //페이지네이션
            total={total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CustomCheckCell}
            />
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="150px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="150px" />
            <GridColumn field="insiz" title="규격" width="180px" />
            <GridColumn field="lotnum" title="LOT번호" width="150px" />
            <GridColumn field="load_place" title="적재장소" width="120px" />
            <GridColumn
              field="now_qty"
              title="현재고"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn
              field="before_qty"
              title="이전재고"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn
              field="in_qty"
              title="입고량"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
            <GridColumn
              field="out_qty"
              title="출고량"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell}
            />
          </Grid>
        </GridContainer>
        <GridContainer>
          <GridTitleContainer className="WindowButtonContainer2">
            <ButtonContainer>
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
            style={{ height: isMobile ? mobileheight2 : webheight2 }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (items: any) => items.sub_code == row.itemacnt
                )?.code_name,
                load_place: loadplaceListData.find(
                  (item: any) => item.sub_code == row.load_place
                )?.code_name,
                [SELECTED_FIELD]: subselectedState[idGetter2(row)], //선택된 데이터
              })),
              subDataState
            )}
            onDataStateChange={onSubDataStateChange}
            {...subDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSubSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={subDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //더블클릭
            onItemChange={onMainItemChange2}
            cellRender={customCellRender2}
            rowRender={customRowRender2}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="150px"
              footerCell={subTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="150px" />
            <GridColumn field="insiz" title="규격" width="180px" />
            <GridColumn field="itemacnt" title="품목계정" width="120px" />
            <GridColumn field="lotnum" title="LOT번호" width="150px" />
            <GridColumn field="load_place" title="적재장소" width="120px" />
            <GridColumn
              field="now_qty"
              title="처리량"
              width="100px"
              cell={NumberCell}
              footerCell={gridSumQtyFooterCell2}
            />
            <GridColumn
              field="itemtype"
              title="자재유형"
              width="120px"
              cell={CustomComboBoxCell}
            />
          </Grid>
        </GridContainer>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              확인
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
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default CopyWindow;
