import React, { useEffect, useState, useRef } from "react";
import { TextInput, CardLabel, CardLabelError, TextArea, LabelFieldPair } from "@mseva/digit-ui-react-components";

const ADSAddress = ({ t, value = {}, onChange = () => {}, onBlur = () => {} }) => {
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
  console.log('errors', errors)

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

  // Update parent
  // const updateParent = (updatedFields = {}) => {
  //   const currentCity = updatedFields.city ?? selectedCity ?? (value?.city || "");
  //   const currentLocality = updatedFields.locality ?? selectedLocality ?? (value?.locality || "");

  //   const addr = {
  //     addressId,
  //     doorNo,
  //     houseNo,
  //     houseName,
  //     streetName,
  //     addressline1,
  //     addressline2,
  //     landmark,
  //     pincode,
  //     city: currentCity,
  //     cityCode: (currentCity && (currentCity.code || (currentCity.city && currentCity.city.code))) || "",
  //     locality: currentLocality,
  //     localityCode: (currentLocality && (currentLocality.code || currentLocality)) || "",
  //     ...updatedFields,
  //   };
  //   onChangeRef.current?.(addr);
  // };

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

  // Localities
  // const { data: fetchedLocalities, isLoading: isLoadingLocalities } = Digit.Hooks.useBoundaryLocalities(
  //   selectedCity?.code || "",
  //   "revenue",
  //   { enabled: !!selectedCity && !!selectedCity.code },
  //   t
  // );

  // const structuredLocality = Array.isArray(fetchedLocalities)
  //   ? fetchedLocalities.map((local) => ({
  //       i18nKey: local.i18nkey || local.i18nKey || local.label,
  //       code: local.code,
  //       label: local.label || local.name || local.i18nKey,
  //       area: local.area,
  //       boundaryNum: local.boundaryNum,
  //     }))
  //   : [];

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

  // useEffect(() => {
  //   console.log("ADSAddress: useEffect for localities triggered");
  //   console.log("ADSAddress: selectedCity:", selectedCity);
  //   console.log("ADSAddress: fetchedLocalities:", fetchedLocalities);

  //   if (!selectedCity || !fetchedLocalities) return;

  //   const __localityList = Array.isArray(fetchedLocalities) ? fetchedLocalities : [];
  //   const mapped = __localityList.map((local) => ({
  //     i18nKey: local.i18nkey || local.i18nKey || local.label || local.name,
  //     code: local.code,
  //     label: local.label || local.name || local.i18nKey,
  //     pincode: local.pincode,
  //     area: local.area,
  //     boundaryNum: local.boundaryNum,
  //   }));

  //   const filteredByPincode = pincode
  //     ? mapped.filter((obj) => Array.isArray(obj.pincode) && obj.pincode.some((pin) => String(pin) === String(pincode)))
  //     : [];

  //   const finalList = filteredByPincode.length > 0 ? filteredByPincode : mapped;

  //   setLocalities(finalList);

  //   if (finalList.length === 1 && (!selectedLocality || selectedLocality.code !== finalList[0].code)) {
  //     setSelectedLocality(finalList[0]);
  //     updateParent({ locality: finalList[0] });
  //   } else if (selectedLocality && !finalList.find((l) => l.code === (selectedLocality.code || selectedLocality))) {
  //     setSelectedLocality(null);
  //     updateParent({ locality: null });
  //   }
  // }, [fetchedLocalities, selectedCity, pincode, selectedLocality]);

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
  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  return (
    <div>
      {/* Address ID - optional */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t ? t("ADS_ADDRESS_ID") : "Address ID"}</CardLabel>

        <div className="field">
          <TextInput
            value={addressId}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setAddressId(trimmedValue);
              updateParent({ addressId: trimmedValue });
              validateField("addressId", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.addressId && <CardLabelError style={errorStyle}>{errors.addressId.message}</CardLabelError>}
      <LabelFieldPair>
        {/* Door No - optional */}
        <CardLabel className="card-label-smaller">{t ? t("ADS_DOOR_NO") : "Door No"}</CardLabel>
        <div className="field">
          <TextInput
            value={doorNo}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setDoorNo(trimmedValue);
              updateParent({ doorNo: trimmedValue });
              validateField("doorNo", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.doorNo && <CardLabelError style={errorStyle}>{errors.doorNo.message}</CardLabelError>}

      {/* House No */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_HOUSE_NO") : "House No"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput
            value={houseNo}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setHouseNo(trimmedValue);
              updateParent({ houseNo: trimmedValue });
              validateField("houseNo", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.houseNo && <CardLabelError style={errorStyle}>{errors.houseNo.message}</CardLabelError>}

      {/* House Name */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_HOUSE_NAME") : "House Name"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput
            value={houseName}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setHouseName(trimmedValue);
              updateParent({ houseName: trimmedValue });
              validateField("houseName", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.houseName && <CardLabelError style={errorStyle}>{errors.houseName.message}</CardLabelError>}

      {/* Street Name */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_STREET_NAME") : "Street Name"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput
            value={streetName}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setStreetName(trimmedValue);
              updateParent({ streetName: trimmedValue });
              validateField("streetName", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.streetName && <CardLabelError style={errorStyle}>{errors.streetName.message}</CardLabelError>}

      {/* Address Line 1 */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_ADDRESS_LINE1") : "Address Line 1"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput
            value={addressline1}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setAddressline1(trimmedValue);
              updateParent({ addressline1: trimmedValue });
              validateField("addressline1", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.addressline1 && <CardLabelError style={errorStyle}>{errors.addressline1.message}</CardLabelError>}

      {/* Address Line 2 - optional */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t ? t("ADS_ADDRESS_LINE2") : "Address Line 2"}</CardLabel>
        <div className="field">
          <TextInput
            value={addressline2}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setAddressline2(trimmedValue);
              updateParent({ addressline2: trimmedValue });
              validateField("addressline2", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.addressline2 && <CardLabelError style={errorStyle}>{errors.addressline2.message}</CardLabelError>}

      <LabelFieldPair>
        {/* Landmark */}
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_LANDMARK") : "Landmark"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextArea
            value={landmark}
            onChange={(e) => {
              const trimmedValue = e.target.value.trim();

              setLandmark(trimmedValue);
              updateParent({ landmark: trimmedValue });
              validateField("landmark", trimmedValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.landmark && <CardLabelError style={errorStyle}>{errors.landmark.message}</CardLabelError>}

      {/* City */}
      {/* <CardLabel>
        {t ? t("ADS_CITY") : "City"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <Dropdown
        selected={selectedCity}
        select={(val) => {
          // keep handler in case of programmatic changes (UI is disabled)
          setSelectedCity(val);
          updateParent({ city: val });
          validateField("city", val);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
        option={allCities}
        optionKey="i18nKey"
        disable={true} // IMPORTANT: user cannot edit city
      />

      {errors.city && <div style={{ color: "red" }}>{errors.city}</div>} */}

      {/* Locality */}
      {/* <CardLabel>
        {t ? t("ADS_LOCALITY") : "Locality"} <span style={{ color: "red" }}>*</span>
      </CardLabel>
      <Dropdown
        selected={selectedLocality}
        select={(val) => {
          setSelectedLocality(val);
          updateParent({ locality: val });
          validateField("locality", val);
        }}
        onBlur={() => onBlurRef.current && onBlurRef.current()}
        option={localities}
        optionCardStyles={{ overflowY: "auto", maxHeight: "300px" }}
        optionKey="i18nKey"
        disabled={isLoadingLocalities}
        placeholder={t ? t("ADS_SELECT_LOCALITY") : "Select Locality"}
      />

      {errors.locality && <div style={{ color: "red" }}>{errors.locality}</div>} */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_CITY") : "City"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput
            value={city}
            onChange={(e) => {
              const filteredValue = e.target.value.replace(/[^a-zA-Z\s]/g, "").trim(); // Remove non-letter characters and trim
              setCity(filteredValue);
              updateParent({ city: filteredValue });
              validateField("city", filteredValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.city && <CardLabelError style={errorStyle}>{errors.city.message}</CardLabelError>}

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_LOCALITY") : "Locality"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput
            value={locality}
            onChange={(e) => {
              const filteredValue = e.target.value.replace(/[^a-zA-Z\s]/g, "").trim(); // Remove non-letter characters and trim
              setLocality(filteredValue);
              updateParent({ locality: filteredValue });
              validateField("locality", filteredValue);
            }}
            onBlur={() => onBlurRef.current && onBlurRef.current()}
          />
        </div>
      </LabelFieldPair>
      {errors.locality && <CardLabelError style={errorStyle}>{errors.locality.message}</CardLabelError>}

      <LabelFieldPair>
        {/* Pincode */}
        <CardLabel className="card-label-smaller">
          {t ? t("ADS_ADDRESS_PINCODE") : "Pincode"} <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <div className="field">
          <TextInput value={pincode} onChange={setAddressPincode} maxLength={6} />
        </div>
      </LabelFieldPair>
      {errors.pincode && <CardLabelError style={errorStyle}>{errors.pincode.message}</CardLabelError>}
    </div>
  );
};

export default ADSAddress;
