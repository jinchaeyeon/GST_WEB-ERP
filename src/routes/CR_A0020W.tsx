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
import { Buffer } from "buffer";
import cryptoRandomString from "crypto-random-string";
import React, {
  createContext,
  useContext,
  useEffect,
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import EncryptedCell from "../components/Cells/EncryptedCell";
import NameCell from "../components/Cells/NameCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
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
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";

import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

import { gridList } from "../store/columns/CR_A0020W_C";
import CR_A0020W_Window from "../components/Windows/CR_A0020W_Window";

enum weekDay
{
  None = 0,
  일 = 1 << 0,
  월 = 1 << 1,
  화 = 1 << 2,
  수 = 1 << 3,
  목 = 1 << 4,
  금 = 1 << 5,
  토 = 1 << 6
}

const getWeekDay = (value:any) => {
  let stringValues:string[] = [];
  
  const keys = Object.keys(weekDay).filter((x:any) => isNaN(x))
  for (let i in keys) {
    const key:any = keys[i];
    const dayofweek:any = weekDay[key]
    if (value & dayofweek) {
      stringValues.push(key);
    }
  }

  return stringValues.join("/");
}

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
let deletedMainRows: any[] = [];
let targetRowIndex: null | number = null;

const requiredHeaderField:string[] = [
];

const requiredField:string[] = [];

const editableField:string[] = [];

const NameField:string[] = [];

const EncryptedField:string[] = [];

const EncryptedField2:string[] = [];

const CustomField:string[] = [
  "owner",
  "species",
  "gender",
  "class"
];

const checkField:string[] = [];

const DateField:string[] = ["birdt"];

const CustomRadioField:string[] = [];

const CustonCommandField:string[] = [];

type TItemInfo = {
  files: string;
  url: string;
  user_id: string;
};

const defaultItemInfo = {
  files: "",
  url: "",
  user_id: "",
};
let temp = 0;
const COLUMN_MIN = 4;
export const FormContext = createContext<{
  itemInfo: TItemInfo;
  setItemInfo: (d: React.SetStateAction<TItemInfo>) => void;
}>({} as any);

export const FormContext2 = createContext<{
  password: String;
  setPassword: (p: React.SetStateAction<String>) => void;
}>({} as any);

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent(
    "L_BA310, L_SEXCD, L_BA320, L_USERS_EX",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "class"
      ? "L_BA310"
      : field === "gender"
      ? "L_SEXCD"
      : field === "species"
      ? "L_BA320"
      : field === "owner"
      ? "L_USERS_EX"
      : "";

  const textField = 
    field === "owner" 
    ? "name" 
    : field === "gender" 
    ? "name" 
    : undefined;
  const valueField = 
    field === "owner" 
    ? "code" 
    : field === "gender" 
    ? "code" 
    : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td></td>
  ); 
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent("R_BIRCD", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "bircd" ? "R_BIRCD" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td></td>
  ); 
};

let workType:string = "";

