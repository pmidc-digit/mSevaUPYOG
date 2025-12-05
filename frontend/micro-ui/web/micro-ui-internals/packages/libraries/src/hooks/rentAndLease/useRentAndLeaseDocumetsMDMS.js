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
                moduleName: "rentAndLease", // Module name
                masterDetails: [
                  {
                    name: "Documents", // Master name
                  },
                ],
              },
            ],
          },
        },
        "rentAndLease"
      ),
    {
      select: (data) => {
        console.log("mdmsDocs",data)
        // Extract only active documents and map relevant fields
        return data?.rentAndLease?.Documents?.filter((doc) => doc.active).map((doc) => ({
          code: doc.code,
          documentType: doc.documentType,
          required: doc.required,
          hasDropdown: doc.hasDropdown,
          // dropdownData: doc.dropdownData?.filter((dd) => dd.active) || [],
          description: doc.description,
          // additionalDetails: doc.additionalDetails || {},
        }));
      },
    }
  );
};

export default useRALDocumentsMDMS;
