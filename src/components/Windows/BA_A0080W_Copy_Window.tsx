import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
  isFilterHideState2,
  isLoading,
  loginResultState,
} from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../Renderers/Renderers";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  itemacnt: string;
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const CopyWindow = ({
  itemacnt,
  setVisible,
  setData,
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
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowTitleContainer"); //조회버튼
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

  const DATA_ITEM_KEY = "itemcd";
  const DATA_ITEM_KEY2 = "itemcd";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  const setLoading = useSetRecoilState(isLoading);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  //메시지 조회

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id == "raduseyn")
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
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
    }
  }, [bizComponentData]);

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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
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
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    itemcd: "",
    itemnm: "",
    bnatur: "",
    insiz: "",
    spec: "",
    itemacnt: itemacnt,
    raduseyn: "Y",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    dwgno: "",
    custcd: "",
    custnm: "",
    pgmdiv: "",
    itemno: "",
    service_id: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      itemacnt: itemacnt,
    }));
  }, [itemacnt]);

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

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [subDataResult]);

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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_P0040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_bnatur": filters.bnatur,
        "@p_insiz": filters.insiz,
        "@p_spec": filters.spec,
        "@p_itemacnt": filters.itemacnt,
        "@p_useyn": filters.raduseyn,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_itemlvl2": filters.itemlvl2,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_dwgno": filters.dwgno,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_pgmdiv": filters.pgmdiv,
        "@p_itemno": filters.itemno,
        "@p_company_code": filters.service_id,
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
          rowstatus: "N",
          amt: row.amt == null ? 0 : row.amt,
          unp: row.unp == null ? 0 : row.unp,
          qty: row.qty == null ? 1 : row.qty,
          wonamt: row.wonamt == null ? 0 : row.wonamt,
          taxamt: row.taxamt == null ? 0 : row.taxamt,
          totwgt: row.totwgt == null ? 0 : row.totwgt,
          len: row.len == null ? 0 : row.len,
          itemthick: row.itemthick == null ? 0 : row.itemthick,
          width: row.width == null ? 0 : row.width,
          pac: row.pac == null ? "A" : row.pac,
          enddt: row.enddt == null ? new Date() : row.enddt,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
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
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              chk:
                typeof item.chk == "boolean"
                  ? item.chk
                  : item.chk == "Y"
                  ? true
                  : false,
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(subDataResult.data);
    onClose();
  };

  const onAddClick = (props: any) => {
    const newData = mainDataResult.data.filter((item: any) => item.chk == true);

    let valid = true;

    newData.map((item) => {
      subDataResult.data.map((items) => {
        if (item[DATA_ITEM_KEY] == items[DATA_ITEM_KEY2] && valid == true) {
          alert("중복되는 품목이있습니다.");
          valid = false;
          return false;
        }
      });
    });

    if (valid == true) {
      newData.map((item) => {
        setSubDataResult((prev) => {
          return {
            data: [item, ...prev.data],
            total: prev.total + 1,
          };
        });
        setPage2((prev) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));
        setSubSelectedState({ [item[DATA_ITEM_KEY2]]: true });
      });

      const newData2 = mainDataResult.data.map((item) => ({
        ...item,
        chk: false,
        [EDIT_FIELD]: props.field,
      }));
      setMainDataResult((prev) => {
        return {
          data: newData2,
          total: prev.total,
        };
      });
    }
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
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };
  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
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
  return (
    <>
      <Window
        titles={"품목참조(멀티)"}
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
                <th>도면번호</th>
                <td>
                  <Input
                    name="dwgno"
                    type="text"
                    value={filters.dwgno}
                    onChange={filterInputChange}
                  />
                </td>
                <th>재질</th>
                <td>
                  <Input
                    name="bnatur"
                    type="text"
                    value={filters.bnatur}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>업체코드</th>
                <td>
                  <Input
                    name="custcd"
                    type="text"
                    value={filters.custcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      onClick={onCustWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>업체명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
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
                <th>사용여부</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="raduseyn"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange}
                    />
                  )}
                </td>
                <th>사양</th>
                <td>
                  <Input
                    name="spec"
                    type="text"
                    value={filters.spec}
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
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
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
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
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
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="200px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="200px" />
            <GridColumn
              field="unitwgt"
              title="단위중량"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn
              field="bomyn"
              title="BOM유무"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn field="itemacnt" title="품목계정" width="140px" />
            <GridColumn field="insiz" title="규격" width="140px" />
            <GridColumn field="bnatur" title="재질" width="140px" />
            <GridColumn field="itemlvl1" title="대분류" width="140px" />
            <GridColumn field="itemlvl2" title="중분류" width="140px" />
            <GridColumn field="itemlvl3" title="소분류" width="140px" />
            <GridColumn field="invunit" title="구매단위" width="140px" />
            <GridColumn
              field="useyn"
              title="사용여부"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn field="custcd" title="업체코드" width="200px" />
            <GridColumn
              field="basinvunp"
              title="구매단가"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn
              field="unp"
              title="단가"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn field="remark" title="비고" width="250px" />
            <GridColumn field="dwgno" title="도면번호" width="160px" />
            <GridColumn field="custnm" title="업체명" width="160px" />
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
            //원하는 행 위치로 스크롤 기능
            ref={gridRef2}
            rowHeight={30}
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
              width="200px"
              footerCell={subTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="200px" />
            <GridColumn
              field="unitwgt"
              title="단위중량"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn
              field="bomyn"
              title="BOM유무"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn field="itemacnt" title="품목계정" width="140px" />
            <GridColumn field="insiz" title="규격" width="140px" />
            <GridColumn field="bnatur" title="재질" width="140px" />
            <GridColumn field="itemlvl1" title="대분류" width="140px" />
            <GridColumn field="itemlvl2" title="중분류" width="140px" />
            <GridColumn field="itemlvl3" title="소분류" width="140px" />
            <GridColumn field="invunit" title="구매단위" width="140px" />
            <GridColumn
              field="useyn"
              title="사용여부"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn field="custcd" title="업체코드" width="200px" />
            <GridColumn
              field="basinvunp"
              title="구매단가"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn
              field="unp"
              title="단가"
              width="140px"
              cell={NumberCell}
            />
            <GridColumn field="remark" title="비고" width="250px" />
            <GridColumn field="dwgno" title="도면번호" width="160px" />
            <GridColumn field="custnm" title="업체명" width="160px" />
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
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
        />
      )}
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
