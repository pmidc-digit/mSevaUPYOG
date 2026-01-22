import React, { Fragment, useEffect } from "react";
import { Card, CardHeader, CardLabel, CardSubHeader, CardText, CitizenInfoLabel, Loader, SubmitBar,NavBar,OpenLinkContainer, BackButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const StakeholderDocsRequired = ({ onSelect, onSkip, config, formData }) => {
  const { t } = useTranslation();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  const history = useHistory();
  const { data, isLoading } = Digit.Hooks.obps.useMDMS(stateId, "StakeholderRegistraition", "TradeTypetoRoleMapping");
  let isopenlink = window.location.href.includes("/openlink/");
  const isCitizenUrl = Digit.Utils.browser.isMobile()?true:false;
  if (JSON.parse(sessionStorage.getItem("BPAREGintermediateValue")) !== null) {
    formData = JSON.parse(sessionStorage.getItem("BPAREGintermediateValue"));
    console.log("formData in DocRequired", formData);
    // sessionStorage.setItem("BPAREGintermediateValue", null);
  } else formData = formData;
  const userInfo = Digit.UserService.getUser();
  const requestor = userInfo?.info?.mobileNumber;

  const { data: BPAREGData, isLoading: BPAREGLoading, revalidate } = Digit.Hooks.obps.useBPAREGSearch(
    tenantId,
    {},
    { 
      mobileNumber: requestor,
      onlyLatestApplication: true
    },
    // { cacheTime: 0 },
  )

  useEffect(() => {
    if(!formData?.result?.Licenses?.[0]?.applicationNumber && !BPAREGLoading && BPAREGData?.Licenses?.length > 0){
      getBPAREGFormData(BPAREGData?.Licenses[0]);
    }
  } ,[BPAREGData, BPAREGLoading])  

  const getBPAREGFormData = (data) => {
    console.log("data in getBPAREGFormData 2", data);
    let license = data;
    const address = license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress;
    const state = license?.tradeLicenseDetail?.additionalDetail?.permanentState;
    const distrcit = license?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict;
    const permanentAddress = address
    const nameParts = license?.tradeLicenseDetail?.owners?.[0]?.name.trim().split(/\s+/);

    let name = "";
    let middleName = "";
    let lastName = "";

    if (nameParts.length === 1) {
  // Single name
      name = nameParts[0];
    } else if (nameParts.length === 2) {
      // Two names → first is name, second is lastName
      name = nameParts[0];
      lastName = nameParts[1];
    } else if (nameParts.length > 2) {
      // More than two names → first = name, last = lastName, middle = rest
      name = nameParts[0];
      lastName = nameParts[nameParts.length - 1];
      middleName = nameParts.slice(1, -1).join(" ");
    }

    let intermediateData = {
      Correspondenceaddress:
        license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress ||
        `${license?.tradeLicenseDetail?.address?.doorNo ? `${license?.tradeLicenseDetail?.address?.doorNo}, ` : ""} ${
          license?.tradeLicenseDetail?.address?.street ? `${license?.tradeLicenseDetail?.address?.street}, ` : ""
        }${license?.tradeLicenseDetail?.address?.landmark ? `${license?.tradeLicenseDetail?.address?.landmark}, ` : ""}${t(
          license?.tradeLicenseDetail?.address?.locality.code
        )}, ${t(license?.tradeLicenseDetail?.address?.city ? license?.tradeLicenseDetail?.address?.city.code : "")},${
          t(license?.tradeLicenseDetail?.address?.pincode) ? `${license.tradeLicenseDetail?.address?.pincode}` : " "
        }`,
      formData: {
        LicneseDetails: {
          PanNumber: license?.tradeLicenseDetail?.owners?.[0]?.pan,
          PermanentAddress: permanentAddress,

          email: license?.tradeLicenseDetail?.owners?.[0]?.emailId,
          gender: {
            code: license?.tradeLicenseDetail?.owners?.[0]?.gender,
            i18nKey: `COMMON_GENDER_${license?.tradeLicenseDetail?.owners?.[0]?.gender}`,
            value: license?.tradeLicenseDetail?.owners?.[0]?.gender,
          },
          mobileNumber: license?.tradeLicenseDetail?.owners?.[0]?.mobileNumber,
          name: name,
          lastName: lastName,
          middleName: middleName,
          SelectedState: state || "",
          SelectedDistrict: distrcit || "",
          Pincode: license?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode || "",
          Ulb: license?.tradeLicenseDetail?.additionalDetail?.Ulb || [],
          dateOfBirth: data?.tradeLicenseDetail?.owners?.[0]?.dob ? Digit.Utils.date.getDate(data?.tradeLicenseDetail?.owners?.[0]?.dob) || null : null,
          SelectedCorrespondentState: license?.tradeLicenseDetail?.additionalDetail?.correspondenceState,
          SelectedCorrespondentDistrict: license?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict,
          PincodeCorrespondent: license?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode,
        },
        LicneseType: {
          LicenseType: {
            i18nKey: `TRADELICENSE_TRADETYPE_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.split(".")[0]}`,
            role: [`BPA_${license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType.split(".")[0]}`],
            tradeType: license?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType,
          },
          ArchitectNo: license?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || null,
          selfCertification: license?.tradeLicenseDetail?.additionalDetail?.isSelfCertificationRequired || false,
          qualificationType: license?.tradeLicenseDetail?.additionalDetail?.qualificationType || null,
        },
      },
      isAddressSame:
        license?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress === license?.tradeLicenseDetail?.owners?.[0]?.permanentAddress ? true : false,
      result: {
        Licenses: [{ ...data }],
      },
      initiationFlow: true,
      editableFields: {
        "provide-license-type": false,
        "licensee-details": false,
        "Permanent-address": true,
        "professional-document-details": true,
        isCreate: false,
        applicationType: "NEW"
      }
    };
    formData = intermediateData;
    sessionStorage.setItem("BPAREGintermediateValue", JSON.stringify(intermediateData));
  };

  // useEffect(()=>{
  //   if(tenantId)
  //   Digit.LocalizationService.getLocale({modules: [`rainmaker-bpareg`], locale: Digit.StoreData.getCurrentLanguage(), tenantId: `${tenantId}`});
  // },[tenantId])
  

  if (isLoading || BPAREGLoading) {
    return (
      <Loader />
    )
  }

  function goNext() {
    if ((formData?.result && formData?.result?.Licenses[0]?.id)){
      console.log("onSelect going", formData);
      onSelect("", formData);
    }else{
      console.log("onSelect going 2", formData);
      onSelect();
    }
  }

  return (
    <Fragment>
      <div className={isopenlink? "OpenlinkContainer":""}>
      {/* {isopenlink &&<OpenLinkContainer />} */}
      {/* <div style={isopenlink?{marginTop:"60px", width:isCitizenUrl?"100%":"70%", marginLeft:"auto",marginRight:"auto"}:{}}> */}
      <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t(`OBPS_DOCS_FILE_SIZE`)} className={"info-banner-wrap-citizen-override"} />
      <Card>
        {/* <CardHeader>{t(`BPA_NEW_BUILDING_HEADER`)}</CardHeader> */}
        {/* <CitizenInfoLabel style={{margin:"0px",textAlign:"center"}} textStyle={{color:"#0B0C0C"}} text={t(`BPA_DOCS_REQUIRED_TIME`)} showInfo={false} /> */}
        <CardText >{t(`BPA_NEW_BUILDING_PERMIT_DESCRIPTION`)}</CardText>
        {isLoading ?
          <Loader /> :
          <Fragment>
            {data?.StakeholderRegistraition?.TradeTypetoRoleMapping?.[0]?.docTypes?.map((doc, index) => (
              <div>
                <div key={index}>
                  <div className="document-required-options" style={{display:"flex"}} >
                    <div className="document-index" >{`${index + 1}.`}&nbsp;</div>
                    <div className="document-description">{` ${t(`BPAREG_HEADER_${doc?.code.replace('.', '_')}`)}`}</div>
                  </div>
                </div>
                <div >
                  <div >
                    <div ></div>
                    {doc?.info ? <div >{`${t(doc?.info.replace('.', '_'))}`}</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </Fragment>
        }
        <SubmitBar label={t(`CS_COMMON_PROCEED`)} onSubmit={goNext} disabled={BPAREGLoading} />
      </Card>
      </div>
      {/* </div> */}
    </Fragment>
  );
};

export default StakeholderDocsRequired; 