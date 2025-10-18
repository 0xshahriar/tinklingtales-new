# Google Apps Script Backend for Tinkling Tales

This directory contains an Apps Script implementation that backs the
Tinkling Tales storefront. It exposes a REST-like JSON API that the
frontend calls from Netlify. The backend persists data in Google Sheets
and can be deployed as a Web App from the Apps Script editor.

## Overview

The backend is organised around the following core sheets:

- **Products** – catalogue of bangles and metadata used by the shop.
- **Orders** – customer checkout submissions and fulfilment status.
- **Users** – registered customers, admins, and managers.
- **Sessions** – API tokens that keep users signed in.
- **CustomRequests** – bespoke order enquiries submitted from the site.
- **PasswordResets** – short-lived tokens for the “forgot password” flow.

Each sheet is automatically created with the expected headers the first
time the script runs, so a blank spreadsheet is enough to get started.

## Prerequisites

1. Create a new Google Spreadsheet dedicated to the storefront backend.
2. In Apps Script, add the files from this directory. You can either:
   - Open the script editor from the spreadsheet and copy/paste the
     contents of each `.gs` file, or
   - Use clasp (`https://github.com/google/clasp`) to push the project.
3. In the Apps Script editor, open **Project Settings → Script
   properties** and add the following keys:

   | Property | Description |
   | --- | --- |
   | `SPREADSHEET_ID` | The ID of the spreadsheet created in step 1. |
   | `JWT_SECRET` | A long random string used for hashing session tokens. |
   | `ALLOWED_ORIGINS` | Comma-separated list of front-end origins, e.g. `https://tinklingtales.netlify.app`. |
   | `TOKEN_EXPIRY_HOURS` *(optional)* | Overrides the default 7-day session lifetime. |

   The script reads these properties at runtime so credentials never live
   in version control.

4. (Optional) Configure **Services → Gmail API** if you plan to send reset
   emails. The default implementation simply records a reset token in the
   sheet and returns a stub message to the caller.

## Deploying as a Web App

1. In the Apps Script editor choose **Deploy → Test deployments** and
   verify the API works via the **Latest code** deployment.
2. When ready, choose **Deploy → New deployment**, pick **Web app**, and
   set:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone*
3. Copy the deployment URL and paste it into
   `assets/js/constants.js → APP_CONFIG.apiBaseUrl` in the frontend.
4. Rebuild / redeploy the Netlify site.

The backend already returns the correct CORS headers for the authorised
origins defined in the `ALLOWED_ORIGINS` property.

## File Structure

| File | Responsibility |
| --- | --- |
| `appsscript.json` | Script manifest enabling the Sheets and URL Fetch services. |
| `Code.gs` | Entry point with routing, HTTP helpers, and schema bootstrap. |
| `auth.gs` | Authentication, password hashing, session token handling. |
| `products.gs` | CRUD helpers for the product catalogue. |
| `orders.gs` | Order persistence and fulfilment status transitions. |
| `users.gs` | User and role management utilities. |
| `custom-requests.gs` | Storage for bespoke order enquiries. |
| `dashboard.gs` | Aggregated analytics returned on the admin dashboard. |

Feel free to extend these modules with additional sheets or automation as
the business grows. Because all access is funneled through the helper
functions, enforcing validation and permissions in one place becomes
straightforward.

