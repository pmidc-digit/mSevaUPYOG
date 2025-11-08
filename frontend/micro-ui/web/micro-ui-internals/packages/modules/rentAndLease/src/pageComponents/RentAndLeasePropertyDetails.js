import React, { useEffect, useState } from "react";
import {
  TextInput,
  CardLabel,
  Dropdown,
  ActionBar,
  SubmitBar,
  CardLabelError,
  LabelFieldPair,
  CardSectionHeader,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";
import CustomDatePicker from "./CustomDatePicker";
import { Loader } from "../components/Loader";
import { convertEpochToDateInput } from "../utils/index";

const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, t, validateStep, isEdit }) => {
  const stateId = Digit.ULBService.getStateId();
  let user = Digit.UserService.getUser();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  // Adapt MDMS hooks for RentAndLease property types
  // const { data: mdmsPropertyData, isLoading } = Digit.Hooks.rentAndLease?.usePropertyMDMS(tenantId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({ defaultValues: { propertyType: "", propertyArea: "", leaseStartDate: "", leaseEndDate: "", rentAmount: "" } });

  const selectedPropertyType = watch("propertyType");

  function toEpochMilliseconds(dateStr) {
    return new Date(dateStr).getTime();
  }

  const onSubmit = async (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) return;
    }

    // Store property details in Redux and move to next step
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", data));
    
    if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
      goNext(data);
      return;
    }

    // For new applications, create the application after step 2
    const applicantDetails = currentStepData.applicantDetails || {};
    const { address, name, pincode, ...filteredApplicantDetails } = applicantDetails;
    const formData = {
      tenantId,
      applicant: {
        ...filteredApplicantDetails,
        name: name || applicantDetails.name,
        userName: filteredApplicantDetails?.mobileNumber || applicantDetails.mobileNumber,
        tenantId,
        type: "CITIZEN",
      },
      propertyDetails: {
        propertyType: data.propertyType?.name || data.propertyType,
        propertyArea: data.propertyArea,
        leaseStartDate: toEpochMilliseconds(data.leaseStartDate),
        leaseEndDate: toEpochMilliseconds(data.leaseEndDate),
        rentAmount: data.rentAmount,
        propertyAddress: data.propertyAddress,
        description: data.description,
      },
      address: {
        pincode,
        addressId: currentStepData.applicantDetails?.address,
      },
      applicationType: "NEWAPPLICATION",
      applicantName: name || applicantDetails.name,
      fatherName: filteredApplicantDetails?.fatherOrHusbandName || applicantDetails.fatherOrHusbandName,
      mobileNumber: filteredApplicantDetails?.mobileNumber || applicantDetails.mobileNumber,
      workflow: {
        action: "INITIATE",
        comments: "",
        status: "INITIATED",
      },
    };

    const pick = (newV, oldV) => (newV !== undefined && newV !== null && newV !== "" ? newV : oldV);
    const existing = apiDataCheck?.[0] || currentStepData?.responseData?.[0] || {};

    if (existing?.applicationNumber) {
      const existingDocuments =
        existing?.documents && Array.isArray(existing.documents) && existing.documents.length
          ? existing.documents
          : currentStepData?.documents?.documents?.documents || currentStepData?.documents || [];

      const updateFormData = {
        ...existing,
        applicant: {
          ...existing.applicant,
          ...filteredApplicantDetails,
          name: pick(applicantDetails.name, existing.applicant?.name || ""),
          userName: pick(applicantDetails.mobileNumber, existing.applicant?.userName),
        },
        address: {
          ...existing.address,
          pincode: pick(pincode, existing.address?.pincode),
          addressId: pick(currentStepData.applicantDetails?.address, existing.address?.addressId),
          tenantId,
        },
        propertyDetails: {
          ...existing.propertyDetails,
          propertyType: pick(data.propertyType?.name ?? data.propertyType?.code, existing.propertyDetails?.propertyType),
          propertyArea: pick(data.propertyArea, existing.propertyDetails?.propertyArea),
          leaseStartDate: pick(toEpochMilliseconds(data.leaseStartDate), existing.propertyDetails?.leaseStartDate),
          leaseEndDate: pick(toEpochMilliseconds(data.leaseEndDate), existing.propertyDetails?.leaseEndDate),
          rentAmount: pick(data.rentAmount, existing.propertyDetails?.rentAmount),
          propertyAddress: pick(data.propertyAddress, existing.propertyDetails?.propertyAddress),
          description: pick(data.description, existing.propertyDetails?.description),
        },
        documents: existingDocuments,
        workflow: {
          ...existing.workflow,
          action: "SAVEASDRAFT",
          status: "SAVEASDRAFT",
          comments: "SAVEASDRAFT",
        },
        applicantName: pick(applicantDetails.name, existing.applicantName || ""),
        mobileNumber: pick(applicantDetails.mobileNumber, existing.mobileNumber),
      };
      setLoader(true);
      try {
        // Adapt service call for RentAndLease when API is available
        // const response = await Digit.RentAndLeaseService.update({ RentAndLeaseApplications: [updateFormData] }, tenantId);
        // setLoader(false);
        // if (response?.ResponseInfo?.status === "successful") {
        //   dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("CreatedResponse", response.RentAndLeaseApplications[0]));
        //   goNext(data);
        // }
        setLoader(false);
        // For now, just store the data and proceed
        dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", data));
        goNext(data);
      } catch (error) {
        setLoader(false);
        console.log("error", error);
      }
    } else {
      try {
        // Adapt service call for RentAndLease when API is available
        // const response = await Digit.RentAndLeaseService.create({ rentAndLeaseApplications: [formData] }, formData.tenantId);
        // setLoader(false);
        // if (response?.ResponseInfo?.status === "successful") {
        //   dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("CreatedResponse", response.RentAndLeaseApplications[0]));
        //   goNext(data);
        // }
        setLoader(false);
        // For now, just store the data and proceed
        dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", data));
        goNext(data);
      } catch (error) {
        setLoader(false);
        console.log("error", error);
      }
    }
  };

  useEffect(() => {
    if (apiDataCheck?.[0]?.propertyDetails) {
      Object.entries(apiDataCheck[0].propertyDetails).forEach(([key, value]) => {
        if (key === "leaseStartDate" || key === "leaseEndDate") {
          const epoch = value !== null && value !== undefined && value !== "" ? (!Number.isNaN(Number(value)) ? Number(value) : value) : value;
          const v = convertEpochToDateInput(epoch);
          setValue(key, v);
        } else {
          setValue(key, value);
        }
      });
    }
  }, [apiDataCheck, setValue]);

  useEffect(() => {
    if (currentStepData?.propertyDetails) {
      Object.entries(currentStepData.propertyDetails).forEach(([key, value]) => {
        if (key === "leaseStartDate" || key === "leaseEndDate") {
          setValue(key, convertEpochToDateInput(value));
        } else {
          setValue(key, value);
        }
      });
    }
  }, [currentStepData, setValue]);

  const onlyAlphabets = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/;
  const onlyNumbers = /^[0-9]+$/;
  const alphaNum = /^[A-Za-z0-9]+$/;
  const decimalNumber = /^\d+(\.\d{1,2})?$/;

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("ES_TITILE_PET_DETAILS")}</CardSectionHeader>
      {/* Property Type */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_PROPERTY_TYPE")} *</CardLabel>
        <Controller
          control={control}
          name="propertyType"
          rules={{ required: t("RENT_LEASE_PROPERTY_TYPE_REQUIRED") }}
          render={(props) => (
            <Dropdown
              className="form-field"
              select={props.onChange}
              selected={props.value}
              option={[]} // Adapt with your property types from MDMS
              optionKey="name"
            />
          )}
        />
      </LabelFieldPair>
      {errors.propertyType && <CardLabelError style={errorStyle}>{getErrorMessage("propertyType")}</CardLabelError>}

      {/* Property Area */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_PROPERTY_AREA")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="propertyArea"
            rules={{
              required: t("RENT_LEASE_PROPERTY_AREA_REQUIRED"),
              pattern: { value: decimalNumber, message: t("RENT_LEASE_PROPERTY_AREA_INVALID") },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => trigger("propertyArea")}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.propertyArea && <CardLabelError style={errorStyle}>{getErrorMessage("propertyArea")}</CardLabelError>}

      {/* Lease Start Date */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_LEASE_START_DATE")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="leaseStartDate"
            rules={{ required: t("RENT_LEASE_LEASE_START_DATE_REQUIRED") }}
            render={(props) => (
              <CustomDatePicker
                value={props.value}
                max={todayStr}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => trigger("leaseStartDate")}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.leaseStartDate && <CardLabelError style={errorStyle}>{getErrorMessage("leaseStartDate")}</CardLabelError>}

      {/* Lease End Date */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_LEASE_END_DATE")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="leaseEndDate"
            rules={{ required: t("RENT_LEASE_LEASE_END_DATE_REQUIRED") }}
            render={(props) => (
              <CustomDatePicker
                value={props.value}
                min={watch("leaseStartDate")}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => trigger("leaseEndDate")}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.leaseEndDate && <CardLabelError style={errorStyle}>{getErrorMessage("leaseEndDate")}</CardLabelError>}

      {/* Rent Amount */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_RENT_AMOUNT")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="rentAmount"
            rules={{
              required: t("RENT_LEASE_RENT_AMOUNT_REQUIRED"),
              pattern: { value: decimalNumber, message: t("RENT_LEASE_RENT_AMOUNT_INVALID") },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => trigger("rentAmount")}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.rentAmount && <CardLabelError style={errorStyle}>{getErrorMessage("rentAmount")}</CardLabelError>}

      {/* Property Address */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_PROPERTY_ADDRESS")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="propertyAddress"
            rules={{
              required: t("RENT_LEASE_PROPERTY_ADDRESS_REQUIRED"),
              maxLength: { value: 500, message: "Maximum 500 characters" },
              minLength: { value: 5, message: "Minimum 5 characters" },
            }}
            render={(props) => (
              <TextArea
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => trigger("propertyAddress")}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.propertyAddress && <CardLabelError style={errorStyle}>{getErrorMessage("propertyAddress")}</CardLabelError>}

      {/* Description */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_DESCRIPTION")}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="description"
            render={(props) => (
              <TextArea
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>

      <ActionBar>
        <SubmitBar
          label="Back"
          style={{ border: "1px solid", background: "transparent", color: "#2947a3", marginRight: "5px" }}
          onSubmit={onGoBack}
        />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
      {loader && <Loader page={true} />}
    </form>
  );
};

export default RentAndLeasePropertyDetails;

