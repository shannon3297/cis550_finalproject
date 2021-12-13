const express = require("express")
const mysql = require("mysql")

const routes = require("./routes")
const config = require("./config.json")
const cache = require("memory-cache")
const cors = require("cors")

const app = express()
app.use(
    cors({
        origin: "*",
    })
)

let memCache = new cache.Cache()
let cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key = "__express__" + req.originalUrl || req.url
        let cacheContent = memCache.get(key)
        if (cacheContent) {
            res.send(cacheContent)
            return
        } else {
            res.sendResponse = res.send
            res.send = (body) => {
                memCache.put(key, body, duration * 1000)
                res.sendResponse(body)
            }
            next()
        }
    }
}

// Route 1 - register as GET
app.get("/stockStats", routes.stockStats)
app.get("/recentArticles", routes.recentArticles)
app.get("/articlesBeforeBigMoves", routes.articlesBeforeBigMoves)
app.get("/stocksBiggestMovers", routes.stocksBiggestMovers)
app.get("/stocksBiggestVolatility", routes.stocksBiggestVolatility)
app.get("/consistentMovers", routes.consistentMovers)
app.get("/companiesWithMostPress", routes.companiesWithMostPress)
app.get("/industriesMostVolatility", cacheMiddleware(3600), routes.industriesMostVolatility)
app.get("/industriesMostPress", cacheMiddleware(3600), routes.industriesMostPress)
app.get("/industriesToMoveSoon", cacheMiddleware(3600), routes.industriesToMoveSoon)
app.get("/industriesPerformance", cacheMiddleware(3600), routes.industriesPerformance)
app.get("/allStocks", routes.allStocks)
app.get("/stockData", routes.stockData)

app.listen(config.server_port, () => {
    console.log(`Server running at http://127.0.0.1:8080/`)
})

module.exports = app
