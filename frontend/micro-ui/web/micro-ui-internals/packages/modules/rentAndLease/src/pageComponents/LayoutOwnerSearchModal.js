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
  Dropdown,
  DatePicker,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import CustomUploadFile from "../components/CustomUploadFile";

const applicantTypeOptions = [
  { name: "Individual", code: "INDIVIDUAL" },
  { name: "Firm", code: "FIRM" },
];

const findApplicantTypeOption = (val) => {
  if (!val) return null;
  const strVal = (typeof val === "string" ? val : val?.code || val?.name || "").toUpperCase();
  return applicantTypeOptions.find((opt) => opt.code.toUpperCase() === strVal || opt.name.toUpperCase() === strVal) || null;
};

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

export const LayoutOwnerSearchModal = ({ closeModal, onSelectUser, initialMobileNumber, editingOwner, isPrimaryOwner }) => {
  const { t } = useTranslation();
  const stateId = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();

  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber || "");
  const [showToast, setShowToast] = useState(null);
  const [searchedUsers, setSearchedUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step state: 1 = Search/Manual form, 2 = Mandatory upload & additional fields form
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  // Additional mandatory fields state
  const [photoUploadedFile, setPhotoUploadedFile] = useState(null);
  const [documentUploadedFile, setDocumentUploadedFile] = useState(null);
  const [panDocumentUploadedFile, setPanDocumentUploadedFile] = useState(null);
  const [panNumber, setPanNumber] = useState("");
  const [aplicantType, setAplicantType] = useState(null);
  const [authorisedPerson, setAuthorisedPerson] = useState("");
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
      const appType = editingOwner?.aplicantType || editingOwner?.additionalDetails?.aplicantType || null;
      setAplicantType(findApplicantTypeOption(appType) || (isPrimaryOwner ? applicantTypeOptions[0] : null));
      setAuthorisedPerson(editingOwner?.authorisedPerson || editingOwner?.additionalDetails?.authorisedPerson || "");
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
            gender: genderObj || null,
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
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setPhotoUploadedFile(fileId);
        setErrors((prev) => ({ ...prev, photo: "" }));
      } else {
        setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
      }
    } catch (err) {
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
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setDocumentUploadedFile(fileId);
        setErrors((prev) => ({ ...prev, document: "" }));
      } else {
        setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
      }
    } catch (err) {
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
      const response = await Digit.UploadServices.Filestorage("Layout", file, stateId);
      if (response?.data?.files?.length > 0) {
        const fileId = response.data.files[0].fileStoreId;
        setPanDocumentUploadedFile(fileId);
        setErrors((prev) => ({ ...prev, panDocument: "" }));
      } else {
        setShowToast({ error: true, label: "FILE_UPLOAD_FAILED" });
      }
    } catch (err) {
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
    const appType = user?.aplicantType || user?.additionalDetails?.aplicantType || null;
    setAplicantType(findApplicantTypeOption(appType));
    setAuthorisedPerson(user?.authorisedPerson || user?.additionalDetails?.authorisedPerson || "");
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
    setAplicantType(null);
    setAuthorisedPerson("");
    setErrors({});
    setStep(2);
  };

  const handleSaveFinalOwner = () => {
    const errs = {};

    if (isPrimaryOwner) {
      if (!aplicantType) {
        errs.aplicantType = t("REQUIRED_FIELD");
      }

      const isFirm = aplicantType?.code === "FIRM";
      if (isFirm && (!authorisedPerson || !authorisedPerson.trim())) {
        errs.authorisedPerson = t("REQUIRED_FIELD");
      }
    }

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

    const isFirm = isPrimaryOwner && aplicantType?.code === "FIRM";

    const finalUserObj = {
      ...selectedUser,
      aplicantType: isPrimaryOwner ? aplicantType : null,
      authorisedPerson: isFirm ? authorisedPerson.trim() : null,
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
        aplicantType: isPrimaryOwner ? aplicantType : null,
        authorisedPerson: isFirm ? authorisedPerson.trim() : null,
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
        <button
          className="submit-bar obps-page-components-layout-owner-search-modal--style-1"
          type="button"
          onClick={() => handleSelectUserFromTable(row.original)}
        >
          {t("Select")}
        </button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <div
        id="owner-search-form-container"
        className="obps-page-components-layout-owner-search-modal--style-2"
        style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "hidden" }}
      >
        <div className="obps-page-components-layout-owner-search-modal--style-3">
          <h1 className="heading-m obps-page-components-layout-owner-search-modal--style-4">
            {step === 2 ? t("OWNER ADDITIONAL DETAILS") : t("SEARCH OWNER DETAILS")}
          </h1>
          <CloseBtn onClick={closeModal} />
        </div>

        {step === 1 && !showManualForm && (
          <React.Fragment>
            {/* Search Input & Button */}
            <div className="obps-page-components-layout-owner-search-modal--style-5">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-6">
                {`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div
                className="ral-owner-search-controls"
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  width: "100%",
                  ...(isMobile ? { flexDirection: "column", alignItems: "stretch" } : {}),
                }}
              >
                <div
                  className="obps-page-components-layout-owner-search-modal--style-7"
                  style={{ flex: isMobile ? "1 1 100%" : "0 0 320px", width: isMobile ? "100%" : "320px", maxWidth: "100%" }}
                >
                  <TextInput
                    t={t}
                    key="mobileNumber"
                    value={mobileNumber}
                    onChange={handleMobileNumberChange}
                    maxlength={10}
                    placeholder={t("Enter Mobile Number")}
                    className="obps-page-components-layout-owner-search-modal--style-8"
                  />
                </div>
                <button className="submit-bar obps-page-components-layout-owner-search-modal--style-9" type="button" onClick={() => handleSearch()}>
                  {t("PT_SEARCH")}
                </button>
              </div>
            </div>

            {/* Searched Results Table */}
            <div
              className="obps-page-components-layout-owner-search-modal--style-10 ral-owner-search-results"
              style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflow: "hidden", contain: "inline-size" }}
            >
              {isLoading ? (
                <Loader />
              ) : searchedUsers && searchedUsers.length > 0 ? (
                <div style={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden" }}>
                  <Table
                    className="customTable table-border-style"
                    t={t}
                    data={searchedUsers}
                    columns={columns}
                    styles={{ width: "1850px", minWidth: "1850px", tableLayout: "fixed" }}
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
                </div>
              ) : null}
            </div>

            {/* Section to trigger manual add owner form - visible only after search */}
            {searchedUsers !== null && (
              <div className="obps-page-components-layout-owner-search-modal--style-11">
                <div className="obps-page-components-layout-owner-search-modal--style-12">
                  <div
                    onClick={() => {
                      if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
                        setShowToast({ error: true, label: "INVALID_MOBILE_NUMBER" });
                        return;
                      }
                      setShowManualForm(true);
                    }}
                    className="obps-page-components-layout-owner-search-modal--style-13"
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
          <div className="obps-page-components-layout-owner-search-modal--style-14">
            <h2 className="obps-page-components-layout-owner-search-modal--style-15">{t("CREATE NEW USER DETAILS")}</h2>

            {/* Name */}
            <div className="obps-page-components-layout-owner-search-modal--style-16">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-17">
                {t("APPLICANT_NAME")} <span className="requiredField">*</span>
              </CardLabel>
              <TextInput
                t={t}
                value={manualName}
                onChange={(e) => {
                  setManualName(e.target.value);
                  setManualErrors((prev) => ({ ...prev, name: "" }));
                }}
                className="obps-page-components-layout-owner-search-modal--style-18"
              />
              {manualErrors.name && (
                <CardLabelError className="obps-page-components-layout-owner-search-modal--style-19">{t(manualErrors.name)}</CardLabelError>
              )}
            </div>

            {/* Father/Husband Name */}
            <div className="obps-page-components-layout-owner-search-modal--style-20">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-21">
                {t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}
              </CardLabel>
              <TextInput
                t={t}
                value={manualFatherOrHusband}
                onChange={(e) => setManualFatherOrHusband(e.target.value)}
                className="obps-page-components-layout-owner-search-modal--style-22"
              />
            </div>

            {/* Email ID */}
            <div className="obps-page-components-layout-owner-search-modal--style-23">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-24">
                {t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <TextInput
                t={t}
                value={manualEmail}
                onChange={(e) => {
                  setManualEmail(e.target.value);
                  setManualErrors((prev) => ({ ...prev, emailId: "" }));
                }}
                className="obps-page-components-layout-owner-search-modal--style-25"
              />
              {manualErrors.emailId && (
                <CardLabelError className="obps-page-components-layout-owner-search-modal--style-26">{t(manualErrors.emailId)}</CardLabelError>
              )}
            </div>

            {/* Address */}
            <div className="obps-page-components-layout-owner-search-modal--style-27">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-28">
                {t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <TextArea
                t={t}
                value={manualAddress}
                onChange={(e) => {
                  setManualAddress(e.target.value);
                  setManualErrors((prev) => ({ ...prev, address: "" }));
                }}
                className="obps-page-components-layout-owner-search-modal--style-29"
              />
              {manualErrors.address && (
                <CardLabelError className="obps-page-components-layout-owner-search-modal--style-30">{t(manualErrors.address)}</CardLabelError>
              )}
            </div>

            {/* DOB */}
            <div className="obps-page-components-layout-owner-search-modal--style-31">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-32">
                {t("BPA_APPLICANT_DOB_LABEL")} <span className="requiredField">*</span>
              </CardLabel>
              <DatePicker
                date={manualDob}
                onChange={(val) => {
                  setManualDob(val);
                  setManualErrors((prev) => ({ ...prev, dob: "" }));
                }}
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
              />
              {manualErrors.dob && (
                <CardLabelError className="obps-page-components-layout-owner-search-modal--style-33">{t(manualErrors.dob)}</CardLabelError>
              )}
            </div>

            {/* Gender */}
            <div className="obps-page-components-layout-owner-search-modal--style-34">
              <CardLabel className="obps-page-components-layout-owner-search-modal--style-35">
                {t("Gender")} <span className="requiredField">*</span>
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
              {manualErrors.gender && (
                <CardLabelError className="obps-page-components-layout-owner-search-modal--style-36">{t(manualErrors.gender)}</CardLabelError>
              )}
            </div>

            {/* Action Buttons */}
            <div className="obps-page-components-layout-owner-search-modal--style-37">
              <button
                type="button"
                className="submit-bar obps-page-components-layout-owner-search-modal--style-38"
                onClick={() => setShowManualForm(false)}
              >
                {t("CS_COMMON_CANCEL")}
              </button>
              <button type="button" className="submit-bar obps-page-components-layout-owner-search-modal--style-39" onClick={handleSaveManualUser}>
                {t("CS_COMMON_NEXT")}
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedUser && (
          <div className="obps-page-components-layout-owner-search-modal--style-40">
            <div className="obps-page-components-layout-owner-search-modal--style-41">
              <h2 className="obps-page-components-layout-owner-search-modal--style-42">{t("ADDITIONAL DETAILS DOCUMENTS")}</h2>
              <LinkButton
                label={t("CHANGE OWNER")}
                onClick={() => {
                  setStep(1);
                  setShowManualForm(false);
                }}
              />
            </div>

            {/* Selected Owner Details Card */}
            <div className="obps-page-components-layout-owner-search-modal--style-43">
              <p className="obps-page-components-layout-owner-search-modal--style-44">
                <strong>{t("APPLICANT NAME")}:</strong> {selectedUser.name || "NA"}
              </p>
              <p className="obps-page-components-layout-owner-search-modal--style-45">
                <strong>{t("MOBILE NO")}:</strong> {selectedUser.mobileNumber || "NA"}
              </p>
              {selectedUser.emailId && (
                <p className="obps-page-components-layout-owner-search-modal--style-46">
                  <strong>{t("EMAIL ID")}:</strong> {selectedUser.emailId}
                </p>
              )}
            </div>

            {/* Applicant Type */}
            {isPrimaryOwner && (
              <React.Fragment>
                <CardLabel className="card-label-smaller">
                  {`${t("Owner Type")}`} <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      setAplicantType(e);
                      setErrors((prev) => ({ ...prev, aplicantType: "" }));
                    }}
                    selected={aplicantType}
                    option={applicantTypeOptions}
                    optionKey="name"
                    t={t}
                  />
                </div>
                {errors?.aplicantType && (
                  <CardLabelError className="obps-page-components-layout-owner-search-modal--style-47">{errors.aplicantType}</CardLabelError>
                )}
              </React.Fragment>
            )}

            {/* Authorised Person (for Firm) */}
            {aplicantType?.code === "FIRM" && (
              <React.Fragment>
                <CardLabel className="card-label-smaller">
                  {t("NEW_LAYOUT_FIRM_NAME_LABEL")}
                  <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <TextInput
                    value={authorisedPerson}
                    onChange={(e) => {
                      setAuthorisedPerson(e.target.value);
                      setErrors((prev) => ({ ...prev, authorisedPerson: "" }));
                    }}
                    t={t}
                  />
                </div>
                {errors?.authorisedPerson && (
                  <CardLabelError className="obps-page-components-layout-owner-search-modal--style-48">{errors.authorisedPerson}</CardLabelError>
                )}
              </React.Fragment>
            )}

            {/* Passport Photo */}
            <CardLabel className="card-label-smaller">
              {t("BPA_APPLICANT_PASSPORT_PHOTO")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field obps-page-components-layout-owner-search-modal--style-49">
              <CustomUploadFile
                id="passport-photo-modal"
                onUpload={selectPhotoFile}
                onDelete={() => {
                  setPhotoUploadedFile(null);
                  setErrors((prev) => ({ ...prev, photo: t("Passport photo is required") }));
                }}
                uploadedFile={photoUploadedFile}
                message={photoUploadedFile ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                uploadMessage="Invalid File Format"
                showPageLoaderOnUpload={true}
                accept=".png, .jpeg, .jpg"
              />
              <p className="upload-file-message">{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
            </div>
            {errors?.photo && <CardLabelError className="obps-page-components-layout-owner-search-modal--style-50">{errors.photo}</CardLabelError>}

            {/* ID Proof */}
            <CardLabel className="card-label-smaller">
              {t("BPA_APPLICANT_ID_PROOF")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field obps-page-components-layout-owner-search-modal--style-51">
              <CustomUploadFile
                id="id-proof-modal"
                onUpload={selectDocumentFile}
                onDelete={() => {
                  setDocumentUploadedFile(null);
                  setErrors((prev) => ({ ...prev, document: t("Document upload is required") }));
                }}
                uploadedFile={documentUploadedFile}
                message={documentUploadedFile ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                uploadMessage="Invalid File Format"
                showPageLoaderOnUpload={true}
                accept=".pdf, .png, .jpeg, .jpg"
              />
              <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
            </div>
            {errors?.document && (
              <CardLabelError className="obps-page-components-layout-owner-search-modal--style-52">{errors.document}</CardLabelError>
            )}

            {/* PAN Document */}
            <CardLabel className="card-label-smaller">
              {t("Pan Card")}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field obps-page-components-layout-owner-search-modal--style-53">
              <CustomUploadFile
                id="pan-document-modal"
                onUpload={selectPanDocumentFile}
                onDelete={() => {
                  setPanDocumentUploadedFile(null);
                  setErrors((prev) => ({ ...prev, panDocument: t("PAN document is required") }));
                }}
                uploadedFile={panDocumentUploadedFile}
                message={panDocumentUploadedFile ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                uploadMessage="Invalid File Format"
                showPageLoaderOnUpload={true}
                accept=".pdf, .png, .jpeg, .jpg"
              />
              <p className="upload-file-message">{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
            </div>
            {errors?.panDocument && (
              <CardLabelError className="obps-page-components-layout-owner-search-modal--style-54">{errors.panDocument}</CardLabelError>
            )}

            {/* PAN Number */}
            <CardLabel className="card-label-smaller">
              {`${t("Pan Number")}`}
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
            {errors?.panNumber && (
              <CardLabelError className="obps-page-components-layout-owner-search-modal--style-55">{errors.panNumber}</CardLabelError>
            )}

            {/* Action Buttons */}
            <div className="obps-page-components-layout-owner-search-modal--style-56">
              <button type="button" className="submit-bar obps-page-components-layout-owner-search-modal--style-57" onClick={closeModal}>
                {t("CS_COMMON_CANCEL")}
              </button>
              <button type="button" className="submit-bar obps-page-components-layout-owner-search-modal--style-58" onClick={handleSaveFinalOwner}>
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
      </div>
    </React.Fragment>
  );
};

export default LayoutOwnerSearchModal;
