# Demo Recording Runbook

Record this flow after creating one Admin account and one later Sales account. Use the Admin account for setup and the Sales account only for the final role-restriction demonstration.

## Preparation

1. Start the backend and frontend, or use the deployed URLs.
2. Register the first account as `admin@company.com`; it is automatically assigned `ADMIN`.
3. Register a second account, such as `sales@company.com`; it is assigned `SALES`.
4. Sign in as Admin and create a category plus two products. Add 13 units to the first product, then perform a Stock OUT of 5 units. This leaves 8 units.

## Recording sequence

1. **Login:** Sign in as Admin and briefly show the authenticated dashboard.
2. **Dashboard:** Point out the customer, product, challan, and low-stock metrics.
3. **Customer creation:** Create `ABC Traders`.
4. **Customer follow-up:** Add a follow-up note to the customer.
5. **Product creation:** Create two products, for example Wireless Mouse and Keyboard.
6. **Stock IN:** Add 13 Mouse units and show the new stock count.
7. **Create challan:** Start a sales challan for ABC Traders.
8. **Add multiple products:** Add exactly 3 Mouse units plus at least one Keyboard line item. Confirming it leaves 5 Mouse units.
9. **Save draft:** Save the challan and show its `DRAFT` status.
10. **Confirm challan:** Confirm the draft as Admin or Sales.
11. **Show stock reduction:** Return to Inventory and show that confirmed Mouse quantity was deducted.
12. **Show stock movement:** Open Movement History and show the `OUT` record referencing the challan number.
13. **Try insufficient stock:** With exactly 5 Mouse units remaining, create a new draft requesting 10 Mouse units and attempt confirmation.
14. **Show API error:** In Postman, show the same confirmation response: HTTP `400` and `Insufficient stock`.
15. **Logout and role restrictions:** Log out, sign in as the Sales user, then try Stock IN or Product creation. Show the API's `403` role-restriction response. Sales can still work with customers and challans.

## Postman failure proof

Import `postman/ERP-CRM.postman_collection.json`. Its final Challans request automatically creates an oversized draft and sends its confirmation request. The test passes only when the confirmation returns HTTP `400` with an `Insufficient stock` message.

## Suggested recording length

Aim for 4–6 minutes. Keep the database browser and Postman visible only when they prove stock changes, transaction behavior, or role-based authorization.
