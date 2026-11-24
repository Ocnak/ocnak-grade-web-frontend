# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm**.

- `pnpm dev` — dev server on http://localhost:3000 (also re-writes `AGENTS.md`; see that file)
- `pnpm build` — production build (also the main type-check, since there is no separate `tsc` script)
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript). Currently crashes on startup (`contextOrFilename.getFilename is not a function`): the installed `eslint-plugin-react` 7.x doesn't support ESLint 10. Rely on `pnpm build` for checking until that's fixed.
- `pnpm exec prettier --write <file>` — Prettier with `prettier-plugin-tailwindcss` (sorts Tailwind classes)

There is no test suite.

Environment (`.env`): `NEXT_PUBLIC_BACKEND_URL` (separate backend API) and `BETTER_AUTH_SECRET` (must match the backend's secret so `proxy.ts` can read the cookie cache).

## Architecture

This is a **frontend only** for a daycare grade-tracking system (Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui). All data lives in a separate backend at `NEXT_PUBLIC_BACKEND_URL`; there are no Next.js API routes or database access here.

### Roles and routing

Route groups map to user roles (`user.userRole`: `admin`, `teacher`, `parent`, `scanner`):

- `app/(admin)/admin-dashboard/*` — admin area (students, classes, teachers, parents, scanner accounts, tracking/attendance, QR scanner, grades, progress reports)
- `app/(teacher)/teacher/*` — teacher area
- `app/(scanner)/scanner/*` — scanner area (accounts created on the admin Scanners page): only Student Monitoring without QR Cards, i.e. `/scanner/scan`, `/scanner/tracking/live`, `/scanner/tracking/attendance`. `/scanner` and `/scanner/tracking` redirect. Its own header (`scanner/app-header.tsx`) has no nav links; it reuses the admin dropdown and the teacher phone menu.
- `app/(parent)/parent/*` — parent area
- `app/auth/*` — login, OTP verification, admin registration; `app/(landing-page)` and `app/unauthorized` are public

Teacher and admin areas contain many near-duplicate components (e.g. `students/*`, `view-student-grade`, `toddler-progress-report`), some of which branch on `userRole`. When fixing a bug in one, check the counterpart in the other role's folder.

Newer pages shared by both roles avoid the duplication instead: a thin `page.tsx` in each role folder renders a shared client component from `components/<feature>/` and passes role-specific hrefs as props. Examples:

- `student-detail` (`components/student-detail/student-detail-main.tsx`, used by `app/(admin)/admin-dashboard/student-detail/page.tsx` and `app/(teacher)/teacher/student-detail/page.tsx`).
- **Student Monitoring** (`components/student-tracking/`): the scanner, live status, attendance, tab menu and filters. Admin has `admin-dashboard/tracking/*` and `admin-dashboard/scanner`. Teacher has `teacher/tracking/*` and `teacher/scanner`, with no QR Cards (those stay admin-only in `admin-dashboard/tracking/qr-cards-main.tsx`), and `/teacher/tracking` redirects to `/live`. Shared client components take `role: "admin" | "teacher"` rather than icon or tab props, because server layouts can't pass functions to client components. Teacher pages pass `scope` from `useTeacherScope()` (`components/student-tracking/use-teacher-scope.tsx`: the teacher's classes from `useTeacherClasses`, plus `user.location` if the backend returns it) to `LiveStatusMain`/`AttendanceMain`. This filters the lists on the client as a second check; the backend is what actually limits teachers to their own classes and location. Scanners work the same way with `role="scanner"` (tabs `SCANNER_TRACKING_TABS`, all-class filter) and `useScannerScope()` (`components/student-tracking/use-scanner-scope.tsx`): `classIds: null` means every class, limited to `user.location`.
- **QR cards** (`admin-dashboard/tracking/qr-cards-main.tsx`): the on-screen grid and the search use the full name (`getFullName`). The printed card and the print `documentTitle` use `getPrintName`, which keeps only the first initial and the last word ("John Smith Bee" → "J. Bee"). There is no `middleName` field, so middle names can sit in either `firstName` or `lastName`. Printing goes through `react-to-print`, which copies the hidden print area, not the grid.

Admins navigate with the sidebar. Its items are listed twice: in `app/(admin)/admin-dashboard/app-sidebar.tsx` (desktop) and in `teachers/reponsive-sidebar.tsx` (the phone menu, used by `app-header.tsx`; `parents/reponsive-sidebar.tsx` is an unused older copy). Add new admin sections to both. The active tab is `pathname.startsWith(url)`, so a new URL must not be a prefix of an existing one.

Teachers navigate with the links in the header (`app/(teacher)/teacher/teacher-nav-links.tsx`, shown in `app-header.tsx` and in the phone menu `app-header-menu.tsx`). Add new teacher sections there.

Routes that take a student use a query param (`?studentId=…`), not a path segment, because `students/[classId]` already captures `students/<id>`. The student row ⋯ menu (`students/student-card-dropdown-menu.tsx` in each role) links to `view-student-grade` and `student-detail`.

### Auth

