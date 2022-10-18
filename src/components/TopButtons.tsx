import { Button } from "@progress/kendo-react-buttons";
import { TPermissions } from "../store/types";

interface ITopButtons {
  search: () => void;
  exportExcel: () => void;
  permissions: TPermissions;
}

const TopButtons = ({ search, exportExcel, permissions }: ITopButtons) => {
  return (
    <>
      <Button
        onClick={search}
        icon="search"
        //fillMode="outline"
        themeColor={"primary"}
        disabled={permissions.view ? false : true}
      >
        조회
      </Button>
      <Button
        title="Export Excel"
        onClick={exportExcel}
        icon="download"
        fillMode="outline"
        themeColor={"primary"}
        disabled={permissions.print ? false : true}
      >
        Excel
      </Button>
    </>
  );
};

export default TopButtons;
