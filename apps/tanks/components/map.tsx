'use client';

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  SVGOverlay,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';

const Map = () => {
  // const [center, setCenter] = useState<LatLngExpression | null>(null);
  // const [marker, setMarker] = useState<LatLngExpression | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  // const customIcon = L.icon({
  //   iconUrl: '/images/marker.png',
  //   iconSize: [30, 50],
  //   iconAnchor: [15, 50],
  //   iconRetinaUrl: '/images/marker.png',
  // });

  useEffect(() => {
    setLocation({
      lat: 51.49,
      lng: -0.08,
    });
    // setLocation({
    //   lat: 85,
    //   lng: 0,
    // });
  }, []);

  // const size = 0.001;
  const size = 0.005;

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        // setMarker(e.latlng);
        const location = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        console.log('>>> location', location);
        // setLocation(location);
        // mapRef?.flyTo(location);
      },
      zoomlevelschange(e) {
        console.log('>>> zoomlevelschange', e);
      },
      zoom(e) {
        console.log('>>> zoom', e);
      },
      zoomend(e) {
        console.log('>>> zoomend', e);
      },
      moveend(e) {
        console.log('>>> moveend', mapRef?.getBounds());
        if (mapRef) {
          const { lat, lng } = mapRef.getBounds().getNorthWest();
          setLocation({
            lat: lat - size / 1.5,
            lng,
          });
        }
      },
    });
    if (map) {
      setMapRef(map);
    }
    return <></>;
  };

  const numItems = (): Array<number> => {
    const arr = [];
    for (let i = 0; i < 9000; i++) {
      arr.push(i);
    }
    return arr;
  };

  if (!location) {
    return <></>;
  }

  return (
    <Box width="100%" height="100vh">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={true}
        touchZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {numItems().map((i) => {
          return (
            <Rectangle
              key={i}
              bounds={[
                [location.lat, location.lng + i * size],
                [location.lat + size / 1.6, location.lng + i * size + size],
              ]}
              pathOptions={{
                color: 'black',
                fill: true,
                // opacity: 1,
                fillColor: 'red',
                fillOpacity: 1,
              }}
            />
          );
        })}
        <LocationMarker />
      </MapContainer>
    </Box>
  );
};

export default Map;
