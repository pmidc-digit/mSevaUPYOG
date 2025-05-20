import { useQuery, useQueryClient } from "react-query";
/**
 * Custom hook to search and fetch specific documents for an application 
 * based on a document type code. It filters documents from the provided 
 * configuration, retrieves their fileStoreIds.
 */

const useADSDocumentSearch = ({ application }, config = {}, Code, index) => {
  const client = useQueryClient();
  const tenantId = application?.tenantId || Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  const bookingId = application?.bookingId;
  let newDocs = [];
  config?.value?.documents ? config?.value?.documents?.documents.filter(doc => doc?.documentType === Code /* || doc?.documentType?.includes(Code.split(".")[1]) */).map((ob)=>{
    newDocs.push(ob);
  }) : config?.value.filter(doc => doc?.documentType === Code/* || doc?.documentType?.includes(Code.split(".")[1]) */).map((ob)=>{
    newDocs.push(ob);
  })
  const filesArray = newDocs.map((value) => value?.fileStoreId);
  const { isLoading, error, data } = useQuery([`adsDocuments-${bookingId}`, filesArray], () => Digit.UploadServices.Filefetch(filesArray, tenant));
  return { isLoading, error, data: { pdfFiles: data?.data }, revalidate: () => client.invalidateQueries([`chbDocuments-${bookingId}`, filesArray]) };
  
};
export default useADSDocumentSearch;
