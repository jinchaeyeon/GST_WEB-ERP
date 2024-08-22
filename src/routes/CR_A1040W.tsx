import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInInput,
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
import {
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import RichEditor from "../components/RichEditor";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { TEditorHandle, TPermissions } from "../store/types";

interface IUser {
  user_id: string;
  user_name: string;
}
const DATA_DATA_ITEM_KEY = "num";
const DATA_DATA_ITEM_KEY2 = "num";
const DATA_DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY = "num";
var index = 0;
var index2 = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
let deletedMainRows: object[] = [];

const App = () => {
  const idDataGetter = getter(DATA_DATA_ITEM_KEY);
  const idDataGetter2 = getter(DATA_DATA_ITEM_KEY2);
  const idDataGetter3 = getter(DATA_DATA_ITEM_KEY3);
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [swiper2, setSwiper2] = useState<SwiperCore>();
  const search = () => {};

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_ACNT, R_YN4",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".FormBoxWrap");
      height2 = getHeight(".FormBoxWrap2");
      height3 = getHeight(".TitleContainer");
      height4 = getHeight(".ButtonContainer");
      height5 = getHeight(".FormBoxWrap3");
      height6 = getHeight(".ButtonContainer2");
      height7 = getHeight(".ButtonContainer3");
      height8 = getHeight(".ButtonContainer4");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height3 - height4);
        setMobileHeight2(getDeviceHeight(false) - height3 - height6);
        setMobileHeight3(getDeviceHeight(false) - height3 - height7);
        setMobileHeight4(getDeviceHeight(false) - height3 - height8 - height5);
        setWebHeight(
          getDeviceHeight(false) * 1.7 -
            height -
            height2 -
            height3 -
            height4 -
            height5
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const [information, setInformation] = useState<{ [name: string]: any }>({
    workType: "U",
    custprsnnm: "남궁현민", //신청자
    institutionalnm: "개인", //기관명
    phoneno: "", //전화번호
    telno: "010-3686-7233", //핸드폰번호
    email: "pophyunmin@ctp.or.kr", //이메일
    title: "",
    acntdiv: "1", //결제구분
    user_id: "", //사전협의자
    user_name: "", //사전협의자명
    samplecnt: 0, //시료수
    frdt: null,
    todt: null,
    files: "",
    attdatnum: "",
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const setUserData = (data: IUser) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        user_id: data.user_id,
        user_name: data.user_name,
      };
    });
  };

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

  const refEditorRef = useRef<TEditorHandle>(null);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);
  const fetchGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_CR133" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        PAGE_SIZE,
      use_yn: "Y",
    };
    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      let idx = 0;
      let idx2 = 0;
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows.map((item: any) => ({
        ...item,
        num: idx2,
        seq: idx2++,
      }));
      let array: any[] = [];
      data.data.Rows.map((item: any) => {
        let valid = true;
        array.map((items: any) => {
          if (items.extra_field2 == item.extra_field2) {
            valid = false;
          }
        });
        if (valid == true) {
          array.push({
            code_name: item.code_name,
            extra_field1: item.extra_field1,
            extra_field2: item.extra_field2,
            sub_code: item.sub_code,
            num: idx,
            seq: idx++,
          });
        }
      });

      setDataResult((prev) => {
        return {
          data: array,
          total: array.length,
        };
      });
      setAllDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (array.length > 0) {
        setDataSelectedState({ [array[0][DATA_DATA_ITEM_KEY]]: true });
        let idx3 = 0;
        let array2: any[] = [];
        rows.map((item: any) => {
          if (item.extra_field2 == array[0].extra_field2) {
            let valid = true;
            array2.map((items: any) => {
              if (items.extra_field1 == item.extra_field1) {
                valid = false;
              }
            });
            if (valid == true) {
              array2.push({
                code_name: item.code_name,
                extra_field1: item.extra_field1,
                extra_field2: item.extra_field2,
                sub_code: item.sub_code,
                num: idx3,
                seq: idx3++,
              });
            }
          }
        });
        setDataResult2((prev) => {
          return {
            data: array2,
            total: array2.length,
          };
        });
        if (array2.length > 0) {
          setDataSelectedState2({ [array2[0][DATA_DATA_ITEM_KEY2]]: true });
          let idx4 = 0;
          let array3: any[] = [];
          rows.map((item: any) => {
            if (
              item.extra_field2 == array[0].extra_field2 &&
              item.extra_field1 == array2[0].extra_field1
            ) {
              let valid = true;
              array3.map((items: any) => {
                if (items.code_name == item.code_name) {
                  valid = false;
                }
              });
              if (valid == true) {
                array3.push({
                  code_name: item.code_name,
                  extra_field1: item.extra_field1,
                  extra_field2: item.extra_field2,
                  sub_code: item.sub_code,
                  num: idx4,
                  seq: idx4++,
                });
              }
            }
          });
          setDataResult3((prev) => {
            return {
              data: array3,
              total: array3.length,
            };
          });
          if (array3.length > 0) {
            setDataSelectedState3({ [array3[0][DATA_DATA_ITEM_KEY3]]: true });
          }
        } else {
          setDataResult3(process([], DataState3));
        }
      } else {
        setDataResult2(process([], DataState2));
        setDataResult3(process([], DataState3));
      }
    } else {
      console.log(data);
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
  const [AllDataState, setAllDataState] = useState<State>({
    sort: [],
  });
  const [DataState, setDataState] = useState<State>({
    sort: [],
  });
  const [DataState2, setDataState2] = useState<State>({
    sort: [],
  });
  const [DataState3, setDataState3] = useState<State>({
    sort: [],
  });
  const [AllDataResult, setAllDataResult] = useState<DataResult>(
    process([], AllDataState)
  );
  const [DataResult, setDataResult] = useState<DataResult>(
    process([], DataState)
  );
  const [DataResult2, setDataResult2] = useState<DataResult>(
    process([], DataState2)
  );
  const [DataResult3, setDataResult3] = useState<DataResult>(
    process([], DataState3)
  );
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  //선택 상태
  const [dataselectedState, setDataSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [dataselectedState2, setDataSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [dataselectedState3, setDataSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onDataStateChange = (event: GridDataStateChangeEvent) => {
    setDataState(event.dataState);
  };

  const onDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDataState2(event.dataState);
  };

  const onDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setDataState3(event.dataState);
  };
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  //그리드 푸터
  const TotalFooterCell = (props: GridFooterCellProps) => {
    var parts = DataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {DataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const TotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = DataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {DataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const TotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = DataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {DataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const MainTotalFooterCell = (props: GridFooterCellProps) => {
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
  const onSortChange = (e: any) => {
    setDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSortChange2 = (e: any) => {
    setDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onSortChange3 = (e: any) => {
    setDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: dataselectedState,
      dataItemKey: DATA_DATA_ITEM_KEY,
    });

    setDataSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    let idx3 = 0;
    let array2: any[] = [];
    AllDataResult.data.map((item: any) => {
      if (item.extra_field2 == selectedRowData.extra_field2) {
        let valid = true;
        array2.map((items: any) => {
          if (items.extra_field1 == item.extra_field1) {
            valid = false;
          }
        });
        if (valid == true) {
          array2.push({
            code_name: item.code_name,
            extra_field1: item.extra_field1,
            extra_field2: item.extra_field2,
            sub_code: item.sub_code,
            num: idx3,
            seq: idx3++,
          });
        }
      }
    });
    setDataResult2((prev) => {
      return {
        data: array2,
        total: array2.length,
      };
    });
    if (array2.length > 0) {
      setDataSelectedState2({ [array2[0][DATA_DATA_ITEM_KEY2]]: true });
      let idx4 = 0;
      let array3: any[] = [];
      AllDataResult.data.map((item: any) => {
        if (
          item.extra_field2 == selectedRowData.extra_field2 &&
          item.extra_field1 == array2[0].extra_field1
        ) {
          let valid = true;
          array3.map((items: any) => {
            if (items.code_name == item.code_name) {
              valid = false;
            }
          });
          if (valid == true) {
            array3.push({
              code_name: item.code_name,
              extra_field1: item.extra_field1,
              extra_field2: item.extra_field2,
              sub_code: item.sub_code,
              num: idx4,
              seq: idx4++,
            });
          }
        }
      });
      setDataResult3((prev) => {
        return {
          data: array3,
          total: array3.length,
        };
      });
      if (array3.length > 0) {
        setDataSelectedState3({ [array3[0][DATA_DATA_ITEM_KEY3]]: true });
      }
    } else {
      setDataResult3(process([], DataState3));
    }

    if (swiper2 && isMobile) {
      swiper2.slideTo(1);
    }
  };

  const onDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: dataselectedState,
      dataItemKey: DATA_DATA_ITEM_KEY2,
    });

    setDataSelectedState2(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    let idx4 = 0;
    let array3: any[] = [];
    AllDataResult.data.map((item: any) => {
      if (
        item.extra_field2 ==
          DataResult.data.filter(
            (item) =>
              item[DATA_DATA_ITEM_KEY] ==
              Object.getOwnPropertyNames(dataselectedState)[0]
          )[0].extra_field2 &&
        item.extra_field1 == selectedRowData.extra_field1
      ) {
        let valid = true;
        array3.map((items: any) => {
          if (items.code_name == item.code_name) {
            valid = false;
          }
        });
        if (valid == true) {
          array3.push({
            code_name: item.code_name,
            extra_field1: item.extra_field1,
            extra_field2: item.extra_field2,
            sub_code: item.sub_code,
            num: idx4,
            seq: idx4++,
          });
        }
      }
    });
    setDataResult3((prev) => {
      return {
        data: array3,
        total: array3.length,
      };
    });
    if (array3.length > 0) {
      setDataSelectedState3({ [array3[0][DATA_DATA_ITEM_KEY3]]: true });
    }
    if (swiper2 && isMobile) {
      swiper2.slideTo(2);
    }
  };

  const onDataSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: dataselectedState3,
      dataItemKey: DATA_DATA_ITEM_KEY3,
    });

    setDataSelectedState3(newSelectedState);
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onAddClick = () => {
    let temp = 0;
    if (DataResult3.total > 0) {
      mainDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
      const data = DataResult3.data.filter(
        (item: any) =>
          item[DATA_DATA_ITEM_KEY3] ==
          Object.getOwnPropertyNames(dataselectedState3)[0]
      )[0];

      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        seq: temp,
        sub_code: data.sub_code,
        code_name: data.code_name,
        extra_field1: data.extra_field1,
        extra_field2: data.extra_field2,
        chk: false,
      };

      setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
      setMainDataResult((prev) => {
        return {
          data: [...prev.data, newDataItem],
          total: prev.total + 1,
        };
      });
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onDeleteClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;

    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        deletedMainRows.push(item);
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const [values2, setValues2] = useState<boolean>(false);
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
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

  type TDataInfo = {
    DATA_ITEM_KEY: string;
    selectedState: {
      [id: string]: boolean | number[];
    };
    dataResult: DataResult;
    setDataResult: (p: any) => any;
  };

  type TArrowBtnClick = {
    direction: string;
    dataInfo: TDataInfo;
  };

  const onArrowsBtnClick = (para: TArrowBtnClick) => {
    const { direction, dataInfo } = para;
    const { DATA_ITEM_KEY, selectedState, dataResult, setDataResult } =
      dataInfo;
    const selectedField = Object.getOwnPropertyNames(selectedState)[0];

    const rowData = dataResult.data.find(
      (row) => row[DATA_ITEM_KEY] == selectedField
    );

    const rowIndex = dataResult.data.findIndex(
      (row) => row[DATA_ITEM_KEY] == selectedField
    );

    if (rowIndex == -1) {
      alert("이동시킬 행을 선택해주세요.");
      return false;
    }

    if (!(rowIndex == 0 && direction == "UP")) {
      const newData = dataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      let replaceData = 0;
      if (direction == "UP" && rowIndex != 0) {
        replaceData = dataResult.data[rowIndex - 1].seq;
      } else {
        replaceData = dataResult.data[rowIndex + 1].seq;
      }

      newData.splice(rowIndex, 1);
      newData.splice(rowIndex + (direction == "UP" ? -1 : 1), 0, rowData);
      if (direction == "UP" && rowIndex != 0) {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                seq: replaceData,
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex - 1].num
            ? {
                ...item,
                seq: rowData.seq,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      } else {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                seq: replaceData,
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex + 1].num
            ? {
                ...item,
                seq: rowData.seq,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      }
    }
  };

  const arrowBtnClickPara = {
    DATA_ITEM_KEY: DATA_ITEM_KEY,
    selectedState: selectedState,
    dataResult: mainDataResult,
    setDataResult: setMainDataResult,
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
              disable={true}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
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
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>신청자 정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
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
                <FormBoxWrap border={true} style={{ height: mobileheight }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>신청자</th>
                        <td>
                          <Input
                            name="custprsnnm"
                            type="text"
                            value={information.custprsnnm}
                            className="readonly"
                          />
                        </td>
                        <th>기관명</th>
                        <td>
                          <Input
                            name="institutionalnm"
                            type="text"
                            value={information.institutionalnm}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>전화번호</th>
                        <td>
                          <Input
                            name="phoneno"
                            type="text"
                            value={information.phoneno}
                            className="readonly"
                          />
                        </td>
                        <th>핸드폰번호</th>
                        <td>
                          <Input
                            name="telno"
                            type="text"
                            value={information.telno}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>이메일</th>
                        <td>
                          <Input
                            name="email"
                            type="text"
                            value={information.email}
                            className="readonly"
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
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>신청 정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
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
                <FormBoxWrap border={true} style={{ height: mobileheight2 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>제목</th>
                        <td>
                          <Input
                            name="title"
                            type="text"
                            value={information.title}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>결제 구분</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionRadioGroup
                                  name="acntdiv"
                                  customOptionData={customOptionData}
                                  changeData={RadioChange}
                                  type="new"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentRadioGroup
                                  name="acntdiv"
                                  value={information.acntdiv}
                                  bizComponentId="R_ACNT"
                                  bizComponentData={bizComponentData}
                                  changeData={RadioChange}
                                />
                              )}
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>시편정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(3);
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
                <FormBoxWrap border={true} style={{ height: mobileheight3 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>사전협의자</th>
                        <td>
                          <Input
                            name="user_name"
                            type="text"
                            value={information.user_name}
                            onChange={InputChange}
                          />
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onPrsnnumWndClick}
                            />
                          </ButtonInInput>
                        </td>
                        <th>시료수</th>
                        <td>
                          <NumericTextBox
                            name="samplecnt"
                            value={information.samplecnt}
                            onChange={InputChange}
                            className="required"
                            format="n0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                  <Swiper
                    onSwiper={(swiper) => {
                      setSwiper2(swiper);
                    }}
                    onActiveIndexChange={(swiper) => {
                      index2 = swiper.activeIndex;
                    }}
                  >
                    <SwiperSlide key={0}>
                      <GridContainer>
                        <GridTitleContainer>
                          <ButtonContainer>
                            <Button
                              onClick={() => {
                                if (swiper2 && isMobile) {
                                  swiper2.slideTo(1);
                                }
                              }}
                              icon="arrow-right"
                              themeColor={"primary"}
                              fillMode={"outline"}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <Grid
                          style={{
                            height: "300px",
                          }}
                          data={process(
                            DataResult.data.map((row) => ({
                              ...row,
                              [SELECTED_FIELD]:
                                dataselectedState[idDataGetter(row)], //선택된 데이터
                            })),
                            DataState
                          )}
                          {...DataState}
                          onDataStateChange={onDataStateChange}
                          //선택 기능
                          dataItemKey={DATA_DATA_ITEM_KEY}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onDataSelectionChange}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={DataResult.total}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSortChange}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          //incell 수정 기능
                        >
                          <GridColumn
                            field="extra_field2"
                            title="주요 공정"
                            width="150px"
                            footerCell={TotalFooterCell}
                          />
                        </Grid>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={1}>
                      <GridContainer>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper2 && isMobile) {
                                swiper2.slideTo(0);
                              }
                            }}
                            icon="arrow-left"
                            themeColor={"primary"}
                            fillMode={"outline"}
                          ></Button>
                          <Button
                            onClick={() => {
                              if (swiper2 && isMobile) {
                                swiper2.slideTo(2);
                              }
                            }}
                            icon="arrow-right"
                            themeColor={"primary"}
                            fillMode={"outline"}
                          ></Button>
                        </ButtonContainer>
                        <Grid
                          style={{
                            height: "300px",
                          }}
                          data={process(
                            DataResult2.data.map((row) => ({
                              ...row,
                              [SELECTED_FIELD]:
                                dataselectedState2[idDataGetter2(row)], //선택된 데이터
                            })),
                            DataState2
                          )}
                          {...DataState2}
                          onDataStateChange={onDataStateChange2}
                          //선택 기능
                          dataItemKey={DATA_DATA_ITEM_KEY2}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onDataSelectionChange2}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={DataResult2.total}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSortChange2}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          //incell 수정 기능
                        >
                          <GridColumn
                            field="extra_field1"
                            title="세부 공정"
                            width="150px"
                            footerCell={TotalFooterCell2}
                          />
                        </Grid>
                      </GridContainer>
                    </SwiperSlide>
                    <SwiperSlide key={2}>
                      <GridContainer>
                        <ButtonContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <Button
                            onClick={() => {
                              if (swiper2 && isMobile) {
                                swiper2.slideTo(1);
                              }
                            }}
                            icon="arrow-left"
                            themeColor={"primary"}
                            fillMode={"outline"}
                          ></Button>
                        </ButtonContainer>
                        <Grid
                          style={{
                            height: "300px",
                          }}
                          data={process(
                            DataResult3.data.map((row) => ({
                              ...row,
                              [SELECTED_FIELD]:
                                dataselectedState3[idDataGetter3(row)], //선택된 데이터
                            })),
                            DataState3
                          )}
                          {...DataState3}
                          onDataStateChange={onDataStateChange3}
                          //선택 기능
                          dataItemKey={DATA_DATA_ITEM_KEY3}
                          selectedField={SELECTED_FIELD}
                          selectable={{
                            enabled: true,
                            mode: "single",
                          }}
                          onSelectionChange={onDataSelectionChange3}
                          //스크롤 조회 기능
                          fixedScroll={true}
                          total={DataResult3.total}
                          //정렬기능
                          sortable={true}
                          onSortChange={onSortChange3}
                          //컬럼순서조정
                          reorderable={true}
                          //컬럼너비조정
                          resizable={true}
                          //incell 수정 기능
                        >
                          <GridColumn
                            field="code_name"
                            title="세부 정보"
                            width="150px"
                            footerCell={TotalFooterCell3}
                          />
                        </Grid>
                      </GridContainer>
                    </SwiperSlide>
                  </Swiper>
                  <GridContainer>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      disabled={permissions.save ? false : true}
                      style={{ width: "100%", marginTop: "5px" }}
                    >
                      추가
                    </Button>
                    <GridTitleContainer style={{ display: "flex" }}>
                      <GridTitle>신청내역</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onDeleteClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={() =>
                            onArrowsBtnClick({
                              direction: "UP",
                              dataInfo: arrowBtnClickPara,
                            })
                          }
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="chevron-up"
                          title="행 위로 이동"
                          disabled={permissions.save ? false : true}
                        ></Button>
                        <Button
                          onClick={() =>
                            onArrowsBtnClick({
                              direction: "DOWN",
                              dataInfo: arrowBtnClickPara,
                            })
                          }
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="chevron-down"
                          title="행 아래로 이동"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Grid
                      style={{
                        height: "300px",
                      }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
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
                      onSelectionChange={onSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult.total}
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
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell2}
                        cell={CheckBoxCell}
                      />
                      <GridColumn
                        field="seq"
                        title="공정순서"
                        width="80px"
                        footerCell={MainTotalFooterCell}
                      />
                      <GridColumn
                        field="extra_field2"
                        title="주요 공정"
                        width="120px"
                      />
                      <GridColumn
                        field="extra_field1"
                        title="세부 공정"
                        width="120px"
                      />
                      <GridColumn
                        field="code_name"
                        title="상세 정보"
                        width="120px"
                      />
                    </Grid>
                  </GridContainer>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>의뢰 정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "flex-start" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
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
                <FormBoxWrap border={true} className="FormBoxWrap3">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>첨부파일</th>
                        <td>
                          <Input
                            name="files"
                            type="text"
                            value={information.files}
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
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridContainer style={{ height: mobileheight4 }}>
                  <RichEditor id="refEditor" ref={refEditorRef} />
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <GridContainer>
          <GridContainerWrap className="FormBoxWrap">
            <GridContainer width="60%">
              <GridTitleContainer>
                <GridTitle>신청자 정보</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>신청자</th>
                      <td>
                        <Input
                          name="custprsnnm"
                          type="text"
                          value={information.custprsnnm}
                          className="readonly"
                        />
                      </td>
                      <th>기관명</th>
                      <td>
                        <Input
                          name="institutionalnm"
                          type="text"
                          value={information.institutionalnm}
                          className="readonly"
                        />
                      </td>
                      <th>이메일</th>
                      <td>
                        <Input
                          name="email"
                          type="text"
                          value={information.email}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>전화번호</th>
                      <td>
                        <Input
                          name="phoneno"
                          type="text"
                          value={information.phoneno}
                          className="readonly"
                        />
                      </td>
                      <th>핸드폰번호</th>
                      <td>
                        <Input
                          name="telno"
                          type="text"
                          value={information.telno}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(40% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>신청 정보</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: "10%" }}>제목</th>
                      <td>
                        <Input
                          name="title"
                          type="text"
                          value={information.title}
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>결제 구분</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionRadioGroup
                                name="acntdiv"
                                customOptionData={customOptionData}
                                changeData={RadioChange}
                                type="new"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentRadioGroup
                                name="acntdiv"
                                value={information.acntdiv}
                                bizComponentId="R_ACNT"
                                bizComponentData={bizComponentData}
                                changeData={RadioChange}
                              />
                            )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
          </GridContainerWrap>
          <GridContainer className="FormBoxWrap2">
            <GridTitleContainer>
              <GridTitle>시편정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{ width: "10%" }}>사전협의자</th>
                    <td>
                      <Input
                        name="user_name"
                        type="text"
                        value={information.user_name}
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          type="button"
                          icon="more-horizontal"
                          fillMode="flat"
                          onClick={onPrsnnumWndClick}
                        />
                      </ButtonInInput>
                    </td>
                    <th style={{ width: "10%" }}>시료수</th>
                    <td>
                      <NumericTextBox
                        name="samplecnt"
                        value={information.samplecnt}
                        onChange={InputChange}
                        className="required"
                        format="n0"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>공정</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <GridContainerWrap>
                  <GridContainer width="33%">
                    <Grid
                      style={{
                        height: "300px",
                      }}
                      data={process(
                        DataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            dataselectedState[idDataGetter(row)], //선택된 데이터
                        })),
                        DataState
                      )}
                      {...DataState}
                      onDataStateChange={onDataStateChange}
                      //선택 기능
                      dataItemKey={DATA_DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDataSelectionChange}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={DataResult.total}
                      //정렬기능
                      sortable={true}
                      onSortChange={onSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                    >
                      <GridColumn
                        field="extra_field2"
                        title="주요 공정"
                        width="150px"
                        footerCell={TotalFooterCell}
                      />
                    </Grid>
                  </GridContainer>
                  <GridContainer width={`calc(33% - ${GAP}px)`}>
                    <Grid
                      style={{
                        height: "300px",
                      }}
                      data={process(
                        DataResult2.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            dataselectedState2[idDataGetter2(row)], //선택된 데이터
                        })),
                        DataState2
                      )}
                      {...DataState2}
                      onDataStateChange={onDataStateChange2}
                      //선택 기능
                      dataItemKey={DATA_DATA_ITEM_KEY2}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDataSelectionChange2}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={DataResult2.total}
                      //정렬기능
                      sortable={true}
                      onSortChange={onSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                    >
                      <GridColumn
                        field="extra_field1"
                        title="세부 공정"
                        width="150px"
                        footerCell={TotalFooterCell2}
                      />
                    </Grid>
                  </GridContainer>
                  <GridContainer width={`calc(34% - ${GAP}px)`}>
                    <Grid
                      style={{
                        height: "300px",
                      }}
                      data={process(
                        DataResult3.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            dataselectedState3[idDataGetter3(row)], //선택된 데이터
                        })),
                        DataState3
                      )}
                      {...DataState3}
                      onDataStateChange={onDataStateChange3}
                      //선택 기능
                      dataItemKey={DATA_DATA_ITEM_KEY3}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDataSelectionChange3}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={DataResult3.total}
                      //정렬기능
                      sortable={true}
                      onSortChange={onSortChange3}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                    >
                      <GridColumn
                        field="code_name"
                        title="세부 정보"
                        width="150px"
                        footerCell={TotalFooterCell3}
                      />
                    </Grid>
                  </GridContainer>
                </GridContainerWrap>
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>신청내역</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={() =>
                          onArrowsBtnClick({
                            direction: "UP",
                            dataInfo: arrowBtnClickPara,
                          })
                        }
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="chevron-up"
                        title="행 위로 이동"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={() =>
                          onArrowsBtnClick({
                            direction: "DOWN",
                            dataInfo: arrowBtnClickPara,
                          })
                        }
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="chevron-down"
                        title="행 아래로 이동"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <Grid
                    style={{
                      height: "300px",
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                    onSelectionChange={onSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult.total}
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
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell2}
                      cell={CheckBoxCell}
                    />
                    <GridColumn
                      field="seq"
                      title="공정순서"
                      width="80px"
                      footerCell={MainTotalFooterCell}
                    />
                    <GridColumn
                      field="extra_field2"
                      title="주요 공정"
                      width="120px"
                    />
                    <GridColumn
                      field="extra_field1"
                      title="세부 공정"
                      width="120px"
                    />
                    <GridColumn
                      field="code_name"
                      title="상세 정보"
                      width="120px"
                    />
                  </Grid>
                </GridContainer>
              </FormBoxWrap>
            </GridContainer>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>의뢰 정보</GridTitle>
            </GridTitleContainer>
            <GridContainer style={{ height: webheight }}>
              <RichEditor id="refEditor" ref={refEditorRef} />
            </GridContainer>
            <FormBoxWrap border={true} className="FormBoxWrap3">
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{ width: "10%" }}>첨부파일</th>
                    <td>
                      <Input
                        name="files"
                        type="text"
                        value={information.files}
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
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </GridContainer>
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};
export default App;
