import { Loader } from "@googlemaps/js-api-loader";

let mapsLoaded = false;

export const loadGoogleMaps = async () => {
  if (mapsLoaded) return;
  const key = globalConfigs?.getConfig("GMAPS_API_KEY");
  const loader = new Loader({
    apiKey: key,
    version: "weekly",
    libraries: ["places"],
  });
  await loader.load();
  mapsLoaded = true;
};

// Haversine fallback (returns meters)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
};

export const getDrivingDistance = async (lat1, lon1, lat2, lon2) => {
  try {
    await loadGoogleMaps();

    return new Promise((resolve) => {
      const origin = new window.google.maps.LatLng(lat1, lon1);
      const destination = new window.google.maps.LatLng(lat2, lon2);
      const service = new window.google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: "DRIVING",
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === "OK") {
            const distanceMeters = response.rows[0].elements[0].distance.value;
            resolve(distanceMeters); // meters
          } else {
            console.warn("Google API failed, falling back to Haversine:", status);
            resolve(haversineDistance(lat1, lon1, lat2, lon2)); // meters
          }
        }
      );
    });
  } catch (err) {
    console.error("Google Maps not available, using Haversine:", err);
    return haversineDistance(lat1, lon1, lat2, lon2); // meters
  }
};