// ========================================
// HRMS Style Utilities
// ========================================
// Helper functions for getting CSS class names

export const getBadgeClassName = (type) => {
  const typeMap = {
    category: "hrms-badge--category",
    subCategory: "hrms-badge--subcategory",
    zone: "hrms-badge--zone",
    role: "hrms-badge--role",
  };
  return `hrms-badge ${typeMap[type] || ""}`;
};

// Badge styles - Keep for programmatic use (e.g., charts, third-party libraries)
export const BADGE_STYLES = {
  category: { backgroundColor: "#E0F2FE", color: "#0369A1" },
  subCategory: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
  zone: { backgroundColor: "#D1F2EB", color: "#0D6759" },
  role: { backgroundColor: "#E9D5FF", color: "#7C3AED" },
};

export const PRIMARY_COLOR = "#a82227";
export const OBPS_GROUP_ID = "025";
export const LINEAR_BLUE_GRADIENT = "linear-gradient(135deg, #2563eb, #1e40af)";
