# Testing Protected Jobs API Endpoints

In this lab you will add automated **integration tests** to the protected Jobs API with **Vitest** and **Supertest**.

This backend has:

- Public job read routes
- User signup and login
- JWT authentication
- Protected job create, update, and delete routes

You will write the tests step by step. Each endpoint has a task first, then a complete sample solution in a `<details>` block.

-------

## PART 1 - Project & Test Setup

Run commands from `jobs-api/jobs-api3-protected`.

### 1.1 Install test dependencies

```bash
npm install vitest supertest -D
```

Helpful documentation:

- [Vitest guide](https://vitest.dev/guide/)
- [Jest getting started](https://jestjs.io/docs/getting-started)

Vitest uses a Jest-like style, so `describe`, `it`, `expect`, `beforeEach`, `beforeAll`, and `afterAll` will feel familiar.

### 1.2 Add a basic test script

Open `package.json` and start with:

```json
"scripts": {
  "test": "vitest run"
}
```

Later in this lab, after the protected route tests work, you will replace this with the final `cross-env` scripts.

### 1.3 Configure Vitest

Create `vitest.config.mjs`:

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    testTimeout: 20000,
  },
});
```

### 1.4 Verify setup

Create `tests/mock.test.js`:

```js
describe("sanity check", () => {
  it("should confirm 1 + 1 equals 2", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:

```bash
npm test
```

You should see the mock test pass.

### 1.5 Ignore Vitest cache files

Vitest may create a `.vitest/` cache directory. Add this to `.gitignore`:

```text
.vitest/
```

-------

## PART 2 - User Signup & Login Tests

Create this file:

```text
tests/users.test.js
```

### 2.1 Add imports, valid user data, and setup

<details>
<summary>Sample Solution - setup for tests/users.test.js</summary>

```js
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/userModel");

const api = supertest(app);

const validUser = {
  name: "Jane Jobseeker",
  email: "jane.jobseeker@example.com",
  password: "JobSearch123!",
  phone_number: "+358401234567",
  gender: "female",
  date_of_birth: "1995-06-15",
  membership_status: "active",
};

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

</details>

### 2.2 Test `POST /api/users/signup`

Write tests that read like this:

```text
POST /api/users/signup
  when the payload is valid
    should return status 201
    should return an email and token
    should persist the user in the database
  when the payload is invalid
    should return status 400 when required fields are missing
  when the email is already registered
    should return status 400
```

<details>
<summary>Sample Solution - POST /api/users/signup</summary>

```js
describe("POST /api/users/signup", () => {
  describe("when the payload is valid", () => {
    it("should return status 201", async () => {
      await api
        .post("/api/users/signup")
        .send(validUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    });

    it("should return an email and token", async () => {
      const response = await api
        .post("/api/users/signup")
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe(validUser.email);
    });

    it("should persist the user in the database", async () => {
      await api.post("/api/users/signup").send(validUser).expect(201);

      const savedUser = await User.findOne({ email: validUser.email });
      expect(savedUser).not.toBeNull();
      expect(savedUser.name).toBe(validUser.name);
    });
  });

  describe("when the payload is invalid", () => {
    it("should return status 400 when required fields are missing", async () => {
      const response = await api
        .post("/api/users/signup")
        .send({ email: "missing@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Please add all fields");
    });
  });

  describe("when the email is already registered", () => {
    it("should return status 400", async () => {
      await api.post("/api/users/signup").send(validUser).expect(201);

      const response = await api
        .post("/api/users/signup")
        .send({ ...validUser, name: "Another Jobseeker" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "User already exists");
    });
  });
});
```

</details>

### 2.3 Test `POST /api/users/login`

Write tests that read like this:

```text
POST /api/users/login
  when the credentials are valid
    should return status 200
    should return an email and token
  when the credentials are invalid
    should return status 400
```

<details>
<summary>Sample Solution - POST /api/users/login</summary>

```js
describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await api.post("/api/users/signup").send(validUser).expect(201);
  });

  describe("when the credentials are valid", () => {
    it("should return status 200", async () => {
      await api
        .post("/api/users/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    it("should return an email and token", async () => {
      const response = await api
        .post("/api/users/login")
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe(validUser.email);
    });
  });

  describe("when the credentials are invalid", () => {
    it("should return status 400", async () => {
      const response = await api
        .post("/api/users/login")
        .send({
          email: validUser.email,
          password: "WrongPassword!",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });
  });
});
```

</details>

-------

## PART 3 - Protected Job Endpoint Tests

Study the router:

```js
router.get("/", getAllJobs);
router.get("/:jobId", getJobById);

router.use(requireAuth);

router.post("/", createJob);
router.put("/:jobId", updateJob);
router.delete("/:jobId", deleteJob);
```

This means:

- `GET /api/jobs` and `GET /api/jobs/:jobId` are public.
- `POST`, `PUT`, and `DELETE` require a token.

The Job schema requires `user_id`. Do not invent a fake `user_id`. Sign up a user, get a token, and seed jobs through authenticated `POST /api/jobs` calls.

Create this file:

```text
tests/jobs.test.js
```

### 3.1 Add imports, seed data, helper, auth setup, and database setup

<details>
<summary>Sample Solution - setup for tests/jobs.test.js</summary>

```js
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Job = require("../models/jobModel");
const User = require("../models/userModel");

const api = supertest(app);

const userData = {
  name: "Protected Route Tester",
  email: "protected.jobs@example.com",
  password: "JobSearch123!",
  phone_number: "+358409876543",
  gender: "other",
  date_of_birth: "1990-01-20",
  membership_status: "active",
};

const initialJobs = [
  {
    title: "Senior React Developer",
    type: "Full-Time",
    description: "Build frontend features for a growing product team.",
    company: {
      name: "NewTek Solutions",
      contactEmail: "contact@newtek.example",
      contactPhone: "555-555-5555",
    },
  },
  {
    title: "Junior Backend Developer",
    type: "Part-Time",
    description: "Help build and maintain API endpoints.",
    company: {
      name: "Tech Innovators",
      contactEmail: "hr@techinnovators.example",
      contactPhone: "555-555-1234",
    },
  },
];

const jobsInDb = async () => {
  const jobs = await Job.find({});
  return jobs.map((job) => job.toJSON());
};

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  await Job.deleteMany({});

  const signupResponse = await api
    .post("/api/users/signup")
    .send(userData)
    .expect(201);

  token = signupResponse.body.token;
});

beforeEach(async () => {
  await Job.deleteMany({});

  for (const job of initialJobs) {
    await api
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(job)
      .expect(201);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

</details>

### 3.2 Test `GET /api/jobs`

Write tests that read like this:

```text
GET /api/jobs
  should return all jobs
  should return jobs as JSON with status 200
  should include a specific job in the returned list
```

<details>
<summary>Sample Solution - GET /api/jobs</summary>

```js
describe("GET /api/jobs", () => {
  it("should return all jobs", async () => {
    const response = await api.get("/api/jobs").expect(200);

    expect(response.body).toHaveLength(initialJobs.length);
  });

  it("should return jobs as JSON with status 200", async () => {
    await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should include a specific job in the returned list", async () => {
    const response = await api.get("/api/jobs");

    expect(response.body.map((job) => job.title)).toContain(
      "Senior React Developer"
    );
  });
});
```

</details>

### 3.3 Test `GET /api/jobs/:jobId`

Write tests that read like this:

```text
GET /api/jobs/:jobId
  when the id is valid
    should return one job by ID
  when the id is invalid
    should return status 404
```

<details>
<summary>Sample Solution - GET /api/jobs/:jobId</summary>

```js
describe("GET /api/jobs/:jobId", () => {
  describe("when the id is valid", () => {
    it("should return one job by ID", async () => {
      const job = await Job.findOne({ title: "Junior Backend Developer" });

      const response = await api
        .get(`/api/jobs/${job._id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.title).toBe(job.title);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 404", async () => {
      const response = await api.get("/api/jobs/not-a-valid-id").expect(404);

      expect(response.body).toHaveProperty("error", "No such job");
    });
  });
});
```

</details>

### 3.4 Test `POST /api/jobs`

Write tests that read like this:

```text
POST /api/jobs
  when the user is authenticated
    should return status 201
    should persist the new job with a user_id
  when the user is not authenticated
    should return status 401
    should not increase the number of jobs in the database
