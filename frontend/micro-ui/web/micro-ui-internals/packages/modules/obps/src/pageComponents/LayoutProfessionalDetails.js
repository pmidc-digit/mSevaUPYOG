

import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  Loader,
} from "@mseva/digit-ui-react-components";

const LayoutProfessionalDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  const [getCounsilNo, setGetCounsilNo] = useState("");

  // const userInfo = Digit.UserService.getUser();
  //console.log("userInfo here", userInfo);

  const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  const userInfoData = userInfos ? JSON.parse(userInfos) : {};
  const userInfo = userInfoData?.value;
  const requestor = userInfo?.info?.mobileNumber;

  // Extract roles safely
  const roles = userInfo?.info?.roles?.map((role) => role.code?.toUpperCase()) || [];

  // Check if user is architect
  const isArchitect = roles.includes("BPA_ARCHITECT") || roles.includes("ARCHITECT");

  // Set tenant based on role
  const finalTenantId = isArchitect ? "pb.punjab" : tenantId;

  const { data, isLoading, revalidate } = Digit.Hooks.obps.useBPAREGSearch(finalTenantId, {}, { mobileNumber: requestor }, { cacheTime: 0 });

  const [formattedDate, setFormattedDate] = useState("");
  const [expiredDate, setExpiredDate] = useState(""); // Store expired date for display
  const [licenseStatus, setLicenseStatus] = useState(null); // Track license status (APPROVED, EXPIRED, etc.)

  console.log(data, "DATAAA");

  useEffect(() => {
    if (data && data.Licenses && data.Licenses.length > 0) {
      // First check for APPROVED license
      const approvedLicense = data.Licenses.find((license) => license.status === "APPROVED");
      
      // If no approved license, check for EXPIRED
      const expiredLicense = data.Licenses.find((license) => license.status === "EXPIRED");
      
      if (approvedLicense) {
        setLicenseStatus("APPROVED");
        const bpaData = approvedLicense;
        const councilNo = bpaData?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo;
        setGetCounsilNo(councilNo);
        if (councilNo) {
          setValue("professionalRegId", councilNo);
        }
        console.log(bpaData, "BPA DATA - APPROVED");

        if (bpaData.validTo) {
          const date = new Date(bpaData.validTo);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const formattedDate = `${year}-${month}-${day}`;
          setFormattedDate(formattedDate);
          setValue("professionalRegistrationValidity", formattedDate);
          console.log("  Formatted date:", formattedDate);
        }

        if (bpaData?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || bpaData?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress) {
          console.log("ProfessionalsAddress",bpaData)
          const professionalAddress = bpaData?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || bpaData?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress;
          setValue("professionalAddress", professionalAddress);
        }
      } else if (expiredLicense) {
        setLicenseStatus("EXPIRED");
        const bpaData = expiredLicense;
        const councilNo = bpaData?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo;
        setGetCounsilNo(councilNo);
        if (councilNo) {
          setValue("professionalRegId", councilNo);
        }
        console.log(bpaData, "BPA DATA - EXPIRED");

        if (bpaData.validTo) {
          const date = new Date(bpaData.validTo);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const expiredDateFormatted = `${day}-${month}-${year}`; // DD-MM-YYYY for display
          setExpiredDate(expiredDateFormatted);
          // Do NOT set the value in the input field for expired license
          setValue("professionalRegistrationValidity", "");
        }

        if (bpaData?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || bpaData?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress) {
          const professionalAddress = bpaData?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || bpaData?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress;
          setValue("professionalAddress", professionalAddress);
        }
      } else {
        console.log("No APPROVED or EXPIRED license found");
        setLicenseStatus(null);
      }
    }
  }, [setValue, data]);

  useEffect(() => {
    console.log("currentStepData2", currentStepData);
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  const { data: allCities, isLoading: isAllCitiesLoading } = Digit.Hooks.obps.useTenants();
  const [cities, setCities] = useState(allCities);
  // const { data: LicenseDataDynamic, isLoading: isLoadingDynamic } = Digit.Hooks.obps.useBPAREGSearch(tenantId, {}, params);

  useEffect(() => {
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => setValue(key, value));
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    console.log("  ProfessionalDetails - currentStepData:", currentStepData);
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      console.log("  Setting professional details:", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData?.applicationDetails, setValue]);
  console.log("first page");

  const [userPhoto, setUserPhoto] = useState(null);
  const [documents, setDocuments] = useState({});

  // Fetch professional photo from license data
  useEffect(() => {
    if (data?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.photo) {
      const photoFileStoreId = data?.Licenses[0]?.tradeLicenseDetail?.owners[0]?.photo;
      console.log("photoFileStoreId:", photoFileStoreId);
      Digit.UploadServices.Filefetch([photoFileStoreId], tenantId.split(".")[0]).then((res) => {
        console.log("Photo fetch response:", res);
        setDocuments(res?.data);
        if (res?.data?.[photoFileStoreId]) {
          const photoUrl = res.data[photoFileStoreId]?.split(",")[0];
          console.log("Setting photo URL:", photoUrl);
          setUserPhoto(photoUrl);
        }
      }).catch((err) => {
        console.error("Error fetching photo:", err);
      });
    }
  }, [data, tenantId]);

  console.log("VVVVVVV", userInfo);
  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_PROFESSIONAL_DETAILS")}</CardSectionHeader>
      {/* <div>

  
      {userPhoto && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px", marginTop: "20px" }}>
          <div style={{ position: "relative", width: "120px" }}>
            <img
              src={userPhoto}
              alt="Professional Photo"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #ccc",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "14px",
                fontWeight: "500",
                width: "150px",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userInfo?.info?.name}
            </div>
          </div>
        </div>
      )}
          </div> */}

      {isLoading? <Loader /> : <div>
      <LabelFieldPair>
        <CardLabel>{`${t("BPA_PROFESSIONAL_NAME_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalName"
            defaultValue={userInfo?.info?.name}
            rules={{
              required: t("REQUIRED_FIELD"),
              minLength: {
                value: 4,
                message: t("MIN_4_CHARACTERS_REQUIRED"),
              },
              maxLength: {
                value: 100,
                message: t("MAX_100_CHARACTERS_ALLOWED"),
              },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
                disabled="true"
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors?.professionalName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.professionalName.message}</p>}

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_EMAIL_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalEmailId"
            defaultValue={userInfo?.info?.emailId}
            rules={{
              required: t("REQUIRED_FIELD"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("INVALID_EMAIL_FORMAT"),
              },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
                disabled="true"
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors?.professionalEmailId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.professionalEmailId.message}</p>}

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalRegId"
            rules={{ required: t("REQUIRED_FIELD") }}
            render={(props) => (
              <TextInput
                value={props.value || ""}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={props.onBlur}
                t={t}
                disabled={!!getCounsilNo} // <-- Disable only when value exists
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors?.professionalRegId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.professionalRegId.message}</p>}

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_MOBILE_NO_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalMobileNumber"
            defaultValue={userInfo?.info?.mobileNumber}
            rules={{
              required: t("REQUIRED_FIELD"),
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: t("INVALID_MOBILE_NUMBER"),
              },
            }}
            render={(props) => <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} disable="true" />}
          />
        </div>
      </LabelFieldPair>
      {errors?.professionalMobileNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.professionalMobileNumber.message}</p>}

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_ADDRESS_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalAddress"
            rules={{
              required: t("REQUIRED_FIELD"),
              minLength: {
                value: 4,
                message: t("MIN_4_CHARACTERS_REQUIRED"),
              },
              maxLength: {
                value: 100,
                message: t("MAX_100_CHARACTERS_ALLOWED"),
              },
            }}
            render={(props) => (
              <TextArea
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
                disabled="true"
              />
            )}
          />
          {errors?.professionalAddress && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.professionalAddress.message}</p>}
        </div>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REG_VALIDITY_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalRegistrationValidity"
            defaultValue={formattedDate}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <TextInput
                type="date"
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                disabled="true"
                min={new Date().toISOString().split("T")[0]}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors?.professionalRegistrationValidity && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.professionalRegistrationValidity.message}</p>}
      {/* TODO: Uncomment when expired license feature is needed
      {licenseStatus === "EXPIRED" && expiredDate && (
        <span style={{ color: "red", fontSize: "14px", fontWeight: "bold", marginTop: "8px", display: "block" }}>
          {t("BPA_LICENSE_VALIDITY_EXPIRED")} on {expiredDate}
        </span>
      )}
      */}
      </div>}
    </React.Fragment>
  );
};

export default LayoutProfessionalDetails;

