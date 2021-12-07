const express = require("express")
const mysql = require("mysql")

const routes = require("./routes")
const config = require("./config.json")
const cors = require("cors")

const app = express()
app.use(
    cors({
        origin: "*",
    })
)

// Route 1 - register as GET
app.get("/stockStats", routes.stockStats)
app.get("/recentArticles", routes.recentArticles)
app.get("/articlesBeforeBigMoves", routes.articlesBeforeBigMoves)
app.get("/stocksBiggestVolatility", routes.stocksBiggestVolatility)
app.get("/consistentMovers", routes.consistentMovers)
app.get("/companiesWithMostPress", routes.companiesWithMostPress)
app.get("/industriesMostVolatility", routes.industriesMostVolatility)
app.get("/industriesMostPress", routes.industriesMostPress)
app.get("/industriesToMoveSoon", routes.industriesToMoveSoon)
app.get("/industriesPerformance", routes.industriesPerformance)


app.listen(config.server_port, () => {
    console.log(`Server running at http://127.0.0.1:8080/`)
})

module.exports = app
