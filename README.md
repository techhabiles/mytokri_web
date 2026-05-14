# MyTokri Admin (React)

React web port of the MyTokri Admin Android app. Talks to the same backend
and shares the same auth flow, role-based screens, and CRUD operations.

## Stack

- Vite + React 18 + TypeScript
- React Router v6
- Axios (with auth + error interceptors mirroring the Android app)
- Tailwind CSS
- Lucide React icons
- crypto-js for SHA-256 OTP hashing

## Getting Started

```bash
npm install
npm run dev
```

Dev server: http://localhost:3000

## Build URLs

Configured in `src/utils/constants.ts`:

- `DEV_BASE_URL`: `http://192.168.1.5:8080/api/`
- `PROD_BASE_URL`: `https://api.mytokri.com/`

The active URL is selected by Vite mode (`import.meta.env.DEV`). To change
the dev base URL (e.g. backend running on a different IP), edit
`DEV_BASE_URL`.

## Auth Flow

1. `LoginPage` collects phone + role and calls one of:
   - `auth/admin_login`
   - `auth/hub_manager_login`
   - `auth/delivery_person_login`

   A client-side UUID is generated and sent with the request.

2. `VerifyOtpPage` SHA-256 hashes the entered OTP and calls
   `auth/complete_login` with `{ phone, otp, uuid }`.

3. On success the `LoginResponse` is stored in localStorage
   (`mytokri_session`) via `SessionContext`, and the user is routed by
   role:
   - Admin → `/admin`
   - Hub Manager → `/hub-manager`
   - Delivery Person → `/delivery`

4. The Axios `Authorization: Bearer <token>` header is attached on every
   request. A 401 response clears the session and redirects to
   `/login` (the same behavior as `UnAuthorisedException` in the Android
   app).

## Project Layout

```
src/
├── api/                 # axios client + per-domain APIs (auth, admin, shared)
├── components/          # reusable UI (Toolbar, dialogs, dashboard grid, etc.)
├── context/             # SessionContext, DialogContext
├── hooks/               # useApiHandler, useLogout
├── pages/
│   ├── auth/            # Splash, Login, VerifyOtp
│   ├── admin/           # Admin home + management screens
│   ├── shared/          # Add/List Product, Add/List Supplier
│   ├── hubmanager/      # Hub Manager home, inventory, orders
│   └── delivery/        # Delivery Person home
├── types/models.ts      # TypeScript request/response types
├── utils/               # constants, hashUtil, validators, uuid, roleRoutes
├── App.tsx              # Routes
├── main.tsx             # Entry
└── index.css            # Tailwind + component classes
```

## Roles

- **Admin (1):** full access — hubs, locations, categories, hub managers,
  delivery persons, products, suppliers, image upload, plain OTP.
- **Hub Manager (3):** products / suppliers / inventory limited to their
  assigned hub. Hub field is hidden in forms (uses `session.hubId`).
- **Delivery Person (4):** placeholder home screen.

## Build

```bash
npm run build
```

Outputs to `dist/`.
