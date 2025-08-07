import React, { useState } from "react";

const allowedDistricts = ["Chennai", "Chengalpattu", "Kanchipuram", "Thiruvallur"];

function App() {
  const [data, setData] = useState([]);
  const [serial, setSerial] = useState(1);
  const [current, setCurrent] = useState(null);

  const fetchNetworkInfo = async () => {
    if (navigator.connection) {
      const type = navigator.connection.effectiveType;
      const is5G = type === "5g" || type === "4g";
      return { is5G, type };
    }
    return { is5G: false, type: "unknown" };
  };

  const fetchLatency = async () => {
    const start = performance.now();
    try {
      await fetch("https://www.google.com", { mode: "no-cors" });
    } catch (e) {}
    const latency = performance.now() - start;
    return Math.round(latency);
  };

  const getDistrictFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const json = await res.json();
      return json.address.county || json.address.city_district || "";
    } catch {
      return "";
    }
  };

  const captureData = async () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const district = await getDistrictFromCoords(latitude, longitude);
        if (!allowedDistricts.includes(district)) {
          alert("Location outside allowed regions");
          return;
        }

        const { is5G, type } = await fetchNetworkInfo();
        const latency = await fetchLatency();
        const ping = Math.floor(Math.random() * 100);

        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();

        const newEntry = {
          id: serial,
          date,
          time,
          latitude,
          longitude,
          district,
          is5G,
          networkType: type,
          latency,
          ping,
        };

        setData((prev) => [...prev, newEntry]);
        setSerial((prev) => prev + 1);
        setCurrent(newEntry);
      },
      (error) => {
        alert("Location access denied or unavailable");
      }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Network + Location Capture</h1>
      <button onClick={captureData}>Capture Info</button>

      {current && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}>
          <h3>Latest Capture:</h3>
          <pre>{JSON.stringify(current, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
