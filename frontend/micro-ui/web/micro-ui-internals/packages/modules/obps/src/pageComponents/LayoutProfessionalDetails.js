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
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();

  const userInfo = Digit.UserService.getUser();
  //console.log("userInfo here", userInfo);

  useEffect(() => {
    const fetchTLServiceData = async () => {
      try {
        const storedUserInfo = localStorage.getItem("user-info")
        if (!storedUserInfo) {
          console.log("  No userInfo in localStorage")
          return
        }

        const parsedUserInfo = JSON.parse(storedUserInfo)
        const mobileNumber = parsedUserInfo?.mobileNumber

        if (mobileNumber && Digit?.TLService) {
          const params = {
            tenantId: parsedUserInfo?.tenantId || tenantId || "pb",
            mobileNumber: mobileNumber,
          }
          const config = {}

          console.log("  TL Service params:", params)
          const data = await Digit.TLService.search(params, config)
          console.log("  TL Service response:", data)
          // Process the data as needed
        }
      } catch (error) {
        console.error("  Error fetching TL Service data:", error)
      }
    }

    fetchTLServiceData()
  }, [tenantId])


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

  
  
console.log("first page");
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
      <CardLabelError style={errorStyle}>{errors?.professionalName ? errors.professionalName.message : ""}</CardLabelError>

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
      <CardLabelError style={errorStyle}>{errors?.professionalEmailId?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")}`}*</CardLabel>
        <div className="field">
          <Controller
            control={control}
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
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
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
            render={(props) => <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} disable="true"/>}
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
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
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
                    rules={{ 
                      required: t("REQUIRED_FIELD") ,
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
                        min={new Date().toISOString().split("T")[0]}
                      />
                    )}
                  />
            </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.professionalRegistrationValidity?.message || ""}</CardLabelError>
    </React.Fragment>
  );
};

export default LayoutProfessionalDetails;
