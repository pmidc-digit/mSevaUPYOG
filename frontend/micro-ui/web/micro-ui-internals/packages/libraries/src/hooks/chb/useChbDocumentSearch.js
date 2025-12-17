import { useQuery, useQueryClient } from "react-query";

const useChbDocumentSearch = ({ application }, config = {}, Code, index) => {
  const client = useQueryClient();
  const tenantId = application?.tenantId || Digit.ULBService.getCurrentTenantId();
  const tenant = Digit.ULBService.getStateId();
  const bookingId = application?.bookingId;

  console.log("bookingId===", bookingId);
  console.log("config===", config);
  console.log("Code check===", Code);
  let newDocs = [];
  config?.value?.documents
    ? config?.value?.documents?.documents
        .filter((doc) => doc?.documentType == Code /* || doc?.documentType?.includes(Code.split(".")[1]) */)
        .map((ob) => {
          newDocs.push(ob);
        })
    : config?.value
        .filter((doc) => doc?.documentType == Code /* || doc?.documentType?.includes(Code.split(".")[1]) */)
        .map((ob) => {
          newDocs.push(ob);
        });
  console.log("newDocs==??", newDocs);
  const filesArray = newDocs.map((value) => value?.fileStoreId || value?.filestoreId);
  console.log("filesArray", filesArray);
  const { isLoading, error, data } = useQuery([`chbDocuments-${bookingId}`, filesArray], () => Digit.UploadServices.Filefetch(filesArray, tenant));
  console.log(" api data", data);
  return { isLoading, error, data: { pdfFiles: data?.data }, revalidate: () => client.invalidateQueries([`chbDocuments-${bookingId}`, filesArray]) };
};
export default useChbDocumentSearch;
