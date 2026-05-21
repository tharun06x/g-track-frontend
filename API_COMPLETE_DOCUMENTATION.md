# G-TRACK Backend API - Complete Documentation

**API Version:** 1.0  
**Base URL:** `http://localhost:8000` (Development) or deployed backend URL  
**Authentication:** JWT Bearer Token (required for most endpoints)

---

## Table of Contents
1. [Authentication](#authentication)
2. [CORS Configuration](#cors-configuration)
3. [Health Check](#health-check)
4. [Users API](#users-api)
5. [Distributors API](#distributors-api)
6. [Admin API](#admin-api)
7. [Refill API](#refill-api)
8. [Dashboard API](#dashboard-api)
9. [Reports API](#reports-api)
10. [Sensor API](#sensor-api)
11. [Settings API](#settings-api)
12. [Complaints API](#complaints-api)
13. [Error Handling](#error-handling)
14. [Data Models](#data-models)

---

## Authentication

### JWT Token Format
- **Type:** Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Token Contains:** `user_id`, `email`, `role` (user/distributor/admin)

### Token Roles
- `user` - Consumer/End-user
- `distributor` - Gas distributor
- `admin` - System administrator

---

## CORS Configuration

**Allowed Origins:**
```
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (React dev server)
- http://127.0.0.1:5173
- http://127.0.0.1:3000
- http://localhost:8080
- http://127.0.0.1:8080
- https://*.onrender.com
- https://*.vercel.app
- https://*.netlify.app
```

**Methods:** All (`*`)  
**Headers:** All (`*`)  
**Credentials:** Enabled

---

## Health Check

### Get API Status
```
GET /
GET /health
```

**Response:**
```json
{
  "status": "Running",
  "version": 1.0
}
```

---

## Users API

**Prefix:** `/api/v1/users`

### 1. Register User
```
POST /register
Status Code: 201 Created
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "retrypassword": "SecurePass123",
  "name": "John Doe",
  "consumer_number": "GAS-12345",
  "mobile": "+919876543210",
  "address": "123 Street Name, Area",
  "state": "Karnataka",
  "district": "Bangalore",
  "device_id": "DEVICE-001",
  "distributor": "DISTRIBUTOR_NAME"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": "abc123def456",
  "name": "John Doe",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400` - Passwords do not match
- `409` - User already exists (duplicate email, phone, consumer_number, or device_id)
- `404` - Distributor not found

---

### 2. Login User
```
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": "abc123def456",
  "name": "John Doe"
}
```

**Error Responses:**
- `401` - Invalid email or password

---

### 3. Get Current User Info
```
GET /me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user_id": "abc123def456",
  "name": "John Doe",
  "email": "user@example.com",
  "phone_no": "+919876543210",
  "address": "123 Street Name, Area",
  "state": "Karnataka",
  "district": "Bangalore",
  "device_id": "DEVICE-001",
  "distributor_name": "DISTRIBUTOR_NAME"
}
```

**Error Responses:**
- `401` - Unauthorized (invalid/missing token)
- `404` - User not found

---

### 4. List All Users
```
GET /
GET /?distributor_id=DISTRIBUTOR_NAME
```

**Query Parameters:**
- `distributor_id` (optional) - Filter by distributor

**Response (200):**
```json
[
  {
    "user_id": "abc123def456",
    "name": "John Doe",
    "email": "user@example.com",
    "phone_no": "+919876543210",
    "consumer_no": "GAS-12345",
    "address": "123 Street Name, Area",
    "state": "Karnataka",
    "district": "Bangalore",
    "device_id": "DEVICE-001",
    "distributor_id": "DISTRIBUTOR_NAME",
    "gas": 30,
    "threshold_limit": 1.0,
    "auto_delivery": false
  }
]
```

---

### 5. Get Specific User
```
GET /{user_id}
```

**Response (200):** Same as individual user from list

**Error Responses:**
- `404` - User not found

---

### 6. Update User Profile
```
PUT /{user_id}
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "phone_no": "+919876543210",
  "address": "New Address",
  "threshold_limit": 2.5,
  "auto_delivery": true,
  "device_id": "NEW-DEVICE-001"
}
```

**Response (200):**
```json
{
  "user_id": "abc123def456",
  "name": "John Updated",
  "email": "user@example.com",
  "phone_no": "+919876543210",
  "device_id": "NEW-DEVICE-001",
  "message": "User profile updated successfully"
}
```

**Error Responses:**
- `403` - Not authorized (trying to update another user's profile)
- `404` - User not found
- `409` - Device ID already assigned to another user

---

### 7. Delete User Account
```
DELETE /{user_id}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "User account deleted successfully"
}
```

**Error Responses:**
- `403` - Not authorized
- `404` - User not found

---

## Distributors API

**Prefix:** `/api/v1/distributors`

### 1. Register Distributor
```
POST /register
Status Code: 201 Created
```

**Request Body:**
```json
{
  "email": "distributor@example.com",
  "password": "SecurePass123",
  "retry_password": "SecurePass123",
  "name": "ABC Gas Distribution",
  "phone_no": "+919876543210",
  "address": "Distribution Center",
  "state": "Karnataka",
  "district": "Bangalore"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "distributor_id": "dist123",
  "name": "ABC Gas Distribution",
  "email": "distributor@example.com",
  "message": "Distributor account created successfully"
}
```

**Error Responses:**
- `400` - Passwords do not match
- `409` - Distributor already exists (duplicate email or phone)

---

### 2. Login Distributor
```
POST /login
```

**Request Body:**
```json
{
  "email": "distributor@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "distributor_id": "dist123",
  "name": "ABC Gas Distribution",
  "email": "distributor@example.com"
}
```

**Error Responses:**
- `401` - Invalid email or password

---

### 3. Get Current Distributor Info
```
GET /me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "distributor_id": "dist123",
  "name": "ABC Gas Distribution",
  "email": "distributor@example.com",
  "phone_no": "+919876543210",
  "address": "Distribution Center",
  "state": "Karnataka",
  "district": "Bangalore"
}
```

---

### 4. List All Distributors
```
GET /
```

**Response (200):**
```json
[
  {
    "id": "dist123",
    "name": "ABC Gas Distribution",
    "email": "distributor@example.com",
    "phone_no": "+919876543210",
    "address": "Distribution Center",
    "state": "Karnataka",
    "district": "Bangalore"
  }
]
```

---

### 5. Get Specific Distributor
```
GET /{distributor_id}
```

**Response (200):** Same as individual distributor from list

---

### 6. Get Distributor's Consumers
```
GET /{distributor_id}/consumers
```

**Response (200):**
```json
[
  {
    "user_id": "abc123def456",
    "name": "John Doe",
    "email": "user@example.com",
    "phone_no": "+919876543210",
    "consumer_no": "GAS-12345",
    "address": "123 Street Name, Area",
    "state": "Karnataka",
    "district": "Bangalore",
    "gas": 30
  }
]
```

---

## Admin API

**Prefix:** `/api/v1/admin`

### 1. Admin Login
```
POST /login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "admin_id": "admin001",
  "name": "System Admin"
}
```

**Error Responses:**
- `401` - Invalid admin credentials

---

### 2. Register Admin
```
POST /register
```

**Request Body:**
```json
{
  "admin_id": "admin002",
  "email": "newadmin@example.com",
  "password": "SecurePass123",
  "name": "New Admin",
  "phone_no": "+919876543210"
}
```

**Response (200):**
```json
{
  "message": "Admin registered successfully",
  "admin_id": "admin002",
  "email": "newadmin@example.com",
  "name": "New Admin"
}
```

**Error Responses:**
- `400` - Email or admin_id already exists

---

### 3. Submit Distributor Request
```
POST /distributor-requests
```

**Request Body:**
```json
{
  "name": "John Entrepreneur",
  "email": "entrepreneur@example.com",
  "phone_no": "+919876543210",
  "company_name": "New Gas Distribution",
  "address": "Business Address",
  "state": "Karnataka",
  "district": "Bangalore",
  "reason": "Want to expand gas distribution business"
}
```

**Response (200):**
```json
{
  "message": "Distributor request submitted successfully. An admin will review your request soon.",
  "request_id": "DREQ-ABC123DEF456",
  "status": "pending"
}
```

**Error Responses:**
- `400` - Already has pending request

---

### 4. Get Pending Distributor Requests
```
GET /distributor-requests/pending
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "total": 2,
  "requests": [
    {
      "request_id": "DREQ-ABC123DEF456",
      "name": "John Entrepreneur",
      "email": "entrepreneur@example.com",
      "phone_no": "+919876543210",
      "company_name": "New Gas Distribution",
      "state": "Karnataka",
      "district": "Bangalore",
      "reason": "Want to expand gas distribution business",
      "requested_at": "2026-05-21T10:30:00+00:00"
    }
  ]
}
```

---

### 5. Approve/Reject Distributor Request
```
PATCH /distributor-requests/{request_id}
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "approved",
  "review_comment": "Request approved by admin",
  "password": "DistributorPass123"
}
```

**Response (200) - Approved:**
```json
{
  "message": "Distributor request approved and account created",
  "request_id": "DREQ-ABC123DEF456",
  "status": "approved",
  "distributor_id": "DIST-ABC123DEF456",
  "email": "entrepreneur@example.com"
}
```

**Response (200) - Rejected:**
```json
{
  "message": "Distributor request rejected",
  "request_id": "DREQ-ABC123DEF456",
  "status": "rejected",
  "comment": "Business address verification failed"
}
```

**Error Responses:**
- `400` - Password required for approved requests
- `404` - Request not found
- `400` - Request already reviewed

---

## Refill API

**Prefix:** `/api/v1/refill`

**Important:** Refill requests have a 25-day wait period between requests.

### 1. Create Refill Request
```
POST /request?user_id=ABC123
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "request_id": "abcd123456",
  "user_id": "abc123def456",
  "status": "pending",
  "requested_date": "2026-05-21T10:30:00+00:00"
}
```

**Error Responses:**
- `403` - Not authorized for this user
- `400` - Next refill request allowed in X day(s). Allowed after YYYY-MM-DD

---

### 2. Approve/Reject Refill Request
```
PATCH /approve/{request_id}?distributor_id=DIST001&action=approved
```

**Query Parameters:**
- `request_id` - Refill request ID
- `distributor_id` - Distributor ID approving the request
- `action` - "approved" or "rejected"

**Response (200):**
```json
{
  "request_id": "abcd123456",
  "user_id": "abc123def456",
  "status": "approved",
  "approved_by": "DIST001",
  "approved_date": "2026-05-21T10:35:00+00:00"
}
```

**Error Responses:**
- `404` - Refill request not found
- `400` - Request already approved/rejected
- `400` - Invalid action

---

### 3. Get User's Refill Requests
```
GET /user/{user_id}
```

**Response (200):**
```json
[
  {
    "request_id": "abcd123456",
    "status": "approved",
    "requested_date": "2026-05-21T10:30:00+00:00",
    "approved_by": "DIST001",
    "approved_date": "2026-05-21T10:35:00+00:00"
  }
]
```

---

### 4. Get Distributor's Refill Requests
```
GET /distributor/{distributor_id}
GET /distributor/{distributor_id}?status=pending
```

**Query Parameters:**
- `status` (optional) - Filter: "pending", "approved", "rejected"

**Response (200):** Array of refill requests

---

### 5. Get All Refill Requests (Admin)
```
GET /admin/all
GET /admin/all?status=pending
```

**Query Parameters:**
- `status` (optional) - Filter by status

**Response (200):** Array of all refill requests

---

### 6. Get User's Refill History
```
GET /history/{user_id}
```

**Response (200):**
```json
[
  {
    "request_id": "abcd123456",
    "status": "approved",
    "date": "May 21, 2026",
    "time": "10:35 AM",
    "amount": "+35.2 kg",
    "delivered_by": "ABC Gas Distribution",
    "approved_date": "2026-05-21T10:35:00+00:00"
  }
]
```

---

## Dashboard API

**Prefix:** `/api/v1/dashboard`

### Get Dashboard Summary
```
GET /summary?device_id=DEVICE001
```

**Query Parameters:**
- `device_id` - Sensor/Device ID

**Response (200):**
```json
{
  "remaining_gas": 45.5,
  "gas_used_today": 2.3,
  "avg_daily_usage": 3.1,
  "predicted_empty_date": "2026-06-15"
}
```

**Metrics Explanation:**
- `remaining_gas` - Current weight in kg
- `gas_used_today` - Usage since today's start
- `avg_daily_usage` - 30-day average consumption
- `predicted_empty_date` - Estimated date when gas will be empty

---

## Reports API

**Prefix:** `/api/v1/reports`

### 1. Get Device Data Overview
```
GET /device/data-overview?device_id=DEVICE001
```

**Response (200):**
```json
{
  "device_id": "DEVICE001",
  "has_live_sensor_data": true,
  "has_synthetic_device": true,
  "live_latest": {
    "current_weight": 45.5,
    "connection_status": true,
    "timestamp": "2026-05-21T10:30:00+00:00"
  },
  "synthetic_device": {
    "dataset_version": 1,
    "lifecycle_count": 5,
    "created_at": "2026-05-20T00:00:00+00:00"
  },
  "synthetic_rows": {
    "sensor_readings": 1000,
    "feature_rows": 500,
    "refill_events": 5
  },
  "latest_synthetic_reading": {
    "weight": 45.5,
    "is_refill": false,
    "timestamp": "2026-05-21T10:30:00+00:00"
  },
  "latest_feature": {
    "weight": 45.5,
    "weight_delta": -2.3,
    "consumption_per_day": 3.1,
    "rolling_7day_avg_consumption": 3.2,
    "rolling_30day_avg_consumption": 3.0,
    "days_since_refill": 14,
    "session_count_today": 3,
    "idle_drop_rate": 0.001,
    "timestamp": "2026-05-21T10:30:00+00:00"
  }
}
```

---

### 2. Get Gas Usage Stats
```
GET /gas-usage/stats?device_id=DEVICE001&granularity=daily
GET /gas-usage/stats?device_id=DEVICE001&granularity=monthly&year=2026
GET /gas-usage/stats?device_id=DEVICE001&granularity=yearly
```

**Query Parameters:**
- `device_id` - Device ID
- `granularity` - "daily", "monthly", or "yearly"
- `year` (optional) - Filter by year
- `month` (optional) - Filter by month (with daily granularity)

**Response (200):**
```json
[
  {
    "period": "2026-05-21",
    "usage": 2.3
  },
  {
    "period": "2026-05-20",
    "usage": 3.1
  }
]
```

---

### 3. Get Cylinder Remaining Weight
```
GET /cylinder/remaining-weight?device_id=DEVICE001
```

**Response (200):**
```json
{
  "device_id": "DEVICE001",
  "remaining_weight": 45.5,
  "previous_weight": 47.8,
  "current_drop_rate": 0.0023,
  "last_update": "2026-05-21T10:30:00+00:00",
  "connection_status": true,
  "error": false
}
```

**Error Response:**
```json
{
  "device_id": "DEVICE001",
  "message": "No sensor readings found for this device",
  "error": true
}
```

---

### 4. Get Gas Usage Features
```
GET /gas-usage/features?device_id=DEVICE001
GET /gas-usage/features?device_id=DEVICE001&start=2026-05-01T00:00:00&end=2026-05-31T23:59:59
```

**Query Parameters:**
- `device_id` - Device ID
- `start` (optional) - Start datetime (ISO format)
- `end` (optional) - End datetime (ISO format)

**Response (200):**
```json
[
  {
    "timestamp": "2026-05-21",
    "weight": 45.5,
    "consumption_per_day": 3.1,
    "rolling_7day_avg": 3.2,
    "rolling_30day_avg": 3.0
  }
]
```

---

### 5. Get Depletion Prediction
```
GET /gas-usage/depletion-prediction?device_id=DEVICE001
```

**Response (200):**
```json
{
  "device_id": "DEVICE001",
  "features": {
    "current_weight": 45.5,
    "rolling_7day_avg_consumption": 3.2,
    "consumption_per_day": 3.1
  },
  "rule_based_days_remaining": 14.2,
  "ml_days_remaining": 13.8,
  "model_loaded": true
}
```

---

### 6. Train Clustering Model
```
POST /gas-usage/clustering/train
POST /gas-usage/clustering/train?k=3
```

**Query Parameters:**
- `k` (optional) - Number of clusters (auto-calculated if not provided)

**Response (200):**
```json
{
  "model_trained": true,
  "num_clusters": 3,
  "total_devices": 25,
  "profiles": { /* cluster profiles */ }
}
```

---

### 7. Get Cluster Assignments
```
GET /gas-usage/clustering/assignments
```

**Response (200):**
```json
{
  "total_devices": 25,
  "num_clusters": 3,
  "assignments": [
    {
      "device_id": "DEVICE001",
      "cluster": 0
    }
  ]
}
```

---

### 8. Get Cluster Profiles
```
GET /gas-usage/clustering/profiles
```

**Response (200):**
```json
{
  "total_devices": 25,
  "num_clusters": 3,
  "profiles": {
    "0": {
      "device_count": 8,
      "avg_daily_consumption_kg": 2.5,
      "median_peak_hour": 12,
      "avg_weekend_multiplier": 1.2,
      "avg_sessions_per_day": 3.5,
      "avg_cylinder_lifetime_days": 15.2,
      "refill_frequency_estimate_days": 4.3
    }
  }
}
```

---

### 9. Get Cluster Recommendations
```
GET /gas-usage/clustering/recommendations?cluster_id=0
```

**Response (200):**
```json
{
  "cluster_id": 0,
  "recommendations": [
    "Consider setting up automatic refill for high consumption patterns",
    "Peak usage occurs around noon - plan deliveries accordingly"
  ]
}
```

---

### 10. Benchmark Device Against Cluster
```
GET /gas-usage/clustering/benchmark/{device_id}
```

**Response (200):**
```json
{
  "device_id": "DEVICE001",
  "cluster": 0,
  "cluster_peers": 8,
  "device_features": {
    "avg_daily_consumption": 2.8,
    "peak_hour": 12,
    "weekend_multiplier": 1.1,
    "session_count_per_day": 3.2,
    "cylinder_lifetime_days": 14.5
  },
  "cluster_average": {
    "avg_daily_consumption": 2.5,
    "peak_hour": 12,
    "weekend_multiplier": 1.2,
    "session_count_per_day": 3.5,
    "cylinder_lifetime_days": 15.2
  },
  "percentile_rank": {
    "avg_daily_consumption": 65.0,
    "session_count_per_day": 55.0
  },
  "recommendation": { /* cluster recommendations */ }
}
```

---

## Sensor API

**Prefix:** `/api/v1/sensor`

### Ingest Sensor Reading
```
POST /readings
```

**Request Body:**
```json
{
  "device_id": "DEVICE001",
  "weight": 45.5,
  "user_id": "abc123def456",
  "connection_status": true,
  "timestamp": "2026-05-21T10:30:00+00:00"
}
```

**Response (201):**
```json
{
  "device_id": "DEVICE001",
  "saved_at": "2026-05-21T10:30:00+00:00",
  "current_weight": 45.5,
  "leak_detected": false,
  "drop_rate_kg_per_sec": 0.0023,
  "leak_threshold_kg_per_sec": 0.005,
  "alert_id": null
}
```

**Alert Response (if leak detected):**
```json
{
  "device_id": "DEVICE001",
  "saved_at": "2026-05-21T10:30:00+00:00",
  "current_weight": 45.5,
  "leak_detected": true,
  "drop_rate_kg_per_sec": 0.008,
  "leak_threshold_kg_per_sec": 0.005,
  "alert_id": "ALERT-ABC123"
}
```

**Error Responses:**
- `400` - user_id required for first reading

**Important:** Sensor readings trigger:
1. **Leak Detection** - If drop rate exceeds 0.005 kg/s
2. **Threshold Alert** - If gas level falls below user's threshold_limit
3. **Refill Reminder** - Automatic email notification

---

## Settings API

**Prefix:** `/api/v1/settings`

### Get User Settings
```
GET /{user_id}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "name": "John Doe",
  "address": "123 Street Name, Area",
  "phone_no": "+919876543210",
  "state": "Karnataka",
  "district": "Bangalore",
  "threshold_limit": 1.0,
  "auto_delivery": false
}
```

**Error Responses:**
- `403` - Not authorized for this user
- `404` - User not found

---

### Update User Settings
```
PATCH /{user_id}
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "address": "New Address",
  "phone_no": "+919876543210",
  "state": "Karnataka",
  "district": "Bangalore",
  "threshold_limit": 2.5,
  "auto_delivery": true
}
```

**Response (200):**
```json
{
  "name": "John Updated",
  "address": "New Address",
  "phone_no": "+919876543210",
  "state": "Karnataka",
  "district": "Bangalore",
  "threshold_limit": 2.5,
  "auto_delivery": true
}
```

**Error Responses:**
- `403` - Not authorized
- `404` - User not found
- `400` - No fields to update

---

## Complaints API

**Prefix:** `/api/v1/complaints`

### 1. Create Complaint
```
POST /
Authorization: Bearer <token>
Status Code: 201 Created
```

**Request Body:**
```json
{
  "category": "Delivery Issue",
  "description": "Gas cylinder delivery was delayed by 2 hours on scheduled date",
  "consumer_name": "John Doe",
  "consumer_email": "john@example.com",
  "consumer_phone": "+919876543210"
}
```

**Response (201):**
```json
{
  "complaint_id": "CMP-ABC12345",
  "status": "Open",
  "message": "Complaint submitted successfully"
}
```

---

### 2. List All Complaints
```
GET /
GET /?distributor_id=DIST001
GET /?status_filter=Open
```

**Query Parameters:**
- `distributor_id` (optional) - Filter by distributor
- `status_filter` (optional) - Filter: "Open", "In Progress", "Resolved", "Closed"

**Response (200):**
```json
[
  {
    "id": "CMP-ABC12345",
    "complaint_id": "CMP-ABC12345",
    "distributor_id": "DIST001",
    "date": "2026-05-21",
    "category": "Delivery Issue",
    "description": "Gas cylinder delivery was delayed...",
    "status": "Open",
    "consumer_name": "John Doe",
    "consumer_phone": "+919876543210",
    "consumer_email": "john@example.com",
    "remark": ""
  }
]
```

---

### 3. Get Specific Complaint
```
GET /{complaint_id}
```

**Response (200):** Single complaint object

---

### 4. Update Complaint Status
```
PUT /{complaint_id}
```

**Request Body:**
```json
{
  "status": "In Progress",
  "remark": "Investigating the delay issue",
  "consumer_email": "john@example.com",
  "consumer_name": "John Doe"
}
```

**Response (200):**
```json
{
  "complaint_id": "CMP-ABC12345",
  "status": "In Progress",
  "remark": "Investigating the delay issue",
  "updated_at": "2026-05-21T10:35:00+00:00",
  "message": "Complaint updated successfully"
}
```

**Valid Status Values:** "Open", "In Progress", "Resolved", "Closed"

---

### 5. Get Distributor's Complaints
```
GET /distributor/{distributor_id}
GET /distributor/{distributor_id}?status_filter=Open
```

**Response (200):** Array of complaints for distributor

---

### 6. Get User's Complaints
```
GET /user/{user_id}
Authorization: Bearer <token>
```

**Response (200):** Array of complaints filed by user

**Error Responses:**
- `403` - Can only view your own complaints
- `404` - User not found

---

## Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource successfully created |
| `400` | Bad Request - Invalid parameters or validation failed |
| `401` | Unauthorized - Invalid/missing authentication token |
| `403` | Forbidden - User doesn't have permission |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists (duplicate) |
| `500` | Internal Server Error - Backend error |

### Error Response Examples

**Validation Error (400):**
```json
{
  "detail": "Passwords do not match"
}
```

**Authentication Error (401):**
```json
{
  "detail": "Invalid email or password"
}
```

**Permission Error (403):**
```json
{
  "detail": "Not authorized for this user"
}
```

**Not Found Error (404):**
```json
{
  "detail": "User not found"
}
```

**Conflict Error (409):**
```json
{
  "detail": "User already exists"
}
```

---

## Data Models

### User Model
```json
{
  "user_id": "string(20)",
  "email": "string(120) - unique",
  "password_hash": "string(255)",
  "name": "string(30)",
  "address": "string(100)",
  "phone_no": "string(15) - unique",
  "consumer_no": "string(20) - unique",
  "distributor_name": "string - FK to Distributor",
  "state": "string(20)",
  "district": "string(20)",
  "device_id": "string(30) - unique, nullable",
  "gas": "integer - default: 30",
  "threshold_limit": "float - default: 1.0",
  "auto_delivery": "boolean - default: false"
}
```

### Distributor Model
```json
{
  "id": "string(20)",
  "name": "string(30)",
  "email": "string(120) - unique",
  "password_hash": "string(255)",
  "address": "string(100)",
  "phone_no": "string(15) - unique",
  "state": "string(20)",
  "district": "string(20)"
}
```

### Sensor Reading Model
```json
{
  "sensor_id": "string(30) - device_id",
  "timestamp": "datetime - UTC",
  "current_weight": "float - kg",
  "connection_status": "boolean, nullable",
  "user_id": "string(20) - FK to User"
}
```

### Refill Request Model
```json
{
  "request_id": "string(20)",
  "user_id": "string(20) - FK to User",
  "requested_status": "string - pending/approved/rejected",
  "requested_date": "datetime - UTC",
  "approved_by": "string(20) - FK to Distributor, nullable",
  "approved_date": "datetime - UTC, nullable"
}
```

### Complaint Model
```json
{
  "complaint_id": "string(20)",
  "user_id": "string(20) - FK to User",
  "distributor_id": "string(20) - FK to Distributor",
  "category": "string(50)",
  "description": "string(500)",
  "status": "string - Open/In Progress/Resolved/Closed",
  "remark": "string(500), nullable",
  "consumer_name": "string(100)",
  "consumer_email": "string(120)",
  "consumer_phone": "string(15)",
  "created_at": "datetime - UTC",
  "updated_at": "datetime - UTC, nullable"
}
```

### Alert Log Model
```json
{
  "alert_id": "string(30)",
  "alert_type": "string(50)",
  "delivery_status": "boolean, nullable",
  "time_stamp": "datetime - UTC",
  "user_id": "string(20) - FK to User"
}
```

---

## Critical Implementation Notes for Frontend

### 1. **Authentication Flow**
- Store JWT token in localStorage or sessionStorage
- Always include token in `Authorization` header for protected routes
- On token expiration (401), prompt user to re-login
- Tokens contain `user_id`, `email`, and `role`

### 2. **Refill Request Workflow**
```
User Request Refill → Distributor Reviews → Distributor Approves/Rejects → Email Notification → User Sees History
```
- 25-day wait period between refill requests
- Only distributor can approve/reject
- System sends emails for all status changes

### 3. **Sensor Data Flow**
```
IoT Sensor/Device → POST /sensor/readings → Leak Detection → Threshold Check → Alert Email
```
- Sensor readings create leak detection alerts
- Threshold alerts trigger automatic emails
- Device ID must be registered to a user

### 4. **Dashboard Calculations**
- **Remaining Gas:** Latest sensor reading weight
- **Usage Today:** Max weight - Min weight for today
- **Average Daily Usage:** Calculated from 30-day rolling data
- **Predicted Empty Date:** Current weight ÷ Average daily usage

### 5. **Complaint Workflow**
```
User Files Complaint → Gets Confirmation Email → Distributor Reviews → Updates Status → User Gets Status Email
```
- Valid statuses: Open → In Progress → Resolved → Closed
- Email notifications on complaint creation and status updates
- Distributor can view only their complaints

### 6. **Clustering & ML Features**
- Train clustering model with POST `/gas-usage/clustering/train`
- Models persist as `.joblib` files
- Used for device benchmarking and recommendations
- Optional k parameter for custom cluster count

### 7. **Email Notifications Sent For:**
- User registration (welcome email)
- Refill request approval/rejection
- Leak detection alert
- Gas threshold alert (below threshold_limit)
- Complaint creation confirmation
- Complaint status updates
- Refill reminder

### 8. **IMPORTANT - Local vs Remote:**
- Replace `localhost` with actual backend URL when deploying
- Update CORS origins in main.py for production domains
- Ensure frontend URL is in CORS allowed_origins list
- Use environment variables for API base URL

### 9. **Query Parameter Encoding**
- Date parameters: ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- Special characters in filter values: URL encode
- Nullable parameters: omit from URL if not needed

### 10. **Request Validation**
- Email must be valid format
- Phone numbers: +country_code format
- Passwords: 8-20 characters
- Consumer number: unique per distributor
- Device ID: optional but must be unique if provided

---

## Quick Reference - Frontend Integration Checklist

- [ ] Setup JWT token storage and retrieval
- [ ] Create API client with base URL configuration
- [ ] Implement token refresh/re-login on 401
- [ ] Add Authorization header to all protected requests
- [ ] Handle all error status codes (400, 401, 403, 404, 409)
- [ ] Display meaningful error messages from API responses
- [ ] Setup refill workflow with 25-day validation
- [ ] Map sensor readings to dashboard metrics
- [ ] Implement complaint status lifecycle
- [ ] Setup email notification display/handling
- [ ] Configure clustering model training
- [ ] Test CORS with actual frontend URL
- [ ] Use production backend URL in deployment
- [ ] Implement loading states and spinners
- [ ] Add timestamp formatting for all datetime fields
- [ ] Validate all form inputs before sending to API

---

**Last Updated:** May 21, 2026  
**API Version:** 1.0  
**Backend Framework:** FastAPI with SQLAlchemy ORM  
**Database:** PostgreSQL with Async Support
