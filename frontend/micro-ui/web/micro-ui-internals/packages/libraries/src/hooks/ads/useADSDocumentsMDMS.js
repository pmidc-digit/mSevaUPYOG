// import { MdmsService } from "../../services/elements/MDMS";
// import { useQuery } from "react-query";
// /**
//  * Custom hook to fetch document data from MDMS based on tenantId, moduleCode, and type.
//  * It conditionally retrieves either required documents for a specific screen or multiple
//  * types of documents based on the provided type.
//  */

// const useADSDocumentsMDMS = (tenantId, moduleCode, type, config = {}) => {
//   const useADSDocumentsRequiredScreen = () => {
//     return useQuery("ADS_DOCUMENT_REQ_SCREEN", () => MdmsService.getADSDocuments(tenantId, moduleCode), config);
//   };

//   const _default = () => {
//     return useQuery([tenantId, moduleCode, type], () => MdmsService.getMultipleTypes(tenantId, moduleCode, type), config);
//   };

//   switch (type) {
//     case "Documents":
//       return useADSDocumentsRequiredScreen();

//     default:
//       return _default();
//   }
// };

// export default useADSDocumentsMDMS;

import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useADSDocumentsMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "ADS_MDMS_DOCUMENTS"], // Unique query key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                moduleName: "Advertisement", // Module name
                masterDetails: [
                  {
                    name: "Documents", // Master name
                  },
                ],
              },
            ],
          },
        },
        "Advertisement"
      ),
    {
      select: (data) => {
        // Extract only active documents and map relevant fields
        return data?.Advertisement?.Documents?.filter((doc) => doc.active).map((doc) => ({
          code: doc.code,
          documentType: doc.documentType,
          required: doc.required,
          hasDropdown: doc.hasDropdown,
          dropdownData: doc.dropdownData?.filter((dd) => dd.active) || [],
          description: doc.description,
          additionalDetails: doc.additionalDetails || {},
        }));
      },
    }
  );
};

export default useADSDocumentsMDMS;
