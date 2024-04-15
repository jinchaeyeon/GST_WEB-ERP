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
import { bytesToBase64 } from "byte-base64";
import cryptoRandomString from "crypto-random-string";
import React, {
  createContext,
  useCallback,
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
  getQueryFromBizComponent,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import MenuWindow from "../components/Windows/CommonWindows/MenuWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/SY_A0012W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
let deletedMainRows: any[] = [];
let targetRowIndex: null | number = null;

const requiredHeaderField = [
  "user_id",
  "user_name",
  "password",
  "temp",
  "user_category",
];

const requiredField = ["user_name", "password", "temp", "user_category"];

const editableField = ["user_id"];

const NameField = ["user_id"];

const EncryptedField = ["temp"];

const EncryptedField2 = ["password"];

const CustomField = [
  "location",
  "position",
  "user_category",
  "postcd",
  "dptcd",
  "opengb",
];

const checkField = ["usediv", "ip_check_yn", "rtrchk", "hold_chk", "mbouseyn"];

const DateField = ["birdt", "apply_start_date", "apply_end_date"];

const CustomRadioField = ["bircd"];

const CustonCommandField = ["profile_image"];

const CustomPopupField = ["home_menu_id_web"];

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

export const FormContext3 = createContext<{
  menuId: String;
  setMenuId: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const ColumnPopUpCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { menuId, setMenuId, mainDataState, setMainDataState } =
    useContext(FormContext3);
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
  const [menuWindowVisible, setMenuWindowVisible] = useState<boolean>(false);

  const onMenuWindowClick = () => {
    setMenuWindowVisible(true);
  };

  const setMenuData = (data: any) => {
    setMenuId(data.KeyID);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInInput>
        <Button
          onClick={onMenuWindowClick}
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
      {menuWindowVisible && (
        <MenuWindow
          setVisible={setMenuWindowVisible}
          reloadData={(data) => setMenuData(data)}
          modal={true}
        />
      )}
    </>
  );
};

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    render,
    className = "",
  } = props;
  const { setItemInfo } = useContext(FormContext);
  const excelInput: any = React.useRef();
  const [imgBase64, setImgBase64] = useState<string>(); // 파일 base64

  useEffect(() => {
    if (dataItem.profile_image != null) {
      if (
        dataItem.profile_image.slice(0, 1) == "0" &&
        dataItem.profile_image.slice(1, 2) == "x" &&
        dataItem.url != undefined
      ) {
        setImgBase64(dataItem.url.toString());
      } else {
        setImgBase64("data:image/png;base64," + dataItem.profile_image);
      }
    }
  });

  const onAttWndClick2 = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const getAttachmentsData = async (files: FileList | null) => {
    if (files != null) {
      let uint8 = new Uint8Array(await files[0].arrayBuffer());
      let arrHexString = Buffer.from(uint8).toString("hex");
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return new Promise((resolve) => {
        reader.onload = () => {
          if (reader.result != null) {
            setImgBase64(reader.result.toString());
            setItemInfo({
              files: "0x" + arrHexString,
              url: reader.result.toString(),
              user_id: dataItem.user_id,
            });
          }
        };
      });
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };

  const onDeleteClick = () => {
    setItemInfo({ files: "0x", url: "", user_id: dataItem.user_id });
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative", textAlign: "center" }}
    >
      {dataItem.profile_image != "" &&
      dataItem.profile_image != null &&
      dataItem.profile_image != undefined &&
      imgBase64 != "" ? (
        <div style={{ textAlign: "center" }}>
          <img
            style={{ display: "block", margin: "auto", width: "60%" }}
            ref={excelInput}
            src={imgBase64}
            alt="UserImage"
          />
          <Button
            style={{ marginTop: "10px" }}
            onClick={onAttWndClick2}
            fillMode="outline"
            themeColor={"primary"}
          >
            이미지 수정
          </Button>
          <Button
            style={{ marginTop: "10px" }}
            onClick={onDeleteClick}
            fillMode="outline"
            themeColor={"primary"}
          >
            이미지 삭제
          </Button>
        </div>
      ) : (
        <>
          <Button onClick={onAttWndClick2} themeColor={"primary"}>
            이미지 업로드
          </Button>
          <input
            id="uploadAttachment"
            style={{ display: "none" }}
            type="file"
            accept="image/*"
            ref={excelInput}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              getAttachmentsData(event.target.files);
            }}
          />
        </>
      )}
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

