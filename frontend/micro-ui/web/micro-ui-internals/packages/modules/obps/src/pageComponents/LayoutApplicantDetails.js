import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  CardLabelError,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  RadioButtons,
  SearchIcon,
  Toast,
  CardSectionSubText,
  DeleteIcon,
  LinkButton,
  Loader,
} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";
import CustomUploadFile from "../components/CustomUploadFile";
import { UPDATE_LayoutNewApplication_FORM } from "../redux/actions/LayoutNewApplicationActions";

const LayoutApplicantDetails = forwardRef((_props, ref) => {
  const dispatch = useDispatch();
  const { t, goNext, currentStepData, Controller, control, setValue, reset, errors, errorStyle, trigger } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const [mobileNo, setMobileNo] = useState("");
  const [showToast, setShowToast] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoadingMobile, setIsLoadingMobile] = useState(false);

  const [applicants, setApplicants] = useState([
    {
      name: "",
      fatherOrHusbandName: "",
      mobileNumber: "",
      emailId: "",
      address: "",
      dob: "",
      gender: "",
    },
  ]);
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({});
  const [photoUploadedFiles, setPhotoUploadedFiles] = useState({});
  const [panUploadedFiles, setPanUploadedFiles] = useState({});
  const [applicantErrors, setApplicantErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const [isDataRestored, setIsDataRestored] = useState(false);
  // State for additional owner mobile search
  const [additionalOwnerMobileNo, setAdditionalOwnerMobileNo] = useState({});
  const [additionalOwnerSearchLoading, setAdditionalOwnerSearchLoading] = useState({});

  const closeToast = () => setShowToast(null);

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  const menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({
        i18nKey: `COMMON_GENDER_${genderDetails.code}`,
        code: `${genderDetails.code}`,
        value: `${genderDetails.code}`,
      });
    });

  useEffect(() => {
    // Prevent running multiple times
    if (isDataRestored) return;

    console.log("[v0] LayoutApplicantDetails - Full currentStepData:", currentStepData);
    const formattedData = currentStepData?.applicationDetails;

    if (formattedData) {
      // Map applicants to proper format
      const applicantsData = formattedData.applicants || [{
        name: "",
        fatherOrHusbandName: "",
        mobileNumber: "",
        emailId: "",
        address: "",
        dob: "",
        gender: "",
      }];

      // Reset entire form at once (like CLUApplicantDetails does)
      reset({
        applicantMobileNumber: formattedData.applicantMobileNumber || "",
        applicantOwnerOrFirmName: formattedData.applicantOwnerOrFirmName || "",
        applicantEmailId: formattedData.applicantEmailId || "",
        applicantFatherHusbandName: formattedData.applicantFatherHusbandName || "",
        applicantAddress: formattedData.applicantAddress || "",
        applicantDateOfBirth: formattedData.applicantDateOfBirth || "",
        applicantGender: formattedData.applicantGender || "",
        applicantPanNumber: formattedData.applicantPanNumber || "",
      });

      setApplicants(applicantsData);
    }

    // Restore additional applicants from currentStepData (if already in Redux from previous step navigation)
    if (currentStepData?.applicants && currentStepData.applicants.length > 0) {
      console.log("[v0] Restoring applicants from currentStepData.applicants:", currentStepData.applicants);
      setApplicants(currentStepData.applicants);
    }
    // If no applicants in Redux, check if we're in edit mode and have owners from API
    else if (currentStepData?.apiData?.Layout?.[0]?.owners && currentStepData?.apiData?.Layout?.[0]?.owners?.length > 1) {
      const ownersFromApi = currentStepData.apiData.Layout[0].owners;
      console.log("[v0] Mapping owners from API response:", ownersFromApi);

      // Map additional owners (skip index 0 as it's the primary owner in applicationDetails)
      const additionalApplicants = ownersFromApi.slice(1).map((owner) => {
        // Convert timestamp to YYYY-MM-DD format for date input
        let formattedDob = "";
        if (owner?.dob) {
          const dobDate = new Date(owner.dob);
          const year = dobDate.getFullYear();
          const month = String(dobDate.getMonth() + 1).padStart(2, "0");
          const day = String(dobDate.getDate()).padStart(2, "0");
          formattedDob = `${year}-${month}-${day}`;
        }

        // Map gender to the dropdown format
        const genderObj = menu.find((g) => g.code === owner?.gender) || owner?.gender;

        return {
          name: owner?.name || "",
          fatherOrHusbandName: owner?.fatherOrHusbandName || "",
          mobileNumber: owner?.mobileNumber || "",
          emailId: owner?.emailId || "",
          address: owner?.permanentAddress || "",
          dob: formattedDob,
          gender: genderObj,
          // Store original owner data for reference
          uuid: owner?.uuid || "",
          id: owner?.id || "",
        };
      });

      console.log("[v0] Mapped additional applicants:", additionalApplicants);

      // Keep the first empty placeholder at index 0, then add additional applicants
      // This is because the render logic skips index 0 (index > 0)
      const emptyPlaceholder = {
        name: "",
        fatherOrHusbandName: "",
        mobileNumber: "",
        emailId: "",
        address: "",
        dob: "",
        gender: "",
      };
      setApplicants([emptyPlaceholder, ...additionalApplicants]);
    }

    // Restore document uploaded files from Redux state
    if (currentStepData?.documentUploadedFiles && Object.keys(currentStepData.documentUploadedFiles).length > 0) {
      setDocumentUploadedFiles(currentStepData.documentUploadedFiles);
    }
    // Map documents from additionalDetails in API response during edit mode
    else if (isEdit && currentStepData?.apiData?.Layout?.[0]?.owners) {
      const ownersFromApi = currentStepData.apiData.Layout[0].owners;
      console.log("[v0] Mapping documents from owners additionalDetails");

      const docFiles = {};
      const photoFiles = {};
      const panFiles = {};

      // Map documents for all owners from their additionalDetails
      ownersFromApi.forEach((owner, ownerIndex) => {
        if (owner?.additionalDetails?.documentFile) {
          docFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.documentFile, fileName: "Document" };
        }
        if (owner?.additionalDetails?.ownerPhoto) {
          photoFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.ownerPhoto, fileName: "Photo" };
        }
        if (owner?.additionalDetails?.panDocument) {
          panFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.panDocument, fileName: "PAN Document" };
        }
      });

      console.log("[v0] Mapped document files:", docFiles);
      console.log("[v0] Mapped photo files:", photoFiles);
      console.log("[v0] Mapped PAN files:", panFiles);

      if (Object.keys(docFiles).length > 0) {
        setDocumentUploadedFiles(docFiles);
      }
      if (Object.keys(photoFiles).length > 0) {
        setPhotoUploadedFiles(photoFiles);
      }
      if (Object.keys(panFiles).length > 0) {
        setPanUploadedFiles(panFiles);
      }
    }

    // Restore photo uploaded files from Redux state
    if (currentStepData?.photoUploadedFiles && Object.keys(currentStepData.photoUploadedFiles).length > 0) {
      setPhotoUploadedFiles(currentStepData.photoUploadedFiles);
    }

    // Mark as restored to prevent re-running
    if (currentStepData) {
      setIsDataRestored(true);
    }
  }, [currentStepData, isDataRestored, menu]);

  const getOwnerDetails = async () => {
    // Validation first (no loader needed)
    if (!mobileNo || mobileNo.length !== 10) {
      setShowToast({
        key: "true",
        error: true,
        message: t("INVALID_MOBILE_NUMBER"),
      });
      return;
    }

    try {
      setIsLoadingMobile(true); // 🔄 start loader

      const userResponse = await Digit.UserService.userSearch(stateId, { userName: mobileNo }, {});

      if (!userResponse?.user?.length) {
        setShowToast({
          key: "true",
          warning: true,
          message: t("ERR_MOBILE_NUMBER_NOT_REGISTERED"),
        });
        return;
      }

      setUserInfo(userResponse.user[0]);
    } catch (err) {
      console.error(err);
      setShowToast({
        key: "true",
        error: true,
        message: t("SOMETHING_WENT_WRONG"),
      });
    } finally {
      setIsLoadingMobile(false); // ✅ stop loader (always)
    }
  };

  // Search function for additional owners
  const getAdditionalOwnerDetails = async (index) => {
    const mobileNumber = applicants[index]?.mobileNumber;

    if (!mobileNumber || mobileNumber.length !== 10) {
      setShowToast({
        key: "true",
        error: true,
        message: t("INVALID_MOBILE_NUMBER"),
      });
      return;
    }

    setAdditionalOwnerSearchLoading((prev) => ({ ...prev, [index]: true }));

    try {
      const userResponse = await Digit.UserService.userSearch(stateId, { userName: mobileNumber }, {});

      if (!userResponse?.user?.length) {
        setShowToast({
          key: "true",
          warning: true,
          message: t("ERR_MOBILE_NUMBER_NOT_REGISTERED"),
        });
        setAdditionalOwnerSearchLoading((prev) => ({ ...prev, [index]: false }));
        return;
      }

      const user = userResponse.user[0];

      // Convert dob timestamp to YYYY-MM-DD format
      let formattedDob = "";
      if (user?.dob) {
        const dobDate = new Date(user.dob);
        const year = dobDate.getFullYear();
        const month = String(dobDate.getMonth() + 1).padStart(2, "0");
        const day = String(dobDate.getDate()).padStart(2, "0");
        formattedDob = `${year}-${month}-${day}`;
      }

      // Map gender to the dropdown format
      const genderObj = menu.find((g) => g.code === user?.gender) || user?.gender;

      // Update the applicant at the given index with user data
      const updatedApplicants = [...applicants];
      updatedApplicants[index] = {
        ...updatedApplicants[index],
        name: user?.name || "",
        fatherOrHusbandName: user?.fatherOrHusbandName || "",
        mobileNumber: user?.mobileNumber || mobileNumber,
        emailId: user?.emailId || "",
        address: user?.permanentAddress || "",
        dob: formattedDob,
        gender: genderObj,
        uuid: user?.uuid || "",
      };
      setApplicants(updatedApplicants);

      setShowToast({
        key: "true",
        warning: false,
        error: false,
        message: t("Applicant details fetched successfully"),
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      setShowToast({
        key: "true",
        error: true,
        message: t("Error fetching applicant details"),
      });
    } finally {
      setAdditionalOwnerSearchLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Prefill UI on userInfo
  useEffect(() => {
    if (userInfo) {
      Object.entries(userInfo).forEach(([key, value]) => {
        if (key === "name") setValue("applicantOwnerOrFirmName", value, { shouldValidate: true, shouldDirty: true });

        if (key === "emailId") setValue("applicantEmailId", value, { shouldValidate: true, shouldDirty: true });

        if (key === "dob") {
          // Normalize DOB to YYYY-MM-DD format for <input type="date">
          const dobStr = typeof value === "string" ? value : "";
          const yyyyMmDd = dobStr ? dobStr.slice(0, 10) : "";
          setValue("applicantDateOfBirth", yyyyMmDd, { shouldValidate: true, shouldDirty: true });
        }

        if (key === "fatherOrHusbandName") setValue("applicantFatherHusbandName", value, { shouldValidate: true, shouldDirty: true });

        if (key === "permanentAddress") {
          setValue("applicantAddress", value, { shouldValidate: true, shouldDirty: true });
        }

        if (key === "address") {
          setValue("applicantAddress", value, { shouldValidate: true, shouldDirty: true });
        }

        if (key === "gender") {
          const genderObj = menu.find((obj) => obj.code === value);
          if (genderObj) setValue("applicantGender", genderObj, { shouldValidate: true, shouldDirty: true });
        }
      });
    }
  }, [userInfo, menu, setValue]);

  // Sync applicantErrors to Redux so parent can check before proceeding
  useEffect(() => {
    if (Object.keys(applicantErrors).length > 0) {
      dispatch(UPDATE_LayoutNewApplication_FORM("applicantErrors", applicantErrors));
    }
  }, [applicantErrors]);

  // Save applicants data to Redux
  useEffect(() => {
    if (
      applicants?.length > 0 ||
      Object.keys(documentUploadedFiles)?.length > 0 ||
      Object.keys(photoUploadedFiles)?.length > 0 ||
      Object.keys(panUploadedFiles)?.length > 0
    ) {
      dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicants));
      dispatch(UPDATE_LayoutNewApplication_FORM("documentUploadedFiles", documentUploadedFiles));
      dispatch(UPDATE_LayoutNewApplication_FORM("photoUploadedFiles", photoUploadedFiles));
      dispatch(UPDATE_LayoutNewApplication_FORM("panUploadedFiles", panUploadedFiles));
    }
  }, [applicants, documentUploadedFiles, photoUploadedFiles, panUploadedFiles, dispatch]);

  // Sync document files with react-hook-form for validation
  useEffect(() => {
    // Set primary owner photo validation
    if (photoUploadedFiles[0]?.fileStoreId) {
      setValue("primaryOwnerPhoto", photoUploadedFiles[0].fileStoreId, { shouldValidate: true });
    } else {
      setValue("primaryOwnerPhoto", "", { shouldValidate: false });
    }

    // Set primary owner document validation
    if (documentUploadedFiles[0]?.fileStoreId) {
      setValue("primaryOwnerDocument", documentUploadedFiles[0].fileStoreId, { shouldValidate: true });
    } else {
      setValue("primaryOwnerDocument", "", { shouldValidate: false });
    }
    // Set primary owner PAN validation
    if (panUploadedFiles[0]?.fileStoreId) {
      setValue("primaryOwnerPan", panUploadedFiles[0].fileStoreId, { shouldValidate: true });
    } else {
      setValue("primaryOwnerPan", "", { shouldValidate: false });
    }
  }, [photoUploadedFiles, documentUploadedFiles, panUploadedFiles, setValue]);

  const handleAddApplicant = () => {
    const newApplicant = {
      mobileNumber: "",
      name: "",
      fatherOrHusbandName: "",
      emailId: "",
      address: "",
      dob: "",
      gender: "",
      panNumber: "",
    };
    setApplicants([...applicants, newApplicant]);
  };

  const handleRemoveApplicant = (index) => {
    const updatedApplicants = applicants.filter((_, i) => i !== index);
    setApplicants(updatedApplicants);

    // Remove associated files
    const newDocFiles = { ...documentUploadedFiles };
    const newPhotoFiles = { ...photoUploadedFiles };
    const newPanFiles = { ...panUploadedFiles };
    delete newDocFiles[index];
    delete newPhotoFiles[index];
    delete newPanFiles[index];
    setDocumentUploadedFiles(newDocFiles);
    setPhotoUploadedFiles(newPhotoFiles);
    setPanUploadedFiles(newPanFiles);
    // Remove errors for this applicant
    const newErrors = { ...applicantErrors };
    delete newErrors[index];
    setApplicantErrors(newErrors);
  };

  const updateApplicant = (index, field, value) => {
    const updatedApplicants = [...applicants];
    updatedApplicants[index] = { ...updatedApplicants[index], [field]: value };
    setApplicants(updatedApplicants);
  };

  const selectDocumentFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        const updatedDocs = { ...documentUploadedFiles, [index]: { fileStoreId: fileId, fileName: file.name } };
        setDocumentUploadedFiles(updatedDocs);
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "" } }));
        // Save to Redux immediately
        dispatch(UPDATE_LayoutNewApplication_FORM({
          documentUploadedFiles: updatedDocs,
          photoUploadedFiles,
          panUploadedFiles,
        }));
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    }
  };

  const selectPhotoFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        const updatedPhotos = { ...photoUploadedFiles, [index]: { fileStoreId: fileId, fileName: file.name } };
        setPhotoUploadedFiles(updatedPhotos);
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "" } }));
        // Save to Redux immediately
        dispatch(UPDATE_LayoutNewApplication_FORM({
          documentUploadedFiles,
          photoUploadedFiles: updatedPhotos,
          panUploadedFiles,
        }));
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    }
  };

  const selectPANFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        const updatedPans = { ...panUploadedFiles, [index]: { fileStoreId: fileId, fileName: file.name } };
        setPanUploadedFiles(updatedPans);
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], pan: "" } }));
        // Save to Redux immediately
        dispatch(UPDATE_LayoutNewApplication_FORM({
          documentUploadedFiles,
          photoUploadedFiles,
          panUploadedFiles: updatedPans,
        }));
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    }
  };

  const deletePan = (index) => {
    const newPanFiles = { ...panUploadedFiles };
    delete newPanFiles[index];
    setPanUploadedFiles(newPanFiles);
  };

  const deleteDocument = (index) => {
    const newDocFiles = { ...documentUploadedFiles };
    delete newDocFiles[index];
    setDocumentUploadedFiles(newDocFiles);
  };

  const deletePhoto = (index) => {
    const newPhotoFiles = { ...photoUploadedFiles };
    delete newPhotoFiles[index];
    setPhotoUploadedFiles(newPhotoFiles);
  };

  const isEdit = window.location.pathname.includes("edit");

  // Expose methods for parent component to validate and save documents
  useImperativeHandle(ref, () => ({
    validateAdditionalApplicants: handleGoNext,
    saveDocumentsToRedux: () => {
      // Save document states to Redux for persistence
      dispatch(UPDATE_LayoutNewApplication_FORM({
        documentUploadedFiles,
        photoUploadedFiles,
        panUploadedFiles,
        applicants
      }));
    }
  }));

  // Validate all applicants and documents before proceeding
  const handleGoNext = (data) => {
    let isValid = true;
    const errors = {};

    // Validate primary owner documents - THIS MUST PASS FIRST
    const primaryOwnerErrors = {};
    if (!photoUploadedFiles[0]?.fileStoreId) {
      primaryOwnerErrors.photo = t("BPA_PASSPORT_PHOTO_REQUIRED");
      isValid = false;
    }
    if (!documentUploadedFiles[0]?.fileStoreId) {
      primaryOwnerErrors.document = t("BPA_ID_PROOF_REQUIRED");
      isValid = false;
    }
    if (!panUploadedFiles[0]?.fileStoreId) {
      primaryOwnerErrors.pan = t("BPA_PAN_REQUIRED");
      isValid = false;
    }

    if (Object.keys(primaryOwnerErrors).length > 0) {
      errors[0] = primaryOwnerErrors;
      setApplicantErrors(errors);
      setShowToast({
        key: "true",
        error: true,
        message: t("Please upload required documents."),
      });
      setTimeout(() => setShowToast(null), 5000);
      // Prevent form submission
      return false;
    }

    // Validate additional applicants
    if (applicants.length > 1) {
      applicants.forEach((applicant, index) => {
        if (index === 0) return;

        const applicantErrors = {};
        let hasError = false;

        if (!applicant.name?.trim()) {
          applicantErrors.name = t("REQUIRED_FIELD");
          hasError = true;
        }
        if (!applicant.mobileNumber?.trim()) {
          applicantErrors.mobileNumber = t("REQUIRED_FIELD");
          hasError = true;
        } else if (!/^[6-9]\d{9}$/.test(applicant.mobileNumber)) {
          applicantErrors.mobileNumber = t("INVALID_MOBILE_NUMBER");
          hasError = true;
        }
        if (!applicant.emailId?.trim()) {
          applicantErrors.emailId = t("REQUIRED_FIELD");
          hasError = true;
        } else if (!/^\S+@\S+\.\S+$/.test(applicant.emailId)) {
          applicantErrors.emailId = t("INVALID_EMAIL_FORMAT");
          hasError = true;
        }
        if (!applicant.address?.trim()) {
          applicantErrors.address = t("REQUIRED_FIELD");
          hasError = true;
        }
        if (!applicant.dob?.trim()) {
          applicantErrors.dob = t("REQUIRED_FIELD");
          hasError = true;
        }
        if (!applicant.gender || (typeof applicant.gender === "object" && !applicant.gender.code)) {
          applicantErrors.gender = t("REQUIRED_FIELD");
          hasError = true;
        }

        // Validate PAN number format
        if (!applicant.panNumber?.trim()) {
          applicantErrors.panNumber = t("REQUIRED_FIELD");
          hasError = true;
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(applicant.panNumber)) {
          applicantErrors.panNumber = "PAN must be in format: 5 uppercase letters + 4 digits + 1 uppercase letter";
          hasError = true;
        }

        // Documents must be uploaded
        if (!photoUploadedFiles[index]?.fileStoreId) {
          applicantErrors.photo = t("BPA_PASSPORT_PHOTO_REQUIRED");
          hasError = true;
        }
        if (!documentUploadedFiles[index]?.fileStoreId) {
          applicantErrors.document = t("BPA_ID_PROOF_REQUIRED");
          hasError = true;
        }
        if (!panUploadedFiles[index]?.fileStoreId) {
          applicantErrors.pan = t("BPA_PAN_REQUIRED");
          hasError = true;
        }

        if (hasError) {
          errors[index] = applicantErrors;
          isValid = false;
        }
      });
    }

    if (!isValid) {
      setApplicantErrors(errors);
      setShowToast({
        key: "true",
        error: true,
        message: t("BPA_PLEASE_FILL_ALL_REQUIRED_FIELDS_AND_UPLOAD_DOCUMENTS"),
      });
      setTimeout(() => setShowToast(null), 5000);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Prevent form submission
      return false;
    }

    // All validations passed
    console.log("[v0] All validations passed, proceeding to next step");
    goNext(data);
  };

  return (
    <React.Fragment>
      {loader && <Loader />}
      <div style={{ padding: "20px" }}>
        {/* <CardSectionHeader className="card-section-header" style={{ marginBottom: "15px" }}>
          {t("BPA_APPLICANT_DETAILS")}
        </CardSectionHeader> */}

        {isEdit && (
          <CardSectionSubText style={{ color: "red", margin: "10px 0px 20px 0px" }}>
            {t("To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section")}
          </CardSectionSubText>
        )}

        <div style={{ marginTop: "20px" }}>
          <CardSectionHeader className="card-section-header" style={{ marginTop: "20px", marginBottom: "20px" }}>
            {t("BPA_APPLICANT_DETAILS")} - Primary
          </CardSectionHeader>

          {/* Mobile Number */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div style={{ display: "flex" }} className="field">
              <Controller
                control={control}
                name="applicantMobileNumber"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: t("INVALID_MOBILE_NUMBER"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      setMobileNo(e.target.value);
                    }}
                    onBlur={props.onBlur}
                    disabled={isEdit}
                    t={t}
                  />
                )}
              />
              {isLoadingMobile ? (
                <div style={{ marginTop: "-20px" }}>
                  <Loader />
                </div>
              ) : (
                <div style={{ marginTop: "17px", marginLeft: "10px" }} className="search-icon">
                  <div onClick={isEdit ? null : getOwnerDetails} style={{ cursor: isEdit ? "not-allowed" : "pointer" }}>
                    <SearchIcon />
                  </div>
                </div>
              )}
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantMobileNumber?.message || ""}</CardLabelError>

          {/* Applicant Name */}
          <LabelFieldPair style={{ marginBottom: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantOwnerOrFirmName"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") },
                }}
                render={(props) => <TextInput value={props.value} onChange={props.onChange} onBlur={props.onBlur} disabled={isEdit} t={t} />}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantOwnerOrFirmName ? errors.applicantOwnerOrFirmName.message : ""}</CardLabelError>

          {/* Father/Husband Name */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantFatherHusbandName"
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

          {/* Email ID */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantEmailId"
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
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantEmailId?.message || ""}</CardLabelError>

          {/* Address */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantAddress"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => <TextArea value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} />}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantAddress?.message || ""}</CardLabelError>

          {/* DOB */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_APPLICANT_DOB_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantDateOfBirth"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    const today = new Date();
                    const dob = new Date(value);
                    const age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    const d = today.getDate() - dob.getDate();
                    const valid = age >= 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                    return valid || t("DOB_MUST_BE_18_YEARS_OLD");
                  },
                }}
                render={(props) => (
                  <TextInput
                    type="date"
                    value={props.value}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    disabled={isEdit}
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantDateOfBirth?.message || ""}</CardLabelError>

          {/* Gender */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_APPLICANT_GENDER_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantGender"
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <RadioButtons
                    t={t}
                    options={menu}
                    optionsKey="code"
                    value={props.value}
                    selectedOption={props.value}
                    onSelect={(e) => {
                      props.onChange(e);
                    }}
                    isDependent={true}
                    disabled={isEdit}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantGender?.message || ""}</CardLabelError>

          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">
              {t("BPA_APPLICANT_PASSPORT_PHOTO")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="passport-photo-primary"
                onUpload={selectPhotoFile(0)}
                onDelete={() => {
                  deletePhoto(0);
                  setPhotoUploadedFiles((prev) => ({ ...prev, [0]: null }));
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], photo: "Passport photo is required" } }));
                }}
                uploadedFile={photoUploadedFiles[0]?.fileStoreId}
                message={photoUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.photo}
                uploadMessage=""
                accept="image/*"
                required
                
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.primaryOwnerPhoto?.message || ""}</CardLabelError>

          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">
              {t("BPA_APPLICANT_ID_PROOF")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="id-proof-primary"
                onUpload={selectDocumentFile(0)}
                onDelete={() => {
                  deleteDocument(0);
                  setDocumentUploadedFiles((prev) => ({ ...prev, [0]: null }));
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], document: "Document upload is required" } }));
                }}
                uploadedFile={documentUploadedFiles[0]?.fileStoreId}
                message={documentUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.document}
                uploadMessage=""
                accept=".pdf"
                required
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.primaryOwnerDocument?.message || ""}</CardLabelError>


 <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">
              {t("BPA_APPLICANT_PAN_DOCUMENT")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="pan-document-primary"
                onUpload={selectPANFile(0)}
                onDelete={() => {
                  deletePan(0);
                  setPanUploadedFiles((prev) => ({ ...prev, [0]: null }));
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], pan: "PAN document is required" } }));
                }}
                uploadedFile={panUploadedFiles[0]?.fileStoreId}
                message={panUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.pan}
                uploadMessage=""
                accept=".pdf"
                required
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.primaryOwnerPan?.message || ""}</CardLabelError>

          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_PAN_NUMBER")}`}  <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantPanNumber"
                rules={{
                   required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
                    message: "PAN must be in format: 5 uppercase letters + 4 digits + 1 uppercase letter (e.g., AAABP5055K)",
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value.toUpperCase());
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    placeholder="AAAAA0000A"
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantPanNumber?.message || ""}</CardLabelError>

         
          {/* Additional Applicants Section */}
          {applicants.length > 1 && (
            <React.Fragment>
              <CardSectionHeader className="card-section-header" style={{ marginTop: "30px", marginBottom: "20px" }}>
                {t("Additional Applicants")}
                <span className="requiredField">*</span>
              </CardSectionHeader>

              {applicants.map(
                (applicant, index) =>
                  index > 0 && (
                    <div key={index}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "20px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #d1d5db",
                        }}
                      >
                        <CardLabel className="card-label-smaller" style={{ fontSize: "16px", fontWeight: "600" }}>
                          {`${t("Applicant")} ${index + 1}`}
                        </CardLabel>
                        <span
                          onClick={() => handleRemoveApplicant(index)}
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title={t("Remove Applicant")}
                        >
                          <DeleteIcon fill="#a82227" />
                        </span>
                      </div>

                      {/* Mobile Number */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div style={{ display: "flex" }} className="field">
                          <TextInput value={applicant.mobileNumber} onChange={(e) => updateApplicant(index, "mobileNumber", e.target.value)} t={t} />
                          <div
                            style={{ marginTop: "17px", cursor: "pointer" }}
                            className="search-icon"
                            onClick={() => !additionalOwnerSearchLoading[index] && getAdditionalOwnerDetails(index)}
                          >
                            {additionalOwnerSearchLoading[index] ? (
                              <div style={{ marginTop: "-20px" }}>
                                <Loader />
                              </div>
                            ) : (
                              <SearchIcon />
                            )}
                          </div>
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.mobileNumber && <CardLabelError>{applicantErrors[index].mobileNumber}</CardLabelError>}

                      {/* Name */}
                      <LabelFieldPair style={{ marginBottom: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput value={applicant.name} onChange={(e) => updateApplicant(index, "name", e.target.value)} t={t} />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.name && <CardLabelError>{applicantErrors[index].name}</CardLabelError>}

                      {/* Father/Husband Name */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
                        <div className="field">
                          <TextInput
                            value={applicant.fatherOrHusbandName}
                            onChange={(e) => updateApplicant(index, "fatherOrHusbandName", e.target.value)}
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>

                      {/* Email ID */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput value={applicant.emailId} onChange={(e) => updateApplicant(index, "emailId", e.target.value)} t={t} />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.emailId && <CardLabelError>{applicantErrors[index].emailId}</CardLabelError>}

                      {/* Address */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextArea value={applicant.address} onChange={(e) => updateApplicant(index, "address", e.target.value)} t={t} />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.address && <CardLabelError>{applicantErrors[index].address}</CardLabelError>}

                      {/* DOB */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("BPA_APPLICANT_DOB_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput
                            type="date"
                            value={applicant.dob}
                            onChange={(e) => updateApplicant(index, "dob", e.target.value)}
                            min="1900-01-01"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.dob && <CardLabelError>{applicantErrors[index].dob}</CardLabelError>}

                      {/* Gender */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("BPA_APPLICANT_GENDER_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <RadioButtons
                            t={t}
                            options={menu}
                            optionsKey="code"
                            value={applicant.gender}
                            selectedOption={applicant.gender}
                            onSelect={(e) => {
                              const selectedGenderObj = menu.find((m) => m.code === e.code);
                              updateApplicant(index, "gender", selectedGenderObj || e);
                            }}
                            isDependent={true}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.gender && <CardLabelError>{applicantErrors[index].gender}</CardLabelError>}

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "3rem" }}>
                        <CardLabel className="card-label-smaller">
                          {t("BPA_APPLICANT_PASSPORT_PHOTO")}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`passport-photo-${index}`}
                            onUpload={selectPhotoFile(index)}
                            onDelete={() => {
                              deletePhoto(index);
                              setPhotoUploadedFiles((prev) => ({ ...prev, [index]: null }));
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "Passport photo is required" } }));
                            }}
                            uploadedFile={photoUploadedFiles[index]?.fileStoreId}
                            message={photoUploadedFiles[index]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.photo}
                            uploadMessage=""
                            accept="image/*"
                          />
                        </div>
                      </LabelFieldPair>

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "3rem" }}>
                        <CardLabel className="card-label-smaller">
                          {t("BPA_APPLICANT_ID_PROOF")}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`id-proof-${index}`}
                            onUpload={selectDocumentFile(index)}
                            onDelete={() => {
                              deleteDocument(index);
                              setDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }));
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "Document upload is required" } }));
                            }}
                            uploadedFile={documentUploadedFiles[index]?.fileStoreId}
                            message={documentUploadedFiles[index]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.document}
                            uploadMessage=""
                            accept=".pdf"
                          />
                        </div>
                      </LabelFieldPair>

                       <LabelFieldPair style={{ marginBottom: "15px", marginTop: "3rem" }}>
                        <CardLabel className="card-label-smaller">
                          {t("BPA_APPLICANT_PAN_DOCUMENT")}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`pan-proof-${index}`}
                            onUpload={selectPANFile(index)}
                            onDelete={() => {
                              deletePan(index);
                              setPanUploadedFiles((prev) => ({ ...prev, [index]: null }));
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], pan: "PAN document is required" } }));
                            }}
                            uploadedFile={panUploadedFiles[index]?.fileStoreId}
                            message={panUploadedFiles[index]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.pan}
                            uploadMessage=""
                            accept=".pdf"
                          />
                        </div>
                      </LabelFieldPair>

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("BPA_APPLICANT_PAN_NUMBER")}`} <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput 
                            value={applicant.panNumber} 
                            onChange={(e) => updateApplicant(index, "panNumber", e.target.value.toUpperCase())} 
                            placeholder="AAAAA0000A"
                            t={t} 
                            required
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.panNumber && <CardLabelError>{applicantErrors[index].panNumber}</CardLabelError>}

                     
                    </div>
                  )
              )}

              {/* Add More Applicants Button */}
              <div style={{ marginTop: "20px" }}>
                <div
                  onClick={handleAddApplicant}
                  style={{
                    color: "#a82227",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  {!isEdit && `+ Add Owner`}
                </div>
              </div>
            </React.Fragment>
          )}

          {/* Add First Additional Applicant Button */}
          {applicants.length === 1 && (
            <div style={{ marginTop: "20px" }}>
              <div
                onClick={handleAddApplicant}
                style={{
                  color: "#a82227",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
               {!isEdit && `+ Add Owner`}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* TOAST */}
      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />}
    </React.Fragment>
  );
});

export default LayoutApplicantDetails;
