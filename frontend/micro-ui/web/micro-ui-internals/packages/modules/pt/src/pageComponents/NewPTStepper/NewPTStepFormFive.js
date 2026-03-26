import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useRouteMatch } from "react-router-dom";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import { Loader } from "../../components/Loader";

const NewPTStepFormFive = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const [showToast, setShowToast] = useState(false);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();
  const isCitizen = window.location.href.includes("citizen");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationFormReducer.formData;
  });

  console.log("checking", currentStepData);

  // const updatedOwnerDetails = currentStepData?.ownerDetails || {};
  // const updatedPetDetails = currentStepData?.petDetails || {};
  // const updatedDocuments = currentStepData?.documents?.documents?.documents || [];

  const onGoToPTR = () => {
    if (isCitizen) {
      history.push(`/digit-ui/citizen/pt-home`);
    }
    // else {
    //   history.push(`/digit-ui/employee/ptr/petservice/inbox`);
    // }
  };

  const onFormValueChange = (setValue = true, data) => {
    const prevStepData = currentStepData[config.key] || {};
    if (!_.isEqual(data, prevStepData)) {
      dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
    }
  };

  async function goNext(selectedAction) {
    try {
      const res = await onSubmit(currentStepData, selectedAction);
      // onGoToPTR();
    } catch (error) {
      setError(error?.message || "Update failed");
      setShowToast({ key: "error" });
    }
  }

  const onSubmit = async (data, selectedAction) => {
    console.log("data", data);
    setLoader(true);
    const { propertyDetails, propertyAddress, ownerDetails, documents } = data;
    const originalProperty = data._originalProperty;
    const isEditMode = !!originalProperty;

    const stateTenantId = tenantId?.split(".")?.[0] || tenantId;
    const propertyUsageCode = propertyDetails?.propertyUsageType?.code;
    const usageCategoryMajor = propertyDetails?.propertyUsageType?.usageCategoryMajor || propertyUsageCode;

    const units =
      propertyDetails?.unitDetails
        ?.filter((unit) => unit?.floor) // skip units without floor
        ?.map((unit, index) => {
          const unitUsageCategory = unit?.subUsageType?.code || propertyUsageCode;
          const originalUnit = originalProperty?.units?.[index];
          const unitPayload = {
            // Preserve original unit fields (id, etc.) in edit mode
            ...(isEditMode && originalUnit ? originalUnit : {}),
            ...(unit?.occupancy?.code && { occupancyType: unit.occupancy.code }),
            ...(unit?.floor?.code && { floorNo: unit.floor.code }),
            ...(unit?.totalRent && { arv: unit.totalRent }),

            ...(unit?.rentMonths?.code || unit?.pendingUsageMonths?.code
              ? {
                  additionalDetails: {
                    ...(unit?.rentMonths?.code && {
                      rentedformonths: Number(unit.rentMonths.code),
                    }),
                    ...(unit?.pendingUsageMonths?.code && {
                      usageForDueMonths: unit.pendingUsageMonths.code,
                    }),
                  },
                }
              : {}),

            ...(unit?.area && {
              constructionDetail: {
                builtUpArea: Number(unit.area),
              },
            }),

            usageCategory: unitUsageCategory,

            ...(unit?.subUsageType?.code && {
              unitType: unit.subUsageType.code.split(".").pop(),
            }),

            tenantId: stateTenantId,
          };

          return unitPayload;
        }) || [];

    const superBuiltUpArea = units.reduce((sum, u) => sum + (u?.constructionDetail?.builtUpArea || 0), 0) || null;

    const computedOwners = ownerDetails?.owners?.map((owner, index) => {
      const originalOwner = originalProperty?.owners?.[index];
      return {
        // Preserve original owner fields (id, uuid, etc.) in edit mode
        ...(isEditMode && originalOwner ? originalOwner : {}),
        ...owner,
        ownerType: "NONE",
        altContactNumber: owner?.mobileNumber,
      };
    });

    const formData = {
      // Spread original property to preserve all IDs and audit fields in edit mode
      ...(isEditMode ? originalProperty : {}),
      tenantId: tenantId,
      address: {
        ...(isEditMode ? originalProperty.address : {}),
        city: propertyAddress?.city?.name,
        locality: {
          ...(isEditMode ? originalProperty.address?.locality : {}),
          code: propertyAddress?.locality?.code,
          area: propertyAddress?.locality?.area,
        },
      },
      additionalDetails: {
        ...(isEditMode ? originalProperty.additionalDetails : {}),
        yearConstruction: propertyAddress?.yearOfCreation?.code,
        businessName: propertyDetails?.businessName,
        remrks: propertyDetails?.remarks,
        inflammable: propertyDetails?.flammable,
        heightAbove36Feet: propertyDetails?.heightOfProperty,
      },
      usageCategoryMinor: usageCategoryMajor === propertyUsageCode ? null : propertyUsageCode,
      usageCategoryMajor: usageCategoryMajor,
      landArea: propertyDetails?.plotSize || null,
      superBuiltUpArea: superBuiltUpArea,
      propertyType: propertyDetails?.propertyType?.code,
      noOfFloors: propertyDetails?.propertyType?.code == "VACANT" ? 1 : propertyDetails?.noOfFloors?.code || 1,
      ownershipCategory: `${ownerDetails?.ownerShip?.value}`,
      usageCategory: usageCategoryMajor === propertyUsageCode ? propertyUsageCode : `${usageCategoryMajor}.${propertyUsageCode}`,
      owners: computedOwners,
      ...(ownerDetails?.institutionName && {
        institution: {
          ...(isEditMode ? originalProperty.institution : {}),
          name: ownerDetails?.institutionName,
          type: ownerDetails?.institutionType?.code,
          nameOfAuthorizedPerson: ownerDetails?.owners?.[0]?.name,
          tenantId: null,
          designation: "no",
        },
      }),

      ...(units?.length > 0 && { units }),
      channel: "CFC_COUNTER",
      creationReason: isEditMode ? "UPDATE" : "CREATE",
      source: "MUNICIPAL_RECORDS",
      documents: documents?.documents?.documents,
      ...(isEditMode
        ? {
            workflow: {
              businessService: "PT.CREATE",
              action: "OPEN",
              moduleName: "PT",
            },
          }
        : { applicationStatus: "CREATE" }),
    };

    try {
      let response;
      if (isEditMode) {
        response = await Digit.PTService.update({ Property: formData }, tenantId);
      } else {
        response = await Digit.PTService.create({ Property: formData }, tenantId);
      }
      console.log("response====", response);
      const id = response?.Properties[0]?.propertyId;
      setLoader(false);
      if (isCitizen) {
        history.push("/digit-ui/citizen/pt/property/response/" + id);
      } else {
        history.push("/digit-ui/employee/garbagecollection/response/" + id);
      }
    } catch (error) {
      setLoader(false);
      alert(isEditMode ? "Error while updating the property" : "Error while creating the property");
    }
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: currentStepData?.CreatedResponse?.applicationNumber,
    moduleCode: "PTR",
  });

  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  function onActionSelect(action) {
    goNext(action);
  }

  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
  //   if (!_.isEqual(data, currentStepData)) {
  //     dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
  //   }
  // };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      <ActionBar>
        {/* Back button */}
        <SubmitBar label={t("CS_COMMON_BACK")} onSubmit={() => onGoBack(currentStepData)} />

        {/* Take Action menu */}
        {/* {displayMenu && actions ? (
          <Menu localeKeyPrefix={t(`WF_CITIZEN_${"PTR"}`)} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null} */}

        <SubmitBar ref={menuRef} label={t("Submit")} onSubmit={() => goNext()} />
      </ActionBar>

      {showToast && <Toast isDleteBtn={true} error={showToast.key === "error" ? true : false} label={error} onClose={closeToast} />}
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default NewPTStepFormFive;