- Auth is **better-auth**, hosted by the backend. `lib/auth-client.ts` is the client (email OTP plugin, extra user fields `firstName`, `lastName`, `userRole`). Cookies use the prefix `ocnak.`.
- `proxy.ts` (Next 16's replacement for `middleware.ts`) redirects to `/auth/login` when there's no session cookie and does a best-effort role check from the cookie cache. Its matcher covers `/admin-dashboard`, `/teacher` and `/scanner` (not `/parent`). It is not the security boundary; the backend enforces authorization.
- Client-side session: `useSession()` in `hooks/use-session.tsx` (React Query, key `["session"]`).
- Login is two steps: `app/auth/login/LoginForm.tsx` sends the OTP and pushes to `/auth/verify-otp?email=…`. Then `verify-otp-form.tsx` reconciles the user and redirects by role (teacher → `/teacher/students`, admin → `/admin-dashboard/teachers`, parent → `/parent/grades`). `LoginForm` is also rendered by `app/(admin)/admin/page.tsx`. It reads search params, so every page that renders it needs a `<Suspense>` boundary, or `pnpm build` fails.
- **"Scan students"** (landing header, `app/(landing-page)/header/header.tsx`): signed-in admins and teachers go straight to their scanner. Signed-out users go to `/auth/login?next=scan`. `LoginForm` passes `next=scan` on to the OTP page, and after verifying, `getScannerPath(role)` (`lib/scan-redirect.ts`) picks the scanner. Parents fall back to their normal page. `next` is a fixed intent value, never a URL, so it can't be used as an open redirect. Add any new post-login destination the same way.

### Data fetching

- Server state uses **TanStack React Query** (`components/QueryProvider.tsx` in the root layout). Domain hooks live in `hooks/use-*.tsx` (queries + mutations that call the backend with `fetch(..., { credentials: "include" })` and invalidate query keys on success).
- **SSR prefetch pattern:** shared fetchers and query keys live in `lib/prefreshing-components/fetch-*.ts`. Each fetcher takes an optional `cookie` argument. Server components/layouts get the session cookies via `getSessionCookie()` (`lib/prefreshing-components/get-session-cookie.ts`), call `queryClient.prefetchQuery` with the same key the client hook uses, and wrap children in `<HydrationBoundary state={dehydrate(queryClient)}>`. Examples: `app/(teacher)/teacher/students/layout.tsx`, `app/(admin)/admin-dashboard/teachers/page.tsx`. Prefetch failures are tolerated and the client refetches. Server fetches use `cache: "no-store"`.
- When adding a query, export its key from the `lib/prefreshing-components` fetcher and reuse it in both the hook and any server prefetch so hydration matches.
- Student records (`useFetchStudentById`, data under `.students`) carry the parent info directly as `parentName`, `parentContact`, `parentEmail`. Linked parent accounts are separate (`hooks/use-parent.tsx`).
- **Scanners** (users with `userRole: "scanner"`, admin-only routes under `/api/scanners`): hooks are in `hooks/use-scanner.tsx`, and the `Scanner` type, `SCANNERS_QUERY_KEY`/`scannerKey` and fetchers are in `lib/prefreshing-components/fetch-scanners.ts`. The backend limits a campus-bound admin to their own location. The admin management page is `admin-dashboard/scanners/*` ("Scanners" sidebar tab), modelled on the teachers page. It reuses `teachers/input-search.tsx` (`placeholder` prop), `teacher-select-location.tsx`, `teacher-form-location-select.tsx` and `teacher-card-tooltip.tsx`. Don't confuse it with `admin-dashboard/scanner`, the QR scanning page.
- **Attendance and live tracking:** hooks are in `hooks/use-student-attendance.tsx` and `hooks/use-student-tracking.tsx`. The URLs, `apiRequest`, `toQuery`, the `attendanceKeys`/`trackingKeys` query-key factories and the status types are in `lib/types/student-attendance-shared.ts`. There is no single-student live endpoint: `useLiveTracking()` returns every student (polls every 20s), so filter it by id. Dates are `YYYY-MM-DD` strings in the school time zone (`SCHOOL_TIME_ZONE`); use the helpers in `lib/attendance-dates.ts` (`getSchoolToday`, `addDays`, `getMonday`, `formatDay`, `formatArrival`). The status colors and labels are defined once in `components/student-tracking/tracking-status-styles.ts` and `components/student-tracking/attendance-status-styles.ts`; import them instead of copying.

### Client state

`store/*.ts` holds **Zustand** stores for UI state shared across components: filters (`filterStore`, `mutipleFilterStore`), selected class/subject/student/grade, and modal open state (`modalStore`).

### UI

- shadcn/ui components in `components/ui` (style `radix-nova`, lucide icons, `cn()` from `lib/utils.ts`). Add new ones via the shadcn CLI. Some are animated `motion-*` variants built on `motion`.
- Forms: react-hook-form + zod. Schemas sit next to their forms as `*-schema.tsx` files.
- Fonts come from `next/font/google` (Outfit/Geist globally, Fredoka for headings), declared per layout or page. Smooth scrolling is handled by Lenis (`utils/lenis.ts`). Toasts use sonner.
- Path alias: `@/*` → repo root.
