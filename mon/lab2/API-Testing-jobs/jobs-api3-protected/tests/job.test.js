const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const Job = require("../models/jobModel");
const User = require("../models/userModel");

const api = supertest(app);

const userData = {
  name: "Protected Job Tester",
  email: "protected.jobs@example.com",
  password: "JobSearch123!",
  phone_number: "+358409876543",
  gender: "other",
  date_of_birth: "1990-01-20",
  membership_status: "active",
};

const jobs = [
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
  await connectDB();
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

  for (const job of jobs) {
    await api
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(job)
      .expect(201);
  }
});



describe("Unprotected routes", () => {

  // Test GET /api/jobs
  it("should return all jobs", async () => {
    const response = await api.get("/api/jobs").expect(200);

    expect(response.body).toHaveLength(jobs.length);
  });

  it("should return all jobs as JSON when GET /api/jobs is called", async () => {
    const response = await api
      .get("/api/jobs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

  });

  it("should include a specific job in the returned list", async () => {
    const response = await api.get("/api/jobs");

    expect(response.body.map((job) => job.title)).toContain(
      "Junior Backend Developer"
    );
  })



  // Test GET /api/jobs/:id
  it("should return specific job as JSON when GET /api/jobs is called based on :id", async () => {
    const job = await Job.findOne();
    await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

  });

  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  it("should return status 404", async () => {
    await api.get("/api/jobs/12345").expect(404);
  });

})


describe("Unprotected routes", () => {

  // Test POST /api/jobs
  describe("POST /api/jobs", () => {
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

    // When auth
    it("should return status 201", async () => {
      await api
        .post("/api/jobs")
        .send(newJob)
        .set("Authorization", `Bearer ${token}`)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    });
    it("should persist the new job in the database", async () => {
      await api.post("/api/jobs").send(newJob).set("Authorization", `Bearer ${token}`).expect(201);

      const jobsAfterPost = await Job.find({});
      expect(jobsAfterPost).toHaveLength(jobs.length + 1);
      expect(jobsAfterPost.map((job) => job.title)).toContain(
        newJob.title
      );
    });

    // When not auth
    it("should return status 401 when token is missing", async () => {
      await api.post("/api/jobs").send(newJob).expect(401);
    });

    it("should not increase the number of jobs in the database", async () => {
      await api.post("/api/jobs").send(newJob).expect(401);
      const jobsAtEnd = await Job.find({});
      expect(jobsAtEnd).toHaveLength(jobs.length);
    });

  })




  // Test PUT /api/jobs/:Id
  // Auth
  it("should return status 200", async () => {
    const job = await Job.findOne();

    await api
      .put(`/api/jobs/${job._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Updated description", stockQuantity: 42 })
      .expect(200);
  });

  it("should update a job with id when PUT /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    const jobUpdate =
    {
      title: "FrontEnd Engineer",
      type: "Full-Time",
    }
    await api
      .put(`/api/jobs/${job._id}`)
      .send(jobUpdate)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.title).toBe(jobUpdate.title);
    expect(updatedJobCheck.type).toBe(jobUpdate.type);
  });

  // Not auth
  it("should update a job with id when PUT /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    const jobUpdate =
    {
      title: "FrontEnd Engineer",
      type: "Full-Time",
    }
    await api
      .put(`/api/jobs/${job._id}`)
      .send(jobUpdate)
      .expect(401)
      .expect("Content-Type", /application\/json/);
  });
  // Wrong id
  it("should return 400 for invalid job ID when PUT /api/jobs/:id", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    await api.put(`/api/jobs/${invalidId}`).set("Authorization", `Bearer ${token}`).send({}).expect(404);
  });


  // Test DELETE /api/jobs/:id
  // Auth
  it("should return status 204", async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`)
      .set("Authorization", `Bearer ${token}`).expect(204);
  });

  it("should delete specific job when DELETE /api/jobs/:id is called", async () => {
    const job = await Job.findOne();
    await api
      .delete(`/api/jobs/${job._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();

  });

  // Not auth
  it("should return status 204", async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`)
      .expect(401);
  });

  // Invalid id
  it("should return 404 for a non-existing job ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });


});
afterAll(async () => {
  await mongoose.connection.close();
});