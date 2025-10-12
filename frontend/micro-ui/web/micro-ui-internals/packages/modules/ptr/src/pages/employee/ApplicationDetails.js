import {
  Card,
  CardSubHeader,
  Header,
  LinkButton,
  Loader,
  Row,
  StatusTable,
  MultiLink,
  PopUp,
  Toast,
  SubmitBar,
  ActionBar,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import getPetAcknowledgementData from "../../getPetAcknowledgementData";
import PTRWFApplicationTimeline from "../../pageComponents/PTRWFApplicationTimeline";
import { pdfDownloadLink } from "../../utils";
import PTRDocument from "../../pageComponents/PTRDocument";

import get from "lodash/get";
import { size } from "lodash";

const ApplicationDetails = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams();
  const [acknowldgementData, setAcknowldgementData] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [popup, setpopup] = useState(false);
  const [showToast, setShowToast] = useState(null);

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const { isLoading, isError, error, data } = Digit.Hooks.ptr.usePTRSearch({
    tenantId,
    filters: { applicationNumber: id },
    config: { staleTime: 0, refetchOnMount: "always" },
  });

  const [billData, setBillData] = useState(null);

  const PetRegistrationApplications = get(data, "PetRegistrationApplications", []);

  const petId = get(data, "PetRegistrationApplications[0].applicationNumber", []);

  let pet_details = (PetRegistrationApplications && PetRegistrationApplications.length > 0 && PetRegistrationApplications[0]) || {};
  const application = pet_details;

  sessionStorage.setItem("ptr-pet", JSON.stringify(application));

  const [loading, setLoading] = useState(false);

  const fetchBillData = async () => {
    setLoading(true);
    const result = await Digit.PaymentService.fetchBill(tenantId, { businessService: "pet-services", consumerCode: id });

    setBillData(result);
    setLoading(false);
  };
  useEffect(() => {
    fetchBillData();
  }, [tenantId, id]);

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditResponse } = Digit.Hooks.ptr.usePTRSearch(
    {
      tenantId,
      filters: { applicationNumber: petId, audit: true },
    },
    {
      enabled: true,
    }
  );

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "pet-services",
      consumerCodes: id,
      isEmployee: false,
    },
    { enabled: id ? true : false }
  );

  if (!pet_details.workflow) {
    let workflow = {
      id: null,
      tenantId: tenantId,
      businessService: "pet-services",
      businessId: application?.applicationNumber,
      action: "",
      moduleName: "pet-services",
      state: null,
      comment: null,
      documents: null,
      assignes: null,
    };
    pet_details.workflow = workflow;
  }

  if (isLoading || auditDataLoading) {
    return <Loader />;
  }

  const getAcknowledgementData = async () => {
    const applications = application || {};
    const tenantInfo = tenants.find((tenant) => tenant.code === applications.tenantId);
    const acknowldgementDataAPI = await getPetAcknowledgementData({ ...applications }, tenantInfo, t);
    Digit.Utils.pdf.generate(acknowldgementDataAPI);
    //setAcknowldgementData(acknowldgementDataAPI);
  };

  let documentDate = t("CS_NA");
  if (pet_details?.additionalDetails?.documentDate) {
    const date = new Date(pet_details?.additionalDetails?.documentDate);
    const month = Digit.Utils.date.monthNames[date.getMonth()];
    documentDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let response = { filestoreIds: [payments?.fileStoreId] };
    response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "petservice-receipt");
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  const handleDownload = async (document, tenantid) => {
    let tenantId = tenantid ? tenantid : tenantId;
    const res = await Digit.UploadServices.Filefetch([document?.fileStoreId], tenantId);
    let documentLink = pdfDownloadLink(res.data, document?.fileStoreId);
    window.open(documentLink, "_blank");
  };

  const printCertificate = async () => {
    let response = await Digit.PaymentService.generatePdf(
      tenantId,
      { PetRegistrationApplications: [data?.PetRegistrationApplications?.[0]] },
      "petservicecertificate"
    );
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  };

  let dowloadOptions = [];

  dowloadOptions.push({
    label: t("PTR_PET_DOWNLOAD_ACK_FORM"),
    onClick: () => getAcknowledgementData(),
  });

  //commented out, need later for download receipt and certificate
  if (reciept_data && reciept_data?.Payments.length > 0 && recieptDataLoading == false)
    dowloadOptions.push({
      label: t("PTR_FEE_RECIEPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });

  if (reciept_data?.Payments[0]?.paymentStatus === "DEPOSITED")
    dowloadOptions.push({
      label: t("PTR_CERTIFICATE"),
      onClick: () => printCertificate(),
    });

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          {/* <Header styles={{ fontSize: "32px" }}>{t("CS_APPLICATION_DETAILS")}</Header> */}
          {/* {PetRegistrationApplications?.status == "approved" && dowloadOptions && dowloadOptions.length > 0 && (
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => setShowOptions(!showOptions)}
              displayOptions={showOptions}
              options={dowloadOptions}
            />
          )} */}
        </div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITLE_APPLICANT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("REPORT_FSM_RESULT_APPLICANTNAME")} text={pet_details?.owner?.name || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}
              text={pet_details?.fatherName || pet_details?.owner?.fatherOrHusbandName || t("CS_NA")}
            />
            <Row className="border-none" label={t("MOBILE")} text={pet_details?.owner?.mobileNumber || t("CS_NA")} />
            <Row className="border-none" label={t("CORE_COMMON_PROFILE_EMAIL")} text={pet_details?.owner?.emailId || t("CS_NA")} />
            <Row className="border-none" label={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} text={pet_details?.applicationNumber} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("WS_COMMON_TABLE_COL_ADDRESS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("PTR_ADDRESS")} text={pet_details?.address?.addressId || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_PINCODE")} text={pet_details?.address?.pincode || t("CS_NA")} />
            {/* <Row className="border-none" label={t("PTR_CITY")} text={pet_details?.address?.city || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_STREET_NAME")} text={pet_details?.address?.street || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_HOUSE_NO")} text={pet_details?.address?.doorNo || t("CS_NA")} /> */}
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITILE_PET_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("PTR_PET_NAME")} text={pet_details?.petDetails?.petName || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_SEARCH_PET_TYPE")} text={t(pet_details?.petDetails?.petType) || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_SEARCH_BREED_TYPE")} text={t(pet_details?.petDetails?.breedType) || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_PET_GENDER")} text={pet_details?.petDetails?.petGender || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_COLOR")} text={pet_details?.petDetails?.petColor || t("CS_NA")} />

            <Row
              className="border-none"
              label={t("PTR_VACCINATED_DATE")}
              // text={pet_details?.petDetails?.lastVaccineDate || t("CS_NA")}
              text={
                pet_details?.petDetails?.lastVaccineDate
                  ? new Date(Number(pet_details.petDetails.lastVaccineDate)).toLocaleDateString("en-GB")
                  : t("CS_NA")
              }
            />
            <Row className="border-none" label={t("PTR_VACCINATION_NUMBER")} text={pet_details?.petDetails?.vaccinationNumber || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_DOCTOR_NAME")} text={pet_details?.petDetails?.doctorName || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_CLINIC_NAME")} text={pet_details?.petDetails?.clinicName || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITLE_DOCS")}</CardSubHeader>
          <div>
            {Array.isArray(application?.documents) && application.documents.length > 0 ? (
              <PTRDocument
                petdetail={{
                  documents: application.documents, // ✅ pass all docs
                  applicationNumber: application.applicationNumber,
                }}
              />
            ) : (
              <StatusTable>
                <Row className="border-none" text={t("PTR_NO_DOCUMENTS_MSG")} />
              </StatusTable>
            )}
          </div>
          {(pet_details?.status == "CITIZENACTIONREQUIRED" || pet_details?.status == "INITIATED") && (
            <ActionBar>
              <SubmitBar
                label={t("COMMON_EDIT")}
                onSubmit={() => {
                  history.push(`/digit-ui/employee/ptr/petservice/new-application/${id}`);
                }}
              />
            </ActionBar>
          )}
          <PTRWFApplicationTimeline application={application} id={application?.applicationNumber} userType={"citizen"} />
          {showToast && (
            <Toast
              error={showToast.key}
              label={t(showToast.label)}
              style={{ bottom: "0px" }}
              onClose={() => {
                setShowToast(null);
              }}
            />
          )}
        </Card>

        {/* {popup && <PTCitizenFeedbackPopUp setpopup={setpopup} setShowToast={setShowToast} data={data} />} */}
      </div>
    </React.Fragment>
  );
};

export default ApplicationDetails;
