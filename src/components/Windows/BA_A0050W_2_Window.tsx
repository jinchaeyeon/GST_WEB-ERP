import { useEffect, useState, useCallback } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  FilterBoxWrap,
  FilterBox,
  GridTitleContainer,
  GridTitle,
} from "../../CommonStyled";
import { COM_CODE_DEFAULT_VALUE, SELECTED_FIELD } from "../CommonString";
import { Input } from "@progress/kendo-react-inputs";
import { Form, FormElement, FormRenderProps } from "@progress/kendo-react-form";
import { Iparameters } from "../../store/types";
import {
  UseBizComponent,
  UseMessages,
  handleKeyPressSearch,
  UseParaPc,
  getQueryFromBizComponent,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import { EDIT_FIELD, FORM_DATA_INDEX, PAGE_SIZE } from "../CommonString";
import { tokenState } from "../../store/atoms";
import { useRecoilState } from "recoil";

const SUB_DATA_ITEM_KEY = "pattern_id";

// Create React.Context to pass props to the Form Field components from the main component
export const FormGridEditContext = React.createContext<{
  onEdit: (dataItem: any, isNew: boolean) => void;
  onSave: () => void;
  editIndex: number | undefined;
  parentField: string;
}>({} as any);

type TPara = {
  user_id: string;
  user_name: string;
};
type TKendoWindow = {
  getVisible(isVisible: boolean): void;
  setData(data: object): void;
  para: TPara;
};

const KendoWindow = ({
  getVisible,
  setData,
  para = { user_id: "", user_name: "" },
}: TKendoWindow) => {
  const { user_id, user_name } = para;
  const [token] = useRecoilState(tokenState);
  const { userId } = token;
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA011,L_PR010", setBizComponentData);

  const [outprocynListData, setOutprocynListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 670,
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

  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };

  const [formKey2, setFormKey2] = React.useState(1);
  const resetForm2 = () => {
    setFormKey2(formKey2 + 1);
  };
  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);

  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], dataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  useEffect(() => {
    fetchGrid();
    fetchGrid2();
  }, []);

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    pattern_id: "",
    pattern_name: "",
    proccd: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0050W_Sub2_Q ",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_pattern_id": filters.pattern_id,
      "@p_pattern_name": filters.pattern_name,
      "@p_proccd": filters.proccd,
    },
  };

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    orgdiv: "01",
    location: "01",
    pattern_id: "A",
    pattern_name: "",
    proccd: "",
  });

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_BA_A0050W_Sub2_Q ",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": filters2.workType,
      "@p_orgdiv": filters2.orgdiv,
      "@p_location": filters2.location,
      "@p_pattern_id": filters2.pattern_id,
      "@p_pattern_name": filters2.pattern_name,
      "@p_proccd": filters2.proccd,
    },
  };

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  useEffect(() => {
    resetForm2();
  }, [detailDataResult2]);

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
   
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
        };
      });
    }
  };

  //상세그리드 조회
  const fetchGrid2 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult2(() => {
        return {
          data: [...rows],
          total: totalRowCnt,
        };
      });
    }
  };

  const pathname: string = window.location.pathname.replace("/", "");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailDataResult(process([], dataState));
    setDetailDataResult2(process([], dataState));
  };

  useEffect(() => {
    if (bizComponentData !== null) {
      const outprocynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA011")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(outprocynQueryStr, setOutprocynListData);
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

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const filterInputChange2 = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const search = () => {
    resetAllGrid();
    fetchGrid();
    fetchGrid2();
  };

  useEffect(() => {
    fetchGrid2();
  }, [filters2]);

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);

    setFilters2((prev) => ({
      ...prev,
      pattern_id: Object.getOwnPropertyNames(newSelectedState)[0],
    }));
  };

  const onRowDoubleClick = (props: any) => {
    setData(detailDataResult2.data);
    onClose();
  };

  return (
    <Window
      title={"패턴공장도 참조"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Form
        initialValues={{
          user_id,
          user_name,
          groupDetails: detailDataResult.data, //detailDataResult.data,
          groupDetails2: detailDataResult2.data,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
            <fieldset className={"k-form-fieldset"}>
              <button
                id="valueChanged"
                style={{ display: "none" }}
                onClick={(e) => {
                  e.preventDefault(); // Changing desired field value
                  formRenderProps.onChange("valueChanged", {
                    value: "1",
                  });
                }}
              ></button>
              <FilterBoxWrap>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>패턴ID</th>
                      <td>
                        <Input
                          name="pattern_id"
                          type="text"
                          value={filters.pattern_id}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>패턴명</th>
                      <td>
                        <Input
                          name="pattern_name"
                          type="text"
                          value={filters.pattern_name}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>공정</th>
                      <td>
                        <Input
                          name="proccd"
                          type="text"
                          value={filters2.proccd}
                          onChange={filterInputChange2}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterBoxWrap>
            </fieldset>
            <GridContainer
              style={{ width: "500px", display: "inline-block" }}
              margin={{ top: "30px" }}
            >
                                         <GridTitleContainer>
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
              <Grid
                data={detailDataResult.data.map((item: any) => ({
                  ...item,
                }))}
                total={detailDataResult.total}
                dataItemKey={FORM_DATA_INDEX}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "multiple",
                }}
                onSelectionChange={onSubDataSelectionChange}
                style={{ height: "400px" }}
              >
                <GridColumn field="pattern_id" title="패턴ID" width="120px"/>
                <GridColumn field="pattern_name" title="패턴명" width="150px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>
            <GridContainer
              style={{ width: "600px", display: "inline-block" }}
              margin={{ top: "30px", left: "40px" }}
            >
                                         <GridTitleContainer>
                  <GridTitle>상세정보</GridTitle>
                </GridTitleContainer>
              <Grid
                data={detailDataResult2.data.map((item: any) => ({
                  ...item,
                  outprocyn: outprocynListData.find(
                    (items: any) => items.sub_code === item.outprocyn
                  )?.code_name,
                  proccd: proccdListData.find(
                    (items: any) => items.sub_code === item.proccd
                  )?.code_name
                }))}
                total={detailDataResult2.total}
                dataItemKey={FORM_DATA_INDEX}
                onRowDoubleClick={onRowDoubleClick}
                style={{ height: "400px" }}
              >
                <GridColumn field="proccd" title="공정" width="150px"/>
                <GridColumn field="procseq" title="공정순서" width="120px" />
                <GridColumn field="outprocyn" title="외주구분" width="120px" />
                <GridColumn field="remark" title="비고" width="200px" />
              </Grid>
            </GridContainer>

            <BottomContainer>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={onClose}
                >
                  닫기
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
