import MapView, { PROVIDER_GOOGLE, MapViewProps, LatLng, Marker, Polyline } from "react-native-maps";
import { IconBox } from "../IconBox";
import { Car, FlagCheckered } from "phosphor-react-native";
import { useRef } from "react";
import { useTheme } from "styled-components";

type Props = MapViewProps & {
  coordinates: LatLng[];
}

export function Map({ coordinates, ...rest }: Props) {
  const theme = useTheme();

  const mapRef = useRef<MapView>(null);

  const lastCoordinate = coordinates[coordinates.length - 1];

  async function onMapLoaded() {
    if (coordinates.length > 1) {
      // faz com que os marcadores caibam na nossa tela
      mapRef.current?.fitToSuppliedMarkers(["departure", "arrival"], {
        // espaçamento para q os marcadores n fiquem grudados nas bordas dos mapas
        edgePadding: { top: 50, bottom: 50, left: 50, right: 50 }
      })
    }
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ width: '100%', height: 200 }}
      region={{
        latitude: lastCoordinate.latitude,
        longitude: lastCoordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }}
      onMapLoaded={onMapLoaded}
      {...rest}
    >
      <Marker identifier="departure" coordinate={coordinates[0]}>
        <IconBox size="SMALL" icon={Car} />
      </Marker>

      {
        coordinates.length > 1 &&
        <>
          <Marker identifier="arrival" coordinate={lastCoordinate}>
            <IconBox size="SMALL" icon={FlagCheckered} />
          </Marker>
          <Polyline
            coordinates={[...coordinates]}
            strokeColor={theme?.COLORS.GRAY_700}
            strokeWidth={6}
          />
        </>
      }
    </MapView>
  )
}