const EncryptedCell2 = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const processApi = useApi();
  let isInEdit = field === dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

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

  const onDelete = async () => {
    if (!window.confirm("비밀번호를 초기화 하시겠습니까??")) {
      return false;
    }

    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_upd_user_password",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "init",
        "@p_user_id": dataItem.user_id == undefined ? "" : dataItem.user_id,
        "@p_old_password": "",
        "@p_new_password":
          dataItem.user_id == undefined ? "" : dataItem.user_id,
        "@p_check_new_password":
          dataItem.user_id == undefined ? "" : dataItem.user_id,
        "@p_id": userId,
        "@p_pc": pc,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("정상적으로 처리되었습니다.");
    } else {
      console.log("[에러발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type={"password"}></Input>
      ) : (
        "*********"
      )}
      <ButtonInGridInput>
        <Button
          onClick={onDelete}
          icon="close"
          title="초기화"
          fillMode="flat"
        />
      </ButtonInGridInput>
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

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent(
    "L_SYS005,L_BA002,L_BA028,L_dptcd_001,L_HU005,L_BA410",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "user_category"
      ? "L_SYS005"
      : field === "location"
      ? "L_BA002"
      : field === "position"
      ? "L_BA028"
      : field === "dptcd"
      ? "L_dptcd_001"
      : field === "postcd"
      ? "L_HU005"
      : field === "opengb"
      ? "L_BA410"
      : "";

  const textField = field === "dptcd" ? "dptnm" : undefined;
  const valueField = field === "dptcd" ? "dptcd" : undefined;

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

const SY_A0120: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const [password, setPassword] = useState<String>("");
  const [menuId, setMenuId] = useState<String>("");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SY_A0012W", setMessagesData);

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
  UseCustomOption("SY_A0012W", setCustomOptionData);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

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

  useEffect(() => {
    const items = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    const datas = mainDataResult.data.map((item: any) =>
      item.num == items.num
        ? {
            ...item,
            home_menu_id_web: menuId,
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
  }, [menuId]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        cboOrgdiv: defaultOption.find((item: any) => item.id === "cboOrgdiv")
          .valueCode,
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
        radRtrchk: defaultOption.find((item: any) => item.id === "radRtrchk")
          .valueCode,
        radUsediv: defaultOption.find((item: any) => item.id === "radUsediv")
          .valueCode,
        user_category: defaultOption.find(
          (item: any) => item.id === "user_category"
        ).valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_dptcd_001,L_SYS005, L_MenuWeb", setBizComponentData);

  const [menuListData, setMenuListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const menuQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_MenuWeb"
        )
      );
      fetchQuery(menuQueryStr, setMenuListData);
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
    work_type: "LIST",
    cboOrgdiv: "01",
    cboLocation: "",
    dptcd: "",
    lang_id: "",
    user_category: "",
    user_id: "",
    user_name: "",
    radRtrchk: "%",
    radUsediv: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0012W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.cboOrgdiv,
        "@p_location": filters.cboLocation,
        "@p_dptcd": filters.dptcd,
        "@p_lang_id": filters.lang_id,
        "@p_user_category": filters.user_category,
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_rtrchk": filters.radRtrchk === "T" ? "%" : filters.radRtrchk,
        "@p_usediv": filters.radUsediv,
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
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
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
      apply_end_date: "19000101",
      bircd: "Y",
      birdt: "19000101",
      custcd: "",
      dptcd: "",
      email: "",
      hold_check_yn: "N",
      home_menu_id_web: "",
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
      user_category: "",
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

  const onRemoveClick = () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
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
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
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
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    //검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        if (!item.user_id) {
          throw findMessage(messagesData, "SY_A0012W_002");
        }

        if (!item.user_name) {
          throw findMessage(messagesData, "SY_A0012W_003");
        }

        if (!item.password) {
          throw findMessage(messagesData, "SY_A0012W_005");
        }
        if (!item.temp) {
          throw findMessage(messagesData, "SY_A0012W_006");
        }
        if (!item.user_category) {
          throw findMessage(messagesData, "SY_A0012W_007");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;
    setLoading(true);
    try {
      for (const item of deletedMainRows) {
        const { user_id } = item;

        const para: Iparameters = {
          procedureName: "P_SY_A0012W_S",
          pageNumber: 1,
          pageSize: 10,
          parameters: {
            "@p_work_type": "D",
            "@p_user_id": user_id,
            "@p_user_name": "",
            "@p_password": "",
            "@p_password_confirm": "",
            "@p_salt": "",
            "@p_user_category": "",
            "@p_email": "",
            "@p_tel_no": "",
            "@p_mobile_no": "",
            "@p_apply_start_date": "",
            "@p_apply_end_date": "",
            "@p_hold_check_yn": "",
            "@p_memo": "",
            "@p_ip_check_yn": "",
            "@p_orgdiv": "",
            "@p_location": "",
            "@p_dptcd": "",
            "@p_postcd": "",
            "@p_rtrchk": "",
            "@p_usediv": "",
            "@p_opengb": "",
            "@p_profile_image": "",
            "@p_user_ip": "",
            "@p_birdt": "",
            "@p_bircd": "",
            "@p_mbouseyn": "",
            "@p_position": "",
            "@p_home_menu_id_web": "",
            "@p_company_code": companyCode,
            "@p_id": "",
            "@p_pc": pc,
          },
        };

        let data: any;

        try {
          data = await processApi<any>("procedure", para);
        } catch (error) {
          data = null;
        }

        if (data.isSuccess !== true) {
          console.log("[오류 발생]");
          console.log(data);
          throw data.resultMessage;
        } else {
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
            setFilters((prev) => ({
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
            setFilters((prev) => ({
              ...prev,
              find_row_value: data.returnString,
              pgNum: prev.pgNum,
              isSearch: true,
            }));
          }
        }
      }

      deletedMainRows = [];
      console.log(dataItem);
      for (const item of dataItem) {
        const {
          rowstatus,
          user_id,
          user_name,
          password = "",
          password_confirm = "",
          temp = "",
          salt = "",
          user_category = "",
          email = "",
          tel_no = "",
          mobile_no = "",
          apply_start_date,
          apply_end_date,
          hold_check_yn = "",
          memo = "",
          location = "",
          position = "",
          dptcd = "",
          postcd = "",
          home_menu_id_web = "",
          ip_check_yn = "",
          rtrchk = "",
          usediv = "",
          userid = "",
          pc = "",
          opengb = "",
          profile_image = "",
          birdt,
          bircd = "",
          user_ip = "",
          mbouseyn = "",
        } = item;

        if (password !== temp) {
          throw findMessage(messagesData, "SY_A0012W_004");
        }

        const para: Iparameters = {
          procedureName: "P_SY_A0012W_S",
          pageNumber: 1,
          pageSize: 10,
          parameters: {
            "@p_work_type": rowstatus,
            "@p_user_id": user_id,
            "@p_user_name": user_name,
            "@p_password": password,
            "@p_password_confirm": password_confirm,
            "@p_salt":
              rowstatus === "N" ? cryptoRandomString({ length: 32 }) : salt,
            "@p_user_category": user_category,
            "@p_email": email,
            "@p_tel_no": tel_no,
            "@p_mobile_no": mobile_no,
            "@p_apply_start_date": apply_start_date,
            "@p_apply_end_date": apply_end_date,
            "@p_hold_check_yn":
              hold_check_yn === "Y" || hold_check_yn === true ? "Y" : "N",
            "@p_memo": memo,
            "@p_ip_check_yn":
              ip_check_yn === "Y" || ip_check_yn === true ? "Y" : "N",
            "@p_orgdiv": "01",
            "@p_location": location,
            "@p_dptcd": dptcd,
            "@p_postcd": postcd,
            "@p_rtrchk": rtrchk === "Y" || rtrchk === true ? "Y" : "N",
            "@p_usediv": usediv === "Y" || usediv === true ? "Y" : "N",
            "@p_opengb": opengb,
            "@p_profile_image": profile_image,
            "@p_user_ip": user_ip,
            "@p_birdt": birdt,
            "@p_bircd": bircd,
            "@p_mbouseyn": mbouseyn === "Y" || mbouseyn === true ? "Y" : "N",
            "@p_position": position,
            "@p_home_menu_id_web": home_menu_id_web,
            "@p_company_code": companyCode,
            "@p_id": userid,
            "@p_pc": pc,
          },
        };

        let data: any;

        try {
          data = await processApi<any>("procedure", para);
        } catch (error) {
          data = null;
        }

        if (data.isSuccess !== true) {
          console.log("[오류 발생]");
          console.log(data);
          throw data.resultMessage;
        } else {
          setFilters((prev) => ({
            ...prev,
            find_row_value: data.returnString,
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
    setLoading(false);
  };

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "사용자 정보";
      _export.save(optionsGridOne);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>사용자 정보</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="SY_A0012W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
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
              <th>부서코드</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>퇴사여부</th>
              <td>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radRtrchk"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th>사용자명ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자명</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="user_category"
                    value={filters.user_category}
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
          <FormContext3.Provider
            value={{
              menuId,
              setMenuId,
              mainDataState,
              setMainDataState,
            }}
          >
            <GridContainer width="100%">
              <GridTitleContainer>
                <GridTitle>사용자 리스트</GridTitle>

                {permissions && (
                  <ButtonContainer>
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
                )}
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export = exporter)}
                data={mainDataResult.data}
                fileName="사용자 정보"
              >
                <Grid
                  style={{ height: "77.8vh" }}
                  data={process(
                    mainDataResult.data.map((row, idx) => ({
                      ...row,
                      birdt: row.birdt
                        ? new Date(dateformat(row.birdt))
                        : new Date(dateformat("19000101")),
                      apply_start_date: row.apply_start_date
                        ? new Date(dateformat(row.apply_start_date))
                        : new Date(dateformat("19000101")),
                      apply_end_date: row.apply_end_date
                        ? new Date(dateformat(row.apply_end_date))
                        : new Date(dateformat("19000101")),
                      home_menu_id_web: menuListData.find(
                        (item: any) => item.sub_code == row.home_menu_id_web
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
                    customOptionData.menuCustomColumnOptions["grdList"].map(
                      (item: any, idx: number) => {
                        const caption = getCaption(item.id, item.caption);
                        return (
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={caption}
                              width={item.width}
                              cell={
                                NameField.includes(item.fieldName)
                                  ? NameCell
                                  : CustomField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : EncryptedField2.includes(item.fieldName)
                                  ? EncryptedCell2
                                  : EncryptedField.includes(item.fieldName)
                                  ? EncryptedCell
                                  : checkField.includes(item.fieldName)
                                  ? CheckBoxCell
                                  : DateField.includes(item.fieldName)
                                  ? DateCell
                                  : CustomRadioField.includes(item.fieldName)
                                  ? CustomRadioCell
                                  : CustonCommandField.includes(item.fieldName)
                                  ? ColumnCommandCell
                                  : CustomPopupField.includes(item.fieldName)
                                  ? ColumnPopUpCell
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
                            />
                          )
                        );
                      }
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </FormContext3.Provider>
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
    </>
  );
};

export default SY_A0120;
