# Testing Jobs API Endpoints

In this lab you will add automated **integration tests** to the Jobs API with **Vitest** and **Supertest**.

This first backend has Job CRUD endpoints only. There are no users and no protected routes.

By the end of the lab you will have tests for:

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:jobId`
- `PUT /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

-------

## PART 1 - Project & Test Setup

### 1.1 Install test dependencies

Run this command from `jobs-api/jobs-api1-no-auth`:

```bash
npm install vitest supertest -D
```

Helpful documentation:

- [Vitest guide](https://vitest.dev/guide/)
- [Jest getting started](https://jestjs.io/docs/getting-started)

### 1.2 Add a test script

Add:

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

### 1.5 Ignore Vitest cache files

Make sure `.gitignore` contains:

```text
.vitest/
```

-------

## PART 2 - Job API Tests

**Step 1:** Create:

```text
tests/job.test.js
```

**Step 2:** Add imports and test data:

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
```

**Step 3:** Put setup and teardown outside all endpoint `describe` blocks:

```js
beforeEach(async () => {
  await Job.deleteMany({});
  await Job.insertMany(jobs);
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

**Step 4:** Write one `describe` block per HTTP endpoint. The test output should read like a story.

For example:

```text
GET /api/jobs
  should return all jobs
  should return jobs as JSON with status 200
  should include a specific job in the returned list

POST /api/jobs
  when the payload is valid
    should return status 201
    should persist the new job in the database
  when the payload is invalid
    should return status 400 when title is missing
    should not increase the number of jobs in the database
```

---

> **Try writing the solution on your own first**, then expand one endpoint at a time.

<details>
<summary>Solution - GET /api/jobs</summary>

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

<details>
<summary>Solution - POST /api/jobs</summary>

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

<details>
<summary>Solution - GET /api/jobs/:jobId</summary>

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

<details>
<summary>Solution - PUT /api/jobs/:jobId</summary>

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

<details>
<summary>Solution - DELETE /api/jobs/:jobId</summary>

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

Run:

```bash
npm test
```

Expected output:

```text
Test Files  2 passed (2)
Tests       17 passed (17)
```

