import { redirect } from "next/navigation";

// teachers have no QR Cards tab, so Live Status is their first tab
export default function TeacherTrackingPage() {
  redirect("/teacher/tracking/live");
}
