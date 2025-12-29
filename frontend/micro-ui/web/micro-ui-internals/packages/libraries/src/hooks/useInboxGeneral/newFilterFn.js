export const filterFunctions = {
  PT: (filtersArg) => {
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    const { propertyIds, mobileNumber, limit, offset, sortBy, sortOrder, total, applicationStatus, services } = filtersArg || {};

    if (filtersArg?.acknowledgementIds) {
      searchFilters.applicationNumber = filtersArg?.acknowledgementIds;
    }
    if (filtersArg?.propertyIds) {
      searchFilters.propertyId = propertyIds;
    }
    if (filtersArg?.oldpropertyids) {
      searchFilters.oldpropertyids = filtersArg?.oldpropertyids;
    }
    if (applicationStatus && applicationStatus?.[0]) {
      workflowFilters.status = applicationStatus.map((status) => status.uuid);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (filtersArg?.locality?.length) {
      searchFilters.locality = filtersArg?.locality.map((item) => item.code.split("_").pop());
    }
    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (mobileNumber) {
      searchFilters.mobileNumber = mobileNumber;
    }
    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = ["CREATE", "MUTATION", "UPDATE"];
    workflowFilters["moduleName"] = "PT";

    // if (limit) {
    //   searchFilters.limit = limit;
    // }
    // if (offset) {
    //   searchFilters.offset = offset;
    // }

    // workflowFilters.businessService = "PT.CREATE";
    // searchFilters.mobileNumber = "9898568989";
    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder };
  },
  PTR: (filtersArg) => {
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    const { applicationNumbers, mobileNumber, limit, offset, sortBy, sortOrder, total, applicationStatus, services, petType } = filtersArg || {};

    if (filtersArg?.applicationNumber) {
      searchFilters.applicationNumber = filtersArg?.applicationNumber;
    }
    if (filtersArg?.applicationNumbers) {
      searchFilters.applicationNumber = applicationNumbers;
    }

    if (applicationStatus && applicationStatus?.[0]?.applicationStatus) {
      workflowFilters.status = applicationStatus.map((status) => status.code || status.state);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (filtersArg?.locality?.length) {
      searchFilters.locality = filtersArg?.locality.map((item) => item.code.split("_").pop());
    }
    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (mobileNumber) {
      searchFilters.mobileNumber = mobileNumber;
    }

    if (petType) {
      searchFilters.petType = petType;
    }

    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = ["CREATE"];
    workflowFilters["moduleName"] = "pet-service";

    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder };
  },
  RAL: (filtersArg) => {
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    const { applicationNumbers, mobileNumber, limit, offset, sortBy, sortOrder, applicationStatus, services, allotmentType } = filtersArg || {};

    if (filtersArg?.applicationNumber) {
      searchFilters.applicationNumber = filtersArg?.applicationNumber;
      searchFilters.applicationNumbers = filtersArg?.applicationNumber;
    }
    if (filtersArg?.applicationNumbers) {
      searchFilters.applicationNumber = filtersArg?.applicationNumbers;
      searchFilters.applicationNumbers = filtersArg?.applicationNumbers;
    }

    if (applicationStatus && applicationStatus?.[0]) {
      workflowFilters.status = applicationStatus.map((status) => status.code || status.state || status.applicationStatus || status.uuid || status);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (filtersArg?.locality?.length) {
      searchFilters.locality = filtersArg?.locality.map((item) => item.code.split("_").pop());
    }
    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (mobileNumber) {
      searchFilters.mobileNumber = mobileNumber;
    }

    if (allotmentType && allotmentType.value) {
      searchFilters.allotmentType = allotmentType.value;
    }

    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = ["CREATE"];
    workflowFilters["moduleName"] = "rl-services";

    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder };
  },
  SV: (filtersArg) => {
    console.log("filtersArgssIN NEWFILTERFN", filtersArg);
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    const { applicationNumber, services, mobileNumber, limit, offset, sortBy, sortOrder, vendingType, vendingZone, applicationStatus, status } =
      filtersArg || {};

    if (applicationStatus && applicationStatus?.[0]?.applicationStatus) {
      workflowFilters.status = applicationStatus.map((status) => status.uuid);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (status && status?.[0]?.status) {
      workflowFilters.status = status.map((status) => status.uuid);
      if (status?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }

    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (mobileNumber) {
      searchFilters.mobileNumber = mobileNumber;
    }
    if (vendingType) {
      searchFilters.vendingType = vendingType;
    }
    if (vendingZone) {
      searchFilters.vendingZone = vendingZone;
    }
    if (status) {
      searchFilters.status = status;
    }
    if (applicationNumber) {
      searchFilters.applicationNumber = applicationNumber;
    }
    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = [""];
    workflowFilters["moduleName"] = "sv-services";

    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder, isDraftApplication: false };
  },
  CHB: (filtersArg) => {
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    const { applicationNumbers, mobileNumber, limit, offset, sortBy, sortOrder, total, applicationStatus, services } = filtersArg || {};

    if (filtersArg?.applicationNumber) {
      searchFilters.applicationNumber = filtersArg?.applicationNumber;
    }
    if (filtersArg?.applicationNumbers) {
      searchFilters.applicationNumber = applicationNumbers;
    }

    if (applicationStatus && applicationStatus?.[0]?.applicationStatus) {
      workflowFilters.status = applicationStatus.map((status) => status.uuid);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (filtersArg?.locality?.length) {
      searchFilters.locality = filtersArg?.locality.map((item) => item.code.split("_").pop());
    }
    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (mobileNumber) {
      searchFilters.mobileNumber = mobileNumber;
    }

    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = ["CREATE"];
    workflowFilters["moduleName"] = "chb-services";

    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder };
  },
  ASSET: (filtersArg) => {
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    const { applicationNo, assetParentCategory, assetClassification, limit, offset, sortBy, sortOrder, total, applicationStatus, services } =
      filtersArg || {};

    if (filtersArg?.applicationNo) {
      searchFilters.applicationNo = filtersArg?.applicationNo;
    }
    if (filtersArg?.assetParentCategory) {
      searchFilters.assetParentCategory = filtersArg?.assetParentCategory;
    }
    if (filtersArg?.assetClassification) {
      searchFilters.assetClassification = filtersArg?.assetClassification;
    }

    if (applicationStatus && applicationStatus?.[0]?.applicationStatus) {
      workflowFilters.status = applicationStatus.map((status) => status.uuid);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (filtersArg?.locality?.length) {
      searchFilters.locality = filtersArg?.locality.map((item) => item.code.split("_").pop());
    }
    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (applicationNo) {
      searchFilters.applicationNo = applicationNo;
    }
    if (assetClassification) {
      searchFilters.assetClassification = assetClassification.code;
    }

    if (assetParentCategory) {
      searchFilters.assetParentCategory = assetParentCategory;
    }

    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = ["asset-create"];
    workflowFilters["moduleName"] = "asset-services";

    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder };
  },
  ADV: (filtersArg) => {
    let { uuid } = Digit.UserService.getUser()?.info || {};

    const searchFilters = {};
    const workflowFilters = {};

    console.log("filtersArgHere", filtersArg);
    const { bookingNumbers, mobileNumber, limit, offset, sortBy, sortOrder, total, applicationStatus, services } = filtersArg || {};

    if (filtersArg?.bookingNo) {
      searchFilters.applicationNumber = filtersArg?.bookingNo;
    }
    if (filtersArg?.bookingNumbers) {
      searchFilters.applicationNumber = bookingNumbers;
    }

    console.log("bookingStatus234", applicationStatus);
    if (applicationStatus && applicationStatus?.[0]?.applicationStatus) {
      workflowFilters.status = applicationStatus.map((status) => status.applicationStatus || status.state);
      if (applicationStatus?.some((e) => e.nonActionableRole)) {
        searchFilters.fetchNonActionableRecords = true;
      }
    }
    if (filtersArg?.locality?.length) {
      searchFilters.locality = filtersArg?.locality.map((item) => item.code.split("_").pop());
    }
    if (filtersArg?.uuid && filtersArg?.uuid.code === "ASSIGNED_TO_ME") {
      workflowFilters.assignee = uuid;
    }
    if (mobileNumber) {
      searchFilters.mobileNumber = mobileNumber;
    }

    if (services) {
      workflowFilters.businessService = services;
    }
    searchFilters["isInboxSearch"] = true;
    searchFilters["creationReason"] = ["CREATE"];
    workflowFilters["moduleName"] = "advandhoarding-services"; //edited this

    return { searchFilters, workflowFilters, limit, offset, sortBy, sortOrder };
  },
};
