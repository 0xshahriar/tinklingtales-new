# Google Apps Script Backend for Tinkling Tales

This folder ships a fully scripted Google Apps Script (GAS) backend that
drives the Tinkling Tales storefront. The code exposes a JSON HTTP API,
uses Google Sheets for storage, and is designed to be deployed as a GAS
Web App that the Netlify frontend can call securely.

The sections below walk through the exact steps required to provision the
spreadsheet, configure environment secrets, and publish the API. Follow
each step in order – no prior Apps Script experience is required.

## 1. Create the spreadsheet container

1. Sign in to the Google account that will own the data.
2. Create a **new Google Spreadsheet** (Google Drive → New → Google
   Sheets) and give it an identifiable name such as `Tinkling Tales API`.
3. Open the spreadsheet once so Apps Script can link to it later. You do
   not need to add any tabs manually; the script will create the required
   sheets the first time it runs.

### Sheet layout reference

The backend initialises the spreadsheet with the following tabs and
columns. You do not need to pre-populate them, but the list is useful if
you ever need to inspect or repair the data manually.

| Sheet name | Columns (in order) | Notes |
| --- | --- | --- |
| `Products` | `id`, `name`, `price`, `currency`, `description`, `images`, `tags`, `inventory`, `isActive`, `createdAt`, `updatedAt` | `images` and `tags` are stored as JSON arrays. Prices are in BDT. |
| `Orders` | `orderId`, `customerId`, `customerName`, `customerEmail`, `shippingAddress`, `items`, `total`, `status`, `locked`, `createdAt`, `updatedAt` | `status` flows through pending → confirmed → delivered → received. `locked` prevents cancellation after auto-confirm. |
| `Users` | `userId`, `email`, `passwordHash`, `name`, `phone`, `preferredChannel`, `role`, `createdAt`, `updatedAt` | `role` can be `customer`, `manager`, or `admin`. Admin/manager roles unlock the dashboard. |
| `Sessions` | `token`, `userId`, `role`, `issuedAt`, `expiresAt` | Stores active JWT sessions for the API. |
| `CustomRequests` | `requestId`, `customerName`, `customerEmail`, `details`, `status`, `createdAt`, `updatedAt` | Tracks bespoke bangle enquiries. |
| `PasswordResets` | `token`, `userId`, `expiresAt`, `createdAt` | Supports the “forgot password” flow. |

> ℹ️ If any sheet is accidentally deleted, the backend will recreate it
> with the exact header row the next time it receives a request.

## 2. Set up the Apps Script project

1. With the spreadsheet open, choose **Extensions → Apps Script**. This
   opens the Apps Script editor bound to your spreadsheet.
2. Delete the placeholder `Code.gs` file that Google creates – we will
   replace it with the files from this repository.
3. For each `.gs` file in this `backend/` folder (`Code.gs`, `auth.gs`,
   `orders.gs`, etc.), create a file with the same name in the editor and
   paste the contents. Repeat for `appsscript.json` by choosing **Project
   Settings → Show "appsscript.json"**.
   - Alternatively, you can use the [clasp](https://github.com/google/clasp)
     CLI to push the project from your local machine: run `clasp login`,
     `clasp create`, copy the `scriptId` into `.clasp.json`, and `clasp
     push`. Pick whichever workflow you are more comfortable with.

### Configure script properties (environment secrets)

The backend reads all secrets from **Project Settings → Script properties**.
Click **Add script property** for each of the keys below:

| Property | Required | Example value | Description |
| --- | --- | --- | --- |
| `SPREADSHEET_ID` | ✅ | `1abcdEfGhIJK_lmnopQRstuVWxyz0123456789` | The ID portion of the spreadsheet URL (between `/d/` and `/edit`). |
| `JWT_SECRET` | ✅ | `d5c1bb2b4c96498db99f8a7bd4b3fc70` | A long random string (at least 32 characters). Generate one with any password manager or run `openssl rand -hex 32` locally. This powers the HMAC hashing for session tokens. |
| `ALLOWED_ORIGINS` | ✅ | `https://tinklingtales.netlify.app,https://preview--tinklingtales.netlify.app` | Comma-separated list of front-end origins permitted to call the API. Include your Netlify live domain and any staging domains you plan to use. |
| `TOKEN_EXPIRY_HOURS` | ⭕ | `168` | Optional override for the session lifetime in hours (defaults to 7 days if omitted). |

Changes are applied immediately – there is no need to redeploy after
updating a property.

## 3. Deploy as a Web App

1. In the Apps Script editor, click **Deploy → Test deployments** and
   create a test deployment to verify there are no syntax errors.
2. Once the test call succeeds, choose **Deploy → New deployment**, select
   **Web app**, and fill in the form:
   - **Description**: `Production API`
   - **Execute as**: *Me (your account)*
   - **Who has access**: *Anyone*
3. After saving, copy the **Web app URL**. Paste this value into the
   frontend configuration at `assets/js/constants.js` under
   `APP_CONFIG.apiBaseUrl`.
4. Redeploy the Netlify site so it picks up the new API endpoint.

The backend automatically returns CORS headers for every origin listed in
`ALLOWED_ORIGINS`. If a request comes from any other domain the response
is rejected before touching the data.

## 4. Understanding the built-in automations

- **Authentication & JWTs**: `auth.gs` hashes passwords, issues signed
  session tokens, and writes them to the `Sessions` sheet. The secret used
  to sign tokens is the `JWT_SECRET` property configured above.
- **Order auto-confirmation**: `orders.gs` upgrades orders from `pending`
  to `confirmed` two hours after creation, locking cancellation once the
  transition happens. Admins can still push orders forward to `delivered`
  or `received` through the dashboard.
- **Role-based permissions**: API routes under `/admin/*` require the user
  role to be either `admin` or `manager`. Customer-facing routes only need
  a valid session token.

## 5. Testing the API

Apps Script exposes a simple execution log that you can use while testing:

1. From the editor, open **Executions** in the left sidebar to see recent
   requests and any errors.
2. Use a tool such as `curl` or Postman to exercise the endpoints. For
   example, to authenticate from the command line:

   ```bash
   curl -X POST "https://<your-script-id>.script.google.com/macros/s/<deployment-id>/exec/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"your-password"}'
   ```

   Successful responses include a `token`, `profile`, and `isAdmin` flag.
   Use the `token` for subsequent authenticated requests.

## 6. File overview

| File | Responsibility |
| --- | --- |
| `appsscript.json` | Script manifest enabling the Sheets and URL Fetch services. |
| `Code.gs` | Entry point, request routing, schema bootstrapping, and shared HTTP helpers. |
| `utils.gs` | Spreadsheet helpers, ID generation, JSON parsing utilities. |
| `auth.gs` | Registration, login, password reset, and session token management. |
| `products.gs` | Product catalogue CRUD helpers. |
| `orders.gs` | Order persistence, fulfilment status transitions, and the two-hour confirmation lock. |
| `users.gs` | User and role management utilities. |
| `custom-requests.gs` | Storage and updates for bespoke order enquiries. |
| `dashboard.gs` | Aggregated analytics surfaced in the admin overview. |
| `admin.gs` | Combined controller functions wired to `/admin/*` routes. |

With these steps complete, the Apps Script backend is ready to serve the
Tinkling Tales storefront in production. Whenever you update any `.gs`
file, redeploy the Web App (step 3) so the changes go live.
