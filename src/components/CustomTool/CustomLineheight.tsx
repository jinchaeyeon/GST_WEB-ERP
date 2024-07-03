import { EditorTools } from "@progress/kendo-react-editor";

const LineheightToolSettings = {
  style: "line-height",
  defaultItem: { text: "Line-height", value: "" },
  items: [
    { text: "1(14pt)", value: "14pt" },
    { text: "2(18pt)", value: "18pt" },
    { text: "3(20pt)", value: "20pt" },
    { text: "4(24pt)", value: "24pt" },
    { text: "5(36pt)", value: "36pt" },
  ],
};

// Creates Lineheight tool
const MyLineheightTool = EditorTools.createStyleDropDownList(
  LineheightToolSettings
);

// Styles the FontSize tool
const CustomLineheight = (props: any) => (
  <MyLineheightTool
    {...props}
    style={{
      ...props.style,
    }}
  />
);

export { CustomLineheight };

