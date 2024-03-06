/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { MarkerClusterer } from "@googlemaps/markerclusterer";

async function initMap(props: any) {
  // Request needed libraries.
  const { Map, InfoWindow } = (await google.maps.importLibrary(
    "maps"
  )) as google.maps.MapsLibrary;
  const { AdvancedMarkerElement, PinElement } =
    (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

  // 초기 기본 셋팅
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: { lat: 0, lng: 0 },
      zoom: 1,
      mapId: "DEMO_MAP_ID",
      maxZoom: 16,
      scrollwheel: true,
      streetViewControl: false,
    }
  );

  const infoWindow = new google.maps.InfoWindow({
    content: "",
    disableAutoPan: true,
  });

  // Create an array of alphabetical characters used to label the markers.
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Add some markers to the map.
  const markers = props.data.map((position: any, i: any) => {
    const label = labels[i % labels.length];
    const pinGlyph = new google.maps.marker.PinElement({
      glyph: label,
      glyphColor: "white",
    });
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: pinGlyph.element,
    });

    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
    // 마커 setContent 내용 논의 필요
    // marker.addListener("click", () => {
    //   infoWindow.setContent(position.lat + ", " + position.lng);
    //   infoWindow.open(map, marker);
    // });
    return marker;
  });

  // Add a marker clusterer to manage the markers.
  new MarkerClusterer({ markers, map });
}

const ClusterMap = (props: any) => {
  initMap(props);
  return <div id="map" style={{ width: "100%", height: "53vh" }}></div>;
};

export default ClusterMap;
