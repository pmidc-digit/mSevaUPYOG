import { useQuery, useQueryClient } from "react-query";

const useLayoutDocumentSearch = (data1 = {}, config = {}) => {
  const client = useQueryClient();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  
  //console.log("data1 here in hook", data1);
  let filesArray = [];
  if(data1?.value?.workflowDocs) filesArray = data1?.value?.workflowDocs?.map((ob) => (ob?.documentAttachment || ob?.documentUid));
  
  const { isLoading, error, data } = useQuery([`nocDocuments-${1}`, filesArray], () => Digit.UploadServices.Filefetch(filesArray, tenant));
  return { isLoading, error, data: { pdfFiles: data?.data }, revalidate: () => client.invalidateQueries([`nocDocuments-${1}`, filesArray]) };
};

export default useLayoutDocumentSearch;
