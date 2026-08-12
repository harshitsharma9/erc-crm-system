# ERP CRM API

Local API base URL: `http://localhost:5000/api`. Send `Authorization: Bearer <token>` to every endpoint other than authentication. The health check is `GET /health` (outside the API prefix).

## Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Creates the first account as Admin; later public accounts are Sales. |
| POST | `/auth/login` | Returns a JWT and user profile. |
| GET | `/auth/me` | Returns the authenticated profile. |

Registration body:

```json
{ "name": "Demo Admin", "email": "admin@company.com", "password": "Password123" }
```

Login body:

```json
{ "email": "admin@company.com", "password": "Password123" }
```

## Customers

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/customers` | List customers; supports `search`, `status`, `page`, and `limit`. |
| POST | `/customers` | Create a customer. |
| GET | `/customers/:id` | Get a customer. |
| PUT | `/customers/:id` | Update a customer. |
| DELETE | `/customers/:id` | Delete a customer (Admin). |
| POST | `/customers/:id/followups` | Add a follow-up. |
| GET | `/customers/:id/followups` | List customer follow-ups. |

## Products

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/products` | List products; supports `search` and `categoryId`. |
| POST | `/products` | Create a product (Admin or Warehouse). |
| GET | `/products/:id` | Get a product. |
| PUT | `/products/:id` | Update a product (Admin or Warehouse). |
| DELETE | `/products/:id` | Delete a product (Admin). |
| GET | `/products/low-stock` | List products at or below their minimum level. |
| GET/POST | `/products/categories` | List or create categories. |

## Inventory

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/stock/in` | Increase product stock (Admin or Warehouse). |
| POST | `/stock/out` | Decrease product stock after availability validation. |
| GET | `/stock/movements` | Movement history. |
| GET | `/stock/movements/:productId` | Movement history for one product. |
| GET | `/inventory/summary` | Current stock summary. |
| GET/POST | `/inventory/movements` | Filtered ledger or stock movement creation. |

Stock request body:

```json
{ "productId": "uuid", "quantity": 5, "reason": "Opening stock" }
```

## Sales Challans

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/challans` | List challans. |
| POST | `/challans` | Create a draft (Admin or Sales). |
| GET | `/challans/:id` | Get challan details and item snapshots. |
| PUT | `/challans/:id` | Update a draft. |
| POST | `/challans/:id/confirm` | Atomically validate and deduct stock. |
| POST | `/challans/:id/cancel` | Cancel a draft. |

Create a challan with:

```json
{
  "customerId": "uuid",
  "items": [{ "productId": "uuid", "quantity": 3 }]
}
```

If confirmation requests more stock than exists, it returns HTTP `400` with a message containing `Insufficient stock`; no stock movement or deduction is persisted.
