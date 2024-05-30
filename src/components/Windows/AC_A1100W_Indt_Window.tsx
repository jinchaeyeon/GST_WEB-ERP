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
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  handleKeyPressSearch,
} from "../CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import FilterContainer from "../Containers/FilterContainer";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  importnum: string;
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({
  setVisible,
  setData,
  importnum,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 900,
  });

  const onChangePostion = (position: any) => {
    setPosition(position);
  };

  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      importnum: importnum,
    }));
  }, [importnum]);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    importnum: "",
    pgNum: 1,
    isSearch: true,
  });

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_P1100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_importnum": filters.importnum,
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
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[오류 발생]");
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev) => ({
      ...prev,
      find_row_value: "",
      pgNum: 1,
      isSearch: true,
    }));
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = () => {
    const selectedData = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (selectedData != undefined) {
      const newItem = {
        acseq1: 0,
        actdt: "",
        annexation: 0,
        coddt: "",
        costamt1: 0,
        costamt2: 0,
        costamt3: 0,
        costamt4: 0,
        costamt5: 0,
        costamt6: 0,
        costamt7: 0,
        costamt8: 0,
        costamt9: 0,
        costamt10: 0,
        costamt11: 0,
        costamt12: 0,
        costamt13: 0,
        costamt14: 0,
        costamt15: 0,
        customs: 0,
        customscustcd: "",
        ftayn: "",
        importnum: "",
        inkey: selectedData.inkey,
        inrecdt: selectedData.recdt,
        inseq1: selectedData.seq1,
        location: "",
        orgdiv: sessionOrgdiv,
        poregnum: "",
        position: "",
        purnum: selectedData.purnum,
        purseq: 0,
        rate: 0,
        recdt: convertDateToStr(new Date()),
        refundamt: 0,
        refunddt: "",
        remark3: "",
        seq1: 0,
        seq2: 0,
        taxamt: 0,
        tottaxamt: selectedData.amt,
        totwgt: selectedData.totwgt,
        wonamt: 0,
        rowstatus: "N",
      };
      setData(newItem);
      onClose();
    }
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;
    const newItem = {
      acseq1: 0,
      actdt: "",
      annexation: 0,
      coddt: "",
      costamt1: 0,
      costamt2: 0,
      costamt3: 0,
      costamt4: 0,
      costamt5: 0,
      costamt6: 0,
      costamt7: 0,
      costamt8: 0,
      costamt9: 0,
      costamt10: 0,
      costamt11: 0,
      costamt12: 0,
      costamt13: 0,
      costamt14: 0,
      costamt15: 0,
      customs: 0,
      customscustcd: "",
      ftayn: "",
      importnum: "",
      inkey: selectedData.inkey,
      inrecdt: selectedData.recdt,
      inseq1: selectedData.seq1,
      location: "",
      orgdiv: sessionOrgdiv,
      poregnum: "",
      position: "",
      purnum: selectedData.purnum,
      purseq: 0,
      rate: 0,
      recdt: convertDateToStr(new Date()),
      refundamt: 0,
      refunddt: "",
      remark3: "",
      seq1: 0,
      seq2: 0,
      taxamt: 0,
      tottaxamt: selectedData.amt,
      totwgt: selectedData.totwgt,
      wonamt: 0,
      rowstatus: "N",
    };
    setData(newItem);
    onClose();
  };

  return (
    <>
      <Window
        titles={"입고참조팝업"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <TitleContainer style={{ float: "right" }}>
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>수입관리번호</th>
                <td>
                  <Input
                    name="importnum"
                    type="text"
                    value={filters.importnum}
                    className="readonly"
                  />
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
        <GridContainer height={`calc(100% - 200px)`}>
          <Grid
            style={{ height: "calc(100% - 5px)" }} //5px = margin bottom 값
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
            //더블클릭
            onRowDoubleClick={onRowDoubleClick}
          >
            <GridColumn
              field="indt"
              title="입고일자"
              cell={DateCell}
              footerCell={mainTotalFooterCell}
              width="120px"
            />
            <GridColumn field="custcd" title="업체코드" width="150px" />
            <GridColumn field="custnm" title="업체명" width="150px" />
            <GridColumn
              field="totwgt"
              title="전체중량"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="amt"
              title="금액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn
              field="wonamt"
              title="원화금액"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn field="inkey" title="입고번호" width="150px" />
            <GridColumn field="purnum" title="발주번호" width="150px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
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
    </>
  );
};

export default CopyWindow;
