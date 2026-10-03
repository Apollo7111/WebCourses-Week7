const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app"); // Your Express app
const api = supertest(app);
const connectDB = require("../config/db");
const User = require("../models/userModel");


const users = [
    {
        name: "Jane Userowner",
        email: "jane.userowner@example.com",
        password: "User123!",
        phone_number: "+358401234567",
        gender: "female",
        date_of_birth: "1995-06-15",
        membership_status: "active",
    },
    {
        name: "Jone DBowner",
        email: "jone.userowner@example.com",
        password: "User2123!",
        phone_number: "+358401234567",
        gender: "male",
        date_of_birth: "1995-06-15",
        membership_status: "active",
    },
];

describe("User Controller", () => {
    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await User.insertMany(users);
    });

    // Test POST /api/users/signup
    describe("POST /api/users/signup", () => {
        const newUser =
        {
            name: "Jone nonOwner",
            email: "jone.nobody@example.com",
            password: "mySupersafepasshehehe2!",
            phone_number: "+358401234567",
            gender: "male",
            date_of_birth: "1967-06-15",
            membership_status: "active",
        }
        describe("when the payload is valid", () => {
            it("should return status 201", async () => {
                await api
                    .post("/api/users/signup")
                    .send(newUser)
                    .expect(201)
                    .expect("Content-Type", /application\/json/);
            });
            it("should return an email and token", async () => {
                const response = await api
                    .post("/api/users/signup")
                    .send(newUser)
                    .expect(201);

                expect(response.body).toHaveProperty("token");
                expect(response.body.email).toBe(newUser.email);
            });
            it("should persist the new user in the database", async () => {
                await api.post("/api/users/signup").send(newUser).expect(201);

                const usersAfterPost = await User.find({});
                expect(usersAfterPost).toHaveLength(users.length + 1);
                expect(usersAfterPost.map((user) => user.name)).toContain(
                    newUser.name
                );
            });
        });
        // Invalid
        describe("when the payload is invalid", () => {
            const invalidUser = {
                name: "ShouldFail",
                email: "fail@example.com",
                phone_number: "+358401234567",
                gender: "male",
                date_of_birth: "1967-06-15",
                membership_status: "active",
            };
            it("should return status 400 when required fields are missing", async () => {
                await api.post("/api/users/signup").send(invalidUser).expect(400);
            });

            it("should not persist a user in the database", async () => {
                await api.post("/api/users/signup").send(invalidUser).expect(400);
                const usersAtEnd = await User.find({});
                expect(usersAtEnd).toHaveLength(users.length);
            });
        });
        describe("when the email is already registered", () => {
            it("should return status 400", async () => {
                await api.post("/api/users/signup").send(newUser).expect(201);

                const response = await api
                    .post("/api/users/signup")
                    .send({ ...newUser, name: "Another Productowner" })
                    .expect(400);

                expect(response.body).toHaveProperty("error", "User already exists");
            });
        });
    });
    // Test POST /api/users/login
    describe("POST /api/users/login", () => {
        const validUser = {
            name: "Jone DBowner",
            email: "jone.us3erowner@example.com",
            password: "User2123!",
            phone_number: "+358401234567",
            gender: "male",
            date_of_birth: "1995-06-15",
            membership_status: "active",
        }
        beforeEach(async () => {
            await api.post("/api/users/signup").send(validUser).expect(201);
        });
        const existingUser =
        {
            email: "jone.us3erowner@example.com",
            password: "User2123!",
        }
        describe("when the credentials are valid", () => {
            it("should return status 200", async () => {
                await api
                    .post("/api/users/login")
                    .send({
                        email: existingUser.email,
                        password: existingUser.password,
                    })
                    .expect(200)
                    .expect("Content-Type", /application\/json/);
            });
            it("should return an email and token", async () => {
                const response = await api
                    .post("/api/users/login")
                    .send(existingUser)
                    .expect(200);

                expect(response.body).toHaveProperty("token");
                expect(response.body.email).toBe(existingUser.email);
            });
        });   
        // Invalid
        describe("when the credentials are invalid", () => {
            it("should return status 400 with a wrong password", async () => {
                const response = await api.post("/api/users/login").send({
                email: "jone.us3erowner@example.com",
                password: "Uer2123!",
            }).expect(400);
                expect(response.body).toHaveProperty("error", "Invalid credentials");
            });

            it("should return status 400 with an email that does not exist", async () => {
                const response = await api.post("/api/users/login").send({
                    email: "joe.uerowner@example.com",
                    password: "Uer2123!",
                }).expect(400);
                expect(response.body).toHaveProperty("error", "Invalid credentials");
            });
        });
    });
    afterAll(async () => {
        await mongoose.connection.close();
    });
})