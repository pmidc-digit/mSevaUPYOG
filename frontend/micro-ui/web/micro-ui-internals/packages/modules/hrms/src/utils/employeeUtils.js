// Most recently recorded deactivation entry of an employee, or undefined when there is none
export const getLatestDeactivation = (deactivationDetails) =>
  [...(deactivationDetails || [])].sort((a, b) => (b?.auditDetails?.createdDate || 0) - (a?.auditDetails?.createdDate || 0))[0];

// Ranges are half-open, so an assignment that ends on the day the next one starts does not count as an overlap
export const hasAssignmentOverlap = (assignments = []) => {
  const ranges = assignments
    .filter((assignment) => assignment?.fromDate)
    .map((assignment) => ({
      from: new Date(assignment.fromDate).getTime(),
      to: assignment.toDate ? new Date(assignment.toDate).getTime() : Infinity,
    }));

  return ranges.some((a, i) => ranges.some((b, j) => i < j && a.from < b.to && b.from < a.to));
};
