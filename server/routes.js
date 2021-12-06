const config = require("./config.json")
const mysql = require("mysql")
const e = require("express")

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db,
})
connection.connect()

// ********************************************
//            SIMPLE ROUTE EXAMPLE
// ********************************************

// Route 1 (handler)
async function allStocks(req, res) {
    // a GET request to /hello?name=Steve
    res.send([
        { name: "Tesla", value: "TSLA" },
        { name: "Apple", value: "AAPL" },
    ])
}

async function getStockData(req, res) {
    res.send([
        { x: "2019-01-03", y: 15 },
        { x: "2019-01-04", y: 27 },
        { x: "2019-01-05", y: 18 },
        { x: "2019-01-06", y: 20 },
        { x: "2019-01-07", y: 18 },
    ])
}

module.exports = {
    allStocks,
    getStockData,
}
