import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
  PrimaryP,
  ButtonInInput,
} from "../../../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import {
  chkScrollHandler,
  getQueryFromBizComponent,
  UseBizComponent,
} from "../../CommonFunction";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import BizComponentRadioGroup from "../../RadioGroups/BizComponentRadioGroup";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../../../store/atoms";
import PrsnnumWindow from "./PrsnnumWindow";
import { bytesToBase64 } from "byte-base64";
import FilterContainer from "../../../components/Containers/FilterContainer";
interface IPrsnnumMulti {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

interface IPrsnnum {
  user_id: string;
  user_name: string;
}


type IWindow = {
  setVisible(t: boolean): void;
  setData(data: IPrsnnumMulti[]): void; //data : 선택한 품목 데이터를 전달하는 함수
};
const DATA_ITEM_KEY = "prsnnum";
const KEEPING_DATA_ITEM_KEY = "idx";

const ItemsMultiWindow = ({ setVisible, setData }: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 830,
    height: 850,
  });
  const setLoading = useSetRecoilState(isLoading);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const idGetter = getter(DATA_ITEM_KEY);
  const keepingIdGetter = getter(KEEPING_DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [keepingSelectedState, setKeepingSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_RTR, L_dptcd_001, L_HU006, L_HU005",
    //사용여부,
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setDptcdListData] = React.useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [abilcdListData, setAbilcdListDate] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [postcdListData, setPostcdListDate] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const abilcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU006")
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      fetchQuery(dptcdQueryStr, setDptcdListData);
      fetchQuery(abilcdQueryStr, setAbilcdListDate);
      fetchQuery(postcdQueryStr, setPostcdListDate);
    }
  }, [bizComponentData]);

  const fetchQuery = React.useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );

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

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [keepingDataState, setKeepingDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [keepingDataResult, setKeepingDataResult] = useState<DataResult>(
    process([], keepingDataState)
  );
  const [mainPgNum, setMainPgNum] = useState(1);

  const [filters, setFilters] = useState({
    dptcd: "",
    orgdiv: "",
    rtryn: "N",
    prsnnum: "",
    prsnnm: "",
    pgSize: PAGE_SIZE,
  });

  const parameters: Iparameters = {
    procedureName: "P_HU_A5020W_Sub1_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": "01",
      "@p_prsnnum": filters.prsnnum,
      "@p_prsnnm": filters.prsnnm,
      "@p_rtryn": filters.rtryn,
      "@p_company_code": companyCode,
    },
  };
  useEffect(() => {
    fetchMainGrid();
  }, [mainPgNum]);

  //그리드 조회
  const fetchMainGrid = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    }
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], {}));
  };

  //스크롤 핸들러 => 한번에 pageSize만큼 조회
  const onScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onKeepingDataStateChange = (event: GridDataStateChangeEvent) => {
    setKeepingDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onKeepingSortChange = (e: any) => {
    setKeepingDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onRowDoubleClick = (props: any) => {
    const selectedData = props.dataItem;

    setKeepingDataResult((prev) => {
      return {
        data: [
          ...prev.data,
          ...[{ ...selectedData, idx: keepingDataResult.data.length + 1 }],
        ],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveKeepingRow = () => {
    //삭제 안 할 데이터 newData에 push
    let newData: any[] = [];

    keepingDataResult.data.forEach((item: any) => {
      if (!keepingSelectedState[item[KEEPING_DATA_ITEM_KEY]]) {
        newData.push(item);
      }
    });

    setKeepingDataResult((prev) => {
      return {
        data: newData,
        total: prev.total - 1,
      };
    });
  };

  const onConfirmBtnClick = (props: any) => {
    const newData = keepingDataResult.data.map((items) => {
      const dptcds = dptcdListData.find((item: any) => item.dptnm === items.dptcd)
      ?.dptcd;
      const abilcds = abilcdListData.find(
        (item: any) => item.code_name === items.abilcd
      )?.sub_code;
      const postcds = postcdListData.find(
        (item: any) => item.code_name === items.postcd
      )?.sub_code;
      return({
        prsnnum: items.prsnnum,
      prsnnm: items.prsnnm,
      dptcd: dptcds == undefined ? "" : dptcds,
      abilcd: abilcds == undefined ? "" : abilcds,
      postcd: postcds == undefined ? "" : postcds,
      })
    }
    );
    setData(newData);
    onClose();
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };
  const onKeepingSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: keepingSelectedState,
      dataItemKey: KEEPING_DATA_ITEM_KEY,
    });

    setKeepingSelectedState(newSelectedState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };
  const keepingTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {keepingDataResult.total}건
      </td>
    );
  };

  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      prsnnum: data.user_id,
      prsnnm: data.user_name,
    }));
  };

  return (
    <Window
      title={"사용자리스트(멀티)"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TitleContainer>
        <Title></Title>
        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            themeColor={"primary"}
          >
            조회
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox>
          <tbody>
            <tr>
              <th>사용자 ID</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onPrsnnumWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>사용자 이름</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="rtryn"
                    value={filters.rtryn}
                    bizComponentId="R_RTR"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer height="calc(100% - 470px)">
        <GridTitleContainer>
          <GridTitle>사용자 리스트</GridTitle>
          <PrimaryP>※ 더블 클릭하여 사용자 Keeping</PrimaryP>
        </GridTitleContainer>
        <Grid
          style={{ height: "calc(100% - 42px)" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              dptcd: dptcdListData.find((item: any) => item.dptcd === row.dptcd)
                ?.dptnm,
              abilcd: abilcdListData.find(
                (item: any) => item.sub_code === row.abilcd
              )?.code_name,
              postcd: postcdListData.find(
                (item: any) => item.sub_code === row.postcd
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
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult.total}
          onScroll={onScrollHandler}
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
            field="prsnnum"
            title="사번"
            width="200px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="prsnnm" title="성명" width="200px" />
          <GridColumn field="dptcd" title="부서코드" width="130px" />
          <GridColumn field="abilcd" title="직책" width="120px" />
          <GridColumn field="postcd" title="직위" width="120px" />
        </Grid>
      </GridContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>Keeping</GridTitle>
          <PrimaryP>※ 더블 클릭하여 Keeping 해제</PrimaryP>
        </GridTitleContainer>
        <Grid
          style={{ height: "250px" }}
          data={process(
            keepingDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: keepingSelectedState[keepingIdGetter(row)], //선택된 데이터
            })),
            keepingDataState
          )}
          onDataStateChange={onKeepingDataStateChange}
          {...keepingDataState}
          //선택 기능
          dataItemKey={KEEPING_DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onKeepingSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={keepingDataResult.total}
          //onScroll={onScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onKeepingSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //더블클릭
          onRowDoubleClick={onRemoveKeepingRow}
        >
          <GridColumn
            field="prsnnum"
            title="사번"
            width="200px"
            footerCell={keepingTotalFooterCell}
          />
          <GridColumn field="prsnnm" title="성명" width="200px" />
          <GridColumn field="dptcd" title="부서코드" width="130px" />
          <GridColumn field="abilcd" title="직책" width="120px" />
          <GridColumn field="postcd" title="직위" width="120px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            취소
          </Button>
          <Button themeColor={"primary"} onClick={onConfirmBtnClick}>
            확인
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"FILTER"}
          setData={setPrsnnumData}
        />
      )}
    </Window>
  );
};

export default ItemsMultiWindow;
