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
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import { IWindowPosition } from "../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
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
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
  setDefaultDate
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  itemacnt?: string | number | undefined;
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};
let temp = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];
var barcode = "";

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const CopyWindow = ({
  itemacnt,
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
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".WindowTitleContainer"); //조회버튼있는 title부분
      height3 = getHeight(".BottomContainer"); //하단 버튼부분
      height4 = getHeight(".WindowButtonContainer");

      setMobileHeight(
        getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
      );
      setMobileHeight2(
        getWindowDeviceHeight(true, deviceHeight) -
          height -
          height2 -
          height3 -
          height4
      );
      setWebHeight(
        (getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3) /
          2
      );
      setWebHeight2(
        (getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3) /
          2 -
          height4
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
        height4
    );
  };
  const DATA_ITEM_KEY = "num";
  const DATA_ITEM_KEY2 = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const location = UseGetValueFromSessionItem("location");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
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

  const setLoading = useSetRecoilState(isLoading);

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
        zeroyn: defaultOption.find((item: any) => item.id == "zeroyn")
          ?.valueCode,
        itemacnt:
          itemacnt == ""
            ? defaultOption.find((item: any) => item.id == "itemacnt")
                ?.valueCode
            : itemacnt,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
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

  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
    }
  }, [bizComponentData]);

  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

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
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

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

  const onClose = () => {
    temp = 0;
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
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

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: location,
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: itemacnt,
    zeroyn: "%",
    itemgrade: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [Information, setInformation] = useState({
    lotnum: "",
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
        "@p_location": location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_zeroyn": filters.zeroyn,
        "@p_itemgrade": filters.itemgrade,
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
          rowstatus: "N",
          amt: row.amt == null ? 0 : row.amt,
          unp: row.unp == null ? 0 : row.unp,
          qty: row.qty == null ? 0 : row.qty,
          wonamt: row.wonamt == null ? 0 : row.wonamt,
          taxamt: row.taxamt == null ? 0 : row.taxamt,
          totwgt: row.totwgt == null ? 0 : row.totwgt,
          len: row.len == null ? 0 : row.len,
          itemthick: row.itemthick == null ? 0 : row.itemthick,
          width: row.width == null ? 0 : row.width,
          pac: row.pac == null ? "A" : row.pac,
          groupId: row.itemacnt + "itemacnt",
          group_category_name:
            "품목" +
            " : " +
            itemacntListData.find((item: any) => item.sub_code == row.itemacnt)
              ?.code_name,
          itemacnt: itemacntListData.find(
            (item: any) => item.sub_code == row.itemacnt
          )?.code_name,
        };
      });

      const newDataState = processWithGroups(rows, group);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.planno + "-" + row.planseq == filters.find_row_value
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
  const fetchLotNoGrid = async (Information: any) => {
    if (!permissions.view) return;
    barcode = "";
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_P3400W_Q",
      pageNumber: 1,
      pageSize: 1,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_zeroyn": filters.zeroyn,
        "@p_itemgrade": filters.itemgrade,
        "@p_lotnum": Information.lotnum,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      subDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          qty: row.now_qty,
          rowstatus: "N",
          amt: row.amt == null ? 0 : row.amt,
          unp: row.unp == null ? 0 : row.unp,
          wonamt: row.wonamt == null ? 0 : row.wonamt,
          taxamt: row.taxamt == null ? 0 : row.taxamt,
          totwgt: row.totwgt == null ? 0 : row.totwgt,
          len: row.len == null ? 0 : row.len,
          itemthick: row.itemthick == null ? 0 : row.itemthick,
          width: row.width == null ? 0 : row.width,
          pac: row.pac == null ? "A" : row.pac,
          groupId: row.itemacnt + "itemacnt",
          group_category_name:
            "품목" +
            " : " +
            itemacntListData.find((item: any) => item.sub_code == row.itemacnt)
              ?.code_name,
          itemacnt: itemacntListData.find(
            (item: any) => item.sub_code == row.itemacnt
          )?.code_name,
          [DATA_ITEM_KEY2]: ++temp,
        };
      });

      if (totalRowCnt > 0) {
        let valid = true;
        for (var i = 0; i < subDataResult.data.length; i++) {
          if (
            rows[0].itemcd == subDataResult.data[i].itemcd &&
            rows[0].lotnum == subDataResult.data[i].lotnum &&
            valid == true
          ) {
            alert("중복되는 품목이있습니다.");
            valid = false;
            return false;
          }
        }

        if (valid == true) {
          setSubDataResult((prev) => {
            return {
              data: [...prev.data, rows[0]],
              total: prev.total + 1,
            };
          });
          setSubSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      } else {
        alert("해당 LOT번호가 없습니다.");
        barcode = "";
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setInformation((prev) => ({
      ...prev,
      lotnum: "",
      isSearch: false,
    }));
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
  }, [filters, bizComponentData, customOptionData, permissions]);

  useEffect(() => {
    if (
      Information.isSearch &&
      Information.lotnum != "" &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(Information);
      setInformation((prev) => ({ ...prev, lotnum: "", isSearch: false })); // 한번만 조회되도록
      fetchLotNoGrid(deepCopiedFilters);
    }
  }, [Information, bizComponentData, customOptionData, permissions]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

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
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSubSelectedState(newSelectedState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    setPage(initialPageState); // 페이지 초기화
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(subDataResult.data);
    onClose();
  };

  const onRowDoubleClick = (props: any) => {
    const datas = mainDataResult.data.filter(
      (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    );

    let valid = true;
    for (var i = 0; i < subDataResult.data.length; i++) {
      if (
        datas[0].itemcd == subDataResult.data[i].itemcd &&
        datas[0].lotnum == subDataResult.data[i].lotnum &&
        valid == true
      ) {
        alert("중복되는 품목이있습니다.");
        valid = false;
        return false;
      }
    }

    const rows = datas.map((row: any) => {
      return {
        ...row,
        qty: row.now_qty,
      };
    });

    if (valid == true) {
      setSubDataResult((prev) => {
        return {
          data: [...prev.data, rows[0]],
          total: prev.total + 1,
        };
      });
      setSubSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
    }
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object3: any[] = [];
    let Object2: any[] = [];
    let data;
    subDataResult.data.forEach((item: any, index: number) => {
      if (!subselectedState[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object3.push(index);
      }
    });

    if (Math.min(...Object3) < Math.min(...Object2)) {
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object3) - 1];
    }

    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object3.length,
    }));
    setSubSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

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

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter" || evt.code == "NumpadEnter") {
        if (barcode != "") {
          setInformation((prev) => ({
            ...prev,
            lotnum: barcode,
            isSearch: true,
          }));
        }
      } else if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter"
      ) {
        barcode += evt.key;
      }
    });
    document.addEventListener("click", function (evt) {
      barcode = "";
    });
  }, []);

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
          <Title />
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
                <th>기준년월</th>
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
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={newData.map((item: { items: any[] }) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
            }))}
            //선택 기능
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
            //원하는 행 위치로 스크롤 기능
            onRowDoubleClick={onRowDoubleClick}
            //그룹기능
            group={group}
            groupable={true}
            onExpandChange={onExpandChange}
            expandField="expanded"
          >
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="260px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="insiz" title="규격" width="200px" />
            <GridColumn field="lotnum" title="LOT번호" width="200px" />
            <GridColumn
              field="now_qty"
              title="현재고"
              width="170px"
              cell={NumberCell}
            />
            <GridColumn
              field="before_qty"
              title="이전재고"
              width="170px"
              cell={NumberCell}
            />
            <GridColumn
              field="in_qty"
              title="입고량"
              width="170px"
              cell={NumberCell}
            />
            <GridColumn
              field="out_qty"
              title="출고량"
              width="170px"
              cell={NumberCell}
            />
            <GridColumn
              field="safeqty"
              title="안전재고량"
              width="170px"
              cell={NumberCell}
            />
          </Grid>
        </GridContainer>
        <GridContainer>
          <GridTitleContainer className="WindowButtonContainer">
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
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            //정렬기능
            sortable={true}
            onSortChange={onSubSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //더블클릭
          >
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="300px"
              footerCell={subTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="270px" />
            <GridColumn field="insiz" title="규격" width="270px" />
            <GridColumn field="itemacnt" title="품목계정" width="220px" />
            <GridColumn field="lotnum" title="LOT NO" width="270px" />
            <GridColumn
              field="now_qty"
              title="처리량"
              width="200px"
              cell={NumberCell}
            />
          </Grid>
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
        </GridContainer>
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
