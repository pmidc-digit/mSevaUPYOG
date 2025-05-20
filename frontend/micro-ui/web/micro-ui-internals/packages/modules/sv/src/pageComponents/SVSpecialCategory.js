import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, Dropdown, UploadFile, Toast } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import Timeline from "../components/Timeline";
import { transformDocuments } from "../utils";

const SVSpecialCategory = ({ t, config, onSelect, userType, formData, editdata, previousData }) => {
  let validation = {};
  const user = Digit.UserService.getUser().info;
  const convertToObject = (String) => (String ? { i18nKey: String, code: String, value: String } : null);
  const [ownerCategory, setownerCategory] = useState(
    formData?.specialCategoryData?.ownerCategory || convertToObject(previousData?.disabilityStatus || editdata?.disabilityStatus) || ""
  );
  const [enrollmentId, setenrollmentId] = useState(
    formData?.specialCategoryData?.enrollmentId || previousData?.enrollmentId || editdata?.enrollmentId || ""
  );
  const [beneficiary, setbeneficiary] = useState(
    formData?.specialCategoryData?.beneficiary ||
      convertToObject(previousData?.benificiaryOfSocialSchemes || editdata?.benificiaryOfSocialSchemes) ||
      ""
  );
  const inputStyles = { width: user.type === "EMPLOYEE" ? "50%" : "100%" };
  const [file, setFile] = useState(null);
  const filteredDraftDocument = previousData?.documentDetails?.find((item) => item?.documentType?.includes(ownerCategory?.code));
  const filteredDocument = editdata?.documentDetails?.find((item) => item?.documentType?.includes(ownerCategory?.code));
  const [uploadedFile, setUploadedFile] = useState(
    filteredDraftDocument?.fileStoreId || filteredDocument?.fileStoreId || formData?.specialCategoryData?.uploadedFile || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  if (previousData?.draftId?.length > 0 || editdata?.applicationNo) {
    const Document = [
      {
        documentType: previousData?.disabilityStatus || editdata?.disabilityStatus,
        documentUid: filteredDraftDocument?.fileStoreId || filteredDocument?.fileStoreId,
        fileStoreId: filteredDraftDocument?.fileStoreId || filteredDocument?.fileStoreId,
      },
    ];
    sessionStorage.setItem("CategoryDocument", JSON.stringify(Document));
  }

  const [showToast, setShowToast] = useState(null);

  const { control } = useForm();

  // TODO: Need To make Master data for special Category inside common-masters so that other modules can use the same instead of using it from PT Master data
  const { data: specialCategory } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "PropertyTax", [{ name: "OwnerType" }], {
    select: (data) => {
      const formattedData = data?.["PropertyTax"]?.["OwnerType"];
      return formattedData;
    },
  });
  let specialcategory = [];
  specialCategory &&
    specialCategory.map((special_category) => {
      specialcategory.push({ i18nKey: `${special_category.name}`, code: `${special_category.code}`, value: `${special_category.name}` });
    });

  const { data: schemes } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "StreetVending", [{ name: "Schemes" }], {
    select: (data) => {
      const formattedData = data?.["StreetVending"]?.["Schemes"];
      return formattedData;
    },
  });
  let schemes_data = [];
  schemes &&
    schemes.map((schemesdata) => {
      schemes_data.push({ i18nKey: `${schemesdata.name}`, code: `${schemesdata.code}`, value: `${schemesdata.name}` });
    });

  useEffect(() => {
    if (file) {
      if (file.size >= 5242880) {
        setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
      } else {
        setUploadedFile(null);
        setIsUploading(true);
        Digit.UploadServices.Filestorage("StreetVending", file, Digit.ULBService.getStateId())
          .then((response) => {
            if (response?.data?.files?.length > 0) {
              const documentData = [
                {
                  documentType: ownerCategory?.code,
                  documentUid: response.data.files[0].fileStoreId,
                  fileStoreId: response.data.files[0].fileStoreId,
                },
              ];
              setUploadedFile(response.data.files[0].fileStoreId);
              sessionStorage.setItem("CategoryDocument", JSON.stringify(documentData));
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          })
          .catch(() => setError(t("CS_FILE_UPLOAD_ERROR")))
          .finally(() => {
            setIsUploading(false);
          });
      }
    }
  }, [file, t]);

  function setenrollment(e) {
    setenrollmentId(e.target.value);
  }

  //Custom function for the payload whic we can use while goint to next

  const handleSaveasDraft = () => {
    let vendordetails = [];
    let tenantId = Digit.ULBService.getCitizenCurrentTenant(true);
    const createVendorObject = (formData) => ({
      applicationId: "",
      auditDetails: {
        createdBy: "",
        createdTime: 0,
        lastModifiedBy: "",
        lastModifiedTime: 0,
      },
      dob: formData?.owner?.units?.[0]?.vendorDateOfBirth,
      userCategory: formData?.owner?.units?.[0]?.userCategory?.code,
      emailId: formData?.owner?.units?.[0]?.email,
      fatherName: formData?.owner?.units?.[0]?.fatherName,
      gender: formData?.owner?.units?.[0]?.gender?.code.charAt(0),
      id: "",
      mobileNo: formData?.owner?.units?.[0]?.mobileNumber,
      name: formData?.owner?.units?.[0]?.vendorName,
      relationshipType: "VENDOR",
      vendorId: null,
    });

    const createSpouseObject = (formData) => ({
      applicationId: "",
      auditDetails: {
        createdBy: "",
        createdTime: 0,
        lastModifiedBy: "",
        lastModifiedTime: 0,
      },
      dob: formData?.owner?.units?.[1]?.spouseDateBirth,
      userCategory: formData?.owner?.units?.[1]?.userCategory?.code,
      emailId: "",
      isInvolved: formData?.owner?.spouseDependentChecked,
      fatherName: "",
      gender: "O",
      id: "",
      mobileNo: "",
      name: formData?.owner?.units?.[1]?.spouseName,
      relationshipType: "SPOUSE",
      vendorId: null,
    });

    const createDependentObject = (formData) => ({
      applicationId: "",
      auditDetails: {
        createdBy: "",
        createdTime: 0,
        lastModifiedBy: "",
        lastModifiedTime: 0,
      },
      dob: formData?.owner?.units?.[2]?.dependentDateBirth,
      userCategory: formData?.owner?.units?.[2]?.userCategory?.code,
      emailId: "",
      isInvolved: formData?.owner?.dependentNameChecked,
      fatherName: "",
      gender: formData?.owner?.units?.[2]?.dependentGender?.code.charAt(0),
      id: "",
      mobileNo: "",
      name: formData?.owner?.units?.[2]?.dependentName,
      relationshipType: "DEPENDENT",
      vendorId: null,
    });

    // Helper function to check if a string is empty or undefined
    const isEmpty = (str) => !str || str.trim() === "";

    // Main logic
    if (!isEmpty(formData?.owner?.units?.[0]?.vendorName)) {
      const spouseName = formData?.owner?.units?.[0]?.spouseName;
      const dependentName = formData?.owner?.units?.[0]?.dependentName;

      if (isEmpty(spouseName) && isEmpty(dependentName)) {
        // Case 1: Only vendor exists
        vendordetails = [createVendorObject(formData)];
      } else if (!isEmpty(spouseName) && isEmpty(dependentName)) {
        // Case 2: Both vendor and spouse exist
        vendordetails = [createVendorObject(formData), createSpouseObject(formData)];
      } else if (!isEmpty(spouseName) && !isEmpty(dependentName)) {
        // Case 3: All three exist (vendor, spouse, and dependent)
        vendordetails = [createVendorObject(formData), createSpouseObject(formData), createDependentObject(formData)];
      }
    }

    const daysOfOperations = formData?.businessDetails?.daysOfOperation;
    const vendingOperationTimeDetails = daysOfOperations
      .filter((day) => day.isSelected) // Filter only selected days
      .map((day) => ({
        applicationId: "", // Add actual applicationId if available
        auditDetails: {
          createdBy: "", // Adjust these fields based on your data
          createdTime: 0,
          lastModifiedBy: "",
          lastModifiedTime: 0,
        },
        dayOfWeek: day.name.toUpperCase(),
        fromTime: day.startTime,
        toTime: day.endTime,
        id: "",
      }));

    const api_response = sessionStorage.getItem("Response");
    const response = JSON.parse(api_response);

    let streetVendingDetail = {
      addressDetails: [
        {
          addressId: "",
          addressLine1: formData?.address?.addressline1,
          addressLine2: formData?.address?.addressline2,
          addressType: "",
          city: formData?.address?.city?.name,
          cityCode: formData?.address?.city?.code,
          doorNo: "",
          houseNo: formData?.address?.houseNo,
          landmark: formData?.address?.landmark,
          locality: formData?.address?.locality?.i18nKey,
          localityCode: formData?.address?.locality?.code,
          pincode: formData?.address?.pincode,
          streetName: "",
          vendorId: "",
        },
        {
          // sending correspondence address here
          addressId: "",
          addressLine1: formData?.correspondenceAddress?.caddressline1,
          addressLine2: formData?.correspondenceAddress?.caddressline2,
          addressType: "",
          city: formData?.correspondenceAddress?.ccity?.name,
          cityCode: formData?.correspondenceAddress?.ccity?.code,
          doorNo: "",
          houseNo: formData?.correspondenceAddress?.chouseNo,
          landmark: formData?.correspondenceAddress?.clandmark,
          locality: formData?.correspondenceAddress?.clocality?.i18nKey,
          localityCode: formData?.correspondenceAddress?.clocality?.code,
          pincode: formData?.correspondenceAddress?.cpincode,
          streetName: "",
          vendorId: "",
          isAddressSame: formData?.correspondenceAddress?.isAddressSame,
        },
      ],
      applicationDate: 0,
      applicationId: "",
      applicationNo: "",
      applicationStatus: "",
      approvalDate: 0,
      auditDetails: {
        createdBy: "",
        createdTime: 0,
        lastModifiedBy: "",
        lastModifiedTime: 0,
      },
      bankDetail: {
        accountHolderName: formData?.bankDetails?.accountHolderName,
        accountNumber: formData?.bankDetails?.accountNumber,
        applicationId: "",
        bankBranchName: formData?.bankDetails?.bankBranchName,
        bankName: formData?.bankDetails?.bankName,
        id: "",
        ifscCode: formData?.bankDetails?.ifscCode,
        refundStatus: "",
        refundType: "",
        auditDetails: {
          createdBy: "",
          createdTime: 0,
          lastModifiedBy: "",
          lastModifiedTime: 0,
        },
      },
      benificiaryOfSocialSchemes: beneficiary?.value,
      enrollmentId: enrollmentId,
      cartLatitude: 0,
      cartLongitude: 0,
      certificateNo: null,
      disabilityStatus: ownerCategory?.code,
      draftId: previousData?.draftId || response?.SVDetail?.draftId,
      documentDetails: transformDocuments(formData?.documents?.documents),
      localAuthorityName: formData?.businessDetails?.nameOfAuthority,
      tenantId: tenantId,
      termsAndCondition: "Y",
      tradeLicenseNo: formData?.owner?.units?.[0]?.tradeNumber,
      vendingActivity: formData?.businessDetails?.vendingType?.code,
      vendingArea: formData?.businessDetails?.areaRequired || "0",
      vendingLicenseCertificateId: "",
      vendingOperationTimeDetails,
      vendingZone: formData?.businessDetails?.vendingZones?.code,
      vendorDetail: [...vendordetails],
      workflow: {
        action: "APPLY",
        comments: "",
        businessService: "street-vending",
        moduleName: "sv-services",
        businessService: "street-vending",
        moduleName: "sv-services",
        varificationDocuments: [
          {
            additionalDetails: {},
            auditDetails: {
              createdBy: "",
              createdTime: 0,
              lastModifiedBy: "",
              lastModifiedTime: 0,
            },
            documentType: "",
            documentUid: "",
            fileStoreId: "",
            id: "",
          },
        ],
      },
    };

    Digit.SVService.create({ streetVendingDetail, draftApplication: true }, tenantId)
      .then((response) => {
        sessionStorage.setItem("Response", JSON.stringify(response));
      })
      .catch((error) => {
        console.log("Something Went Wrong", error);
      });
  };

  const goNext = () => {
    let category = formData.specialCategoryData;
    let categoryStep = { ...category, ownerCategory, beneficiary, uploadedFile, enrollmentId };
    onSelect(config.key, categoryStep, false);
    window.location.href.includes("edit") ? null : handleSaveasDraft();
  };

  const onSkip = () => onSelect();

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 2000); // Close toast after 1 seconds

      return () => clearTimeout(timer); // Clear timer on cleanup
    }
  }, [showToast]);
  useEffect(() => {
    if (userType === "citizen") {
      goNext();
    }
  }, [ownerCategory, beneficiary]);

  //TODO: Need to make seperate component for this loader
  const LoadingSpinner = () => <div className="loading-spinner" />;

  return (
    <React.Fragment>
      {<Timeline currentStep={6} />}
      <div>
        <FormStep config={config} onSelect={goNext} onSkip={onSkip} t={t} isDisabled={!ownerCategory}>
          <div>
            <CardLabel>
              {`${t("SV_CATEGORY")}`} <span className="astericColor">*</span>
            </CardLabel>
            <Controller
              control={control}
              name={"ownerCategory"}
              defaultValue={ownerCategory}
              rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  selected={ownerCategory}
                  select={setownerCategory}
                  option={specialcategory}
                  style={inputStyles}
                  optionKey="i18nKey"
                  t={t}
                  placeholder={"Select"}
                />
              )}
            />
            {ownerCategory && ownerCategory?.code !== "NONE" && (
              <div className="field" style={{ marginRight: user?.type === "EMPLOYEE" ? "50%" : null, marginBottom: "10px" }}>
                <UploadFile
                  onUpload={handleFileUpload}
                  onDelete={() => {
                    setUploadedFile(null);
                  }}
                  id={"SV"}
                  message={
                    isUploading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <LoadingSpinner />
                        <span>Uploading...</span>
                      </div>
                    ) : uploadedFile ? (
                      "1 File Uploaded"
                    ) : (
                      "No File Uploaded"
                    )
                  }
                  accept=".pdf, .jpeg, .jpg, .png"
                  buttonType="button"
                  error={!uploadedFile}
                />
              </div>
            )}

            <CardLabel>{`${t("SV_BENEFICIARY_SCHEMES")}`}</CardLabel>
            <Controller
              control={control}
              name={"beneficiary"}
              defaultValue={beneficiary}
              rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  selected={beneficiary}
                  select={setbeneficiary}
                  style={inputStyles}
                  optionCardStyles={{ overflowY: "auto", maxHeight: "315px" }}
                  option={schemes_data}
                  optionKey="i18nKey"
                  t={t}
                  placeholder={"Select"}
                />
              )}
            />
            {beneficiary && (
              <React.Fragment>
                <CardLabel>{`${t("SV_ENROLLMENT_APPLICATION_NUMBER")}`}</CardLabel>
                <TextInput
                  t={t}
                  type={"text"}
                  isMandatory={false}
                  optionKey="i18nKey"
                  name="enrollmentId"
                  value={enrollmentId}
                  onChange={setenrollment}
                  style={inputStyles}
                  ValidationRequired={false}
                  {...(validation = {
                    isRequired: false,
                    pattern: "^[a-zA-Z0-9-/ ]*$",
                    type: "text",
                    title: t("SV_INPUT_DID_NOT_MATCH"),
                  })}
                />
              </React.Fragment>
            )}
          </div>
        </FormStep>
        {showToast && (
          <Toast
            error={showToast.error}
            warning={showToast.warning}
            label={t(showToast.label)}
            onClose={() => {
              setShowToast(null);
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default SVSpecialCategory;
