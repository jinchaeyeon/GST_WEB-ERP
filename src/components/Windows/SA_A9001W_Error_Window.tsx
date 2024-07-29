import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
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
  FilterBox,
  GridContainer,
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
import DateCell from "../Cells/DateCell";
import {
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getHeight,
  getWindowDeviceHeight,
  handleKeyPressSearch
} from "../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  infomation: any;
  modal?: boolean;
};

var height = 0;
var height2 = 0;
var height3 = 0;
const CopyWindow = ({ setVisible, infomation, modal = false }: IWindow) => {
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
    left: isMobile == true ? 0 : (deviceWidth - 1000) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 600) / 2,
    width: isMobile == true ? deviceWidth : 1000,
    height: isMobile == true ? deviceHeight : 600,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

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

      setMobileHeight(
        getWindowDeviceHeight(true, deviceHeight) - height - height2 - height3
      );
      setWebHeight(
        getWindowDeviceHeight(true, position.height) -
          height -
          height2 -
          height3
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(true, position.height) - height - height2 - height3
    );
  };
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

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

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    reqdt: "",
    seq: 0,
    isSearch: true,
    pgNum: 1,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A9001W_Sub6_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_reqdt": filters.reqdt,
        "@p_seq": filters.p_seq,
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const onDelete = () => {
    if (!permissions.delete) return;

    setParaData2((prev) => ({
      ...prev,
      workType: "PDEL",
      orgdiv: infomation.orgdiv,
      location: infomation.location,
      reqdt: filters.reqdt,
      seq: filters.seq,
      taxdt: convertDateToStr(infomation.taxdt),
      etax: infomation.etax,
      custcd: infomation.custcd,
      gubun: "",
      splyamt: infomation.splyamt,
      taxamt: infomation.taxamt,
      remark: infomation.remark,
      billstat: infomation.billstat,
      rtn: "",
      report_issue_id: infomation.report_issue_id,

      Accattachyn: "",
      rreg_id: 0,
      salelist: "",
    }));
  };

  const [ParaData2, setParaData2] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "",
    location: "",
    reqdt: "",
    seq: 0,
    taxdt: "",
    etax: "",
    custcd: "",
    gubun: "",
    splyamt: "",
    taxamt: "",
    remark: "",
    billstat: "",
    rtn: "",
    report_issue_id: "",
    userid: "",
    pc: "",

    Accattachyn: "",
    rreg_id: 0,
    service_id: "",
    salelist: "",
  });

  const para2: Iparameters = {
    procedureName: "P_SA_A9001W_S2",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData2.location,
      "@p_reqdt": ParaData2.reqdt,
      "@p_seq": ParaData2.seq,
      "@p_taxdt": ParaData2.taxdt,
      "@p_etax": ParaData2.etax,
      "@p_custcd": ParaData2.custcd,
      "@p_gubun": ParaData2.gubun,
      "@p_splyamt": ParaData2.splyamt,
      "@p_taxamt": ParaData2.taxamt,
      "@p_remark": ParaData2.remark,
      "@p_billstat": ParaData2.billstat,
      "@p_rtn": ParaData2.rtn,
      "@p_report_issue_id": ParaData2.report_issue_id,

      "@p_Accattachyn": ParaData2.Accattachyn,
      "@p_rreg_id": ParaData2.rreg_id,
      "@p_salelist": ParaData2.salelist,

      "@p_userid": userId,
      "@p_pc": pc,
      "@p_service_id": companyCode,
    },
  };

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.delete && ParaData2.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      alert("삭제되었습니다.");
      setParaData2({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: "",
        location: "",
        reqdt: "",
        seq: 0,
        taxdt: "",
        etax: "",
        custcd: "",
        gubun: "",
        splyamt: "",
        taxamt: "",
        remark: "",
        billstat: "",
        rtn: "",
        report_issue_id: "",
        userid: "",
        pc: "",

        Accattachyn: "",
        rreg_id: 0,
        service_id: "",
        salelist: "",
      });
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      ParaData2.workType != "" &&
      permissions.save &&
      ParaData2.workType != "D"
    ) {
      fetchTodoGridSaved2();
    }
    if (ParaData2.workType == "D" && permissions.delete) {
      fetchTodoGridSaved2();
    }
  }, [ParaData2, permissions]);

  return (
    <>
      <Window
        titles={"에러메세지 확인"}
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
                <th>계산서번호</th>
                <td>
                  <Input
                    name="reqdt"
                    type="text"
                    value={filters.reqdt}
                    onChange={filterInputChange}
                  />
                </td>
                <td>
                  <Input
                    name="seq"
                    type="number"
                    value={filters.seq}
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
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter(row)],
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
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="err_date"
              title="발생일시"
              cell={DateCell}
              width="120px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="err_code" title="에러코드" width="120px" />
            <GridColumn field="err_msg" title="에러메세지" width="200px" />
            <GridColumn field="cmd_div" title="프로세스" width="120px" />
          </Grid>
        </GridContainer>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={onDelete}>
              E-TAX 삭제
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
    </>
  );
};

export default CopyWindow;
