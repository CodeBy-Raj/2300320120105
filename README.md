# Backend Track Submission

Repository Name: 2300320120105

## Project Structure

* logging_middleware
* vehicle_maintenance_scheduler
* notification_app_be
* notification_system_design.md
* screenshots

## Components

### Logging Middleware

Reusable logging package that:

* Registers with the evaluation server
* Authenticates using client credentials
* Generates access tokens
* Sends structured logs to the logging API

### Vehicle Maintenance Scheduler

Backend solution that:

* Fetches depot and vehicle data
* Performs optimization using the 0/1 Knapsack approach
* Generates maintenance schedules
* Uses logging middleware for observability

### Notification Backend

Backend implementation for notification processing that:

* Fetches notifications
* Prioritizes notifications based on category and recency
* Generates the top 10 notifications
* Uses logging middleware throughout the workflow

### System Design

Detailed answers for:

* Stage 1
* Stage 2
* Stage 3
* Stage 4
* Stage 5
* Stage 6

are provided in:

notification_system_design.md

### Screenshots

Execution screenshots are available under:

screenshots/

including:

* Authentication API
* Logging API
* Depots API
* Vehicles API
* Notifications API
* Scheduler Output
* Priority Inbox Output
