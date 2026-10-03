# Job API Testing Labs

This repository contains three progressive labs for learning and practicing **API testing with Vitest and Supertest**.

The labs use the same Job API across three different backend versions. Each version introduces a new testing concept, so you should complete the labs **in order**.

By the end of the three labs, you will have practiced:

* Writing unit-style mock tests with Vitest
* Testing HTTP APIs with Supertest
* Testing Job CRUD endpoints
* Testing user signup and login
* Testing authentication
* Testing protected API routes
* Testing both successful and unsuccessful requests
* Running tests in watch mode
* Generating test coverage reports
* Using `cross-env` for environment variables

---

## Labs Overview

| Lab       | Folder               | Main Focus                            |
| --------- | -------------------- | ------------------------------------- |
| **Lab 1** | `jobs-api1-no-auth`  | Public Job CRUD endpoints             |
| **Lab 2** | `jobs-api2-auth`     | Job API + user signup/login           |
| **Lab 3** | `jobs-api3-protect`  | Authentication + protected Job routes |

The labs build on each other:

```text
Lab 1
Public Job CRUD
        │
        ▼
Lab 2
Public Job CRUD
+ User Signup/Login
        │
        ▼
Lab 3
Public Job Read
+ User Signup/Login
+ Protected Job Create/Update/Delete
+ Watch Mode
+ Coverage
```

---

# Repository Setup

Clone the repository:

```bash
git clone https://github.com/tx00-resources-en/API-Testing-jobs
```

Then enter the repository:

```bash
cd API-testing-jobs
```

Each lab is contained in its own folder.

---

# Lab 1 — Jobs API Without Authentication

## Folder

```text
jobs-api1-no-auth
```

## What you will learn

The first lab introduces the fundamentals of API testing using **Vitest** and **Supertest**.

This version of the backend has:

* Public Job endpoints
* Job CRUD operations
* No user routes
* No authentication
* No protected routes

You will learn how to test an API endpoint and verify its response.

## Main endpoints

The Job API provides operations for:

```text
GET     /jobs
GET     /jobs/:id
POST    /jobs
PUT     /jobs/:id
DELETE  /jobs/:id
```

The exact routes and request/response formats are documented in the lab instructions.

## What you will do

Work through:

```text
jobs-api1-no-auth/api-testing.md
```

The lab guides you through the tasks step by step.

You will:

1. Complete the project setup.
2. Learn how the testing environment works.
3. Write a basic mock test.
4. Run the test with Vitest.
5. Test the Job API.
6. Test the endpoints one at a time.
7. Verify both successful and unsuccessful API responses.

After each task, the lab provides a sample solution that you can expand and/or compare with your own implementation.

---

# Lab 2 — Jobs API With Authentication

## Folder

```text
jobs-api2-auth
```

## What you will learn

The second lab introduces **user authentication**.

The Job endpoints are still public in this version, but the backend now also provides user-related endpoints.

You will test:

* Job CRUD endpoints
* User signup
* User login

## Authentication endpoints

The API includes user operations such as:

```text
POST    /users/signup
POST    /users/login
```

The exact routes, request bodies, and responses are documented in the lab.

## Important

Authentication is introduced in this lab, but **Job routes are still public**.

That means you do not yet need to send an authentication token when testing Job operations.

## What you will do

Work through:

```text
jobs-api2-auth/api-testing.md
```

You will:

1. Set up the second backend.
2. Repeat the Job API tests from Lab 1.
3. Add tests for user signup.
4. Add tests for user login.
5. Test successful authentication.
6. Test invalid authentication requests.
7. Practice checking authentication-related responses.

This lab prepares you for the protected routes introduced in Lab 3.

---

# Lab 3 — Protected Job API

## Folder

```text
jobs-api3-protect
```

## What you will learn

The third lab combines the concepts from the first two labs and introduces **protected API routes**.

The API now distinguishes between:

### Public operations

Users can read Jobs without authentication:

```text
GET     /jobs
GET     /jobs/:id
```

### Protected operations

Authentication is required to modify Jobs:

```text
POST    /jobs
PUT     /jobs/:id
DELETE  /jobs/:id
```

The exact routes and authentication mechanism are documented in the lab.

## Authentication

You will first create a user and log in.

The login response provides the authentication information needed to access protected endpoints.

Your tests will then verify that:

