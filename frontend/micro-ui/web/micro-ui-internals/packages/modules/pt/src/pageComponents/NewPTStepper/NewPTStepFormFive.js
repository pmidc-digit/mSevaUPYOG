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
    // return;
    setLoader(true);
    const { propertyDetails, propertyAddress, ownerDetails, documents } = data;
    // const units =
    //   propertyDetails?.unitDetails?.map((unit) => ({
    //     occupancyType: unit?.occupancy?.code,
    //     floorNo: unit?.floor?.code,
    //     arv: unit?.totalRent,
    //     additionalDetails: {
    //       rentedformonths: Number(unit?.rentMonths?.code),
    //       usageForDueMonths: unit?.pendingUsageMonths?.code,
    //     },
    //     constructionDetail: {
    //       builtUpArea: Number(unit?.area),
    //     },
    //     tenantId: null,
    //     usageCategory: unit?.subUsageType?.code,
    //     unitType: unit?.subUsageType?.code?.split(".").pop(),
    //   })) || [];

    const units =
      propertyDetails?.unitDetails
        ?.filter((unit) => unit?.floor) // skip units without area
        ?.map((unit) => {
          const unitPayload = {
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

            ...(unit?.subUsageType?.code && { usageCategory: unit.subUsageType.code }),

            ...(unit?.subUsageType?.code && {
              unitType: unit.subUsageType.code.split(".").pop(),
            }),

            tenantId: null,
          };

          return unitPayload;
        }) || [];

    const formData = {
      tenantId: tenantId,
      address: {
        // ...data?.PersonalDetails?.address,
        city: propertyAddress?.city?.name,
        locality: {
          code: propertyAddress?.locality?.code,
          area: propertyAddress?.locality?.area,
        },
      },
      additionalDetails: {
        yearConstruction: propertyAddress?.yearOfCreation?.code,
        businessName: propertyDetails?.businessName,
        remrks: propertyDetails?.remarks,
        inflammable: propertyDetails?.flammable,
        heightAbove36Feet: propertyDetails?.heightOfProperty,
      },
      usageCategoryMinor: propertyDetails?.propertyUsageType?.code,
      usageCategoryMajor: propertyDetails?.propertyUsageType?.usageCategoryMajor,
      landArea: propertyDetails?.unitDetails?.[0]?.area,
      propertyType: propertyDetails?.propertyType?.code,
      noOfFloors: 1,
      // ownershipCategory: `${ownerDetails?.ownerShip?.ownerShipCategory}.${ownerDetails?.ownerShip?.code}`,
      ownershipCategory: `${ownerDetails?.ownerShip?.value}`,
      usageCategory: `${propertyDetails?.propertyUsageType?.usageCategoryMajor}.${propertyDetails?.propertyUsageType?.code}`,
      owners: ownerDetails?.owners?.map((owner) => ({
        ...owner,
        ownerType: "NONE",
        altContactNumber: owner?.mobileNumber,
      })),
      // "NONRESIDENTIAL.COMMERCIAL",
      ...(ownerDetails?.institutionName && {
        institution: {
          name: ownerDetails?.institutionName,
          type: ownerDetails?.institutionType?.code,
          nameOfAuthorizedPerson: ownerDetails?.owners?.[0]?.name,
          tenantId: null,
          designation: "no",
        },
      }),

      ...(units?.length > 0 && { units }),
      channel: "CFC_COUNTER",
      creationReason: "CREATE",
      source: "MUNICIPAL_RECORDS",
      documents: documents?.documents?.documents,
      applicationStatus: "CREATE",
    };

    try {
      const response = await Digit.PTService.create({ Property: formData }, tenantId);
      console.log("response====", response);
      const id = response?.Properties[0]?.propertyId;
      setLoader(false);
      if (isCitizen) {
        history.push("/digit-ui/citizen/pt/property/response/" + id);
      } else {
        history.push("/digit-ui/employee/garbagecollection/response/" + id);
      }
      // if (response?.ResponseInfo?.status === "successful") {
      //   return { isSuccess: true, response };
      // } else {
      //   return { isSuccess: false, response };
      // }
    } catch (error) {
      setLoader(false);
      alert("error while creating the property");
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
