# Testing Jobs API And User Endpoints

In this lab you will add automated **integration tests** to the second Jobs API backend with **Vitest** and **Supertest**.

This backend has:

- Public Job CRUD endpoints
- User signup and login
- No protected Job routes yet

You will write the tests step by step. Each endpoint has a task first, then a complete sample solution in a `<details>` block.

-------

## PART 1 - Project & Test Setup

Run commands from `jobs-api/jobs-api2-auth`.

### 1.1 Install test dependencies

```bash
npm install vitest supertest -D
```

Helpful documentation:

- [Vitest guide](https://vitest.dev/guide/)
- [Jest getting started](https://jestjs.io/docs/getting-started)

Vitest uses a Jest-like style, so `describe`, `it`, `expect`, `beforeEach`, and `afterAll` will feel familiar.

### 1.2 Add a test script

Open `package.json` and add:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "vitest run"
}
```

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

## PART 2 - Job API Tests

Even though this backend has users, the Job routes are still public.

Create this file:

```text
tests/job.test.js
```

### 2.1 Add imports, API helper, seed data, and setup

Add the shared setup first. This code belongs at the top level of the file, outside all endpoint `describe` blocks.

<details>
<summary>Sample Solution - setup for tests/job.test.js</summary>

```js
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Job = require("../models/jobModel");

const api = supertest(app);

const jobs = [
  {
    title: "Senior React Developer",
    type: "Full-Time",
    description: "We are seeking a talented Front-End Developer to join our team in Boston, MA.",
    company: {
      name: "NewTek Solutions",
      contactEmail: "contact@teksolutions.com",
      contactPhone: "555-555-5555",
    },
  },
  {
    title: "Junior Backend Developer",
    type: "Part-Time",
    description: "Join our backend team to help build scalable APIs.",
    company: {
      name: "Tech Innovators",
      contactEmail: "hr@techinnovators.com",
      contactPhone: "555-555-1234",
    },
  },
];

beforeEach(async () => {
  await Job.deleteMany({});
  await Job.insertMany(jobs);
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

</details>

### 2.2 Test `GET /api/jobs`

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

    expect(response.body).toHaveLength(jobs.length);
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

### 2.3 Test `POST /api/jobs`

Write tests that read like this:

```text
POST /api/jobs
  when the payload is valid
    should return status 201
    should persist the new job in the database
  when the payload is invalid
    should return status 400 when title is missing
    should not increase the number of jobs in the database
```

<details>
<summary>Sample Solution - POST /api/jobs</summary>

```js
describe("POST /api/jobs", () => {
  describe("when the payload is valid", () => {
    it("should return status 201", async () => {
      const newJob = {
        title: "Mid-Level DevOps Engineer",
        type: "Full-Time",
        description: "We are looking for a DevOps Engineer to join our team.",
        company: {
          name: "Cloud Solutions",
          contactEmail: "jobs@cloudsolutions.com",
          contactPhone: "555-555-6789",
        },
      };

      await api.post("/api/jobs").send(newJob).expect(201);
    });

    it("should persist the new job in the database", async () => {
      const newJob = {
        title: "Mid-Level DevOps Engineer",
        type: "Full-Time",
        description: "We are looking for a DevOps Engineer to join our team.",
        company: {
          name: "Cloud Solutions",
          contactEmail: "jobs@cloudsolutions.com",
          contactPhone: "555-555-6789",
        },
      };

      await api.post("/api/jobs").send(newJob).expect(201);

      const jobsAfterPost = await Job.find({});
      expect(jobsAfterPost).toHaveLength(jobs.length + 1);
      expect(jobsAfterPost.map((job) => job.title)).toContain(newJob.title);
    });
  });

  describe("when the payload is invalid", () => {
    it("should return status 400 when title is missing", async () => {
      const invalidJob = {
        type: "Full-Time",
        description: "Missing title should fail.",
        company: {
          name: "Cloud Solutions",
          contactEmail: "jobs@cloudsolutions.com",
          contactPhone: "555-555-6789",
        },
      };

      await api.post("/api/jobs").send(invalidJob).expect(400);
    });

    it("should not increase the number of jobs in the database", async () => {
      const invalidJob = {
        type: "Full-Time",
        description: "Missing title should fail.",
        company: {
          name: "Cloud Solutions",
          contactEmail: "jobs@cloudsolutions.com",
          contactPhone: "555-555-6789",
        },
      };

      await api.post("/api/jobs").send(invalidJob).expect(400);

      const jobsAtEnd = await Job.find({});
      expect(jobsAtEnd).toHaveLength(jobs.length);
    });
  });
});
```

</details>

### 2.4 Test `GET /api/jobs/:jobId`

Write tests that read like this:

```text
GET /api/jobs/:jobId
  when the id is valid
    should return one job by ID
  when the id does not exist
    should return status 404
  when the id is invalid
    should return status 400
```

<details>
<summary>Sample Solution - GET /api/jobs/:jobId</summary>

```js
describe("GET /api/jobs/:jobId", () => {
  describe("when the id is valid", () => {
    it("should return one job by ID", async () => {
      const job = await Job.findOne();

      const response = await api
        .get(`/api/jobs/${job._id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.title).toBe(job.title);
    });
  });

  describe("when the id does not exist", () => {
    it("should return status 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await api.get(`/api/jobs/${nonExistentId}`).expect(404);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 400", async () => {
      await api.get("/api/jobs/12345").expect(400);
    });
  });
});
```

</details>

### 2.5 Test `PUT /api/jobs/:jobId`

Write tests that read like this:

```text
PUT /api/jobs/:jobId
  when the id is valid
    should return status 200
    should persist the updated fields in the database
  when the id is invalid
    should return status 400
