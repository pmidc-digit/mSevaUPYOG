import React, { useEffect, useMemo } from "react";
import {
  LabelFieldPair,
  TextInput,
  TextArea,
  CardLabel,
  CardSectionHeader,
  Dropdown,
  RadioButtons,
} from "@mseva/digit-ui-react-components";

const twoColRow = { display: "flex", gap: "24px", flexWrap: "wrap" };
const colItem = { flex: 1, minWidth: "250px" };

const relationshipOptions = [
  { code: "FATHER", i18nKey: "Father" },
  { code: "HUSBAND", i18nKey: "Husband" },
];

/* ───── empty‑owner templates ───── */
const emptyIndividualOwner = () => ({
  mobileNumber: "",
  name: "",
  gender: null,
  dateOfBirth: "",
  emailId: "",
  fatherOrHusbandName: "",
  relationship: null,
  panNo: "",
  address: "",
});

const emptyInstitutionalOwner = () => ({
  institutionName: "",
  officialTelNo: "",
  authorizedPersonName: "",
  designation: "",
  mobileNumber: "",
  emailId: "",
  officialAddress: "",
});

/* ════════════════════════════════════════════════════════
   FireNOCApplicantDetails  (sub‑component)
   Receives commonProps from the step‑wrapper.
   ════════════════════════════════════════════════════════ */
