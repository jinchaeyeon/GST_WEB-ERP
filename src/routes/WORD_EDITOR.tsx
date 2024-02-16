import {
  Editor,
  EditorChangeEvent,
  EditorMountEvent,
  EditorTools,
  EditorUtils,
  ProseMirror,
} from "@progress/kendo-react-editor";
import * as React from "react";
import { Title, TitleContainer } from "../CommonStyled";
import { insertImagePlugin } from "../components/UploadImgFunction/insertImagePlugin";
import { InsertImage } from "../components/UploadImgFunction/insertImageTool";
import { insertImageFiles } from "../components/UploadImgFunction/utils";
import { TInsertImageFiles } from "../store/types";

const {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  OrderedList,
  UnorderedList,
  Undo,
  Redo,
  FontSize,
  FontName,
  FormatBlock,
  Link,
  Unlink,
  ViewHtml,
  InsertTable,
  AddRowBefore,
  AddRowAfter,
  AddColumnBefore,
  AddColumnAfter,
  DeleteRow,
  DeleteColumn,
  DeleteTable,
  MergeCells,
  SplitCell,
  ForeColor,
  BackColor,
} = EditorTools;
const { imageResizing } = EditorUtils;

const App = () => {
  const editor = React.createRef<Editor>();
  const textarea = React.createRef<HTMLTextAreaElement>();

  const getHtml = () => {
    if (editor.current && textarea.current) {
      const view = editor.current.view;
      if (view) {
        let html = EditorUtils.getHtml(view.state);

        html = addClassToColorStyledElementsInHtmlString(
          EditorUtils.getHtml(view.state)
        );
        textarea.current.value = html;
      }
    }
  };
  function addClassToColorStyledElementsInHtmlString(
    htmlString: string
  ): string {
    // HTML 문자열을 가상의 DOM 요소로 변환합니다.
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlString, "text/html");

    // 모든 요소를 선택합니다.
    const allElements = htmlDoc.getElementsByTagName("*");
    const styledElements: {
      element: Element;
      color?: string;
      backgroundColor?: string;
    }[] = [];

    // 선택한 요소들을 순회하며 style 속성에 color와 background-color가 있는지 확인하고, 있다면 스타일 정보를 저장합니다.
    for (const element of allElements) {
      const elementStyle = element.getAttribute("style");
      if (elementStyle) {
        const colorMatch = elementStyle.match(
          /(?<!background-)color:\s*([^;]+)/
        );
        const backgroundColorMatch = elementStyle.match(
          /background-color:\s*([^;]+)/
        );

        if (colorMatch || backgroundColorMatch) {
          const color = colorMatch ? colorMatch[1] : undefined;
          const backgroundColor = backgroundColorMatch
            ? backgroundColorMatch[1]
            : undefined;
          styledElements.push({ element, color, backgroundColor });
        }
      }
    }

    // 스타일 정보를 기반으로 CSS 문자열을 생성하고, 각 요소에 클래스를 추가합니다.
    const cssString = styledElements
      .map((styledElement, index) => {
        let css = "";
        if (styledElement.color) {
          const className = `color-${index}`;
          styledElement.element.classList.add(className);
          css += `.${className} { color: ${styledElement.color}; }`;
        }
        if (styledElement.backgroundColor) {
          const className = `bgColor-${index}`;
          styledElement.element.classList.add(className);
          css += `.${className} { background-color: ${styledElement.backgroundColor}; }`;
        }
        return css;
      })
      .join("\n");

    // 생성된 CSS 문자열을 HTML 문서의 <head> 안에 <style> 태그로 삽입합니다.
    const styleTag = htmlDoc.createElement("style");
    styleTag.textContent = cssString + styles;
    htmlDoc.head.appendChild(styleTag);

    // 수정된 HTML 문자열을 반환합니다.
    return htmlDoc.documentElement.outerHTML;
  }

  const styles = `.cs95E872D0{text-align:left;text-indent:0pt;margin:0pt 0pt 0pt 0pt}
  .cs1B16EEB5{color:#000000;background-color:transparent;font-family:Calibri;font-size:11pt;font-weight:normal;font-style:normal;}
  .csFF0E57EF{color:#B2A2C7;background-color:transparent;font-family:Calibri;font-size:11pt;font-weight:bold;font-style:normal;}
  .cs8D84D134{color:#B2A2C7;background-color:transparent;font-family:'맑은 고딕 Semilight';font-size:11pt;font-weight:bold;font-style:normal;}
  .cs32E60577{color:#000000;background-color:transparent;font-family:Calibri;font-size:11pt;font-weight:normal;font-style:normal;text-decoration: underline;}
  .csE16255F{color:#000000;background-color:transparent;font-family:'맑은 고딕 Semilight';font-size:11pt;font-weight:normal;font-style:normal;text-decoration: underline;}
  .cs101C9F21{color:#000000;background-color:#000080;font-family:Calibri;font-size:11pt;font-weight:normal;font-style:italic;}
  .csDCC7B838{color:#000000;background-color:#000080;font-family:'맑은 고딕 Semilight';font-size:11pt;font-weight:normal;font-style:italic;}
  .cs2D2816FE{}
  .cs5EFADB1C{width:105pt;padding:0pt 5.4pt 0pt 5.4pt;border-top:1pt #000000 solid;border-right:1pt #000000 solid;border-bottom:1pt #000000 solid;border-left:1pt #000000 solid}
  .csBFD3C215{color:#000000;background-color:transparent;font-family:'맑은 고딕 Semilight';font-size:11pt;font-weight:normal;font-style:normal;}
  .cs7CF4DA86{color:#000000;background-color:transparent;font-family:굴림체;font-size:16pt;font-weight:normal;font-style:normal;}
  .csEA7D3F47{color:#000000;background-color:transparent;font-family:'D2Coding';font-size:36pt;font-weight:normal;font-style:normal;}`;

  const onChangeHandle = (e: EditorChangeEvent) => {
    // console.log(e);
    // console.log(e.value.content);
    // console.log(e.html);
  };

  const convertValue = () => {};

  const setHtml = (event: any) => {
    if (editor.current) {
      const view = editor.current.view;
      if (view && textarea.current) {
        EditorUtils.setHtml(view, textarea.current.value);
      }
    }

    const iframeDocument = document.querySelector("iframe")!.contentDocument;
    const style = iframeDocument!.createElement("style");
    style.appendChild(iframeDocument!.createTextNode(styles));
    iframeDocument!.head.appendChild(style);
  };

  const onImageInsert = (args: TInsertImageFiles) => {
    const { files, view, event } = args;
    const nodeType = view.state.schema.nodes.image;

    const position =
      event.type === "drop"
        ? view.posAtCoords({ left: event.clientX, top: event.clientY })
        : null;

    insertImageFiles({ view, files, nodeType, position });

    return files.length > 0;
  };

  const onMount = (event: EditorMountEvent) => {
    const state = event.viewProps.state;
    const plugins = [
      ...state.plugins,
      insertImagePlugin(onImageInsert),
      imageResizing(),
    ];

    return new ProseMirror.EditorView(
      { mount: event.dom },
      {
        ...event.viewProps,
        state: ProseMirror.EditorState.create({ doc: state.doc, plugins }),
      }
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>EDITOR</Title>
      </TitleContainer>
      <div id="editor">
        <Editor
          tools={[
            [Bold, Italic, Underline, Strikethrough],
            [Subscript, Superscript],
            ForeColor,
            BackColor,
            [AlignLeft, AlignCenter, AlignRight, AlignJustify],
            [Indent, Outdent],
            [OrderedList, UnorderedList],
            FontSize,
            FontName,
            FormatBlock,
            [Undo, Redo],
            [Link, Unlink, InsertImage, ViewHtml],
            [InsertTable],
            [AddRowBefore, AddRowAfter, AddColumnBefore, AddColumnAfter],
            [DeleteRow, DeleteColumn, DeleteTable],
            [MergeCells, SplitCell],
          ]}
          contentStyle={{ height: 460 }}
          defaultContent={"<p>editor sample html</p>"}
          ref={editor}
          onChange={onChangeHandle}
          onMount={onMount}
        />
        <br />
        <button
          className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button k-button-md k-rounded-md k-button-solid k-button-solid-base-icontext"
          onClick={getHtml}
        >
          <span className="k-icon k-i-arrow-60-down" />
          Gets HTML
        </button>
        &nbsp;
        <button
          className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base k-button k-button-md k-rounded-md k-button-solid k-button-solid-base-icontext"
          onClick={setHtml}
        >
          <span className="k-icon k-i-arrow-60-up" />
          Sets HTML
        </button>
        <br />
        <br />
        <textarea
          className="k-textarea"
          style={{ height: 100, width: "100%", resize: "none" }}
          defaultValue={`<p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="csFF0E57EF">OpenXml </span><span class="cs8D84D134">포맷</span><span class="csFF0E57EF"> </span><span class="cs8D84D134">테스트</span><span class="csFF0E57EF"> </span><span class="cs8D84D134">내용</span><span class="csFF0E57EF">1</span></p><p class="cs95E872D0"><span class="cs32E60577">OpenXml </span><span class="csE16255F">포맷</span><span class="cs32E60577"> </span><span class="csE16255F">테스트</span><span class="cs32E60577"> </span><span class="csE16255F">내용</span><span class="cs32E60577">2</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="cs101C9F21">OpenXml </span><span class="csDCC7B838">포맷</span><span class="cs101C9F21"> </span><span class="csDCC7B838">테스트</span><span class="cs101C9F21"> </span><span class="csDCC7B838">내용</span><span class="cs101C9F21">3</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><table class="cs2D2816FE" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">1</span></p></td><td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">2</span></p></td><td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">3</span></p></td><td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">4</span></p></td></tr>
        <tr>
          <td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="csBFD3C215">a</span></p></td><td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">b</span></p></td><td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">c</span></p></td><td class="cs5EFADB1C" valign="top"><p class="cs95E872D0"><span class="cs1B16EEB5">d</span></p></td></tr>
      </table>
      <p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="csBFD3C215">내용1</span></p><p class="cs95E872D0"><span class="cs7CF4DA86">내용2</span></p><p class="cs95E872D0"><span class="csEA7D3F47">내용3</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span><img src="data:image/png;base64,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" width="142" height="102" alt="" style="border-width:0px;" /></span><span class="cs1B16EEB5">&nbsp;<img src="data:image/png;base64,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" width="142" height="102" alt="" style="border-width:0px;" /> <img src="data:image/png;base64,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" width="142" height="102" alt="" style="border-width:0px;" /></span></p><p class="cs95E872D0"><span class="cs1B16EEB5">&nbsp;</span></p><p class="cs95E872D0"><span><img src="data:image/jpeg;base64,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" width="360" height="360" alt="" style="border-width:0px;" /></span></p>`}
          ref={textarea}
        />
      </div>
    </>
  );
};
export default App;
