import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LinkButton, Button } from "@mseva/digit-ui-react-components";

import {
  Card,
  Header,
  CardSubHeader,
  StatusTable,
  Row,
  TextArea,
  SubmitBar,
  DisplayPhotos,
  ImageViewer,
  Loader,
  Toast,
  ButtonSelector,
} from "@mseva/digit-ui-react-components";

import TimeLine from "../../components/TimeLine";

const Attendence = (props) => {
  const userInfo = Digit.SessionStorage.get("User")?.info;
  const user = userInfo?.uuid;

  let { t } = useTranslation();
  let { id } = useParams();
  const history = useHistory();
  let tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId(); // ToDo: fetch from state
  const { mutate: submitAttendance, isLoading: isMutating } = Digit.Hooks.swach.useAttendence();
  const SelectImages = Digit?.ComponentRegistryService?.getComponent("SWACHSelectImages");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const [imageZoom, setImageZoom] = useState(null);

  const [loader, setLoader] = useState(false);

  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);

  const getTodayTimestamp = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  };
  const { data, isLoading, error } = Digit.Hooks.swach.useViewAttendence({
    tenantId,
    userIds: user,
    fromDate: getTodayTimestamp(),
  });

  useEffect(() => {
    if (toast.show && toast.type === "success") {
      const timer = setTimeout(() => {
        history.push("/digit-ui/citizen/swach-home");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, history]);
  const [mobileNumber, setMobileNumber] = useState(userInfo?.mobileNumber || "");
  const [fullName, setFullName] = useState(userInfo?.name || "");
  const attendanceFields = [
    { label: "Name", value: fullName || "N/A" },
    { label: "Mobile Number", value: mobileNumber || "N/A" },
  ];
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [currentTime, setCurrentTime] = useState("");
  const [address, setAddress] = useState("Fetching address...");
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocation({ latitude: "Unavailable", longitude: "Unavailable" });
      }
    );
    setCurrentTime(new Date().toLocaleString());
  }, []);

  useEffect(() => {
    const { latitude, longitude } = location;
    if (latitude && longitude && latitude !== "Unavailable") {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then((res) => res.json())
        .then((data) => {
          setAddress(data.display_name || "Address not found");
        })
        .catch(() => setAddress("Unavailable"));
    }
  }, [location]);

  const attendanceRequestBody = {
    RequestInfo: { apiId: "Rainmaker", authToken: "", userInfo: {}, msgId: "", plainAccessRequest: {} },
    ImageData: { tenantId: "", useruuid: "", latitude: "", longitude: "", locality: "", imagerurl: "" },
  };

  const handleSubmit = () => {
    const digiUser = Digit.UserService.getUser() || {};
    const user = { authToken: digiUser.access_token, userInfo: digiUser };
    const slots = {
      city: tenantId,
      locality: address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const attendance = { image: uploadedImages[0] || "" };

    submitAttendance(
      { user, slots, attendance },
      {
        onSuccess: () => setToast({ show: true, type: "success", message: t("ATTENDENCE_SUBMIT_SUCCESS") }),
        onError: () => setToast({ show: true, type: "error", message: t("ATTENDENCE_SUBMIT_FAILED") }),
      }
    );
  };

  const [hasAttendance, setHasAttendance] = useState(false);
  useEffect(() => {
    if (data?.Attendance && data.Attendance.length > 0) {
      setHasAttendance(true);
    }
  }, [data]);

  useEffect(() => {
    let timeoutId;

    if (isImageLoading) {
      timeoutId = setTimeout(() => {
        setIsImageLoading(false);
      }, 10000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isImageLoading]);

  return (
    <React.Fragment>
      {toast.show && <Toast error={toast.type === "error"} label={toast.message} onClose={() => setToast({ ...toast, show: false })} />}
      <div className="complaint-summary">
        <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "960px" }}></div>

        <Card>
          <CardSubHeader>{`Attendence`}</CardSubHeader>
          <StatusTable>
            {attendanceFields.map((field, idx) => (
              <Row key={idx} label={field.label} text={field.value} />
            ))}
            <Row label="Current Address" text={address} />
            <Row label="Current Time" text={currentTime} />
          </StatusTable>
          <div style={{ margin: "16px 0" }}>
            {isImageLoading ? (
              // <Loader />
              <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader />
                <p style={{ textAlign: "center", marginTop: "8px" }}>Processing image...</p>
              </div>
            ) : (
              <SelectImages
                key={uploadedImages.length > 0 ? uploadedImages[0] : "empty"}
                value={{ uploadedImages: uploadedImages.length > 0 ? [uploadedImages[uploadedImages.length - 1]] : [] }}
                onSelect={(val) => {
                  console.log("Image selected:", val);
                  if (val.uploadedImages && val.uploadedImages.length > 0) {
                    if (uploadedImages.length === 0 || val.uploadedImages[val.uploadedImages.length - 1] !== uploadedImages[0]) {
                      console.log("Setting loading to true");
                      setIsImageLoading(true);
                      setTimeout(() => {
                        setUploadedImages([val.uploadedImages[val.uploadedImages.length - 1]]);
                        setIsImageLoading(false);
                      }, 3000);
                    } else {
                      setUploadedImages([val.uploadedImages[val.uploadedImages.length - 1]]);
                    }
                  } else {
                    setUploadedImages([]);
                  }
                }}
                tenantId={tenantId}
              />
            )}
          </div>
        </Card>
        {!hasAttendance && (
          <ButtonSelector
            label="Submit"
            onSubmit={handleSubmit}
            isDisabled={address === "Fetching address..." || !address || address === "Unavailable" || isImageLoading || uploadedImages.length === 0}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default Attendence;