const CR_A0020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  //const [permissions, setPermissions] = useState<TPermissions>({view:true, print:true, save:true, delete:true});

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const [password, setPassword] = useState<String>("");
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //FormContext에서 데이터 받아 set
  useEffect(() => {
    const items = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const datas = mainDataResult.data.map((item: any) =>
      item.num == items.num
        ? {
            ...item,
            profile_image: itemInfo.files,
            url: itemInfo.url,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : { ...item }
    );
    setMainDataResult((prev) => {
      return {
        data: datas,
        total: prev.total,
      };
    });
  }, [itemInfo]);

  useEffect(() => {
    const items = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const datas = mainDataResult.data.map((item: any) =>
      item.num == items.num
        ? {
            ...item,
            password: password,
            temp: password,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : { ...item }
    );
    setMainDataResult((prev) => {
      return {
        data: datas,
        total: prev.total,
      };
    });
  }, [password]);

  //customOptionData 조회 후 디폴트 값 세팅
  // useEffect(() => {
  //   if (customOptionData !== null) {
  //     const defaultOption = customOptionData.menuCustomDefaultOptions.query;
  //     if (!!defaultOption) {
  //       setFilters((prev) => ({
  //         ...prev,
  //       }));
  //     }
  //   }
  // }, [customOptionData]); 2134

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_dptcd_001,L_SYS005", setBizComponentData);

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

  const [DetailWindowVisible, setDetailWindowVisible] = useState<boolean>(false);

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: orgdiv,
    manager: "",
    species: "",
    custnm: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CR_A0020W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_manager": filters.manager,
        "@p_species": filters.species,
        "@p_custcd": "",
        "@p_custnm": filters.custnm,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.user_id == filters.find_row_value
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
              : rows.find((row: any) => row.user_id == filters.find_row_value);

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      }
    } else {
      console.log("[에러발생]");
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
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
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const getCaption = (field: any, orgCaption: any) => {
    const key = Object.getOwnPropertyNames(selectedState)[0];
    let caption = orgCaption;

    if (key) {
      const selectedRowData = mainDataResult.data.find(
        (item) => item[DATA_ITEM_KEY] == key
      );

      if (selectedRowData) {
        if (field.includes("extra_field")) {
          const extraFieldNum = field
            .replace("extra_field", "")
            .replace("col_", "");

          const newCaption = selectedRowData["field_caption" + extraFieldNum];
          if (newCaption !== "") {
            caption = newCaption;
          }
        }
      }
    }

    return caption;
  };

  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    
  };

  const exitEdit = () => {
   
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      apply_start_date: convertDateToStr(new Date()),
      apply_end_date: "99991231",
      bircd: "Y",
      birdt: "19991231",
      custcd: "",
      dptcd: "",
      email: "",
      hold_check_yn: "N",
      home_menu_id: "",
      ip_check_yn: "N",
      location: "",
      mbouseyn: "N",
      memo: "",
      mobile_no: "",
      opengb: "",
      orgdiv: "01",
      password: "",
      password_confirm: "",
      position: "",
      postcd: "",
      profile_image: "",
      rtrchk: "N",
      tel_no: "",
      temp: "",
      usediv: "Y",
      user_category: "EXTERNAL",
      user_id: "",
      user_ip: "",
      user_name: "",
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
  };

 
  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"]?.map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );

      setGridCurrent(grid.current.offsetWidth-40);
      setApplyMinWidth(grid.current.offsetWidth - 40 < minGridWidth.current);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (
      grid.current.offsetWidth - 40 < minGridWidth.current &&
      !applyMinWidth
    ) {
      setApplyMinWidth(true);
    } else if (grid.current.offsetWidth - 40 > minGridWidth.current) {
      setGridCurrent(grid.current.offsetWidth -40);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    let width = applyMinWidth
      ? minWidth
      : minWidth +
        (gridCurrent - minGridWidth.current) /
          customOptionData.menuCustomColumnOptions[Name].length;

    return width;
  };

  const onClickNew = () => {
    workType = "N";
    setDetailWindowVisible(true);
  }

  const onClickDelete = async () => {
    let data: any;
    setLoading(true);

    //프로시저 파라미터
    const paraSaved: Iparameters = {
      procedureName: "P_CR_A0020W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "D",
        "@p_orgdiv": orgdiv,
        "@p_custcd": mainDataResult.data.find((x) => idGetter(x) == Object.getOwnPropertyNames(selectedState)[0]).custcd,
        "@p_location": "",
        "@p_custnm": "",
        "@p_class": "",
        "@p_owner": "",
        "@p_species": "",
        "@p_gender": "",
        "@p_age": 0,
        "@p_manager": "",
        "@p_strdt": "",
        "@p_enddt": "",
        "@p_dayofweek": "",
        "@p_birdt": "",
        "@p_bircd": "",
        "@p_useyn": "",
        "@p_color": "",
        "@p_remark": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": pathname,
      },
    };

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
        setFilters((prev:any) => ({ ...prev, find_row_value: "", isSearch: true })); // 한번만 조회되도록
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    setLoading(false);
  };

  const ColumnCommandCell = (props: GridCellProps) => {
    const {
      ariaColumnIndex,
      columnIndex,
      render,
      className = "",
    } = props;
  
    const onAccountWndClick = () => {
      workType = "U";
      setDetailWindowVisible(true);
    };
  
    const defaultRendering = (
      <td
        className="k-command-cell"
        // aria-colindex={ariaColumnIndex}
        // data-grid-col-index={columnIndex}
        // style={{ position: "relative" }}
      >
        {/* <ButtonInInput> */}
          <Button
            className="k-grid-edit-command"
            onClick={onAccountWndClick}
            themeColor="primary"
            icon="edit"
            fillMode="outline"
          />
        {/* </ButtonInInput> */}
      </td>
    );
  
    return (
      <>
        {render === undefined
          ? null
          : render?.call(undefined, defaultRendering, props)}
      </>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>반려견 정보</Title>

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
            {/* <tr>
              <th>회사구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboOrgdiv"
                    value={filters.cboOrgdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>실사용자</th>
              <td>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radUsediv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr> */}
            <tr>
              {/* <th>사용자명ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_id}
                  onChange={filterInputChange}
                />
              </td> */}
              <th>그룹</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="query"
                    name="species"
                    value={filters.species}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>담당자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="query"
                    name="manager"
                    value={filters.manager}
                    customOptionData={customOptionData}
                    valueField="code"
                    textField="name"
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>반려견명</th>
              <td colSpan={3}>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
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
        <FormContext2.Provider
          value={{
            password,
            setPassword,
          }}
        >
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>반려견 리스트</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onClickNew}
                    icon="file-add"
                    themeColor={"primary"}
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onClickDelete}
                    icon="delete"
                    themeColor={"primary"}
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "82vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    birdt: row.birdt
                      ? new Date(dateformat(row.birdt))
                      : null,//new Date(dateformat("19991231")),
                    dayofweek: getWeekDay(row.dayofweek),
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
                // //incell 수정 기능
                // onItemChange={onMainItemChange}
                 cellRender={customCellRender}
                // rowRender={customRowRender}
                // editField={EDIT_FIELD}
                id="grdList"
              >
                <GridColumn cell={ColumnCommandCell} width="55px" />
                {/* <GridColumn
                  field="rowstatus"
                  title=" "
                  width="40px"
                  editable={false}
                /> */}
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]?.map(
                    (item: any, idx: number) => {
                      const caption = getCaption(item.id, item.caption);
                      return (
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={caption}
                            width={setWidth("grdList", item.width)}
                            cell={
                              NameField.includes(item.fieldName)
                                ? NameCell
                                : CustomField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : checkField.includes(item.fieldName)
                                ? CheckBoxCell
                                : DateField.includes(item.fieldName)
                                ? DateCell
                                : CustomRadioField.includes(item.fieldName)
                                ? CustomRadioCell
                                : CustonCommandField.includes(item.fieldName)
                                ? ColumnCommandCell
                                : undefined
                            }
                            headerCell={
                              requiredHeaderField.includes(item.fieldName)
                                ? RequiredHeader
                                : undefined
                            }
                            className={
                              editableField.includes(item.fieldName)
                                ? "editable-new-only"
                                : requiredField.includes(item.fieldName)
                                ? "required"
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                            editable={false}
                          />
                        )
                      );
                    }
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </FormContext2.Provider>
      </FormContext.Provider>
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
      {DetailWindowVisible && (
        <CR_A0020W_Window
          setVisible={setDetailWindowVisible}
          setFilters={setFilters}
          workType={workType}
          orgdiv={orgdiv}
          custcd={mainDataResult.data.find((x) => idGetter(x) == Object.getOwnPropertyNames(selectedState)[0]).custcd}
        />
      )}
    </>
  );
};

export default CR_A0020W;
