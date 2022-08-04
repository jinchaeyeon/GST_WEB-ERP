import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridToolbar,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
} from "@progress/kendo-react-grid";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";

import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
  GridContainer,
} from "../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import { NumberCell, NameCell, FormInput, validator } from "./editors";
import { Iparameters } from "../../store/types";
import { chkScrollHandler } from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../hooks/interfaces";
import { pageSize } from "../CommonString";
import { CellRender, RowRender } from "./renderers";

// Validate the entire Form
const arrayLengthValidator = (value: any) =>
  value && value.length ? "" : "최소 1개 행을 입력해주세요";

// Create React.Context to pass props to the Form Field components from the main component
export const USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT =
  React.createContext<{
    editIndex: number | undefined;
    parentField: string;
  }>({} as any);

const deletedRows: object[] = [];

const FORM_DATA_INDEX = "formDataIndex";
const DATA_ITEM_KEY = "field_name ";

const idGetter = getter(FORM_DATA_INDEX);
const SELECTED_FIELD: string = "selected";

const pathname: string = window.location.pathname;

type TKendoWindow = {
  getVisible(t: boolean): void;
  workType: string;
  reloadData: () => void;
  processType?: string;
};

type TDetailData = {
  component: string[];
  parent_component: string[];
  field_name: string[];
  word_id: string[];
  biz_component_id: string[];
  where_query: string[];
  add_empty_row: string[];
  repository_item: string[];
  component_type: string[];
  component_full_type: string[];
  sort_seq: string[];
  value_type: string[];
  value: string[];
  value_name: string[];
  add_year: string[];
  add_month: string[];
  add_day: string[];
  user_edit_yn: string[];
  use_session: string[];
  caption: string[];
  allow_session: string[];
  session_item: string[];
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey } =
    fieldArrayRenderProps;
  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const [detailPgNum, setDetailPgNum] = useState(1);

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          srcPgName: "USER_OPTIONS_DEFAULT_WINDOW",
          rowstatus: "N",
          value_type: "Datetime",
          add_year: 0,
          add_month: 0,
          add_day: 0,
        },
      });

      setEditIndex(0);
    },
    [fieldArrayRenderProps]
  );

  const onRemove = React.useCallback(() => {
    let newData: any[] = [];

    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    fieldArrayRenderProps.value.forEach((item: any, index: number) => {
      if (!selectedState[index]) {
        newData.push(item);
      } else {
        deletedRows.push(item);
      }
    });

    //전체 데이터 삭제
    fieldArrayRenderProps.value.forEach(() => {
      fieldArrayRenderProps.onRemove({
        index: 0,
      });
    });

    //newData 생성
    newData.forEach((item: any) => {
      fieldArrayRenderProps.onPush({
        value: item,
      });
    });

    //선택 상태 초기화
    setSelectedState({});

    //수정 상태 초기화
    setEditIndex(undefined);
  }, [fieldArrayRenderProps]);

  const dataWithIndexes = fieldArrayRenderProps.value.map(
    (item: any, index: any) => {
      return { ...item, [FORM_DATA_INDEX]: index };
    }
  );

  //스크롤 핸들러
  const scrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, pageSize))
      setDetailPgNum((prev) => prev + 1);
  };

  const EDIT_FIELD = "inEdit";

  const enterEdit = (dataItem: any, field: string | undefined) => {
    fieldArrayRenderProps.onReplace({
      index: dataItem[FORM_DATA_INDEX],
      value: {
        ...dataItem,
        rowstatus: dataItem.rowstatus === "N" ? dataItem.rowstatus : "U",
        [EDIT_FIELD]: field,
      },
    });

    setEditIndex(dataItem[FORM_DATA_INDEX]);
  };

  const exitEdit = (item: any) => {
    fieldArrayRenderProps.value.forEach((item: any, index: any) => {
      fieldArrayRenderProps.onReplace({
        index: index,
        value: {
          ...item,
          [EDIT_FIELD]: undefined,
        },
      });
    });
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

  const [selectedState, setSelectedState] = React.useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = React.useCallback(
    (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: FORM_DATA_INDEX,
      });

      setSelectedState(newSelectedState);
    },
    [selectedState]
  );

  const onHeaderSelectionChange = React.useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: {
        [id: string]: boolean | number[];
      } = {};

      event.dataItems.forEach((item) => {
        newSelectedState[idGetter(item)] = checked;
      });

      setSelectedState(newSelectedState);

      //선택된 상태로 리랜더링
      event.dataItems.forEach((item: any, index: number) => {
        fieldArrayRenderProps.onReplace({
          index: index,
          value: {
            ...item,
          },
        });
      });
    },
    []
  );

  interface ProductNameHeaderProps extends GridHeaderCellProps {
    children: any;
  }

  const RequiredHeader = (props: ProductNameHeaderProps) => {
    return (
      <span className="k-cell-inner">
        <a className="k-link" onClick={props.onClick}>
          <span style={{ color: "#ff6358" }}>{props.title}</span>
          {props.children}
        </a>
      </span>
    );
  };

  return (
    <GridContainer margin={{ top: "30px" }}>
      <USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider
        value={{
          editIndex,
          parentField: name,
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            [SELECTED_FIELD]: selectedState[idGetter(item)],
          }))}
          total={dataWithIndexes.total}
          dataItemKey={dataItemKey}
          style={{ height: "550px" }}
          cellRender={customCellRender}
          rowRender={customRowRender}
          onScroll={scrollHandler}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "multiple",
          }}
          onSelectionChange={onSelectionChange}
          onHeaderSelectionChange={onHeaderSelectionChange}
        >
          <GridToolbar>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onAdd}
              icon="add"
            >
              추가
            </Button>
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onRemove}
              icon="minus"
            >
              삭제
            </Button>
          </GridToolbar>

          <GridColumn
            field={SELECTED_FIELD}
            width="45px"
            headerSelectionValue={
              dataWithIndexes.findIndex(
                (item: any) => !selectedState[idGetter(item)]
              ) === -1
            }
          />
          <GridColumn field="rowstatus" title=" " width="40px" />
          <GridColumn
            field="field_name"
            title="필드명"
            width="160px"
            cell={NameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="caption"
            title="캡션"
            width="180px"
            cell={NameCell}
          />
          <GridColumn
            field="value_type"
            title="VALUE타입"
            width="120px"
            cell={NameCell} //CellDropDownList
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="value"
            title="VALUE"
            width="120px"
            cell={NameCell}
          />
          <GridColumn
            field="add_year"
            title="연 추가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="add_month"
            title="월 추가"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn
            field="add_day"
            title="일 추가"
            width="120px"
            cell={NumberCell}
          />
        </Grid>
      </USER_OPTIONS_DEFAULT_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({
  getVisible,
  workType,
  reloadData,
  processType,
}: TKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
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

  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);

  const processApi = useApi();

  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
    //sort: [{ field: "customerID", dir: "asc" }],
    group: [{ field: "itemacnt" }],
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [initialVal, setInitialVal] = useState({
    message_id: "",
    process_type: "",
  });

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "WEB_sys_sel_default_management",
    pageNumber: 1,
    pageSize: 50,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_process_type": workType === "U" ? processType : "",
      "@p_message": "",
    },
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    process_type: "",
    form_id: pathname,
    component: "",
    parent_component: "",
    field_name: "",
    word_id: "",
    caption: "",
    biz_component_id: "",
    where_query: "",
    add_empty_row: "",
    repository_item: "",
    component_type: "",
    component_full_type: "",
    sort_seq: "",
    message_id: "",
    value_type: "",
    value: "",
    value_name: "",
    add_year: "",
    add_month: "",
    add_day: "",
    user_edit_yn: "",
    use_session: "",
    allow_session: "",
    session_item: "",
    exec_pc: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "WEB_sys_sav_default_management",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_process_type": paraData.process_type,
      "@p_form_id": paraData.form_id,
      "@p_component": paraData.component,
      "@p_parent_component": paraData.parent_component,
      "@p_field_name": paraData.field_name,
      "@p_word_id": paraData.word_id,
      "@p_caption": paraData.caption,
      "@p_biz_component_id": paraData.biz_component_id,
      "@p_where_query": paraData.where_query,
      "@p_add_empty_row": paraData.add_empty_row,
      "@p_repository_item": paraData.repository_item,
      "@p_component_type": paraData.component_type,
      "@p_component_full_type": paraData.component_full_type,
      "@p_sort_seq": paraData.sort_seq,
      "@p_message_id": paraData.message_id,
      "@p_value_type": paraData.value_type,
      "@p_value": paraData.value,
      "@p_value_name": paraData.value_name,
      "@p_add_year": paraData.add_year,
      "@p_add_month": paraData.add_month,
      "@p_add_day": paraData.add_day,
      "@p_user_edit_yn": paraData.user_edit_yn,
      "@p_use_session": paraData.use_session,
      "@p_allow_session": paraData.allow_session,
      "@p_session_item": paraData.session_item,
      "@p_exec_pc": paraData.exec_pc,
    },
  };

  //조회
  useEffect(() => {
    if (workType === "U") {
      fetchMain();
    }
  }, []);

  //저장
  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [initialVal]);

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //요약정보 & 상세정보 조회
  const fetchMain = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowsCnt = data.tables[0].Rows.length;
      let rows = data.tables[0].Rows;

      rows = rows.map((row: any) => {
        return {
          ...row,
          srcPgName: "USER_OPTIONS_DEFAULT_WINDOW",
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });

      const row = data.tables[0].Rows[0];
      const { process_type, message_id } = row;

      setInitialVal((prev) => {
        return {
          ...prev,
          process_type,
          message_id,
        };
      });
    }
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("platform-procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장이 완료되었습니다.");
      if (workType === "U") {
        fetchMain();
        reloadData();
      } else {
        getVisible(false);
        reloadData();
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(
        "[" +
          data.result.statusCode +
          "] 처리 중 오류가 발생하였습니다. " +
          data.result.resultMessage
      );
    }
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    //검증
    try {
      dataItem.orderDetails.forEach((item: any) => {
        if (!item.field_name) {
          throw "필드명을 입력하세요.";
        }
        if (!item.value_type) {
          throw "VALUE타입을 선택하세요.";
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const { process_type, message_id, orderDetails } = dataItem;

    let detailArr: TDetailData = {
      component: [],
      parent_component: [],
      field_name: [],
      word_id: [],
      biz_component_id: [],
      where_query: [],
      add_empty_row: [],
      repository_item: [],
      component_type: [],
      component_full_type: [],
      sort_seq: [],
      value_type: [],
      value: [],
      value_name: [],
      add_year: [],
      add_month: [],
      add_day: [],
      user_edit_yn: [],
      use_session: [],
      caption: [],
      allow_session: [],
      session_item: [],
    };
    orderDetails.forEach((item: any, idx: number) => {
      const {
        field_name,
        value_type,
        value,
        add_year,
        add_month,
        add_day,
        caption,
      } = item;

      detailArr.component.push(field_name);
      detailArr.parent_component.push("");
      detailArr.field_name.push(field_name);
      detailArr.word_id.push("");
      detailArr.biz_component_id.push("");
      detailArr.where_query.push("");
      detailArr.add_empty_row.push("");
      detailArr.repository_item.push("");
      detailArr.component_type.push("");
      detailArr.component_full_type.push("");
      detailArr.sort_seq.push(String(idx));
      detailArr.value_type.push(value_type);
      detailArr.value.push(value);
      detailArr.value_name.push("");
      detailArr.add_year.push(add_year);
      detailArr.add_month.push(add_month);
      detailArr.add_day.push(add_day);
      detailArr.user_edit_yn.push("");
      detailArr.use_session.push("N");
      detailArr.caption.push(caption);
      detailArr.allow_session.push("N");
      detailArr.session_item.push("");
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "SAVE",
      process_type,
      message_id,
      component: detailArr.component.join("|"),
      parent_component: detailArr.parent_component.join("|"),
      field_name: detailArr.field_name.join("|"),
      word_id: detailArr.word_id.join("|"),
      biz_component_id: detailArr.biz_component_id.join("|"),
      where_query: detailArr.where_query.join("|"),
      add_empty_row: detailArr.add_empty_row.join("|"),
      repository_item: detailArr.repository_item.join("|"),
      component_type: detailArr.component_type.join("|"),
      component_full_type: detailArr.component_full_type.join("|"),
      sort_seq: detailArr.sort_seq.join("|"),
      value_type: detailArr.value_type.join("|"),
      value: detailArr.value.join("|"),
      value_name: detailArr.value_name.join("|"),
      add_year: detailArr.add_year.join("|"),
      add_month: detailArr.add_month.join("|"),
      add_day: detailArr.add_day.join("|"),
      user_edit_yn: detailArr.user_edit_yn.join("|"),
      use_session: detailArr.use_session.join("|"),
      caption: detailArr.caption.join("|"),
      allow_session: detailArr.allow_session.join("|"),
      session_item: detailArr.session_item.join("|"),
    }));
  };

  return (
    <Window
      title={
        workType === "N"
          ? "사용자 옵션 기본값 생성 (관리자)"
          : "사용자 옵션 기본값 수정 (관리자)"
      }
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Form
        onSubmit={handleSubmit}
        key={formKey}
        initialValues={{
          rowstatus: "",
          process_type: initialVal.process_type,
          message_id: initialVal.message_id,
          orderDetails: detailDataResult.data, //detailDataResult.data,
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
              <FieldWrap fieldWidth="25%">
                <Field
                  label={"타입ID"}
                  name={"process_type"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
                <Field
                  label={"설명"}
                  name={"message_id"}
                  component={FormInput}
                  validator={validator}
                  className="required"
                />
              </FieldWrap>
            </fieldset>
            <FieldArray
              name="orderDetails"
              dataItemKey={DATA_ITEM_KEY}
              component={FormGrid}
              validator={arrayLengthValidator}
            />

            <BottomContainer>
              <ButtonContainer>
                <Button type={"submit"} themeColor={"primary"} icon="save">
                  저장
                </Button>

                {/* <Button
                  onClick={() => (workType = "DELETE")}
                  type={"submit"}
                  themeColor={"primary"}
                  fillMode="outline"
                  icon="delete"
                  //disabled={!formRenderProps.allowSubmit}
                >
                  삭제
                </Button> */}
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
