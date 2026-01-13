import React from "react";
import useInbox from "../useInbox";
import { useQueryClient } from "react-query";
import {OBPS_CLU_BUSINESS_SERVICES} from "../../../../constants/constants"

const useCLUInbox = ({ tenantId, filters, config = {} }) => {
  const queryClient = useQueryClient();

  const { filterForm, searchForm, tableForm, getFilter } = filters;
  const { moduleName, businessService, applicationStatus, locality, assignee, businessServiceArray } = filterForm;
  const { mobileNumber, applicationNumber } = searchForm;
  const { sortBy, limit, offset, sortOrder } = tableForm;
  const user = Digit.UserService.getUser();

  const _filters = {
    tenantId,
    processSearchCriteria: {
      assignee: assignee === "ASSIGNED_TO_ME" ? user?.info?.uuid : "",
      moduleName: "clu-service",
      ...(applicationStatus?.length > 0 ? { status: applicationStatus } : {}),
      businessService: OBPS_CLU_BUSINESS_SERVICES,
    },

    moduleSearchCriteria: {
      ...(mobileNumber ? { mobileNumber } : {}),
      ...(applicationNumber ? { applicationNumber } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(locality?.length > 0 ? { locality: locality.map((item) => item.code.split("_").pop()).join(",") } : {}),
    },
    limit,
    offset,
  };

  const queryKey = ["CLU_INBOX_DATA", tenantId, ...Object.keys(_filters)?.map((e) => _filters?.[e])];

  return useInbox({
    tenantId,
    filters: _filters,
    config: {
      select: (data) => {
        if (!data) {
          return {
            statuses: [],
            table: [],
            totalCount: 0,
            nearingSlaCount: 0,
            revalidate: () => queryClient.invalidateQueries(queryKey),
          };
        }

        const tableData = (data?.items || [])?.map((application) => {
          return {
            applicationId: application?.businessObject?.applicationNo || application?.businessObject?.applicationNumber || "-",
            date: application?.businessObject?.auditDetails?.createdTime ? Number.parseInt(application.businessObject.auditDetails.createdTime) : 0,
            businessService: application?.ProcessInstance?.businessService || "-",
            locality: application?.businessObject?.tenantId ? `${application.businessObject.tenantId.toUpperCase().split(".").join("_")}` : "-",
            status: application?.businessObject?.applicationStatus || "-",
            owner: application?.businessObject?.cluDetails?.additionalDetails?.applicationDetails?.owners?.[0]?.ownerOrFirmName || "-",
            professionalName: application?.businessObject?.cluDetails?.additionalDetails?.applicationDetails?.professionalName || "-",
            documents: application?.businessObject?.documents || application?.documents || [],
          };
        });

        const statusMapData = Object.values(
          data?.statusMap?.reduce((acc, { applicationstatus, businessservice, count }) => {
            const key = applicationstatus;
            if (!acc[key]) {
              acc[key] = {
                applicationstatus: key,
                totalCount: 0,
                byBusinessservice: {},
              };
            }

            acc[key].totalCount += count || 0;

            if (businessservice) {
              acc[key].byBusinessservice[businessservice] = (acc[key].byBusinessservice[businessservice] || 0) + (count || 0);
            }
            return acc;
          }, {})
        );

        return {
          //statuses: data.statusMap || [],
          statuses: statusMapData || [],
          table: tableData || [],
          totalCount: data.totalCount || 0,
          nearingSlaCount: data.nearingSlaCount || 0,
          revalidate: () => queryClient.invalidateQueries(queryKey),
        };
      },
      ...config,
    },
  });
};

export default useCLUInbox;
