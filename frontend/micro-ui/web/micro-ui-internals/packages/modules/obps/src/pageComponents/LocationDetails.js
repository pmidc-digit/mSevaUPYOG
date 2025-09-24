import { CardLabel, FormStep, LinkButton, Loader, RadioOrSelect, TextInput,ActionBar,SubmitBar, UploadFile } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GIS from "./GIS";
import Timeline from "../components/Timeline";
import { stringReplaceAll } from "../utils";
import EXIF from "exif-js";


const LocationDetails = ({ t, config, onSelect, userType, formData, currentStepData, addNewOwner, isShowToast, onGoBack }) => {
  let propertyData = JSON.parse(sessionStorage.getItem("Digit_OBPS_PT"));
  let currCity = JSON.parse(sessionStorage.getItem("currentCity")) || {};
  let currPincode = sessionStorage.getItem("currentPincode");
  let currLocality = JSON.parse(sessionStorage.getItem("currentLocality")) || {};
  const allCities = Digit.Hooks.obps.useTenants();
  const { pathname: url } = useLocation();
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem("CITIZEN.CITY")
  const stateId = Digit.ULBService.getStateId();
  const [Pinerror, setPinerror] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState(currentStepData?.createdResponse?.landInfo?.address?.pincode || "");
  const [geoLocation, setgeoLocation] = useState(currentStepData?.createdResponse?.landInfo?.address?.geoLocation || { latitude: null, longitude: null });
  const [tenantIdData, setTenantIdData] = useState(formData?.Scrutiny?.[0]?.tenantIdData);
  const [selectedCity, setSelectedCity] = useState(() => currentStepData?.createdResponse?.landInfo?.address?.city || null);
  const [street, setStreet] = useState(formData?.address?.street || propertyData?.address?.street || "");
  const [landmark, setLandmark] = useState(formData?.address?.landmark || formData?.address?.Landmark || propertyData?.address?.landmark || "");
  const [placeName, setplaceName] = useState(formData?.address?.placeName || formData?.placeName || "");
  const [localities, setLocalities] = useState();
  const [selectedLocality, setSelectedLocality] = useState(currentStepData?.createdResponse?.landInfo?.address?.locality || null);
  const [viewSiteImageURL, setViewSiteImageURL] = useState(null);
  const state = localStorage.getItem("Citizen.tenant-id");
  //const { isLoading, data: citymodules } = Digit.Hooks.obps.useMDMS(stateId, "tenant", ["citymodule"]);
  let [cities, setcitiesopetions] = useState(allCities);
  let validation = {};
  let cityCode = formData?.data?.edcrDetails?.tenantId;
  console.log("viewSiteImageURL",viewSiteImageURL)
// const [sitePhotoGraph, setSitePhotoGraph] = useState()
const [uploadedFile, setUploadedFile] = useState(() => {
  return currentStepData?.createdResponse?.documents?.find((item) => item?.documentType === "SITEPHOTOGRAPH_ONE")?.fileStoreId || null;
});
const [geoLocationFromImg, setGeoLocationFromImg] = useState(currentStepData?.createdResponse?.landInfo?.address?.geoLocation || { latitude: null, longitude: null });
const [errors, setError] = useState(null);
const [apiLoading, setApiLoading] = useState(false);

const [isUploading, setIsUploading] = useState(false);


  if (!formData.address) {
    formData.address = {};
  }

  console.log("formData in location page", formData ,currentStepData);

  const isMobile = window.Digit.Utils.browser.isMobile();

  useEffect(()=>{
    if(typeof selectedCity === "string"){
      const city = allCities.find((item) => item.code === selectedCity);
      if(city) setSelectedCity(city)
    }else if(selectedCity === null){
      if(currentStepData?.createdResponse?.landInfo?.address?.city){
        setSelectedCity(currentStepData?.createdResponse?.landInfo?.address?.city)
      }
    }
  },[selectedCity, currentStepData?.createdResponse?.landInfo?.address?.city])

  useEffect(() => {
    if(selectedCity && typeof selectedCity !== "string" && localities?.length > 0 && !selectedLocality?.i18nkey && selectedLocality?.code){
      const locality = localities?.find((item) => item?.code === selectedLocality?.code)
      if(locality) setSelectedLocality(locality)
    }else if(selectedLocality === null){
      if(currentStepData?.createdResponse?.landInfo?.address?.locality){
        setSelectedLocality(currentStepData?.createdResponse?.landInfo?.address?.locality)
      }
    }
  }, [selectedCity, localities, selectedLocality])


  useEffect(() => {
    if (!selectedCity || !localities) {
      const filteredCities =
        userType === "employee"
          ? allCities.filter((city) => city.code === tenantId)
          : pincode && /^[1-9][0-9]{6}$/.test(pincode)
          ? allCities.filter((city) => city?.pincode?.some((pin) => pin == Number(pincode)))
          : allCities;

      setcitiesopetions(filteredCities);

      if (/^[1-9][0-9]{6}$/.test(pincode)) {
        if (filteredCities?.length === 0) {
          setPinerror("BPA_PIN_NOT_VALID_ERROR");
        } else if (filteredCities.length === 1) {
          let selectedCode = selectedCity?.code || selectedCity || "";
          if (filteredCities?.[0].code !== selectedCode) {
            setPinerror("BPA_PIN_NOT_VALID_ERROR");
          }
        }
      } else {
        setPinerror(null); // don't set error for partial/invalid format yet
      }
    }
  }, [pincode]);

  useEffect(async () => {
    if(uploadedFile){
      const result = await Digit.UploadServices.Filefetch([uploadedFile], state)
      console.log("uploadedFile",result);
      if(result?.data?.fileStoreIds?.length>0){
        setViewSiteImageURL(result?.data?.fileStoreIds?.[0]?.url);
      }
    }
  }, [uploadedFile])


  useEffect(() => {
    cities.map((city, index) => {
      if (city.code === cityCode) {
        setSelectedCity(city);
        sessionStorage.setItem("currentCity", JSON.stringify(city));
      }
    });
  }, [cities, formData?.data]);

  useEffect(() => {
    if (cities) {
      if (cities.length === 1 && cities?.[0].code === selectedCity?.code) {
        setSelectedCity(cities[0]);
        sessionStorage.setItem("currentCity", JSON.stringify(cities[0]));
      }
    }
  }, [cities]);

useEffect(() => {
  if (formData?.documents?.sitePhotoGraph) {
    setUploadedFile(formData.documents.sitePhotoGraph);
  }
}, [formData?.documents]);



  const { data: fetchedLocalities, isLoading } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity,
    },
    t
  );

  let isEditApplication = window.location.href.includes("editApplication");
  let isSendBackTOCitizen = window.location.href.includes("sendbacktocitizen");

  useEffect(() => {
    if (!propertyData?.address?.locality) {
      if (selectedCity && fetchedLocalities && !Pinerror) {
        let __localityList = fetchedLocalities;
        let filteredLocalityList = [];
        console.log("fetchedLocalities", fetchedLocalities);
        if (formData?.address?.locality && formData?.address?.locality?.code === selectedLocality?.code) {
          setSelectedLocality(formData.address.locality);
        }

        if ((formData?.address?.pincode || pincode) && !Pinerror) {
          filteredLocalityList = __localityList.filter((obj) => obj.pincode?.find((item) => item == pincode));
          if (!formData?.address?.locality && filteredLocalityList.length <= 0) setSelectedLocality();
        }
        if (
          !localities ||
          (filteredLocalityList.length > 0 && localities.length !== filteredLocalityList.length) ||
          (filteredLocalityList.length <= 0 && localities && localities.length !== __localityList.length)
        ) {
          console.log("filteredLocalityList", filteredLocalityList);
          setLocalities(() => (filteredLocalityList.length > 0 ? filteredLocalityList : __localityList));
        }
        if (
          filteredLocalityList.length === 1 &&
          (selectedLocality == null || (selectedLocality && filteredLocalityList[0]?.code !== selectedLocality?.code))
        ) {
          setSelectedLocality(filteredLocalityList[0]);
          sessionStorage.setItem("currLocality", JSON.stringify(filteredLocalityList[0]));
        }
      }
    } else {
      setSelectedLocality(propertyData?.address?.locality);
    }
  }, [selectedCity, formData?.pincode, fetchedLocalities, pincode, geoLocation]);

  const handleGIS = () => {
    setIsOpen(!isOpen);
  };

  const handleRemove = () => {
    setIsOpen(!isOpen);
  };

  // const handleSubmit = () => {
  //   // const address = {...currentStepData?.createdResponse?.landInfo?.address};
  //   const address = {};
  //   address.pincode = pincode;
  //   address.city = selectedCity?.code;
  //   address.locality = selectedLocality;
  //   address.street = street;
  //   address.landmark = landmark;
  //   address.geoLocation = geoLocation;
  //   address.placeName = placeName;

  //   let documents = [...currentStepData?.createdResponse?.documents].filter((item) => item.documentType !== "SITEPHOTOGRAPH_ONE");
  //   documents.push({
  //     documentType: "SITEPHOTOGRAPH_ONE",
  //     fileStoreId: uploadedFile,
  //     fileStore: uploadedFile,
  //     fileName: "",
  //     fileUrl: "",
  //     additionalDetails: {}
  //   })

  //   console.log("LocationAPI", address, documents);
    
  //   // onSelect(config.key, address);
  // };

  const validateForm = (city, locality, siteImage) => {
    if (!city || city.trim() === "") {
      alert(t("Please select a City"));
      return false;
    }

    if (!locality || (Array.isArray(locality) && locality.length === 0) || locality === "") {
      alert(t("Please select a Locality"));
      return false;
    }

    if (!siteImage || (Array.isArray(siteImage) && siteImage.length === 0) || siteImage === "") {
      alert(t("Please upload Site Image"));
      return false;
    }

    if(pincode?.length > 0){
      if(Digit.Utils.getPattern("Pincode").test(pincode)){
        alert(t("Please fill Correct Pincode"));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    const address = {...currentStepData?.createdResponse?.landInfo?.address};
    address.pincode = pincode.length>0 ? pincode : "";
    address.city = selectedCity?.code;
    address.locality = selectedLocality;
    // address.street = street;
    // address.landmark = landmark;
    address.geoLocation = geoLocation;
    // address.placeName = placeName;
    const userInfo = Digit.UserService.getUser()
    const accountId = userInfo?.info?.uuid
    const workflowAction = formData?.data?.applicationNo ? "SAVE_AS_DRAFT" : "INITIATE";

    // ✅ Run validation first
    if (!validateForm(address.city, address.locality, uploadedFile, pincode)) {
      return; // stop execution if validation fails
    }

    // ✅ Proceed only if validation passes
    let documents = [...(currentStepData?.createdResponse?.documents || [])]?.filter(
      (item) => item.documentType !== "SITEPHOTOGRAPH_ONE"
    );

    const siteDocument = [...(currentStepData?.createdResponse?.documents || [])]?.find(
      (item) => item.documentType === "SITEPHOTOGRAPH_ONE"
    );

    documents.push({
      documentType: "SITEPHOTOGRAPH_ONE",
      fileStoreId: uploadedFile,
      fileStore: uploadedFile,
      fileName: "",
      fileUrl: "",
      additionalDetails: {},
      id: siteDocument?.id || null
    });

    console.log("LocationAPI", address, documents);

    try{
        setApiLoading(true);
        const result = await Digit.OBPSService.update({ BPA: {
          ...currentStepData?.createdResponse,
          landInfo: {
            ...currentStepData?.createdResponse?.landInfo,
            address
          },
          documents,
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        } }, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          // onSelect("");
          onSelect({selectedCity});
        }else{
          alert(t("BPA_CREATE_APPLICATION_FAILED"));
          setApiLoading(false);
        }
        console.log("APIResponse", result);
      }catch(e){
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }

  };

  function onSave(geoLocation, pincode, placeName) {
    selectPincode(pincode);
    sessionStorage.setItem("currentPincode", pincode);
    setgeoLocation(geoLocation);
    setplaceName(placeName);
    setIsOpen(false);
    setPinerror(null);
  }


  function selectPincode(e) {
    const val = typeof e === "object" && e !== null ? e.target.value : e;
    setPinerror(null);

    if (val !== "" && !/^[1-9][0-9]{5}$/.test(val)) {
      setPinerror("BPA_PIN_NOT_VALID_ERROR");
    }

    formData.address["pincode"] = val;
    setPincode(val);
    sessionStorage.setItem("currentPincode", val);
    sessionStorage.setItem("currentCity", JSON.stringify({}));
    sessionStorage.setItem("currLocality", JSON.stringify({}));
    setSelectedLocality(null);
    setLocalities(null);
  }

  function selectStreet(e) {
    setStreet(e.target.value);
  }

  function selectGeolocation(e) {
    formData.address["geoLocation"] = typeof e === "object" && e !== null ? e.target.value : e;
    setgeoLocation(typeof e === "object" && e !== null ? e.target.value : e);
    setplaceName(typeof e === "object" && e !== null ? e.target.value : e);
    sessionStorage.setItem("currentPincode", "");
    sessionStorage.setItem("currentCity", JSON.stringify({}));
    sessionStorage.setItem("currLocality", JSON.stringify({}));
    setPincode("");
    setSelectedLocality(null);

  }

  function selectLandmark(e) {
    setLandmark(e.target.value);
  }

  function selectCity(city) {
    setSelectedLocality(null);
    setLocalities(null);
    setSelectedCity(city);
    sessionStorage.setItem("currentCity", JSON.stringify(city));
    formData.address["city"] = city;
  }



  function selectLocality(locality) {
    setSelectedLocality(locality);
    formData.address["locality"] = locality;
    sessionStorage.setItem("currLocality", JSON.stringify(locality));
  }



  function convertToDecimal([degrees, minutes, seconds], ref) {
  const d = degrees?.numerator / degrees?.denominator || 0;
  const m = minutes?.numerator / minutes?.denominator || 0;
  const s = seconds?.numerator / seconds?.denominator || 0;

  let decimal = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") decimal = -decimal;
  return decimal;
}

function extractGeoLocation(file) {
  return new Promise((resolve) => {
    EXIF.getData(file, function () {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const lon = EXIF.getTag(this, "GPSLongitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef");
      const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

      if (lat && lon && latRef && lonRef) {
        const latitude = convertToDecimal(lat, latRef);
        const longitude = convertToDecimal(lon, lonRef);
        resolve({ latitude, longitude });
      } else {
        resolve({ latitude: null, longitude: null });
      }
    });
  });
}

async function selectfiles(e) {
  const file = e.target.files[0];
  console.log("uploadFile", file);
  if (!file) return;


  const geo = await extractGeoLocation(file);
  if (!geo.latitude || !geo.longitude) {
    alert(t("This image does not contain GPS location data"));
    setUploadedFile(null);
    setGeoLocationFromImg({ latitude: null, longitude: null });
    return;
  }


  setError(null);
  setGeoLocationFromImg(geo);
  setgeoLocation(geo);
  setIsUploading(true)

  try {
  
    const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
if (response?.data?.files?.length > 0) {
  const fileStoreId = response.data.files[0].fileStoreId;
  setUploadedFile(fileStoreId);
  console.log("Uploaded FileStoreId:", fileStoreId);


  // 🔥 Update formData
  // formData.documents = { ...formData.documents, sitePhotoGraph: fileStoreId };

  // 🔥 Persist in sessionStorage so update API can pick it later
  // sessionStorage.setItem("BUILDING_PERMIT", JSON.stringify(formData));
} else {
  setError("File upload failed");
}


  } catch (err) {
    setError("File upload error");
  }finally{
    setIsUploading(false)
  }
}


  // ---------------- UI Styles ----------------
  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f1f1f1ff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    paddingBottom: "5rem",
  };

  const sectionStyle = {
    backgroundColor: "#ffffff",

    borderRadius: "8px",
 
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  };

  const headingStyle = {
    fontSize: "1.5rem",
    borderBottom: "2px solid #ccc",
    paddingBottom: "0.3rem",
    color: "#2e4a66",
    marginTop: "2rem",
    marginBottom: "1rem",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e0e0e0",
    padding: "0.5rem 0",
    color: "#333",
  };

  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    
  };

  const documentCardStyle = {

    minWidth: "200px",
    maxWidth: "250px",
    backgroundColor: "#fdfdfd",
    padding: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    justifyContent:"center",
    display:"flex",
    
  };

  const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{value || t("CS_NA")}</div>
    </div>
  );

  if(apiLoading || isLoading) return <Loader/>

