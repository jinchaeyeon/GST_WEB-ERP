import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridFilterChangeEvent,
} from "@progress/kendo-react-grid";
import {
  CompositeFilterDescriptor,
  DataResult,
  process,
  State,
  filterBy,
} from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";

import { FilterBox, FilterBoxWrap } from "../../CommonStyled";

import {
  Input,
  RadioButton,
  RadioButtonChangeEvent,
} from "@progress/kendo-react-inputs";
import LocationDDL from "../DropDownLists/LocationDDL";

import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";

type IKendoWindow = {
  getVisible(t: boolean): void;
  getData(data: object): void;
  workType: string;
  para?: Iparameters; //{};
};

const KendoWindow = ({ getVisible, workType, getData, para }: IKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio button Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: RadioButtonChangeEvent) => {
    const name = e.syntheticEvent.currentTarget.name;
    const value = e.value;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    custcd: "",
    custnm: "",
    custdiv: "",
    useyn: "%",
  });
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
    getVisible(false);
  };

  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
    //sort: [{ field: "customerID", dir: "asc" }],
    group: [{ field: "itemacnt" }],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], dataState)
  );

  useEffect(() => {
    fetchMain();
  }, []);

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;

    const queryStr =
      "SELECT custcd, custnm, custabbr, bizregnum, custdiv, custdivnm, countrycd, useyn, remark, zipcode, address, compclass,ceonm FROM ( SELECT BA020T.custcd, BA020T.custnm, BA020T.custdiv, isnull(A.code_name,'') as custdivnm,    BA020T.useyn,     BA020T.countrycd,      BA020T.remark,      BA020T.address,      BA020T.zipcode,    BA020T.bizregnum,    BA020T.custabbr,    BA020T.compclass,    BA020T.ceonm    FROM ba020t LEFT OUTER JOIN comCodeMaster A                ON A.group_code = 'BA026' AND A.sub_code = ba020t.custdiv) a";

    let query = {
      query: "query?query=" + queryStr,
    };
    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowsCnt = data.result.totalRowCount;
      const rows = data.result.data.Rows;

      setMainDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowsCnt,
        };
      });
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], dataState));
  };

  const initialFilter: CompositeFilterDescriptor = {
    logic: "and",
    filters: [],
  };
  const [filter, setFilter] = React.useState(initialFilter);

  const CommandCell = (props: GridCellProps) => {
    const onSelectClick = () => {
      // 부모로 데이터 전달, 창 닫기
      const rowData = props.dataItem;
      getData(rowData);
      onClose();
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onSelectClick}
          icon="check"
        ></Button>
      </td>
    );
  };
  return (
    <Window
      title={"업체마스터"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <FilterBoxWrap>
        <FilterBox>
          <tbody style={{ display: "none" }}>
            <tr>
              <th>업체명</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>

              <th>업체코드</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
              </td>
              <th>업체구분</th>
              <td>
                <LocationDDL />
              </td>
              <th>사용여부</th>
              <td>
                <RadioButton
                  name="finyn"
                  value="Y"
                  checked={filters.useyn === "Y"}
                  onChange={filterRadioChange}
                  label="Y"
                />
                <RadioButton
                  name="finyn"
                  value="N"
                  checked={filters.useyn === "N"}
                  onChange={filterRadioChange}
                  label="N"
                />
                <RadioButton
                  name="finyn"
                  value="%"
                  checked={filters.useyn === "%"}
                  onChange={filterRadioChange}
                  label="전체"
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <Grid
        style={{ height: "500px" }}
        data={filterBy(mainDataResult.data, filter)}
        sortable={true}
        groupable={false}
        reorderable={true}
        //onDataStateChange={dataStateChange}
        fixedScroll={true}
        total={mainDataResult.total}
        //onScroll={scrollHandler}
        filterable={true}
        filter={filter}
        onFilterChange={(e: GridFilterChangeEvent) => setFilter(e.filter)}
        {...dataState}
      >
        <GridColumn cell={CommandCell} width="55px" filterable={false} />
        <GridColumn
          field="custcd"
          title="업체코드"
          width="160px" /*footerCell={detailTotalFooterCell}*/
        />

        <GridColumn field="custnm" title="업체명" width="200px" />
        <GridColumn field="custabbr" title="업체약어" width="120px" />
        <GridColumn field="bizregnum" title="사업자등록번호" width="120px" />
        <GridColumn field="custdivnm" title="업체구분" width="120px" />
        <GridColumn field="useyn" title="사용유무" width="120px" />
        <GridColumn field="remark" title="비고" width="120px" />
        <GridColumn field="compclass" title="업태" width="120px" />
        <GridColumn field="ceonm" title="대표자명" width="120px" />
      </Grid>
    </Window>
  );
};

export default KendoWindow;
