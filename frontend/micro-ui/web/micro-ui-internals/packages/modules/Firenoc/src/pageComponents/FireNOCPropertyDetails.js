import React, { useMemo } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  Dropdown,
  CardSectionHeader,
  RadioButtons,
} from "@mseva/digit-ui-react-components";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px" };

const noOfFloorsOptions = Array.from({ length: 20 }, (_, i) => ({
  code: String(i + 1),
  name: String(i + 1),
}));

const noOfBasementsOptions = [
  { code: "0", name: "0" },
  { code: "1", name: "1" },
  { code: "2", name: "2" },
  { code: "3", name: "3" },
  { code: "4", name: "4" },
  { code: "5", name: "5" },
];

const emptyBuilding = {
  buildingName: "",
  buildingUsageType: null,
  buildingUsageSubType: null,
  noOfFloors: null,
  noOfBasements: null,
  groundFloorBuiltupArea: "",
  heightOfBuilding: "",
  landArea: "",
  totalCoveredArea: "",
  parkingArea: "",
  leftSurrounding: "",
  rightSurrounding: "",
  frontSurrounding: "",
  backSurrounding: "",
};

const FireNOCPropertyDetails = (_props) => {
  const { t, Controller, control, errors, watch, useFieldArray, setValue } = _props;

  const stateId = Digit.ULBService.getStateId();

  const { fields: buildingFields, append: addBuilding, remove: removeBuilding } = useFieldArray({
    control,
    name: "buildings",
  });

  const noOfBuildings = watch("noOfBuildings");

  const { data: buildingTypeData } = Digit.Hooks.useCustomMDMS(stateId, "firenoc", [{ name: "BuildingType" }], {
    select: (d) => d?.firenoc?.BuildingType?.filter((bt) => bt.active) || [],
  });

  const buildingUsageTypeOptions = useMemo(() => {
    if (!buildingTypeData?.length) return [];
    return buildingTypeData.map((t) => ({ code: t.code, name: t.name || t.code }));
  }, [buildingTypeData]);

  const getSubTypeOptions = (selectedType) => {
    if (!buildingTypeData?.length || !selectedType) return [];
    const type = buildingTypeData.find((t) => t.code === selectedType.code);
    if (!type?.BuildingSubType?.length) return [];
    return type.BuildingSubType.filter((s) => s.active).map((s) => ({ code: s.code, name: s.name || s.code }));
  };

  const renderBuildingCard = (field, index) => {
    const prefix = `buildings.${index}`;
    const isMultiple = noOfBuildings === "MULTIPLE";
    const selectedUsageType = watch(`${prefix}.buildingUsageType`);
    const subTypeOptions = getSubTypeOptions(selectedUsageType);

    return (
      <div key={field.id} className="employeeCard" style={{ position: "relative", marginBottom: "16px" }}>
        {isMultiple && (
          <span
            onClick={() => removeBuilding(index)}
            style={{ position: "absolute", top: "12px", right: "16px", fontSize: "22px", cursor: "pointer", color: "#555" }}
            title={t("Remove")}
          >
            &times;
          </span>
        )}

        {/* Row 1: Building Name + Usage Type */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Name of the Building")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.buildingName`} rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Name of the Building")} />
                )}
              />
              {errors?.buildings?.[index]?.buildingName && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].buildingName.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Building Usage Type as per NBC")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.buildingUsageType`} rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown className="form-field" select={(val) => { props.onChange(val); setValue(`${prefix}.buildingUsageSubType`, null); }} selected={props.value} option={buildingUsageTypeOptions} optionKey="name" t={t} placeholder={t("Select Building Usage Type")} />
                )}
              />
              {errors?.buildings?.[index]?.buildingUsageType && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].buildingUsageType.message}</p>}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 2: Usage Subtype + No of Floors */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Building Usage Subtype as per NBC")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.buildingUsageSubType`} rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={subTypeOptions} optionKey="name" t={t} placeholder={t("Select Building Usage Subtype")} />
                )}
              />
              {errors?.buildings?.[index]?.buildingUsageSubType && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].buildingUsageSubType.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("No of Floors")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.noOfFloors`} rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={noOfFloorsOptions} optionKey="name" t={t} placeholder={t("Select No. of Floors")} />
                )}
              />
              {errors?.buildings?.[index]?.noOfFloors && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].noOfFloors.message}</p>}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 3: No of Basements + Ground floor builtup area */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("No. Of Basements")}</CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.noOfBasements`}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={noOfBasementsOptions} optionKey="name" t={t} placeholder={t("Select No. Of Basements")} />
                )}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Ground floor builtup area(in sq. meter)")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.groundFloorBuiltupArea`}
                rules={{ required: t("REQUIRED_FIELD"), pattern: { value: /^[0-9]*\.?[0-9]+$/, message: t("ONLY_NUMERIC_VALUES_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Ground floor builtup area(in sq. meter)")} />
                )}
              />
              {errors?.buildings?.[index]?.groundFloorBuiltupArea && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].groundFloorBuiltupArea.message}</p>}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 4: Height of Building + Land Area */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Height of the Building from Ground level (in meters)")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.heightOfBuilding`}
                rules={{ required: t("REQUIRED_FIELD"), pattern: { value: /^[0-9]*\.?[0-9]+$/, message: t("ONLY_NUMERIC_VALUES_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Height of the Building in meters")} />
                )}
              />
              {errors?.buildings?.[index]?.heightOfBuilding && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].heightOfBuilding.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Land Area (in Sq meters)")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.landArea`}
                rules={{ required: t("REQUIRED_FIELD"), pattern: { value: /^[0-9]*\.?[0-9]+$/, message: t("ONLY_NUMERIC_VALUES_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Land Area of the building (in Sq meters)")} />
                )}
              />
              {errors?.buildings?.[index]?.landArea && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].landArea.message}</p>}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 5: Total Covered Area + Parking Area */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Total Covered Area (in Sq meters)")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.totalCoveredArea`}
                rules={{ required: t("REQUIRED_FIELD"), pattern: { value: /^[0-9]*\.?[0-9]+$/, message: t("ONLY_NUMERIC_VALUES_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Total Covered Area (in Sq meters)")} />
                )}
              />
              {errors?.buildings?.[index]?.totalCoveredArea && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].totalCoveredArea.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Parking Area (in Sq meters)")}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.parkingArea`}
                rules={{ required: t("REQUIRED_FIELD"), pattern: { value: /^[0-9]*\.?[0-9]+$/, message: t("ONLY_NUMERIC_VALUES_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Parking Area (in Sq meters)")} />
                )}
              />
              {errors?.buildings?.[index]?.parkingArea && <p style={{ color: "red", marginTop: "4px" }}>{errors.buildings[index].parkingArea.message}</p>}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 6: Left surrounding + Right surrounding */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Left surrounding")}</CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.leftSurrounding`}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Left surrounding")} />
                )}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Right surrounding")}</CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.rightSurrounding`}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Right surrounding")} />
                )}
              />
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 7: Front surrounding + Back surrounding */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Front surrounding")}</CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.frontSurrounding`}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Front surrounding")} />
                )}
              />
            </div>
          </LabelFieldPair>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Back surrounding")}</CardLabel>
            <div className="field">
              <Controller control={control} name={`${prefix}.backSurrounding`}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Back surrounding")} />
                )}
              />
            </div>
          </LabelFieldPair>
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      <div className="employeeCard">
        <CardSectionHeader>{t("Property Details")}</CardSectionHeader>

        {/* No. of Buildings radio */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t("No. of Buildings")}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller control={control} name="noOfBuildings"
              render={(props) => (
                <RadioButtons
                  selectedOption={props.value}
                  onSelect={(val) => {
                    props.onChange(val);
                    if (val === "SINGLE" && buildingFields.length > 1) {
                      for (let i = buildingFields.length - 1; i > 0; i--) removeBuilding(i);
                    }
                  }}
                  options={["SINGLE", "MULTIPLE"]}
                  optionsKey=""
                  labelKey=""
                  innerStyles={{ display: "flex", gap: "24px" }}
                  customLabelMarkup={(opt) => (
                    <span>{opt === "SINGLE" ? t("Single Building") : t("Multiple Buildings")}</span>
                  )}
                />
              )}
            />
          </div>
        </LabelFieldPair>
      </div>

      {/* Building Cards */}
      {buildingFields.map((field, index) => renderBuildingCard(field, index))}

      {/* Add Building button (only for multiple) */}
      {noOfBuildings === "MULTIPLE" && (
        <div style={{ textAlign: "right", marginBottom: "16px" }}>
          <span
            onClick={() => addBuilding({ ...emptyBuilding })}
            style={{ color: "#a82227", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
          >
            + {t("ADD BUILDING")}
          </span>
        </div>
      )}
    </React.Fragment>
  );
};

export default FireNOCPropertyDetails;
