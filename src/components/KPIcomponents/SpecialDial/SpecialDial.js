import PaletteIcon from "@mui/icons-material/Palette";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import * as React from "react";
import { useState } from "react";
import ColorWindow from "../../Windows/CommonWindows/ColorWindow";

const actions = [{ icon: <PaletteIcon />, name: "Color" }];

export default function BasicSpeedDial() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [colorWindowVisible, setColorWindowVisible] = useState(false);

  const colorOpen = () => {
    setColorWindowVisible(true);
    handleClose();
  };

  return (
    <>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: "fixed", bottom: 50, right: 20, display: "flex" }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={colorOpen}
          />
        ))}
      </SpeedDial>
      {colorWindowVisible && <ColorWindow setVisible={setColorWindowVisible} />}
    </>
  );
}
