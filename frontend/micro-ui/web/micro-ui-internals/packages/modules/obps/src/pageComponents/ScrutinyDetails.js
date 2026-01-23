import {
  FormStep,
  MultiSelectDropdown,
  Table,
  Row,
  CardSubHeader,
  StatusTable,
  LinkButton,
  CardSectionHeader,
  RemoveableTag,
  Toast,
  Loader,
  ActionBar,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useMemo } from "react";
import { render } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import Timeline from "../components/Timeline";
import { stringReplaceAll } from "../utils";

const ScrutinyDetails = ({ onSelect, userType, formData, config, currentStepData, onGoBack }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [subOccupancy, setsubOccupancy] = useState([]);
  const [subOccupancyObject, setsubOccupancyObject] = useState(formData?.subOccupancy || formData?.landInfo?.unit || {});
  const [subOccupancyOption, setsubOccupancyOption] = useState([]);
  const [floorData, setfloorData] = useState([]);
  let scrutinyNumber = `DCR82021WY7QW`;
  let user = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY") || Digit.ULBService.getCurrentTenantId();
  const checkingFlow = formData?.uiFlow?.flow;
  const [showToast, setShowToast] = useState(null);
  const stateCode = Digit.ULBService.getStateId();
  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateCode, "BPA", ["SubOccupancyType"]);
  console.log("formDataInScrutiniy ", formData, currentStepData, mdmsData);
  // const { data, isLoading, refetch } = Digit.Hooks.obps.useScrutinyDetails(tenantId, formData?.data?.scrutinyNumbe?.edcrNumber, {
  //   enabled: true,
  // });
  const data = currentStepData?.BasicDetails?.edcrDetails;
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [apiLoading, setApiLoading] = useState(false);

  console.log("OCCUPANCY", formData);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // use "auto" for instant scroll
    });
  }, []);

  useEffect(() => {
    if (!isMdmsLoading && currentStepData?.BasicDetails?.occupancyType) {
      const subOccupancyMaster = mdmsData?.BPA?.SubOccupancyType || [];

      const matched = subOccupancyMaster.find((item) => item.name?.toLowerCase() === currentStepData?.BasicDetails?.occupancyType.toLowerCase());

      if (matched) {
        const formatted = {
          code: matched.code,
          name: matched.name,
          i18nKey: `BPA_SUBOCCUPANCYTYPE_${stringReplaceAll(matched.code.toUpperCase(), "-", "_")}`,
        };

        setsubOccupancyObject({
          Block_1: [formatted],
        });
      }
    }
  }, [formData?.data?.occupancyType, mdmsData, isMdmsLoading]);

  // ---------------- UI Styles ----------------
  // const pageStyle = {
  //   padding: "2rem",
  //   backgroundColor: "#f1f1f1ff",
  //   fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  //   color: "#333",
  //   paddingBottom: "5rem",
  // };

  // const headingStyle = {
  //   fontSize: "1.5rem",
  //   borderBottom: "2px solid #ccc",
  //   paddingBottom: "0.3rem",
  //   color: "#2e4a66",
  //   marginTop: "2rem",
  //   marginBottom: "1rem",
  // };

  // const labelFieldPairStyle = {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   borderBottom: "1px dashed #e0e0e0",
  //   padding: "0.5rem 0",
  //   color: "#333",
  // };

  // const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div>
      <CardLabel>{label}</CardLabel>
      <div>{value || t("CS_NA")}</div>
    </div>
  );

  function getFloorData(block) {
    const floors = [];
    let totalBuiltUpArea = 0;
    let totalFloorArea = 0;
    let totalDeduction = 0;

    block?.building?.floors?.forEach((ob) => {
      const builtUp = Number(ob.occupancies?.[0]?.builtUpArea) || 0;
      const floor = Number(ob.occupancies?.[0]?.floorArea) || 0;
      const deduction = Number(ob.occupancies?.[0]?.deduction) || 0;

      totalBuiltUpArea += builtUp;
      totalFloorArea += floor;
      totalDeduction += deduction;

      floors.push({
        Floor: t(`BPA_FLOOR_NAME_${ob.number}`),
        Level: ob.number,
        Occupancy: t(`${ob.occupancies?.[0]?.type}`),

        BuildupArea: Number(builtUp).toFixed(2),
        Deduction: Number(deduction).toFixed(2),
        FloorArea: Number(floor).toFixed(2),
      });
    });

    // Add Totals Row
    floors.push({
      Floor: t("BPA_TOTAL"),
      Level: "",
      Occupancy: "",
      BuildupArea: `${Number(totalBuiltUpArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
      Deduction: `${Number(totalDeduction).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
      FloorArea: `${Number(totalFloorArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`,
    });

    return floors;
  }

  function getsuboptions() {
    const suboccoption = [];
    // data &&
    // data?.planDetail?.mdmsMasterData?.SubOccupancyType?.map((ob) => {
    mdmsData?.BPA?.SubOccupancyType?.map((ob) => {
      suboccoption.push({
        code: ob.code,
        name: ob.name,
        i18nKey: `BPA_SUBOCCUPANCYTYPE_${stringReplaceAll(ob?.code?.toUpperCase(), "-", "_")}`,
      });
    });
    return Digit.Utils.locale.sortDropdownNames(suboccoption, "i18nKey", t);
  }

  //do not touch this action button

  const ActionButton = ({ label, jumpTo }) => {
    const { t } = useTranslation();

    async function downloadFile(e) {
      // e.preventDefault();
      // e.stopPropagation();

      // if (jumpTo) {
      //   const link = document.createElement("a");
      //   link.href = jumpTo;
      //   link.download = label || "document";
      //   link.style.display = "none";

      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }
      window.open(jumpTo, "_blank");
    }

    return <LinkButton label={t(label)} onClick={downloadFile} />;
  };

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

  const tableHeader = [
    {
      name: "BPA_TABLE_COL_FLOOR",
      id: "Floor",
    },
    {
      name: "BPA_TABLE_COL_LEVEL",
      id: "Level",
    },
    {
      name: "BPA_TABLE_COL_OCCUPANCY",
      id: "Occupancy",
    },
    {
      name: "BPA_TABLE_COL_BUILDUPAREA",
      id: "BuildupArea",
    },
    {
      name: "BPA_TABLE_COL_DEDUCTION",
      id: "Deduction",
    },
    {
      name: "BPA_TABLE_COL_FLOORAREA",
      id: "FloorArea",
    },
    // {
    //   name: "BPA_TABLE_COL_CARPETAREA",
    //   id: "CarpetArea",
    // },
  ];
  const selectOccupancy = (e, data, num) => {
    const newSubOccupancy = [];
    e &&
      e?.map((ob) => {
        newSubOccupancy.push(ob?.[1]);
      });

    setsubOccupancyObject((prev) => ({
      ...prev,
      [`Block_${num}`]: newSubOccupancy,
    }));
    setsubOccupancy(newSubOccupancy);
  };

  const onRemove = (index, key, num) => {
    let afterRemove = subOccupancyObject[`Block_${num}`].filter((value, i) => {
      return i !== index;
    });
    setsubOccupancy(afterRemove);
    let temp = subOccupancyObject;
    temp[`Block_${num}`] = afterRemove;
    setsubOccupancyObject(temp);
  };

  const accessData = (plot) => {
    const name = plot;
    return (originalRow, rowIndex, columns) => {
      return originalRow[name];
    };
  };

  const closeToast = () => {
    setShowToast(null);
  };

  // const tableColumns = useMemo(() => {
  //   return tableHeader?.map((ob) => ({
  //     Header: t(`${ob.name}`),
  //     accessor: accessData(ob.id),
  //     id: ob.id,
  //     //symbol: plot?.symbol,
  //     //sortType: sortRows,
  //   }));
  // });

  const tableColumns = useMemo(() => {
    return tableHeader?.map((ob) => {
      if (ob.id === "BuildupArea") {
        return {
          Header: t(`${ob.name}`),
          accessor: accessData(ob.id),
          id: ob.id,
          Footer: (info) => {
            const total = info.rows.reduce((sum, row) => sum + (Number(row.values.BuildupArea) || 0), 0);
            return `${t("BPA_TOTAL_BUILDUPAREA")} : ${Number(total).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`;
          },
        };
      } else if (ob.id === "Deduction") {
        return {
          Header: t(`${ob.name}`),
          accessor: accessData(ob.id),
          id: ob.id,
          Footer: (info) => {
            const total = info.rows.reduce((sum, row) => sum + (Number(row.values.FloorArea) || 0), 0);
            return `${t("BPA_TOTAL_Deduction")} : ${Number(total).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`;
          },
        };
      } else if (ob.id === "FloorArea") {
        return {
          Header: t(`${ob.name}`),
          accessor: accessData(ob.id),
          id: ob.id,
          Footer: (info) => {
            const total = info.rows.reduce((sum, row) => sum + (Number(row.values.FloorArea) || 0), 0);
            return `${t("BPA_TOTAL_FLOORAREA")} : ${Number(total).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`;
          },
        };
      } else {
        return {
          Header: t(`${ob.name}`),
          accessor: accessData(ob.id),
          id: ob.id,
        };
      }
    });
  }, [t]);

  const onSkip = () => onSelect();
  console.log(formData, "F++++++");
  const goNext = async () => {
    const userInfo = Digit.UserService.getUser();
    const accountId = userInfo?.info?.uuid;
    const workflowAction = formData?.data?.applicationNo ? "SAVE_AS_DRAFT" : "INITIATE";
    // if (checkingFlow === "OCBPA") {
    //   if (!formData?.id) {
    //     let payload = {};
    //     payload.edcrNumber = formData?.edcrNumber?.edcrNumber ? formData?.edcrNumber?.edcrNumber : formData?.data?.scrutinyNumber?.edcrNumber;
    //     payload.riskType = formData?.data?.riskType;
    //     payload.applicationType = formData?.data?.applicationType;
    //     payload.serviceType = formData?.data?.serviceType;

    //     const userInfo = Digit.UserService.getUser();
    //     const accountId = userInfo?.info?.uuid;
    //     payload.tenantId = formData?.data?.bpaData?.bpaApprovalResponse?.[0]?.landInfo?.tenantId;
    //     payload.workflow = { action: "INITIATE", assignes: [userInfo?.info?.uuid] };
    //     payload.accountId = accountId;
    //     payload.documents = null;

    //     // Additonal details
    //     payload.additionalDetails = {};
    //     if (formData?.data?.holdingNumber) payload.additionalDetails.holdingNo = formData?.data?.holdingNumber;
    //     if (formData?.data?.registrationDetails) payload.additionalDetails.registrationDetails = formData?.data?.registrationDetails;
    //     if (formData?.data?.applicationType) payload.additionalDetails.applicationType = formData?.data?.applicationType;
    //     if (formData?.data?.serviceType) payload.additionalDetails.serviceType = formData?.data?.serviceType;

    //     //For LandInfo
    //     payload.landInfo = formData?.data?.bpaData?.bpaApprovalResponse?.[0].landInfo || {};

    //     let nameOfAchitect = sessionStorage.getItem("BPA_ARCHITECT_NAME");
    //     let parsedArchitectName = nameOfAchitect ? JSON.parse(nameOfAchitect) : "ARCHITECT";
    //     payload.additionalDetails.typeOfArchitect = parsedArchitectName;
    //     // create BPA call
    //     Digit.OBPSService.create({ BPA: payload }, tenantId)
    //       .then((result, err) => {
    //         if (result?.BPA?.length > 0) {
    //           result.BPA[0].data = formData.data;
    //           result.BPA[0].uiFlow = formData?.uiFlow;
    //           onSelect("", result.BPA[0], "", true);
    //         }
    //       })
    //       .catch((e) => {
    //         setShowToast({ key: "true", message: e?.response?.data?.Errors[0]?.message || null });
    //       });
    //   } else {
    //     onSelect("", formData, "", true);
    //   }
    // } else {
      const unit = getUnitsForAPI(subOccupancyObject);
      const landInfo =
        currentStepData?.createdResponse?.landInfo === null
          ? {
              owners: [],
              ownershipCategory: "INDIVIDUAL.SINGLEOWNER",
              address: {
                city: tenantId,
                locality: {
                  code: "",
                },
              },
              tenantId,
              unit,
            }
          : {
              ...currentStepData?.createdResponse?.landInfo,
              unit,
            };
      console.log("OnSelectScrutiniy", subOccupancyObject, unit);

      try {
        setApiLoading(true);
        const result = await Digit.OBPSService.update({ BPA: {
          ...currentStepData?.createdResponse,
          landInfo,
          additionalDetails: {
            ...currentStepData?.createdResponse?.additionalDetails,
            permissableFar: data?.planDetail?.farDetails?.permissableFar,
            achievedFar: data?.planDetail?.farDetails?.providedFar,
            ecsRequired: data?.planDetail?.reportOutput?.scrutinyDetails?.find((item) => item?.key === "Common_Parking" )?.detail?.find((item) => item?.Description === "Parking")?.Required,
            ecsProvided: data?.planDetail?.reportOutput?.scrutinyDetails?.find((item) => item?.key === "Common_Parking" )?.detail?.find((item) => item?.Description === "Parking")?.Provided,
          },
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        } }, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          onSelect("ScrutinyDetails", { subOccupancy: subOccupancyObject });
        } else {
          alert(t("BPA_CREATE_APPLICATION_FAILED"));
          setApiLoading(false);
        }
        console.log("APIResponse", result);
      } catch (e) {
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }

      // onSelect(config.key, subOccupancyObject);
    // }
  };

  function getusageCategoryAPI(arr) {
    let usageCat = ""
    arr?.map((ob, i) => {
      usageCat = usageCat + (i !== 0 ? "," : "") + ob.code
    })
    return usageCat
  }

  function getUnitsForAPI(subOccupancy) {
    const ob = subOccupancy;
    const blocksDetails = currentStepData?.BasicDetails?.edcrDetails?.planDetail?.blocks || [];
    const units = [];
    if (ob) {
      const result = Object.entries(ob);
      result.map((unit, index) => {
        units.push({
          blockIndex: index,
          floorNo: unit[0].split("_")[1],
          unitType: "Block",
          occupancyType: blocksDetails?.[index]?.building?.occupancies?.[0]?.typeHelper?.type?.code || "A",
          usageCategory: getusageCategoryAPI(unit[1]),
        });
      });
    }
    return units;
  }

  const clearall = (num) => {
    let res = [];
    let temp = subOccupancyObject;
    temp[`Block_${num}`] = res;
    setsubOccupancy(res);
    setsubOccupancyObject(temp);
  };

  function getSubOccupancyValues(index) {
    let values = formData?.data?.bpaData?.bpaApprovalResponse?.[0]?.landInfo?.unit;
    let returnValue = "";
    if (values?.length > 0) {
      let splitArray = values[index]?.usageCategory?.split(",");
      if (splitArray?.length) {
        const returnValueArray = splitArray?.map((data) =>
          data ? `${t(`BPA_SUBOCCUPANCYTYPE_${stringReplaceAll(data?.toUpperCase(), "-", "_")}`)}` : "NA"
        );
        returnValue = returnValueArray.join(", ");
      }
    }
    return returnValue ? returnValue : "NA";
  }

  if (isMdmsLoading || apiLoading) return <Loader />;
  function getBlockSubOccupancy(index) {
    let subOccupancyString = "";
    let returnValueArray = [];
    subOccupancyObject &&
      subOccupancyObject[`Block_${index + 1}`] &&
      subOccupancyObject[`Block_${index + 1}`].map((ob) => {
        returnValueArray.push(`${t(stringReplaceAll(ob?.i18nKey?.toUpperCase(), "-", "_"))}`);
      });
    return returnValueArray?.length ? returnValueArray.join(", ") : "NA";
  }
  return (
    <React.Fragment>
      {/* {isMobile && <Timeline currentStep={checkingFlow === "OCBPA" ? 2 : 1} flow={checkingFlow === "OCBPA" ? "OCBPA" : ""} />} */}
      <div className="bpa-stepper-form-container">
        <FormStep
          t={t}
          config={{
            ...config,
            texts: {
              // headerCaption: "BPA_STEPPER_SCRUTINY_DETAILS_HEADER",
              header: "BPA_STEPPER_SCRUTINY_DETAILS_HEADER",
              cardText: "",
              skipText: null,
            },
          }}
          onSelect={goNext}
          onSkip={onSkip} /* isDisabled={Object.keys(subOccupancyObject).length === 0} */
        >
          <div className="bpa-stepper-form-section">
            <CardSubHeader className="bpa-section-header">{t("BPA_EDCR_DETAILS")}</CardSubHeader>
            <StatusTable>
              <Row
                className="border-none"
                label={checkingFlow === "OCBPA" ? t("BPA_OC_EDCR_NO_LABEL") : t("BPA_EDCR_NO_LABEL")}
                text={data?.edcrNumber}
              ></Row>
              <Row
                className="border-none"
                label={t("BPA_UPLOADED_PLAN_DIAGRAM")}
                text={
                  <SubmitBar
                    label={t("Uploaded Plan.pdf")}
                    onSubmit={() => {
                      routeTo(data?.updatedDxfFile);
                    }}
                  />
                }
              ></Row>
              <Row
                className="border-none"
                label={t("BPA_SCRUNTINY_REPORT_OUTPUT")}
                text={
                  <SubmitBar
                    label={t("BPA_SCRUTINY_REPORT_PDF")}
                    onSubmit={() => {
                      routeTo(data?.planReport);
                    }}
                  />
                }
              ></Row>
            </StatusTable>
          </div>

          <div className="bpa-stepper-form-section">
            <CardSubHeader className="bpa-section-header">
              {checkingFlow === "OCBPA" ? t("BPA_ACTUAL_BUILDING_EXTRACT_HEADER") : t("BPA_BUILDING_EXTRACT_HEADER")}
            </CardSubHeader>
            <StatusTable>
              <Row
                className="border-none"
                label={t("BPA_TOTAL_BUILT_UP_AREA_HEADER")}
                text={
                  data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea
                    ? `${Number(data?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea).toFixed(2)} ${t("BPA_SQ_MTRS_LABEL")}`
                    : t("NA")
                }
              ></Row>
              <Row
                className="border-none"
                label={t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL")}
                text={data?.planDetail?.blocks?.[0]?.building?.totalFloors}
              ></Row>
              <Row
                className="border-none"
                label={t("BPA_HEIGHT_FROM_GROUND_BUILDING")}
                text={
                  data?.planDetail?.blocks?.[0]?.building?.declaredBuildingHeight
                    ? `${Number(data?.planDetail?.blocks?.[0]?.building?.declaredBuildingHeight).toFixed(2)} ${t("BPA_MTRS_LABEL")}`
                    : t("NA")
                }
              ></Row>
            </StatusTable>
          </div>

          <div className="bpa-stepper-form-section">
            <CardSubHeader className="bpa-section-header">
              {checkingFlow === "OCBPA" ? t("BPA_ACTUAL_BUILDING_FAR_ECS") : t("BPA_ACTUAL_BUILDING_FAR_ECS")}
            </CardSubHeader>
            <StatusTable>
              <Row
                className="border-none"
                label={t("BPA_PERMISSIBLE_FAR")}
                text={data?.planDetail?.farDetails?.permissableFar !== null ? data?.planDetail?.farDetails?.permissableFar : "N/A"}
              ></Row>
              <Row
                className="border-none"
                label={t("BPA_FAR_ACHIEVED")}
                text={data?.planDetail?.farDetails?.providedFar ? data?.planDetail?.farDetails?.providedFar : "N/A"}
              ></Row>
              {data?.planDetail?.plot?.area >= 100 && (
                <React.Fragment>
                  <Row
                    className="border-none"
                    label={t("BPA_ECS_REQUIRED")}
                    text={
                      data?.planDetail?.reportOutput?.scrutinyDetails
                        ?.find((item) => item?.key === "Common_Parking")
                        ?.detail?.find((item) => item?.Description === "Parking")?.Required || "NA"
                    }
                  ></Row>
                  <Row
                    className="border-none"
                    label={t("BPA_ECS_PROVIDED")}
                    text={
                      data?.planDetail?.reportOutput?.scrutinyDetails
                        ?.find((item) => item?.key === "Common_Parking")
                        ?.detail?.find((item) => item?.Description === "Parking")?.Provided || "NA"
                    }
                  ></Row>
                </React.Fragment>
              )}
            </StatusTable>
          </div>

          <div className="bpa-stepper-form-section">
            <CardSubHeader className="bpa-section-header">{t("BPA_OCC_SUBOCC_HEADER")}</CardSubHeader>
            {data?.planDetail?.blocks?.map((block, index) => (
              <div key={index} className="bpa-block-section">
                <CardSubHeader className="bpa-block-header">
                  {t("BPA_BLOCK_SUBHEADER")} {index + 1}
                </CardSubHeader>
                <StatusTable>
                  <Row
                    className="border-none"
                    label={t("BPA_SUB_OCCUPANCY_LABEL")}
                    text={getBlockSubOccupancy(index) === "" ? t("CS_NA") : getBlockSubOccupancy(index)}
                  />
                </StatusTable>

                <div className="bpa-table-container">
                  <Table
                    className="customTable table-fixed-first-column table-border-style"
                    t={t}
                    disableSort={true}
                    autoSort={false}
                    manualPagination={false}
                    isPaginationRequired={false}
                    initSortId="S N "
                    data={getFloorData(block)}
                    columns={tableColumns}
                    showFooter={true}
                    getCellProps={(cellInfo) => {
                      return {
                        style: {},
                      };
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bpa-stepper-form-section">
            <CardSubHeader className="bpa-section-header">{t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL")}</CardSubHeader>
            <StatusTable>
              <Row
                label={t("BPA_APPLICATION_DEMOLITION_AREA_LABEL")}
                text={
                  data?.planDetail?.planInformation?.demolitionArea
                    ? `${data?.planDetail?.planInformation?.demolitionArea} ${t("BPA_SQ_MTRS_LABEL")}`
                    : t("CS_NA")
                }
              ></Row>
            </StatusTable>
          </div>
        </FormStep>
        {showToast && <Toast error={true} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />}
      </div>
      <ActionBar>
        <SubmitBar label="Back" onSubmit={onGoBack} />
        {<SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={goNext} disabled={apiLoading} />}
      </ActionBar>
    </React.Fragment>
  );
};

export default ScrutinyDetails;
