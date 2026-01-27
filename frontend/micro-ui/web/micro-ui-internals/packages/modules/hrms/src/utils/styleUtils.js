export const getBadgeClassName = (type) => {
  const typeMap = {
    category: "hrms-badge--category",
    subCategory: "hrms-badge--subcategory",
    zone: "hrms-badge--zone",
    role: "hrms-badge--role",
  };
  return `hrms-badge ${typeMap[type] || ""}`;
};
