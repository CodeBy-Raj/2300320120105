# Stage 1

## Core Actions

1. Create Notification
2. Get Notifications
3. Get Unread Notifications
4. Mark Notification as Read
5. Delete Notification
6. Real-Time Notification Delivery

## REST APIs

POST /notifications

Request:
{
  "studentId": 1042,
  "type": "Placement",
  "message": "Microsoft Hiring"
}

Response:
{
  "notificationId": "uuid",
  "status": "created"
}

GET /notifications?studentId=1042

Response:
[
  {
    "id": "uuid",
    "type": "Placement",
    "message": "Microsoft Hiring",
    "isRead": false,
    "createdAt": "2026-06-09T10:00:00Z"
  }
]

PATCH /notifications/:id/read

Response:
{
  "status": "success"
}

DELETE /notifications/:id

Response:
{
  "status": "deleted"
}

## Real Time Notifications

WebSocket connection between frontend and backend.

When notification is created:
1. Save in database
2. Publish event
3. Push instantly through WebSocket

# Stage 2

## Database Choice

PostgreSQL

Reasons:
- ACID compliance
- Strong indexing
- Reliable transactions
- Supports large datasets

## Tables

Students

studentId BIGINT PRIMARY KEY
name VARCHAR(255)
email VARCHAR(255)

Notifications

notificationId UUID PRIMARY KEY
studentId BIGINT
notificationType ENUM
message TEXT
isRead BOOLEAN
createdAt TIMESTAMP

## Example Queries

Create Notification

INSERT INTO notifications(...)

Get Notifications

SELECT * FROM notifications
WHERE studentId = ?

Unread Notifications

SELECT * FROM notifications
WHERE studentId = ?
AND isRead = false
ORDER BY createdAt DESC;

# Stage 3

The query is logically correct.

Problem:

SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;

Without indexes the DB performs a table scan.

For 5,000,000 notifications this becomes expensive.

Solution:

CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);

Complexity:

Before:
O(N)

After:
O(log N)

Adding indexes on every column is not recommended because:

1. Increased storage
2. Slower inserts
3. Slower updates
4. Many indexes are never used

Placement Query:

SELECT DISTINCT studentID
FROM notifications
WHERE notificationType='Placement'
AND createdAt >= NOW() - INTERVAL '7 DAYS';

# Stage 4

Problem:
Database hit on every page load.

Solutions:

1. Redis Cache

Advantages:
- Fast reads
- Reduced DB load

Tradeoff:
- Cache invalidation complexity

2. Pagination

Advantages:
- Smaller query results

Tradeoff:
- Additional API complexity

3. WebSocket Push

Advantages:
- Real-time updates
- Fewer repeated fetches

Tradeoff:
- Persistent connections

4. Read Replicas

Advantages:
- Distribute load

Tradeoff:
- Infrastructure cost

# Stage 5

Problems:

1. Sequential execution
2. Slow processing
3. Failure midway
4. No retry mechanism

Better Design:

HR
 ↓
Message Queue
 ↓
Worker Pool
 ↓
Email Service
 ↓
Notification Service

Pseudo Code

function notify_all(student_ids, message){

   enqueue(student_ids, message)

}

worker(){

   while(queue not empty){

      task = dequeue()

      save_to_db(task)

      send_email(task)

      push_to_app(task)

      retry_on_failure(task)

   }

}

Database save and email should not be tightly coupled.

Reason:
Email may fail while DB succeeds.

Queue-based retry ensures reliability.

# Stage 6

## Approach

Priority is determined using:

Placement > Result > Event

Weights:

Placement = 3
Result = 2
Event = 1

Notifications are sorted by:

1. Weight
2. Timestamp (Descending)

The first 10 notifications after sorting are returned.

## Complexity

Sorting:
O(N log N)

Returning Top 10:
O(10)

Overall:
O(N log N)

## Future Optimization

For large datasets or continuously arriving notifications:

A Min Heap of size 10 can be maintained.

Insertion:
O(log 10)

This avoids re-sorting the complete dataset whenever a new notification arrives.