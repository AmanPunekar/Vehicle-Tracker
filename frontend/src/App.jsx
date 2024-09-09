import React, { useEffect, useState } from "react";
import {MapContainer,TileLayer,Marker,Polyline,Popup,useMap} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import vehicleIconUrl from "./assets/car.png";

// Define a custom icon for the vehicle
const vehicleIcon = new L.Icon({
  iconUrl: vehicleIconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to add arrowheads using leaflet-polylinedecorator
const AddArrowheads = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      const decorator = L.polylineDecorator(L.polyline(positions), {
        patterns: [
          {
            offset: "26%",
            repeat: 0,
            symbol: L.Symbol.arrowHead({
              pixelSize: 15,
              polygon: false,
              pathOptions: { stroke: true, color: "red" },
            }),
          },
        ],
      });
      decorator.addTo(map);
    }
  }, [positions, map]);

  return null;
};

const App = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Fetch the vehicle location data from the backend
    fetch("https://vehicle-tracker-backend.onrender.com/api/vehicle-location")
      .then((response) => response.json())
      .then((data) => {
        setVehicleData(data);
        setCurrentLocation(data[0]);
      });
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < vehicleData.length) {
        setCurrentLocation(vehicleData[index]);
        index++;
      }
    }, 1000); // Updates every 1 second

    return () => clearInterval(interval);
  }, [vehicleData]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px",
      }}
    >
      <h1>Vehicle Tracker</h1>
      <MapContainer
        center={[17.385044, 78.486671]}
        zoom={22}
        style={{ height: "450px", width: "80%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {vehicleData.length > 0 && (
          <>
            <Polyline
              positions={vehicleData.map((loc) => [
                loc.latitude,
                loc.longitude,
              ])}
              color="blue"
            />
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={vehicleIcon}
            >
              <Popup>
                <div>
                  <p>
                    <strong>Latitude:</strong> {currentLocation.latitude}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {currentLocation.longitude}
                  </p>
                  <p>
                    <strong>Timestamp:</strong> {currentLocation.timestamp}
                  </p>
                </div>
              </Popup>
            </Marker>
            <AddArrowheads
              positions={vehicleData.map((loc) => [
                loc.latitude,
                loc.longitude,
              ])}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default App;
