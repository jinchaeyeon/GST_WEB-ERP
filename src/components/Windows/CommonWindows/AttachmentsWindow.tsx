import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  TitleContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../../hooks/interfaces";
import { isLoading, unsavedNameState } from "../../../store/atoms";
import CenterCell from "../../Cells/CenterCell";
import CheckBoxCell from "../../Cells/CheckBoxCell";
import NumberCell from "../../Cells/NumberCell";
import {
  convertDateToStrWithTime2,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
} from "../../CommonFunction";
import { EDIT_FIELD, SELECTED_FIELD } from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers/Renderers";
import Window from "../WindowComponent/Window";

type permission = {
  upload: boolean;
  download: boolean;
  delete: boolean;
};

type IKendoWindow = {
  setVisible(arg: boolean): void;
  setData?(data: object): void;
  para: string;
  permission?: permission;
  modal?: boolean;
};

const DATA_ITEM_KEY = "idx";
let idx = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
const KendoWindow = ({
  setVisible,
  setData,
  para = "",
  permission,
  modal = false,
}: IKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;

  let isMobile = deviceWidth <= 1200;
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });
  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar");
    height2 = getHeight(".WindowTitleContainer");
    height3 = getHeight(".example");
    height4 = getHeight(".BottomContainer");
    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3 -
        height4
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) -
        height -
        height2 -
        height3 -
        height4
    );
  };

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);
  const [attachmentNumber, setAttachmentNumber] = useState(para);
  const setLoading = useSetRecoilState(isLoading);

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  useEffect(() => {
    fetchGrid();
  }, [attachmentNumber]);

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

  //그리드 조회
  const fetchGrid = async () => {
    let data: any;

    if (attachmentNumber == "") {
      setMainDataResult((prev) => {
        return {
          data: [],
          total: 0,
        };
      });

      return false;
    }
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
        const rows = data.tables[0].Rows.map((item: any) => ({
          ...item,
          idx: idx++,
        }));

        setMainDataResult((prev) => {
          return {
            data: [...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        result = {
          attdatnum: rows[0].attdatnum,
          original_name: rows[0].original_name,
          rowCount: totalRowCnt,
        };
      } else {
        setMainDataResult((prev) => {
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
    if (setData) {
      setData(result);
    }
  };

  const excelInput: any = React.useRef();

  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };
  const downloadFiles = async () => {
    const parameters = mainDataResult.data.filter((item) => item.chk == true);
    if (parameters.length == 0) {
      alert("선택된 자료가 없습니다.");
      return false;
    }
    let response: any;

    parameters.forEach(async (parameter) => {
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
              const filenameRegex = /filename\*?=UTF-8''([^;\n]+)/;
              const matches = filenameRegex.exec(disposition);

              if (matches != null && matches[1]) {
                const encodedFilename = matches[1].trim();
                filename = decodeURIComponent(encodedFilename);
              } else {
                const fallbackRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const fallbackMatches = fallbackRegex.exec(disposition);

                if (fallbackMatches != null && fallbackMatches[1]) {
                  filename = fallbackMatches[1].replace(/['"]/g, "");
                }
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
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }
    let data: any;
    const parameters = mainDataResult.data.filter((item) => item.chk == true);

    parameters.forEach(async (parameter) => {
      try {
        data = await processApi<any>("file-delete", {
          attached: parameter.saved_name,
        });
      } catch (error) {
        data = null;
      }

      if (data !== null) {
        fetchGrid();
      } else {
        alert("처리 중 오류가 발생하였습니다.");
      }
    });
  };

  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files == null) return false;
    setLoading(true);

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
        fetchGrid();
      }
    }
    setLoading(false);
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
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
              chk: !item.chk,
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

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    function changeCheck() {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  return (
    <Window
      titles={"파일첨부관리"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <TitleContainer className="WindowTitleContainer">
        <ButtonContainer>
          <Button
            onClick={upload}
            themeColor={"primary"}
            fillMode={"outline"}
            icon={"upload"}
            disabled={
              permission != undefined
                ? permission.upload == true
                  ? false
                  : true
                : false
            }
          >
            업로드
            <input
              id="uploadAttachment"
              style={{ display: "none" }}
              type="file"
              accept="*"
              multiple
              ref={excelInput}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                handleFileUpload(event.target.files);
              }}
            />
          </Button>
          <Button
            onClick={downloadFiles}
            themeColor={"primary"}
            fillMode={"outline"}
            icon={"download"}
            disabled={
              permission != undefined
                ? permission.download == true
                  ? false
                  : true
                : false
            }
          >
            다운로드
          </Button>
          <Button
            onClick={deleteFiles}
            themeColor={"primary"}
            fillMode={"outline"}
            icon={"delete"}
            disabled={
              permission != undefined
                ? permission.delete == true
                  ? false
                  : true
                : false
            }
          >
            삭제
          </Button>
        </ButtonContainer>
      </TitleContainer>
      {!isMobile ? (
        <div
          onDrop={(event: React.DragEvent<HTMLInputElement>) => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            handleFileUpload(files);
          }}
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
          }}
          style={{
            width: "100% ",
            lineHeight: "100px",
            border: "solid 1px rgba(0, 0, 0, 0.08)",
            paddingBottom: "5px",
            textAlign: "center",
            color: "rgba(0,0,0,0.8)",
          }}
          className="example"
        >
          <span
            className="k-icon k-i-file-add"
            style={{ marginRight: "5px" }}
          ></span>
          업로드할 파일을 마우스로 끌어오세요.
        </div>
      ) : (
        ""
      )}
      <GridContainer
        style={{
          overflow: "auto",
        }}
      >
        <Grid
          style={{
            height: !isMobile ? webheight : mobileheight,
          }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              insert_time: convertDateToStrWithTime2(new Date(row.insert_time)),
              [SELECTED_FIELD]: selectedState[idGetter(row)],
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            drag: false,
            cell: false,
            mode: "single",
          }}
          onSelectionChange={onSelectionChange}
          fixedScroll={true}
          total={mainDataResult.total}
          sortable={true}
          onSortChange={onMainSortChange}
          reorderable={true}
          //컬럼너비조정
          resizable={true}
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
          <GridColumn field="original_name" title="파일명" width="600" />
          <GridColumn
            field="file_size"
            title="파일SIZE (byte)"
            width="150"
            cell={NumberCell}
          />
          <GridColumn
            field="user_name"
            title="등록자"
            cell={CenterCell}
            width="150"
          />
          <GridColumn
            field="insert_time"
            title="등록일자"
            width="180"
            cell={CenterCell}
          />
        </Grid>
      </GridContainer>
      <BottomContainer className="BottomContainer">
        <p>※ 최대 파일 크기 (400MB)</p>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
