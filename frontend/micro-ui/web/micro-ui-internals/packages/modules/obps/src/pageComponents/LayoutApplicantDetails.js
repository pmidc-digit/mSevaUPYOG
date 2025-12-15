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
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props

  const tenantId = Digit.ULBService.getCurrentTenantId()
  const stateId = Digit.ULBService.getStateId()

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
    },
  ])
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({})
  const [photoUploadedFiles, setPhotoUploadedFiles] = useState({})
  const [applicantErrors, setApplicantErrors] = useState({})
  const [loader, setLoader] = useState(false)
  const [isDataRestored, setIsDataRestored] = useState(false)

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

  useEffect(() => {
    // Prevent running multiple times
    if (isDataRestored) return;

    console.log("[v0] LayoutApplicantDetails - Full currentStepData:", currentStepData)
    const formattedData = currentStepData?.applicationDetails

    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value)
      })
    }

    // Restore additional applicants from currentStepData
    if (currentStepData?.applicants && currentStepData.applicants.length > 0) {
      setApplicants(currentStepData.applicants)
    }

    // Restore document uploaded files
    if (currentStepData?.documentUploadedFiles && Object.keys(currentStepData.documentUploadedFiles).length > 0) {
      setDocumentUploadedFiles(currentStepData.documentUploadedFiles)
    }

    // Restore photo uploaded files
    if (currentStepData?.photoUploadedFiles && Object.keys(currentStepData.photoUploadedFiles).length > 0) {
      setPhotoUploadedFiles(currentStepData.photoUploadedFiles)
    }

    // Mark as restored to prevent re-running
    if (currentStepData) {
      setIsDataRestored(true)
    }
  }, [currentStepData, isDataRestored])

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
    if (applicants?.length > 0 || Object.keys(documentUploadedFiles)?.length > 0 || Object.keys(photoUploadedFiles)?.length > 0) {
      dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicants))
      dispatch(UPDATE_LayoutNewApplication_FORM("documentUploadedFiles", documentUploadedFiles))
      dispatch(UPDATE_LayoutNewApplication_FORM("photoUploadedFiles", photoUploadedFiles))
    }
  }, [applicants, documentUploadedFiles, photoUploadedFiles, dispatch])

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
              "To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section",
            )}
          </CardSectionSubText>
        )}

        <div style={{ marginTop: "20px" }}>
          <CardSectionHeader className="card-section-header" style={{ marginTop: "20px", marginBottom: "20px" }}>
            {t("BPA_APPLICANT_DETAILS")} - Primary
          </CardSectionHeader>

          {/* Applicant Name */}
          <LabelFieldPair style={{ marginBottom: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}*</CardLabel>
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

          {/* Mobile Number */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}*</CardLabel>
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

          {/* Email ID */}
          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_PASSPORT_PHOTO")}*</CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="passport-photo-primary"
                onUpload={selectPhotoFile(0)}
                onDelete={() => {
                  deletePhoto(0)
                  setPhotoUploadedFiles((prev) => ({ ...prev, [0]: null }))
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], photo: "Passport photo is required" } }))
                }}
                uploadedFile={photoUploadedFiles[0]}
                message={photoUploadedFiles[0] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.photo}
                uploadMessage=""
                accept="image/*"
              />
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
            <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_ID_PROOF")}*</CardLabel>
            <div className="field" style={{ width: "100%" }}>
              <CustomUploadFile
                id="id-proof-primary"
                onUpload={selectDocumentFile(0)}
                onDelete={() => {
                  deleteDocument(0)
                  setDocumentUploadedFiles((prev) => ({ ...prev, [0]: null }))
                  setApplicantErrors((prev) => ({ ...prev, [0]: { ...prev[0], document: "Document upload is required" } }))
                }}
                uploadedFile={documentUploadedFiles[0]}
                message={documentUploadedFiles[0] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                error={applicantErrors[0]?.document}
                uploadMessage=""
                accept=".pdf"
              />
            </div>
          </LabelFieldPair>

          {/* Additional Applicants Section */}
          {applicants.length > 1 && (
            <React.Fragment>
              <CardSectionHeader className="card-section-header" style={{ marginTop: "30px", marginBottom: "20px" }}>
                {t("BPA_ADDITIONAL_APPLICANTS")}
              </CardSectionHeader>

              {applicants.map(
                (applicant, index) =>
                  index > 0 && (
                    <div
                      key={index}
                      style={{
                        border: "2px solid #e5e7eb",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        backgroundColor: "#fafafa",
                      }}
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
                          {`${t("BPA_APPLICANT")} ${index + 1}`}
                        </CardLabel>
                        <LinkButton
                          onClick={() => handleRemoveApplicant(index)}
                         
                        >
                           Remove
                        </LinkButton>
                      </div>

                      {/* Name */}
                      <LabelFieldPair style={{ marginBottom: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}*
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

                      {/* Mobile Number */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}*
                        </CardLabel>
                        <div className="field">
                          <TextInput
                            value={applicant.mobileNumber}
                            onChange={(e) => updateApplicant(index, "mobileNumber", e.target.value)}
                            t={t}
                          />
                        </div>
                      </LabelFieldPair>
                      {applicantErrors[index]?.mobileNumber && (
                        <ErrorMessage>{applicantErrors[index].mobileNumber}</ErrorMessage>
                      )}

                      {/* Email ID */}
                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <CardLabel className="card-label-smaller">
                          {`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}*
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
                          {`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}*
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
                        <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}*</CardLabel>
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
                        <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}*</CardLabel>
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

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
                        <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_PASSPORT_PHOTO")}*</CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`passport-photo-${index}`}
                            onUpload={selectPhotoFile(index)}
                            onDelete={() => {
                              deletePhoto(index)
                              setPhotoUploadedFiles((prev) => ({ ...prev, [index]: null }))
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], photo: "Passport photo is required" } }))
                            }}
                            uploadedFile={photoUploadedFiles[index]}
                            message={photoUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.photo}
                            uploadMessage=""
                            accept="image/*"
                          />
                        </div>
                      </LabelFieldPair>

                      <LabelFieldPair style={{ marginBottom: "15px", marginTop: "20px" }}>
                        <CardLabel className="card-label-smaller">{t("BPA_APPLICANT_ID_PROOF")}*</CardLabel>
                        <div className="field" style={{ width: "100%" }}>
                          <CustomUploadFile
                            id={`id-proof-${index}`}
                            onUpload={selectDocumentFile(index)}
                            onDelete={() => {
                              deleteDocument(index)
                              setDocumentUploadedFiles((prev) => ({ ...prev, [index]: null }))
                              setApplicantErrors((prev) => ({ ...prev, [index]: { ...prev[index], document: "Document upload is required" } }))
                            }}
                            uploadedFile={documentUploadedFiles[index]}
                            message={documentUploadedFiles[index] ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                            error={applicantErrors[index]?.document}
                            uploadMessage=""
                            accept=".pdf"
                          />
                        </div>
                      </LabelFieldPair>
                    </div>
                  ),
              )}

              {/* Add More Applicants Button */}
              <div style={{ marginTop: "20px" }}>
                <LinkButton onClick={handleAddApplicant}>{t("BPA_ADD_MORE_APPLICANTS")}</LinkButton>
              </div>
            </React.Fragment>
          )}

          {/* Add First Additional Applicant Button */}
          {applicants.length === 1 && (
            <div style={{ marginTop: "20px" }}>
              <LinkButton onClick={handleAddApplicant}>{t("BPA_ADD_MORE_APPLICANTS")}</LinkButton>
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
