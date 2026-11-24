const getApplicationStatusText = (status, workflowDetails) => {
  const data = workflowDetails?.data || workflowDetails;
  const instances = Array.isArray(data?.processInstances) ? data.processInstances : [];
  const currentProcess = instances.reduce((latest, process) => {
    const time = Number(process?.auditDetails?.createdTime || process?.auditDetails?.lastModifiedTime) || 0;
    const latestTime = Number(latest?.auditDetails?.createdTime || latest?.auditDetails?.lastModifiedTime) || 0;
    return !latest || time > latestTime ? process : latest;
  }, null);
  const assignees = Array.isArray(currentProcess?.assignes) ? currentProcess.assignes : [];
  const names = currentProcess?.state?.isTerminateState
    ? []
    : [...new Set(assignees.map((user) => user?.name?.trim()).filter(Boolean))];
  return names.length ? `${status} (${names.join(", ")})` : status;
};

export default getApplicationStatusText;
