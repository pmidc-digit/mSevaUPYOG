import { useQuery } from "react-query";
import { FIRENOCService } from "../../services/elements/FIRENOC";

const convertEpochToDate = (dateEpoch) => {
  if (!dateEpoch) return "NA";
  const d = new Date(dateEpoch);
  if (isNaN(d.getTime())) return "NA";
  let month = d.getMonth() + 1;
  let day = d.getDate();
  let year = d.getFullYear();
  month = (month > 9 ? "" : "0") + month;
  day = (day > 9 ? "" : "0") + day;
  return `${day}/${month}/${year}`;
};

const DOCUMENT_LABELS = {
  "OWNER.PROPERTY.OWNERSHIPPROOF": "Proof of Ownership",
  "OWNER.IDENTITYPROOF": "Identity Proof",
  "OWNER.IDENTITYPROOF.AADHAAR": "Aadhaar Card",
  "OWNER.IDENTITYPROOF.DRIVING": "Driving License",
  "OWNER.IDENTITYPROOF.VOTERID": "Voter ID",
  "OWNER.IDENTITYPROOF.PASSPORT": "Passport",
  "OWNER.PROPERTY.FIREDRAWING": "Fire Drawing",
  "OWNER.PROPERTY.OWNERSHIPCHECKLIST": "Owner Checklist",
};

