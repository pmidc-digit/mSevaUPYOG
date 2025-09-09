import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useDocumentsMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "PTR_MDMS_DOCUMENTS"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId || "pb.testing",
        {
          details: {
            tenantId: tenantId || "pb.testing",
            moduleDetails: [
              {
                moduleName: "PetService",
                masterDetails: [
                  {
                    name: "Documents",
                  },
                ],
              },
            ],
          },
        },
        "PetService"
      ),
    {
      select: (data) => {
        console.log("docsData", data);
        return data?.PetService?.Documents
          ?.filter((doc) => doc.active)
          .map((doc) => ({
            name: doc.description, // or doc.name if you add it in MDMS
            code: doc.code,
            documentType: doc.documentType,
            required: doc.required,
            hasDropdown: doc.hasDropdown,
            dropdownData: doc.dropdownData || [],
            additionalDetails: doc.additionalDetails || {},
          }));
      },
    }
  );
};

export default useDocumentsMDMS;
