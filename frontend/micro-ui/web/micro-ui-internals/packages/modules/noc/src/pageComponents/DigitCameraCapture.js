import React, { useEffect, useRef, useState } from "react";
import { ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const DigitCameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);   // ✅ IMPORTANT
  const {t} = useTranslation();

  const [stream, setStream] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  /* ------------------ START CAMERA ------------------ */
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        });

        streamRef.current = mediaStream;
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        setError("Camera permission denied");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stopCamera();
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ------------------ GET GPS ------------------ */
//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation not supported");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLocation({
//           lat: pos.coords.latitude.toFixed(6),
//           lng: pos.coords.longitude.toFixed(6)
//         });
//       },
//       () => setError("Location permission denied"),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   }, []);
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            return;
        }

        let watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const accuracy = pos.coords.accuracy;

                // Accept only good accuracy
                // if (accuracy <= 100) {
                    setLocation({
                        lat: pos.coords.latitude.toFixed(6),
                        lng: pos.coords.longitude.toFixed(6),
                        accuracy
                    });
                // }
            },
            (err) => {
                setError("Location permission denied");
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 20000
            }
        );

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    console.log("Current location:", location);


  /* ------------------ CAPTURE IMAGE ------------------ */
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    /* --------- WATERMARK --------- */
    const timestamp = new Date().toLocaleString();
    const watermarkText = `Lat: ${location?.lat || "NA"}, Lng: ${location?.lng || "NA"} | ${timestamp}`;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(watermarkText, 10, canvas.height - 20);

    /* --------- CONVERT TO FILE --------- */
    canvas.toBlob((blob) => {
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
        type: "image/jpeg"
      });

      stopCamera();

      onCapture(file, {
        latitude: location?.lat,
        longitude: location?.lng,
        timestamp,
      });
    }, "image/jpeg", 0.9);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          borderRadius: "8px",
          background: "#000"
        }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {error && (
        <div style={{ color: "red", marginTop: "8px" }}>
          {t(error)}
        </div>
      )}

      {/* <button
        onClick={capturePhoto}
        style={{
          marginTop: "16px",
          padding: "12px 24px",
          fontSize: "16px",
          background: "#0B4B66",
          color: "#fff",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Capture Photo
      </button> */}
          {location && location.accuracy > 100 && (
              <div style={{ fontSize: "12px", color: "#B45309", marginTop: "4px" }}>
                  Low GPS accuracy. Move outdoors for better accuracy.
              </div>
          )}

      <div style={{display: "flex",justifyContent: "center",gap: "12px", marginTop: "16px"}}>
        {!error && <SubmitBar label={t("CAPTURE_IMAGE")} onSubmit={capturePhoto} />}
        <SubmitBar label={t("CANCEL")} onSubmit={handleCancel} />
      </div>
    </div>
  );
};

export default DigitCameraCapture;