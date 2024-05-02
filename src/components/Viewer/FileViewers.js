import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function FileViewers(props) {
  // const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Viewer fileUrl={props.file} plugins={[defaultLayoutPluginInstance]} />
  );
}
