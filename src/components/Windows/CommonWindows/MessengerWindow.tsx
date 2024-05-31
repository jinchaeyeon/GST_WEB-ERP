import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { getSelectedState } from "@progress/kendo-react-treelist";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  isFilterHideState2,
  isLoading,
  loginResultState,
} from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import CheckBoxCell from "../../Cells/CheckBoxCell";
import {
  UseGetValueFromSessionItem,
  getGridItemChangedData,
  getHeight,
  useSysMessage,
} from "../../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import WindowFilterContainer from "../../Containers/WindowFilterContainer";
import { CellRender, RowRender } from "../../Renderers/Renderers";
import Window from "../WindowComponent/Window";

const topHeight = 55;
const bottomHeight = 55;
const leftOverHeight = (topHeight + bottomHeight) / 2;

type TKendoWindow = {
  setVisible(t: boolean): void;
  reload(): void;
  id?: string;
  modal?: boolean;
};
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
var height9 = 0;
var height10 = 0;
var height11 = 0;

const KendoWindow = ({
  setVisible,
  reload,
  id,
  modal = false,
}: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const pc = UseGetValueFromSessionItem("pc");
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 800,
  });
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0); //탭1그리드
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0); //탭2그리드
  const [webheight2, setWebHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0); //탭3그리드
  const [webheight3, setWebHeight3] = useState(0);

  const [tabSelected, setTabSelected] = useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowButtonContainer4"); //조회버튼
    height3 = getHeight(".BottomContainer"); //하단 버튼부분
    height4 = getHeight(".visible-mobile-only2"); //필터 모바일
    height5 = getHeight(".filterBox2"); //필터 웹
    height6 = getHeight(".k-tabstrip-items-wrapper"); //탭 부분
    height7 = getHeight(".FormBoxWrap"); //폼박스 부분
    height8 = getHeight(".FormBoxWrap"); //폼박스 부분2
    height9 = getHeight(".WindowButtonContainer"); //버튼 부분
    height10 = getHeight(".WindowButtonContainer2"); //버튼 부분
    height11 = getHeight(".WindowButtonContainer3"); //버튼 부분

    setMobileHeight(deviceHeight - height - height6 - height9);
    setMobileHeight2(deviceHeight - height - height6 - height10);
    setMobileHeight3(
      deviceHeight - height - height6 - height2 - height4 - height11 - height3
    );

    setWebHeight(position.height - height - height6 - height7);
    setWebHeight2(position.height - height - height6 - height8);
    setWebHeight3(
      position.height - height - height6 - height2 - height5 - height3
    );
  }, [tabSelected]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(position.height - height - height6 - height7);
    setWebHeight2(position.height - height - height6 - height8);
    setWebHeight3(
      position.height - height - height6 - height2 - height5 - height3
    );
  };

  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    content: "",
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
    reload();
  };

  const onConfirmClick = () => {
    const dataItem = mainDataResult3.data.filter(
      (item: any) => item.chk == true
    );

    if (dataItem.length != 0) {
      let dataArr: any = {
        receiver_id_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const { user_id = "" } = item;

        dataArr.receiver_id_s.push(user_id);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "new",
        receiver_id_s: dataArr.receiver_id_s.join("|"),
        slip_content: Information.content,
        sender_id: userId,
      }));
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    slip_id: "",
    receiver_id: "",
    slip_content: "",
    pc: pc,
    slip_save: "",
    sender_id: "",
    receiver_id_s: "",
  });

  const para: Iparameters = {
    procedureName: "sys_sav_messenger",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_slip_id": ParaData.slip_id,
      "@p_receiver_id": ParaData.receiver_id,
      "@p_slip_content": ParaData.slip_content,
      "@p_slip_save": ParaData.slip_save,
      "@p_sender_id": ParaData.sender_id,
      "@p_pc": pc,
      "@p_receiver_id_s": ParaData.receiver_id_s,
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onSearch = () => {
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
    setFilters3((prev) => ({
      ...prev,
      user_id: "",
      pgNum: 1,
      check: false,
      isSearch: true,
    }));
    setInformation({
      content: "",
    });
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
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
      setValues2(false);
      if (ParaData.workType == "new") {
        alert("쪽지가 전송되었습니다.");
      }
      if (ParaData.workType != "read") {
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          pgNum: 1,
          isSearch: true,
        }));
        setFilters3((prev) => ({
          ...prev,
          user_id: "",
          pgNum: 1,
          check: false,
          isSearch: true,
        }));
        setInformation({
          content: "",
        });
      }
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        slip_id: "",
        receiver_id: "",
        slip_content: "",
        sender_id: "",
        pc: pc,
        slip_save: "",
        receiver_id_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [filters, setFilters] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [filters2, setFilters2] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [filters3, setFilters3] = useState({
    pgNum: 1,
    user_id: "",
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  //메인 그리드 선택 이벤트
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    onRead(selectedRowData);

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const gridRef = useRef<any>(null);
  const gridRef2 = useRef<any>(null);
  const gridRef3 = useRef<any>(null);

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

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "receive",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        if (id != undefined) {
          const selectRow = rows.filter((item: any) => item.slip_id == id)[0];
          setSelectedState({ [selectRow[DATA_ITEM_KEY]]: true });
          if (tabSelected == 0) {
            onRead(selectRow);
          }
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          if (tabSelected == 0) {
            onRead(rows[0]);
          }
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
  };

  //그리드 조회
  const fetchMainGrid2 = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "send",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
  };

  //그리드 조회
  const fetchMainGrid3 = async (filters: any) => {
    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "users",
        "@p_user_id": filters.user_id,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        chk: filters.check == true ? "Y" : "N",
      }));

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
  };

  const [values2, setValues2] = useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult3((prev) => {
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
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
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
    if (field == "chk") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult3.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult3((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length != 0) {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "d_received",
        slip_id: selectRows.slip_id,
        receiver_id: userId,
        slip_content: selectRows.slip_content,
        sender_id: selectRows.sender_id,
      }));

      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult2.data.length != 0) {
      const selectRows = mainDataResult2.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "d_sent",
        slip_id: selectRows.slip_id,
        slip_content: selectRows.slip_content,
        sender_id: selectRows.sender_id,
      }));

      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onRead = (selectRows: any) => {
    if (selectRows != undefined) {
      if (selectRows.read_time == "" || selectRows.read_time == null) {
        setParaData((prev) => ({
          ...prev,
          workType: "read",
          receiver_id: userId,
          slip_id: selectRows.slip_id,
          slip_content: selectRows.slip_content,
          sender_id: selectRows.sender_id,
        }));
      }
    }
  };

  const onReceive = () => {
    if (mainDataResult.data.length != 0) {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setTabSelected(2);

      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        check: true,
        pgNum: 1,
        user_id: selectRows.sender_id,
      }));
    }
  };

  return (
    <Window
      titles={"Messenger"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab title="받은 쪽지">
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
                <GridContainer style={{ width: "100%" }}>
                  <Grid
                    style={{ height: mobileheight + height9 }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                  >
                    <GridColumn
                      field="sender_name"
                      title="보낸사람"
                      width="120px"
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn
                      field="slip_content"
                      title="내용"
                      width="200px"
                    />
                    <GridColumn
                      field="send_time"
                      title="보낸시각"
                      width="150px"
                    />
                    <GridColumn
                      field="read_time"
                      title="읽은시각"
                      width="150px"
                    />
                    <GridColumn
                      field="receivers"
                      title="받는사람"
                      width="120px"
                    />
                  </Grid>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1} style={{ flexDirection: "column" }}>
                <ButtonContainer
                  className="WindowButtonContainer"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                  <ButtonContainer>
                    <Button
                      onClick={onReceive}
                      themeColor={"primary"}
                      icon={"email"}
                    >
                      답장
                    </Button>
                    <Button
                      onClick={onSearch}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      icon={"refresh"}
                    >
                      재조회
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      icon={"delete"}
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                </ButtonContainer>
                <FormBoxWrap
                  border={true}
                  className="FormBoxWrap"
                  style={{
                    width: "100%",
                    overflow: "auto",
                    height: mobileheight,
                  }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>보낸사람</th>
                        <td>
                          <Input
                            name="sender_name"
                            type="text"
                            value={
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].sender_name
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>받은사람</th>
                        <td>
                          <Input
                            name="receivers"
                            type="text"
                            value={
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].receivers
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>내용</th>
                        <td>
                          <TextArea
                            value={
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].slip_content
                            }
                            name="slip_content"
                            rows={3}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>보낸시각</th>
                        <td>
                          <Input
                            name="send_time"
                            type="text"
                            value={
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].send_time
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>읽은시각</th>
                        <td>
                          <Input
                            name="read_time"
                            type="text"
                            value={
                              mainDataResult.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY] ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY] ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].read_time
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer>
                <Grid
                  style={{ height: webheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
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
                >
                  <GridColumn
                    field="sender_name"
                    title="보낸사람"
                    width="120px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn field="slip_content" title="내용" width="200px" />
                  <GridColumn
                    field="send_time"
                    title="보낸시각"
                    width="150px"
                  />
                  <GridColumn
                    field="read_time"
                    title="읽은시각"
                    width="150px"
                  />
                  <GridColumn
                    field="receivers"
                    title="받는사람"
                    width="120px"
                  />
                </Grid>
              </GridContainer>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <ButtonContainer>
                  <Button
                    onClick={onReceive}
                    themeColor={"primary"}
                    icon={"email"}
                  >
                    답장
                  </Button>
                  <Button
                    onClick={onSearch}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon={"refresh"}
                  >
                    재조회
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon={"delete"}
                  >
                    삭제
                  </Button>
                </ButtonContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: "10%" }}>보낸사람</th>
                      <td>
                        <Input
                          name="sender_name"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].sender_name
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th style={{ width: "10%" }}>받은사람</th>
                      <td>
                        <Input
                          name="receivers"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].receivers
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>내용</th>
                      <td>
                        <TextArea
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].slip_content
                          }
                          name="slip_content"
                          rows={3}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>보낸시각</th>
                      <td>
                        <Input
                          name="send_time"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].send_time
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>읽은시각</th>
                      <td>
                        <Input
                          name="read_time"
                          type="text"
                          value={
                            mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY] ==
                                    Object.getOwnPropertyNames(selectedState)[0]
                                )[0].read_time
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="보낸 쪽지">
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
                <GridContainer style={{ width: "100%" }}>
                  <Grid
                    style={{ height: mobileheight2 + height10 }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                      })),
                      mainDataState2
                    )}
                    {...mainDataState2}
                    onDataStateChange={onMainDataStateChange2}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange2}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult2.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    <GridColumn
                      field="receivers"
                      title="받는사람"
                      width="120px"
                      footerCell={mainTotalFooterCell2}
                    />
                    <GridColumn
                      field="slip_content"
                      title="내용"
                      width="200px"
                    />
                    <GridColumn
                      field="send_time"
                      title="보낸시각"
                      width="150px"
                    />
                  </Grid>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1} style={{ flexDirection: "column" }}>
                <ButtonContainer
                  className="WindowButtonContainer2"
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="arrow-left"
                    themeColor={"primary"}
                    fillMode={"outline"}
                  >
                    이전
                  </Button>
                  <ButtonContainer>
                    <Button
                      onClick={onSearch}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      icon={"refresh"}
                    >
                      재조회
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      icon={"delete"}
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                </ButtonContainer>
                <FormBoxWrap
                  border={true}
                  className="FormBoxWrap"
                  style={{
                    width: "100%",
                    overflow: "auto",
                    height: mobileheight2,
                  }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>보낸사람</th>
                        <td>
                          <Input
                            name="sender_name"
                            type="text"
                            value={
                              mainDataResult2.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY2] ==
                                  Object.getOwnPropertyNames(selectedState2)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult2.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY2] ==
                                      Object.getOwnPropertyNames(
                                        selectedState2
                                      )[0]
                                  )[0].sender_name
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>받은사람</th>
                        <td>
                          <Input
                            name="receivers"
                            type="text"
                            value={
                              mainDataResult2.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY2] ==
                                  Object.getOwnPropertyNames(selectedState2)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult2.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY2] ==
                                      Object.getOwnPropertyNames(
                                        selectedState2
                                      )[0]
                                  )[0].receivers
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>내용</th>
                        <td>
                          <TextArea
                            value={
                              mainDataResult2.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY2] ==
                                  Object.getOwnPropertyNames(selectedState2)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult2.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY2] ==
                                      Object.getOwnPropertyNames(
                                        selectedState2
                                      )[0]
                                  )[0].slip_content
                            }
                            name="slip_content"
                            rows={3}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>보낸시각</th>
                        <td>
                          <Input
                            name="send_time"
                            type="text"
                            value={
                              mainDataResult2.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY2] ==
                                  Object.getOwnPropertyNames(selectedState2)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult2.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY2] ==
                                      Object.getOwnPropertyNames(
                                        selectedState2
                                      )[0]
                                  )[0].send_time
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>읽은시각</th>
                        <td>
                          <Input
                            name="read_time"
                            type="text"
                            value={
                              mainDataResult2.data.filter(
                                (item) =>
                                  item[DATA_ITEM_KEY2] ==
                                  Object.getOwnPropertyNames(selectedState2)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult2.data.filter(
                                    (item) =>
                                      item[DATA_ITEM_KEY2] ==
                                      Object.getOwnPropertyNames(
                                        selectedState2
                                      )[0]
                                  )[0].read_time
                            }
                            className="readonly"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainer style={{ width: "100%" }}>
                <Grid
                  style={{ height: webheight2 }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                    })),
                    mainDataState2
                  )}
                  {...mainDataState2}
                  onDataStateChange={onMainDataStateChange2}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="receivers"
                    title="받는사람"
                    width="120px"
                    footerCell={mainTotalFooterCell2}
                  />
                  <GridColumn field="slip_content" title="내용" width="200px" />
                  <GridColumn
                    field="send_time"
                    title="보낸시각"
                    width="150px"
                  />
                </Grid>
              </GridContainer>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <ButtonContainer>
                  <Button
                    onClick={onSearch}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon={"refresh"}
                  >
                    재조회
                  </Button>
                  <Button
                    onClick={onDeleteClick2}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon={"delete"}
                  >
                    삭제
                  </Button>
                </ButtonContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: "10%" }}>보낸사람</th>
                      <td>
                        <Input
                          name="sender_name"
                          type="text"
                          value={
                            mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult2.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY2] ==
                                    Object.getOwnPropertyNames(
                                      selectedState2
                                    )[0]
                                )[0].sender_name
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th style={{ width: "10%" }}>받은사람</th>
                      <td>
                        <Input
                          name="receivers"
                          type="text"
                          value={
                            mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult2.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY2] ==
                                    Object.getOwnPropertyNames(
                                      selectedState2
                                    )[0]
                                )[0].receivers
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>내용</th>
                      <td>
                        <TextArea
                          value={
                            mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult2.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY2] ==
                                    Object.getOwnPropertyNames(
                                      selectedState2
                                    )[0]
                                )[0].slip_content
                          }
                          name="slip_content"
                          rows={3}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>보낸시각</th>
                      <td>
                        <Input
                          name="send_time"
                          type="text"
                          value={
                            mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult2.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY2] ==
                                    Object.getOwnPropertyNames(
                                      selectedState2
                                    )[0]
                                )[0].send_time
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>읽은시각</th>
                      <td>
                        <Input
                          name="read_time"
                          type="text"
                          value={
                            mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0] == undefined
                              ? ""
                              : mainDataResult2.data.filter(
                                  (item) =>
                                    item[DATA_ITEM_KEY2] ==
                                    Object.getOwnPropertyNames(
                                      selectedState2
                                    )[0]
                                )[0].read_time
                          }
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab title="쪽지 보내기">
          <ButtonContainer className="WindowButtonContainer4">
            <Button
              onClick={() => {
                setFilters3((prev) => ({
                  ...prev,
                  check: false,
                  pgNum: 1,
                  isSearch: true,
                }));
                if (swiper && isMobile) {
                  swiper.slideTo(0);
                }
              }}
              icon="search"
              themeColor={"primary"}
            >
              조회
            </Button>
          </ButtonContainer>
          <WindowFilterContainer>
            <FilterBox>
              <tbody>
                <tr>
                  <th>사용자 ID</th>
                  <td>
                    <Input
                      name="user_id"
                      type="text"
                      value={filters3.user_id}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </WindowFilterContainer>
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
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="WindowButtonContainer3">
                    <ButtonContainer>
                      <Button
                        onClick={() => {
                          if (swiper) {
                            swiper.slideTo(1);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: mobileheight3 + height3 }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                      })),
                      mainDataState3
                    )}
                    {...mainDataState3}
                    onDataStateChange={onMainDataStateChange3}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef3}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
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
                      field="user_id"
                      title="아이디"
                      width="120px"
                      footerCell={mainTotalFooterCell3}
                    />
                    <GridColumn field="user_name" title="성명" width="120px" />
                  </Grid>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="WindowButtonContainer3">
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
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        이전
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <TextArea
                    value={Information.content}
                    name="content"
                    rows={3}
                    onChange={InputChange}
                    style={{ height: mobileheight3 }}
                  />
                  <BottomContainer className="BottomContainer">
                    <ButtonContainer>
                      <Button themeColor={"primary"} onClick={onConfirmClick}>
                        전송
                      </Button>
                      <Button
                        themeColor={"primary"}
                        fillMode={"outline"}
                        onClick={() =>
                          setInformation({
                            content: "",
                          })
                        }
                      >
                        초기화
                      </Button>
                    </ButtonContainer>
                  </BottomContainer>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="50%">
                  <Grid
                    style={{ height: webheight3 }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                      })),
                      mainDataState3
                    )}
                    {...mainDataState3}
                    onDataStateChange={onMainDataStateChange3}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef3}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
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
                      field="user_id"
                      title="아이디"
                      width="120px"
                      footerCell={mainTotalFooterCell3}
                    />
                    <GridColumn field="user_name" title="성명" width="120px" />
                  </Grid>
                </GridContainer>
                <GridContainer width={`calc(50% - ${GAP}px)`}>
                  <TextArea
                    value={Information.content}
                    name="content"
                    rows={3}
                    onChange={InputChange}
                    style={{ height: webheight3 }}
                  />
                  <BottomContainer className="BottomContainer">
                    <ButtonContainer>
                      <Button themeColor={"primary"} onClick={onConfirmClick}>
                        전송
                      </Button>
                      <Button
                        themeColor={"primary"}
                        fillMode={"outline"}
                        onClick={() =>
                          setInformation({
                            content: "",
                          })
                        }
                      >
                        초기화
                      </Button>
                    </ButtonContainer>
                  </BottomContainer>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
    </Window>
  );
};

export default KendoWindow;
