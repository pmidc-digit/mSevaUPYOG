import React, { useState, useMemo } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  Dropdown,
  CardSectionHeader,
  LocationSearch,
} from "@mseva/digit-ui-react-components";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px" };

const areaTypeOptions = [
  { code: "URBAN", name: "Urban" },
  { code: "RURAL", name: "Rural" },
];

const FireNOCPropertyLocationDetails = (_props) => {
  const { t, Controller, control, setValue, errors, watch } = _props;
  const [showMap, setShowMap] = useState(false);

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

  // Eligible tenants = those that have a fire station
  const eligibleTenants = useMemo(() => {
    if (!allCities?.length || !fireStationData?.length) return [];
    const stationTenantIds = new Set(fireStationData.map((s) => s.baseTenantId));
    return allCities.filter((t) => stationTenantIds.has(t.code));
  }, [allCities, fireStationData]);

  // District options from eligible tenants
  const districtOptions = useMemo(() => {
    if (!eligibleTenants?.length) return [];
    const seen = new Set();
    return eligibleTenants.reduce((acc, tenant) => {
      const distCode = tenant?.city?.districtTenantCode;
      const distName = tenant?.city?.districtName;
      if (distCode && !seen.has(distCode)) {
        seen.add(distCode);
        acc.push({ code: distCode, name: distName || distCode });
      }
      return acc;
    }, []);
  }, [eligibleTenants]);

  // City options based on selected district
  const cityOptions = useMemo(() => {
    if (!eligibleTenants?.length || !selectedDistrict?.code) return [];
    return eligibleTenants
      .filter((t) => t?.city?.districtTenantCode === selectedDistrict.code)
      .map((t) => ({ code: t.code, name: t.name || t.code }));
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
      const station = fireStationData.find((s) => s.baseTenantId === val.code);
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
                <Dropdown className="form-field" select={(val) => handleDistrictChange(val, props.onChange)} selected={props.value} option={districtOptions} optionKey="name" t={t} placeholder={t("Select District")} />
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
          <CardLabel className="card-label-smaller">{t("Street Name")}</CardLabel>
          <div className="field">
            <Controller control={control} name="streetName"
              render={(props) => (
                <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Street Name")} />
              )}
            />
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

      {/* Row 4: Pincode */}
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
        <LabelFieldPair style={colItem} />
      </div>

      {/* Locate on Map */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller" style={{ color: "#a82227" }}>{t("Locate on Map")}</CardLabel>
        <div className="field">
          <Controller control={control} name="geoLocation"
            render={(props) => (
              <div
                onClick={() => setShowMap(!showMap)}
                style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#999", borderBottom: "1px dashed #ccc", paddingBottom: "8px" }}
              >
                <span>{props.value ? `${props.value.latitude}, ${props.value.longitude}` : t("Select your property location on map")}</span>
                <span style={{ fontSize: "20px" }}>&#8982;</span>
              </div>
            )}
          />
        </div>
      </LabelFieldPair>
      {showMap && (
        <div style={{ height: "300px", marginBottom: "16px" }}>
          <LocationSearch
            position={{}}
            onChange={(pincode, location) => {
              setValue("geoLocation", { latitude: location?.lat, longitude: location?.lng });
              if (pincode) setValue("pincode", pincode);
              setShowMap(false);
            }}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default FireNOCPropertyLocationDetails;
