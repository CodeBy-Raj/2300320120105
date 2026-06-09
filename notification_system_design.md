# Stage 1

## Core Actions Supported

1. Create Notification
2. Get All Notifications for a Student
3. Get Unread Notifications
4. Mark Notification as Read
5. Delete Notification
6. Deliver Real-Time Notifications

---

## Create Notification

### Endpoint

POST /notifications

### Headers

Authorization: Bearer <token>

Content-Type: application/json

### Request

```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "Microsoft Hiring"
}
```

### Response

```json
{
  "notificationId": "uuid",
  "status": "created"
}
```

---

## Get Notifications

### Endpoint

GET /notifications?studentId=1042

### Headers

Authorization: Bearer <token>

### Response

```json
[
  {
    "id": "uuid",
    "type": "Placement",
    "message": "Microsoft Hiring",
    "isRead": false,
    "createdAt": "2026-06-09T10:00:00Z"
  }
]
```

---

## Get Unread Notifications

### Endpoint

GET /notifications/unread?studentId=1042

### Headers

Authorization: Bearer <token>

### Response

```json
[
  {
    "id": "uuid",
    "type": "Placement",
    "message": "Microsoft Hiring"
  }
]
```

---

## Mark Notification as Read

### Endpoint

PATCH /notifications/:id/read

### Headers

Authorization: Bearer <token>

### Response

```json
{
  "status": "success"
}
```

---

## Delete Notification

### Endpoint

DELETE /notifications/:id

### Headers

Authorization: Bearer <token>

### Response

```json
{
  "status": "deleted"
}
```

---

## Real-Time Notification Design

A WebSocket-based architecture is proposed.

Flow:

1. Notification created by admin/service
2. Notification stored in database
3. Event published
4. WebSocket server pushes notification to connected students
5. Student receives notification instantly

Benefits:

* Real-time updates
* Reduced polling
* Better user experience

---

# Stage 2

## Database Choice

PostgreSQL

### Reasons

* ACID compliance
* Strong consistency
* Mature indexing support
* Reliable transactions
* Excellent support for large datasets

---

## Student Table

```sql
CREATE TABLE students (
    studentId BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);
```

---

## Notification Table

```sql
CREATE TABLE notifications (
    notificationId UUID PRIMARY KEY,
    studentId BIGINT NOT NULL,
    notificationType VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(studentId)
    REFERENCES students(studentId)
);
```

---

## Create Notification

```sql
INSERT INTO notifications(
notificationId,
studentId,
notificationType,
message
)
VALUES(
gen_random_uuid(),
1042,
'Placement',
'Microsoft Hiring'
);
```

---

## Get Notifications

```sql
SELECT *
FROM notifications
WHERE studentId = 1042
ORDER BY createdAt DESC;
```

---

## Get Unread Notifications

```sql
SELECT *
FROM notifications
WHERE studentId = 1042
AND isRead = FALSE
ORDER BY createdAt DESC;
```

---

## Mark Notification Read

```sql
UPDATE notifications
SET isRead = TRUE
WHERE notificationId = 'uuid';
```

---

## Delete Notification

```sql
DELETE
FROM notifications
WHERE notificationId = 'uuid';
```

---

## Scaling Challenges

As notification volume grows:

* Slow queries
* Increased storage
* Higher write traffic
* Longer response times

Solutions:

* Proper indexing
* Redis caching
* Read replicas
* Partitioning
* Archiving old records

---

# Stage 3

## Existing Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

---

## Is It Correct?

Yes.

The query correctly returns unread notifications of a specific student ordered by latest notification first.

---

## Why Is It Slow?

Current dataset:

* 50,000 students
* 5,000,000 notifications

Without indexes the database performs a full table scan.

This causes:

* High CPU usage
* Large disk reads
* Slow response times

---

## Recommended Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(
studentId,
isRead,
createdAt DESC
);
```

---

## Complexity

Before Index:

O(N)

After Index:

O(log N)

---

## Should We Index Every Column?

No.

Problems:

1. Increased storage
2. Slower inserts
3. Slower updates
4. Additional maintenance cost
5. Many indexes may never be used

Indexes should be created only for frequently queried columns.

---

## Placement Notifications Query

```sql
SELECT DISTINCT studentId
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 DAYS';
```

---

# Stage 4

## Problem

Every page load fetches notifications directly from the database.

This causes:

* Increased DB load
* Higher latency
* Poor user experience

---

## Solution 1: Redis Cache

Flow:

User → Redis → Database

Advantages:

* Very fast reads
* Reduced DB traffic

Tradeoff:

* Cache invalidation complexity

---

## Solution 2: Pagination

Fetch notifications in chunks.

Advantages:

* Smaller payloads
* Faster responses

Tradeoff:

* Additional API complexity

---

## Solution 3: WebSockets

Push notifications only when changes occur.

Advantages:

* Real-time experience
* Eliminates frequent polling

Tradeoff:

* Persistent connections required

---

## Solution 4: Read Replicas

Use separate databases for read traffic.

Advantages:

* Better scalability

Tradeoff:

* Additional infrastructure cost

---

## Recommended Combination

1. Redis Cache
2. WebSockets
3. Pagination
4. Read Replicas

---

# Stage 5

## Problems In Existing Implementation

```python
for student_id in student_ids:
    send_email()
    save_to_db()
    push_to_app()
```

Problems:

1. Sequential processing
2. Slow execution
3. No retries
4. Partial failures
5. Poor scalability

---

## Example Failure

If send_email fails for 200 students:

* Some students receive notifications
* Some students do not
* System becomes inconsistent

---

## Recommended Architecture

HR
↓
Notification Service
↓
RabbitMQ Queue
↓
Worker Pool
↓
Database
↓
Email Service
↓
WebSocket Service

---

## Why Use RabbitMQ?

* Reliable delivery
* Retry support
* Dead Letter Queues
* Horizontal scalability

---

## Revised Pseudocode

```python
function notify_all(student_ids, message):

    enqueue(student_ids, message)

worker():

    while queue_not_empty:

        task = dequeue()

        save_to_db(task)

        send_email(task)

        push_to_app(task)

        if failed:
            retry(task)
```

---

## Should Email And Database Be Coupled?

No.

Reason:

Database write may succeed while email fails.

Keeping them independent allows retries without affecting stored data.

---

# Stage 6

## Priority Inbox Design

Priority Order:

Placement > Result > Event

Weights:

Placement = 3

Result = 2

Event = 1

---

## Priority Calculation

Priority Score is determined using:

1. Notification Weight
2. Recency

Higher weight notifications appear first.

For notifications of the same type, newer notifications appear first.

---

## Current Implementation

The implementation:

1. Assigns weight to each notification type
2. Sorts notifications by:

   * Weight (Descending)
   * Timestamp (Descending)
3. Returns the Top 10 notifications

---

## Complexity

Sorting:

O(N log N)

Returning Top 10:

O(10)

Overall:

O(N log N)

---

## Future Optimization

For continuous notification streams:

Use a Min Heap of size 10.

Advantages:

* O(log 10) insertion
* Constant-size memory
* No need to re-sort all notifications


