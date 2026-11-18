export type MapPoint = { lat: number; lng: number };
export type MapPlace = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};
export type MapViewProps = {
  center: MapPoint;
  /** Name of the chosen centre, such as a matched address. */
  centerLabel?: string;
  places?: MapPlace[];
  selectedId?: string;
  routePolyline?: string;
  onSelect?: (id: string) => void;
  onChooseLocation?: (point: MapPoint) => void;
};
