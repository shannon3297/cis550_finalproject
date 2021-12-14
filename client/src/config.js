require("dotenv").config(".env")

module.exports = {
    SERVER_URL: process.env.NODE_ENV == "development" ? "http://localhost:8080" : "/api",
}