```

<details>
<summary>Sample Solution - PUT /api/jobs/:jobId</summary>

```js
describe("PUT /api/jobs/:jobId", () => {
  describe("when the id is valid", () => {
    it("should return status 200", async () => {
      const job = await Job.findOne();

      await api
        .put(`/api/jobs/${job._id}`)
        .send({ description: "Updated description", type: "Contract" })
        .expect(200);
    });

    it("should persist the updated fields in the database", async () => {
      const job = await Job.findOne();
      const updates = {
        description: "Updated description",
        type: "Contract",
      };

      await api.put(`/api/jobs/${job._id}`).send(updates).expect(200);

      const updatedJob = await Job.findById(job._id);
      expect(updatedJob.description).toBe(updates.description);
      expect(updatedJob.type).toBe(updates.type);
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 400", async () => {
      await api.put("/api/jobs/12345").send({}).expect(400);
    });
  });
});
```

</details>

### 2.6 Test `DELETE /api/jobs/:jobId`

Write tests that read like this:

```text
DELETE /api/jobs/:jobId
  when the id is valid
    should return status 204
    should remove the job from the database
  when the id is invalid
    should return status 400
```

<details>
<summary>Sample Solution - DELETE /api/jobs/:jobId</summary>

```js
describe("DELETE /api/jobs/:jobId", () => {
  describe("when the id is valid", () => {
    it("should return status 204", async () => {
      const job = await Job.findOne();

      await api.delete(`/api/jobs/${job._id}`).expect(204);
    });

    it("should remove the job from the database", async () => {
      const job = await Job.findOne();

      await api.delete(`/api/jobs/${job._id}`).expect(204);

      const deletedJob = await Job.findById(job._id);
      expect(deletedJob).toBeNull();
    });
  });

  describe("when the id is invalid", () => {
    it("should return status 400", async () => {
      await api.delete("/api/jobs/12345").expect(400);
    });
  });
});
```

</details>

-------

## PART 3 - User Signup & Login Tests

Create this file:

```text
tests/users.test.js
```

### 3.1 Add imports, valid user data, and setup

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

### 3.2 Test `POST /api/users/signup`

Write tests that read like this:

```text
POST /api/users/signup
  when the payload is valid
    should return status 201
    should return an email and token
    should persist the user in the database
  when the payload is invalid
    should return status 400 when required fields are missing
    should not persist a user in the database
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

    it("should not persist a user in the database", async () => {
      await api
        .post("/api/users/signup")
        .send({ email: "missing@example.com" })
        .expect(400);

      const usersAtEnd = await User.find({});
      expect(usersAtEnd).toHaveLength(0);
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

### 3.3 Test `POST /api/users/login`

Write tests that read like this:

```text
POST /api/users/login
  when the credentials are valid
    should return status 200
    should return an email and token
  when the credentials are invalid
    should return status 400 with a wrong password
    should return status 400 with an email that does not exist
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
    it("should return status 400 with a wrong password", async () => {
      const response = await api
        .post("/api/users/login")
        .send({
          email: validUser.email,
          password: "WrongPassword!",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should return status 400 with an email that does not exist", async () => {
      const response = await api
        .post("/api/users/login")
        .send({
          email: "nobody@example.com",
          password: validUser.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });
  });
});
```

</details>

Run:

```bash
npm test
```

Expected output:

```text
Test Files  3 passed (3)
Tests       27 passed (27)
```
