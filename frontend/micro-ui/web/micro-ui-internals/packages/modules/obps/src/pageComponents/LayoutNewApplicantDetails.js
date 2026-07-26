import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Controller } from "react-hook-form";
import {
  LabelFieldPair,
  CardLabel,
  Dropdown,
  CardLabelError,
  CardSectionHeader,
  Toast,
  DeleteIcon,
  Table,
  StatusTable,
} from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../redux/actions/LayoutNewApplicationActions";
import LayoutOwnerSearchModal from "./LayoutOwnerSearchModal";

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#F47738">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
  </svg>
);

const ownerTypeOptions = [
  { name: "Individual", code: "INDIVIDUAL" },
  { name: "Multiple", code: "MULTIPLE" },
];

const findOwnerTypeOption = (val) => {
  if (!val) return null;
  const strVal = (typeof val === "string" ? val : val?.code || val?.name || "").toUpperCase();
  return ownerTypeOptions.find((opt) => opt.code.toUpperCase() === strVal || opt.name.toUpperCase() === strVal) || null;
};

const LayoutNewApplicantDetails = (_props) => {
  const dispatch = useDispatch();
  const { t, currentStepData, Controller, control, setValue, errors, errorStyle, clearErrors } = _props;

  const [ownerType, setOwnerType] = useState(ownerTypeOptions[0]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [editingOwner, setEditingOwner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const closeToast = () => setShowToast(null);

  // Restore initial data strictly from currentStepData.applicants on mount
  useEffect(() => {
    let restoredOwners = [];
    if (currentStepData?.applicants && currentStepData.applicants.length > 0) {
      restoredOwners = currentStepData.applicants.map((a) => ({
        ...a,
        name: a.name || "",
        mobileNumber: a.mobileNumber || "",
        emailId: a.emailId || "",
        fatherOrHusbandName: a.fatherOrHusbandName || "",
        permanentAddress: a.address || a.permanentAddress || "",
        dob: a.dob || "",
        gender: a.gender || "",
        panNumber: a.panNumber || a.pan || "",
        uuid: a.uuid !== undefined ? a.uuid : null,
      }));

      setSelectedOwners(restoredOwners);
    }

    // Fallback logic for aplicantType if null or undefined
    const formattedData = currentStepData?.applicationDetails;
    const rawType = formattedData?.aplicantType || currentStepData?.applicants?.[0]?.aplicantType;
    let inferredType = null;

    if (rawType) {
      inferredType = findOwnerTypeOption(rawType);
    }

    if (!inferredType) {
      // If aplicantType is null or undefined:
      // if length of owners is less than 2 (0 or 1), it should be Individual
      // if length is more than 1, it should be Multiple
      if (restoredOwners.length > 1) {
        inferredType = ownerTypeOptions[1]; // Multiple
      } else {
        inferredType = ownerTypeOptions[0]; // Individual
      }
    }

    setOwnerType(inferredType);
    setValue("aplicantType", inferredType);

    setIsInitialized(true);
  }, []);

  // Sync selected owners and owner type strictly to currentStepData.applicants array in Redux
  useEffect(() => {
    if (!isInitialized) return;

    // Update applicationDetails with ownerType only
    const updatedDetails = {
      ...currentStepData?.applicationDetails,
      aplicantType: ownerType,
    };
    dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedDetails));

    // Map all owners into applicants array
    // console.log("selectedOwners",selectedOwners)
    const applicantsArray = selectedOwners.map((owner, idx) => ({
      ...owner,
      actualIndex: idx,
      name: owner.name || "",
      mobileNumber: owner.mobileNumber || "",
      emailId: owner.emailId || "",
      fatherOrHusbandName: owner.fatherOrHusbandName || "",
      address: owner.permanentAddress || owner.address || "",
      dob: owner.dob || "",
      gender: owner.gender || "",
      panNumber: owner.panNumber || owner.pan || "",
      uuid: owner.uuid !== undefined ? owner.uuid : null,
    }));

    dispatch(UPDATE_LayoutNewApplication_FORM("applicants", applicantsArray));
  }, [selectedOwners, ownerType, isInitialized, dispatch]);

  const handleOwnerTypeChange = (selectedType) => {
    setOwnerType(selectedType);
    setValue("aplicantType", selectedType);
    clearErrors("aplicantType");

    if (selectedType?.code === "INDIVIDUAL") {
      if (selectedOwners.length > 1) {
        // Keep only the first owner, remove all others
        setSelectedOwners([selectedOwners[0]]);
        setShowToast({
          warning: true,
          message: t("INDIVIDUAL_OWNER_TYPE_SELECTED_ONLY_ONE_OWNER_KEPT"),
        });
      }
    }
  };

  const handleEditOwner = (targetOwner) => {
    setEditingOwner(targetOwner);
    setShowModal(true);
  };

  const handleSelectUserFromModal = (userObj) => {
    const newUser = {
      ...userObj,
      name: userObj.name || "",
      mobileNumber: userObj.mobileNumber || "",
      emailId: userObj.emailId || "",
      fatherOrHusbandName: userObj.fatherOrHusbandName || "",
      permanentAddress: userObj.permanentAddress || userObj.address || "",
      dob: userObj.dob || "",
      gender: userObj.gender || "",
      panNumber: userObj.panNumber || userObj.pan || "",
      uuid: userObj.uuid !== undefined ? userObj.uuid : null,
    };

    if (editingOwner) {
      // EDIT MODE: Replace the editing owner object directly at its index
      const targetIndex = selectedOwners.findIndex(
        (o) => o === editingOwner || (o.mobileNumber === editingOwner.mobileNumber && o.uuid === editingOwner.uuid)
      );

      if (targetIndex !== -1) {
        const updated = [...selectedOwners];
        updated[targetIndex] = newUser;
        setSelectedOwners(updated);
      } else {
        setSelectedOwners([...selectedOwners, newUser]);
      }

      setEditingOwner(null);
      setShowToast({
        key: "true",
        message: t("OWNER_UPDATED_SUCCESSFULLY"),
      });
      return;
    }

    // ADD MODE
    const existingIndex = selectedOwners.findIndex((o) => o.mobileNumber === userObj.mobileNumber);
    if (existingIndex !== -1) {
      setShowToast({
        error: true,
        message: t("OWNER_ALREADY_ADDED"),
      });
      return;
    }

    if (ownerType?.code === "INDIVIDUAL" && selectedOwners.length >= 1) {
      // For individual mode, replace existing owner with new owner
      setSelectedOwners([newUser]);
    } else {
      setSelectedOwners([...selectedOwners, newUser]);
    }

    setShowToast({
      key: "true",
      message: t("OWNER_ADDED_SUCCESSFULLY"),
    });
  };

  const handleRemoveOwner = (targetOwner) => {
    // Remove the target owner object completely from the array
    const updated = selectedOwners.filter(
      (o) => !(o === targetOwner || (o.mobileNumber === targetOwner.mobileNumber && o.uuid === targetOwner.uuid))
    );
    setSelectedOwners(updated);
  };

  const isIndividual = ownerType?.code === "INDIVIDUAL";
  const isMultiple = ownerType?.code === "MULTIPLE";
  const hideAddOwnerButton = isIndividual && selectedOwners.length >= 1;

  const tableColumns = [
    {
      Header: t("SNO"),
      accessor: "sno",
      Cell: ({ row }) => row.index + 1,
    },
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
      Header: t(""),
      accessor: "actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center" }}>
          <span
            onClick={() => handleEditOwner(row.original)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            title={t("Edit Owner")}
          >
            <EditIcon />
          </span>
          <span
            onClick={() => handleRemoveOwner(row.original)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            title={t("Remove Owner")}
          >
            <DeleteIcon fill="#a82227" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <React.Fragment>
      <div>
        <CardSectionHeader className="card-section-header" style={{ marginBottom: "15px" }}>
          {t("BPA_APPLICANT_DETAILS")}
        </CardSectionHeader>

        {/* Owner Type Dropdown */}
        <LabelFieldPair style={{ marginBottom: "15px" }}>
          <CardLabel className="card-label-smaller">
            {`${t("CLU_OWNER_TYPE_LABEL")}`} <span className="requiredField">*</span>
          </CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="aplicantType"
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={(e) => {
                    props.onChange(e);
                    handleOwnerTypeChange(e);
                  }}
                  selected={findOwnerTypeOption(props.value) || ownerType}
                  option={ownerTypeOptions}
                  optionKey="name"
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.aplicantType?.message || ""}</CardLabelError>

        {/* Selected Owners Table */}
        {selectedOwners.length > 0 && (
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <CardSectionHeader className="card-section-header" style={{ marginBottom: "10px", fontSize: "16px" }}>
              {t("SELECTED_OWNERS_DETAILS")}
            </CardSectionHeader>
            <StatusTable>
              <Table
                className="customTable table-border-style"
                t={t}
                data={selectedOwners}
                columns={tableColumns}
                getCellProps={() => ({ style: {} })}
                disableSort={true}
                autoSort={false}
                manualPagination={false}
                isPaginationRequired={false}
              />
            </StatusTable>
          </div>
        )}

        {/* Validation Errors for Owners */}
        {selectedOwners.length === 0 && (
          <CardLabelError style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>
            {t("AT_LEAST_ONE_OWNER_REQUIRED")}
          </CardLabelError>
        )}

        {isMultiple && selectedOwners.length === 1 && (
          <CardLabelError style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>
            {t("MULTIPLE_OWNER_TYPE_REQUIRES_MORE_THAN_ONE_OWNER")}
          </CardLabelError>
        )}

        {/* Add Owner Button */}
        {!hideAddOwnerButton && (
          <div style={{ marginTop: "20px" }}>
            <div
              onClick={() => {
                setEditingOwner(null);
                setShowModal(true);
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
        )}
      </div>

      {/* Owner Search Modal */}
      {showModal && (
        <LayoutOwnerSearchModal
          closeModal={() => {
            setShowModal(false);
            setEditingOwner(null);
          }}
          onSelectUser={handleSelectUserFromModal}
          initialMobileNumber={editingOwner?.mobileNumber}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          onClose={closeToast}
          isDleteBtn={true}
        />
      )}
    </React.Fragment>
  );
};

export default LayoutNewApplicantDetails;
