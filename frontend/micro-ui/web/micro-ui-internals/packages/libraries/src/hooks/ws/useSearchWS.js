import React, { useState } from "react";
import { useQuery } from "react-query";
import { WSService } from "../../services/elements/WS";
import { PTService } from "../../services/elements/PT";
/*
 * Feature :: Privacy
 * Task 6502 to show only locality info without door no and street names
 */
const getAddress = (address, t, shortAddress) => {
  if (shortAddress) return `${address?.locality?.code ? t(`TENANTS_MOHALLA_${address?.locality?.code}`) + ", " : ""}${address?.city ? address?.city : ""}`;
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""}${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${address?.locality?.code ? t(`TENANTS_MOHALLA_${address?.locality?.code}`) : ""}${address?.city?.code || address?.city  ? `, ${t(address?.city.code || address?.city)}` : ""}${
    address?.pincode ? `, ${address.pincode}` : " "
  }`;
};

// OWNER NAME EXTRACTION: Get formatted owner names from property data
const getOwnerNames = (propertyData) => {
  const getActiveOwners = propertyData?.owners?.filter((owner) => owner?.active);
  const getOwnersList = getActiveOwners.sort((a,b)=>a.additionalDetails?.ownerSequence- b.additionalDetails?.ownerSequence)?.map((activeOwner) => activeOwner?.name)?.join(",");
  return getOwnersList ? getOwnersList : t("NA");
};

// DATA COMBINATION: Merge WS/SW connection data with Property and Bill data
const combineResponse = (WaterConnections, SewerageConnections, businessService, Properties, billData, t, count = undefined, shortAddress) => {
  const data = businessService ? (businessService === "WS" ? WaterConnections : SewerageConnections) : WaterConnections?.concat(SewerageConnections);
  
  // BILL DATA INTEGRATION: Add billing information to connections
  if (billData) {
    data?.forEach((app) => {
      const bill = billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0];
      if (bill) {
        app.due = bill.totalAmount;
        app.dueDate = bill?.billDetails?.[0]?.expiryDate;
      }
    });
  }

  // PROPERTY DATA INTEGRATION: Merge connection data with property information
  data?.forEach((row, index) => {
    // PROPERTY MATCHING: Find the corresponding property for each connection
    const matchingProperty = Properties?.find((property) => property?.propertyId === row?.propertyId);
    
    if (matchingProperty) {
      // COMPLETE OWNER DATA: Extract comprehensive owner information from property service
      const ownerName = matchingProperty?.owners?.map((ob) => ob?.name).join(",");
      row["owner"] = ownerName;
      row["address"] = getAddress(matchingProperty?.address, t, shortAddress);
      row["ownerNames"] = getOwnerNames(matchingProperty);
      
      // PROPERTY ATTACHMENT: Attach the full property data including owners array
      // This provides complete property context for UI components
      row["property"] = matchingProperty;
      row["owners"] = matchingProperty?.owners; // Direct access to owners array
      
      // MOBILE NUMBER EXTRACTION: Extract mobile number from property owners
      const activeOwners = matchingProperty?.owners?.filter((owner) => owner?.active);
      if (activeOwners && activeOwners.length > 0) {
        row["mobileNumber"] = activeOwners[0]?.mobileNumber || "NA";
      }
    } else {
      // FALLBACK HANDLING: Try to get owner info from multiple sources when property data is missing
      // This ensures the UI doesn't break for connections without property links
      let ownerName = "";
      let mobileNumber = "NA";
      
      // Check connection holders first
      if (row?.connectionHolders && row.connectionHolders.length > 0) {
        ownerName = row.connectionHolders.map((holder) => holder?.name).join(",");
        mobileNumber = row.connectionHolders[0]?.mobileNumber || "NA";
      } 
      // Check ownername key (for consumer number search results)
      else if (row?.ownername) {
        ownerName = row.ownername;
      }
      // Check additionalDetails.ownername
      else if (row?.additionalDetails?.ownername) {
        ownerName = row.additionalDetails.ownername;
      }
      
      // Set the owner information
      if (ownerName) {
        row["owner"] = ownerName;
        row["ownerNames"] = ownerName;
        row["mobileNumber"] = mobileNumber;
      }
    }
  });

  return { data, count, billData };
};

const useSearchWS = ({ tenantId, filters, config = {}, bussinessService, t, shortAddress = false }) => {
  let responseSW = "";
  let responseWS = "";
  let propertyids = "";
  let consumercodes = [];
  let billData = "";
  if (bussinessService === "WS") {
    responseWS = useQuery(
      ["WS_WATER_SEARCH", tenantId, ...Object.keys(filters)?.map((e) => filters?.[e]), bussinessService],
      async () => await WSService.WSWatersearch({ tenantId, filters }),
      {
        ...config,
      }
    );
  } else if (bussinessService === "SW") {
    responseSW = useQuery(
      ["WS_SEW_SEARCH", tenantId, ...Object.keys(filters)?.map((e) => filters?.[e]), bussinessService],
      async () => await WSService.WSSewsearch({ tenantId, filters }),
      {
        ...config,
      }
    );
  } else {
    responseWS = useQuery(
      ["WS_WATER_SEARCH", tenantId, ...Object.keys(filters)?.map((e) => filters?.[e]), bussinessService],
      async () => await WSService.WSWatersearch({ tenantId, filters }),
      {
        ...config,
      }
    );

    responseSW = useQuery(
      ["WS_SEW_SEARCH", tenantId, ...Object.keys(filters)?.map((e) => filters?.[e]), bussinessService],
      async () => await WSService.WSSewsearch({ tenantId, filters }),
      {
        ...config,
      }
    );
  }

  responseWS?.data?.WaterConnection?.forEach((item) => {
    if (item?.propertyId) {
      propertyids = propertyids + item.propertyId + ",";
    }
    item?.connectionNo && consumercodes.push(item?.connectionNo);
  });

  responseSW?.data?.SewerageConnections?.forEach((item) => {
    if (item?.propertyId) {
      propertyids = propertyids + item.propertyId + ",";
    }
    item?.connectionNo && consumercodes.push(item?.connectionNo);
  });

  let propertyfilter = { propertyIds: propertyids.substring(0, propertyids.length - 1) };
  
  billData = useQuery(
    ["BILL_SEARCH", tenantId, consumercodes.join(","), bussinessService],
    async () =>
      await Digit.PaymentService.fetchBill(tenantId, {
        businessService: bussinessService,
        consumerCode: consumercodes.join(","),
      }),
    { ...config, enabled: consumercodes.length > 0 }
  );

  const properties = useQuery(
    ["WSP_SEARCH", tenantId, propertyfilter, bussinessService],
    async () => await PTService.search({ tenantId: tenantId, filters: propertyfilter, auth: true }),
    {
      ...config,
      enabled: Boolean(propertyfilter.propertyIds && propertyfilter.propertyIds.length > 0),
    }
  );

  if (bussinessService === "WS") {
    return responseWS?.isLoading || properties?.isLoading || billData?.isLoading
      ? { isLoading: true }
      : combineResponse(
          responseWS?.data?.WaterConnection,
          [],
          bussinessService,
          properties?.data?.Properties,
          billData?.data?.Bill,
          t,
          responseWS?.data?.TotalCount,
          shortAddress
        );
  } else if (bussinessService === "SW") {
    return responseSW?.isLoading || properties?.isLoading || billData?.isLoading
      ? { isLoading: true }
      : combineResponse(
          [],
          responseSW?.data?.SewerageConnections,
          bussinessService,
          properties?.data?.Properties,
          billData?.data?.Bill,
          t,
          responseSW?.data?.TotalCount,
          shortAddress
        );
  } else {
    return responseWS?.isLoading || responseSW?.isLoading || properties?.isLoading || billData?.isLoading
      ? undefined
      : combineResponse(
          responseWS?.data?.WaterConnection,
          responseSW?.data?.SewerageConnections,
          bussinessService,
          properties?.data?.Properties,
          billData?.data?.Bill,
          t,
          undefined,
          shortAddress
        );
  }
};

export default useSearchWS;
