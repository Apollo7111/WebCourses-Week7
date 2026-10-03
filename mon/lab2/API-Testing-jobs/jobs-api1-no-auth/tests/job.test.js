const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Your Express app
const api = supertest(app);
const Job = require("../models/jobModel");

const jobs = [
  {
    title: "Senior React Developer",
    type: "Full-Time",
    description: "We are seeking a talented Front-End Developer to join our team in Boston, MA.",
    company: {
      name: "NewTek Solutions",
      contactEmail: "contact@teksolutions.com",
      contactPhone: "555-555-5555"
    }
  },
  {
    title: "Junior Backend Developer",
    type: "Part-Time",
    description: "Join our backend team to help build scalable APIs.",
    company: {
      name: "Tech Innovators",
      contactEmail: "hr@techinnovators.com",
      contactPhone: "555-555-1234"
    }
  },
];

describe("Job Controller", () => {
  beforeEach(async () => {
    await Job.deleteMany({});
    await Job.insertMany(jobs);
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  // Test GET /api/jobs
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

  // Test POST /api/jobs
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

  // Test GET /api/jobs/:id
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

  // Test PUT /api/jobs/:id
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

  // Test DELETE /api/jobs/:id
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
