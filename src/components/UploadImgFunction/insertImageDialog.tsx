import { Button } from "@progress/kendo-react-buttons";
import { EditorUtils } from "@progress/kendo-react-editor";
import {
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-layout";
import { Upload, UploadFileInfo } from "@progress/kendo-react-upload";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Window from "../Windows/WindowComponent/Window";
import { insertImageFiles } from "./utils";

export const InsertImageDialog = (props: any) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [selected, setSelected] = React.useState(0);
  const [files, setFiles] = React.useState([]);

  let src: any;
  let altText: any;
  let title: any;
  let width: any;
  let height: any;

  const onTabSelect = (event: TabStripSelectEventArguments) => {
    setFiles([]);
    setSelected(event.selected);
  };

  const onClose = () => {
    props.onClose.call(undefined);
  };

  const onAddFiles = (event: any) => {
    setFiles(
      event.newState
        .map((f: UploadFileInfo) => f.getRawFile && f.getRawFile())
        .filter((f: UploadFileInfo) => f)
    );
  };

  const onInsert = () => {
    const { view, imageNode } = props;
    const nodes = view.state.schema.nodes;
    const nodeType = nodes[imageNode];
    const position = null;
    const data: any = {
      src: src ? src.value : null,
      title: title ? title.value : null,
      alt: altText ? altText.value : null,
      width: width ? width.value : null,
      height: height ? height.value : null,
    };

    const attrs = Object.keys(data)
      .filter((key) => data[key] !== null && data[key] !== "")
      .reduce((acc, curr) => Object.assign(acc, { [curr]: data[curr] }), {});

    if (files.length) {
      insertImageFiles({ view, files, nodeType, position, attrs });
    } else {
      const newImage = nodeType.createAndFill(attrs);
      EditorUtils.insertNode(view, newImage, true);
    }

    view.focus();
    onClose();
  };

  const { view, imageNode } = props;
  const state = view && view.state;

  let attrs: any = {};

  if (
    state &&
    state.selection.node &&
    state.selection.node.type == state.schema.nodes[imageNode]
  ) {
    attrs = state.selection.node.attrs;
  }

  const fields = (
    <React.Fragment>
      <div className="k-edit-label">
        <label htmlFor="k-editor-image-alt">Alternate text</label>
      </div>
      <div className="k-edit-field">
        <input
          type="text"
          className="k-textbox"
          id="k-editor-image-alt"
          defaultValue={attrs.alt}
          ref={(e) => (altText = e)}
        />
      </div>
      <div className="k-edit-label">
        <label htmlFor="k-editor-image-title">Title</label>
      </div>
      <div className="k-edit-field">
        <input
          type="text"
          className="k-textbox"
          id="k-editor-image-title"
          defaultValue={attrs.title}
          ref={(e) => (title = e)}
        />
      </div>
      <div className="k-edit-label">
        <label htmlFor="k-editor-image-width">Width (px)</label>
      </div>
      <div className="k-edit-field">
        <input
          type="text"
          className="k-textbox"
          id="k-editor-image-width"
          defaultValue={attrs.width}
          ref={(e) => (width = e)}
        />
      </div>
      <div className="k-edit-label">
        <label htmlFor="k-editor-image-height">Height (px)</label>
      </div>
      <div className="k-edit-field">
        <input
          type="text"
          className="k-textbox"
          id="k-editor-image-height"
          defaultValue={attrs.height}
          ref={(e) => (height = e)}
        />
      </div>
    </React.Fragment>
  );

  const buttons = (
    <div className={"text-right"} style={{ clear: "both" }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onInsert} themeColor={"primary"}>
        Insert
      </Button>
    </div>
  );

  return ReactDOM.createPortal(
    <Window
      titles="Insert Image"
      Close={onClose}
      positions={{
        width: 500,
        height: 480,
        left: isMobile == true ? 0 : (deviceWidth - 500) / 2,
        top: isMobile == true ? 0 : (deviceHeight - 480) / 2,
      }}
      modals={false}
    >
      <TabStrip
        selected={selected}
        onSelect={onTabSelect}
        animation={false}
        scrollable={isMobile}
      >
        {Object.entries(attrs).length == 0 && (
          <TabStripTab title="Upload">
            <div className="k-edit-form-container pt-3 pb-3">
              <div className="k-edit-label">
                <label htmlFor="k-editor-image-width">Image</label>
              </div>
              <div className="k-edit-field">
                <Upload
                  batch={false}
                  multiple={true}
                  defaultFiles={[]}
                  withCredentials={false}
                  saveUrl={
                    "https://demos.telerik.com/kendo-ui/service-v4/upload/save"
                  }
                  removeUrl={
                    "https://demos.telerik.com/kendo-ui/service-v4/upload/remove"
                  }
                  onAdd={onAddFiles}
                />
              </div>
              {fields}
              {buttons}
            </div>
          </TabStripTab>
        )}
        <TabStripTab title="By URL">
          <div className="k-edit-form-container pt-3 pb-3">
            <div className="k-edit-label">
              <label htmlFor="k-editor-image-url">Web address</label>
            </div>
            <div className="k-edit-field">
              <input
                type="text"
                className="k-textbox"
                id="k-editor-image-url"
                defaultValue={attrs.src}
                disabled={/^data:image/.test(attrs.src || "")}
                ref={(e) => (src = e)}
                autoFocus={true}
              />
            </div>
            {fields}
            {buttons}
          </div>
        </TabStripTab>
      </TabStrip>
      <style>{`.k-dropzone { width: 100%; }`}</style>
    </Window>,
    document.body
  );
};