const FireNOCApplicantDetails = (_props) => {
  const {
    t,
    Controller,
    control,
    setValue,
    errors,
    watch,
    useFieldArray,
    currentStepData,
    reset,
    getValues,
  } = _props;

  const stateId = Digit.ULBService.getStateId();

  /* ─── gender MDMS ─── */
  const { data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);
  const genderMenu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((d) => d.active).forEach((g) => {
      genderMenu.push({ i18nKey: `COMMON_GENDER_${g.code}`, code: g.code, value: g.code });
    });

  /* ─── OwnerShipCategory MDMS ─── */
  const { data: ownerShipData } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "OwnerShipCategory" }], {
    select: (d) => d?.["common-masters"]?.OwnerShipCategory?.filter((e) => e.active) || [],
  });

  /* ─── watched values ─── */
  const applicantType = watch("applicantType");
  const applicantSubtype = watch("applicantSubtype");

  /* Derive applicant type options (unique first segments) */
  const applicantTypeOptions = useMemo(() => {
    if (!ownerShipData?.length) return [];
    const typeMap = {};
    ownerShipData.forEach((entry) => {
      const mainCode = entry.code.split(".")[0];
      if (!typeMap[mainCode]) {
        const isInst = mainCode.startsWith("INSTITUTIONAL");
        typeMap[mainCode] = {
          code: mainCode,
          name: t(`COMMON_MASTERS_OWNERSHIPCATEGORY_${mainCode}`),
          group: isInst ? "INSTITUTIONAL" : "INDIVIDUAL",
        };
      }
    });
    return Object.values(typeMap);
  }, [ownerShipData, t]);

  /* Derive subtype options based on selected applicant type */
  const subtypeOptions = useMemo(() => {
    if (!ownerShipData?.length || !applicantType?.code) return [];
    return ownerShipData
      .filter((e) => e.code.split(".")[0] === applicantType.code && e.code.includes("."))
      .map((e) => ({
        code: e.code,
        name: t(`COMMON_MASTERS_OWNERSHIPCATEGORY_${e.code.replaceAll(".", "_")}`),
      }));
  }, [ownerShipData, applicantType?.code, t]);

  /* ─── useFieldArray for owners ─── */
  const { fields, append, remove } = useFieldArray({ control, name: "owners" });

  const isIndividual = applicantType?.code === "INDIVIDUAL" || applicantType?.group === "INDIVIDUAL";
  const isInstitutional = applicantType?.group === "INSTITUTIONAL";
  const isMultipleOwner = applicantSubtype?.code?.includes("MULTIPLEOWNERS");

  /* ─── Reset owners when applicant type OR sub‑type changes ─── */
  useEffect(() => {
    if (!applicantType) return;
    const currentOwners = getValues("owners");
    if (isIndividual) {
      // keep at least one individual owner
      if (!currentOwners?.length || currentOwners[0]?.institutionName !== undefined) {
        setValue("owners", [emptyIndividualOwner()]);
      }
    } else if (isInstitutional) {
      if (!currentOwners?.length || currentOwners[0]?.institutionName === undefined) {
        setValue("owners", [emptyInstitutionalOwner()]);
      }
    }
  }, [applicantType?.code]);

  /* When switching from Multiple → Single, trim to first owner */
  useEffect(() => {
    if (isIndividual && applicantSubtype && !isMultipleOwner) {
      const current = getValues("owners");
      if (current?.length > 1) {
        setValue("owners", [current[0]]);
      }
    }
  }, [applicantSubtype?.code]);

  /* ─── Hydrate from redux on mount ─── */
  useEffect(() => {
    const saved = currentStepData?.applicationDetails;
    if (!saved) return;
    if (saved.applicantType) setValue("applicantType", saved.applicantType);
    if (saved.applicantSubtype) setValue("applicantSubtype", saved.applicantSubtype);
    if (Array.isArray(saved.owners) && saved.owners.length) {
      setValue("owners", saved.owners);
    }
  }, []);

  /* ════════════════  RENDER HELPERS  ════════════════ */

  /* ─── Individual owner card ─── */
  const renderIndividualOwner = (field, index) => {
    const prefix = `owners.${index}`;
    return (
      <div key={field.id} className="employeeCard" style={{ position: "relative", marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">
          {index === 0 ? t("Applicant Information") : `${t("Applicant")} ${index + 1}`}
        </CardSectionHeader>

        {/* × delete */}
        {isMultipleOwner && fields.length > 1 && (
          <span
            onClick={() => remove(index)}
            style={{ position: "absolute", top: "12px", right: "16px", fontSize: "22px", cursor: "pointer", color: "#555" }}
            title={t("Remove")}
          >
            &times;
          </span>
        )}

        {/* Row 1: Mobile + Name */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Mobile Number")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.mobileNumber`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: { value: /^[6-9]\d{9}$/, message: t("INVALID_MOBILE_NUMBER") },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Mobile Number")} />
                )}
              />
              {errors?.owners?.[index]?.mobileNumber && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].mobileNumber.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Name")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.name`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Name")} />
                )}
              />
              {errors?.owners?.[index]?.name && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].name.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 2: Gender + DOB */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Gender")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.gender`}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <RadioButtons
                    t={t}
                    options={genderMenu}
                    optionsKey="code"
                    value={props.value}
                    selectedOption={props.value}
                    onSelect={(e) => props.onChange(e)}
                    isDependent={true}
                    style={{ display: "flex", gap: "16px" }}
                  />
                )}
              />
              {errors?.owners?.[index]?.gender && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].gender.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Date Of Birth")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.dateOfBirth`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    const today = new Date();
                    const dob = new Date(value);
                    const age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    const d = today.getDate() - dob.getDate();
                    const is18 = age > 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                    return is18 || t("DOB_MUST_BE_18_YEARS_OLD");
                  },
                }}
                render={(props) => (
                  <TextInput
                    type="date"
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value)}
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                  />
                )}
              />
              {errors?.owners?.[index]?.dateOfBirth && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].dateOfBirth.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 3: Email + Father/Husband Name */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("Email")}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.emailId`}
                rules={{
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+\.[A-Za-z]{2,}$/,
                    message: t("INVALID_EMAIL_FORMAT"),
                  },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Email")} />
                )}
              />
              {errors?.owners?.[index]?.emailId && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].emailId.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Father/Husband's Name")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.fatherOrHusbandName`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: { value: /^[A-Za-z\s]+$/, message: t("ONLY_ENGLISH_LETTERS_ALLOWED") },
                  maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Father/Husband's Name")} />
                )}
              />
              {errors?.owners?.[index]?.fatherOrHusbandName && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].fatherOrHusbandName.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 4: Relationship + PAN No */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Relationship")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.relationship`}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <RadioButtons
                    t={t}
                    options={relationshipOptions}
                    optionsKey="i18nKey"
                    value={props.value}
                    selectedOption={props.value}
                    onSelect={(e) => props.onChange(e)}
                    isDependent={true}
                    style={{ display: "flex", gap: "16px" }}
                  />
                )}
              />
              {errors?.owners?.[index]?.relationship && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].relationship.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">{t("PAN No.")}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.panNo`}
                rules={{
                  pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: t("INVALID_PAN_FORMAT") },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value.toUpperCase())}
                    placeholder={t("Enter PAN No.")}
                    maxLength={10}
                  />
                )}
              />
              {errors?.owners?.[index]?.panNo && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].panNo.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 5: Correspondence Address (full width) */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t("Correspondence Address")}<span className="requiredField">*</span>
          </CardLabel>
          <div className="field">
            <Controller
              control={control}
              name={`${prefix}.address`}
              rules={{
                required: t("REQUIRED_FIELD"),
                maxLength: { value: 256, message: t("MAX_256_CHARACTERS_ALLOWED") },
              }}
              render={(props) => (
                <TextArea
                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                  placeholder={t("Enter Correspondence Address")}
                />
              )}
            />
            {errors?.owners?.[index]?.address && (
              <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].address.message}</p>
            )}
          </div>
        </LabelFieldPair>
      </div>
    );
  };

  /* ─── Institutional owner card ─── */
  const renderInstitutionalOwner = (field, index) => {
    const prefix = `owners.${index}`;
    return (
      <div key={field.id} className="employeeCard" style={{ position: "relative", marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">{t("Institution Details")}</CardSectionHeader>

        {/* Row 1: Institution Name + Official Tel */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Name of Institution")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.institutionName`}
                rules={{ required: t("REQUIRED_FIELD"), maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Name of Institution")} />
                )}
              />
              {errors?.owners?.[index]?.institutionName && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].institutionName.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Official Telephone No.")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.officialTelNo`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: { value: /^[0-9]{6,15}$/, message: t("INVALID_TELEPHONE_NUMBER") },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Official Telephone No.")} />
                )}
              />
              {errors?.owners?.[index]?.officialTelNo && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].officialTelNo.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 2: Authorized Person Name + Designation */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Name of Authorized Person")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.authorizedPersonName`}
                rules={{ required: t("REQUIRED_FIELD"), maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Authorized Person Name")} />
                )}
              />
              {errors?.owners?.[index]?.authorizedPersonName && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].authorizedPersonName.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Designation in Institution")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.designation`}
                rules={{ required: t("REQUIRED_FIELD"), maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") } }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Designation")} />
                )}
              />
              {errors?.owners?.[index]?.designation && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].designation.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 3: Mobile + Email */}
        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Mobile No. of Authorized Person")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.mobileNumber`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: { value: /^[6-9]\d{9}$/, message: t("INVALID_MOBILE_NUMBER") },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Mobile Number")} />
                )}
              />
              {errors?.owners?.[index]?.mobileNumber && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].mobileNumber.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Email of Authorized Person")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={`${prefix}.emailId`}
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*[A-Za-z0-9-]+\.[A-Za-z]{2,}$/,
                    message: t("INVALID_EMAIL_FORMAT"),
                  },
                }}
                render={(props) => (
                  <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={t("Enter Email")} />
                )}
              />
              {errors?.owners?.[index]?.emailId && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].emailId.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>

        {/* Row 4: Official Correspondence Address */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t("Official Correspondence Address")}<span className="requiredField">*</span>
          </CardLabel>
          <div className="field">
            <Controller
              control={control}
              name={`${prefix}.officialAddress`}
              rules={{ required: t("REQUIRED_FIELD"), maxLength: { value: 256, message: t("MAX_256_CHARACTERS_ALLOWED") } }}
              render={(props) => (
                <TextArea
                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                  placeholder={t("Enter Official Correspondence Address")}
                />
              )}
            />
            {errors?.owners?.[index]?.officialAddress && (
              <p style={{ color: "red", marginTop: "4px" }}>{errors.owners[index].officialAddress.message}</p>
            )}
          </div>
        </LabelFieldPair>
      </div>
    );
  };

  /* ════════════════  MAIN RENDER  ════════════════ */
  return (
    <React.Fragment>
      {/* Applicant Type + Subtype (always visible) */}
      <div className="employeeCard" style={{ marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">{t("Applicant Details")}</CardSectionHeader>

        <div style={twoColRow}>
          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Applicant Type")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantType"
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    option={applicantTypeOptions}
                    optionKey="name"
                    select={(val) => {
                      props.onChange(val);
                      setValue("applicantSubtype", null);
                    }}
                    selected={props.value}
                    t={t}
                    placeholder={t("Select Applicant Type")}
                  />
                )}
              />
              {errors?.applicantType && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.applicantType.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={colItem}>
            <CardLabel className="card-label-smaller">
              {t("Type of Applicant Subtype")}<span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantSubtype"
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    option={subtypeOptions}
                    optionKey="name"
                    select={props.onChange}
                    selected={props.value}
                    t={t}
                    placeholder={t("Select Subtype")}
                    disable={!applicantType}
                  />
                )}
              />
              {errors?.applicantSubtype && (
                <p style={{ color: "red", marginTop: "4px" }}>{errors.applicantSubtype.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>
      </div>

      {/* Owner cards – rendered only after type + subtype are selected */}
      {applicantType && applicantSubtype && (
        <React.Fragment>
          {isIndividual && fields.map((field, idx) => renderIndividualOwner(field, idx))}
          {isInstitutional && fields.map((field, idx) => renderInstitutionalOwner(field, idx))}

          {/* + ADD APPLICANT (only for Multiple Owner) */}
          {isIndividual && isMultipleOwner && (
            <div style={{ marginTop: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => append(emptyIndividualOwner())}
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "1px dashed #505A5F",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  color: "#FFF",
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                  fontWeight: 600,
                }}
              >
                {`+ ${t("ADD APPLICANT")}`}
              </button>
            </div>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default FireNOCApplicantDetails;
