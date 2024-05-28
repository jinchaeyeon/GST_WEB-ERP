import {
  DataResult,
  FilterDescriptor,
  SortDescriptor,
  State,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs/dist/npm/datepicker/DatePicker";
import { ExcelExport } from "@progress/kendo-react-excel-export";
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
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import {
  TreeList,
  TreeListColumnProps,
  TreeListExpandChangeEvent,
  TreeListSelectionChangeEvent,
  createDataTree,
  extendDataItem,
  mapTree,
  treeToFlat,
} from "@progress/kendo-react-treelist";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
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
  convertDateToStrWithTime2,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  setDefaultDate,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  EXPANDED_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  heightstate,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A3000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DateField = ["recdt"];

const allMenuColumns: TreeListColumnProps[] = [
  { field: "code", title: "코드", expandable: true },
  { field: "name", title: "코드명", expandable: false },
];

export interface Code {
  code: string;
  key_id: string;
  name: string;
  num: number;
  parent_key_id: string;
  use_yn: string;
}

export interface DataState {
  sort: SortDescriptor[];
  filter: FilterDescriptor[];
}

const DATA_ITEM_KEY = "key_id";
const SUB_DATA_ITEM_KEY = "num";
const ATT_DATA_ITEM_KEY = "saved_name";
const SUB_ITEMS_FIELD: string = "menus";
const ALL_MENU_DATA_ITEM_KEY = "key_id";

let targetRowIndex: null | number = null;

const CM_A3000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(ALL_MENU_DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(ATT_DATA_ITEM_KEY);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const dptcd = UseGetValueFromSessionItem("dptcd");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const [localdptcd, setLocaldptcd] = useState("");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A3000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A3000W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        recdt_s: setDefaultDate(customOptionData, "recdt_s"),
        recdt_e: setDefaultDate(customOptionData, "recdt_e"),
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_sysUserMaster_001, L_BA198, L_dptcd_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [attDataResult, setAttDataResult] = useState<DataResult>(
    process([], {})
  );

  const [allMenuDataResult, setAllMenuDataResult] = useState<any>({
    data: [],
    expanded: [],
    editItem: undefined,
    editItemField: undefined,
  });
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedattDataState, setSelectedattDataState] = useState<{
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

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
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

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    contents: "",
    datnum: "",
    dptcd: "",
    files: "",
    itemlvl1: "",
    location: "",
    num: "",
    person: "",
    recdt: new Date(),
    title: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "TREE",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    recdt_s: new Date(),
    recdt_e: new Date(),
    dptcd: "",
    title: "",
    attdatnum: "",
    person: "",
    datnum: "",
    datdt: "",
    itemlvl1: "%",
    find_row_value: "",
    isSearch: true,
    pgNum: 1,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    attdatnum: "",
    datnum: "",
    itemlvl1: "",
    find_row_value: "",
    isSearch: true,
    pgNum: 1,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A3000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_recdt_s": convertDateToStr(filters.recdt_s),
        "@p_recdt_e": convertDateToStr(filters.recdt_e),
        "@p_dptcd": filters.dptcd,
        "@p_title": filters.title,
        "@p_attdatnum": filters.attdatnum,
        "@p_person": filters.person,
        "@p_datnum": filters.datnum,
        "@p_datdt": filters.datdt,
        "@p_itemlvl1": filters.itemlvl1,
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
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.key_id,
          (i: any) => i.parent_key_id,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult({
          ...allMenuDataResult,
          data: dataTree,
        });

        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find((row: any) => row.key_id == filters.find_row_value);

          if (selectedRow != undefined) {
            let array = [];
            let valid = selectedRow.parent_key_id;
            while (valid != "" && valid != undefined && valid != null) {
              array.push(valid);
              if (rows.find((row: any) => row.key_id == valid) != undefined) {
                valid = rows.find(
                  (row: any) => row.key_id == valid
                ).parent_key_id;
              } else {
                valid = "";
              }
            }

            if (selectedRow.parent_key_id != "") {
              setAllMenuDataResult({
                ...allMenuDataResult,
                data: dataTree,
                expanded: array,
              });
            }
            setSelectedState({
              [selectedRow[ALL_MENU_DATA_ITEM_KEY]]: true,
            });
            setsubFilters((prev) => ({
              ...prev,
              itemlvl1: selectedRow.code == "" ? "%" : selectedRow.code,
              isSearch: true,
              pgNum: 1,
            }));
          } else {
            setSelectedState({
              [rows[0][ALL_MENU_DATA_ITEM_KEY]]: true,
            });
            setsubFilters((prev) => ({
              ...prev,
              itemlvl1: rows[0].code == "" ? "%" : rows[0].code,
              isSearch: true,
              pgNum: 1,
            }));
          }
        }
      } else {
        setAllMenuDataResult((prev: any) => {
          return { ...prev, data: [] };
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };
  let gridRef: any = useRef(null);

  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);

    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_CM_A3000W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_recdt_s": convertDateToStr(filters.recdt_s),
        "@p_recdt_e": convertDateToStr(filters.recdt_e),
        "@p_dptcd": filters.dptcd,
        "@p_title": filters.title,
        "@p_attdatnum": subfilters.attdatnum,
        "@p_person": filters.person,
        "@p_datnum": subfilters.datnum,
        "@p_datdt": filters.datdt,
        "@p_itemlvl1": subfilters.itemlvl1,
        "@p_find_row_value": subfilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true && data.tables.length != 0) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));

      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.datnum == subfilters.find_row_value
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
      setSubDataResult((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.datnum == subfilters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
          if (selectedRow.attdatnum == "") {
            setAttachmentNumber("");
          } else {
            setAttachmentNumber(selectedRow.attdatnum);
          }
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            orgdiv: selectedRow.orgdiv,
            dptcd: selectedRow.dptcd,
            contents: selectedRow.contents,
            datnum: selectedRow.datnum,
            files: selectedRow.files,
            itemlvl1: selectedRow.itemlvl1,
            location: selectedRow.location,
            num: selectedRow.num,
            person: selectedRow.person,
            recdt: toDate(selectedRow.recdt),
            title: selectedRow.title,
          });
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
          if (rows[0].attdatnum == "") {
            setAttachmentNumber("");
          } else {
            setAttachmentNumber(rows[0].attdatnum);
          }
          setInfomation({
            pgSize: PAGE_SIZE,
            workType: "U",
            orgdiv: rows[0].orgdiv,
            dptcd: rows[0].dptcd,
            contents: rows[0].contents,
            datnum: rows[0].datnum,
            files: rows[0].files,
            itemlvl1: rows[0].itemlvl1,
            location: rows[0].location,
            num: rows[0].num,
            person: rows[0].person,
            recdt: toDate(rows[0].recdt),
            title: rows[0].title,
          });
        }
        fetchAttdatnumGrid();
      } else {
        setAttachmentNumber("");
        setAttDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "N",
          orgdiv: sessionOrgdiv,
          contents: "",
          datnum: "",
          dptcd: "",
          files: "",
          itemlvl1: "",
          location: "",
          num: "",
          person: "",
          recdt: new Date(),
          title: "",
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const [attachmentNumber, setAttachmentNumber] = useState<string>("");

  useEffect(() => {
    fetchAttdatnumGrid();
  }, [attachmentNumber]);

  //그리드 조회
  const fetchAttdatnumGrid = async () => {
    let data: any;
    if (attachmentNumber == "") return false;
    const parameters = {
      attached: "list?attachmentNumber=" + attachmentNumber,
    };

    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    let result: IAttachmentData = {
      attdatnum: "",
      original_name: "",
      rowCount: 0,
    };

    if (data !== null) {
      const totalRowCnt = data.tables[0].RowCount;

      if (totalRowCnt > 0) {
        const rows = data.tables[0].Rows;

        setAttDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        result = {
          attdatnum: rows[0].attdatnum,
          original_name: rows[0].original_name,
          rowCount: totalRowCnt,
        };

        setSelectedattDataState({ [rows[0][ATT_DATA_ITEM_KEY]]: true });
      } else {
        setAttDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });

        result = {
          attdatnum: attachmentNumber,
          original_name: "",
          rowCount: 0,
        };
      }
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files == null) return false;

    let newAttachmentNumber = "";
    const promises = [];

    for (const file of files) {
      // 최초 등록 시, 업로드 후 첨부번호를 가져옴 (다중 업로드 대응)
      if (!attachmentNumber && !newAttachmentNumber) {
        newAttachmentNumber = await uploadFile(file);
        const promise = newAttachmentNumber;
        promises.push(promise);
        continue;
      }

      const promise = newAttachmentNumber
        ? await uploadFile(file, newAttachmentNumber)
        : await uploadFile(file);
      promises.push(promise);
    }

    const results = await Promise.all(promises);

    // 실패한 파일이 있는지 확인
    if (results.includes(null)) {
      alert("파일 업로드에 실패했습니다.");
    } else {
      // 모든 파일이 성공적으로 업로드된 경우
      if (!attachmentNumber) {
        setAttachmentNumber(newAttachmentNumber);
      } else {
        fetchAttdatnumGrid();
      }
    }
  };

  const uploadFile = async (files: File, newAttachmentNumber?: string) => {
    let data: any;

    const filePara = {
      attached: attachmentNumber
        ? "attached?attachmentNumber=" + attachmentNumber
        : newAttachmentNumber
        ? "attached?attachmentNumber=" + newAttachmentNumber
        : "attached",
      files: files, //.FileList,
    };

    try {
      data = await processApi<any>("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      data.result.map((item: any) => {
        setUnsavedName((prev) => [...prev, item.savedFileName]);
      });
      return data.attachmentNumber;
    } else {
      return data;
    }
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (subfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [subDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: TreeListSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setLocaldptcd(selectedRowData.name);
    setsubFilters((prev) => ({
      ...prev,
      itemlvl1: selectedRowData.code == "" ? "%" : selectedRowData.code,
      isSearch: true,
      pgNum: 1,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const user = userListData.find(
      (item: any) => item.user_name == selectedRowData.person
    )?.user_id;

    if (selectedRowData.attdatnum == "") {
      setAttachmentNumber("");
      setAttDataResult((prev) => {
        return {
          data: [],
          total: 0,
        };
      });
    } else {
      setAttachmentNumber(selectedRowData.attdatnum);
    }

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      orgdiv: selectedRowData.orgdiv,
      dptcd: selectedRowData.dptcd,
      contents: selectedRowData.contents,
      datnum: selectedRowData.datnum,
      files: selectedRowData.files,
      itemlvl1: selectedRowData.itemlvl1,
      location: selectedRowData.location,
      num: selectedRowData.num,
      person: user != undefined ? user : "",
      recdt: toDate(selectedRowData.recdt),
      title: selectedRowData.title,
    });

    if (swiper && isMobile) {
      swiper.slideTo(2);
    }
  };

  const onAttDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedattDataState,
      dataItemKey: ATT_DATA_ITEM_KEY,
    });

    setSelectedattDataState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions(
        treeToFlat(
          mapTree(data, SUB_ITEMS_FIELD, (item) =>
            extendDataItem(item, SUB_ITEMS_FIELD, {
              [EXPANDED_FIELD]: true,
              [EDIT_FIELD]:
                item[ALL_MENU_DATA_ITEM_KEY] == editItemId
                  ? editItemField
                  : undefined,
              [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
            })
          ),
          EXPANDED_FIELD,
          SUB_ITEMS_FIELD
        ),
        allMenuColumns
      );
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "자료리스트";
      optionsGridOne.sheets[1].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const excelsInput: any = React.useRef();

  const onAddClick2 = () => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setAttachmentNumber("");
    setAttDataResult((prev) => {
      return {
        data: [],
        total: 0,
      };
    });
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      orgdiv: sessionOrgdiv,
      contents: "",
      datnum: "",
      dptcd: dptcd,
      files: "",
      itemlvl1: "",
      location: "",
      num: "",
      person: userId,
      recdt: new Date(),
      title: "",
    });
  };

  const onAllMenuExpandChange = (event: TreeListExpandChangeEvent) => {
    setAllMenuDataResult({
      ...allMenuDataResult,
      expanded: event.value
        ? allMenuDataResult.expanded.filter(
            (id: any) => id !== event.dataItem[ALL_MENU_DATA_ITEM_KEY]
          )
        : [
            ...allMenuDataResult.expanded,
            event.dataItem[ALL_MENU_DATA_ITEM_KEY],
          ],
    });
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.recdt_s).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt_s).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt_s).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt_s).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A3000W_003");
      } else if (
        convertDateToStr(filters.recdt_e).substring(0, 4) < "1997" ||
        convertDateToStr(filters.recdt_e).substring(6, 8) > "31" ||
        convertDateToStr(filters.recdt_e).substring(6, 8) < "01" ||
        convertDateToStr(filters.recdt_e).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A3000W_003");
      } else {
        resetAllGrid();
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (subDataResult.data.length == 0) {
      alert("데이터가 없습니다");
    } else {
      let data: any;
      attDataResult.data.forEach(async (parameter) => {
        try {
          data = await processApi<any>("file-delete", {
            attached: parameter.saved_name,
          });
        } catch (error) {
          data = null;
        }
      });
      setInfomation((prev) => ({
        ...prev,
        workType: "D",
      }));
    }
  };

  const infopara: Iparameters = {
    procedureName: "P_CM_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": infomation.orgdiv,
      "@p_datnum": infomation.datnum,
      "@p_location": infomation.location,
      "@p_title": infomation.title,
      "@p_recdt": convertDateToStr(infomation.recdt),
      "@p_contents": infomation.contents,
      "@p_dptcd": infomation.dptcd,
      "@p_attdatnum": attachmentNumber,
      "@p_person": infomation.person,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SY_A0125W",
    },
  };

  useEffect(() => {
    if (infomation.workType == "D") {
      fetchSaved();
    }
  }, [infomation]);

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.person) {
        throw findMessage(messagesData, "CM_A3000W_001");
      }

      if (!infomation.dptcd) {
        throw findMessage(messagesData, "CM_A3000W_002");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setValues2(false);
      if (infomation.workType == "D") {
        const isLastDataDeleted =
          subDataResult.data.length == 1 && subfilters.pgNum > 1;
        const findRowIndex = subDataResult.data.findIndex(
          (row: any) =>
            row.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
        );

        setDeletedAttadatnums([attachmentNumber]);
        if (isLastDataDeleted) {
          setPage({
            skip:
              subfilters.pgNum == 1 || subfilters.pgNum == 0
                ? 0
                : PAGE_SIZE * (subfilters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setsubFilters((prev) => ({
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
          setsubFilters((prev) => ({
            ...prev,
            find_row_value:
              subDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                .datnum,
            pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        setUnsavedAttadatnums([]);
        setUnsavedName([]);
        setsubFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: data.returnString,
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setSubDataResult(process([], subDataState));
    setAllMenuDataResult({
      data: [],
      expanded: [],
      editItem: undefined,
      editItemField: undefined,
    });
  };

  const { data, expanded, editItem, editItemField } = allMenuDataResult;
  const editItemId = editItem ? editItem[ALL_MENU_DATA_ITEM_KEY] : null;

  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const downloadFiles = async () => {
    // value 가 false인 속성 삭제
    const datas = attDataResult.data.filter((item) => item.chk == true);
    if (datas.length == 0) {
      alert("선택된 행이 없습니다.");
      return false;
    }

    // const parameter = parameters[0];
    let response: any;

    datas.forEach(async (parameter) => {
      try {
        response = await processApi<any>("file-download", {
          attached: parameter.saved_name,
        });
      } catch (error) {
        response = null;
      }

      if (response !== null) {
        const blob = new Blob([response.data]);
        // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
        // const blob = new Blob([this.content], {type: 'text/plain'})

        // blob을 사용해 객체 URL을 생성합니다.
        const fileObjectUrl = window.URL.createObjectURL(blob);

        // blob 객체 URL을 설정할 링크를 만듭니다.
        const link = document.createElement("a");
        link.href = fileObjectUrl;
        link.style.display = "none";

        // 다운로드 파일 이름을 추출하는 함수
        const extractDownloadFilename = (response: any) => {
          if (response.headers) {
            const disposition = response.headers["content-disposition"];
            let filename = "";
            if (disposition) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
              }
            }
            return filename;
          } else {
            return "";
          }
        };

        // 다운로드 파일 이름을 지정 할 수 있습니다.
        // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
        link.download = extractDownloadFilename(response);

        // 다운로드 파일의 이름은 직접 지정 할 수 있습니다.
        // link.download = "sample-file.xlsx";

        // 링크를 body에 추가하고 강제로 click 이벤트를 발생시켜 파일 다운로드를 실행시킵니다.
        document.body.appendChild(link);
        link.click();
        link.remove();

        // 다운로드가 끝난 리소스(객체 URL)를 해제합니다
      }
    });
  };

  const deleteFiles = () => {
    const datas = attDataResult.data.filter((item) => item.chk == true);

    if (datas.length == 0) {
      alert("선택된 행이 없습니다.");
      return false;
    }

    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }
    let data: any;

    datas.forEach(async (parameter) => {
      try {
        data = await processApi<any>("file-delete", {
          attached: parameter.saved_name,
        });
      } catch (error) {
        data = null;
      }
      fetchAttdatnumGrid();
    });
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = attDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setAttDataResult((prev) => {
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

  const onAttItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      attDataResult,
      setAttDataResult,
      ATT_DATA_ITEM_KEY
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
      const newData = attDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
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

      setAttDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = attDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setAttDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>자료실</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A3000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>작성일</th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.recdt_s,
                    end: filters.recdt_e,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      recdt_s: e.value.start,
                      recdt_e: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>부서코드</th>
              {localdptcd != "" ? (
                <td>
                  <Input
                    name="dptcd"
                    type="text"
                    value={localdptcd}
                    className="readonly"
                  />
                </td>
              ) : (
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
              )}
              <th>작성자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="person"
                    value={filters.person}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="user_id"
                    textField="user_name"
                  />
                )}
              </td>
              <th>제목</th>
              <td colSpan={3}>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
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
            <GridContainer
              style={{ width: "100%", overflow: "auto" }}
            >
              <ExcelExport
                ref={(exporter) => (_export = exporter)}
                hierarchy={true}
                fileName="자료실"
              >
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>자료리스트</GridTitle>
                </GridTitleContainer>
                <TreeList
                  style={{
                    height: deviceHeight - height,
                  }}
                  data={mapTree(data, SUB_ITEMS_FIELD, (item) =>
                    extendDataItem(item, SUB_ITEMS_FIELD, {
                      [EXPANDED_FIELD]: expanded.includes(
                        item[ALL_MENU_DATA_ITEM_KEY]
                      ),
                      [EDIT_FIELD]:
                        item[ALL_MENU_DATA_ITEM_KEY] == editItemId
                          ? editItemField
                          : undefined,
                      [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
                    })
                  )}
                  expandField={EXPANDED_FIELD}
                  subItemsField={SUB_ITEMS_FIELD}
                  onExpandChange={onAllMenuExpandChange}
                  selectable={{
                    enabled: true,
                    drag: false,
                    cell: false,
                    mode: "single",
                  }}
                  selectedField={SELECTED_FIELD}
                  onSelectionChange={onSelectionChange}
                  columns={allMenuColumns}
                />
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer
              style={{ width: "100%", overflow: "auto" }}
            >
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>요약정보</GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
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
              <ExcelExport
                ref={(exporter) => (_export2 = exporter)}
                data={subDataResult.data}
                fileName="자료실"
              >
                <Grid
                  style={{
                    height: deviceHeight - height2,
                  }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      person: userListData.find(
                        (item: any) => item.user_id == row.person
                      )?.user_name,
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
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              className={
                                item.sortOrder == 0
                                  ? "readonly"
                                  : item.sortOrder == 1
                                  ? "readonly"
                                  : undefined
                              }
                              cell={
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
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
          <SwiperSlide key={2}>
            <GridContainer style={{ width: "100%" }}>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>세부정보</GridTitle>
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <Button
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(1);
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
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      신규
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap
                style={{ height: deviceHeight - height2, overflow: "auto" }}
                border={true}
              >
                <FormBox>
                  <tbody>
                    <tr>
                      <th>대분류</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="itemlvl1"
                            value={infomation.itemlvl1}
                            bizComponentId="L_BA198"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>작성일</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={infomation.recdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>작성자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={infomation.person}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            className="required"
                            valueField="user_id"
                            textField="user_name"
                          />
                        )}
                      </td>
                      <th>부서코드</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={infomation.dptcd}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="dptnm"
                            valueField="dptcd"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={7}>
                        <Input
                          value={infomation.title}
                          name="title"
                          type="text"
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>내용</th>
                      <td colSpan={7}>
                        <TextArea
                          value={infomation.contents}
                          name="contents"
                          rows={7}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={7}>
                        <GridContainer>
                          <Grid
                            style={{ height: "20vh" }}
                            data={process(
                              attDataResult.data.map((row) => ({
                                ...row,
                                person: userListData.find(
                                  (item: any) => item.user_id == row.person
                                )?.user_name,
                                insert_time: convertDateToStrWithTime2(
                                  new Date(row.insert_time)
                                ),
                                [SELECTED_FIELD]:
                                  selectedattDataState[idGetter3(row)],
                              })),
                              {}
                            )}
                            sortable={true}
                            groupable={false}
                            reorderable={true}
                            //onDataStateChange={dataStateChange}
                            fixedScroll={true}
                            total={attDataResult.total}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              drag: false,
                              cell: false,
                              mode: "single",
                            }}
                            onSelectionChange={onAttDataSelectionChange}
                            onItemChange={onAttItemChange}
                            cellRender={customCellRender}
                            rowRender={customRowRender}
                            editField={EDIT_FIELD}
                          >
                            <GridColumn
                              field="chk"
                              title=" "
                              width="10px"
                              headerCell={CustomCheckBoxCell2}
                              cell={CheckBoxCell}
                            />
                            <GridColumn
                              field="original_name"
                              title="파일이름"
                              width="100px"
                            />
                            <GridColumn
                              field="file_size"
                              title="파일SIZE"
                              width="40px"
                            />
                            <GridColumn
                              field="user_name"
                              title="등록자명"
                              width="40px"
                            />
                            <GridColumn
                              field="insert_time"
                              title="입력시간"
                              width="50px"
                            />
                          </Grid>
                        </GridContainer>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <ButtonContainer
                          style={{ justifyContent: "flex-start" }}
                        >
                          <Button
                            onClick={upload}
                            themeColor={"primary"}
                            icon={"upload"}
                          >
                            업로드
                            <input
                              id="uploadAttachment"
                              style={{ display: "none" }}
                              type="file"
                              multiple
                              ref={excelsInput}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                handleFileUpload(event.target.files);
                              }}
                            />
                          </Button>
                          <Button
                            onClick={downloadFiles}
                            themeColor={"primary"}
                            fillMode={"outline"}
                            icon={"download"}
                          >
                            다운로드
                          </Button>
                          <Button
                            onClick={deleteFiles}
                            themeColor={"primary"}
                            fillMode={"outline"}
                            icon={"delete"}
                          >
                            삭제
                          </Button>
                        </ButtonContainer>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="30%">
              <ExcelExport
                ref={(exporter) => (_export = exporter)}
                hierarchy={true}
                fileName="자료실"
              >
                <GridTitleContainer>
                  <GridTitle>자료리스트</GridTitle>
                </GridTitleContainer>
                <TreeList
                  style={{ height: "80.5vh", overflow: "auto" }}
                  data={mapTree(data, SUB_ITEMS_FIELD, (item) =>
                    extendDataItem(item, SUB_ITEMS_FIELD, {
                      [EXPANDED_FIELD]: expanded.includes(
                        item[ALL_MENU_DATA_ITEM_KEY]
                      ),
                      [EDIT_FIELD]:
                        item[ALL_MENU_DATA_ITEM_KEY] == editItemId
                          ? editItemField
                          : undefined,
                      [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
                    })
                  )}
                  expandField={EXPANDED_FIELD}
                  subItemsField={SUB_ITEMS_FIELD}
                  onExpandChange={onAllMenuExpandChange}
                  selectable={{
                    enabled: true,
                    drag: false,
                    cell: false,
                    mode: "single",
                  }}
                  selectedField={SELECTED_FIELD}
                  onSelectionChange={onSelectionChange}
                  columns={allMenuColumns}
                />
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(70% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export2 = exporter)}
                data={subDataResult.data}
                fileName="자료실"
              >
                <Grid
                  style={{ height: "24.2vh" }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      person: userListData.find(
                        (item: any) => item.user_id == row.person
                      )?.user_name,
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
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
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
                    customOptionData.menuCustomColumnOptions["grdList"]
                      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      ?.map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              className={
                                item.sortOrder == 0
                                  ? "readonly"
                                  : item.sortOrder == 1
                                  ? "readonly"
                                  : undefined
                              }
                              cell={
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : undefined
                              }
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
              <GridTitleContainer>
                <GridTitle>세부정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>대분류</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="itemlvl1"
                            value={infomation.itemlvl1}
                            bizComponentId="L_BA198"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th>작성일</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={infomation.recdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>작성자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={infomation.person}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            className="required"
                            valueField="user_id"
                            textField="user_name"
                          />
                        )}
                      </td>
                      <th>부서코드</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={infomation.dptcd}
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            className="required"
                            textField="dptnm"
                            valueField="dptcd"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={7}>
                        <Input
                          value={infomation.title}
                          name="title"
                          type="text"
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>내용</th>
                      <td colSpan={7}>
                        <TextArea
                          value={infomation.contents}
                          name="contents"
                          rows={7}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={7}>
                        <GridContainer>
                          <Grid
                            style={{ height: "20vh" }}
                            data={process(
                              attDataResult.data.map((row) => ({
                                ...row,
                                person: userListData.find(
                                  (item: any) => item.user_id == row.person
                                )?.user_name,
                                insert_time: convertDateToStrWithTime2(
                                  new Date(row.insert_time)
                                ),
                                [SELECTED_FIELD]:
                                  selectedattDataState[idGetter3(row)],
                              })),
                              {}
                            )}
                            sortable={true}
                            groupable={false}
                            reorderable={true}
                            //onDataStateChange={dataStateChange}
                            fixedScroll={true}
                            total={attDataResult.total}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              drag: false,
                              cell: false,
                              mode: "single",
                            }}
                            onSelectionChange={onAttDataSelectionChange}
                            onItemChange={onAttItemChange}
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
                              field="original_name"
                              title="파일이름"
                              width="400px"
                            />
                            <GridColumn
                              field="file_size"
                              title="파일SIZE"
                              width="150px"
                            />
                            <GridColumn
                              field="user_name"
                              title="등록자명"
                              width="150px"
                            />
                            <GridColumn
                              field="insert_time"
                              title="입력시간"
                              width="200px"
                            />
                          </Grid>
                        </GridContainer>
                      </td>
                    </tr>
                    <tr>
                      <th></th>
                      <td colSpan={2}>
                        <ButtonContainer
                          style={{ justifyContent: "flex-start" }}
                        >
                          <Button
                            onClick={upload}
                            themeColor={"primary"}
                            icon={"upload"}
                          >
                            업로드
                            <input
                              id="uploadAttachment"
                              style={{ display: "none" }}
                              type="file"
                              multiple
                              ref={excelsInput}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                handleFileUpload(event.target.files);
                              }}
                            />
                          </Button>
                          <Button
                            onClick={downloadFiles}
                            themeColor={"primary"}
                            fillMode={"outline"}
                            icon={"download"}
                          >
                            다운로드
                          </Button>
                          <Button
                            onClick={deleteFiles}
                            themeColor={"primary"}
                            fillMode={"outline"}
                            icon={"delete"}
                          >
                            삭제
                          </Button>
                        </ButtonContainer>
                      </td>
                      <td></td>
                      <th></th>
                      <td></td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
        </>
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

export default CM_A3000W;
