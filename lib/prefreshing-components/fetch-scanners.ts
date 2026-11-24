import { backendGet } from "./backend-get";

export type Scanner = {
  id: string;
  authUserId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  location: string | null;
  createdAt: string;
};

// the server and the client share this key, so the prefetched data is picked up
export const SCANNERS_QUERY_KEY = ["scanners"] as const;

export const scannerKey = (scannerId: string | null) =>
  ["scanners", scannerId] as const;

// all scanners; admins tied to a campus only get that campus (filtered by the backend)
// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchScanners(cookie?: string): Promise<Scanner[]> {
  const data = await backendGet<{ scanners: Scanner[] }>(
    `/api/scanners/get-all`,
    "Failed to fetch scanners",
    cookie,
  );
  return data.scanners;
}

// a single scanner by id
export async function fetchScannerById(
  scannerId: string,
  cookie?: string,
): Promise<Scanner> {
  const data = await backendGet<{ scanner: Scanner }>(
    `/api/scanners/${scannerId}`,
    "Failed to fetch scanner",
    cookie,
  );
  return data.scanner;
}
