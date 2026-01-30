import React, { useEffect, useState } from "react";
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

} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";
import CustomUploadFile from "../components/CustomUploadFile";
import { UPDATE_LayoutNewApplication_FORM } from "../redux/actions/LayoutNewApplicationActions";

const LayoutApplicantDetails = (_props) => {
  const dispatch = useDispatch()
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, trigger } = _props

  const tenantId = Digit.ULBService.getCurrentTenantId()
  const stateId = Digit.ULBService.getStateId()

  // Determine if in edit mode
  const applicationNo = currentStepData?.applicationNo || currentStepData?.apiData?.Layout?.[0]?.applicationNo
  const isEditMode = !!applicationNo

  const [mobileNo, setMobileNo] = useState("")
  const [showToast, setShowToast] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [applicants, setApplicants] = useState([
    {
      name: "",
      fatherOrHusbandName: "",
      mobileNumber: "",
      emailId: "",
      address: "",
      dob: "",
      gender: "",
      panNumber: "",
    },
  ])
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({})
  const [photoUploadedFiles, setPhotoUploadedFiles] = useState({})
  const [panDocumentUploadedFiles, setPanDocumentUploadedFiles] = useState({})
  const [loader, setLoader] = useState(false)
  const [applicantErrors, setApplicantErrors] = useState({})
  // State for additional owner mobile search
  const [additionalOwnerMobileNo, setAdditionalOwnerMobileNo] = useState({})
  const [additionalOwnerSearchLoading, setAdditionalOwnerSearchLoading] = useState({})

  console.log("userInfo here", userInfo);
  const closeToast = () => setShowToast(null)

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"])

  const menu = []
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({
        i18nKey: `COMMON_GENDER_${genderDetails.code}`,
        code: `${genderDetails.code}`,
        value: `${genderDetails.code}`,
      })
    })
 const isUserArchitect = userInfo?.info?.roles?.find((item) => item?.code === "BPA_ARCHITECT");
      const { data: professionalData, isLoading: professionalDataLoading } = Digit.Hooks.obps.useBPAREGSearch(
    isUserArchitect ? "pb.punjab" : tenantId,
    {},
    { mobileNumber: userInfo?.info?.mobileNumber },
    { cacheTime: 0 }
  );

  useEffect(() => {
    // Only restore data on mount, not on every change
    console.log("[v0] LayoutApplicantDetails - Restoring from currentStepData on mount")
    const formattedData = currentStepData?.applicationDetails

    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value)
      })
    }

    // Restore additional applicants from currentStepData
    if (currentStepData?.applicants && currentStepData.applicants.length > 0) {
      console.log("[v0] Restoring applicants from currentStepData.applicants:", currentStepData.applicants)
      setApplicants(currentStepData.applicants)
    } 
    // If no applicants in Redux, check if we're in edit mode and have owners from API
    else if (currentStepData?.apiData?.Layout?.[0]?.owners && currentStepData?.apiData?.Layout?.[0]?.owners?.length > 1) {
      const ownersFromApi = currentStepData.apiData.Layout[0].owners
      console.log("[v0] Mapping owners from API response:", ownersFromApi)
      
      // Map additional owners (skip index 0 as it's the primary owner in applicationDetails)
      const additionalApplicants = ownersFromApi.slice(1).map((owner) => {
        // Convert timestamp to YYYY-MM-DD format for date input
        let formattedDob = ""
        if (owner?.dob) {
          const dobDate = new Date(owner.dob)
          const year = dobDate.getFullYear()
          const month = String(dobDate.getMonth() + 1).padStart(2, "0")
          const day = String(dobDate.getDate()).padStart(2, "0")
          formattedDob = `${year}-${month}-${day}`
        }

        // Map gender to the dropdown format
        const genderObj = menu.find((g) => g.code === owner?.gender) || owner?.gender

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
        }
      })

      console.log("[v0] Mapped additional applicants:", additionalApplicants)
      
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
      }
      setApplicants([emptyPlaceholder, ...additionalApplicants])
    }

    // Restore document uploaded files from Redux state
    if (currentStepData?.documentUploadedFiles && Object.keys(currentStepData.documentUploadedFiles).length > 0) {
      setDocumentUploadedFiles(currentStepData.documentUploadedFiles)
    }
    // Map documents from additionalDetails in API response during edit mode
    else if (isEdit && currentStepData?.apiData?.Layout?.[0]?.owners) {
      const ownersFromApi = currentStepData.apiData.Layout[0].owners
      console.log("[v0] Mapping documents from owners additionalDetails")
      
      const docFiles = {}
      const photoFiles = {}
      const panDocFiles = {}
      
      // Map documents for all owners from their additionalDetails
      ownersFromApi.forEach((owner, ownerIndex) => {
        if (owner?.additionalDetails?.documentFile) {
          docFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.documentFile, fileName: "Document" }
        }
        if (owner?.additionalDetails?.ownerPhoto) {
          photoFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.ownerPhoto, fileName: "Photo" }
        }
        if (owner?.additionalDetails?.panDocument) {
          panDocFiles[ownerIndex] = { fileStoreId: owner.additionalDetails.panDocument, fileName: "PAN Document" }
        }
      })
      
      console.log("[v0] Mapped document files:", docFiles)
      console.log("[v0] Mapped photo files:", photoFiles)
      console.log("[v0] Mapped PAN document files:", panDocFiles)
      
      if (Object.keys(docFiles).length > 0) {
        setDocumentUploadedFiles(docFiles)
      }
      if (Object.keys(photoFiles).length > 0) {
        setPhotoUploadedFiles(photoFiles)
      }
      if (Object.keys(panDocFiles).length > 0) {
        setPanDocumentUploadedFiles(panDocFiles)
      }
    }

    // Restore photo uploaded files from Redux state
    if (currentStepData?.photoUploadedFiles && Object.keys(currentStepData.photoUploadedFiles).length > 0) {
      setPhotoUploadedFiles(currentStepData.photoUploadedFiles)
    }

    // Restore PAN document uploaded files from Redux state
    if (currentStepData?.panDocumentUploadedFiles && Object.keys(currentStepData.panDocumentUploadedFiles).length > 0) {
      setPanDocumentUploadedFiles(currentStepData.panDocumentUploadedFiles)
    }
  }, [currentStepData])

  const getOwnerDetails = async () => {
    if (mobileNo === "" || mobileNo.length !== 10) {
      setShowToast({
        key: "true",
        error: true,
        message: t("INVALID_MOBILE_NUMBER"),
      })
      return
    }

    const userResponse = await Digit.UserService.userSearch(stateId, { userName: mobileNo }, {})
    console.log(userResponse, "PHOTO");
    if (!userResponse?.user?.length) {
      setShowToast({
        key: "true",
        warning: true,
        message: t("ERR_MOBILE_NUMBER_NOT_REGISTERED"),
      })
      return
    }

    setUserInfo(userResponse.user[0])
  }

  // Search function for additional owners
  const getAdditionalOwnerDetails = async (index) => {
    const mobileNumber = applicants[index]?.mobileNumber
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      setShowToast({
        key: "true",
        error: true,
        message: t("INVALID_MOBILE_NUMBER"),
      })
      return
    }

    setAdditionalOwnerSearchLoading((prev) => ({ ...prev, [index]: true }))

    try {
      const userResponse = await Digit.UserService.userSearch(stateId, { userName: mobileNumber }, {})

      if (!userResponse?.user?.length) {
        setShowToast({
          key: "true",
          warning: true,
          message: t("ERR_MOBILE_NUMBER_NOT_REGISTERED"),
        })
        setAdditionalOwnerSearchLoading((prev) => ({ ...prev, [index]: false }))
        return
      }

      const user = userResponse.user[0]
      
      // Convert dob timestamp to YYYY-MM-DD format
      let formattedDob = ""
      if (user?.dob) {
        const dobDate = new Date(user.dob)
        const year = dobDate.getFullYear()
        const month = String(dobDate.getMonth() + 1).padStart(2, "0")
        const day = String(dobDate.getDate()).padStart(2, "0")
        formattedDob = `${year}-${month}-${day}`
      }

      // Map gender to the dropdown format
      const genderObj = menu.find((g) => g.code === user?.gender) || user?.gender

      // Update the applicant at the given index with user data
      const updatedApplicants = [...applicants]
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
      }
      setApplicants(updatedApplicants)

      setShowToast({
        key: "true",
        warning: false,
        error: false,
        message: t("Applicant details fetched successfully"),
      })
    } catch (error) {
      console.error("Error fetching user details:", error)
      setShowToast({
        key: "true",
        error: true,
        message: t("Error fetching applicant details"),
      })
    } finally {
      setAdditionalOwnerSearchLoading((prev) => ({ ...prev, [index]: false }))
    }
  }

  // Prefill UI on userInfo
  useEffect(() => {
    if (userInfo) {
      Object.entries(userInfo).forEach(([key, value]) => {
        if (key === "name") setValue("applicantOwnerOrFirmName", value, { shouldValidate: true })

        if (key === "emailId") setValue("applicantEmailId", value, { shouldValidate: true })

        if (key === "dob") setValue("applicantDateOfBirth", value, { shouldValidate: true })

        if (key === "fatherOrHusbandName") setValue("applicantFatherHusbandName", value)

        if (key === "permanentAddress") setValue("applicantAddress", value, { shouldValidate: true })

        if (key === "gender") {
          const genderObj = menu.find((obj) => obj.code === value)
          if (genderObj) setValue("applicantGender", genderObj, { shouldValidate: true })
        }
      })
    }
  }, [userInfo])

  // Save applicants data to Redux
  useEffect(() => {
    if (applicants?.length > 0 || Object.keys(documentUploadedFiles)?.length > 0 || Object.keys(photoUploadedFiles)?.length > 0 || Object.keys(panDocumentUploadedFiles)?.length > 0) {
      dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicants))
      dispatch(UPDATE_LayoutNewApplication_FORM("documentUploadedFiles", documentUploadedFiles))
      dispatch(UPDATE_LayoutNewApplication_FORM("photoUploadedFiles", photoUploadedFiles))
      dispatch(UPDATE_LayoutNewApplication_FORM("panDocumentUploadedFiles", panDocumentUploadedFiles))
    }
  }, [applicants, documentUploadedFiles, photoUploadedFiles, panDocumentUploadedFiles, dispatch])

  // Sync document files with react-hook-form for validation
  useEffect(() => {
    // Set primary owner photo validation
    if (photoUploadedFiles[0]?.fileStoreId) {
      setValue("primaryOwnerPhoto", photoUploadedFiles[0].fileStoreId, { shouldValidate: true })
    } else {
      setValue("primaryOwnerPhoto", "", { shouldValidate: false })
    }

    // Set primary owner document validation
    if (documentUploadedFiles[0]?.fileStoreId) {
      setValue("primaryOwnerDocument", documentUploadedFiles[0].fileStoreId, { shouldValidate: true })
    } else {
      setValue("primaryOwnerDocument", "", { shouldValidate: false })
    }
  }, [photoUploadedFiles, documentUploadedFiles, setValue])

  const handleAddApplicant = () => {
    const newApplicant = {
      name: "",
      fatherOrHusbandName: "",
      mobileNumber: "",
      emailId: "",
      address: "",
      dob: "",
      gender: "",
    }
    setApplicants([...applicants, newApplicant])
  }

  const handleRemoveApplicant = (index) => {
    const updatedApplicants = applicants.filter((_, i) => i !== index)
    setApplicants(updatedApplicants)

    // Remove associated files
    const newDocFiles = { ...documentUploadedFiles }
    const newPhotoFiles = { ...photoUploadedFiles }
    delete newDocFiles[index]
    delete newPhotoFiles[index]
    setDocumentUploadedFiles(newDocFiles)
    setPhotoUploadedFiles(newPhotoFiles)

    // Remove errors for this applicant
    const newErrors = { ...applicantErrors }
    delete newErrors[index]
    setApplicantErrors(newErrors)
  }

  const updateApplicant = (index, field, value) => {
    const updatedApplicants = [...applicants]
    updatedApplicants[index] = { ...updatedApplicants[index], [field]: value }
    setApplicants(updatedApplicants)
  }

  const selectDocumentFile = (index) => async (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") })
      return
    }
    try {
      setLoader(true)
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId)
      setLoader(false)
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId
        setDocumentUploadedFiles((prev) => ({ ...prev, [index]: { fileStoreId: fileId, fileName: file.name } }))
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "" } }))
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
      }
    } catch (err) {
      setLoader(false)
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
    }
  }

  const selectPhotoFile = (index) => async (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") })
      return
    }
    try {
      setLoader(true)
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId)
      setLoader(false)
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId
        setPhotoUploadedFiles((prev) => ({ ...prev, [index]: { fileStoreId: fileId, fileName: file.name } }))
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "" } }))
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
      }
    } catch (err) {
      setLoader(false)
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
    }
  }

  const deleteDocument = (index) => {
    const newDocFiles = { ...documentUploadedFiles }
    delete newDocFiles[index]
    setDocumentUploadedFiles(newDocFiles)
  }

  const deletePhoto = (index) => {
    const newPhotoFiles = { ...photoUploadedFiles }
    delete newPhotoFiles[index]
    setPhotoUploadedFiles(newPhotoFiles)
  }

  // PAN Document Upload Handler
  const selectPanDocumentFile = (index) => async (e) => {
    const file = e.target.files[0]
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: t("FILE_SIZE_EXCEEDS_5MB") })
      return
    }
    try {
      setLoader(true)
      const response = await Digit.UploadServices.Filestorage("Layout", file, stateId)
      setLoader(false)
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId
        setPanDocumentUploadedFiles((prev) => ({ ...prev, [index]: { fileStoreId: fileId, fileName: file.name } }))
        setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], panDocument: "" } }))
      } else {
        setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
      }
    } catch (err) {
      setLoader(false)
      setShowToast({ key: "true", error: true, message: t("FILE_UPLOAD_FAILED") })
    }
  }

  const deletePanDocument = (index) => {
    const newPanDocFiles = { ...panDocumentUploadedFiles }
    delete newPanDocFiles[index]
    setPanDocumentUploadedFiles(newPanDocFiles)
  }

  const isEdit = window.location.pathname.includes("edit")

  const ErrorMessage = ({ message }) => {
    if (!message) return null
    return <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{message}</div>
  }

  return (
    <React.Fragment>
      {loader && <Loader />}
      <div style={{ padding: "20px" }}>
        {/* <CardSectionHeader className="card-section-header" style={{ marginBottom: "15px" }}>
          {t("BPA_APPLICANT_DETAILS")}
        </CardSectionHeader> */}

        {isEdit && (
          <CardSectionSubText style={{ color: "red", margin: "10px 0px 20px 0px" }}>
            {t(
              "To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section, and you cannot edit the applicant detail",
            )}
          </CardSectionSubText>
        )}

        <div style={{ marginTop: "20px" }}>
          <CardSectionHeader className="card-section-header" style={{ marginTop: "20px", marginBottom: "20px" }}>
            {t("BPA_APPLICANT_DETAILS")} - Primary
          </CardSectionHeader>

                   {/* Mobile Number */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                      props.onChange(e.target.value)
                      setMobileNo(e.target.value)
                    }}
                    onBlur={props.onBlur}
                    disabled={isEdit}
                    t={t}
                  />
                )}
              />
              <div style={{ marginTop: "17px" }} className="search-icon" onClick={isEdit ? null : getOwnerDetails}>
                <SearchIcon />
              </div>
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantMobileNumber?.message || ""}</CardLabelError>


          {/* Applicant Name */}
          <LabelFieldPair style={{ marginBottom: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    disabled={isEdit}
                    t={t}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>
            {errors?.applicantOwnerOrFirmName ? errors.applicantOwnerOrFirmName.message : ""}
          </CardLabelError>

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

 
          {/* Email ID */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
          <CardLabelError style={errorStyle}>{errors?.applicantEmailId?.message || ""}</CardLabelError>

          {/* Address */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                  <TextArea value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.applicantAddress?.message || ""}</CardLabelError>

          {/* DOB */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="applicantDateOfBirth"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    const today = new Date()
                    const dob = new Date(value)
                    const age = today.getFullYear() - dob.getFullYear()
                    const m = today.getMonth() - dob.getMonth()
                    const d = today.getDate() - dob.getDate()
                    const valid = age >= 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)))
                    return valid || t("DOB_MUST_BE_18_YEARS_OLD")
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
            <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                      props.onChange(e)
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
            <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_PASSPORT_PHOTO")}<span className="requiredField">*</span></CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="passport-photo-primary"
                onUpload={selectPhotoFile(0)}
                onDelete={() => {
                  deletePhoto(0)
                  setPhotoUploadedFiles((prev) => ({ ...prev, [0]: null }))
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], photo: "Passport photo is required" } }))
                }}
                uploadedFile={photoUploadedFiles[0]?.fileStoreId}
                message={photoUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.photo}
                uploadMessage=""
                accept="image/*"
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.primaryOwnerPhoto?.message || ""}</CardLabelError>

          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_ID_PROOF")}<span className="requiredField">*</span></CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="id-proof-primary"
                onUpload={selectDocumentFile(0)}
                onDelete={() => {
                  deleteDocument(0)
                  setDocumentUploadedFiles((prev) => ({ ...prev, [0]: null }))
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], document: "Document upload is required" } }))
                }}
                uploadedFile={documentUploadedFiles[0]?.fileStoreId}
                message={documentUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.document}
                uploadMessage=""
                accept=".pdf"
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.primaryOwnerDocument?.message || ""}</CardLabelError>


          {/* PAN Document */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">{t("BPA_PAN_DOCUMENT")}<span className="requiredField">*</span></CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="pan-document-primary"
                onUpload={selectPanDocumentFile(0)}
                onDelete={() => {
                  deletePanDocument(0)
                  setPanDocumentUploadedFiles((prev) => ({ ...prev, [0]: null }))
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], panDocument: "PAN document is required" } }))
                }}
                uploadedFile={panDocumentUploadedFiles[0]?.fileStoreId}
                message={panDocumentUploadedFiles[0]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.panDocument}
                uploadMessage=""
                accept=".pdf"
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.panDocument?.message || ""}</CardLabelError>


          {/* PAN Number */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("BPA_PAN_NUMBER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value.toUpperCase());
                    }}
                    onBlur={props.onBlur}
                    placeholder="e.g., AAAAA1234A"
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.panNumber?.message || ""}</CardLabelError>

          {/* Hidden Controllers for document validation */}
          <div style={{ display: "none" }}>
            <Controller
              control={control}
              name="primaryOwnerPhoto"
              rules={{ required: t("BPA_PASSPORT_PHOTO_REQUIRED") }}
              render={() => null}
            />
            <Controller
              control={control}
              name="primaryOwnerDocument"
              rules={{ required: t("BPA_ID_PROOF_REQUIRED") }}
              render={() => null}
            />
          </div>

          {/* Additional Applicants Section */}
          {applicants.length > 1 && (
            <React.Fragment>
              <CardSectionHeader className="card-section-header" style={{ marginTop: "30px", marginBottom: "20px" }}>
                {t("Additional Applicants")}
              </CardSectionHeader>

              {applicants.map(
                (applicant, index) =>
                  index > 0 && (
                    <div
                      key={index}
                     
                    >
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
                        {!isEditMode && (
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
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}<span className="requiredField">*</span>
                        </CardLabel>
                        <div style={{ display: "flex" }} className="field">
                          <TextInput
                            value={applicant.mobileNumber}
                            onChange={(e) => updateApplicant(index, "mobileNumber", e.target.value)}
                            t={t}
                          />
                          <div
                            style={{ marginTop: "17px", cursor: "pointer" }}
                            className="search-icon"
                            onClick={() => !additionalOwnerSearchLoading[index] && getAdditionalOwnerDetails(index)}
                          >
                            {additionalOwnerSearchLoading[index] ? <Loader /> : <SearchIcon />}
                          </div>
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.mobileNumber && (
                        <ErrorMessage>{applicantErrors[index].mobileNumber}</ErrorMessage>
                      )}

                      {/* Name */}
                      <LabelFieldPair style={{ marginBottom: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}<span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput
                            value={applicant.name}
                            onChange={(e) => updateApplicant(index, "name", e.target.value)}
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.name && <ErrorMessage>{applicantErrors[index].name}</ErrorMessage>}

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
                          {`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}<span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextInput
                            value={applicant.emailId}
                            onChange={(e) => updateApplicant(index, "emailId", e.target.value)}
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.emailId && <ErrorMessage>{applicantErrors[index].emailId}</ErrorMessage>}

                      {/* Address */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}<span className="requiredField">*</span>
                        </CardLabel>
                        <div className="field">
                          <TextArea
                            value={applicant.address}
                            onChange={(e) => updateApplicant(index, "address", e.target.value)}
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.address && <ErrorMessage>{applicantErrors[index].address}</ErrorMessage>}

                      {/* DOB */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}<span className="requiredField">*</span></CardLabel>
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
                      {applicantErrors[index]?.dob && <ErrorMessage>{applicantErrors[index].dob}</ErrorMessage>}

                      {/* Gender */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
                        <div className="field">
                          <RadioButtons
                            t={t}
                            options={menu}
                            optionsKey="code"
                            value={applicant.gender}
                            selectedOption={applicant.gender}
                            onSelect={(e) => {
                              const selectedGenderObj = menu.find((m) => m.code === e.code)
                              updateApplicant(index, "gender", selectedGenderObj || e)
                            }}
                            isDependent={true}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.gender && <ErrorMessage>{applicantErrors[index].gender}</ErrorMessage>}

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "3rem" }}>
                        <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_PASSPORT_PHOTO")}<span className="requiredField">*</span></CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`passport-photo-${index}`}
                            onUpload={selectPhotoFile(index)}
                            onDelete={() => {
                              deletePhoto(index)
                              setPhotoUploadedFiles((prev) => ({ ...prev, [index]: null }))
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "Passport photo is required" } }))
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
                        <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_ID_PROOF")}<span className="requiredField">*</span></CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`id-proof-${index}`}
                            onUpload={selectDocumentFile(index)}
                            onDelete={() => {
                              deleteDocument(index)
                              setDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }))
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "Document upload is required" } }))
                            }}
                            uploadedFile={documentUploadedFiles[index]?.fileStoreId}
                            message={documentUploadedFiles[index]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.document}
                            uploadMessage=""
                            accept=".pdf"
                          />
                        </div>
                      </LabelFieldPair>

                      {/* PAN Number */}
                    
                      {/* PAN Document */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
                        <CardLabel className="card-label-smaller">{t("BPA_PAN_DOCUMENT")}<span className="requiredField">*</span></CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`pan-document-${index}`}
                            onUpload={selectPanDocumentFile(index)}
                            onDelete={() => {
                              deletePanDocument(index)
                              setPanDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }))
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], panDocument: "PAN document is required" } }))
                            }}
                            uploadedFile={panDocumentUploadedFiles[index]?.fileStoreId}
                            message={panDocumentUploadedFiles[index]?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.panDocument}
                            uploadMessage=""
                            accept=".pdf"
                          />
                        </div>
                      </LabelFieldPair>

                        <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">{`${t("BPA_PAN_NUMBER_LABEL")}`}<span className="requiredField">*</span></CardLabel>
                        <div className="field">
                          <TextInput
                            value={applicant.panNumber || ""}
                            onChange={(e) => updateApplicant(index, "panNumber", e.target.value.toUpperCase())}
                            placeholder="e.g., AAAAA1234A"
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.panNumber && <ErrorMessage>{applicantErrors[index].panNumber}</ErrorMessage>}

                    </div>
                  ),
              )}

              {/* Add More Applicants Button */}
              {!isEditMode && (
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
              )}
            </React.Fragment>
          )}


          {/* Add First Additional Applicant Button */}
          {applicants.length === 1 && !isEditMode && (
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
          )}
        </div>
      </div>
      {/* TOAST */}
      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  )
}

export default LayoutApplicantDetails;
