import { GCService } from "../../elements/GC";

/**
 * This GCSearch component returns its input data after structuring it to be rendered as application's Data
 * It takes input of the application's data
 * Returns the data to the applicationDetails component
 */

export const GCSearch = {
  all: async (tenantId, filters = {}) => {
    const response = await GCService.search({ tenantId, filters });
    return response;
  },

  application: async (tenantId, filters = {}) => {
    const response = await GCService.search({ tenantId, filters });
    return response.GCDetail[0];
  },

  RegistrationDetails: ({ GCDetail: response, t }) => {
    // function to filter out the fields which have values
    const filterEmptyValues = (values) => values.filter((item) => item.value);
    let gender, dgender;
    if (response?.vendorDetail[0]?.gender) {
      gender = response?.vendorDetail[0]?.gender == "M" ? "Male" : "Female";
    }
    if (response?.vendorDetail[0]?.dependentGender) {
      dgender = response?.vendorDetail[0]?.dependentGender == "M" ? "Male" : "Female";
    }

    return [
      {
        title: "GC_VENDOR_PERSONAL_DETAILS",
        asSectionHeader: true,
        values: filterEmptyValues([
          { title: "GC_APPLICATION_NUMBER", value: response?.applicationNo },
          { title: "GC_VENDOR_NAME", value: response?.vendorDetail[0]?.name },
          { title: "GC_FATHER_NAME", value: response?.vendorDetail[0]?.fatherName },
          { title: "GC_REGISTERED_MOB_NUMBER", value: response?.vendorDetail[0]?.mobileNo },
          { title: "GC_EMAIL", value: response?.vendorDetail[0]?.emailId },
          { title: "GC_DATE_OF_BIRTH", value: response?.vendorDetail[0]?.dob },
          { title: "GC_GENDER", value: gender },
          { title: "GC_SPOUSE_NAME", value: response?.vendorDetail[0]?.spouseName },
          { title: "GC_SPOUSE_DATE_OF_BIRTH", value: response?.vendorDetail[0]?.spouseDob },
          { title: "GC_DEPENDENT_NAME", value: response?.vendorDetail[0]?.dependentName },
          { title: "GC_DEPENDENT_DATE_OF_BIRTH", value: response?.vendorDetail[0]?.dependentDob },
          { title: "GC_DEPENDENT_GENDER", value: dgender },
          { title: "GC_TRADE_NUMBER", value: response?.vendorDetail[0]?.tradeNumber },
        ]),
      },

      {
        title: "GC_VENDOR_BUSINESS_DETAILS",
        asSectionHeader: true,
        values: filterEmptyValues([
          { title: "GC_VENDING_TYPE", value: response?.vendingActivity },
          { title: "GC_VENDING_ZONES", value: response?.vendingZone },
          { title: "GC_AREA_REQUIRED", value: response?.vendingArea },
          { title: "GC_LOCAL_AUTHORITY_NAME", value: response?.localAuthorityName },
          { title: "GC_VENDING_LISCENCE", value: response?.vendingLicenseCertificateId },
        ]),
      },

      {
        title: "GC_BANK_DETAILS",
        asSectionHeader: true,
        values: filterEmptyValues([
          { title: "GC_ACCOUNT_NUMBER", value: response?.bankDetail?.accountNumber },
          { title: "GC_IFSC_CODE", value: response?.bankDetail?.ifscCode },
          { title: "GC_BANK_NAME", value: response?.bankDetail?.bankName },
          { title: "GC_BANK_BRANCH_NAME", value: response?.bankDetail?.bankBranchName },
          { title: "GC_ACCOUNT_HOLDER_NAME", value: response?.bankDetail?.accountHolderName },
        ]),
      },

      {
        title: "GC_ADDRESS_DETAILS",
        asSectionHeader: true,
        values: filterEmptyValues([
          { title: "GC_ADDRESS_LINE1", value: response?.addressDetails[0]?.addressLine1 },
          { title: "GC_ADDRESS_LINE2", value: response?.addressDetails[0]?.addressLine2 },
          { title: "GC_CITY", value: response?.addressDetails[0]?.city },
          { title: "GC_LOCALITY", value: response?.addressDetails[0]?.locality },
          { title: "GC_ADDRESS_PINCODE", value: response?.addressDetails[0]?.pincode },
          { title: "GC_LANDMARK", value: response?.addressDetails[0]?.landmark },
        ]),
      },

      {
        title: "GC_DOCUMENT_DETAILS_LABEL",
        additionalDetails: {
          documents: [
            {
              values: response?.documentDetails?.map((document) => {
                return {
                  title: `${document?.documentType.replace(".", "_")}`,
                  documentType: document?.documentType,
                  documentUid: document?.documentUid,
                  fileStoreId: document?.fileStoreId,
                  status: document.status,
                };
              }),
            },
          ],
        },
      },
    ];
  },

  applicationDetails: async (t, tenantId, applicationNumber, isDraftApplication, userType, args) => {
    const filter = { applicationNumber, ...args, isDraftApplication };
    const response = await GCSearch.application(tenantId, filter);

    return {
      tenantId: response.tenantId,
      applicationDetails: GCSearch.RegistrationDetails({ GCDetail: response, t }),
      applicationData: response,
      transformToAppDetailsForEmployee: GCSearch.RegistrationDetails,
    };
  },
};
