import { redirect } from "next/navigation";

// scanners have no QR Cards tab, so Live Status is their first tracking tab
export default function ScannerTrackingPage() {
  redirect("/scanner/tracking/live");
}