return (
  <div style={pageStyle}>
    {/* {!isOpen && <Timeline />} */}
    {isOpen && (
      <GIS
        t={t}
        onSelect={onSelect}
        formData={formData}
        handleRemove={handleRemove}
        onSave={onSave}
      />
    )}

    {!isOpen && (
      <FormStep
        t={t}
        config={config}
        onSelect={handleSubmit}
        isDisabled={!selectedCity || Pinerror}
        isMultipleAllow={true}
        forcedError={t(Pinerror)}
      >
        {/* GIS Section */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_GIS_LABEL")}</h2>
          <div>
            <TextInput
              style={{}}
              isMandatory={false}
              optionKey="i18nKey"
              t={t}
              name="gis"
              value={
                isEditApplication || isSendBackTOCitizen
                  ? geoLocation.latitude !== null
                    ? `${geoLocation.latitude}, ${geoLocation.longitude}`
                    : ""
                  : placeName
              }
              onChange={selectGeolocation}
            />
            <LinkButton
              label={
                <div>
                  <span>
                    <svg
                      style={
                        !isMobile
                          ? { position: "relative", left: "515px", bottom: "25px", marginTop: "-20px" }
                          : { float: "right", position: "relative", bottom: "25px", marginTop: "-20px", marginRight: "5px" }
                      }
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11 7C8.79 7 7 8.79 7 11C7 13.21 8.79 15 11 15C13.21 15 15 13.21 15 11C15 8.79 13.21 7 11 7ZM19.94 10C19.48 5.83 16.17 2.52 12 2.06V0H10V2.06C5.83 2.52 2.52 5.83 2.06 10H0V12H2.06C2.52 16.17 5.83 19.48 10 19.94V22H12V19.94C16.17 19.48 19.48 16.17 19.94 12H22V10H19.94ZM11 18C7.13 18 4 14.87 4 11C4 7.13 7.13 4 11 4C14.87 4 18 7.13 18 11C18 14.87 14.87 18 11 18Z"
                        fill="#505A5F"
                      />
                    </svg>
                  </span>
                </div>
              }
              style={{}}
              onClick={(e) => handleGIS()}
            />
          </div>
        </div>

        {/* Pincode Section */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_DETAILS_PIN_LABEL")}</h2>
          {!isOpen && (
            <TextInput
              isMandatory={false}
              optionKey="i18nKey"
              type={"text"}
              t={t}
              name="pincode"
              onChange={selectPincode}
              value={pincode}
              disabled={propertyData?.address ? true : false}
            />
          )}
        </div>

        {/* City Section */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_CITY_LABEL")}</h2>
          {!isOpen && (
            <TextInput
              value={selectedCity?.name || ""}
              disable={true}
              style={{ background: "#f1f1f1" }}
            />
          )}
        </div>

        {/* Locality (Mohalla) Section - RESTORED ORIGINAL GUARD */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_LOC_MOHALLA_LABEL")}</h2>

          {!isOpen && selectedCity && localities && !propertyData?.address ? (
            <span className={"form-pt-dropdown-only"}>
              {/* <CardLabel>{`${t("BPA_LOC_MOHALLA_LABEL")}*`}</CardLabel> */}
              <RadioOrSelect
                optionCardStyles={{ maxHeight: "20vmax", overflow: "scroll" }}
                isMandatory={false}
                options={localities.sort((a, b) => a.name.localeCompare(b.name))}
                selectedOption={selectedLocality}
                optionKey="i18nkey"
                onSelect={selectLocality}
                t={t}
                isDependent={true}
                labelKey={`${stringReplaceAll(selectedCity?.code, ".", "_").toUpperCase()}_REVENUE`}
                //disabled={isEdit}
              />
            </span>
          ) : (
            <span className={"form-pt-dropdown-only"}>
              <CardLabel>{`${t("BPA_LOC_MOHALLA_LABEL")}*`}</CardLabel>
              <TextInput
                optionCardStyles={{ maxHeight: "20vmax", overflow: "scroll" }}
                isMandatory={false}
                value={propertyData?.address?.locality?.name}
                optionKey="i18nkey"
                t={t}
                isDependent={true}
                labelKey={`${stringReplaceAll(selectedCity?.code, ".", "_").toUpperCase()}_REVENUE`}
                disabled={propertyData?.address ? true : false}
              />
            </span>
          )}
        </div>

        {/* Site Photograph Section */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>{t("BPA_LOC_SITE_PHOTOGRAPH")}</h2>

          <UploadFile
            id="loc-site-photo"
            onUpload={selectfiles}
            onDelete={() => {
              setUploadedFile(null);
              // setFiles && setFiles(null);
            }}
            message={uploadedFile ? `1 ${t("CS_ACTION_FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
            accept=".jpg,.jpeg,.png"
          />

          {uploadedFile && viewSiteImageURL && (
            <div style={{ marginTop: "16px" }}>
              {/* <CardLabel>{t("BPA_LOC_SITE_PHOTOGRAPH_PREVIEW")}</CardLabel> */}
              <a 
                href={viewSiteImageURL} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer", font:"14px" }}
              >
                {t("CS_COMMON_VIEW_SITE_PHOTOGRAPH")}
              </a>
            </div>
          )}

          {isUploading && (
            <div style={{ marginTop: "12px" }}>
              <Loader />
              <span style={{ marginLeft: "8px" }}>{t ? t("CS_FILE_UPLOADING") : "Uploading image..."}</span>
            </div>
          )}

          {!isUploading && geoLocationFromImg.latitude && geoLocationFromImg.longitude && (
            <div style={{ marginTop: "12px", padding: "8px", border: "1px solid #D6D5D4", borderRadius: 8 }}>
              <strong>📍 Extracted Geo Location</strong>
              <div>Latitude: {Number(geoLocationFromImg.latitude).toFixed(6)}</div>
              <div>Longitude: {Number(geoLocationFromImg.longitude).toFixed(6)}</div>
            </div>
          )}
        </div>
      </FormStep>
    )}
       <ActionBar>
        <SubmitBar
                                      label="Back"
                                      style={{
                                        border: "1px solid",
                                        background: "transparent",
                                        color: "#2947a3",
                                        marginRight: "5px",
                                      }}
                                      onSubmit={onGoBack}
                            />
           {<SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={handleSubmit}  disabled={!selectedCity || Pinerror || apiLoading}/>}
       </ActionBar>
  </div>
);
}

export default LocationDetails;