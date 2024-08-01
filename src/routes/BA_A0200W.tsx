import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import ExcelUploadButtons from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  UseBizComponent,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
var height = 0;
var height2 = 0;
var height3 = 0;
let temp = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 화폐단위, 품목계정
  UseBizComponent(
    "L_BA061, L_BA026, L_BA027, L_BA008, L_dptcd_001, L_HU005",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "itemacnt"
      ? "L_BA061"
      : field == "custdiv"
      ? "L_BA026"
      : field == "bizdiv"
      ? "L_BA027"
      : field == "unpitem"
      ? "L_BA008"
      : field == "inunpitem"
      ? "L_BA008"
      : field == "dptcd"
      ? "L_dptcd_001"
      : field == "postcd"
      ? "L_HU005"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField = field == "dptcd" ? "dptnm" : "sub_code";
  const valueField = field == "dptcd" ? "dptcd" : "code_name";

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

const BA_A0200W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".ButtonContainer");
    height2 = getHeight(".ButtonContainer2");
    height3 = getHeight(".TitleContainer");

    const handleWindowResize = () => {
      let deviceWidth = document.documentElement.clientWidth;
      setIsMobile(deviceWidth <= 1200);
      setMobileHeight(getDeviceHeight(false) - height - height3);
      setMobileHeight2(getDeviceHeight(false) - height2 - height3);
      setWebHeight(getDeviceHeight(false) - height - height3);
      setWebHeight2(getDeviceHeight(false) - height2 - height3);
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [webheight, webheight2]);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));

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
  const sessionLocation = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [columnList, setColumnList] = useState([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061, L_BA026, L_BA027, L_BA008, L_dptcd_001, L_HU005",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [custdivListData, setCustdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [bizdivListData, setBizdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [unpitemListData, setUnpItemListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setCustdivListData(getBizCom(bizComponentData, "L_BA026"));
      setBizdivListData(getBizCom(bizComponentData, "L_BA027"));
      setUnpItemListData(getBizCom(bizComponentData, "L_BA008"));
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
    }
  }, [bizComponentData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
  };
  let gridRef: any = useRef(null);
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    sub_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    sub_code: "",
    find_row_value: "",
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
      procedureName: "P_BA_A0200W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_sub_code": filters.sub_code,
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
            : rows.find((row: any) => row.sub_code == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            sub_code: selectedRow.sub_code,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            sub_code: rows[0].sub_code,
            pgNum: 1,
          }));
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
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    setMainDataResult2(process([], mainDataState2));
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0200W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_sub_code": filters2.sub_code,
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

      setColumnList(rows);
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
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      sub_code: selectedRowData.sub_code,
      pgNum: 1,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const saveExcel = (jsonArr: any[]) => {
    if (!permissions.save) return;
    if (filters2.sub_code == "ITEM") {
      if (jsonArr.length == 0) {
        alert("데이터가 없습니다.");
      } else {
        let valid = true;
        let valid3 = true;
        jsonArr.map((item: any) => {
          Object.keys(item).map((items: any) => {
            if (items == "품목코드") {
              valid = false;
            }
          });
        });

        if (valid == true) {
          alert("양식이 다릅니다. 품목항목의 양식으로 작성해주세요.");
          return false;
        }

        jsonArr.map((item: any) => {
          let valid2 = 0;
          Object.keys(item).map((items: any) => {
            if (items == "품목코드") {
              valid2 += 1;
            }
            if (items == "품목계정") {
              valid2 += 1;
            }
          });
          if (valid2 != 2) {
            valid3 = false;
          }
        });

        if (valid3 != true) {
          alert("필수 값을 채워주세요.");
          return false;
        }

        mainDataResult.data.map((item: { num: number }) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        jsonArr.map((item: any) => {
          const {
            자동채번 = "",
            품목코드 = "",
            품목명 = "",
            품목계정 = "",
            규격 = "",
            사용여부 = "",
            안전재고량 = "",
            비고 = "",
          } = item;

          const itemacnt = itemacntListData.find(
            (item: any) => item.code_name == 품목계정
          )?.sub_code;

          const newDataItem = {
            [DATA_ITEM_KEY2]: ++temp,
            autoyn: 자동채번 == null ? "N" : 자동채번,
            itemcd: 품목코드 == null ? "" : 품목코드,
            itemnm: 품목명 == null ? "" : 품목명,
            itemacnt: itemacnt == undefined ? "" : itemacnt,
            insiz: 규격 == null ? "" : 규격,
            useyn: 사용여부 == null ? "N" : 사용여부,
            safeqty: 안전재고량 == null ? 0 : 안전재고량,
            remark: 비고 == null ? "" : 비고,
            rowstatus: "N",
          };

          setMainDataResult2((prev: { data: any; total: number }) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
          setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
        });
      }
    } else if (filters2.sub_code == "CUST") {
      if (jsonArr.length == 0) {
        alert("데이터가 없습니다.");
      } else {
        let valid = true;
        let valid3 = true;
        jsonArr.map((item: any) => {
          Object.keys(item).map((items: any) => {
            if (items == "업체코드") {
              valid = false;
            }
          });
        });

        if (valid == true) {
          alert("양식이 다릅니다. 업체항목의 양식으로 작성해주세요.");
          return false;
        }

        jsonArr.map((item: any) => {
          let valid2 = 0;
          Object.keys(item).map((items: any) => {
            if (items == "업체코드") {
              valid2 += 1;
            }
            if (items == "업체명") {
              valid2 += 1;
            }
            if (items == "업체구분") {
              valid2 += 1;
            }
            if (items == "사업자구분") {
              valid2 += 1;
            }
            if (items == "매출단가") {
              valid2 += 1;
            }
            if (items == "매입단가") {
              valid2 += 1;
            }
          });
          if (valid2 != 6) {
            valid3 = false;
          }
        });

        if (valid3 != true) {
          alert("필수 값을 채워주세요.");
          return false;
        }

        mainDataResult.data.map((item: { num: number }) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        jsonArr.map((item: any) => {
          const {
            자동채번 = "",
            업체코드 = "",
            업체명 = "",
            업체구분 = "",
            사업자구분 = "",
            사업자등록번호 = "",
            매출단가 = "",
            매입단가 = "",
            주소 = "",
            이메일 = "",
            전화번호 = "",
            팩스번호 = "",
            사용여부 = "",
            비고 = "",
          } = item;

          const custdiv = custdivListData.find(
            (item: any) => item.code_name == 업체구분
          )?.sub_code;
          const bizdiv = bizdivListData.find(
            (item: any) => item.code_name == 사업자구분
          )?.sub_code;
          const unpitem = unpitemListData.find(
            (item: any) => item.code_name == 매출단가
          )?.sub_code;
          const inunpitem = unpitemListData.find(
            (item: any) => item.code_name == 매입단가
          )?.sub_code;
          const newDataItem = {
            [DATA_ITEM_KEY2]: ++temp,
            autoyn: 자동채번 == null ? "N" : 자동채번,
            custcd: 업체코드 == null ? "" : 업체코드,
            custnm: 업체명 == null ? "" : 업체명,
            custdiv: custdiv == undefined ? "" : custdiv,
            bizdiv: bizdiv == null ? "" : bizdiv,
            bizregnum: 사업자등록번호 == null ? "" : 사업자등록번호,
            unpitem: unpitem == null ? "" : unpitem,
            inunpitem: inunpitem == null ? "" : inunpitem,
            address: 주소 == null ? "" : 주소,
            email: 이메일 == null ? "" : 이메일,
            phonenum: 전화번호 == null ? "" : 전화번호,
            faxnum: 팩스번호 == null ? "" : 팩스번호,
            useyn: 사용여부 == null ? "N" : 사용여부,
            remark: 비고 == null ? "" : 비고,
            rowstatus: "N",
          };

          setMainDataResult2((prev: { data: any; total: number }) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
          setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
        });
      }
    } else if (filters2.sub_code == "USER") {
      if (jsonArr.length == 0) {
        alert("데이터가 없습니다.");
      } else {
        let valid = true;
        let valid3 = true;
        jsonArr.map((item: any) => {
          Object.keys(item).map((items: any) => {
            if (items == "사용자ID") {
              valid = false;
            }
          });
        });

        if (valid == true) {
          alert("양식이 다릅니다. 업체항목의 양식으로 작성해주세요.");
          return false;
        }

        jsonArr.map((item: any) => {
          let valid2 = 0;
          Object.keys(item).map((items: any) => {
            if (items == "사용자ID") {
              valid2 += 1;
            }
            if (items == "사용자명") {
              valid2 += 1;
            }
          });
          if (valid2 != 2) {
            valid3 = false;
          }
        });

        if (valid3 != true) {
          alert("필수 값을 채워주세요.");
          return false;
        }

        mainDataResult.data.map((item: { num: number }) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        jsonArr.map((item: any) => {
          const {
            사용자ID = "",
            사용자명 = "",
            부서코드 = "",
            직위코드 = "",
            전화번호 = "",
            핸드폰번호 = "",
            이메일 = "",
          } = item;

          const dptcd = dptcdListData.find(
            (item: any) => item.dptnm == 부서코드
          )?.dptcd;
          const postcd = postcdListData.find(
            (item: any) => item.code_name == 직위코드
          )?.sub_code;
          const newDataItem = {
            [DATA_ITEM_KEY2]: ++temp,
            user_id: 사용자ID == null ? "" : 사용자ID,
            user_name: 사용자명 == null ? "" : 사용자명,
            dptcd: dptcd == undefined ? "" : dptcd,
            postcd: postcd == null ? "" : postcd,
            tel_no: 전화번호 == null ? "" : 전화번호,
            mobile_no: 핸드폰번호 == null ? "" : 핸드폰번호,
            email: 이메일 == null ? "" : 이메일,
            rowstatus: "N",
          };

          setMainDataResult2((prev: { data: any; total: number }) => {
            return {
              data: [newDataItem, ...prev.data],
              total: prev.total + 1,
            };
          });
          setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
        });
      }
    } else if (filters2.sub_code == "MAC") {
    } else if (filters2.sub_code == "BAD") {
    } else if (filters2.sub_code == "PROC") {
    } else {
      alert("존재하지 않는 코드입니다.");
    }
  };

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev: any) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult2.data.map((item: { [x: string]: any }) =>
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;

    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0) return false;

    if (filters2.sub_code == "ITEM") {
      let list: any[] = [];
      let list2: string[] = [];
      dataItem.forEach((item: any, idx: number) => {
        const {
          autoyn = "",
          itemcd = "",
          itemnm = "",
          itemacnt = "",
          insiz = "",
          useyn = "",
          safeqty = "",
          remark = "",
        } = item;

        list.push(autoyn);
        list.push(itemcd);
        list.push(itemnm);
        list.push(itemacnt);
        list.push(insiz);
        list.push(useyn);
        list.push(safeqty);
        list.push(remark);

        list2.push(list.join("/"));
        list = [];
      });

      setParaData((prev) => ({
        ...prev,
        workType: "ITEM",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        form_id: "BA_A0200W",
        pc: pc,
        user_id: userId,
        values: list2.join("|"),
      }));
    } else if (filters2.sub_code == "CUST") {
      let list: any[] = [];
      let list2: string[] = [];
      dataItem.forEach((item: any, idx: number) => {
        const {
          autoyn = "",
          custcd = "",
          custnm = "",
          custdiv = "",
          bizdiv = "",
          bizregnum = "",
          unpitem = "",
          inunpitem = "",
          address = "",
          email = "",
          phonenum = "",
          faxnum = "",
          useyn = "",
          remark = "",
        } = item;

        list.push(autoyn);
        list.push(custcd);
        list.push(custnm);
        list.push(custdiv);
        list.push(bizdiv);
        list.push(bizregnum);
        list.push(unpitem);
        list.push(inunpitem);
        list.push(address);
        list.push(email);
        list.push(phonenum);
        list.push(faxnum);
        list.push(useyn);
        list.push(remark);

        list2.push(list.join("/"));
        list = [];
      });

      setParaData((prev) => ({
        ...prev,
        workType: "CUST",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        form_id: "BA_A0200W",
        pc: pc,
        user_id: userId,
        values: list2.join("|"),
      }));
    } else if (filters2.sub_code == "USER") {
      let list: any[] = [];
      let list2: string[] = [];
      dataItem.forEach((item: any, idx: number) => {
        const {
          user_id = "",
          user_name = "",
          dptcd = "",
          postcd = "",
          tel_no = "",
          mobile_no = "",
          email = "",
        } = item;

        list.push(user_id);
        list.push(user_name);
        list.push(dptcd);
        list.push(postcd);
        list.push(tel_no);
        list.push(mobile_no);
        list.push(email);

        list2.push(list.join("/"));
        list = [];
      });

      setParaData((prev) => ({
        ...prev,
        workType: "USER",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        form_id: "BA_A0200W",
        pc: pc,
        user_id: userId,
        values: list2.join("|"),
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    form_id: "BA_A0200W",
    pc: pc,
    user_id: userId,
    values: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0200W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_values_s": paraData.values,
      "@p_userid": paraData.user_id,
      "@p_form_id": paraData.form_id,
      "@p_pc": paraData.pc,
      "@p_company_code": companyCode,
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      alert("업로드되었습니다.");
      resetAllGrid();
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: prev.pgNum,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

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
      {isMobile ? (
        <></>
      ) : (
        <GridContainerWrap>
          <GridContainer width="10%">
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>기본정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName={getMenuName()}
            >
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
                <GridColumn field="code_name" title="항목" width="120px" />
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainer width={`calc(90% - ${GAP}px)`}>
            <GridTitleContainer className="ButtonContainer2">
              <GridTitle>상세정보</GridTitle>
              <ButtonContainer>
                <ExcelUploadButtons
                  saveExcel={saveExcel}
                  permissions={permissions}
                  style={{ marginLeft: "15px" }}
                  disabled={permissions.save ? false : true}
                />
                <Button
                  title="Export Excel"
                  onClick={onAttachmentsWndClick}
                  icon="file"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.view ? false : true}
                >
                  엑셀양식
                </Button>
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
              fixedScroll={true}
              total={mainDataResult2.total}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              onItemChange={onMainItemChange2}
              cellRender={customCellRender2}
              rowRender={customRowRender2}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="50px"
                editable={false}
              />
              {columnList !== null &&
                columnList?.map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.sub_code}
                        field={item.code_name}
                        title={item.extra_field4}
                        width={"120px"}
                        cell={
                          item.extra_field2 == "C"
                            ? CheckBoxCell
                            : item.extra_field2 == "S"
                            ? NumberCell
                            : item.extra_field2 == "L"
                            ? CustomComboBoxCell
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </GridContainerWrap>
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={`BA_A0200W_${filters2.sub_code}`}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
    </>
  );
};

export default BA_A0200W;
