import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  TextArea,
  Toast,
  Loader,
  Table,
  CardLabel,
  SubmitBar,
  StatusTable,
  RadioButtons,
  CardLabelError,
  LabelFieldPair,
  LinkButton,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import CustomDatePicker from "./CustomDatePicker";
import CustomUploadFile from "../components/CustomUploadFile";

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

export const LayoutOwnerSearchModal = ({ closeModal, onSelectUser, initialMobileNumber, editingOwner }) => {
  const { t } = useTranslation();
  const stateId = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();

  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber || "");
  const [showToast, setShowToast] = useState(null);
  const [searchedUsers, setSearchedUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [docLoader, setDocLoader] = useState(false);

  // Step state: 1 = Search/Manual form, 2 = Mandatory upload & additional fields form
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  // Additional mandatory fields state
  const [photoUploadedFile, setPhotoUploadedFile] = useState(null);
  const [documentUploadedFile, setDocumentUploadedFile] = useState(null);
  const [panDocumentUploadedFile, setPanDocumentUploadedFile] = useState(null);
  const [panNumber, setPanNumber] = useState("");
  const [errors, setErrors] = useState({});

  // Manual User Form states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualFatherOrHusband, setManualFatherOrHusband] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualDob, setManualDob] = useState("");
  const [manualGender, setManualGender] = useState(null);
  const [manualErrors, setManualErrors] = useState({});

  const { data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);
  const genderMenu = [];
  genderTypeData &&
    genderTypeData["common-masters"]?.GenderType?.filter((data) => data.active).forEach((genderDetails) => {
      genderMenu.push({
        i18nKey: `COMMON_GENDER_${genderDetails.code}`,
        code: `${genderDetails.code}`,
        value: `${genderDetails.code}`,
      });
    });

  useEffect(() => {
    if (editingOwner) {
      setSelectedUser(editingOwner);
      setPhotoUploadedFile(editingOwner?.photoUploadedFiles || editingOwner?.additionalDetails?.ownerPhoto || null);
      setDocumentUploadedFile(editingOwner?.documentUploadedFiles || editingOwner?.additionalDetails?.documentFile || null);
      setPanDocumentUploadedFile(editingOwner?.panDocumentUploadedFiles || editingOwner?.additionalDetails?.panDocument || null);
      setPanNumber(editingOwner?.panNumber || editingOwner?.pan || "");
      setStep(2);
    } else if (initialMobileNumber && /^[6-9]\d{9}$/.test(initialMobileNumber)) {
      handleSearch(initialMobileNumber);
    }
  }, [initialMobileNumber, editingOwner]);

  const handleMobileNumberChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleSearch = async (numToSearch) => {
    const currentMobile = typeof numToSearch === "string" ? numToSearch : mobileNumber;

    if (!currentMobile || !/^[6-9]\d{9}$/.test(currentMobile)) {
      setShowToast({ error: true, label: "INVALID_MOBILE_NUMBER" });
      return;
    }

    try {
      setIsLoading(true);
      const userResponse = await Digit.UserService.userSearch(stateId, { mobileNumber: currentMobile, active: true, userType: "CITIZEN" }, {});
      setIsLoading(false);

      if (userResponse?.user && userResponse.user.length > 0) {
        const formattedUsers = userResponse.user.map((u) => {
          let formattedDob = "";
          if (u.dob) {
            if (typeof u.dob === "string") {
              formattedDob = u.dob.slice(0, 10);
            } else if (typeof u.dob === "number") {
              const d = new Date(u.dob);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              formattedDob = `${year}-${month}-${day}`;
            }
          }

          const genderObj = genderMenu.find((obj) => obj.code === u.gender) || u.gender;

          return {
            ...u,
            name: u.name || "",
            emailId: u.emailId || "",
            dob: formattedDob,
            fatherOrHusbandName: u.fatherOrHusbandName || "",
            permanentAddress: u.permanentAddress || u.address || "",
            gender: genderObj,
            mobileNumber: u.mobileNumber || u.userName || currentMobile,
            uuid: u.uuid || "",
            panNumber: u.panNumber || u.pan || "",
          };
        });

        setSearchedUsers(formattedUsers);
      } else {
        setSearchedUsers([]);
        setShowToast({ warning: true, label: "ERR_MOBILE_NUMBER_NOT_REGISTERED" });
      }
    } catch (err) {
      setIsLoading(false);
      setShowToast({ error: true, label: "Error searching user" });
    }
  };

  // Upload Handlers
  const selectPhotoFile = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ error: true, label: "FILE_SIZE_EXCEEDS_5MB" });
      return;
    }
    try {
      setDocLoader(true);
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      setDocLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setPhotoUploadedFile(fileId);
        setErrors((prev) => ({ ...prev, photo: "" }));
      } else {
        setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
      }
    } catch (err) {
      setDocLoader(false);
      setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
    }
  };

  const selectDocumentFile = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ error: true, label: "FILE_SIZE_EXCEEDS_5MB" });
      return;
    }
    try {
      setDocLoader(true);
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      setDocLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setDocumentUploadedFile(fileId);
        setErrors((prev) => ({ ...prev, document: "" }));
      } else {
        setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
      }
    } catch (err) {
      setDocLoader(false);
      setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
    }
  };

  const selectPanDocumentFile = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ error: true, label: "FILE_SIZE_EXCEEDS_5MB" });
      return;
    }
    try {
      setDocLoader(true);
      const response = await Digit.UploadServices.Filestorage("Layout", file, stateId);
      setDocLoader(false);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setPanDocumentUploadedFile(fileId);
        setErrors((prev) => ({ ...prev, panDocument: "" }));
      } else {
        setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
      }
    } catch (err) {
      setDocLoader(false);
      setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
    }
  };

  // Validations matching LayoutApplicantDetails.js
  const validateName = (value) => {
    if (!value || !value.trim()) return "REQUIRED_FIELD";
    if (value.trim().length > 100) return "MAX_100_CHARACTERS_ALLOWED";
    return null;
  };

  const validateEmail = (value) => {
    if (!value) return "REQUIRED_FIELD";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "INVALID_EMAIL_FORMAT";
    return null;
  };

  const validateAddress = (value) => {
    if (!value || !value.trim()) return "REQUIRED_FIELD";
    if (value.trim().length > 100) return "MAX_100_CHARACTERS_ALLOWED";
    return null;
  };

  const validateAge = (value) => {
    if (!value) return "REQUIRED_FIELD";
    const dob = new Date(value);
    if (isNaN(dob.getTime())) return "INVALID_DATE_FORMAT";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    const d = today.getDate() - dob.getDate();
    if (age < 18 || (age === 18 && (m < 0 || (m === 0 && d < 0)))) {
      return "DOB_MUST_BE_18_YEARS_OLD";
    }
    return null;
  };

  const validateGender = (value) => {
    if (!value) return "REQUIRED_FIELD";
    return null;
  };

  const handleSelectUserFromTable = (user) => {
    setSelectedUser(user);
    setPhotoUploadedFile(user?.photoUploadedFiles || user?.additionalDetails?.ownerPhoto || null);
    setDocumentUploadedFile(user?.documentUploadedFiles || user?.additionalDetails?.documentFile || null);
    setPanDocumentUploadedFile(user?.panDocumentUploadedFiles || user?.additionalDetails?.panDocument || null);
    setPanNumber(user?.panNumber || user?.pan || "");
    setErrors({});
    setStep(2);
  };

  const handleSaveManualUser = () => {
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      setShowToast({ error: true, label: "INVALID_MOBILE_NUMBER" });
      return;
    }

    const errs = {};

    const nameErr = validateName(manualName);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(manualEmail);
    if (emailErr) errs.emailId = emailErr;

    const addrErr = validateAddress(manualAddress);
    if (addrErr) errs.address = addrErr;

    const dobErr = validateAge(manualDob);
    if (dobErr) errs.dob = dobErr;

    const genderErr = validateGender(manualGender);
    if (genderErr) errs.gender = genderErr;

    if (Object.keys(errs).length > 0) {
      setManualErrors(errs);
      return;
    }

    const newManualUser = {
      uuid: null,
      name: manualName.trim(),
      mobileNumber: mobileNumber,
      emailId: manualEmail.trim(),
      fatherOrHusbandName: manualFatherOrHusband.trim(),
      permanentAddress: manualAddress.trim(),
      dob: manualDob,
      gender: manualGender,
    };

    setSelectedUser(newManualUser);
    setPhotoUploadedFile(null);
    setDocumentUploadedFile(null);
    setPanDocumentUploadedFile(null);
    setPanNumber("");
    setErrors({});
    setStep(2);
  };

  const handleSaveFinalOwner = () => {
    const errs = {};

    if (!photoUploadedFile) {
      errs.photo = t("Passport photo is required");
    }

    if (!documentUploadedFile) {
      errs.document = t("Document upload is required");
    }

    if (!panDocumentUploadedFile) {
      errs.panDocument = t("PAN document is required");
    }

    if (!panNumber || !panNumber.trim()) {
      errs.panNumber = t("REQUIRED_FIELD");
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim())) {
      errs.panNumber = t("Invalid PAN Number format. Format should be like AAAAA1234A");
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const finalUserObj = {
      ...selectedUser,
      panNumber: panNumber.trim().toUpperCase(),
      pan: panNumber.trim().toUpperCase(),
      photoUploadedFiles: photoUploadedFile,
      documentUploadedFiles: documentUploadedFile,
      panDocumentUploadedFiles: panDocumentUploadedFile,
      additionalDetails: {
        ...selectedUser?.additionalDetails,
        ownerPhoto: photoUploadedFile,
        documentFile: documentUploadedFile,
        panDocument: panDocumentUploadedFile,
      },
    };

    onSelectUser(finalUserObj);
    closeModal();
  };

  const columns = [
    {
      Header: t("APPLICANT NAME"),
      accessor: "name",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("MOBILE NO"),
      accessor: "mobileNumber",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("EMAIL ID"),
      accessor: "emailId",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("DOB"),
      accessor: "dob",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("FATHER HUSBAND NAME"),
      accessor: "fatherOrHusbandName",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("ADDRESS"),
      accessor: "permanentAddress",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("GENDER"),
      accessor: "gender",
      Cell: ({ value }) => (typeof value === "object" ? t(value?.i18nKey || value?.code) : t(value) || t("CS_NA")),
    },
    {
      Header: t("ACTION"),
      accessor: "uuid",
      Cell: ({ row }) => (
        <LinkButton
          label={t("Select")}
          onClick={() => handleSelectUserFromTable(row.original)}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <Modal
        headerBarMain={<h1 className="heading-m">{step === 2 ? t("OWNER_ADDITIONAL_DETAILS") : t("BPA_SEARCH_OWNER_DETAILS")}</h1>}
        headerBarEnd={<CloseBtn onClick={closeModal} />}
        formId="owner-search-modal"
        popupStyles={{
          width: "92%",
          maxWidth: "1150px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "20px",
        }}
        hideSubmit={true}
      >
        {docLoader && <Loader />}

        {step === 1 && !showManualForm && (
          <React.Fragment>
            {/* Search Input & Button */}
            <div style={{ marginBottom: "20px" }}>
              <CardLabel style={{ marginBottom: "8px", fontWeight: "600" }}>
                {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  width: "100%",
                  ...(isMobile ? { flexDirection: "column", alignItems: "stretch" } : {}),
                }}
              >
                <div style={{ flex: 1 }}>
                  <TextInput
                    t={t}
                    key="mobileNumber"
                    value={mobileNumber}
                    onChange={handleMobileNumberChange}
                    maxlength={10}
                    placeholder={t("BPA_OWNER_MOBILE_NO_PLACEHOLDER")}
                    style={{ width: "100%", marginBottom: 0 }}
                  />
                </div>
                <button
                  className="submit-bar"
                  type="button"
                  style={{ color: "white", width: "100%", maxWidth: "120px", height: "40px", margin: 0 }}
                  onClick={() => handleSearch()}
                >
                  {t("PT_SEARCH")}
                </button>
              </div>
            </div>

            {/* Searched Results Table */}
            <div style={{ marginTop: "20px", overflowX: "auto", width: "100%", display: "block" }}>
              {isLoading ? (
                <Loader />
              ) : searchedUsers && searchedUsers.length > 0 ? (
                <Table
                  className="customTable table-border-style"
                  t={t}
                  data={searchedUsers}
                  columns={columns}
                  getCellProps={(cellInfo) => ({
                    style: {
                      whiteSpace: cellInfo.column.id === "uuid" ? "nowrap" : "normal",
                      wordBreak: "break-word",
                      padding: "10px 12px",
                      verticalAlign: "middle",
                      minWidth: cellInfo.column.id === "uuid" ? "100px" : "110px",
                    },
                  })}
                  disableSort={true}
                  autoSort={false}
                  manualPagination={false}
                  isPaginationRequired={false}
                />
              ) : null}
            </div>

            {/* Section to trigger manual add owner form - visible only after search */}
            {searchedUsers !== null && (
              <div style={{ marginTop: "20px", borderTop: "1px solid #d1d5db", paddingTop: "15px" }}>
                <div style={{ marginTop: "10px" }}>
                  <div
                    onClick={() => {
                      if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
                        setShowToast({ error: true, label: "INVALID_MOBILE_NUMBER" });
                        return;
                      }
                      setShowManualForm(true);
                    }}
                    style={{
                      color: "#a82227",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "inline-block",
                    }}
                  >
                    + {t("Add Owner")}
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        )}

        {step === 1 && showManualForm && (
          /* Manual Owner Creation Form Only */
          <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "#111827" }}>
              {t("CREATE_NEW_USER_DETAILS")}
            </h2>

            {/* Name */}
            <div style={{ marginBottom: "16px" }}>
              <CardLabel style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t("APPLICANT_NAME")} <span className="requiredField">*</span>
              </CardLabel>
              <TextInput
                t={t}
                value={manualName}
                onChange={(e) => {
                  setManualName(e.target.value);
                  setManualErrors((prev) => ({ ...prev, name: "" }));
                }}
                style={{ width: "100%" }}
              />
              {manualErrors.name && <CardLabelError style={{ marginTop: "4px" }}>{t(manualErrors.name)}</CardLabelError>}
            </div>

            {/* Father/Husband Name */}
            <div style={{ marginBottom: "16px" }}>
              <CardLabel style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}
              </CardLabel>
              <TextInput
                t={t}
                value={manualFatherOrHusband}
                onChange={(e) => setManualFatherOrHusband(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            {/* Email ID */}
            <div style={{ marginBottom: "16px" }}>
              <CardLabel style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <TextInput
                t={t}
                value={manualEmail}
                onChange={(e) => {
                  setManualEmail(e.target.value);
                  setManualErrors((prev) => ({ ...prev, emailId: "" }));
                }}
                style={{ width: "100%" }}
              />
              {manualErrors.emailId && <CardLabelError style={{ marginTop: "4px" }}>{t(manualErrors.emailId)}</CardLabelError>}
            </div>

            {/* Address */}
            <div style={{ marginBottom: "16px" }}>
              <CardLabel style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <TextArea
                t={t}
                value={manualAddress}
                onChange={(e) => {
                  setManualAddress(e.target.value);
                  setManualErrors((prev) => ({ ...prev, address: "" }));
                }}
                style={{ width: "100%" }}
              />
              {manualErrors.address && <CardLabelError style={{ marginTop: "4px" }}>{t(manualErrors.address)}</CardLabelError>}
            </div>

            {/* DOB */}
            <div style={{ marginBottom: "16px" }}>
              <CardLabel style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t("BPA_APPLICANT_DOB_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <CustomDatePicker
                value={manualDob}
                onChange={(e) => {
                  setManualDob(e.target.value);
                  setManualErrors((prev) => ({ ...prev, dob: "" }));
                }}
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
              />
              {manualErrors.dob && <CardLabelError style={{ marginTop: "4px" }}>{t(manualErrors.dob)}</CardLabelError>}
            </div>

            {/* Gender */}
            <div style={{ marginBottom: "16px" }}>
              <CardLabel style={{ marginBottom: "6px", fontWeight: "500" }}>
                {t("BPA_APPLICANT_GENDER_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <RadioButtons
                t={t}
                options={genderMenu}
                optionsKey="code"
                value={manualGender}
                selectedOption={manualGender}
                onSelect={(e) => {
                  setManualGender(e);
                  setManualErrors((prev) => ({ ...prev, gender: "" }));
                }}
                isDependent={true}
              />
              {manualErrors.gender && <CardLabelError style={{ marginTop: "4px" }}>{t(manualErrors.gender)}</CardLabelError>}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="submit-bar"
                style={{ color: "#0b0c0c", background: "#f4f5f5", border: "1px solid #0b0c0c", cursor: "pointer" }}
                onClick={() => setShowManualForm(false)}
              >
                {t("CS_COMMON_CANCEL")}
              </button>
              <button
                type="button"
                className="submit-bar"
                style={{ color: "white", cursor: "pointer" }}
                onClick={handleSaveManualUser}
              >
                {t("CS_COMMON_NEXT")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedUser && (
          <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                {t("OWNER_ADDITIONAL_DETAILS_AND_DOCUMENTS")}
              </h2>
              <LinkButton
                label={t("CHANGE_OWNER")}
                onClick={() => {
                  setStep(1);
                  setShowManualForm(false);
                }}
              />
            </div>

            {/* Selected Owner Details Card */}
            <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "6px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
              <p style={{ margin: "4px 0", fontSize: "14px" }}><strong>{t("APPLICANT_NAME")}:</strong> {selectedUser.name || "NA"}</p>
              <p style={{ margin: "4px 0", fontSize: "14px" }}><strong>{t("MOBILE_NO")}:</strong> {selectedUser.mobileNumber || "NA"}</p>
              {selectedUser.emailId && <p style={{ margin: "4px 0", fontSize: "14px" }}><strong>{t("EMAIL_ID")}:</strong> {selectedUser.emailId}</p>}
            </div>

            {/* Passport Photo */}
            <LabelFieldPair style={{ marginBottom: "15px", marginTop: "1.5rem" }}>
              <CardLabel className="card-label-smaller">
                {t("BPA_APPLICANT_PASSPORT_PHOTO")}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <CustomUploadFile
                  id="passport-photo-modal"
                  onUpload={selectPhotoFile}
                  onDelete={() => {
                    setPhotoUploadedFile(null);
                    setErrors((prev) => ({ ...prev, photo: t("Passport photo is required") }));
                  }}
                  uploadedFile={photoUploadedFile}
                  message={photoUploadedFile ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                  error={errors?.photo}
                  uploadMessage="Invalid File Format"
                  accept=".png, .jpeg, .jpg"
                />
                <p className="upload-file-message">{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
              </div>
            </LabelFieldPair>
            {errors?.photo && <CardLabelError style={{ color: "red", fontSize: "12px", marginBottom: "15px" }}>{errors.photo}</CardLabelError>}

            {/* ID Proof */}
            <LabelFieldPair style={{ marginBottom: "15px", marginTop: "1.5rem" }}>
              <CardLabel className="card-label-smaller">
                {t("BPA_APPLICANT_ID_PROOF")}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <CustomUploadFile
                  id="id-proof-modal"
                  onUpload={selectDocumentFile}
                  onDelete={() => {
                    setDocumentUploadedFile(null);
                    setErrors((prev) => ({ ...prev, document: t("Document upload is required") }));
                  }}
                  uploadedFile={documentUploadedFile}
                  message={documentUploadedFile ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                  error={errors?.document}
                  uploadMessage="Invalid File Format"
                  accept=".pdf, .png, .jpeg, .jpg"
                />
                <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
              </div>
            </LabelFieldPair>
            {errors?.document && <CardLabelError style={{ color: "red", fontSize: "12px", marginBottom: "15px" }}>{errors.document}</CardLabelError>}

            {/* PAN Document */}
            <LabelFieldPair style={{ marginBottom: "15px", marginTop: "1.5rem" }}>
              <CardLabel className="card-label-smaller">
                {t("BPA_PAN_DOCUMENT")}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <CustomUploadFile
                  id="pan-document-modal"
                  onUpload={selectPanDocumentFile}
                  onDelete={() => {
                    setPanDocumentUploadedFile(null);
                    setErrors((prev) => ({ ...prev, panDocument: t("PAN document is required") }));
                  }}
                  uploadedFile={panDocumentUploadedFile}
                  message={panDocumentUploadedFile ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                  error={errors?.panDocument}
                  uploadMessage="Invalid File Format"
                  accept=".pdf, .png, .jpeg, .jpg"
                />
                <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
              </div>
            </LabelFieldPair>
            {errors?.panDocument && <CardLabelError style={{ color: "red", fontSize: "12px", marginBottom: "15px" }}>{errors.panDocument}</CardLabelError>}

            {/* PAN Number */}
            <LabelFieldPair style={{ marginBottom: "15px" }}>
              <CardLabel className="card-label-smaller">
                {`${t("BPA_PAN_NUMBER_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <TextInput
                  value={panNumber || ""}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    setPanNumber(upper);
                    setErrors((prev) => ({ ...prev, panNumber: "" }));
                  }}
                  placeholder="e.g., AAAAA1234A"
                  maxlength={10}
                  t={t}
                />
              </div>
            </LabelFieldPair>
            {errors?.panNumber && <CardLabelError style={{ color: "red", fontSize: "12px", marginBottom: "15px" }}>{errors.panNumber}</CardLabelError>}

            {/* Action Buttons */}
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="submit-bar"
                style={{ color: "#0b0c0c", background: "#f4f5f5", border: "1px solid #0b0c0c", cursor: "pointer" }}
                onClick={closeModal}
              >
                {t("CS_COMMON_CANCEL")}
              </button>
              <button
                type="button"
                className="submit-bar"
                style={{ color: "white", cursor: "pointer" }}
                onClick={handleSaveFinalOwner}
              >
                {t("Save & Select Owner")}
              </button>
            </div>
          </div>
        )}

        {showToast && (
          <Toast
            isDleteBtn={true}
            labelstyle={{ width: "100%" }}
            error={showToast.error}
            warning={showToast.warning}
            label={t(showToast.label)}
            onClose={() => setShowToast(null)}
          />
        )}
      </Modal>
    </React.Fragment>
  );
};

export default LayoutOwnerSearchModal;

