import { useEffect, useState } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridCellProps,
  GridFilterChangeEvent,
  GridHeaderSelectionChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { DataResult, process, getter } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";

import { ButtonContainer, TitleContainer } from "../../CommonStyled";

import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import { saveAs, encodeBase64 } from "@progress/kendo-file-saver";
//import FileSaver from "file-saver";
import fileDownload from "file-saver";
import NumberCell from "../Cells/NumberCell";
import CenterCell from "../Cells/CenterCell";

type IKendoWindow = {
  getVisible(arg: boolean): void;
  getData(data: object): void;
  para: string; //{};
};

const KendoWindow = ({ getVisible, getData, para = "" }: IKendoWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 800,
  });

  const [attachmentNumber, setAttachmentNumber] = useState(para);

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
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], {})
  );

  useEffect(() => {
    fetchGrid();
  }, [attachmentNumber]);

  const uploadFile = async (files: File) => {
    let data: any;

    const filePara = {
      attached: attachmentNumber
        ? "attached?attachmentNumber=" + attachmentNumber
        : "attached",
      files: files, //.FileList,
    };

    console.log("filePara");
    console.log(filePara);

    try {
      data = await processApi<any>("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      console.log("data");
      console.log(data);

      if (data.attachmentNumber !== attachmentNumber) {
        setAttachmentNumber(data.attachmentNumber);
      } else {
        fetchGrid();
      }
    }
  };

  //그리드 조회
  const fetchGrid = async () => {
    let data: any;

    if (attachmentNumber === "") return false;
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
      const totalRowsCnt = data.result.rowCount;
      const rows = data.result.data.Rows;

      setMainDataResult((prev) => {
        return {
          data: [...rows],
          total: totalRowsCnt,
        };
      });

      result = {
        attdatnum: rows[0].attdatnum,
        original_name: rows[0].original_name,
        rowCount: totalRowsCnt,
      };
    }

    getData(result);
  };

  const excelInput: any = React.useRef();

  const upload = () => {
    const uploadInput = document.getElementById("upload");
    uploadInput!.click();
  };

  const downloadFiles = async () => {
    let data: any;
    const parameters = Object.keys(selectedState);

    parameters.forEach(async (parameter) => {
      try {
        data = await processApi<any>("file-download", { attached: parameter });
      } catch (error) {
        data = null;
      }

      if (data !== null) {
        console.log("data");
        //console.log(data);

        const original_name = mainDataResult.data.map((row: any) => {
          if (row["saved_name"] === parameter) {
            return row["original_name"];
          }
        });

        // 참고 : https://soobakba.tistory.com/30
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        // const contentDisposition = headers['content-disposition']; // 파일 이름
        // let fileName = 'unknown';
        // if (contentDisposition) {
        //   const [ fileNameMatch ] = contentDisposition.split(';').filter(str => str.includes('filename'));
        //   if (fileNameMatch)
        //     [ , fileName ] = fileNameMatch.split('=');
        // }
        link.href = url;
        link.setAttribute("download", original_name[0]);
        link.style.cssText = "display:none";
        document.body.appendChild(link);
        link.click();
        link.remove();

        // const blob = new Blob([data]); // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다. // const blob = new Blob([this.content], {type: 'text/plain'}) // blob을 사용해 객체 URL을 생성합니다.
        // const fileObjectUrl = window.URL.createObjectURL(blob); // blob 객체 URL을 설정할 링크를 만듭니다.

        // alert(1);
        // const link = document.createElement("a");
        // link.href = fileObjectUrl;
        // link.style.display = "none"; // 다운로드 파일 이름을 지정 할 수 있습니다. // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.

        // link.download = original_name[0]; //extractDownloadFilename(response); // 다운로드 파일 이름을 추출하는 함수

        // alert(2);
        // const extractDownloadFilename = (response: any) => {
        //   const disposition = response.headers["content-disposition"];
        //   const fileName = decodeURI(
        //     disposition
        //       .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1]
        //       .replace(/['"]/g, "")
        //   );
        //   return fileName;
        // }; // 다운로드 파일의 이름은 직접 지정 할 수 있습니다. // link.download = "sample-file.xlsx"; // 링크를 body에 추가하고 강제로 click 이벤트를 발생시켜 파일 다운로드를 실행시킵니다.

        // alert(3);
        // document.body.appendChild(link);
        // alert(4);
        // link.click();
        // alert(5);
        // link.remove(); // 다운로드가 끝난 리소스(객체 URL)를 해제합니다.

        // alert(6);
        // window.URL.revokeObjectURL(fileObjectUrl);

        // alert(7);
        // const dataURI = "data:text/plain;base64," + encodeBase64(data);
        // saveAs(dataURI, original_name[0]);

        // const url = window.URL.createObjectURL(new Blob([data]));
        // const link = document.createElement("a");
        // link.href = url;
        // link.setAttribute("download", original_name[0]);
        // link.setAttribute("id", "tempLink");
        // document.body.appendChild(link);
        // link.click();
      }
    });
  };

  const deleteFiles = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }
    let data: any;
    const parameters = Object.keys(selectedState);

    parameters.forEach(async (parameter) => {
      try {
        data = await processApi<any>("file-delete", { attached: parameter });
      } catch (error) {
        data = null;
      }

      if (data.result === true) {
        fetchGrid();
      } else {
        alert("처리 중 오류가 발생하였습니다.");
      }
    });
  };

  const DATA_ITEM_KEY = "saved_name";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = React.useCallback(
    (event: GridSelectionChangeEvent) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
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
      // event.dataItems.forEach((item: any, index: number) => {
      //   fieldArrayRenderProps.onReplace({
      //     index: index,
      //     value: {
      //       ...item,
      //     },
      //   });
      // });
    },
    []
  );

  return (
    <Window
      title={"파일첨부관리"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <TitleContainer>
        <ButtonContainer>
          <Button
            onClick={upload}
            themeColor={"primary"}
            fillMode={"outline"}
            icon={"upload"}
          >
            업로드
            <input
              id="upload"
              style={{ display: "none" }}
              type="file"
              multiple
              ref={excelInput}
              onChange={(event: any) => {
                const files = event.target.files[0];
                if (!files) return false;
                uploadFile(files);
              }}
            />
          </Button>
          <Button
            onClick={downloadFiles}
            themeColor={"primary"}
            fillMode={"outline"}
            icon={"download"}
          >
            다운로드
          </Button>
          <Button
            onClick={deleteFiles}
            themeColor={"primary"}
            fillMode={"outline"}
            icon={"delete"}
          >
            삭제
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <Grid
        style={{ height: "600px" }}
        data={process(
          mainDataResult.data.map((row) => ({
            ...row,
            [SELECTED_FIELD]: selectedState[idGetter(row)],
          })),
          {}
        )}
        sortable={true}
        groupable={false}
        reorderable={true}
        //onDataStateChange={dataStateChange}
        fixedScroll={true}
        total={mainDataResult.total}
        //onScroll={scrollHandler}

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
        <GridColumn
          field={SELECTED_FIELD}
          width="45px"
          headerSelectionValue={
            mainDataResult.data.findIndex(
              (item: any) => !selectedState[idGetter(item)]
            ) === -1
          }
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
          width="200"
          cell={CenterCell}
        />
      </Grid>
      <p>※ 최대 파일 크기 (400MB)</p>
    </Window>
  );
};

export default KendoWindow;
