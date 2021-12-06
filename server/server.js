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
app.get("/allStocks", routes.allStocks)

app.get("/stockData", routes.getStockData)

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
})

module.exports = app
