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
  let { t } = useTranslation();
  let { id } = useParams();
 const history = useHistory();
  let tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId(); // ToDo: fetch from state
  const { isLoading, error, isError, complaintDetails, revalidate } = Digit.Hooks.swach.useComplaintDetails({ tenantId, id });
  const { mutate: submitAttendance, isLoading: isMutating } = Digit.Hooks.swach.useAttendence();
  const SelectImages = Digit?.ComponentRegistryService?.getComponent("SWACHSelectImages");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });


  const [imageZoom, setImageZoom] = useState(null);

  const [loader, setLoader] = useState(false);

  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);
  const localityCode = complaintDetails?.details?.ES_CREATECOMPLAINT_ADDRESS?.locality?.code;
  const localityObj = localities?.find((loc) => loc?.code == localityCode);
  const localityName = localityObj?.name || "";
  const city = complaintDetails?.details?.ES_CREATECOMPLAINT_ADDRESS?.city || "";
  const pincode = complaintDetails?.details?.ES_CREATECOMPLAINT_ADDRESS?.pincode || "";

  const addressText = [localityName, city, pincode]?.filter(Boolean).join(", ");

  useEffect(() => {
    (async () => {
      if (complaintDetails) {
        setLoader(true);
        await revalidate();
        setLoader(false);
      }
    })();
  }, []);
useEffect(() => {
    if (toast.show && toast.type === "success") {
      const timer = setTimeout(() => {
        history.push("/digit-ui/citizen/swach-home");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, history]);
  const auditCitizen = complaintDetails?.audit?.citizen || {};
  const attendanceFields = [
    { label: "Name", value: auditCitizen.name || "N/A" },
    { label: "Mobile Number", value: auditCitizen.mobileNumber || "N/A" },
  ];
  const [uploadedImages, setUploadedImages] = useState([]);

  // State for location and time
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

  if (isLoading || loader) {
    return <Loader />;
  }

  if (isError) {
    return <h2>Error</h2>;
  }
  const attendanceRequestBody = {
    RequestInfo: { apiId: "Rainmaker", authToken: "", userInfo: {}, msgId: "", plainAccessRequest: {} },
    ImageData: { tenantId: "", useruuid: "", latitude: "", longitude: "", locality: "", imagerurl: "" },
  };

  const handleSubmit = () => {
    const digiUser = Digit.UserService.getUser() || {};
    const user = { authToken: digiUser.access_token, userInfo: digiUser };
    const addr = complaintDetails.details.ES_CREATECOMPLAINT_ADDRESS;

    const slots = {
      city: addr.tenantId,
      locality: address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const docs = complaintDetails.workflow.verificationDocuments || [];
    const attendance = { image: uploadedImages[0] || "" };
    // const attendance = { image: docs[0]?.fileStoreId || "" };

    submitAttendance(
      { user, slots, attendance },
      {
        onSuccess: () => setToast({ show: true, type: "success", message: t("ATTENDENCE_SUBMIT_SUCCESS") }),
        onError: () => setToast({ show: true, type: "error", message: t("ATTENDENCE_SUBMIT_FAILED") }),
      }
    );
  };

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
            <SelectImages
              key={uploadedImages.length > 0 ? uploadedImages[0] : "empty"}
              value={{ uploadedImages: uploadedImages.length > 0 ? [uploadedImages[uploadedImages.length - 1]] : [] }}
              // value={{ uploadedImages }}
              // onSelect={(val) => setUploadedImages(val.uploadedImages)}
              onSelect={(val) => {
                if (val.uploadedImages && val.uploadedImages.length > 0) {
                  setUploadedImages([val.uploadedImages[val.uploadedImages.length - 1]]);
                } else {
                  setUploadedImages([]);
                }
              }}
              tenantId={tenantId}
            />
          </div>
        </Card>
        <ButtonSelector label="Submit" onSubmit={handleSubmit}></ButtonSelector>
      </div>
    </React.Fragment>
  );
};

export default Attendence;
