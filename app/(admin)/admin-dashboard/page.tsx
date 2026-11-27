import { redirect } from "next/navigation";

// the admin home is the overview page
export default function AdminDashboardPage() {
  redirect("/admin-dashboard/overview");
}
