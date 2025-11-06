import { useQuery, useQueryClient } from "react-query"


const useLayoutSearch = (params, tenantId, config) => {
  return async () => {
    console.log(" useLayoutSearch called with:", { params, tenantId })

    const searchParams = {
      applicationNumber: params?.applicationNumber,
      ...params,
    }

    console.log(" Calling LayoutSearch with:", { tenantId, searchParams })
    const data = await Digit.OBPSService.LayoutSearch(tenantId, searchParams)
    console.log(" LayoutSearch API response:", data)
    return { data }
  }
}

export const useLayoutCitizenSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient()

  const result = useQuery(["LAYOUT_APPLICATIONS_LIST", params], useLayoutSearch(params, tenantId, config), {
    staleTime: Number.POSITIVE_INFINITY,
    select: (data) => {
      const applications = data?.data?.Layout || []
      const count = data?.data?.count || 0

      const mappedData = applications?.map((application) => ({
        LAYOUT_APPLICATION_NUMBER: application?.applicationNo,
        TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL: application?.applicationStatus,
        Applications: application,
      }))

      return {
        data: mappedData,
        count,
        revalidate: () => client.invalidateQueries(["LAYOUT_APPLICATIONS_LIST", params]),
      }
    },
  })

  return { ...result, revalidate: () => client.invalidateQueries(["LAYOUT_APPLICATIONS_LIST", params]) }
}

export const useLayoutSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient()
  console.log(" useLayoutSearchApplication called with:", { params, tenantId, config })

  const result = useQuery(["LAYOUT_SEARCH_APPLICATION", params], useLayoutSearch(params, tenantId, config), {
    staleTime: Number.POSITIVE_INFINITY,
    select: (data) => {
      console.log(" select function received data:", data)
      return {
        resData: data?.data,
        revalidate: () => client.invalidateQueries(["LAYOUT_SEARCH_APPLICATION", params]),
      }
    },
  })

  console.log(" useLayoutSearchApplication result:", result)
  return { ...result, revalidate: () => client.invalidateQueries(["LAYOUT_SEARCH_APPLICATION", params]) }
}

export const useLayoutSearchApplicationByIdOrMobile = (params, tenantId, config = {}, t) => {
  const client = useQueryClient()
  const result = useQuery(
    ["LAYOUT_SEARCH_APPLICATION_BY_ID_MOBILENO", params],
    useLayoutSearch(params, tenantId, config),
    {
      staleTime: Number.POSITIVE_INFINITY,
      select: (data) => {
        let tableData

        if (data?.data?.Layout?.length == 0) {
          tableData = [{ display: "ES_COMMON_NO_DATA" }]
        } else {
          tableData = data?.data?.Layout?.map((application) => {
            return {
              applicationNo: application?.applicationNo,
              date: Digit.DateUtils.ConvertEpochToDate(application?.auditDetails?.createdTime),
              locality: `${application?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
              applicationStatus: `${application?.applicationStatus}`,
            }
          })
        }

        return {
          data: tableData,
          totalCount: data?.data?.count || 0,
        }
      },
    },
  )
  return { ...result, revalidate: () => client.invalidateQueries(["LAYOUT_SEARCH_APPLICATION", params]) }
}
