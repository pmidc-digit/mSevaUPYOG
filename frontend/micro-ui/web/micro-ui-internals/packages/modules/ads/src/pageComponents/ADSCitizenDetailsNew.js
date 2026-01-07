import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, MobileNumber, ActionBar, SubmitBar, TextArea, CardLabelError, Toast } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../../../challanGeneration/src/components/Loader";
import { UPDATE_ADSNewApplication_FORM } from "../redux/action/ADSNewApplicationActions";
import { useDispatch } from "react-redux";

const ADSCitizenDetailsNew = ({ t, goNext, currentStepData, configKey, onGoBack, onChange = () => {} }) => {
  const dispatch = useDispatch();
  const userInfo = Digit.UserService.getUser();
  const isCitizen = window.location.href.includes("citizen");
  const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");
  const { mobileNumber, emailId, name } = userInfo?.info;
  const [showToast, setShowToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: isCitizen ? name || "" : "",
      emailId: isCitizen ? emailId || "" : "",
      mobileNumber: isCitizen ? mobileNumber || "" : "",
      address: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (currentStepData?.CreatedResponse) {
      const created = currentStepData?.CreatedResponse;

      // If address info is stored in CreatedResponse
      if (created?.address) {
        setValue("address", created.address.addressLine1 || "");
        setValue("pincode", created.address.pincode || "");
      }

      // If applicant details also need to be prefilled
      if (created?.applicantDetail) {
        setValue("name", created.applicantDetail.applicantName || "");
        setValue("emailId", created.applicantDetail.applicantEmailId || "");
        setValue("mobileNumber", created.applicantDetail.applicantMobileNo || "");
      }
    }
  }, [currentStepData, setValue]);


  const onSubmit = async (data) => {
    const applicationDate = Date.now();
    const cartDetails = currentStepData?.ads?.flatMap((item) =>
      item.slots.map((slot) => ({
        ...slot,
        advertisementId: item.ad.id,
        status: "BOOKING_CREATED",
      }))
    );

    const formData = {
      tenantId,
      applicationDate,
      bookingStatus: "BOOKING_CREATED",
      businessService: "ADV",
      address: {
        pincode: data?.pincode || "",
        addressLine1: data?.address || "",
      },
      applicantDetail: {
        applicantName: data?.name || "",
        applicantEmailId: data?.emailId || "",
        applicantMobileNo: data?.mobileNumber || "",
        applicantDetailId: "",
      },
      owners: [
        {
          name: data?.name || "",
          mobileNumber: data?.mobileNumber || "",
          tenantId,
          type: "CITIZEN",
        },
      ],
      cartDetails,
      documents: [],
      workflow: {
        action: "INITIATE",
        comments: "Initial application submitted",
        status: "INITIATED",
        nextState: "",
      },
    };
    // ✅ If booking already exists, skip slot_search & create
    const existingBookingNo = currentStepData?.CreatedResponse?.bookingNo;
    if (existingBookingNo) {
      goNext(formData);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Prepare enriched slots for slot_search
      const enrichedSlots =
        currentStepData?.ads?.flatMap((item) =>
          item?.slots?.map((slot) => ({
            ...slot,
            isTimerRequired: true,
          }))
        ) ?? [];

      const payload = { advertisementSlotSearchCriteria: enrichedSlots };

      // 2. Call slot_search
      const slotResponse = await Digit.ADSServices.slot_search(payload, tenantId);

      if (!slotResponse) {
        setShowToast({ key: true, label: t("COMMON_SOMETHING_WENT_WRONG_LABEL") });
        return;
      }

      // 3. Store reservation expiry time
      const createTime = Date.now();
      dispatch(UPDATE_ADSNewApplication_FORM("reservationExpiry", createTime));

      // 4. Wait 2 seconds before create
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 5. Call create API
      const response = await Digit.ADSServices.create({ bookingApplication: formData }, tenantId);
      const status = response?.ResponseInfo?.status;
      const isSuccess = typeof status === "string" && status.toLowerCase() === "successful";

      if (isSuccess) {
        const appData = Array.isArray(response?.bookingApplication) ? response.bookingApplication[0] : response?.bookingApplication;

        dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", appData || response));
        goNext(formData);
      } else {
        setShowToast({ key: true, label: t("CORE_SOMETHING_WENT_WRONG") });
      }
    } catch (err) {
      setShowToast({ key: true, label: t("CORE_SOMETHING_WENT_WRONG") });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const errorStyle = { marginTop: "-18px", color: "red" };
  const mandatoryStyle = { color: "red" };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <div style={{ maxWidth: !isCitizen && "500px" }}>
        <CardLabel className="card-label-smaller">
          {`${t("ES_NEW_APPLICATION_APPLICANT_NAME")}`} <span style={mandatoryStyle}>*</span>{" "}
        </CardLabel>
        <Controller
          control={control}
          name="name"
          rules={{
            required: t("Applicant Name is Required"),
            pattern: {
              value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
              message: t("Applicant Name is Invalid"),
            },
            maxLength: { value: 100, message: "Maximum 100 characters" },
            minLength: { value: 2, message: "Minimum 2 characters" },
          }}
          render={({ value, onChange, onBlur }) => (
            <TextInput
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => {
                onBlur(e);
                trigger("name");
              }}
              t={t}
            />
          )}
        />
        {errors?.name && <CardLabelError style={errorStyle}>{errors?.name?.message}</CardLabelError>}

        <CardLabel>
          {t("NOC_APPLICANT_EMAIL_LABEL")}
          <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="emailId"
          rules={{
            required: t("PTR_EMAIL_REQUIRED"),
            pattern: { value: /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/, message: "Enter a valid email" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.emailId && <CardLabelError style={errorStyle}>{errors.emailId.message}</CardLabelError>}

        <CardLabel>
          {t("NOC_APPLICANT_MOBILE_NO_LABEL")}
          <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="mobileNumber"
          rules={{
            required: t("PTR_MOBILE_REQUIRED"),
            minLength: { value: 10, message: "Enter at least 10 digits" },
            pattern: { value: /^[6-9]\d{9}$/, message: "Must start with 9, 8, 7, or 6 and be 10 digits long" },
          }}
          render={({ value, onChange, onBlur }) => <MobileNumber value={value} onChange={onChange} onBlur={onBlur} t={t} />}
        />
        {errors.mobileNumber && <CardLabelError style={errorStyle}>{errors.mobileNumber.message}</CardLabelError>}

        {/* Address */}
        {/* <LabelFieldPair> */}
        <CardLabel className="card-label-smaller">
          {`${t("PT_COMMON_COL_ADDRESS")}`}
          <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="address"
            rules={{
              required: t("NDC_MESSAGE_ADDRESS"),
              pattern: {
                value: /^[A-Za-z0-9\s.,'/-]+$/,
                message: t("PTR_ADDRESS_INVALID"),
              },
              maxLength: { value: 500, message: "Maximum 500 characters" },
              minLength: { value: 5, message: "Minimum 5 characters" },
            }}
            render={({ value, onChange, onBlur }) => (
              <TextArea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={(e) => {
                  onBlur(e);
                  trigger("address");
                }}
                t={t}
              />
            )}
          />
        </div>
        {/* </LabelFieldPair> */}
        {errors?.address && <CardLabelError style={errorStyle}>{errors?.address?.message}</CardLabelError>}

        {/* Pincode */}
        {/* <LabelFieldPair> */}
        <CardLabel className="card-label-smaller">
          {`${t("CORE_COMMON_PINCODE")}`}
          <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="pincode"
            rules={{
              required: t("PTR_PINCODE_REQUIRED"),
              pattern: {
                value: /^[1-9][0-9]{5}$/,
                message: t("PTR_PINCODE_INVALID"),
              },
              minLength: { value: 6, message: t("PTR_PINCODE_MIN_LENGTH") },
              maxLength: { value: 6, message: t("PTR_PINCODE_MAX_LENGTH") },
            }}
            render={({ value, onChange, onBlur }) => (
              <TextInput
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                onBlur={(e) => {
                  onBlur(e);
                  trigger("pincode");
                }}
                t={t}
                maxLength={6}
              />
            )}
          />
        </div>
        {/* </LabelFieldPair> */}
        {errors.pincode && <CardLabelError style={errorStyle}>{errors?.pincode?.message}</CardLabelError>}
      </div>

      <ActionBar>
        <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />

        <SubmitBar label="Next" submit="submit" />
      </ActionBar>

      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={true}
        />
      )}

      {isLoading && <Loader page={true} />}
    </form>
  );
};

export default ADSCitizenDetailsNew;
