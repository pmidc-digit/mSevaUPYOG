import React from "react";
import { useTranslation } from "react-i18next";
import { FormStep } from "@mseva/digit-ui-react-components";
import { MobileNumber } from "@mseva/digit-ui-react-components";

const MobileInput = ({ mobileNumber, onMobileChange, onSendOtp, canSubmit, step }) => {
  const { t } = useTranslation();
  return (
    <div className="input-wrapper">
      <div className="label">
        {t("CS_LOGIN_PROVIDE_MOBILE_NUMBER")}
        <span> *</span>
      </div>
      <FormStep
        isDisabled={!(mobileNumber?.length === 10 && canSubmit)}
        onSelect={onSendOtp}
        config={{
          texts: {
            // header: t("CS_LOGIN_PROVIDE_MOBILE_NUMBER"),
            submitBarLabel: t("CS_COMMONS_NEXT"),
          },
          submit: false,
        }}
        t={t}
        // componentInFront="+91"
        onChange={onMobileChange}
        value={mobileNumber}
        cardStyle={{
          backgroundColor: "transparent", // use transparent instead of none
          boxShadow: "none",
          WebkitBoxShadow: "none",
          padding: "0",
        }}
      >
        <div className={`input-wrapper ${step === "OTP" && !canSubmit ? "hide-submit-buttons" : ""}`}>
          <MobileNumber value={mobileNumber} onChange={onMobileChange} placeholder={t("CORE_COMMON_MOBILE_NUMBER")} />
        </div>
      </FormStep>
    </div>
  );
};

export default MobileInput;
