import { Signature } from "@progress/kendo-react-inputs";

const Sign = (props: any) => {
  const { value, onChange, disabled = false } = props;
  return (
    <Signature
      value={value}
      onChange={onChange}
      strokeWidth={3}
      smooth={true}
      maximizable={false}
      hideLine={true}
      style={{ height: "100%", width: "100%", border: "2px solid #2289c3" }}
      disabled={disabled}
      exportScale={0.662}
    />
  );
};

export default Sign;
