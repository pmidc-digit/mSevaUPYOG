import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
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
  DatePicker,
} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";
import CustomUploadFile from "../components/CustomUploadFile";
import { useHistory, useLocation } from "react-router-dom";
import { UPDATE_LayoutNewApplication_FORM } from "../redux/actions/LayoutNewApplicationActions";
import { LoaderNew } from "../components/LoaderNew";

const applicantTypeOptions = [
  { name: "Individual", code: "INDIVIDUAL" },
  { name: "Firm", code: "FIRM" },
];

const findApplicantTypeOption = (val) => {
  if (!val) return null;
  const strVal = (typeof val === "string" ? val : val?.code || val?.name || "").toUpperCase();
  return applicantTypeOptions.find((opt) => opt.code.toUpperCase() === strVal || opt.name.toUpperCase() === strVal) || null;
};

const useQueryParam = (key) => {
  const { search } = useLocation();
  return new URLSearchParams(search).get(key);
};

const LayoutApplicantDetails = (_props) => {
  const dispatch = useDispatch();
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, trigger, getValues, clearErrors, register } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  // Determine if in edit mode
  const applicationNo = currentStepData?.applicationNo || currentStepData?.apiData?.Layout?.[0]?.applicationNo;
  const applicationNO = useQueryParam("applicationNo");
  const isEditMode = !!applicationNo || !!applicationNO;

  const [mobileNo, setMobileNo] = useState("");
  const [showToast, setShowToast] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({});
  const [photoUploadedFiles, setPhotoUploadedFiles] = useState({});
  const [panDocumentUploadedFiles, setPanDocumentUploadedFiles] = useState({});
  const [loader, setLoader] = useState(false);
  const [applicantErrors, setApplicantErrors] = useState({});
  // State for additional owner mobile search
  const [isLoading, setIsLoading] = useState(false);
  const [additionalOwnerMobileNo, setAdditionalOwnerMobileNo] = useState({});
  const [additionalOwnerSearchLoading, setAdditionalOwnerSearchLoading] = useState({});
  const [primaryApplicantType, setPrimaryApplicantType] = useState({});
  const isDataInitialized = useRef(false);
  //console.log("userInfo here", getValues("aplicantType"), applicants);
  const closeToast = () => setShowToast(null);

  useEffect(() => {
    register("primaryOwnerPhoto", { required: t("REQUIRED_FIELD") });
    register("primaryOwnerDocument", { required: t("REQUIRED_FIELD") });
    register("panDocumentUploadedFiles", { required: t("REQUIRED_FIELD") });
  }, [register]);

  const { isLoading: genderTypeDataLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  const menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({
        i18nKey: `COMMON_GENDER_${genderDetails.code}`,
        code: `${genderDetails.code}`,
        value: `${genderDetails.code}`,
      });
    });
  const isUserArchitect = userInfo?.info?.roles?.find((item) => item?.code === "BPA_ARCHITECT");
  // const { data: professionalData, isLoading: professionalDataLoading } = Digit.Hooks.obps.useBPAREGSearch(
  //   isUserArchitect ? "pb.punjab" : tenantId,
  //   {},
  //   { mobileNumber: userInfo?.info?.mobileNumber },
  //   { cacheTime: 0 }
  // );

  useEffect(() => {
    console.log("LayoutApplicantDetails data restore effect run, isDataInitialized =", isDataInitialized.current, currentStepData);
    // Only restore data on mount / first load, not on every change
    if (isDataInitialized.current) return;

    const formattedData = currentStepData?.applicationDetails;

    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key === "aplicantType") {
          const normalized = findApplicantTypeOption(value);
          setValue(key, normalized);
          if (normalized) setPrimaryApplicantType(normalized);
        } else {
          setValue(key, value);
        }
      });
    }

    // Restore additional applicants from currentStepData
    if (currentStepData?.applicants && currentStepData.applicants.length > 0) {
      //console.log("[v0] Restoring applicants from currentStepData.applicants:", currentStepData.applicants);
      setApplicants(currentStepData.applicants);
    }
    // If no applicants in Redux, check if we're in edit mode and have owners from API
    else if (currentStepData?.apiData?.Layout?.[0]?.owners && currentStepData?.apiData?.Layout?.[0]?.owners?.length > 1) {
      const ownersFromApi = [...currentStepData.apiData.Layout[0].owners].sort((a, b) => {
        const aPrimary = a?.isPrimaryOwner === true || a?.isPrimaryOwner === "true";
        const bPrimary = b?.isPrimaryOwner === true || b?.isPrimaryOwner === "true";
        if (aPrimary && !bPrimary) return -1;
        if (!aPrimary && bPrimary) return 1;
        return 0;
      });
      //console.log("[v0] Mapping owners from API response:", ownersFromApi);

      // Map additional owners (skip index 0 as it's the primary owner in applicationDetails)
      const additionalApplicants = ownersFromApi.slice(1).map((owner, idx) => {
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
          actualIndex: idx,
          name: owner?.name || "",
          fatherOrHusbandName: owner?.fatherOrHusbandName || "",
          mobileNumber: owner?.mobileNumber || "",
          emailId: owner?.emailId || "",
          address: owner?.permanentAddress || owner?.address || "",
          dob: formattedDob,
          gender: genderObj,
          panNumber: owner?.pan || owner?.panNumber || "",
          photoUploadedFiles: owner?.additionalDetails?.ownerPhoto || null,
          documentUploadedFiles: owner?.additionalDetails?.documentFile || null,
          panDocumentUploadedFiles: owner?.additionalDetails?.panDocument || null,
          aplicantType: owner?.additionalDetails?.aplicantType || null,
          // Store original owner data for reference
          uuid: owner?.uuid || "",
          id: owner?.id || "",
          status: owner?.status || true
        };
      });

      //console.log("[v0] Mapped additional applicants:", additionalApplicants);
      setApplicants(additionalApplicants);
    }

    // Restore document uploaded files from Redux state
    if (currentStepData?.documentUploadedFiles && Object.keys(currentStepData.documentUploadedFiles).length > 0) {
      //console.log("[v0] Restoring documentUploadedFiles from Redux:", currentStepData.documentUploadedFiles);
      setDocumentUploadedFiles(currentStepData.documentUploadedFiles);
    }
    
    // Restore photo uploaded files from Redux state
    if (currentStepData?.photoUploadedFiles && Object.keys(currentStepData.photoUploadedFiles).length > 0) {
      //console.log("[v0] Restoring photoUploadedFiles from Redux:", currentStepData.photoUploadedFiles);
      setPhotoUploadedFiles(currentStepData.photoUploadedFiles);
    }

    // Restore PAN document uploaded files from Redux state
    if (currentStepData?.panDocumentUploadedFiles && Object.keys(currentStepData.panDocumentUploadedFiles).length > 0) {
      //console.log("[v0] Restoring panDocumentUploadedFiles from Redux:", currentStepData.panDocumentUploadedFiles);
      setPanDocumentUploadedFiles(currentStepData.panDocumentUploadedFiles);
    }

    // Map documents from additionalDetails in API response during edit mode (only if Redux data is empty)
    if (
      isEditMode && 
      currentStepData?.apiData?.Layout?.[0]?.owners &&
      (!currentStepData?.documentUploadedFiles || Object.keys(currentStepData.documentUploadedFiles).length === 0)
    ) {
      const ownersFromApi = [...currentStepData.apiData.Layout[0].owners].sort((a, b) => {
        const aPrimary = a?.isPrimaryOwner === true || a?.isPrimaryOwner === "true";
        const bPrimary = b?.isPrimaryOwner === true || b?.isPrimaryOwner === "true";
        if (aPrimary && !bPrimary) return -1;
        if (!aPrimary && bPrimary) return 1;
        return 0;
      });
      //console.log("[v0] Mapping documents from owners additionalDetails");

      const docFiles = {};
      const photoFiles = {};
      const panDocFiles = {};

      // Map documents for all owners from their additionalDetails
      ownersFromApi.forEach((owner, ownerIndex) => {
        if (owner?.additionalDetails?.documentFile) {
          docFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.documentFile, fileName: "Document" };
        }
        if (owner?.additionalDetails?.ownerPhoto) {
          photoFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.ownerPhoto, fileName: "Photo" };
        }
        if (owner?.additionalDetails?.panDocument) {
          panDocFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.panDocument, fileName: "PAN Document" };
        }
      });

      //console.log("[v0] Mapped document files:", docFiles);
      //console.log("[v0] Mapped photo files:", photoFiles);
      //console.log("[v0] Mapped PAN document files:", panDocFiles);

      if (Object.keys(docFiles).length > 0) {
        setDocumentUploadedFiles(docFiles);
      }
      if (Object.keys(photoFiles).length > 0) {
        setPhotoUploadedFiles(photoFiles);
      }
      if (Object.keys(panDocFiles).length > 0) {
        setPanDocumentUploadedFiles(panDocFiles);
      }
    }

    if (formattedData || currentStepData?.apiData?.Layout?.[0]?.owners || !isEditMode) {
      isDataInitialized.current = true;
    }
  }, [currentStepData]);

  const getOwnerDetails = async () => {
    const currentMobile = getValues("applicantMobileNumber") || mobileNo;

    if (!currentMobile || currentMobile.length !== 10 || !/^[6-9]\d{9}$/.test(currentMobile)) {
      setShowToast({
        key: "true",
        error: true,
        message: t("INVALID_MOBILE_NUMBER"),
      });
      return;
    }
    setIsLoading(true);

    try {
      const userResponse = await Digit.UserService.userSearch(stateId, { userName: currentMobile }, {});
      setIsLoading(false);

      if (!userResponse?.user?.length) {
        setShowToast({
          key: "true",
          warning: true,
          message: t("ERR_MOBILE_NUMBER_NOT_REGISTERED"),
        });
        return;
      }

      const u = userResponse.user[0];
      setUserInfo(u);

      if (u.name) setValue("applicantOwnerOrFirmName", u.name, { shouldValidate: true, shouldDirty: true });
      if (u.emailId) setValue("applicantEmailId", u.emailId, { shouldValidate: true, shouldDirty: true });
      if (u.dob) {
        let formattedDob = "";
        if (typeof u.dob === "string") {
          formattedDob = u.dob.slice(0, 10);
        } else if (typeof u.dob === "number") {
          const d = new Date(u.dob);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          formattedDob = `${year}-${month}-${day}`;
        }
        setValue("applicantDateOfBirth", formattedDob, { shouldValidate: true, shouldDirty: true });
      }
      if (u.fatherOrHusbandName) setValue("applicantFatherHusbandName", u.fatherOrHusbandName, { shouldValidate: true, shouldDirty: true });
      if (u.permanentAddress) setValue("applicantAddress", u.permanentAddress, { shouldValidate: true, shouldDirty: true });
      if (u.gender) {
        const genderObj = menu.find((obj) => obj.code === u.gender) || u.gender;
        if (genderObj) setValue("applicantGender", genderObj, { shouldValidate: true, shouldDirty: true });
      }

      clearErrors(["applicantOwnerOrFirmName", "applicantEmailId", "applicantDateOfBirth", "applicantAddress", "applicantGender"]);

      setShowToast({
        key: "true",
        warning: false,
        error: false,
        message: t("Applicant details fetched successfully"),
      });
    } catch (err) {
      setIsLoading(false);
      setShowToast({
        key: "true",
        error: true,
        message: t("Error fetching applicant details"),
      });
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
      clearErrors(`applicants.${index}`);
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

  // Save applicants data to Redux
  useEffect(() => {
    if (
      isDataInitialized.current &&
      (applicants?.length > 0 ||
      Object.keys(documentUploadedFiles)?.length > 0 ||
      Object.keys(photoUploadedFiles)?.length > 0 ||
      Object.keys(panDocumentUploadedFiles)?.length > 0)
    ) {
      const formValues = getValues();
      const updatedDetails = {
        ...currentStepData?.applicationDetails,
        aplicantType: formValues?.aplicantType || currentStepData?.applicationDetails?.aplicantType,
        authorisedPerson: formValues?.authorisedPerson || currentStepData?.applicationDetails?.authorisedPerson,
        applicantOwnerOrFirmName: formValues?.applicantOwnerOrFirmName || currentStepData?.applicationDetails?.applicantOwnerOrFirmName,
        applicantMobileNumber: formValues?.applicantMobileNumber || currentStepData?.applicationDetails?.applicantMobileNumber,
        applicantEmailId: formValues?.applicantEmailId || currentStepData?.applicationDetails?.applicantEmailId,
        applicantAddress: formValues?.applicantAddress || currentStepData?.applicationDetails?.applicantAddress,
        applicantFatherHusbandName: formValues?.applicantFatherHusbandName || currentStepData?.applicationDetails?.applicantFatherHusbandName,
        applicantDateOfBirth: formValues?.applicantDateOfBirth || currentStepData?.applicationDetails?.applicantDateOfBirth,
        applicantGender: formValues?.applicantGender || currentStepData?.applicationDetails?.applicantGender,
        panNumber: formValues?.panNumber || currentStepData?.applicationDetails?.panNumber,
        // Also preserve files
        documentUploadedFiles: formValues?.primaryOwnerDocument || formValues?.documentUploadedFiles || currentStepData?.applicationDetails?.documentUploadedFiles,
        photoUploadedFiles: formValues?.primaryOwnerPhoto || formValues?.photoUploadedFiles || currentStepData?.applicationDetails?.photoUploadedFiles,
        panDocumentUploadedFiles: formValues?.panDocumentUploadedFiles || currentStepData?.applicationDetails?.panDocumentUploadedFiles,
        primaryOwnerPhoto: formValues?.primaryOwnerPhoto || currentStepData?.applicationDetails?.primaryOwnerPhoto,
        primaryOwnerDocument: formValues?.primaryOwnerDocument || currentStepData?.applicationDetails?.primaryOwnerDocument,
      };

      dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedDetails));
      dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicants));
      dispatch(UPDATE_LayoutNewApplication_FORM("documentUploadedFiles", documentUploadedFiles));
      dispatch(UPDATE_LayoutNewApplication_FORM("photoUploadedFiles", photoUploadedFiles));
      dispatch(UPDATE_LayoutNewApplication_FORM("panDocumentUploadedFiles", panDocumentUploadedFiles));
    }
  }, [applicants, documentUploadedFiles, photoUploadedFiles, panDocumentUploadedFiles, dispatch]);



  const handleAddApplicant = () => {
    const newApplicant = {
      actualIndex: applicants?.length,
      name: "",
      fatherOrHusbandName: "",
      mobileNumber: "",
      emailId: "",
      address: "",
      dob: "",
      gender: "",
      panNumber:"",
      status: true,
    };
    setApplicants([...applicants, newApplicant]);
  };

  const handleRemoveApplicant = (index) => {
    // const updatedApplicants = applicants.filter((_, i) => i !== index);
    // setApplicants(updatedApplicants);
    clearErrors(`applicants`);
    setApplicants((prev) => {
      const newApplicantArray = [...prev]

      newApplicantArray[index].status = false;

      return newApplicantArray
    });

    const newDocFiles = { ...documentUploadedFiles };
    const newPhotoFiles = { ...photoUploadedFiles };
    const newPanFiles = { ...panDocumentUploadedFiles };
    delete newDocFiles[index + 1];
    delete newPhotoFiles[index + 1];
    delete newPanFiles[index + 1];
    setDocumentUploadedFiles(newDocFiles);
    setPhotoUploadedFiles(newPhotoFiles);
    setPanDocumentUploadedFiles(newPanFiles);

    // Remove errors for this applicant
    const newErrors = { ...applicantErrors };
    delete newErrors[index];
    setApplicantErrors(newErrors);
  };

  const updateApplicant = (index, field, value) => {
    clearErrors(`applicants.${index}.${field}`);
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
        const updatedDocFiles = { ...documentUploadedFiles, [index]: { fileStoreId: fileId, fileName: file.name } };
        setDocumentUploadedFiles(updatedDocFiles);
        if(index === 0){
          setValue("primaryOwnerDocument", fileId, { shouldValidate: true });
          clearErrors("primaryOwnerDocument");
        }else{
          clearErrors(`applicants.${index - 1}.document`);
          setApplicants(prev => {
            const updated = [...prev];
            if(!updated[index-1]) updated[index-1] = {};
            updated[index-1].documentUploadedFiles = fileId;
            return updated;
          })          
        }
        // Immediately dispatch to Redux for persistence
        dispatch(UPDATE_LayoutNewApplication_FORM("documentUploadedFiles", updatedDocFiles));
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "" } }));
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
        const updatedPhotoFiles = { ...photoUploadedFiles, [index]: { fileStoreId: fileId, fileName: file.name } };
        setPhotoUploadedFiles(updatedPhotoFiles);
        if(index === 0){
          setValue("primaryOwnerPhoto", fileId, { shouldValidate: true });
          clearErrors("primaryOwnerPhoto");
        }else{
          clearErrors(`applicants.${index - 1}.photo`);
          setApplicants(prev => {
            const updated = [...prev];
            if(!updated[index-1]) updated[index-1] = {};
            updated[index-1].photoUploadedFiles = fileId;
            return updated;
          })          
        }
        // Immediately dispatch to Redux for persistence
        dispatch(UPDATE_LayoutNewApplication_FORM("photoUploadedFiles", updatedPhotoFiles));
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "" } }));
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    }
  };

  const deleteDocument = (index) => {
    const newDocFiles = { ...documentUploadedFiles };
    delete newDocFiles[index];
    setDocumentUploadedFiles(newDocFiles);
    // Dispatch to Redux for persistence
    dispatch(UPDATE_LayoutNewApplication_FORM("documentUploadedFiles", newDocFiles));
  };

  const deletePhoto = (index) => {
    const newPhotoFiles = { ...photoUploadedFiles };
    delete newPhotoFiles[index];
    setPhotoUploadedFiles(newPhotoFiles);
    // Dispatch to Redux for persistence
    dispatch(UPDATE_LayoutNewApplication_FORM("photoUploadedFiles", newPhotoFiles));
  };

  // PAN Document Upload Handler
  const selectPanDocumentFile = (index) => async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") });
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("Layout", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        const updatedPanDocFiles = { ...panDocumentUploadedFiles, [index]: { fileStoreId: fileId, fileName: file.name } };
        setPanDocumentUploadedFiles(updatedPanDocFiles);
        if(index === 0){
          setValue("panDocumentUploadedFiles", fileId, { shouldValidate: true });
          clearErrors("panDocumentUploadedFiles");
        }else{
          clearErrors(`applicants.${index - 1}.panDocument`);
          setApplicants(prev => {
            const updated = [...prev];
            if(!updated[index-1]) updated[index-1] = {};
            updated[index-1].panDocumentUploadedFiles = fileId;
            return updated;
          })          
        }
        // Immediately dispatch to Redux for persistence
        dispatch(UPDATE_LayoutNewApplication_FORM("panDocumentUploadedFiles", updatedPanDocFiles));
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], panDocument: "" } }));
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") });
    }
  };

  const deletePanDocument = (index) => {
    const newPanDocFiles = { ...panDocumentUploadedFiles };
    delete newPanDocFiles[index];
    setPanDocumentUploadedFiles(newPanDocFiles);
    // Dispatch to Redux for persistence
    dispatch(UPDATE_LayoutNewApplication_FORM("panDocumentUploadedFiles", newPanDocFiles));
  };

  const isEdit = window.location.pathname.includes("edit") || !!applicationNO;

  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{message}</div>;
  };

  const activeApplicants = applicants?.filter(a => a?.status);

  const currentApplicantTypeCode = (getValues("aplicantType")?.code || getValues("aplicantType") || primaryApplicantType?.code || primaryApplicantType || "").toString().toUpperCase();
  const isFirm = currentApplicantTypeCode === "FIRM";

  return (
    <React.Fragment>
      {loader && <Loader />}
      <div>        
        <CardSectionHeader className="card-section-header" style={{ marginBottom: "15px" }}>
          {t("BPA_APPLICANT_DETAILS")}
        </CardSectionHeader>

        {isEdit && (
          <CardSectionSubText style={{ color: "red", margin: "10px 0px 20px 0px" }}>
            {t(
              "To update Applicant Details -  Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section"
            )}
          </CardSectionSubText>
        )}

        <div style={{ marginTop: "20px" }}>
          <CardSectionHeader className="card-section-header" style={{ marginTop: "20px", marginBottom: "20px" }}>
            Primary Owner
          </CardSectionHeader>

          {/* Mobile Number */}
          <LabelFieldPair  >
            <CardLabel className="card-label-smaller">
              {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            {isLoading ? <Loader /> : null}
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
                      clearErrors("applicantMobileNumber");
                    }}
                    onBlur={props.onBlur}
                    // disabled={isEdit}
                    t={t}
                  />
                )}
              />
              {/* <div style={{ marginTop: "25px" }} className="search-icon" onClick={isEdit ? null : getOwnerDetails}> */}
              <div style={{ marginTop: "25px" }} className="search-icon" onClick={getOwnerDetails}>
                <SearchIcon />
              </div>
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantMobileNumber?.message || ""}</CardLabelError>

          

      

          <LabelFieldPair style={{ marginBottom: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("CLU_OWNER_TYPE_LABEL")}`} <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
                <Controller
                  control={control}
                  name={"aplicantType"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {                        
                        props.onChange(e);
                        setPrimaryApplicantType(e)
                        clearErrors("aplicantType");
                      }}
                      selected={findApplicantTypeOption(props.value)}
                      option={applicantTypeOptions}
                      optionKey="name"
                      // disable={isEditMode}
                      t={t}
                    />
                  )}
                />              
            
            </div>
          </LabelFieldPair>
            <CardLabelError style={errorStyle}>{errors?.aplicantType?.message || ""}</CardLabelError>

        

          {isFirm && <React.Fragment> <LabelFieldPair style={{ marginBottom: "15px" }}>
            <CardLabel className="card-label-smaller">
              {t("NEW_LAYOUT_FIRM_NAME_LABEL")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="authorisedPerson"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      clearErrors("authorisedPerson");
                    }}
                    onBlur={props.onBlur}
                    // disabled={isEdit}
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.authorisedPerson ? errors.authorisedPerson.message : ""}</CardLabelError>
          </React.Fragment>}

                {/* Applicant Name */}
          <LabelFieldPair style={{ marginBottom: "15px" }}>
            <CardLabel className="card-label-smaller">
              {`${isFirm ? t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL") : t("APPLICANT_NAME")}`}
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
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      clearErrors("applicantOwnerOrFirmName");
                    }}
                    onBlur={props.onBlur}
                    // disabled={isEdit}
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantOwnerOrFirmName ? errors.applicantOwnerOrFirmName.message : ""}</CardLabelError>

          {/* Father/Husband Name */}
          <LabelFieldPair  >
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
          <LabelFieldPair  >
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
                      clearErrors("applicantEmailId");
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
          <LabelFieldPair  >
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
                render={(props) => (
                  <TextArea
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                      clearErrors("applicantAddress");
                    }}
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantAddress?.message || ""}</CardLabelError>

          {/* DOB */}
          <LabelFieldPair  >
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
                    if (!value) return true;
                    const dob = new Date(value);
                    if (isNaN(dob.getTime())) return t("Invalid Date Format");
                    const today = new Date();
                    const age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    const d = today.getDate() - dob.getDate();
                    const valid = age >= 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                    return valid || t("DOB_MUST_BE_18_YEARS_OLD");
                  },
                }}
                render={(props) => (
                  <DatePicker
                    date={props.value}
                    onChange={(val) => {
                      props.onChange(val);
                      clearErrors("applicantDateOfBirth");
                    }}
                    onBlur={props.onBlur}
                    // disabled={isEdit}
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantDateOfBirth?.message || ""}</CardLabelError>

          {/* Gender */}
          <LabelFieldPair  >
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
                      clearErrors("applicantGender");
                    }}
                    isDependent={true}
                    // disabled={isEdit}
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
                      setValue("primaryOwnerPhoto", "", { shouldValidate: true });
                      setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], photo: "Passport photo is required" } }));
                    }}
                    uploadedFile={photoUploadedFiles[0]?.fileStoreId}
                    message={photoUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                    error={applicantErrors[0]?.photo}
                    uploadMessage="Invalid File Format"
                    accept=".png, .jpeg, .jpg"
                  />
              <p className="upload-file-message">{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
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
                      setValue("primaryOwnerDocument", "", { shouldValidate: true });
                      setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], document: "Document upload is required" } }));
                    }}
                    uploadedFile={documentUploadedFiles[0]?.fileStoreId}
                    message={documentUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                    error={applicantErrors[0]?.document}
                    uploadMessage="Invalid File Format"
                    accept=".pdf, .png, .jpeg, .jpg"
                  />
              <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.primaryOwnerDocument?.message || ""}</CardLabelError>
          {/* PAN Document */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">
              {t("BPA_PAN_DOCUMENT")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field" style={{ width: "100%" }}>
                <CustomUploadFile
                  id="pan-document-primary"
                  onUpload={selectPanDocumentFile(0)}
                  onDelete={() => {
                    deletePanDocument(0);
                    setPanDocumentUploadedFiles((prev) => ({ ...prev, [0]: null }));
                    setValue("panDocumentUploadedFiles", "", { shouldValidate: true });
                    setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], panDocument: "PAN document is required" } }));
                  }}
                  uploadedFile={panDocumentUploadedFiles[0]?.fileStoreId}
                  message={panDocumentUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                  error={applicantErrors[0]?.panDocument}
                  uploadMessage="Invalid File Format"
                  accept=".pdf, .png, .jpeg, .jpg"
                />
              <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.panDocumentUploadedFiles?.message || ""}</CardLabelError>

          {/* PAN Number */}
          <LabelFieldPair  >
            <CardLabel className="card-label-smaller">
              {`${t("BPA_PAN_NUMBER_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="panNumber"
                rules={{
                  maxLength: {
                    value: 10,
                    message: "PAN Number should not exceed 10 characters",
                  },
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "Invalid PAN Number format. Format should be like AAAAA1234A",
                  },
                  required: t("REQUIRED_FIELD")
                }}
                render={(props) => (
                  <TextInput
                    value={props.value || ""}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      props.onChange(upperValue);
                      clearErrors("panNumber");
                    }}
                    onBlur={props.onBlur}
                    placeholder="e.g., AAAAA1234A"
                    maxlength={10}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.panNumber?.message || ""}</CardLabelError>



          {/* Additional Applicants Section */}
          {applicants.length > 0 && (
            <React.Fragment>
              <CardSectionHeader className="card-section-header" style={{ marginTop: "30px", marginBottom: "20px" }}>
                {t("Additional Owners")}
              </CardSectionHeader>

              {applicants?.map(
                (applicant, index) => {
                  if (!applicant?.status) return null;
                  const visibleIndex = activeApplicants.findIndex(a => a === applicant); // index of visible Applicant is not same to the index of total applicants

                  return (
                    <div key={index}>                    
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #d1d5db",
                        }}
                      >
                        <CardLabel className="card-label-smaller" style={{ fontSize: "16px", fontWeight: "600" }}>
                          {`${t("Owner")} ${visibleIndex + 2}`}
                        </CardLabel>
                        {/* {!isEditMode && ( */}
                        {(
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
                        )}
                      </div>

                      {/* Mobile Number */}
                      <LabelFieldPair  >
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                       {additionalOwnerSearchLoading[index] ? <Loader /> : null}
                        <div style={{ display: "flex" }} className="field">
                          <TextInput value={applicant.mobileNumber} onChange={(e) => updateApplicant(index, "mobileNumber", e.target.value)} t={t} />
                          <div
                            style={{ marginTop: "23px", cursor: "pointer" }}
                            className="search-icon"
                            onClick={() => !additionalOwnerSearchLoading[index] && getAdditionalOwnerDetails(index)}
                          >
                             <SearchIcon />
                          </div>
                        </div>
                      </LabelFieldPair>
                      {/* {applicantErrors[index]?.mobileNumber && <ErrorMessage>{applicantErrors[index].mobileNumber}</ErrorMessage>} */}
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.mobileNumber?.message || ""}</CardLabelError>                    

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
                      {/* {applicantErrors[index]?.name && <ErrorMessage>{applicantErrors[index].name}</ErrorMessage>} */}
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.name?.message || ""}</CardLabelError>

                      {/* Father/Husband Name */}
                      <LabelFieldPair  >
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
                      <LabelFieldPair  >
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput value={applicant.emailId} onChange={(e) => updateApplicant(index, "emailId", e.target.value)} t={t} />
                        </div>
                      </LabelFieldPair>
                      {/* {applicantErrors[index]?.emailId && <ErrorMessage>{applicantErrors[index].emailId}</ErrorMessage>} */}
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.emailId?.message || ""}</CardLabelError>

                      {/* Address */}
                      <LabelFieldPair  >
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextArea value={applicant.address} onChange={(e) => updateApplicant(index, "address", e.target.value)} t={t} />
                        </div>
                      </LabelFieldPair>
                      {/* {applicantErrors[index]?.address && <ErrorMessage>{applicantErrors[index].address}</ErrorMessage>} */}
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.address?.message || ""}</CardLabelError>

                      {/* DOB */}
                      <LabelFieldPair  >
                        <CardLabel className="card-label-smaller">
                          {`${t("BPA_APPLICANT_DOB_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <DatePicker
                            date={applicant.dob}
                            onChange={(val) => updateApplicant(index, "dob", val)}
                            min="1900-01-01"
                            max={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </LabelFieldPair>
                      {/* {applicantErrors[index]?.dob && <ErrorMessage>{applicantErrors[index].dob}</ErrorMessage>} */}
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.dob?.message || ""}</CardLabelError>

                      {/* Gender */}
                      <LabelFieldPair  >
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
                      {/* {applicantErrors[index]?.gender && <ErrorMessage>{applicantErrors[index].gender}</ErrorMessage>} */}
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.gender?.message || ""}</CardLabelError>

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "3rem" }}>
                        <CardLabel className="card-label-smaller">
                          {t("BPA_APPLICANT_PASSPORT_PHOTO")}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`passport-photo-${index}`}
                            onUpload={selectPhotoFile(index+1)}
                            onDelete={() => {
                              deletePhoto(index + 1);
                              setPhotoUploadedFiles((prev) => ({ ...prev, [index + 1]: null }));
                              setApplicants((prev) => {
                                const updated = [...prev];
                                if (updated[index]) {
                                  updated[index].photoUploadedFiles = null;
                                }
                                return updated;
                              });
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "Passport photo is required" } }));
                            }}
                            uploadedFile={applicant.photoUploadedFiles}
                            message={applicant.photoUploadedFiles ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.photo}
                            uploadMessage="Invalid File Format"
                            accept=".png, .jpeg, .jpg"
                          />
                          <p className="upload-file-message">{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
                        </div>
                      </LabelFieldPair>
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.photo?.message || ""}</CardLabelError>

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "3rem" }}>
                        <CardLabel className="card-label-smaller">
                          {t("BPA_APPLICANT_ID_PROOF")}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`id-proof-${index}`}
                            onUpload={selectDocumentFile(index+1)}
                            onDelete={() => {
                              deleteDocument(index + 1);
                              setDocumentUploadedFiles((prev) => ({ ...prev, [index + 1]: null }));
                              setApplicants((prev) => {
                                const updated = [...prev];
                                if (updated[index]) {
                                  updated[index].documentUploadedFiles = null;
                                }
                                return updated;
                              });
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "Document upload is required" } }));
                            }}
                            uploadedFile={applicant.documentUploadedFiles}
                            message={applicant.documentUploadedFiles ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.document}
                            uploadMessage="Invalid File Format"
                            accept=".pdf, .png, .jpeg, .jpg"
                          />
                          <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
                        </div>
                      </LabelFieldPair>
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.document?.message || ""}</CardLabelError>

                      {/* PAN Number */}

                      {/* PAN Document */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
                        <CardLabel className="card-label-smaller">
                          {t("BPA_PAN_DOCUMENT")}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`pan-document-${index}`}
                            onUpload={selectPanDocumentFile(index+1)}
                            onDelete={() => {
                              deletePanDocument(index + 1);
                              setPanDocumentUploadedFiles((prev) => ({ ...prev, [index + 1]: null }));
                              setApplicants((prev) => {
                                const updated = [...prev];
                                if (updated[index]) {
                                  updated[index].panDocumentUploadedFiles = null;
                                }
                                return updated;
                              });
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], panDocument: "PAN document is required" } }));
                            }}
                            uploadedFile={applicant.panDocumentUploadedFiles}
                            message={applicant.panDocumentUploadedFiles ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.panDocument}
                            uploadMessage="Invalid File Format"
                            accept=".pdf, .png, .jpeg, .jpg"
                          />
                          <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
                        </div>
                      </LabelFieldPair>
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.panDocument?.message || ""}</CardLabelError>

                      <LabelFieldPair  >
                        <CardLabel className="card-label-smaller">
                          {`${t("BPA_PAN_NUMBER_LABEL")}`}
                          <span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput
                            value={applicant.panNumber || ""}
                            onChange={(e) => updateApplicant(index, "panNumber", e.target.value.toUpperCase())}
                            placeholder="e.g., AAAAA1234A"
                            maxlength={10}
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>
                      <CardLabelError style={errorStyle}>{errors?.applicants?.[index]?.panNumber?.message || ""}</CardLabelError>                    
                    </div>
                  )}
              )}

              {/* Add More Applicants Button */}
              {/* {applicants.length === 0  && (
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
                    + Add Applicant
                  </div>
                </div>
              )} */}
            </React.Fragment>
          )}

          {/* Add First Additional Applicant Button */}
          {/* {applicants.length === 0 && !isEditMode && ( */}
          {(
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
                + Add Owner
              </div>
            </div>
          )}
        </div>
      </div>
      {/* TOAST */}
      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} isDleteBtn={true}/>}
    </React.Fragment>
  );
};

export default LayoutApplicantDetails;
