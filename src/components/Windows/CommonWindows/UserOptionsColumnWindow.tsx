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
import { useApi } from "../../../hooks/api";

import {
  BottomContainer,
  ButtonContainer,
  FieldWrap,
  GridContainer,
} from "../../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import {
  FormNumberCell,
  FormNameCell,
  FormInput,
  FormReadOnly,
} from "../../Editors";
import { Iparameters, TControlObj } from "../../../store/types";
import {
  arrayLengthValidator,
  chkScrollHandler,
  validator,
} from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../../hooks/interfaces";
import { FORM_DATA_INDEX, PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers";
import { tokenState } from "../../../store/atoms";
import { useRecoilState } from "recoil";

// Create React.Context to pass props to the Form Field components from the main component
export const USER_OPTIONS_COLUMN_WINDOW_FORM_GRID_EDIT_CONTEXT =
  React.createContext<{
    editIndex: number | undefined;
    parentField: string;
  }>({} as any);

let deletedRows: object[] = [];

const DATA_ITEM_KEY = "column_id ";
const idGetter = getter(FORM_DATA_INDEX);

type TKendoWindow = {
  getVisible(t: boolean): void;
  workType: string;
  reloadData: () => void;
  parentComponent: { option_id: string; option_name: string };
};

type TDetailData = {
  rowstatus: string[];
  caption: string[];
  word_id: string[];
  sort_order: string[];
  user_editable: string[];
  column_id: string[];
  width: string[];
  fixed: string[];
};

// Create the Grid that will be used inside the Form
const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { validationMessage, visited, name, dataItemKey, option_id } =
    fieldArrayRenderProps;

  const [editIndex, setEditIndex] = React.useState<number | undefined>();
  const [detailPgNum, setDetailPgNum] = useState(1);

  const onGetColumnClick = React.useCallback(
    (e: any) => {
      e.preventDefault();

      const root = document.getElementById("root");
      if (root === null) {
        alert("오류가 발생하였습니다. 새로고침 후 다시 시도해주세요.");
        return false;
      }

      // 2) Grid 그룹
      const columnArr: any = [...root.querySelectorAll("[data-grid-name]")];
      let ifDataAdded = false;

      columnArr.forEach((item: any) => {
        if (item.dataset.gridName === option_id) {
          fieldArrayRenderProps.onPush({
            value: {
              srcPgName: "USER_OPTIONS_COLUMN_WINDOW",
              rowstatus: "N",
              column_id: item.id,
              caption: item.dataset.caption,
              width: item.dataset.width,
            },
          });

          ifDataAdded = true;
        }
      });

      if (!ifDataAdded) {
        alert("영역ID를 확인해주세요.");
      }
    },
    [fieldArrayRenderProps]
  );

  // Add a new item to the Form FieldArray that will be shown in the Grid
  const onAdd = React.useCallback(
    (e: any) => {
      e.preventDefault();
      fieldArrayRenderProps.onPush({
        value: {
          srcPgName: "USER_OPTIONS_COLUMN_WINDOW",
          rowstatus: "N",
          width: 120,
          user_edit_yn: "Y",
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
      return {
        ...item,
        [FORM_DATA_INDEX]: index,
      };
    }
  );

  //스크롤 핸들러
  const scrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, PAGE_SIZE))
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
      <USER_OPTIONS_COLUMN_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider
        value={{
          editIndex,
          parentField: name,
        }}
      >
        {visited && validationMessage && <Error>{validationMessage}</Error>}
        <Grid
          data={dataWithIndexes.map((item: any) => ({
            ...item,
            parentField: name,
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
            <Button
              type={"button"}
              themeColor={"primary"}
              fillMode="outline"
              onClick={onGetColumnClick}
              icon="file-add"
            >
              가져오기
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
            field="column_id"
            title="컬럼ID"
            //width="160px"
            cell={FormNameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="caption"
            title="캡션"
            //width="180px"
            cell={FormNameCell}
          />
          <GridColumn
            field="width"
            title="컬럼너비"
            width="180px"
            cell={FormNumberCell}
          />
          <GridColumn
            field="user_editable"
            title="사용자 수정가능여부"
            width="180px"
            cell={FormNameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="hidden"
            title="숨김여부"
            width="180px"
            cell={FormNameCell}
            headerCell={RequiredHeader}
            className="required"
          />
          <GridColumn
            field="fixed"
            title="컬럼고정여부"
            width="180px"
            cell={FormNameCell}
            headerCell={RequiredHeader}
            className="required"
          />
        </Grid>
      </USER_OPTIONS_COLUMN_WINDOW_FORM_GRID_EDIT_CONTEXT.Provider>
    </GridContainer>
  );
};
const KendoWindow = ({
  getVisible,
  workType,
  reloadData,
  parentComponent,
}: TKendoWindow) => {
  const pathname: string = window.location.pathname.replace("/", "");
  const { option_id = "", option_name = "" } = parentComponent;
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
    option_id: option_id,
    option_name: option_name,
  });

  //요약정보 조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "web_sel_column_view_config",
    pageNumber: 1,
    pageSize: 50,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_dbname": "SYSTEM",
      "@p_form_id": pathname,
      "@p_lang_id": "",
      "@p_parent_component": option_id,
      "@p_message": "",
    },
  };

  const [token] = useRecoilState(tokenState);
  const { userId } = token;

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    form_id: pathname,
    type: "Column",
    company_code: "",
    option_id: "",
    option_name: "",
    subject_word_id: "",
    remarks: "",
    row_status: "",
    default_id: "",
    caption: "",
    word_id: "",
    sort_order: "",
    value_type: "",
    value_code: "",
    value: "",
    bc_id: "",
    where_query: "",
    add_year: "",
    add_month: "",
    add_day: "",
    session_item: "",
    use_session: "",
    user_editable: "",
    column_id: "",
    width: "",
    fixed: "",
    id: userId,
    pc: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "sav_custom_option",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_form_id": paraData.form_id,
      "@p_type": paraData.type,
      "@p_company_code": paraData.company_code,
      "@p_option_id": paraData.option_id,
      "@p_option_name": paraData.option_name,
      "@p_subject_word_id": paraData.subject_word_id,
      "@p_remarks": paraData.remarks,
      "@p_row_status": paraData.row_status,

      /* sysCustomOptionDefault */
      "@p_default_id": paraData.default_id,
      "@p_caption": paraData.caption,
      "@p_word_id": paraData.word_id,
      "@p_sort_order": paraData.sort_order,
      "@p_value_type": paraData.value_type,
      "@p_value_code": paraData.value_code,
      "@p_value": paraData.value,
      "@p_bc_id": paraData.bc_id,
      "@p_where_query": paraData.where_query,
      "@p_add_year": paraData.add_year,
      "@p_add_month": paraData.add_month,
      "@p_add_day": paraData.add_day,
      "@p_session_item": paraData.session_item,
      "@p_use_session": paraData.use_session,
      "@p_user_editable": paraData.user_editable,
      /* sysCustomOptionColumn */
      "@p_column_id": paraData.column_id,
      "@p_width": paraData.width,
      "@p_fixed": paraData.fixed,

      "@p_id": paraData.id,
      "@p_pc": paraData.pc,
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
        };
      });

      setDetailDataResult(() => {
        return {
          data: [...rows],
          total: totalRowsCnt,
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
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    //검증
    try {
      dataItem.orderDetails.forEach((item: any) => {
        if (!item.column_id) {
          throw "필드명을 입력하세요.";
        }
        // if (!item.column_visible) {
        //   throw "컬럼 보이기를 선택하세요.";
        // }
        // if (!item.user_edit_yn) {
        //   throw "사용자 수정가능여부 선택하세요.";
        // }
        // if (!item.user_required_yn) {
        //   throw "필수여부를 선택하세요.";
        // }
        // if (!item.column_type) {
        //   throw "컬럼타입을 선택하세요.";
        // }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const { option_id, option_name, orderDetails } = dataItem;

    let detailArr: TDetailData = {
      rowstatus: [],
      caption: [],
      word_id: [],
      sort_order: [],
      user_editable: [],
      column_id: [],
      width: [],
      fixed: [],
    };

    deletedRows.forEach((item: any, idx: number) => {
      detailArr.rowstatus.push("D");
      detailArr.caption.push(item.caption);
      detailArr.word_id.push(item.word_id);
      detailArr.sort_order.push("0");
      detailArr.user_editable.push(item.user_editable);
      detailArr.column_id.push(item.column_id);
      detailArr.width.push(item.width);
      detailArr.fixed.push(item.fixed);
    });

    deletedRows = []; //초기화

    orderDetails.forEach((item: any, idx: number) => {
      // if (!item.rowstatus) return;
      detailArr.rowstatus.push(item.rowstatus);
      detailArr.caption.push(item.caption);
      detailArr.word_id.push(item.word_id);
      detailArr.sort_order.push(String(idx + 1));
      detailArr.user_editable.push(item.user_editable);
      detailArr.column_id.push(item.column_id);
      detailArr.width.push(item.width);
      detailArr.fixed.push(item.fixed);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      // parent_component,
      // message_id,
      option_id,
      option_name,

      row_status: detailArr.rowstatus.join("|"),
      caption: detailArr.caption.join("|"),
      word_id: detailArr.word_id.join("|"),
      sort_order: detailArr.sort_order.join("|"),
      user_editable: detailArr.user_editable.join("|"),
      column_id: detailArr.column_id.join("|"),
      width: detailArr.width.join("|"),
      fixed: detailArr.fixed.join("|"),
    }));
  };

  return (
    <Window
      title={
        workType === "N"
          ? "사용자 옵션 컬럼 생성 (관리자)"
          : "사용자 옵션 컬럼 수정 (관리자)"
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
          option_id: initialVal.option_id,
          option_name: initialVal.option_name,
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
                  label={"영역ID"}
                  name={"option_id"}
                  component={workType === "U" ? FormReadOnly : FormInput}
                  validator={validator}
                  className={workType === "U" ? "readonly" : "required"}
                />
                <Field
                  label={"영역명"}
                  name={"option_name"}
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
              //validator={arrayLengthValidator}
              option_id={formRenderProps.valueGetter("option_id")}
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
