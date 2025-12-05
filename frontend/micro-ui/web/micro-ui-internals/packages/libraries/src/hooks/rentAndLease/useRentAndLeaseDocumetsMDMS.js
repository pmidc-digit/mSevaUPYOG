import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useRALDocumentsMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "RAL_MDMS_DOCUMENTS"], // Unique query key
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId: tenantId,
            moduleDetails: [
              {
                // rentAndLease
                moduleName: "docuementName", // Module name
                masterDetails: [
                  {
                    name: "docName", // Master name
                  },
                ],
              },
            ],
          },
        },
        "docuementName"
      ),
    {
      select: (data) => {
        console.log("mdmsDocs",data)
        // Extract only active documents and map relevant fields
        return data?.docuementName?.docName?.filter((doc) => doc.active).map((doc) => ({
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

export default useRALDocumentsMDMS;
