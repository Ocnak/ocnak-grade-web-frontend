// "Scan students" link: a fixed intent value (not a URL) is passed through
// login as ?next=scan, so the param can't be used as an open redirect
export const SCAN_INTENT = "scan";

// the scan page for a role; null for parents/unknown roles,
// so the caller falls back to its normal destination
export const getScannerPath = (role?: string | null) => {
  if (role === "admin") return "/admin-dashboard/scanner";
  if (role === "teacher") return "/teacher/scanner";
  if (role === "scanner") return "/scanner/scan";
  return null;
};