* An authenticated user can perform protected operations.
* An unauthenticated user cannot perform protected operations.
* Public Job read operations continue to work without authentication.

## Additional concepts

Lab 3 also introduces:

* `cross-env`
* Vitest watch mode
* Test coverage

You will learn how to run tests repeatedly while developing and how to measure which parts of the code are covered by your tests.

## What you will do

Work through:

```text
jobs-api3-protect/api-testing.md
```

You will:

1. Set up the third backend.
2. Test user signup.
3. Test user login.
4. Test public Job read endpoints.
5. Test protected Job creation.
6. Test protected Job updates.
7. Test protected Job deletion.
8. Test requests without authentication.
9. Run tests in watch mode.
10. Generate a test coverage report.

---

# Recommended Order

Complete the labs in this order:

## 1. Lab 1

Open:

```text
jobs-api1-no-auth/api-testing.md
```

Start by completing the setup and then work through the Job endpoint tests.

---

## 2. Lab 2

After completing Lab 1, open:

```text
jobs-api2-auth/api-testing.md
```

Repeat the Job tests and then add the User signup and login tests.

---

## 3. Lab 3

Finally, open:

```text
jobs-api3-protect/api-testing.md
```

Test authentication and then use authentication to test the protected Job routes.

---

# Testing Tools

## Vitest

**Vitest** is the test framework used to organize and execute the tests.

You will use it to:

* Define test cases
* Group related tests
* Make assertions
* Run the test suite
* Run tests in watch mode
* Generate coverage information

Typical commands may look like:

```bash
npm test
```

or:

```bash
npx vitest
```

Use the commands provided by the individual lab because the available scripts can differ between the three projects.

---

## Supertest

**Supertest** is used to send HTTP requests to the backend from your tests.

For example, a test can make a request similar to:

```javascript
await request(app)
  .get('/jobs')
```

You can then check things such as:

* HTTP status code
* Response body
* Response properties
* Error messages

---

# How the Three Labs Build on Each Other

The progression is intentional.

### Lab 1 — API testing fundamentals

```text
Vitest
   +
Supertest
   +
Public Job CRUD
```

### Lab 2 — Authentication testing

```text
Vitest
   +
Supertest
   +
Job CRUD
   +
Signup/Login
```

### Lab 3 — Authorization and protected routes

```text
Vitest
   +
Supertest
   +
Signup/Login
   +
Public Job reads
   +
Protected Job writes
   +
Watch mode
   +
Coverage
```

Each lab introduces one additional concept rather than presenting the complete application and test suite all at once.

---

# Testing Strategy

Throughout the labs, pay attention to the different types of cases you are testing.

For a successful request, you might check:

```text
HTTP status
+
response body
+
expected data
```

For an unsuccessful request, you might check:

```text
HTTP status
+
error response
+
expected error message
```

For protected routes, you should also consider:

```text
Authenticated request
        vs.
Unauthenticated request
```

This helps ensure that the API behaves correctly not only when requests are valid, but also when requests are invalid or unauthorized.

---

# Sample Solutions

Each lab asks you to write the tests yourself before looking at the solution.

After each task, a sample solution is provided in a collapsible section inside the lab instructions.

A recommended workflow is:

1. Read the task.
2. Write the test yourself.
3. Run the test.
4. Fix any failures.
5. Compare your solution with the sample solution.
6. Continue to the next task.

The goal is to understand **why the test works**, not simply to copy the sample solution.

---

# Additional Theory

For additional explanations of the testing concepts used throughout the labs, see: [testing-theory.md](./testing-theory.md)

This document provides more background on the tools, testing concepts, and decisions used in the exercises.

It can be read alongside the labs or after completing them.

---

# Complete Learning Path

The complete recommended path is:

```text
1. Clone the repository
        │
        ▼
2. Complete jobs-api1-no-auth
        │
        ├── Setup
        ├── Mock test
        └── Job API tests
        │
        ▼
3. Complete jobs-api2-auth
        │
        ├── Job API tests
        ├── User signup tests
        └── User login tests
        │
        ▼
4. Complete jobs-api3-protect
        │
        ├── Signup/login tests
        ├── Public Job tests
        ├── Protected Job tests
        ├── Watch mode
        └── Coverage
        │
        ▼
5. Read testing-theory.md
```

By completing all three labs, you will have progressed from testing a simple public REST API to testing an API with authentication and authorization.

