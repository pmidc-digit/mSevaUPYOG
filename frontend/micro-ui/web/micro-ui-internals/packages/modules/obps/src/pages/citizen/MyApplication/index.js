import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, KeyNote, Loader, SubmitBar, Header } from "@mseva/digit-ui-react-components";
import { Fragment } from "react";
import { Link, useHistory } from "react-router-dom";
import { encryptId, getBPAFormData } from "../../../utils/index";
import CustomCard from "../../../pageComponents/CustomCard";

const getServiceType = () => {
  return `BPA_APPLICATIONTYPE_BUILDING_PLAN_SCRUTINY`;
};

const MyApplication = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //   const [finalData, setFinalData] = useState([]);
  //   const [labelMessage, setLableMessage] = useState(false);
  //   // const tenantId = Digit.ULBService.getCurrentTenantId();
  //     // Layout state removed: this page no longer uses layout search
  const tenantId = localStorage.getItem("CITIZEN.CITY");

  //   // const userInfo = Digit.UserService.getUser();
  //   // const requestor = userInfo?.info?.mobileNumber;

  const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  const userInfoData = userInfos ? JSON.parse(userInfos) : {};
  const userInfo = userInfoData?.value;
  const requestor = userInfo?.info?.mobileNumber;


  // const userInfoforLayout = Digit.UserService.getUser()?.info || {};
  //   // layout application here

  //   const { data: reminderPeriod, isLoading: isreminderLoading} =  Digit.Hooks.useCustomMDMS(tenantId, "TradeLicense", [{ name: "ReminderPeriods" }]);
  const { data, isLoading, revalidate } = Digit.Hooks.obps.useBPAREGSearch(tenantId, {}, { mobileNumber: requestor }, { cacheTime: 0 });



  const { data: dataPunjab, isLoading: isLoadingPunjab, revalidate: revalidatePunjab } = Digit.Hooks.obps.useBPAREGSearch(
    "pb.punjab",
    {},
    { mobileNumber: requestor },
    { cacheTime: 0 }
  );



  //   const { data: bpaData, isLoading: isBpaSearchLoading, revalidate: bpaRevalidate } = Digit.Hooks.obps.useBPASearch(tenantId, {
  //     requestor,
  //     mobileNumber: requestor,
  //     limit: 50 - (data?.Licenses?.length ? Number(data?.Licenses?.length) : 0),
  //     offset: 0,
  //   }, {enabled: !isLoading ? true : false});
  //   const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(Digit.ULBService.getStateId(), "BPA", ["RiskTypeComputation"]);

  //   const searchLayoutApplications = async () => {
  //   try {
  //     setIsLayoutLoading(true)
  //     const searchParams = {
  //       mobileNumber: requestor,
  //     }

  //     const response = await Digit.OBPSService.LayoutSearch(tenantId, searchParams)


  //     if (response?.Layout) {
  //       setLayoutData(response.Layout)
  //     }
  //   } catch (error) {

  //     setLayoutData([])
  //   } finally {
  //     setIsLayoutLoading(false)
  //   }
  // }

  // const searchListDefaultValues = {
  //   sortBy: "createdTime",
  //   limit: window.Digit.Utils.browser.isMobile() ? 50 : 10,
  //   offset: 0,
  //   sortOrder: "DESC",
  //   mobileNumber:""
  // };

  // useLayoutCitizenSearchApplication removed from this page; layout data won't be fetched here

  // const getBPAREGFormData = (data) => {
  //   let license = data;
  //   const address = license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress;
  //   const state = license?.tradeLicenseDetail?.additionalDetail?.permanentState;
  //   const distrcit = license?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict;
  //   const permanentAddress = address;
  //   const nameParts = license?.tradeLicenseDetail?.owners?.[0]?.name.trim()?.split(/\s+/);

  //   let name = "";
  //   let middleName = "";
  //   let lastName = "";

  //   if (nameParts.length === 1) {
  //     name = nameParts[0];
  //   } else if (nameParts.length === 2) {
  //     name = nameParts[0];
  //     lastName = nameParts[1];
  //   } else if (nameParts.length > 2) {
  //     name = nameParts[0];
  //     lastName = nameParts[nameParts.length - 1];
  //     middleName = nameParts.slice(1, -1).join(" ");
  //   }

  //   let intermediateData = {
  //     Correspondenceaddress:
  //       license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress ||
  //       `${license?.tradeLicenseDetail?.address?.doorNo ? `${license?.tradeLicenseDetail?.address?.doorNo}, ` : ""} ${
  //         license?.tradeLicenseDetail?.address?.street ? `${license?.tradeLicenseDetail?.address?.street}, ` : ""
  //       }${license?.tradeLicenseDetail?.address?.landmark ? `${license?.tradeLicenseDetail?.address?.landmark}, ` : ""}${t(
  //         license?.tradeLicenseDetail?.address?.locality.code
  //       )}, ${t(license?.tradeLicenseDetail?.address?.city ? license?.tradeLicenseDetail?.address?.city.code : "")},${
  //         t(license?.tradeLicenseDetail?.address?.pincode) ? `${license.tradeLicenseDetail?.address?.pincode}` : " "
  //       }`,
  //     formData: {
  //       LicneseDetails: {
  //         PanNumber: license?.tradeLicenseDetail?.owners?.[0]?.pan,
  //         PermanentAddress: permanentAddress,
  //         email: license?.tradeLicenseDetail?.owners?.[0]?.emailId,
  //         gender: {
  //           code: license?.tradeLicenseDetail?.owners?.[0]?.gender,
  //           i18nKey: `COMMON_GENDER_${license?.tradeLicenseDetail?.owners?.[0]?.gender}`,
  //           value: license?.tradeLicenseDetail?.owners?.[0]?.gender,
  //         },
  //         mobileNumber: license?.tradeLicenseDetail?.owners?.[0]?.mobileNumber,
  //         name: name,
  //         lastName: lastName,
  //         middleName: middleName,
  //         SelectedState: state || "",
  //         SelectedDistrict: distrcit || "",
  //         Pincode: license?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode || "",
  //         Ulb: license?.tradeLicenseDetail?.additionalDetail?.Ulb || [],
  //         dateOfBirth: data?.tradeLicenseDetail?.owners?.[0]?.dob ? Digit.Utils.date.getDate(data?.tradeLicenseDetail?.owners?.[0]?.dob) || null : null,
  //         SelectedCorrespondentState: license?.tradeLicenseDetail?.additionalDetail?.correspondenceState,
  //         SelectedCorrespondentDistrict: license?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict,
  //         PincodeCorrespondent: license?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode,
  //       },
  //       LicneseType: {
  //         LicenseType: {
  //           i18nKey: `TRADELICENSE_TRADETYPE_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`,
  //           role: [`BPA_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`],
  //           tradeType: license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType,
  //         },
  //         ArchitectNo: license?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || null,
  //         selfCertification: license?.tradeLicenseDetail?.additionalDetail?.isSelfCertificationRequired || false,
  //         qualificationType: license?.tradeLicenseDetail?.additionalDetail?.qualificationType || null,
  //       },
  //     },
  //     isAddressSame:
  //       license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress === license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress ? true : false,
  //     result: {
  //       Licenses: [{ ...data }],
  //     },
  //     initiationFlow: true,
  //     editableFields: {
  //       "provide-license-type": true,
  //       "licensee-details": false,
  //       "Permanent-address": true,
  //       "professional-document-details": true,
  //       isCreate: false,
  //       applicationType: "EDIT"
  //     }
  //   };

  //   sessionStorage.setItem("BPAREGintermediateValue", JSON.stringify(intermediateData));
  //   history.push("/digit-ui/citizen/obps/stakeholder/apply/stakeholder-docs-required");
  // };

  // const getBPAREGFormDataForUpgrade = (data) => {

  //   let license = data;
  //   const address = license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress;
  //   const state = license?.tradeLicenseDetail?.additionalDetail?.permanentState;
  //   const distrcit = license?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict;
  //   const permanentAddress = address
  //   const nameParts = license?.tradeLicenseDetail?.owners?.[0]?.name.trim()?.split(/\s+/);

  //   let name = "";
  //   let middleName = "";
  //   let lastName = "";

  //   if (nameParts.length === 1) {
  // // Single name
  //     name = nameParts[0];
  //   } else if (nameParts.length === 2) {
  //     // Two names → first is name, second is lastName
  //     name = nameParts[0];
  //     lastName = nameParts[1];
  //   } else if (nameParts.length > 2) {
  //     // More than two names → first = name, last = lastName, middle = rest
  //     name = nameParts[0];
  //     lastName = nameParts[nameParts.length - 1];
  //     middleName = nameParts.slice(1, -1).join(" ");
  //   }

  //   let intermediateData = {
  //     Correspondenceaddress:
  //       license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress ||
  //       `${license?.tradeLicenseDetail?.address?.doorNo ? `${license?.tradeLicenseDetail?.address?.doorNo}, ` : ""} ${
  //         license?.tradeLicenseDetail?.address?.street ? `${license?.tradeLicenseDetail?.address?.street}, ` : ""
  //       }${license?.tradeLicenseDetail?.address?.landmark ? `${license?.tradeLicenseDetail?.address?.landmark}, ` : ""}${t(
  //         license?.tradeLicenseDetail?.address?.locality.code
  //       )}, ${t(license?.tradeLicenseDetail?.address?.city ? license?.tradeLicenseDetail?.address?.city.code : "")},${
  //         t(license?.tradeLicenseDetail?.address?.pincode) ? `${license.tradeLicenseDetail?.address?.pincode}` : " "
  //       }`,
  //     formData: {
  //       LicneseDetails: {
  //         PanNumber: license?.tradeLicenseDetail?.owners?.[0]?.pan,
  //         PermanentAddress: permanentAddress,

  //         email: license?.tradeLicenseDetail?.owners?.[0]?.emailId,
  //         gender: {
  //           code: license?.tradeLicenseDetail?.owners?.[0]?.gender,
  //           i18nKey: `COMMON_GENDER_${license?.tradeLicenseDetail?.owners?.[0]?.gender}`,
  //           value: license?.tradeLicenseDetail?.owners?.[0]?.gender,
  //         },
  //         mobileNumber: license?.tradeLicenseDetail?.owners?.[0]?.mobileNumber,
  //         name: name,
  //         lastName: lastName,
  //         middleName: middleName,
  //         SelectedState: state || "",
  //         SelectedDistrict: distrcit || "",
  //         Pincode: license?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode || "",
  //         Ulb: license?.tradeLicenseDetail?.additionalDetail?.Ulb || [],
  //         dateOfBirth: data?.tradeLicenseDetail?.owners?.[0]?.dob ? Digit.Utils.date.getDate(data?.tradeLicenseDetail?.owners?.[0]?.dob) || null : null,
  //         SelectedCorrespondentState: license?.tradeLicenseDetail?.additionalDetail?.correspondenceState,
  //         SelectedCorrespondentDistrict: license?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict,
  //         PincodeCorrespondent: license?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode,
  //       },
  //       LicneseType: {
  //         LicenseType: {
  //           i18nKey: `TRADELICENSE_TRADETYPE_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`,
  //           role: [`BPA_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`],
  //           tradeType: license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType,
  //         },
  //         ArchitectNo: license?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || null,
  //         selfCertification: license?.tradeLicenseDetail?.additionalDetail?.isSelfCertificationRequired || false,
  //         qualificationType: license?.tradeLicenseDetail?.additionalDetail?.qualificationType || null,
  //       },
  //     },
  //     isAddressSame:
  //       license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress === license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress ? true : false,
  //     result: {
  //       Licenses: [{ ...data }],
  //     },
  //     initiationFlow: true,
  //     editableFields: {
  //       "provide-license-type": true,
  //       "licensee-details": false,
  //       "Permanent-address": true,
  //       "professional-document-details": true,
  //       isCreate: false,
  //       applicationType: "UPGRADE"
  //     }
  //   };

  //   sessionStorage.setItem("BPAREGintermediateValue", JSON.stringify(intermediateData));
  //   history.push("/digit-ui/citizen/obps/stakeholder/apply/stakeholder-docs-required");
  // };

  // const getBPAREGFormDataForRenew = (data) => {

  //   let license = data;
  //   const address = license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress;
  //   const state = license?.tradeLicenseDetail?.additionalDetail?.permanentState;
  //   const distrcit = license?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict;
  //   const permanentAddress = address
  //   const nameParts = license?.tradeLicenseDetail?.owners?.[0]?.name.trim()?.split(/\s+/);

  //   let name = "";
  //   let middleName = "";
  //   let lastName = "";

  //   if (nameParts.length === 1) {
  // // Single name
  //     name = nameParts[0];
  //   } else if (nameParts.length === 2) {
  //     // Two names → first is name, second is lastName
  //     name = nameParts[0];
  //     lastName = nameParts[1];
  //   } else if (nameParts.length > 2) {
  //     // More than two names → first = name, last = lastName, middle = rest
  //     name = nameParts[0];
  //     lastName = nameParts[nameParts.length - 1];
  //     middleName = nameParts.slice(1, -1).join(" ");
  //   }

  //   let intermediateData = {
  //     Correspondenceaddress:
  //       license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress ||
  //       `${license?.tradeLicenseDetail?.address?.doorNo ? `${license?.tradeLicenseDetail?.address?.doorNo}, ` : ""} ${
  //         license?.tradeLicenseDetail?.address?.street ? `${license?.tradeLicenseDetail?.address?.street}, ` : ""
  //       }${license?.tradeLicenseDetail?.address?.landmark ? `${license?.tradeLicenseDetail?.address?.landmark}, ` : ""}${t(
  //         license?.tradeLicenseDetail?.address?.locality.code
  //       )}, ${t(license?.tradeLicenseDetail?.address?.city ? license?.tradeLicenseDetail?.address?.city.code : "")},${
  //         t(license?.tradeLicenseDetail?.address?.pincode) ? `${license.tradeLicenseDetail?.address?.pincode}` : " "
  //       }`,
  //     formData: {
  //       LicneseDetails: {
  //         PanNumber: license?.tradeLicenseDetail?.owners?.[0]?.pan,
  //         PermanentAddress: permanentAddress,

  //         email: license?.tradeLicenseDetail?.owners?.[0]?.emailId,
  //         gender: {
  //           code: license?.tradeLicenseDetail?.owners?.[0]?.gender,
  //           i18nKey: `COMMON_GENDER_${license?.tradeLicenseDetail?.owners?.[0]?.gender}`,
  //           value: license?.tradeLicenseDetail?.owners?.[0]?.gender,
  //         },
  //         mobileNumber: license?.tradeLicenseDetail?.owners?.[0]?.mobileNumber,
  //         name: name,
  //         lastName: lastName,
  //         middleName: middleName,
  //         SelectedState: state || "",
  //         SelectedDistrict: distrcit || "",
  //         Pincode: license?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode || "",
  //         Ulb: license?.tradeLicenseDetail?.additionalDetail?.Ulb || [],
  //         dateOfBirth: data?.tradeLicenseDetail?.owners?.[0]?.dob ? Digit.Utils.date.getDate(data?.tradeLicenseDetail?.owners?.[0]?.dob) || null : null,
  //         SelectedCorrespondentState: license?.tradeLicenseDetail?.additionalDetail?.correspondenceState,
  //         SelectedCorrespondentDistrict: license?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict,
  //         PincodeCorrespondent: license?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode,
  //       },
  //       LicneseType: {
  //         LicenseType: {
  //           i18nKey: `TRADELICENSE_TRADETYPE_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`,
  //           role: [`BPA_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`],
  //           tradeType: license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType,
  //         },
  //         ArchitectNo: license?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || null,
  //         selfCertification: license?.tradeLicenseDetail?.additionalDetail?.isSelfCertificationRequired || false,
  //         qualificationType: license?.tradeLicenseDetail?.additionalDetail?.qualificationType || null,
  //       },
  //     },
  //     isAddressSame:
  //       license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress === license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress ? true : false,
  //     result: {
  //       Licenses: [{ ...data }],
  //     },
  //     initiationFlow: true,
  //     editableFields: {
  //       "provide-license-type": true,
  //       "licensee-details": false,
  //       "Permanent-address": true,
  //       "professional-document-details": true,
  //       isCreate: false,
  //       applicationType: "RENEWAL"
  //     }
  //   };

  //   sessionStorage.setItem("BPAREGintermediateValue", JSON.stringify(intermediateData));
  //   history.push("/digit-ui/citizen/obps/stakeholder/apply/stakeholder-docs-required");
  // };

  // useEffect(() => {
  //   return () => {
  //     setFinalData([]);
  //     revalidate?.();
  //     revalidatePunjab?.();
  //     bpaRevalidate?.();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!isLoading && !isBpaSearchLoading) {
  //     let searchConvertedArray = [];
  //     let sortConvertedArray = [];
  //     if (data?.Licenses?.length) {
  //       data?.Licenses?.forEach((license) => {
  //         license.sortNumber = 0;
  //         license.modifiedTime = license.auditDetails.lastModifiedTime;
  //         license.type = "BPAREG";
  //         searchConvertedArray.push(license);
  //       });

  //     }

  //     if (dataPunjab?.Licenses?.length) {
  //     dataPunjab?.Licenses?.forEach((license) => {
  //       license.sortNumber = 0;
  //       license.modifiedTime = license.auditDetails.lastModifiedTime;
  //       license.type = "BPAREG";
  //       searchConvertedArray.push(license);
  //     });
  //   }

  //     // if (bpaData?.length) {
  //     //   bpaData?.forEach((bpaDta) => {
  //     //     bpaDta.sortNumber = 0;
  //     //     bpaDta.modifiedTime = bpaDta.auditDetails.lastModifiedTime;
  //     //     bpaDta.type = "BPA";
  //     //     searchConvertedArray.push(bpaDta);
  //     //   });
  //     // }
  //     if (Array.isArray(bpaData) && bpaData.length > 0) {
  //       bpaData.forEach((bpaDta) => {
  //         bpaDta.sortNumber = 0;
  //         bpaDta.modifiedTime = bpaDta.auditDetails?.lastModifiedTime || null;
  //         bpaDta.type = "BPA";
  //         searchConvertedArray.push(bpaDta);
  //       });
  //     }

  //     // Layout results are intentionally excluded from aggregation on this page

  //     sortConvertedArray = [].slice.call(searchConvertedArray).sort(function (a, b) {
  //       return new Date(b.modifiedTime) - new Date(a.modifiedTime) || a.sortNumber - b.sortNumber;
  //     });
  //     setFinalData(sortConvertedArray);
  //     let userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  //     const userInfoDetails = userInfos ? JSON.parse(userInfos) : {};
  //     if (userInfoDetails?.value?.info?.roles?.length == 1 && userInfoDetails?.value?.info?.roles?.[0]?.code == "CITIZEN") setLableMessage(true);
  //   }
  // }, [isLoading, isLoadingPunjab, isBpaSearchLoading, bpaData, data]);

  // const isRenewalEnabled = (validToEpoch) => {
  //   if (!validToEpoch || isreminderLoading) return false;

  //   const today = new Date();
  //   const validToDate = new Date(validToEpoch);

  //   const diffInMs = validToDate.getTime() - today.getTime();
  //   // const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  //   return diffInMs <= reminderPeriod?.TradeLicense?.ReminderPeriods?.[0]?.reminderPeriods;
  // };

  if (isLoading || isLoadingPunjab) {
    return <Loader />;
  }

  // const getTotalCount = (LicensesLength, bpaDataLength) => {
  //   let count = 0;
  //   if (typeof LicensesLength == "number") {
  //     count = count + LicensesLength;
  //   }

  //   if (typeof bpaDataLength == "number") {
  //     count = count + bpaDataLength;
  //   }

  //   // layout counts removed as layout search isn't used on this page

  //   if (count > 0) return `(${count})`;
  //   else return "";
  // };

  // const editApplication = (application, history) => {
  //   sessionStorage.setItem("Digit.BUILDING_PERMIT", JSON.stringify({
  //     value: {
  //       data: {
  //         scrutinyNumber:{
  //           edcrNumber: application?.edcrNumber
  //         },
  //         applicationNo: application?.applicationNo
  //       }
  //     }
  //   }))
  //   history.push('/digit-ui/citizen/obps/bpa/building_plan_scrutiny/new_construction/docs-required');
  // }

  return (
    <Fragment>
      <Header styles={{ marginLeft: "10px" }}>
        My Applications
        {/* ${getTotalCount(data?.Licenses?.length, bpaData?.length)} */}
      </Header>
      <div  className="ndc-new-filter-status-wrapper obps-pages-citizen-my-application-index--style-1">
        <div className="ndc-new-filter-status-grid ndc-new-filter-card-grid">
          <button
            onClick={() => {
              history.push("/digit-ui/citizen/obps/my-applications/citizen-bpa");
            }}
            type="button"
            className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card success ${true ? "active" : ""}`}
          >
            <div className="ndc-new-filter-status-title ndc-new-filter-option-title">Building Plan Approval</div>
          </button>
          {dataPunjab?.Count > 0 && (
            <button
              onClick={() => {
                history.push("/digit-ui/citizen/obps/my-applications/citizen-stakeholder-inbox");
              }}
              type="button"
              className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card primary ${true ? "active" : ""}`}
            >
              <div className="ndc-new-filter-status-title ndc-new-filter-option-title">Professional (Architect)</div>
            </button>
          )}
          {data?.Count > 0 && (
            <button
              onClick={() => {
                history.push("/digit-ui/citizen/obps/my-applications/stakeholder-inbox/citizen-others");
              }}
              type="button"
              className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card success ${true ? "active" : ""}`}
            >
              <div className="ndc-new-filter-status-title ndc-new-filter-option-title">Professional (others)</div>
            </button>
          )}
          <button
            onClick={() => {
              history.push("/digit-ui/citizen/obps/my-applications/citizen-layout");
            }}
            type="button"
            className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card warning ${true ? "active" : ""}`}
          >
            <div className="ndc-new-filter-status-title ndc-new-filter-option-title">Layout</div>
          </button>
          <button
            onClick={() => {
              history.push("/digit-ui/citizen/obps/my-applications/citizen-clu");
            }}
            type="button"
            className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card primary ${true ? "active" : ""}`}
          >
            <div className="ndc-new-filter-status-title ndc-new-filter-option-title">Change of Land Use</div>
          </button>
          <button
            onClick={() => {
              history.push({
                pathname: "/digit-ui/citizen/noc/noc-my-application",
                state: { fromOBPS: true }
              });
            }}
            type="button"
            className={`ndc-new-filter-status-card ndc-new-filter-option-card ndc-new-filter-card success ${true ? "active" : ""}`}
          >
            <div className="ndc-new-filter-status-title ndc-new-filter-option-title">NOC - Regularization of Plot</div>
          </button>
        </div>
      </div>

      {}
    </Fragment>
  );
};

export default MyApplication;
