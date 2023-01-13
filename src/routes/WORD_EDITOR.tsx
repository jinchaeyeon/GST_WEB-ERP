import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Chat } from "@progress/kendo-react-conversational-ui";
import { bytesToBase64 } from "byte-base64";
import { useApi } from "../hooks/api";
import {
  Editor,
  EditorPasteEvent,
  EditorTools,
  EditorUtils,
  PasteCleanupSettings,
} from "@progress/kendo-react-editor";

const { Bold, Italic, Underline, Undo, Redo } = EditorTools;
const {
  pasteCleanup,
  sanitize,
  sanitizeClassAttr,
  sanitizeStyleAttr,
  removeAttribute,
  replaceImageSourcesFromRtf,
} = EditorUtils;

const pasteSettings: PasteCleanupSettings = {
  convertMsLists: true,
  // stripTags: 'span|font'
  attributes: {
    class: sanitizeClassAttr,
    style: sanitizeStyleAttr,

    // keep `width`, `height` and `src` attributes
    width: () => {},
    height: () => {},
    src: () => {},

    // Removes `lang` attribute
    // lang: removeAttribute,

    // removes other (unspecified above) attributes
    "*": removeAttribute,
  },
};

const CHAT_BOT: React.FC = () => {
  const processApi = useApi();

  const [content, setContent] = useState<any>(null);

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let response: any;

    try {
      response = await processApi<any>("file-download", {
        attached: "54286E6E-752C-4C71-994F-5C4FB70B502D",
      });
    } catch (error) {
      response = null;
    }

    if (response !== null) {
      if (editor.current) {
        const view = editor.current.view;
        if (view) {
          console.log(response);
          EditorUtils.setHtml(view, response);
        }
      }
      // setContent(response.data);
      // const blob = new Blob([response.data]);
      // // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
      // // const blob = new Blob([this.content], {type: 'text/plain'})
      // // blob을 사용해 객체 URL을 생성합니다.
      // const fileObjectUrl = window.URL.createObjectURL(blob);
      // // blob 객체 URL을 설정할 링크를 만듭니다.
      // const link = document.createElement("a");
      // link.href = fileObjectUrl;
      // link.style.display = "none";
      // // 다운로드 파일 이름을 추출하는 함수
      // const extractDownloadFilename = (response: any) => {
      //   console.log(response);
      //   if (response.headers) {
      //     const disposition = response.headers["content-disposition"];
      //     let filename = "";
      //     if (disposition) {
      //       var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      //       var matches = filenameRegex.exec(disposition);
      //       if (matches != null && matches[1]) {
      //         filename = matches[1].replace(/['"]/g, "");
      //       }
      //     }
      //     return filename;
      //   } else {
      //     return "";
      //   }
      // };
      // // 다운로드 파일 이름을 지정 할 수 있습니다.
      // // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
      // link.download = extractDownloadFilename(response);
      // 다운로드 파일의 이름은 직접 지정 할 수 있습니다.
      // link.download = "sample-file.xlsx";
      // 링크를 body에 추가하고 강제로 click 이벤트를 발생시켜 파일 다운로드를 실행시킵니다.
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    }
  };

  useEffect(() => {
    fetchMainGrid();
  }, []);

  const editor = React.createRef<Editor>();
  const getHtml = () => {
    if (editor.current) {
      const view = editor.current.view;
      if (view) {
        const value = EditorUtils.getHtml(view.state);
        console.log(value);
      }
    }
  };

  return (
    <>
      {" "}
      <button
        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button k-button-md k-rounded-md k-button-solid k-button-solid-base-icontext"
        onClick={getHtml}
      >
        <span className="k-icon k-i-arrow-60-down" />
        Gets HTML
      </button>
      <Editor
        onPasteHtml={(event: EditorPasteEvent) => {
          console.log("event");
          console.log(event);
          let html = pasteCleanup(sanitize(event.pastedHtml), pasteSettings);

          // If the pasted HTML contains images with sources pointing to the local file system,
          // `replaceImageSourcesFromRtf` will extract the sources from the RTF and place them to images 'src' attribute in base64 format.
          if (event.nativeEvent.clipboardData) {
            html = replaceImageSourcesFromRtf(
              html,
              event.nativeEvent.clipboardData
            );
          }
          console.log(html);

          return html;
        }}
        contentStyle={{ height: 320 }}
        tools={[
          [Bold, Italic, Underline],
          [Undo, Redo],
        ]}
        ref={editor}
      />
    </>
  );
};

export default CHAT_BOT;
