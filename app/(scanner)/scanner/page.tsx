import { redirect } from "next/navigation";

// the scan page is the scanner's home
export default function ScannerHomePage() {
  redirect("/scanner/scan");
}
