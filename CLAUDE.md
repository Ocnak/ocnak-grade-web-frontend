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

Route groups map to user roles (`user.userRole`: `admin`, `teacher`, `parent`):

- `app/(admin)/admin-dashboard/*` — admin area (students, classes, teachers, parents, tracking/attendance, QR scanner, grades, progress reports)
- `app/(teacher)/teacher/*` — teacher area
- `app/(parent)/parent/*` — parent area
- `app/auth/*` — login, OTP verification, admin registration; `app/(landing-page)` and `app/unauthorized` are public

Teacher and admin areas contain many near-duplicate components (e.g. `students/*`, `view-student-grade`, `toddler-progress-report`), some of which branch on `userRole`. When fixing a bug in one, check the counterpart in the other role's folder.

Newer pages shared by both roles avoid the duplication instead: a thin `page.tsx` in each role folder renders a shared client component from `components/<feature>/` and passes role-specific hrefs as props. Examples:

- `student-detail` (`components/student-detail/student-detail-main.tsx`, used by `app/(admin)/admin-dashboard/student-detail/page.tsx` and `app/(teacher)/teacher/student-detail/page.tsx`).
- **Student Monitoring** (`components/student-tracking/`): the scanner, live status, attendance, tab menu and filters. Admin has `admin-dashboard/tracking/*` and `admin-dashboard/scanner`. Teacher has `teacher/tracking/*` and `teacher/scanner`, with no QR Cards (those stay admin-only in `admin-dashboard/tracking/qr-cards-main.tsx`), and `/teacher/tracking` redirects to `/live`. Shared client components take `role: "admin" | "teacher"` rather than icon or tab props, because server layouts can't pass functions to client components. Teacher pages pass `scope` from `useTeacherScope()` (`components/student-tracking/use-teacher-scope.tsx`: the teacher's classes from `useTeacherClasses`, plus `user.location` if the backend returns it) to `LiveStatusMain`/`AttendanceMain`. This filters the lists on the client as a second check; the backend is what actually limits teachers to their own classes and location.

Teachers navigate with the links in the header (`app/(teacher)/teacher/teacher-nav-links.tsx`, shown in `app-header.tsx` and in the phone menu `app-header-menu.tsx`). Add new teacher sections there.

Routes that take a student use a query param (`?studentId=…`), not a path segment, because `students/[classId]` already captures `students/<id>`. The student row ⋯ menu (`students/student-card-dropdown-menu.tsx` in each role) links to `view-student-grade` and `student-detail`.

### Auth

- Auth is **better-auth**, hosted by the backend. `lib/auth-client.ts` is the client (email OTP plugin, extra user fields `firstName`, `lastName`, `userRole`). Cookies use the prefix `ocnak.`.
- `proxy.ts` (Next 16's replacement for `middleware.ts`) redirects to `/auth/login` when there's no session cookie and does a best-effort role check from the cookie cache. Its matcher only covers `/admin-dashboard` and `/teacher`. It is not the security boundary; the backend enforces authorization.
- Client-side session: `useSession()` in `hooks/use-session.tsx` (React Query, key `["session"]`).

### Data fetching

- Server state uses **TanStack React Query** (`components/QueryProvider.tsx` in the root layout). Domain hooks live in `hooks/use-*.tsx` (queries + mutations that call the backend with `fetch(..., { credentials: "include" })` and invalidate query keys on success).
- **SSR prefetch pattern:** shared fetchers and query keys live in `lib/prefreshing-components/fetch-*.ts`. Each fetcher takes an optional `cookie` argument. Server components/layouts get the session cookies via `getSessionCookie()` (`lib/prefreshing-components/get-session-cookie.ts`), call `queryClient.prefetchQuery` with the same key the client hook uses, and wrap children in `<HydrationBoundary state={dehydrate(queryClient)}>`. Examples: `app/(teacher)/teacher/students/layout.tsx`, `app/(admin)/admin-dashboard/teachers/page.tsx`. Prefetch failures are tolerated and the client refetches. Server fetches use `cache: "no-store"`.
- When adding a query, export its key from the `lib/prefreshing-components` fetcher and reuse it in both the hook and any server prefetch so hydration matches.
- Student records (`useFetchStudentById`, data under `.students`) carry the parent info directly as `parentName`, `parentContact`, `parentEmail`. Linked parent accounts are separate (`hooks/use-parent.tsx`).
- **Attendance and live tracking:** hooks are in `hooks/use-student-attendance.tsx` and `hooks/use-student-tracking.tsx`. The URLs, `apiRequest`, `toQuery`, the `attendanceKeys`/`trackingKeys` query-key factories and the status types are in `lib/types/student-attendance-shared.ts`. There is no single-student live endpoint: `useLiveTracking()` returns every student (polls every 20s), so filter it by id. Dates are `YYYY-MM-DD` strings in the school time zone (`SCHOOL_TIME_ZONE`); use the helpers in `lib/attendance-dates.ts` (`getSchoolToday`, `addDays`, `getMonday`, `formatDay`, `formatArrival`). The status colors and labels are defined once in `components/student-tracking/tracking-status-styles.ts` and `components/student-tracking/attendance-status-styles.ts`; import them instead of copying.

### Client state

`store/*.ts` holds **Zustand** stores for UI state shared across components: filters (`filterStore`, `mutipleFilterStore`), selected class/subject/student/grade, and modal open state (`modalStore`).

### UI

- shadcn/ui components in `components/ui` (style `radix-nova`, lucide icons, `cn()` from `lib/utils.ts`). Add new ones via the shadcn CLI. Some are animated `motion-*` variants built on `motion`.
- Forms: react-hook-form + zod. Schemas sit next to their forms as `*-schema.tsx` files.
- Fonts come from `next/font/google` (Outfit/Geist globally, Fredoka for headings), declared per layout or page. Smooth scrolling is handled by Lenis (`utils/lenis.ts`). Toasts use sonner.
- Path alias: `@/*` → repo root.
