import { Box, DialogContent, DialogTitle, Grid } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Paper, { PaperProps } from "@mui/material/Paper";
import { useState } from "react";
import Draggable from "react-draggable";
import { useRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../../CommonStyled";
import { IWindowPosition } from "../../../hooks/interfaces";
import { colors, colorsName } from "../../../store/atoms";

type IKendoWindow = {
  setVisible(arg: boolean): void;
};

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const KendoWindow = ({ setVisible }: IKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : 350,
    top: isMobile == true ? 0 : 50,
    width: isMobile == true ? deviceWidth : 1200,
    height: 800,
  });

  const onClose = () => {
    setVisible(false);
  };

  const onSave = () => {
    const colors = colorNames.slice(2);

    setColorName(colors);
    if (colors == "Red") {
      setColor(["#f44336", "#d50000", "#ff5252", "#ffcdd2"]);
    } else if (colors == "Orange") {
      setColor(["#ff9800", "#ff6d00", "#ffab40", "#ffd180"]);
    } else if (colors == "Yellow") {
      setColor(["#ffeb3b", "#fbc02d", "#ffff00", "#ffff8d"]);
    } else if (colors == "Lime") {
      setColor(["#c6ff00", "#aeea00", "#eeff41", "#f4ff81"]);
    } else if (colors == "LightGreen") {
      setColor(["#8bc34a", "#689f38", "#aed581", "#dcedc8"]);
    } else if (colors == "Green") {
      setColor(["#4caf50", "#388e3c", "#81c784", "#c8e6c9"]);
    } else if (colors == "Cyan") {
      setColor(["#00e5ff", "#00b8d4", "#80deea", "#b2ebf2"]);
    } else if (colors == "Blue") {
      setColor(["#2196f3", "#1976d2", "#64b5f6", "#bbdefb"]);
    } else if (colors == "Navy") {
      setColor(["#3f51b5", "#303f9f", "#7986cb", "#c5cae9"]);
    } else if (colors == "Purple") {
      setColor(["#9c27b0", "#7b1fa2", "#ba68c8", "#e1bee7"]);
    } else if (colors == "Pink") {
      setColor(["#f06292", "#e91e63", "#f48fb1", "#f8bbd0"]);
    } else if (colors == "Grey") {
      setColor(["#757575", "#424242", "#bdbdbd", "#e0e0e0"]);
    } else {
      setColor(["#2196f3", "#1976d2", "#64b5f6", "#bbdefb"]);
    }

    setVisible(false);
  };

  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);
  const [colorNames, setColorNames] = useState("");

  return (
    <Dialog
      onClose={onClose}
      open={true}
      PaperComponent={PaperComponent}
      maxWidth="lg"
      style={{
        zIndex: 1000000000,
        width: position.width,
        height: position.height,
        top: position.top,
        left: position.left,
      }}
    >
      <DialogTitle>컬러 설정 색상 {colorNames}</DialogTitle>
      <DialogContent>
        <Box>
          <Grid container spacing={2}>
            {/* A700 500(현재) A200 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Red")}
                style={{ backgroundColor: "#f44336", width: "100%" }}
              >
                Red
              </Button>
            </Grid>
            {/* A700 500(현재) A200 A100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Orange")}
                style={{ backgroundColor: "#ff9800", width: "100%" }}
              >
                Orange
              </Button>
            </Grid>
            {/* 700 500(현재) A200 A100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Yellow")}
                style={{ backgroundColor: "#ffeb3b", width: "100%" }}
              >
                Yellow
              </Button>
            </Grid>
            {/* A700 A400(현재) A200 A100*/}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Lime")}
                style={{ backgroundColor: "#c6ff00", width: "100%" }}
              >
                Lime
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- LightGreen")}
                style={{ backgroundColor: "#8bc34a", width: "100%" }}
              >
                LightGreen
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Green")}
                style={{ backgroundColor: "#4caf50", width: "100%" }}
              >
                Green
              </Button>
            </Grid>
            {/* A700 A400(현재) 200 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Cyan")}
                style={{ backgroundColor: "#00e5ff", width: "100%" }}
              >
                Cyan
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Blue")}
                style={{ backgroundColor: "#2196f3", width: "100%" }}
              >
                Blue
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Navy")}
                style={{ backgroundColor: "#3f51b5", width: "100%" }}
              >
                Navy
              </Button>
            </Grid>
            {/* 700 500(현재) 300 100 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Purple")}
                style={{ backgroundColor: "#9c27b0", width: "100%" }}
              >
                Purple
              </Button>
            </Grid>
            {/* 500 300(현재) 200 100*/}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Pink")}
                style={{ backgroundColor: "#f06292", width: "100%" }}
              >
                Pink
              </Button>
            </Grid>
            {/* 800 600(현재) 400 300 */}
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <Button
                variant="contained"
                onClick={() => setColorNames("- Grey")}
                style={{ backgroundColor: "#757575", width: "100%" }}
              >
                Grey
              </Button>
            </Grid>
          </Grid>
        </Box>
        <BottomContainer>
          <ButtonContainer>
            <Button onClick={onClose}>취소</Button>
            <Button onClick={onSave}>확인</Button>
          </ButtonContainer>
        </BottomContainer>
      </DialogContent>
    </Dialog>
  );
};

export default KendoWindow;
