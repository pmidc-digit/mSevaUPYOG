// import { useQuery } from "react-query";
// import { MdmsService } from "../../services/elements/MDMS";

// const useRALPropertyMDMS = (tenantId) => {
//   return useQuery(
//     [tenantId, "PTR_MDMS_RAL_PROPERTY_DATA"],
//     () =>
//       MdmsService.getDataByCriteria(
//         tenantId,
//         {
//           details: {
//             tenantId,
//             moduleDetails: [
//               {
//                 moduleName: "rentandlease",
//                 masterDetails: [{ name: "PropertyAttributes" }], // single master
//               },
//             ],
//           },
//         },
//         "rentandlease"
//       ),
//     {
//       select: (data) => {
//         const attributes = data?.rentAndLease?.PropertyAttributes || [];

//         // Map attributes by name into your 10 fields
//         const ulb = attributes.find((attr) => attr.name === "ULB") || {};
//         const propertyId = attributes.find((attr) => attr.name === "Property ID") || {};
//         const propertyName = attributes.find((attr) => attr.name === "Property Name") || {};
//         const propertyDetail = attributes.find((attr) => attr.name === "Property Detail") || {};
//         const size = attributes.find((attr) => attr.name === "Size(Area)") || {};
//         const address = attributes.find((attr) => attr.name === "Address") || {};
//         const geolocation = attributes.find((attr) => attr.name === "Geolocation") || {};
//         const propertyImages = attributes.find((attr) => attr.name === "Property Images") || {};
//         const propertyType = attributes.find((attr) => attr.name === "Property Type") || {};
//         const locationType = attributes.find((attr) => attr.name === "Location Type") || {};
//         const tradeLicenseNumber = attributes.find((attr) => attr.name === "Trade License Number") || {};

//         return {
//           ulb,
//           propertyId,
//           propertyName,
//           propertyDetail,
//           size,
//           address,
//           geolocation,
//           propertyImages,
//           propertyType,
//           locationType,
//           tradeLicenseNumber,
//         };
//       },
//     }
//   );
// };

// export default useRALPropertyMDMS;



import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useRALPropertyMDMS = (tenantId) => {
  return useQuery(
    [tenantId, "PTR_MDMS_RAL_PROPERTY_DATA"],
    () =>
      MdmsService.getDataByCriteria(
        tenantId,
        {
          details: {
            tenantId,
            moduleDetails: [
              {
                moduleName: "rentAndLease",
                masterDetails: [{ name: "RLProperty" }], // 👈 actual master
              },
            ],
          },
        },
        "rentAndLease"
      ),
    {
      select: (data) => {
        const properties = data?.rentAndLease?.RLProperty || [];

        // Map each property into a clean object
        return properties.map((p) => ({
          propertyId: p.propertyId,
          propertyName: p.propertyName,
          usageCategory: p.usageCategory,
          propertySizeOrArea: p.propertySizeOrArea,
          address: p.address,
          geoLocation: p.geoLocation,
          propertyImage: p.propertyImage,
          propertyType: p.propertyType,
          locationType: p.locationType,
          baseRent: p.baseRent,
          securityDeposit: p.securityDeposit,
          taxApplicable: p.tax_applicable,
          refundApplicableOnDiscontinuation: p.refund_applicable_on_discontinuation,
          penaltyType: p.penaltyType,
          latePayment: p.latePayment,
        }));
      },
    }
  );
};

export default useRALPropertyMDMS;
