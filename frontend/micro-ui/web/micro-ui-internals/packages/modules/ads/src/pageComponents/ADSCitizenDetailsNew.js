
import React, { useEffect, useState  } from "react";
import { TextInput, CardLabel, MobileNumber, ActionBar, SubmitBar, LabelFieldPair, TextArea, CardLabelError,Toast } from "@mseva/digit-ui-react-components";
import { Controller, useForm, useWatch } from "react-hook-form";
import ADSAddress from "./ADSAddress";
import { UPDATE_ADSNewApplication_FORM } from "../redux/action/ADSNewApplicationActions";
import { useDispatch } from "react-redux";

const ADSCitizenDetailsNew = ({ t, goNext, currentStepData, configKey, onGoBack, onChange = () => {} }) => {
  const isEmployee = typeof window !== "undefined" && window.location?.pathname?.includes("/employee");
  const formStorageKey = `ads_form_${isEmployee ? "employee" : "citizen"}`;
  const dispatch = useDispatch();
  const userInfo = Digit.UserService.getUser();
  const { mobileNumber, emailId, name } = userInfo?.info;
  const isCitizen = window.location.href.includes("citizen");
  const [firstName, lastName] = [(name || "").trim().split(" ").slice(0, -1).join(" "), (name || "").trim().split(" ").slice(-1).join(" ")];
  const [showToast, setShowToast] = useState(null);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
    trigger
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: isCitizen ? firstName || "" : "",
      lastName: isCitizen ? lastName || "" : "",
      emailId: isCitizen ? emailId || "" : "",
      mobileNumber: isCitizen ? mobileNumber || "" : "",
      // SGST: "",
      // selfDeclaration: false,
      // clientName: "",
      address: "",
      pincode: "",
    },
  });



  // Prefill from Redux state
  if (typeof window !== "undefined") window.__ADS_FORM_DRAFT = window.__ADS_FORM_DRAFT || {};

  useEffect(() => {

    const base = currentStepData?.ownerDetails;
    if (!base) return;

    // Only reset if data has actually changed to avoid unnecessary resets
    const currentAddress = getValues("address");
    const newAddress = base.address;
    const addressChanged = JSON.stringify(currentAddress) !== JSON.stringify(newAddress);

    if (addressChanged) {
      Object.entries(base).forEach(([k, v]) => {
        if (k !== "address" && k !== "addressdetails") setValue(k, v);
      });
      if (newAddress) setValue("address", newAddress);
    }

    // Check for address in both base (ownerDetails) and root level
  }, [currentStepData, setValue, getValues]);

  useEffect(() => {
    // 1) Prefer in-memory draft (survives SPA remounts, cleared on hard reload)
    try {
      const mem = window.__ADS_FORM_DRAFT?.[formStorageKey];
      if (mem && typeof mem === "object") {
        reset(mem);
        console.info("[ADS] rehydrated form from in-memory draft");
        return;
      }
    } catch (e) {
      console.warn("[ADS] failed to rehydrate from in-memory", e);
    }
  }, []); // run once on mount


  const onSubmit = async (data) => {
    // clear in-memory draft
    try {
      if (window.__ADS_FORM_DRAFT) delete window.__ADS_FORM_DRAFT[formStorageKey];
    } catch (e) {
      /* ignore */
    }

    // Prefer pets.cartDetails (per your payload shape), then fallbacks
    const cartDetailsFromState =
      currentStepData?.pets?.cartDetails ||
      currentStepData?.cartDetails ||
      currentStepData?.siteDetails?.cartDetails ||
      currentStepData?.siteDetails ||
      [];

    const bookingFromTimeFromState = currentStepData?.pets?.bookingFromTime ?? currentStepData?.bookingFromTime ?? "";
    const bookingToTimeFromState = currentStepData?.pets?.bookingToTime ?? currentStepData?.bookingToTime ?? "";
    const cartAddressFromState = currentStepData?.pets?.cartAddress ?? currentStepData?.cartAddress ?? "";

    const isCitizen = typeof window !== "undefined" && window.location?.href?.includes("citizen");

    const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");

    const applicationDate = Date.now();

   

    const formData = {
      tenantId,
      applicationDate,
      bookingStatus: "BOOKING_CREATED",
      businessService: "ADV",
      address: {
        pincode: data.pincode || "",
        addressId: data.address || "",
      },
      applicantDetail: {
        applicantName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        applicantEmailId: data.emailId || "",
        applicantMobileNo: data.mobileNumber || "",
        // selfDeclaration: typeof data.selfDeclaration !== "undefined" ? data.selfDeclaration : true,
        applicantDetailId: "",
      },
       owners: [{
        name: `${firstName} ${lastName}`,
        mobileNumber: data.mobileNumber || "",
        tenantId,
        type: "CITIZEN",
      }],
      additional_details: "sgst, endDate, selfDeclaration",
      // attach cartDetails we received earlier from the other step
      cartDetails: Array.isArray(cartDetailsFromState) ? cartDetailsFromState : [],
      // optionally include the booking times / cartAddress if available
      bookingFromTime: bookingFromTimeFromState,
      bookingToTime: bookingToTimeFromState,
      cartAddress: cartAddressFromState,
      documents: [],
      workflow: {
        action: "INITIATE",
        comments: "Initial application submitted",
        status: "INITIATED",
        nextState: "",
      },
    };

    try {
      const payload = { bookingApplication: formData };
      const response = await Digit.ADSServices.create(payload, tenantId);

      const status = response?.ResponseInfo?.status;
      const isSuccess = typeof status === "string" && status.toLowerCase() === "successful";

      if (isSuccess) {
        // if API returns bookingApplication array, prefer the first item (same as ADSCitizenSecond)
        const appData = Array.isArray(response?.bookingApplication) ? response.bookingApplication[0] : response?.bookingApplication;

        // save created response into Redux under the same key ADSCitizenSecond used
        dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", appData || response));
      
        // forward the full response to parent (so parent can also store/navigate)
        goNext(formData);
      } else {
        console.error("ADS create failed (ADSCitizenDetailsNew) - saving draft", response);
        // store draft under same CreatedResponse key so later update uses it
        dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { draft: true, bookingApplication: formData }));
        // goNext({ draft: true, bookingApplication: formData });
        setShowToast({
          key: true, // or whatever truthy value your Toast expects for `error`
          label: "Something Went Wrong!",
        });
      }
    } catch (err) {
      dispatch(UPDATE_ADSNewApplication_FORM("CreatedResponse", { draft: true, bookingApplication: formData }));
      setShowToast({
        key: true, // or whatever truthy value your Toast expects for `error`
        label: "Something Went Wrong!",
      });
      // goNext({ draft: true, bookingApplication: formData });
    }
  };

  const watchedAll = useWatch({ control }); // watches entire form
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        // Light guard: avoid writing enormous drafts
        const str = JSON.stringify(watchedAll);
        if (str.length < 300 * 1024) {
          // ~300KB threshold, tweak if needed
          window.__ADS_FORM_DRAFT[formStorageKey] = watchedAll;
        } else {
          console.warn("[ADS] draft too large, skipping in-memory persist");
        }

        // OPTIONAL: if you want to survive hard reloads, uncomment:
        // sessionStorage.setItem(formStorageKey, str);
      } catch (e) {
        console.warn("[ADS] failed to persist form to in-memory", e);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [watchedAll, formStorageKey]);

  const errorStyle = { marginTop: "-18px", color: "red" };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <CardLabel>
          {t("NDC_FIRST_NAME")}
          <span style={{ color: "red" }}>*</span>{" "}
        </CardLabel>
        <Controller
          control={control}
          name="firstName"
          rules={{
            required: t("PTR_FIRST_NAME_REQUIRED"),
            pattern: {
              value: /^(?=.*[A-Za-z])[A-Za-z\s'-]+$/,
              message: "Only letters, spaces, apostrophes and hyphens allowed, must include at least one letter",
            },
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 100, message: "Maximum 100 characters" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.firstName && <CardLabelError style={errorStyle}>{errors.firstName.message}</CardLabelError>}

        <CardLabel>
          {t("NDC_LAST_NAME")}
          <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="lastName"
          rules={{
          required: t("PTR_LAST_NAME_REQUIRED"),
            pattern: {
              value: /^(?=.*[A-Za-z])[A-Za-z\s'-]+$/,
              message: "Only letters, spaces, apostrophes and hyphens allowed, must include at least one letter",
            },
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 100, message: "Maximum 100 characters" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.lastName && <CardLabelError style={errorStyle}>{errors.lastName.message}</CardLabelError>}

        <CardLabel>
          {t("NOC_APPLICANT_EMAIL_LABEL")}
          <span style={{ color: "red" }}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="emailId"
          rules={{
            required: t("PTR_EMAIL_REQUIRED"),
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          }}
          render={({ value, onChange, onBlur }) => <TextInput value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} t={t} />}
        />
        {errors.emailId && <CardLabelError style={errorStyle}>{errors.emailId.message}</CardLabelError>}

        <CardLabel>
          {t("NOC_APPLICANT_MOBILE_NO_LABEL")}
          <span style={{ color: "red" }}>*</span>
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
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("PT_COMMON_COL_ADDRESS")}`} *</CardLabel>
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
        </LabelFieldPair>
        {errors?.address && <CardLabelError style={errorStyle}>{errors?.address?.message}</CardLabelError>}

        {/* Pincode */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("CORE_COMMON_PINCODE")}`} *</CardLabel>
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
        </LabelFieldPair>
        {errors.pincode && <CardLabelError style={errorStyle}>{errors?.pincode?.message}</CardLabelError>}
      </div>

      <ActionBar>
        <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />

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
    </form>
  );
};

export default ADSCitizenDetailsNew;
