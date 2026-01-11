import React, { useEffect, useState, useRef } from "react";
import { TextInput, CardLabel, TextArea, CardLabelError } from "@mseva/digit-ui-react-components";

const ADSAddress = ({ t, value = {}, onChange = () => {}, onBlur = () => {}, errorsP }) => {
  // const allCities = Digit.Hooks.ads.useTenants();

  const currentUserType = JSON.parse(window.localStorage.getItem("user-info"))?.type;

  let tenantId;
  if (currentUserType === "CITIZEN") {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  } else {
    tenantId = Digit.ULBService.getCurrentPermanentCity();
  }

  // State for each field
  const [addressId, setAddressId] = useState(value?.addressId || "");
  const [doorNo, setDoorNo] = useState(value?.doorNo || "");
  const [houseNo, setHouseNo] = useState(value?.houseNo || "");
  const [houseName, setHouseName] = useState(value?.houseName || "");
  const [streetName, setStreetName] = useState(value?.streetName || "");
  const [addressline1, setAddressline1] = useState(value?.addressline1 || "");
  const [addressline2, setAddressline2] = useState(value?.addressline2 || "");
  const [landmark, setLandmark] = useState(value?.landmark || "");
  const [pincode, setPincode] = useState(value?.pincode || "");
  // const [selectedCity, setSelectedCity] = useState(value?.city || null);
  // const [selectedLocality, setSelectedLocality] = useState(value?.locality || null);
  // const [localities, setLocalities] = useState([]);

  const [city, setCity] = useState(value?.city || "");
  const [locality, setLocality] = useState(value?.locality || "");

  // Error state
  const [errors, setErrors] = useState({});

  // Sync incoming value
  useEffect(() => {
    setAddressId(value?.addressId || "");
    setDoorNo(value?.doorNo || "");
    setHouseNo(value?.houseNo || "");
    setHouseName(value?.houseName || "");
    setStreetName(value?.streetName || "");
    setAddressline1(value?.addressline1 || "");
    setAddressline2(value?.addressline2 || "");
    setLandmark(value?.landmark || "");
    setPincode(value?.pincode || "");
    // setSelectedCity(value?.city || null);
    // setSelectedLocality(value?.locality || null);
    setCity(value?.city || "");
    setLocality(value?.locality || "");
  }, [value]);

  // Keep latest onChange in a ref
  useEffect(() => {
    if (value?.city) setCity(value.city);
  }, [value]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const onBlurRef = useRef(onBlur);
  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);


  const updateParent = (updatedFields = {}) => {
    const currentCity = updatedFields.city ?? city ?? (value?.city || "");
    const currentLocality = updatedFields.locality ?? locality ?? (value?.locality || "");

    const addr = {
      addressId,
      doorNo,
      houseNo,
      houseName,
      streetName,
      addressline1,
      addressline2,
      landmark,
      pincode,
      city: currentCity,
      // if city is object keep code, else use the city string
      cityCode: typeof currentCity === "object" ? currentCity.code || (currentCity.city && currentCity.city.code) || "" : currentCity || "",
      locality: currentLocality,
      // if locality is object keep code, else use the locality string
      localityCode: typeof currentLocality === "object" ? currentLocality.code || currentLocality : currentLocality || "",
      ...updatedFields,
    };
    onChangeRef.current?.(addr);
  };


  // Pincode restriction
  const setAddressPincode = (e) => {
    const newPincode = String(e.target.value || "")
      .replace(/\D/g, "")
      .slice(0, 6);
    setPincode(newPincode);
    updateParent({ pincode: newPincode });
    if (!newPincode) {
      setErrors((prev) => ({ ...prev, pincode: "Pincode is required" }));
    } else {
      setErrors((prev) => ({ ...prev, pincode: "" }));
    }
  };


  // Validation rules
  const validateField = (name, value) => {
    const optionalFields = ["doorNo", "addressId", "addressline2"];
    const trimmedValue = value?.trim() || "";

    // Check for required fields
    if (!optionalFields.includes(name) && (!value || trimmedValue === "")) {
      setErrors((prev) => ({ ...prev, [name]: `${name.replace(/([A-Z])/g, " $1")} is required` }));
    } else if (name === "city" || name === "locality") {
      // Only allow letters and spaces, minimum 2 characters, not just spaces
      const charOnlyRegex = /^[a-zA-Z\s]{2,}$/;
      if (!charOnlyRegex.test(trimmedValue) || trimmedValue.length < 2) {
        setErrors((prev) => ({
          ...prev,
          [name]: `${name.replace(/([A-Z])/g, " $1")} must contain at least 2 letters and can only contain letters and spaces`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else if (!optionalFields.includes(name)) {
      // For other required fields: minimum 2 characters, allow chars/numbers/special chars
      if (trimmedValue.length < 2) {
        setErrors((prev) => ({ ...prev, [name]: `${name.replace(/([A-Z])/g, " $1")} must contain at least 2 characters` }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  useEffect(() => {
    if (errorsP?.address?.message) {
      // Extract missing fields from the message
      const missingFields = errorsP.address.message
        .replace("Address missing:", "")
        .split(",")
        .map((f) => f.trim());

      // Build an object like { houseNo: "This field is required", ... }
      const mappedErrors = {};
      missingFields.forEach((field) => {
        mappedErrors[field] = "This field is required";
      });

      setErrors((prev) => ({ ...prev, ...mappedErrors }));
    }
  }, [errorsP]);

  const errorStyle = {  color:"red"};

  return (
    <div>
      {/* Address ID - optional */}
      <CardLabel>{t ? t("ADS_ADDRESS_ID") : "Address ID"}</CardLabel>
      <TextInput
        value={addressId}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setAddressId(trimmedValue);
          updateParent({ addressId: trimmedValue });
          validateField("addressId", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {(errors.addressId || errorsP) && <div style={{ color: "red" }}>{errors.addressId}</div>} */}
      {(errors.addressId || errorsP) && <CardLabelError style={errorStyle}>{errors.addressId}</CardLabelError>}

      {/* Door No - optional */}
      <CardLabel>{t ? t("ADS_DOOR_NO") : "Door No"}</CardLabel>
      <TextInput
        value={doorNo}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setDoorNo(trimmedValue);
          updateParent({ doorNo: trimmedValue });
          validateField("doorNo", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.doorNo && <div style={{ color: "red" }}>{errors.doorNo}</div>} */}
      {errors?.doorNo && <CardLabelError style={errorStyle}>{errors?.doorNo}</CardLabelError>}

      {/* House No */}
      <CardLabel>
        {t ? t("ADS_HOUSE_NO") : "House No"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput
        value={houseNo}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setHouseNo(trimmedValue);
          updateParent({ houseNo: trimmedValue });
          validateField("houseNo", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.houseNo && <div style={{ color: "red" }}>{errors.houseNo}</div>} */}
      {errors?.houseNo && <CardLabelError style={errorStyle}>{errors?.houseNo}</CardLabelError>}
      {/* House Name */}
      <CardLabel>
        {t ? t("ADS_HOUSE_NAME") : "House Name"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput
        value={houseName}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setHouseName(trimmedValue);
          updateParent({ houseName: trimmedValue });
          validateField("houseName", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.houseName && <div style={{ color: "red" }}>{errors.houseName}</div>} */}
{errors?.houseName && <CardLabelError style={errorStyle}>{errors?.houseName}</CardLabelError>}
      {/* Street Name */}
      <CardLabel>
        {t ? t("ADS_STREET_NAME") : "Street Name"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput
        value={streetName}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setStreetName(trimmedValue);
          updateParent({ streetName: trimmedValue });
          validateField("streetName", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.streetName && <div style={{ color: "red" }}>{errors.streetName}</div>} */}
{errors?.streetName && <CardLabelError style={errorStyle}>{errors?.streetName}</CardLabelError>}

      {/* Address Line 1 */}
      <CardLabel>
        {t ? t("ADS_ADDRESS_LINE1") : "Address Line 1"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput
        value={addressline1}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setAddressline1(trimmedValue);
          updateParent({ addressline1: trimmedValue });
          validateField("addressline1", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.addressline1 && <div style={{ color: "red" }}>{errors.addressline1}</div>} */}
{errors?.addressline1 && <CardLabelError style={errorStyle}>{errors?.addressline1}</CardLabelError>}

      {/* Address Line 2 - optional */}
      <CardLabel>{t ? t("ADS_ADDRESS_LINE2") : "Address Line 2"}</CardLabel>
      <TextInput
        value={addressline2}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setAddressline2(trimmedValue);
          updateParent({ addressline2: trimmedValue });
          validateField("addressline2", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.addressline2 && <div style={{ color: "red" }}>{errors.addressline2}</div>} */}
{errors?.addressline2 && <CardLabelError style={errorStyle}>{errors?.addressline2}</CardLabelError>}

      {/* Landmark */}
      <CardLabel>
        {t ? t("ADS_LANDMARK") : "Landmark"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextArea
        value={landmark}
        onChange={(e) => {
          const trimmedValue = e.target.value;

          setLandmark(trimmedValue);
          updateParent({ landmark: trimmedValue });
          validateField("landmark", trimmedValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
        style={{ width: "50%" }}
      />
      {/* {errors.landmark && <div style={{ color: "red" }}>{errors.landmark}</div>} */}
{errors?.landmark && <CardLabelError style={errorStyle}>{errors?.landmark}</CardLabelError>}

      

      {errors.locality && <div style={{ color: "red" }}>{errors.locality}</div>} 
      <CardLabel>
        {t ? t("ADS_CITY") : "City"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput
        value={city}
        onChange={(e) => {
          const filteredValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Remove non-letter characters and trim
          setCity(filteredValue);
          updateParent({ city: filteredValue });
          validateField("city", filteredValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.city && <div style={{ color: "red" }}>{errors.city}</div>} */}
{errors?.city && <CardLabelError style={errorStyle}>{errors?.city}</CardLabelError>}

      <CardLabel>
        {t ? t("ADS_LOCALITY") : "Locality"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput
        value={locality}
        onChange={(e) => {
          const filteredValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Remove non-letter characters and trim
          setLocality(filteredValue);
          updateParent({ locality: filteredValue });
          validateField("locality", filteredValue);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
      />
      {/* {errors.locality && <div style={{ color: "red" }}>{errors.locality}</div>} */}
{errors?.locality && <CardLabelError style={errorStyle}>{errors?.locality}</CardLabelError>}

      {/* Pincode */}
      <CardLabel>
        {t ? t("ADS_ADDRESS_PINCODE") : "Pincode"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <TextInput value={pincode} onChange={setAddressPincode} maxLength={6} />
      {/* {errors.pincode && <div style={{ color: "red" }}>{errors.pincode}</div>} */}
{errors?.pincode && <CardLabelError style={errorStyle}>{errors?.pincode}</CardLabelError>}

    </div>
  );
};

export default ADSAddress;
