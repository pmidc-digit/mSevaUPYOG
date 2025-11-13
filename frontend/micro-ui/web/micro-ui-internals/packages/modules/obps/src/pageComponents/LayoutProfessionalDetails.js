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
  CardLabelError,
} from "@mseva/digit-ui-react-components";

const LayoutProfessionalDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem("CITIZEN.CITY")
  const stateId = Digit.ULBService.getStateId()

  // const userInfo = Digit.UserService.getUser();
  //console.log("userInfo here", userInfo);

  const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject")
  const userInfoData = userInfos ? JSON.parse(userInfos) : {}
  const userInfo = userInfoData?.value
  const requestor = userInfo?.info?.mobileNumber

  // Extract roles safely
  const roles = userInfo?.info?.roles?.map((role) => role.code?.toUpperCase()) || []

  // Check if user is architect
  const isArchitect = roles.includes("BPA_ARCHITECT") || roles.includes("ARCHITECT")

  // Set tenant based on role
  const finalTenantId = isArchitect ? "pb.punjab" : tenantId

  const { data, isLoading, revalidate } = Digit.Hooks.obps.useBPAREGSearch(
    finalTenantId,
    {},
    { mobileNumber: requestor },
    { cacheTime: 0 },
  )

  const [formattedDate, setFormattedDate] = useState("")

  console.log(data, "DATAAA")

  useEffect(() => {
    if (data && data.Licenses) {
      const bpaData = data.Licenses[0] // Get first record

      console.log(bpaData, "BPA DATA")

      if (bpaData.validTo) {
        const date = new Date(bpaData.validTo)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const formattedDate = `${year}-${month}-${day}` // Changed to YYYY-MM-DD
        setFormattedDate(formattedDate)
        setValue("professionalRegistrationValidity", formattedDate)
        console.log("[v0] Formatted date:", formattedDate) // Debug log
      }

      // You can also map other fields if needed
      if (bpaData.address) {
        setValue("professionalAddress", bpaData.address)
      }
    }
  }, [setValue, data])

  useEffect(() => {
    console.log("currentStepData2", currentStepData)
    const formattedData = currentStepData?.applicationDetails
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value)
      })
    }
  }, [currentStepData, setValue])

  const { data: allCities, isLoading: isAllCitiesLoading } = Digit.Hooks.obps.useTenants()
  const [cities, setCities] = useState(allCities)
  // const { data: LicenseDataDynamic, isLoading: isLoadingDynamic } = Digit.Hooks.obps.useBPAREGSearch(tenantId, {}, params);

  useEffect(() => {
    const formattedData = currentStepData?.applicationDetails
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => setValue(key, value))
    }
  }, [currentStepData, setValue])

useEffect(() => {
  console.log("[v0] ProfessionalDetails - currentStepData:", currentStepData);
  const formattedData = currentStepData?.applicationDetails;
  if (formattedData) {
    console.log("[v0] Setting professional details:", formattedData);
    Object.entries(formattedData).forEach(([key, value]) => {
      setValue(key, value);
    });
  }
}, [currentStepData?.applicationDetails, setValue]);
  console.log("first page")
  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_PROFESSIONAL_DETAILS")}</CardSectionHeader>

      <LabelFieldPair>
        <CardLabel>{`${t("BPA_PROFESSIONAL_NAME_LABEL")}`}*</CardLabel>
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
                  props.onChange(e.target.value)
                }}
                onBlur={(e) => {
                  props.onBlur(e)
                }}
                t={t}
                disabled="true"
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>
        {errors?.professionalName ? errors.professionalName.message : ""}
      </CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_EMAIL_LABEL")}`}*</CardLabel>
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
                  props.onChange(e.target.value)
                }}
                onBlur={(e) => {
                  props.onBlur(e)
                }}
                t={t}
                disabled="true"
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalEmailId?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")}`}*</CardLabel>
        <div className="field">
          <Controller
            control={control}
            defaultValue={userInfo?.info?.id || ""}
            name="professionalRegId"
            rules={{
              required: t("REQUIRED_FIELD"),
              // pattern: {
              //   value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              //   message: t("INVALID_EMAIL_FORMAT"),
              // },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value)
                }}
                onBlur={(e) => {
                  props.onBlur(e)
                }}
               
              
                disabled="true"
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalRegId?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_MOBILE_NO_LABEL")}`}*</CardLabel>
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
            render={(props) => (
              <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} disable="true" />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalMobileNumber?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_ADDRESS_LABEL")}`}*</CardLabel>
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
                  props.onChange(e.target.value)
                }}
                onBlur={(e) => {
                  props.onBlur(e)
                }}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalAddress?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REG_VALIDITY_LABEL")}`}*</CardLabel>
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
                  props.onChange(e.target.value)
                }}
                onBlur={(e) => {
                  props.onBlur(e)
                }}
                 disabled="true"
                min={new Date().toISOString().split("T")[0]}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalRegistrationValidity?.message || ""}</CardLabelError>
    </React.Fragment>
  )
}

export default LayoutProfessionalDetails
