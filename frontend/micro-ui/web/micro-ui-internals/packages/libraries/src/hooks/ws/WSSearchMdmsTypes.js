import { useQuery } from "react-query";
import { getMultipleTypes, MdmsService, getGeneralCriteria } from "../../services/elements/MDMS"

const WSSearchMdmsTypes = {
  useWSMDMSBillAmendment: ({tenantId, config={}}) => {
    const BillAmendmentMdmsDetails = getMultipleTypes(tenantId, "BillAmendment", ["documentObj", "DemandRevisionBasis"])
    return useQuery([tenantId, "WS_BILLAMENDMENT_MDMS"], () => MdmsService.getDataByCriteria(tenantId, BillAmendmentMdmsDetails, "BillAmendment"), {
      select: ({BillAmendment}) => {
        return BillAmendment?.DemandRevisionBasis.map( (e, index) => {
          return { ...e, i18nKey: `DEMAND_REVISION_BASIS_${e.code}`, allowedDocuments: BillAmendment?.documentObj[index] }
        })
      },
      ...config
    });
  },
  useWSServicesMasters: (tenantId, type) =>
    useQuery(
      [tenantId, type, "WS_WS_SERVICES_MASTERS"],
      () =>
        MdmsService.getDataByCriteria(
          tenantId,
          {
            details: {
              tenantId: tenantId,
              moduleDetails: [
                {
                  moduleName: "ws-services-masters",
                  masterDetails: [
                    {
                      name: type ?  type : "Documents"
                    },
                  ],
                },
              ],
            },
          },
          "ws-services-masters"
        ),
      {
        select: (data) => {
          console.log("In useWSServicesMasters select:", data);
          const wsDocsData = type ? type : "Documents";
          console.log("Before data processing: ", data);
          data?.["ws-services-masters"]?.[wsDocsData]?.forEach((type) => {
            type.code = type.code;
            type.i18nKey = type.code ? type.code.replaceAll(".", "_") : "";
            if (Array.isArray(type.dropdownData)) {
              type.dropdownData.forEach((value) => {
                value.i18nKey = value.code ? value.code.replaceAll(".", "_") : "";
              });
            }
          });
          console.log("After data processing: ", data);
          return data?.["ws-services-masters"] ? data?.["ws-services-masters"] : [];
        },
        // select: (data) => {
        //   console.log("In useWSServicesMasters select:", data);
        //   const wsDocsData = type ? type : "Documents";
        //   console.log("Before data processing: ", data, data["ws-services-masters"]);
        //   let processedData = [];
        //   if (data?.["ws-services-masters"]?.[wsDocsData]) {
        //     processedData = data["ws-services-masters"][wsDocsData].map((type) => {
        //       const newType = { ...type };
        //       newType.i18nKey = newType.code ? newType.code.replaceAll(".", "_") : "";
        //       if (newType.dropdownData) {
        //         newType.dropdownData = newType.dropdownData.map((value) => {
        //           return {
        //             ...value,
        //             i18nKey: value.code ? value.code.replaceAll(".", "_") : "",
        //           };
        //         });
        //       }
        //       return newType;
        //     });
        //     console.log("Processed data: ", processedData);
        //   } else {
        //     console.log("Data structure is invalid");
        //   }
        //   console.log("Before return: ", data, data["ws-services-masters"]);
        //   return processedData.length > 0 ? { [wsDocsData]: processedData } : [];
        // },
      }
    ),

  useWSServicesCalculation: (tenantId) =>
    useQuery(
      [tenantId, "WS_WS_SERVICES_CALCULATION"],
      () =>
        MdmsService.getDataByCriteria(
          tenantId,
          {
            details: {
              tenantId: tenantId,
              moduleDetails: [
                {
                  moduleName: "ws-services-calculation",
                  masterDetails: [
                    {
                      name: "PipeSize",
                    },
                  ],
                },
              ],
            },
          },
          "ws-services-calculation"
        ),
      {
        select: (data) => {
          data?.["ws-services-calculation"]?.PipeSize?.forEach(type => {
            type.i18nKey = type.size ? `${type.size} Inches` : "";
          })
          return data?.["ws-services-calculation"] ? data?.["ws-services-calculation"] : []
        }
      }
    )
};

export default WSSearchMdmsTypes;