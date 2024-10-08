import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridHeaderSelectionChangeEvent,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  GridSortChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import {
  useCallback,
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
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import ExcelUploadButton from "../Buttons/ExcelUploadButton";
import CheckBoxCell from "../Cells/CheckBoxCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  getBizCom,
  getFormId,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import CommentsGrid from "../Grids/CommentsGrid";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import Window from "./WindowComponent/Window";

let deletedMainRows: any[] = [];

const DATA_ITEM_KEY = "num";
const idGetter = getter(DATA_ITEM_KEY);

type TKendoWindow = {
  setVisible(t: boolean): void;
  reloadData(workType: string, groupCode?: string): void;
  workType: string;
  group_code?: string;
  isCopy: boolean;
  modal?: boolean;
};
let targetRowIndex: null | number = null;
let temp = 0;
let temp2 = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const KendoWindow = ({
  setVisible,
  reloadData,
  workType,
  group_code = "",
  isCopy,
  modal = false,
}: TKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const serviceCategory = loginResult ? loginResult.serviceCategory : "";
  let gridRef: any = useRef(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const setLoading = useSetRecoilState(isLoading);
  const [field1, setField1] = useState("세부코드명1");
  const [field2, setField2] = useState("세부코드명2");
  const [field3, setField3] = useState("세부코드명3");
  const [field4, setField4] = useState("세부코드명4");
  const [field5, setField5] = useState("세부코드명5");
  const [field6, setField6] = useState("세부코드명6");
  const [field7, setField7] = useState("세부코드명7");
  const [field8, setField8] = useState("세부코드명8");
  const [field9, setField9] = useState("세부코드명9");
  const [field10, setField10] = useState("세부코드명10");
  const [num1, setNum1] = useState("숫자참조1");
  const [num2, setNum2] = useState("숫자참조2");
  const [num3, setNum3] = useState("숫자참조3");
  const [num4, setNum4] = useState("숫자참조4");
  const [num5, setNum5] = useState("숫자참조5");
  const [dataState, setDataState] = useState<State>({
    sort: [],
  });
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "use_yn") {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInitialVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001, L_BA000", setBizComponentData);

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowButtonContainer");
      height4 = getHeight(".WindowButtonContainer2");
      height5 = getHeight(".WindowButtonContainer3");

      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height3
      );
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height4
      );
      setMobileHeight3(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height5
      );
      setWebHeight(
        (getWindowDeviceHeight(false, position.height) - height - height2) / 2
      );
      setWebHeight2(
        (getWindowDeviceHeight(false, position.height) - height - height2) / 2
      );
      setWebHeight3(
        (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
          height5
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2
    );
    setWebHeight2(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2
    );
    setWebHeight3(
      (getWindowDeviceHeight(false, position.height) - height - height2) / 2 -
        height5
    );
  };

  const onClose = () => {
    temp = 0;
    temp2 = 0;
    if (unsavedName.length > 0) setDeletedName(unsavedName);

    setVisible(false);
  };

  const processApi = useApi();
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onHeaderSelectionChange = useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setDetailSelectedState(newSelectedState);
    },
    []
  );
  const onSelectionChange = useCallback(
    (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: detailSelectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setDetailSelectedState(newSelectedState);
    },
    [detailSelectedState]
  );
  const onGridSortChange = (e: GridSortChangeEvent) => {
    setDataState((prev: any) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
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
      field != "insert_userid" &&
      field != "insert_pc" &&
      field != "insert_time" &&
      field != "update_userid" &&
      field != "update_pc1" &&
      field != "update_time1" &&
      !(
        field == "sub_code" &&
        (dataItem.rowstatus == "U" || dataItem.rowstatus == "")
      )
    ) {
      const newData = detailDataResult.data.map((item) =>
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
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: detailDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != detailDataResult.data) {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(detailSelectedState)[0]
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
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onGridDataStateChange = (event: GridDataStateChangeEvent) => {
    setDataState(event.dataState);
  };

  useEffect(() => {
    if (
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null &&
      (workType == "U" || isCopy == true)
    ) {
      fetchMain();
    }
  }, [permissions, bizComponentData, customOptionData]);
  const [initialVal, setInitialVal] = useState({
    group_code: "",
    group_name: "",
    code_length: 0,
    field_caption1: "",
    field_caption2: "",
    field_caption3: "",
    field_caption4: "",
    field_caption5: "",
    field_caption6: "",
    field_caption7: "",
    field_caption8: "",
    field_caption9: "",
    field_caption10: "",
    numref_caption1: "",
    numref_caption2: "",
    numref_caption3: "",
    numref_caption4: "",
    numref_caption5: "",
    memo: "",
    use_yn: "Y",
    attdatnum: "",
    files: "",
  });

  const parameters: Iparameters = {
    procedureName: "P_SY_A0010W_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "LIST",
      "@p_group_code": group_code,
      "@p_group_name": "",
      "@p_group_category": "",
      "@p_field_caption": "",
      "@p_memo": "",
      "@p_sub_code": "",
      "@p_code_name": "",
      "@p_find_row_value": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const row = data.tables[0].Rows[0];

      setInitialVal((prev) => {
        return {
          ...prev,
          field_caption1: row.field_caption1 ?? "",
          field_caption2: row.field_caption2 ?? "",
          field_caption3: row.field_caption3 ?? "",
          field_caption4: row.field_caption4 ?? "",
          field_caption5: row.field_caption5 ?? "",
          field_caption6: row.field_caption6 ?? "",
          field_caption7: row.field_caption7 ?? "",
          field_caption8: row.field_caption8 ?? "",
          field_caption9: row.field_caption9 ?? "",
          field_caption10: row.field_caption10 ?? "",
          numref_caption1: row.numref_caption1 ?? "",
          numref_caption2: row.numref_caption2 ?? "",
          numref_caption3: row.numref_caption3 ?? "",
          numref_caption4: row.numref_caption4 ?? "",
          numref_caption5: row.numref_caption5 ?? "",
          group_code: row.group_code,
          group_name: row.group_name,
          code_length: row.code_length,
          memo: row.memo ?? "",
          use_yn: row.use_yn,
          attdatnum: row.attdatnum,
        };
      });
      setFilters((prev) => ({
        ...prev,
        group_code: row.group_code,
        isSearch: true,
      }));
    }
    setLoading(false);
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    // true면 조회조건(filters) 변경 되었을때 조회
    pgSize: PAGE_SIZE,
    group_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //상세그리드 조회
  const fetchGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);

    const detailParameters: Iparameters = {
      procedureName: "P_SY_A0010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_group_code": filters.group_code,
        "@p_group_name": "",
        "@p_group_category": "",
        "@p_field_caption": "",
        "@p_memo": "",
        "@p_sub_code": "",
        "@p_code_name": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          rowstatus: workType == "N" ? "N" : "",
          extra_field1: row.extra_field1 ?? "",
          extra_field2: row.extra_field2 ?? "",
          extra_field3: row.extra_field3 ?? "",
          extra_field4: row.extra_field4 ?? "",
          extra_field5: row.extra_field5 ?? "",
          extra_field6: row.extra_field6 ?? "",
          extra_field7: row.extra_field7 ?? "",
          extra_field8: row.extra_field8 ?? "",
          extra_field9: row.extra_field9 ?? "",
          extra_field10: row.extra_field10 ?? "",
          memo: row.memo ?? "",
          update_pc: row.update_pc ?? "",
          update_time: row.update_time ?? "",
          update_userid: row.update_userid ?? "",
        };
      });

      if (totalRowCnt > 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.sub_code == filters.find_row_value
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
        setDetailDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.sub_code == filters.find_row_value);

        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setDetailSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
        setField1(
          initialVal.field_caption1 == "" || initialVal.field_caption1 == null
            ? "세부코드명1"
            : initialVal.field_caption1
        );
        setField2(
          initialVal.field_caption2 == "" || initialVal.field_caption2 == null
            ? "세부코드명2"
            : initialVal.field_caption2
        );
        setField3(
          initialVal.field_caption3 == "" || initialVal.field_caption3 == null
            ? "세부코드명3"
            : initialVal.field_caption3
        );
        setField4(
          initialVal.field_caption4 == "" || initialVal.field_caption4 == null
            ? "세부코드명4"
            : initialVal.field_caption4
        );
        setField5(
          initialVal.field_caption5 == "" || initialVal.field_caption5 == null
            ? "세부코드명5"
            : initialVal.field_caption5
        );
        setField6(
          initialVal.field_caption6 == "" || initialVal.field_caption6 == null
            ? "세부코드명6"
            : initialVal.field_caption6
        );
        setField7(
          initialVal.field_caption7 == "" || initialVal.field_caption7 == null
            ? "세부코드명7"
            : initialVal.field_caption7
        );
        setField8(
          initialVal.field_caption8 == "" || initialVal.field_caption8 == null
            ? "세부코드명8"
            : initialVal.field_caption8
        );
        setField9(
          initialVal.field_caption9 == "" || initialVal.field_caption9 == null
            ? "세부코드명9"
            : initialVal.field_caption9
        );
        setField10(
          initialVal.field_caption10 == "" || initialVal.field_caption10 == null
            ? "세부코드명10"
            : initialVal.field_caption10
        );
        setNum1(
          initialVal.numref_caption1 == null || initialVal.numref_caption1 == ""
            ? "숫자참조1"
            : initialVal.numref_caption1
        );
        setNum2(
          initialVal.numref_caption2 == null || initialVal.numref_caption2 == ""
            ? "숫자참조2"
            : initialVal.numref_caption2
        );
        setNum3(
          initialVal.numref_caption3 == null || initialVal.numref_caption3 == ""
            ? "숫자참조3"
            : initialVal.numref_caption3
        );
        setNum4(
          initialVal.numref_caption4 == null || initialVal.numref_caption4 == ""
            ? "숫자참조4"
            : initialVal.numref_caption4
        );
        setNum5(
          initialVal.numref_caption5 == null || initialVal.numref_caption5 == ""
            ? "숫자참조5"
            : initialVal.numref_caption5
        );
      }
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

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    group_code: "",
    group_name: "",
    code_length: "",
    field_caption1: "",
    field_caption2: "",
    field_caption3: "",
    field_caption4: "",
    field_caption5: "",
    field_caption6: "",
    field_caption7: "",
    field_caption8: "",
    field_caption9: "",
    field_caption10: "",
    attdatnum: "",
    files: "",
    memo: "",
    use_yn: "",
    userid: userId,
    pc: pc,
    form_id: getFormId(),
  });

  useEffect(() => {
    if (permissions.view && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      if (filters.group_code != "") {
        //SY_A0010W에만 if문사용
        setFilters((prev) => ({
          ...prev,
          isSearch: false,
        })); // 한번만 조회되도록

        fetchGrid(deepCopiedFilters);
      }
    }
  }, [filters, permissions]);

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_SY_A0010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_group_code": paraData.group_code,
      "@p_group_name": paraData.group_name,
      "@p_code_length": paraData.code_length,
      "@p_group_category": "DD", // 애견유치원
      "@p_field_caption1": paraData.field_caption1,
      "@p_field_caption2": paraData.field_caption2,
      "@p_field_caption3": paraData.field_caption3,
      "@p_field_caption4": paraData.field_caption4,
      "@p_field_caption5": paraData.field_caption5,
      "@p_field_caption6": paraData.field_caption6,
      "@p_field_caption7": paraData.field_caption7,
      "@p_field_caption8": paraData.field_caption8,
      "@p_field_caption9": paraData.field_caption9,
      "@p_field_caption10": paraData.field_caption10,
      "@p_attdatnum": paraData.attdatnum,
      "@p_memo": paraData.memo,
      "@p_use_yn": paraData.use_yn,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [detailDataResult]);

  const fetchMainSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      deletedMainRows = [];
      setUnsavedName([]);
      if (workType == "U") {
        reloadData("U", paraData.group_code);
        fetchMain();
      } else {
        setVisible(false);
        reloadData("N", paraData.group_code);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
    setLoading(false);
  };

  const fetchGridSaved = async (paraSaved: any) => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      // 초기화
      const isLastDataDeleted =
        detailDataResult.data.length == 0 && filters.pgNum > 0;
      setUnsavedName([]);
      setValues2(false);
      if (isLastDataDeleted) {
        setPage({
          skip:
            filters.pgNum == 1 || filters.pgNum == 0
              ? 0
              : PAGE_SIZE * (filters.pgNum - 2),
          take: PAGE_SIZE,
        });
      }
      setFilters((prev) => ({
        ...prev,
        find_row_value: paraData.work_type != "D" ? data.returnString : "",
        pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }
  };

  const handleSubmit = () => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;
    let valid3 = true;

    detailDataResult.data.forEach((item: any, idx: number) => {
      if (initialVal.code_length < item.sub_code.length && valid == true) {
        valid = false;
      }
      detailDataResult.data.forEach((chkItem: any, chkIdx: number) => {
        if (
          item.sub_code == chkItem.sub_code &&
          idx !== chkIdx &&
          valid2 == true
        ) {
          valid2 = false;
        }
      });

      if (!item.sub_code) {
        valid3 = false;
      }
      if (!item.code_name) {
        valid3 = false;
      }
      if (!item.sort_seq) {
        valid3 = false;
      }
      if (!initialVal.group_code) {
        valid3 = false;
      }
      if (!initialVal.group_name) {
        valid3 = false;
      }
    });

    if (!valid) {
      alert("세부코드의 길이가 설정하신 세부코드길이보다 큽니다.");
      return false;
    }
    if (!valid2) {
      alert("세부코드가 중복되었습니다.");
      return false;
    }
    if (!valid3) {
      alert("필수값을 채워주세요.");
      return false;
    }

    if (detailDataResult.total == 0) {
      alert("데이터가 없습니다.");
      return false;
    }
    const dataItem = detailDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    const {
      group_code,
      group_name,
      code_length,
      field_caption1,
      field_caption2,
      field_caption3,
      field_caption4,
      field_caption5,
      field_caption6,
      field_caption7,
      field_caption8,
      field_caption9,
      field_caption10,
      memo,
      attdatnum,
      files,
      use_yn,
    } = initialVal;

    deletedMainRows.forEach((item: any) => {
      const { sub_code } = item;

      const paraSaved: Iparameters = {
        procedureName: "P_SY_A0010W_S1",
        pageNumber: 1,
        pageSize: 10,
        parameters: {
          "@p_work_type": "D",
          "@p_group_code": group_code,
          "@p_sub_code": sub_code,
          "@p_code_name": "",
          "@p_system_yn": "",
          "@p_extra_field1": "",
          "@p_extra_field2": "",
          "@p_extra_field3": "",
          "@p_extra_field4": "",
          "@p_extra_field5": "",
          "@p_extra_field6": "",
          "@p_extra_field7": "",
          "@p_extra_field8": "",
          "@p_extra_field9": "",
          "@p_extra_field10": "",
          "@p_numref1": 0,
          "@p_numref2": 0,
          "@p_numref3": 0,
          "@p_numref4": 0,
          "@p_numref5": 0,
          "@p_memo": "",
          "@p_sort_seq": 0,
          "@p_use_yn": "",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_attdatnum_img": "",
          "@p_form_id": getFormId(),
        },
      };

      fetchGridSaved(paraSaved);
    });

    deletedMainRows = []; //초기화
    dataItem.forEach((item: any, i: number) => {
      const {
        rowstatus,
        sub_code,
        code_name,
        system_yn,
        use_yn,
        extra_field1 = "",
        extra_field2 = "",
        extra_field3 = "",
        extra_field4 = "",
        extra_field5 = "",
        extra_field6 = "",
        extra_field7 = "",
        extra_field8 = "",
        extra_field9 = "",
        extra_field10 = "",
        numref1,
        numref2,
        numref3,
        numref4,
        numref5,
        sort_seq,
      } = item;

      const paraSaved: Iparameters = {
        procedureName: "P_SY_A0010W_S1",
        pageNumber: 1,
        pageSize: 10,
        parameters: {
          "@p_work_type": rowstatus,
          "@p_group_code": group_code,
          "@p_sub_code": sub_code,
          "@p_code_name": code_name,
          "@p_system_yn": system_yn == "Y" || system_yn == true ? "Y" : "N",
          "@p_extra_field1": extra_field1,
          "@p_extra_field2": extra_field2,
          "@p_extra_field3": extra_field3,
          "@p_extra_field4": extra_field4,
          "@p_extra_field5": extra_field5,
          "@p_extra_field6": extra_field6,
          "@p_extra_field7": extra_field7,
          "@p_extra_field8": extra_field8,
          "@p_extra_field9": extra_field9,
          "@p_extra_field10": extra_field10,
          "@p_numref1": numref1,
          "@p_numref2": numref2,
          "@p_numref3": numref3,
          "@p_numref4": numref4,
          "@p_numref5": numref5,
          "@p_memo": item.memo,
          "@p_sort_seq": sort_seq,
          "@p_use_yn": use_yn == "Y" || use_yn == true ? "Y" : "N",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_attdatnum_img": null,
          "@p_form_id": getFormId(),
        },
      };

      fetchGridSaved(paraSaved);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      group_code: group_code,
      group_name: group_name,
      code_length: code_length.toString(),
      field_caption1: field_caption1,
      field_caption2: field_caption2,
      field_caption3: field_caption3,
      field_caption4: field_caption4,
      field_caption5: field_caption5,
      field_caption6: field_caption6,
      field_caption7: field_caption7,
      field_caption8: field_caption8,
      field_caption9: field_caption9,
      field_caption10: field_caption10,
      attdatnum: attdatnum,
      files: files,
      memo: memo,
      use_yn: use_yn == "Y" ? "Y" : "N",
    }));
  };

  useEffect(() => {
    if (permissions.save && paraData.work_type !== "") fetchMainSaved();
  }, [paraData, permissions]);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const getAttachmentsData = (data: IAttachmentData) => {
    setInitialVal((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onAddClick = () => {
    detailDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      sort_seq: 0,
      use_yn: "Y",
      numref1: 0,
      numref2: 0,
      numref3: 0,
      numref4: 0,
      numref5: 0,
      rowstatus: "N",
    };

    setDetailSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setDetailDataResult((prev) => {
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
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    detailDataResult.data.forEach((item: any, index: number) => {
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
      data = detailDataResult.data[Math.min(...Object2)];
    } else {
      data = detailDataResult.data[Math.min(...Object) - 1];
    }

    const isLastDataDeleted =
      detailDataResult.data.length == 0 && filters.pgNum > 0;

    if (isLastDataDeleted) {
      setPage({
        skip:
          filters.pgNum == 1 || filters.pgNum == 0
            ? 0
            : PAGE_SIZE * (filters.pgNum - 2),
        take: PAGE_SIZE,
      });
    }

    setDetailDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setDetailSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });

    setDataState({});
  };

  const [values2, setValues2] = useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setDetailDataResult((prev) => {
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

  const onCopyClick = () => {
    detailDataResult.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const newData = detailDataResult.data.filter((item) => item.chk == true);

    newData.map((item) => {
      const data = {
        ...item,
        rowstatus: "N",
        num: ++temp2,
      };
      setDetailSelectedState({ [data[DATA_ITEM_KEY]]: true });
      setDetailDataResult((prev) => {
        return {
          data: [data, ...prev.data],
          total: prev.total + 1,
        };
      });
    });
  };

  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
      return;
    }

    const columns: string[] = ["코드", "코드명"];

    setLoading(true);

    let valid = true;

    jsonArr.map((items: any) => {
      Object.keys(items).map((item: any) => {
        if (!columns.includes(item) && valid == true) {
          alert("양식이 맞지 않습니다.");
          valid = false;
          return;
        }
      });
    });

    detailDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    jsonArr.forEach(async (item: any) => {
      let numref1 = 0;
      let numref2 = 0;
      let numref3 = 0;
      if (item.hasOwnProperty("정원")) {
        numref1 = item.정원;
      } else if (item.hasOwnProperty("등원가능횟수")) {
        numref1 = item.등원가능횟수;
        numref2 = item.변경가능횟수;
        numref3 = item.금액;
      }

      const { 코드 = "", 코드명 = "" } = item;

      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        sort_seq: 0,
        use_yn: "Y",
        numref1: numref1,
        numref2: numref2,
        numref3: numref3,
        numref4: 0,
        numref5: 0,
        rowstatus: "N",
        sub_code: 코드,
        code_name: 코드명,
      };

      setDetailSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
      setDetailDataResult((prev) => {
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
    });

    setLoading(false);
  };

  const [excelAttachmentsWindowVisible, setExcelAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onExcelAttachmentsWndClick = () => {
    setExcelAttachmentsWindowVisible(true);
  };

  return (
    <Window
      titles={workType == "N" ? "공통코드 생성" : "공통코드 정보"}
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
            <GridContainer>
              <GridTitleContainer className="WindowButtonContainer">
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
              </GridTitleContainer>
              <FormBoxWrap style={{ height: mobileheight }}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>그룹코드</th>
                      <td>
                        {workType == "N" ? (
                          <Input
                            name="group_code"
                            type="text"
                            value={initialVal.group_code}
                            className="required"
                            onChange={filterInputChange}
                          />
                        ) : (
                          <Input
                            name="group_code"
                            type="text"
                            value={initialVal.group_code}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th>그룹코드명</th>
                      <td>
                        <Input
                          name="group_name"
                          type="text"
                          value={initialVal.group_name}
                          className="required"
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>세부코드길이</th>
                      <td>
                        <Input
                          name="code_length"
                          type="number"
                          value={initialVal.code_length}
                          className="required"
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>사용여부</th>
                      <td>
                        <Checkbox
                          name="use_yn"
                          value={initialVal.use_yn == "Y" ? true : false}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부번호</th>
                      <td colSpan={3}>
                        <Input
                          name="files"
                          type="text"
                          value={initialVal.files}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onAttachmentsWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>메모</th>
                      <td colSpan={3}>
                        <TextArea
                          value={initialVal.memo}
                          name="memo"
                          rows={5}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer>
              <GridTitleContainer className="WindowButtonContainer2">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
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
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(2);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <CommentsGrid
                ref_key={initialVal.group_code}
                form_id={getFormId()}
                table_id={"comCodeMaster"}
                style={{ height: mobileheight2 }}
              />
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2}>
            <GridContainer>
              <GridTitleContainer className="WindowButtonContainer3">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-left"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                  <div>
                    <ExcelUploadButton
                      saveExcel={saveExcel}
                      permissions={{
                        view: true,
                        save: true,
                        delete: true,
                        print: true,
                      }}
                      style={{ marginLeft: "15px" }}
                      disabled={permissions.save ? false : true}
                    />
                    <Button
                      title="Export Excel"
                      onClick={onExcelAttachmentsWndClick}
                      icon="file"
                      fillMode="outline"
                      themeColor={"primary"}
                      disabled={permissions.view ? false : true}
                    >
                      엑셀양식
                    </Button>
                    <Button
                      themeColor={"primary"}
                      onClick={onAddClick}
                      icon="add"
                      title="행 추가"
                      disabled={permissions.save ? false : true}
                    />
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onDeleteClick}
                      icon="minus"
                      title="행 삭제"
                      disabled={permissions.save ? false : true}
                    />
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyClick}
                      icon="copy"
                      title="행 복사"
                      disabled={permissions.save ? false : true}
                    />
                  </div>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: mobileheight3 }}
                data={process(
                  detailDataResult.data.map((item: any) => ({
                    ...item,
                    insert_userid: userListData.find(
                      (items: any) => items.user_id == item.insert_userid
                    )?.user_name,
                    update_userid: userListData.find(
                      (items: any) => items.user_id == item.update_userid
                    )?.user_name,
                    [SELECTED_FIELD]: detailSelectedState[idGetter(item)],
                  })),
                  dataState
                )}
                {...dataState}
                onDataStateChange={onGridDataStateChange}
                // 렌더
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                //선택기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                editField={EDIT_FIELD}
                selectable={{
                  enabled: true,
                  drag: false,
                  cell: false,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                onHeaderSelectionChange={onHeaderSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detailDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                ref={gridRef}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onGridSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
                <GridColumn field="rowstatus" title=" " width="40px" />
                <GridColumn
                  field="sub_code"
                  width="120px"
                  title="세부코드"
                  footerCell={detailTotalFooterCell}
                  headerCell={RequiredHeader}
                />
                <GridColumn
                  field="code_name"
                  width="200px"
                  headerCell={RequiredHeader}
                  title="세부코드명"
                />
                <GridColumn
                  field="system_yn"
                  width="120px"
                  title="시스템코드"
                  cell={CheckBoxCell}
                />
                <GridColumn
                  field="sort_seq"
                  width="120px"
                  title="정렬순서"
                  cell={NumberCell}
                />
                <GridColumn
                  field="use_yn"
                  width="95px"
                  title="사용"
                  cell={CheckBoxCell}
                />
                {/* <GridColumn field="extra_field1" width="200px" title={field1} />
                <GridColumn field="extra_field2" width="200px" title={field2} />
                <GridColumn field="extra_field3" width="200px" title={field3} />
                <GridColumn field="extra_field4" width="200px" title={field4} />
                <GridColumn field="extra_field5" width="200px" title={field5} />
                <GridColumn field="extra_field6" width="200px" title={field6} />
                <GridColumn field="extra_field7" width="200px" title={field7} />
                <GridColumn field="extra_field8" width="200px" title={field8} />
                <GridColumn field="extra_field9" width="200px" title={field9} />
                <GridColumn field="extra_field10" width="200px" title={field10} /> */}

                {!!field1 && field1 != "세부코드명1" && (
                  <GridColumn
                    field="extra_field1"
                    width="200px"
                    title={field1}
                  />
                )}
                {!!field2 && field2 != "세부코드명2" && (
                  <GridColumn
                    field="extra_field2"
                    width="200px"
                    title={field2}
                  />
                )}
                {!!field3 && field3 != "세부코드명3" && (
                  <GridColumn
                    field="extra_field3"
                    width="200px"
                    title={field3}
                  />
                )}
                {!!field4 && field4 != "세부코드명4" && (
                  <GridColumn
                    field="extra_field4"
                    width="200px"
                    title={field4}
                  />
                )}
                {!!field5 && field5 != "세부코드명5" && (
                  <GridColumn
                    field="extra_field5"
                    width="200px"
                    title={field5}
                  />
                )}
                {!!field6 && field6 != "세부코드명6" && (
                  <GridColumn
                    field="extra_field6"
                    width="200px"
                    title={field6}
                  />
                )}
                {!!field7 && field7 != "세부코드명7" && (
                  <GridColumn
                    field="extra_field7"
                    width="200px"
                    title={field7}
                  />
                )}
                {!!field8 && field8 != "세부코드명8" && (
                  <GridColumn
                    field="extra_field8"
                    width="200px"
                    title={field8}
                  />
                )}
                {!!field9 && field9 != "세부코드명9" && (
                  <GridColumn
                    field="extra_field9"
                    width="200px"
                    title={field9}
                  />
                )}
                {!!field10 && field10 != "세부코드명10" && (
                  <GridColumn
                    field="extra_field10"
                    width="200px"
                    title={field10}
                  />
                )}

                {!!num1 && num1 != "숫자참조1" && (
                  <GridColumn
                    field="numref1"
                    width="200px"
                    title={num1}
                    cell={NumberCell}
                  />
                )}
                {!!num2 && num2 != "숫자참조2" && (
                  <GridColumn
                    field="numref2"
                    width="200px"
                    title={num2}
                    cell={NumberCell}
                  />
                )}
                {!!num3 && num3 != "숫자참조3" && (
                  <GridColumn
                    field="numref3"
                    width="200px"
                    title={num3}
                    cell={NumberCell}
                  />
                )}
                {!!num4 && num4 != "숫자참조4" && (
                  <GridColumn
                    field="numref4"
                    width="200px"
                    title={num4}
                    cell={NumberCell}
                  />
                )}
                {!!num5 && num5 != "숫자참조5" && (
                  <GridColumn
                    field="numref5"
                    width="200px"
                    title={num5}
                    cell={NumberCell}
                  />
                )}

                <GridColumn field="memo" width="120px" title="메모" />

                {/* <GridColumn
                  field="numref1"
                  width="200px"
                  title={num1}
                  cell={NumberCell}
                />
                <GridColumn
                  field="numref2"
                  width="200px"
                  title={num2}
                  cell={NumberCell}
                />
                <GridColumn
                  field="numref3"
                  width="200px"
                  title={num3}
                  cell={NumberCell}
                />
                <GridColumn
                  field="numref4"
                  width="200px"
                  title={num4}
                  cell={NumberCell}
                />
                <GridColumn
                  field="numref5"
                  width="200px"
                  title={num5}
                  cell={NumberCell}
                /> */}
                <GridColumn
                  field="insert_userid"
                  width="120px"
                  title="등록자"
                  editable={false}
                />
                <GridColumn
                  field="insert_pc"
                  width="120px"
                  title="등록PC"
                  editable={false}
                />
                <GridColumn
                  field="insert_time"
                  width="120px"
                  title="등록일자"
                  editable={false}
                />
                <GridColumn
                  field="update_userid"
                  width="120px"
                  title="수정자"
                  editable={false}
                />
                <GridColumn
                  field="update_pc"
                  width="120px"
                  title="수정PC"
                  editable={false}
                />
                <GridColumn
                  field="update_time"
                  width="120px"
                  title="수정일자"
                  editable={false}
                />
              </Grid>
              <BottomContainer className="BottomContainer">
                <ButtonContainer>
                  <Button themeColor={"primary"} onClick={handleSubmit}>
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
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`68%`}>
              <FormBoxWrap style={{ height: webheight }}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>그룹코드</th>
                      <td>
                        {workType == "N" ? (
                          <Input
                            name="group_code"
                            type="text"
                            value={initialVal.group_code}
                            className="required"
                            onChange={filterInputChange}
                          />
                        ) : (
                          <Input
                            name="group_code"
                            type="text"
                            value={initialVal.group_code}
                            className="readonly"
                          />
                        )}
                      </td>
                      <th>그룹코드명</th>
                      <td>
                        <Input
                          name="group_name"
                          type="text"
                          value={initialVal.group_name}
                          className="required"
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>세부코드길이</th>
                      <td>
                        <Input
                          name="code_length"
                          type="number"
                          value={initialVal.code_length}
                          className="required"
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>사용여부</th>
                      <td>
                        <Checkbox
                          name="use_yn"
                          value={initialVal.use_yn == "Y" ? true : false}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부번호</th>
                      <td colSpan={3}>
                        <Input
                          name="files"
                          type="text"
                          value={initialVal.files}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onAttachmentsWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>메모</th>
                      <td colSpan={3}>
                        <TextArea
                          value={initialVal.memo}
                          name="memo"
                          rows={5}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(32% - ${GAP}px)`}>
              <CommentsGrid
                ref_key={initialVal.group_code}
                form_id={getFormId()}
                table_id={"comCodeMaster"}
                style={{ height: webheight2 }}
              />
            </GridContainer>
          </GridContainerWrap>
          <GridContainer>
            <ButtonContainer className="WindowButtonContainer3">
              <ExcelUploadButton
                saveExcel={saveExcel}
                permissions={{
                  view: true,
                  save: true,
                  delete: true,
                  print: true,
                }}
                style={{ marginLeft: "15px" }}
                disabled={permissions.save ? false : true}
              />
              <Button
                title="Export Excel"
                onClick={onExcelAttachmentsWndClick}
                icon="file"
                fillMode="outline"
                themeColor={"primary"}
                disabled={permissions.view ? false : true}
              >
                엑셀양식
              </Button>
              <Button
                themeColor={"primary"}
                onClick={onAddClick}
                icon="add"
                title="행 추가"
                disabled={permissions.save ? false : true}
              />
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onDeleteClick}
                icon="minus"
                title="행 삭제"
                disabled={permissions.save ? false : true}
              />
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onCopyClick}
                icon="copy"
                title="행 복사"
                disabled={permissions.save ? false : true}
              />
            </ButtonContainer>
            <Grid
              style={{ height: webheight3 }}
              data={process(
                detailDataResult.data.map((item: any) => ({
                  ...item,
                  insert_userid: userListData.find(
                    (items: any) => items.user_id == item.insert_userid
                  )?.user_name,
                  update_userid: userListData.find(
                    (items: any) => items.user_id == item.update_userid
                  )?.user_name,
                  [SELECTED_FIELD]: detailSelectedState[idGetter(item)],
                })),
                dataState
              )}
              {...dataState}
              onDataStateChange={onGridDataStateChange}
              // 렌더
              onItemChange={onMainItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              //선택기능
              dataItemKey={DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              editField={EDIT_FIELD}
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: "single",
              }}
              onSelectionChange={onSelectionChange}
              onHeaderSelectionChange={onHeaderSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={detailDataResult.total}
              skip={page.skip}
              take={page.take}
              pageable={true}
              onPageChange={pageChange}
              ref={gridRef}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onGridSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="chk"
                title=" "
                width="45px"
                headerCell={CustomCheckBoxCell2}
                cell={CheckBoxCell}
              />
              <GridColumn field="rowstatus" title=" " width="40px" />
              <GridColumn
                field="sub_code"
                width="120px"
                title="세부코드"
                footerCell={detailTotalFooterCell}
                headerCell={RequiredHeader}
              />
              <GridColumn
                field="code_name"
                width="200px"
                headerCell={RequiredHeader}
                title="세부코드명"
              />
              <GridColumn
                field="system_yn"
                width="120px"
                title="시스템코드"
                cell={CheckBoxCell}
              />
              <GridColumn
                field="sort_seq"
                width="120px"
                title="정렬순서"
                cell={NumberCell}
              />
              <GridColumn
                field="use_yn"
                width="95px"
                title="사용"
                cell={CheckBoxCell}
              />
              {/* <GridColumn field="extra_field1" width="200px" title={field1} />
              <GridColumn field="extra_field2" width="200px" title={field2} />
              <GridColumn field="extra_field3" width="200px" title={field3} />
              <GridColumn field="extra_field4" width="200px" title={field4} />
              <GridColumn field="extra_field5" width="200px" title={field5} />
              <GridColumn field="extra_field6" width="200px" title={field6} />
              <GridColumn field="extra_field7" width="200px" title={field7} />
              <GridColumn field="extra_field8" width="200px" title={field8} />
              <GridColumn field="extra_field9" width="200px" title={field9} />
              <GridColumn field="extra_field10" width="200px" title={field10} /> */}

              {!!field1 && field1 != "세부코드명1" && (
                <GridColumn field="extra_field1" width="200px" title={field1} />
              )}
              {!!field2 && field2 != "세부코드명2" && (
                <GridColumn field="extra_field2" width="200px" title={field2} />
              )}
              {!!field3 && field3 != "세부코드명3" && (
                <GridColumn field="extra_field3" width="200px" title={field3} />
              )}
              {!!field4 && field4 != "세부코드명4" && (
                <GridColumn field="extra_field4" width="200px" title={field4} />
              )}
              {!!field5 && field5 != "세부코드명5" && (
                <GridColumn field="extra_field5" width="200px" title={field5} />
              )}
              {!!field6 && field6 != "세부코드명6" && (
                <GridColumn field="extra_field6" width="200px" title={field6} />
              )}
              {!!field7 && field7 != "세부코드명7" && (
                <GridColumn field="extra_field7" width="200px" title={field7} />
              )}
              {!!field8 && field8 != "세부코드명8" && (
                <GridColumn field="extra_field8" width="200px" title={field8} />
              )}
              {!!field9 && field9 != "세부코드명9" && (
                <GridColumn field="extra_field9" width="200px" title={field9} />
              )}
              {!!field10 && field10 != "세부코드명10" && (
                <GridColumn
                  field="extra_field10"
                  width="200px"
                  title={field10}
                />
              )}

              {!!num1 && num1 != "숫자참조1" && (
                <GridColumn
                  field="numref1"
                  width="200px"
                  title={num1}
                  cell={NumberCell}
                />
              )}
              {!!num2 && num2 != "숫자참조2" && (
                <GridColumn
                  field="numref2"
                  width="200px"
                  title={num2}
                  cell={NumberCell}
                />
              )}
              {!!num3 && num3 != "숫자참조3" && (
                <GridColumn
                  field="numref3"
                  width="200px"
                  title={num3}
                  cell={NumberCell}
                />
              )}
              {!!num4 && num4 != "숫자참조4" && (
                <GridColumn
                  field="numref4"
                  width="200px"
                  title={num4}
                  cell={NumberCell}
                />
              )}
              {!!num5 && num5 != "숫자참조5" && (
                <GridColumn
                  field="numref5"
                  width="200px"
                  title={num5}
                  cell={NumberCell}
                />
              )}

              <GridColumn field="memo" width="120px" title="메모" />

              {/* <GridColumn
                field="numref1"
                width="200px"
                title={num1}
                cell={NumberCell}
              />
              <GridColumn
                field="numref2"
                width="200px"
                title={num2}
                cell={NumberCell}
              />
              <GridColumn
                field="numref3"
                width="200px"
                title={num3}
                cell={NumberCell}
              />
              <GridColumn
                field="numref4"
                width="200px"
                title={num4}
                cell={NumberCell}
              />
              <GridColumn
                field="numref5"
                width="200px"
                title={num5}
                cell={NumberCell}
              /> */}
              <GridColumn
                field="insert_userid"
                width="120px"
                title="등록자"
                editable={false}
              />
              <GridColumn
                field="insert_pc"
                width="120px"
                title="등록PC"
                editable={false}
              />
              <GridColumn
                field="insert_time"
                width="120px"
                title="등록일자"
                editable={false}
              />
              <GridColumn
                field="update_userid"
                width="120px"
                title="수정자"
                editable={false}
              />
              <GridColumn
                field="update_pc"
                width="120px"
                title="수정PC"
                editable={false}
              />
              <GridColumn
                field="update_time"
                width="120px"
                title="수정일자"
                editable={false}
              />
            </Grid>
          </GridContainer>
          <BottomContainer className="BottomContainer">
            <ButtonContainer>
              {permissions.save && (
                <Button themeColor={"primary"} onClick={handleSubmit}>
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
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={initialVal.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
      {excelAttachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setExcelAttachmentsWindowVisible}
          para={"SY_A0010W_301_" + initialVal.group_code} // 그룹코드에 따라 양식 분리
          permission={{
            upload: serviceCategory == "MANAGEMENT",
            download: permissions.view,
            delete: serviceCategory == "MANAGEMENT",
          }}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