const useFireNOCApplicationDetail = (t, tenantId, applicationNumber) => {
  return useQuery(
    ["FIRENOC_APPLICATION_DETAIL", tenantId, applicationNumber],
    async () => {
      const data = await FIRENOCService.search({ filters: { tenantId, applicationNumber } });
      const noc = data?.FireNOCs?.[0];
      if (!noc) return null;

      // Fetch bill data — try fetchBill first, fall back to payment search if already paid
      let billData = null;
      let paymentData = null;
      try {
        const billResponse = await Digit.PaymentService.fetchBill(tenantId, {
          businessService: "FIRENOC",
          consumerCode: applicationNumber,
        });
        billData = billResponse?.Bill?.[0] || null;
      } catch (e) {
        // No active bill — payment may already be done
      }
      if (!billData) {
        try {
          const paymentResponse = await Digit.PaymentService.getReciept(tenantId, "FIRENOC", { consumerCodes: applicationNumber });
          paymentData = paymentResponse?.Payments?.[0] || null;
          billData = paymentData?.paymentDetails?.[0]?.bill || null;
        } catch (e) {
          // No payment found either
        }
      }

      const details = noc.fireNOCDetails;
      const building = details?.buildings?.[0];
      const address = details?.propertyDetails?.address;
      const documents = details?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [];

      const uomMap = {};
      building?.uoms?.filter((u) => u.active)?.forEach((u) => { uomMap[u.code] = u.value; });

      const cityName = address?.city?.split(".")?.[1]
        ? address.city.split(".")[1].charAt(0).toUpperCase() + address.city.split(".")[1].slice(1)
        : address?.city || "NA";

      const applicationSummary = {
        title: " ",
        asSectionHeader: false,
        values: [
          { title: "FN_APPLICATION_NUMBER", value: details?.applicationNumber || "NA" },
          { title: "FN_APPLICATION_STATUS", value: details?.status || "NA" },
          { title: "FN_APPLICATION_CHANNEL", value: details?.channel || "NA" },
        ],
      };

      const nocDetails = {
        title: "FN_DETAILS",
        asSectionHeader: true,
        values: [
          { title: "FN_TYPE", value: details?.fireNOCType || "NA" },
          { title: "FN_PROVISIONAL_NUMBER", value: noc?.fireNOCNumber || "NA" },
          { title: "FN_VALIDITY_YEAR", value: details?.additionalDetail?.validityYears ? String(details.additionalDetail.validityYears) : "NA" },
          { title: "FN_FINANCIAL_YEAR", value: details?.financialYear || "NA" },
        ],
      };

      const propertyDetails = {
        title: "FN_PROPERTY_DETAILS",
        asSectionHeader: true,
        values: [
          { title: "FN_PROPERTY_TYPE", value: details?.noOfBuildings === "SINGLE" ? "SINGLE" : "MULTIPLE" },
          { title: "FN_BUILDING_NAME", value: building?.name || "NA" },
          { title: "FN_USAGE_TYPE_NBC", value: building?.usageType || "NA" },
          { title: "FN_USAGE_SUBTYPE_NBC", value: building?.usageSubType || "NA" },
          { title: "FN_LAND_AREA_SQ_M", value: building?.landArea != null ? String(building.landArea) : "NA" },
          { title: "FN_COVERED_AREA_SQ_M", value: building?.totalCoveredArea != null ? String(building.totalCoveredArea) : "NA" },
          { title: "FN_PARKING_AREA_SQ_M", value: building?.parkingArea != null ? String(building.parkingArea) : "NA" },
          { title: "FN_HEIGHT_OF_BUILDING", value: uomMap["HEIGHT_OF_BUILDING"] != null ? String(uomMap["HEIGHT_OF_BUILDING"]) : "NA" },
          { title: "FN_NO_OF_FLOORS", value: uomMap["NO_OF_FLOORS"] != null ? String(uomMap["NO_OF_FLOORS"]) : "NA" },
          { title: "FN_NO_OF_BASEMENTS", value: uomMap["NO_OF_BASEMENTS"] != null ? String(uomMap["NO_OF_BASEMENTS"]) : "NA" },
        ],
      };

      const locationDetails = {
        title: "FN_PROPERTY_LOCATION_DETAILS",
        asSectionHeader: true,
        values: [
          { title: "FN_PROPERTY_ID", value: details?.propertyDetails?.propertyId || "NA" },
          { title: "FN_AREA_TYPE", value: address?.areaType || "NA" },
          { title: "FN_DISTRICT_NAME", value: address?.subDistrict || "NA" },
          { title: "FN_CITY", value: cityName },
          { title: "FN_DOOR_HOUSE_NO", value: address?.doorNo || "NA" },
          { title: "FN_STREET_NAME", value: address?.street || "NA" },
          { title: "FN_LANDMARK", value: "NA" },
          { title: "FN_MOHALLA", value: address?.locality?.code || address?.locality?.name || "NA" },
          { title: "FN_PINCODE", value: address?.pincode || "NA" },
          { title: "FN_FIRE_STATION", value: details?.firestationId ? details.firestationId.replace(/_/g, " ") : "NA" },
        ],
      };

      const applicantDetails = {
        title: "FN_APPLICANT_DETAILS",
        additionalDetails: {
          owners: details?.applicantDetails?.owners?.map((own, index) => ({
            title: details?.applicantDetails?.owners?.length > 1 ? `Owner ${index + 1}` : "",
            values: [
              { title: "FN_MOBILE_NUMBER", value: own?.mobileNumber || "NA" },
              { title: "FN_OWNER_NAME", value: own?.name || "NA" },
              { title: "FN_GENDER", value: own?.gender ? own.gender.charAt(0).toUpperCase() + own.gender.slice(1).toLowerCase() : "NA" },
              { title: "FN_FATHER_HUSBAND_NAME", value: own?.fatherOrHusbandName || "NA" },
              { title: "FN_RELATIONSHIP", value: own?.relationship || "NA" },
              { title: "FN_DATE_OF_BIRTH", value: convertEpochToDate(own?.dob) },
              { title: "FN_EMAIL", value: own?.emailId || "NA" },
              { title: "FN_PAN_NO", value: own?.pan || "NA" },
              { title: "FN_CORRESPONDENCE_ADDRESS", value: own?.correspondenceAddress || "NA" },
            ],
          })),
          documents: [
            {
              title: "PT_COMMON_DOCS",
              values: documents.map((doc) => ({
                title: DOCUMENT_LABELS[doc.documentType] || doc.documentType?.replace(/\./g, " ") || "Document",
                documentType: doc.documentType,
                fileStoreId: doc.fileStoreId,
              })),
            },
          ],
        },
      };

      const employeeResponse = [];
      employeeResponse.push(applicationSummary);

      // Fee Estimate section — right after application summary
      if (billData) {
        const billAccountDetails = billData?.billDetails?.[0]?.billAccountDetails || [];
        if (billAccountDetails.length > 0) {
          employeeResponse.push({
            title: "FN_FEE_ESTIMATE",
            asSectionHeader: true,
            additionalDetails: {
              taxHeadEstimatesCalculation: {
                taxHeadEstimates: billAccountDetails.map((d) => ({
                  taxHeadCode: d.taxHeadCode,
                  estimateAmount: d.amount,
                })),
                totalAmount: billData.totalAmount,
              },
            },
          });
        }
      }

      employeeResponse.push(nocDetails);
      employeeResponse.push(propertyDetails);
      employeeResponse.push(locationDetails);
      employeeResponse.push(applicantDetails);

      return {
        tenantId: noc.tenantId,
        applicationDetails: employeeResponse,
        applicationData: noc,
      };
    },
    {
      enabled: !!tenantId && !!applicationNumber,
    }
  );
};

export default useFireNOCApplicationDetail;