```

<details>
<summary>Sample Solution - POST /api/jobs</summary>

```js
describe("POST /api/jobs", () => {
  describe("when the user is authenticated", () => {
    it("should return status 201", async () => {
      const newJob = {
        title: "DevOps Engineer",
        type: "Contract",
        description: "Support deployment pipelines and cloud infrastructure.",
        company: {
          name: "Cloud Solutions",
          contactEmail: "jobs@cloud.example",
          contactPhone: "555-555-6789",
        },
      };

      await api
        .post("/api/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send(newJob)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    });

    it("should persist the new job with a user_id", async () => {
      const newJob = {
        title: "DevOps Engineer",
        type: "Contract",
        description: "Support deployment pipelines and cloud infrastructure.",
        company: {
          name: "Cloud Solutions",
          contactEmail: "jobs@cloud.example",
          contactPhone: "555-555-6789",
        },
      };

      const response = await api
        .post("/api/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send(newJob)
        .expect(201);

      expect(response.body.title).toBe(newJob.title);
      expect(response.body).toHaveProperty("user_id");

      const jobsAtEnd = await jobsInDb();
      expect(jobsAtEnd).toHaveLength(initialJobs.length + 1);
    });
  });

  describe("when the user is not authenticated", () => {
    it("should return status 401", async () => {
      await api.post("/api/jobs").send(initialJobs[0]).expect(401);
    });

    it("should not increase the number of jobs in the database", async () => {
      await api.post("/api/jobs").send(initialJobs[0]).expect(401);

      const jobsAtEnd = await jobsInDb();
      expect(jobsAtEnd).toHaveLength(initialJobs.length);
    });
  });
});
```

</details>

### 3.5 Test `PUT /api/jobs/:jobId`

Write tests that read like this:

```text
PUT /api/jobs/:jobId
  when the user is authenticated
    should return status 200
    should persist the updated fields in the database
  when the user is not authenticated
    should return status 401
  when the id is invalid
    should return status 404
```

<details>
<summary>Sample Solution - PUT /api/jobs/:jobId</summary>

```js
describe("PUT /api/jobs/:jobId", () => {
  describe("when the user is authenticated", () => {
    it("should return status 200", async () => {
      const job = await Job.findOne({ title: "Senior React Developer" });

      await api
        .put(`/api/jobs/${job._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ type: "Remote", description: "Updated job description." })
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    it("should persist the updated fields in the database", async () => {
      const job = await Job.findOne({ title: "Senior React Developer" });

      await api
        .put(`/api/jobs/${job._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ type: "Remote", description: "Updated job description." })
        .expect(200);

      const updatedJob = await Job.findById(job._id);
      expect(updatedJob.type).toBe("Remote");
      expect(updatedJob.description).toBe("Updated job description.");
    });
  });

  describe("when the user is not authenticated", () => {
    it("should return status 401", async () => {
      const job = await Job.findOne({ title: "Senior React Developer" });

      await api
        .put(`/api/jobs/${job._id}`)
        .send({ type: "No Auth Update" })
        .expect(401);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 404", async () => {
      const response = await api
        .put("/api/jobs/not-a-valid-id")
        .set("Authorization", `Bearer ${token}`)
        .send({ type: "Invalid" })
        .expect(404);

      expect(response.body).toHaveProperty("error", "No such job");
    });
  });
});
```

</details>

### 3.6 Test `DELETE /api/jobs/:jobId`

Write tests that read like this:

```text
DELETE /api/jobs/:jobId
  when the user is authenticated
    should return status 204
    should remove the job from the database
  when the user is not authenticated
    should return status 401
  when the id is invalid
    should return status 404
```

<details>
<summary>Sample Solution - DELETE /api/jobs/:jobId</summary>

```js
describe("DELETE /api/jobs/:jobId", () => {
  describe("when the user is authenticated", () => {
    it("should return status 204", async () => {
      const job = await Job.findOne({ title: "Senior React Developer" });

      await api
        .delete(`/api/jobs/${job._id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
    });

    it("should remove the job from the database", async () => {
      const jobsAtStart = await jobsInDb();
      const jobToDelete = jobsAtStart[0];

      await api
        .delete(`/api/jobs/${jobToDelete.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const jobsAtEnd = await jobsInDb();
      expect(jobsAtEnd).toHaveLength(jobsAtStart.length - 1);
      expect(jobsAtEnd.map((job) => job.title)).not.toContain(
        jobToDelete.title
      );
    });
  });

  describe("when the user is not authenticated", () => {
    it("should return status 401", async () => {
      const job = await Job.findOne({ title: "Senior React Developer" });

      await api.delete(`/api/jobs/${job._id}`).expect(401);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 404", async () => {
      const response = await api
        .delete("/api/jobs/not-a-valid-id")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "No such job");
    });
  });
});
```

</details>

-------

## PART 4 - Coverage, Watch Mode, and `cross-env`

After the tests pass, add the final scripts.

Install `cross-env` and the coverage provider:

```bash
npm install cross-env
npm install @vitest/coverage-v8 -D
```

Use:

```json
"scripts": {
  "start": "cross-env NODE_ENV=production node index.js",
  "dev": "cross-env NODE_ENV=development nodemon index.js",
  "test": "cross-env NODE_ENV=test vitest run",
  "test:coverage": "cross-env NODE_ENV=test vitest run --coverage",
  "test:watch": "cross-env NODE_ENV=test vitest"
}
```

Why `cross-env`?

- `NODE_ENV=test` lets the app use `TEST_MONGO_URI`.
- `cross-env` makes the command work on Windows, macOS, and Linux.
- A test database prevents tests from changing development data.

Run:

```bash
npm test
```

Expected output:

```text
Test Files  3 passed (3)
Tests       26 passed (26)
```

Run coverage:

```bash
npm run test:coverage
```
