import React, { useState, useMemo } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  Dropdown,
  CardSectionHeader,
  LocationSearch,
  Modal,
} from "@mseva/digit-ui-react-components";

const CloseBtn = (props) => (
  <React.Fragment>
    <div className="icon-bg-secondary" onClick={props.onClick} style={{ cursor: "pointer" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a82227" width="24" height="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
      </svg>
    </div>
  </React.Fragment>
);

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px" };

const areaTypeOptions = [
  { code: "URBAN", name: "Urban" },
  { code: "RURAL", name: "Rural" },
];

const FireNOCPropertyLocationDetails = (_props) => {
  const { t, Controller, control, setValue, errors, watch } = _props;
  const [showMap, setShowMap] = useState(false);
  const [tempGeoLocation, setTempGeoLocation] = useState(null);
  const [tempPincode, setTempPincode] = useState(null);

  const handleOpenMap = (currentVal) => {
    setTempGeoLocation(currentVal || null);
    setTempPincode(null);
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setTempGeoLocation(null);
    setTempPincode(null);
    setShowMap(false);
  };

  const handleApplyMap = () => {
    if (tempGeoLocation) {
      setValue("geoLocation", tempGeoLocation, { shouldValidate: true, shouldDirty: true });
      if (tempPincode) {
        setValue("pincode", tempPincode, { shouldValidate: true, shouldDirty: true });
      }
    }
    handleCloseMap();
  };

  const stateId = Digit.ULBService.getStateId();

  // Fetch fire stations from MDMS
  const { data: fireStationData } = Digit.Hooks.useCustomMDMS(stateId, "firenoc", [{ name: "FireStations" }], {
    select: (d) => d?.firenoc?.FireStations?.filter((s) => s.active) || [],
  });

  // Fetch all tenants
  const allCities = Digit.Hooks.noc.useTenants();

  // Watch cascading form values
  const areaType = watch("areaType");
  const selectedDistrict = watch("districtName");
  const selectedCity = watch("cityName");
  const geoLocation = watch("geoLocation");

  // Eligible tenants = those that have a fire station
  const eligibleTenants = useMemo(() => {
    const fullCitiesList = Digit.SessionStorage.get("initData")?.tenants || allCities || [];
    if (!fullCitiesList?.length || !fireStationData?.length) return [];
    
    const stationTenantIds = new Set();
    fireStationData.forEach((s) => {
      if (s.active) {
        if (s.baseTenantId) stationTenantIds.add(s.baseTenantId);
        if (Array.isArray(s.ulb)) {
          s.ulb.forEach((u) => {
            if (u.code) stationTenantIds.add(u.code);
          });
        }
      }
    });

    return fullCitiesList.filter((t) => stationTenantIds.has(t.code));
  }, [allCities, fireStationData]);

  // District options from eligible tenants
  const districtOptions = useMemo(() => {
    if (!eligibleTenants?.length) return [];
    const seen = new Set();
    const list = eligibleTenants.reduce((acc, tenant) => {
      const distCode = tenant?.city?.districtTenantCode;
      const distName = tenant?.city?.districtName;
      if (distCode && !seen.has(distCode)) {
        seen.add(distCode);
        acc.push({ code: distCode, name: distName || distCode });
      }
      return acc;
    }, []);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [eligibleTenants]);

  // City options based on selected district
  const cityOptions = useMemo(() => {
    if (!eligibleTenants?.length || !selectedDistrict?.code) return [];
    const list = eligibleTenants
      .filter((t) => t?.city?.districtTenantCode === selectedDistrict.code)
      .map((t) => ({ code: t.code, name: t.name || t.code }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [eligibleTenants, selectedDistrict]);

  // Fetch mohalla/localities based on selected city
  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code || stateId,
    "revenue",
    { enabled: !!selectedCity?.code },
    t
  );

  const isUrban = areaType?.code === "URBAN";
  const isRural = areaType?.code === "RURAL";

  // Cascading reset handlers
  const handleAreaTypeChange = (val, onChange) => {
    onChange(val);
    setValue("districtName", null);
    setValue("cityName", null);
    setValue("mohalla", null);
    setValue("villageName", "");
  };

  const handleDistrictChange = (val, onChange) => {
    onChange(val);
    setValue("cityName", null);
    setValue("mohalla", null);
    setValue("villageName", "");
  };

  const handleCityChange = (val, onChange) => {
    onChange(val);
    setValue("mohalla", null);
    setValue("villageName", "");
    // Auto-set fire station for selected city/tehsil
    if (fireStationData?.length && val?.code) {
      const station = fireStationData.find(
        (s) => s.baseTenantId === val.code || (Array.isArray(s.ulb) && s.ulb.some((u) => u.code === val.code))
      );
      if (station) setValue("fireStationId", station.code);
    }
  };

  return (
    <React.Fragment>
      <CardSectionHeader>{t("Property Location Details")}</CardSectionHeader>

      {/* Row 1: Area Type + District Name */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Area Type")}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller control={control} name="areaType" rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown className="form-field" select={(val) => handleAreaTypeChange(val, props.onChange)} selected={props.value} option={areaTypeOptions} optionKey="name" t={t} placeholder={t("Select Area Type")} />
              )}
            />
            {errors?.areaType && <p style={{ color: "red", marginTop: "4px" }}>{errors.areaType.message}</p>}
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("District Name")}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller control={control} name="districtName" rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown className="form-field" select={(val) => handleDistrictChange(val, props.onChange)} selected={props.value} option={districtOptions} optionKey="name" t={t} placeholder={t("Select District")} disable={!areaType} />
              )}
            />
            {errors?.districtName && <p style={{ color: "red", marginTop: "4px" }}>{errors.districtName.message}</p>}
          </div>
        </LabelFieldPair>
      </div>

      {/* Urban: City/Town + Mohalla */}
      {isUrban && (
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("City/Town")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name="cityName" rules={{ required: isUrban ? t("REQUIRED_FIELD") : false }}
                render={(props) => (
                  <Dropdown className="form-field" select={(val) => handleCityChange(val, props.onChange)} selected={props.value} option={cityOptions} optionKey="name" t={t} placeholder={t("Select City/Town")} />
                )}
              />
              {errors?.cityName && <p style={{ color: "red", marginTop: "4px" }}>{errors.cityName.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Mohalla")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name="mohalla" rules={{ required: isUrban ? t("REQUIRED_FIELD") : false }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={fetchedLocalities || []} optionKey="i18nkey" t={t} placeholder={t("Select Mohalla")} />
                )}
              />
              {errors?.mohalla && <p style={{ color: "red", marginTop: "4px" }}>{errors.mohalla.message}</p>}
            </div>
          </LabelFieldPair>
        </div>
      )}

      {/* Rural: Tehsil + Village Name */}
      {isRural && (
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Tehsil")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name="cityName" rules={{ required: isRural ? t("REQUIRED_FIELD") : false }}
                render={(props) => (
                  <Dropdown className="form-field" select={(val) => handleCityChange(val, props.onChange)} selected={props.value} option={cityOptions} optionKey="name" t={t} placeholder={t("Select Tehsil")} />
                )}
              />
              {errors?.cityName && <p style={{ color: "red", marginTop: "4px" }}>{errors.cityName.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Village Name")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name="villageName" rules={{ required: isRural ? t("REQUIRED_FIELD") : false }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Village Name")} />
                )}
              />
              {errors?.villageName && <p style={{ color: "red", marginTop: "4px" }}>{errors.villageName.message}</p>}
            </div>
          </LabelFieldPair>
        </div>
      )}

      {/* Row 2: Property ID + Plot/Survey No */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Property ID")}</CardLabel>
          <div className="field">
            <Controller control={control} name="propertyId"
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Property ID")} />
              )}
            />
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Plot/Survey No.")}</CardLabel>
          <div className="field">
            <Controller control={control} name="plotSurveyNo"
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Plot/Survey No.")} />
              )}
            />
          </div>
        </LabelFieldPair>
      </div>

      {/* Row 3: Street Name + Landmark Name */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Street Name")}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller control={control} name="streetName"
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Street Name")} />
              )}
            />
            {errors?.streetName && <p style={{ color: "red", marginTop: "4px" }}>{errors.streetName.message}</p>}
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Landmark Name")}</CardLabel>
          <div className="field">
            <Controller control={control} name="landmarkName"
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Landmark")} />
              )}
            />
          </div>
        </LabelFieldPair>
      </div>

      {/* Row 4: Pincode + Locate on Map */}
      <div style={twoColRow}>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Pincode")}</CardLabel>
          <div className="field">
            <Controller control={control} name="pincode"
              rules={{ pattern: { value: /^[0-9]{6}$/, message: t("INVALID_PINCODE") } }}
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Pincode")} />
              )}
            />
            {errors?.pincode && <p style={{ color: "red", marginTop: "4px" }}>{errors.pincode.message}</p>}
          </div>
        </LabelFieldPair>
        <LabelFieldPair style={colItem}>
          <CardLabel className="card-label-smaller">{t("Locate on Map")}</CardLabel>
          <div className="field">
            <Controller control={control} name="geoLocation"
              render={(props) => (
                <div
                  onClick={() => handleOpenMap(props.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    cursor: "pointer",
                    color: geoLocation?.latitude && geoLocation?.longitude ? "#0b0b0b" : "#b1b4b5",
                    borderBottom: "1px dashed #ccc",
                    paddingBottom: "8px",
                    minHeight: "40px",
                    width: "100%",
                  }}
                >
                  <span style={{ fontSize: "16px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {geoLocation?.latitude && geoLocation?.longitude
                      ? `${geoLocation.latitude}, ${geoLocation.longitude}`
                      : t("Select your property location on map")}
                  </span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" fill="#464646"/>
                    </svg>
                  </div>
                </div>
              )}
            />
          </div>
        </LabelFieldPair>
      </div>
      {showMap && (
        <Modal
          headerBarMain={t("Locate on Map")}
          headerBarEnd={<CloseBtn onClick={handleCloseMap} />}
          actionCancelLabel={t("Close")}
          actionCancelOnSubmit={handleCloseMap}
          actionSaveLabel={t("Pick")}
          actionSaveOnSubmit={handleApplyMap}
          popupStyles={{ width: "80%", maxWidth: "800px" }}
        >
          <div>
            <LocationSearch
              position={tempGeoLocation || {}}
              onChange={(pincode, location) => {
                setTempGeoLocation({
                  latitude: location?.latitude || location?.lat,
                  longitude: location?.longitude || location?.lng,
                });
                if (pincode) setTempPincode(pincode);
              }}
            />
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default FireNOCPropertyLocationDetails;
