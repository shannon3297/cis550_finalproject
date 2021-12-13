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
//         INDIVIDUAL STOCK ROUTES
// ********************************************

/**
 * Returns stock data every day for a company.
 * @param {*} req
 * @param {*} res
 */
async function stockData(req, res) {
    ticker = req.query.ticker || "TSLA"
    connection.query(
        `SELECT *
        FROM Stocks
        WHERE ticker = '${ticker}'
        AND date > "2020-10-01"
    `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

// Route 1 (handler)

/**
 * Returns min, max, and average daily move (ratio of closing price to previous
 * day's closing price) of the stock over a specified time period.
 * period [startday, endday].
 *
 * Query params:
 * ticker - ticker of stock to conduct this query on (defaults to TSLA)
 * startday - starting date of the time period to calculate the aggregate statistics over.
 *      (defaults to 2021-09-01)
 * endday - starting date of the time period to calculate the aggregate statistics over.
 *      (defaults to 2021-11-01)
 *
 * Returns: 1 x 3 table
 * Column names: minMove, maxMove, avgMove
 *
 * @param {*} req
 * @param {*} res
 */

async function stockStats(req, res) {
    const ticker = req.query.ticker ? req.query.ticker : "TSLA"
    const startday = req.query.startday ? req.query.startday : "2020-10-01"
    const endday = req.query.endday ? req.query.endday : "2021-10-31"

    connection.query(
        `WITH DailyMoves AS (
        WITH LabeledTickerTable AS (
          SELECT date, close, row_number() over (ORDER BY date desc) as row_num
          FROM Stocks
          WHERE ticker = '${ticker}'
          ORDER BY row_num asc
        )
        SELECT l2.date as date, l2.close / l.close as dailyMove
          FROM LabeledTickerTable l JOIN LabeledTickerTable l2 on l.row_num = (l2.row_num + 1)
           where l2.date >= STR_TO_DATE('${startday}','%Y-%m-%d')
               AND l2.date <= "${endday}"
        )
        SELECT ROUND(min(dailyMove), 3) as minMove, ROUND(max(dailyMove), 3) as maxMove, ROUND(avg(dailyMove), 3) as avgMove
        from DailyMoves`,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns articleid, URL, and date of the three most recent articles that have mentioned the stock.
 *
 * Query params
 * ticker - ticker of the stock to conduct this query on (defaults to TSLA)
 *
 * Returns: 3 x 3 table
 * Columns: article_id, url, date
 * date = date of article
 *
 * Rows are sorted by descending order of date.
 *
 * @param {*} req
 * @param {*} res
 */

async function recentArticles(req, res) {
    const ticker = req.query.ticker ? req.query.ticker : "TSLA"

    connection.query(
        `WITH CompanyName AS (
        SELECT company_name
        from Company
        WHERE ticker = '${ticker}'
    )
    SELECT article_id, url, DATE_FORMAT(date, "%Y-%m-%d") as date, WSJArticles.title AS title
    FROM WSJArticles, CompanyName
    WHERE title LIKE '%${ticker}%'
    OR title LIKE CONCAT('%', CompanyName.company_name, '%')
    OR subtitle LIKE '%${ticker}%'
    OR subtitle LIKE CONCAT('%', CompanyName.company_name, '%')
    OR content LIKE '%${ticker}%'
    OR content LIKE CONCAT('%', CompanyName.company_name, '%')
    ORDER BY date desc
    LIMIT 3`,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns a WSJ article that discussed a stock the day before each of
 * the stock's 5 largest price moves (between Oct 1 2020 and Nov 12 2021).
 *
 * Query params
 * ticker - ticker of the stock to  conduct this query on (defaults to TSLA)
 *
 * Returns 5 x 3 table
 * Column names: date, dailyMoveAbs, article_id
 * date = date of large price move, not date of article
 *
 * Rows are sorted in descending order of dailyMoveAbs
 *
 * @param {*} req
 * @param {*} res
 */
async function articlesBeforeBigMoves(req, res) {
    const ticker = req.query.ticker ? req.query.ticker : "TSLA"

    connection.query(
        `WITH CompanyName AS (
        SELECT company_name
        from Company
        WHERE ticker = '${ticker}'
      ), LargestMoves AS (
        WITH ShiftedStocks AS (
            SELECT ticker, (date + 1) as dateToCompare, close
            FROM Stocks
            WHERE ticker = '${ticker}'
        )
        SELECT date, abs(s.close - ss.close) / ss.close AS dailyMoveAbs
        FROM Stocks s
                 JOIN ShiftedStocks ss ON s.ticker = ss.ticker
            AND s.date = ss.dateToCompare
      ), BigMentions AS (
       SELECT w.article_id, w.date, w.url, w.content, w.title
        FROM WSJArticles w, CompanyName c
        WHERE title LIKE '%${ticker}%'
        OR title LIKE CONCAT('%', c.company_name, '%')
        OR subtitle LIKE '%${ticker}%'
        OR subtitle LIKE CONCAT('%', c.company_name, '%')
      ), SmallMentions AS (
        SELECT w.article_id, w.date, w.url, w.content, w.title
        FROM WSJArticles w, CompanyName c
        WHERE content LIKE '%${ticker}%'
           OR content LIKE CONCAT('%', c.company_name, '%')
      ), ScoredMentions AS (
        SELECT b.article_id, b.url, b.content, b.title, DATE_ADD(b.date, INTERVAL 1 DAY) as dateAfter, DATE_SUB(b.date, INTERVAL 1 DAY) as dateBefore, IF(b.article_id IS NOT NULL AND s.article_id IS NOT NULL, 1.5, (IF(b.article_id IS NOT NULL, 1, 0.5))) as score
        FROM BigMentions b LEFT OUTER JOIN SmallMentions s ON b.article_id = s.article_id
        UNION
        SELECT s.article_id, s.url, s.content, s.title, DATE_ADD(s.date, INTERVAL 1 DAY) as dateAfter, DATE_SUB(s.date, INTERVAL 1 DAY) as dateBefore, IF(b.article_id IS NOT NULL AND s.article_id IS NOT NULL, 1.5, (IF(b.article_id IS NOT NULL, 1, 0.5))) as score
        FROM BigMentions b RIGHT OUTER JOIN SmallMentions s ON b.article_id = s.article_id
      ), MovesAndMentionsJoined AS (
        SELECT date, dailyMoveAbs, url, article_id, content, title, row_number() over (partition by date order by score desc) as row_num
        FROM LargestMoves l JOIN ScoredMentions m ON l.date = m.dateAfter
      )
      SELECT DATE_FORMAT(date, "%Y-%m-%d") as dateOfPriceMove, dailyMoveAbs, article_id, url, content, title
      FROM MovesAndMentionsJoined
      WHERE row_num = 1
      ORDER BY dailyMoveAbs desc
      LIMIT 5;`,
        function (error, results, fields) {
            for (var i = 0; i < results.length; i++) {
                results[i]["content"] = results[i]["content"].substring(0, results[i]["content"].indexOf("\n"))
            }

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

// ********************************************
//         AGGREGATE STOCK ROUTES
// ********************************************

/**
 * Returns the top 5 stocks with the highest daily moves on specified date.
 *
 * Query params
 * date - date to conduct this query to. Make sure this is a valid historical trading day.
 *      (defaults to 2021-10-29)
 *
 * Returns 5 x 3
 * Column name: ticker, date, dailyMove
 * intradayMovement = stock's close price on date / close price on day before date
 *
 * Rows are sorted in descending order of dailyMove
 *
 * @param {*} req
 * @param {*} res
 */
async function stocksBiggestMovers(req, res) {
    const date = req.query.date ? req.query.date : "2021-10-29"

    connection.query(
        `WITH LabeledTickerTable AS (
        SELECT ticker, date, close, row_number() over (partition by ticker ORDER BY date desc) as row_num
        FROM Stocks
        WHERE date <= STR_TO_DATE('${date}','%Y-%m-%d')
          AND date >= DATE_SUB("${date}", INTERVAL 3 DAY)
        ORDER BY row_num asc
      )
      SELECT l2.ticker as ticker, l2.date as date, l2.close / l.close as dailyMove
      FROM LabeledTickerTable l JOIN LabeledTickerTable l2 on l.ticker = l2.ticker and l.row_num = (l2.row_num + 1)
      where l2.date = STR_TO_DATE('${date}','%Y-%m-%d')
      order by abs(1 - dailyMove) desc
      limit 5
    `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns the top 5 stocks with the highest intraday price volatiltiy on a specific date.
 * Must make sure that the day that is req.query.numdays days before Oct 31 2021 is a valid
 * trading day, otherwise result will be empty.
 *
 * Query params
 * date - date to conduct this query to. Make sure this is a valid historical trading day.
 *      (defaults to 2021-10-29)
 *
 * Returns 5 x 2
 * Column name: ticker, intradayMovement
 * intradayMovement = stock's highest price that day / stock's lowest price that day
 *
 * Rows are sorted in descending order of intradayMovement
 *
 * @param {*} req
 * @param {*} res
 */

async function stocksBiggestVolatility(req, res) {
    const date = req.query.date ? req.query.date : "2021-10-29"

    connection.query(
        `SELECT ticker, ROUND((high / low), 2) as intradayMovement
    FROM Stocks
    WHERE date =  STR_TO_DATE('${date}','%Y-%m-%d')  
    ORDER BY abs(1-intradayMovement) desc
    LIMIT 5
    `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns the top 5 stocks whose prices have been consistently incrasing over a set of 5
 * consecutive days. The "top 5" stocks are defined as the ones with the highest price appreciation
 * from the first of the 5 days to the last of the 5 days.
 *
 * Query params
 * dateone - first of the five consecutive trading days. Make sure this is a valid
 *      trading date. Defaults to 2021-10-25
 * datetwo - second of the five consecutive trading days. Make sure this is a valid
 *      trading date, and trading date right after dateone. Defaults to 2021-10-26
 * datethree - third of the five consecutive trading days. Make sure this is a valid
 *      trading date, and trading date right after datetwo. Defaults to 2021-10-27
 * datefour - fourth of the five consecutive trading days. Make sure this is a valid
 *      trading date, and trading date right after datethree. Defaults to 2021-10-28
 * datefive - fifth of the five consecutive trading days. Make sure this is a valid
 *      trading date, and trading date right after datefour. Defaults to 2021-10-29
 *
 * Returns 5 x 6
 * Column names: ticker, dayFiveClose, dayFourClose, dayThreeClose, dayTwoClose, dayOneClose
 * dayOneClose = closing price of the stock on dateone
 *
 * Rows sorted in descending order of dayFiveClose / dayOneClose
 *
 * @param {*} req
 * @param {*} res
 */

async function consistentMovers(req, res) {
    const dateone = req.query.dateone ? req.query.dateone : "2021-10-25"
    const datetwo = req.query.datetwo ? req.query.datetwo : "2021-10-26"
    const datethree = req.query.datethree ? req.query.datethree : "2021-10-27"
    const datefour = req.query.datefour ? req.query.datefour : "2021-10-28"
    const datefive = req.query.datefive ? req.query.datefive : "2021-10-29"

    connection.query(
        `WITH OneDayAgo AS (
        SELECT ticker, date, close
        FROM Stocks
        WHERE date = STR_TO_DATE('${datefive}','%Y-%m-%d')  
      ), TwoDaysAgo AS (
        SELECT ticker, date, close
        FROM Stocks
        WHERE date =  STR_TO_DATE('${datefour}','%Y-%m-%d')  
      ), ThreeDaysAgo AS (
        SELECT ticker, date, close
        FROM Stocks
        WHERE date =  STR_TO_DATE('${datethree}','%Y-%m-%d')  
      ), FourDaysAgo AS (
        SELECT ticker, date, close
        FROM Stocks
        WHERE date =  STR_TO_DATE('${datetwo}','%Y-%m-%d')  
      ), FiveDaysAgo AS (
        SELECT ticker, date, close
        FROM Stocks
        WHERE date = STR_TO_DATE('${dateone}','%Y-%m-%d')  
      )
      SELECT a.ticker as ticker, a.close as dayFiveClose, b.close as dayFourClose, c.close as dayThreeClose, d.close as dayTwoClose, e.close as dayOneClose
      FROM OneDayAgo a
      JOIN TwoDaysAgo b ON a.ticker = b.ticker
      JOIN ThreeDaysAgo c ON a.ticker = c.ticker
      JOIN FourDaysAgo d ON a.ticker = d.ticker
      JOIN FiveDaysAgo e ON a.ticker = e.ticker
      WHERE a.close / b.close > 1
       AND b.close / c.close > 1
       AND c.close / d.close > 1
         AND d.close / e.close > 1
      ORDER BY a.close / e.close desc
      LIMIT 5`,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Checks which companies have been receiving the most WSJ press
 * over the date range [startday, endday]. Weights title mentions in WSJ articles more
 * heavily than content mentions.
 *
 * Query parameters
 * startday - starting date of the time period to analyze press amounts over. (defaults to 2021-09-01)
 * endday - starting date of the time period to analyze press amounts over. (defaults to 2021-11-01)
 *
 * Returns 10 x 1
 * Columns: ticker
 *
 * Rows sorted by descending order of press amount
 *
 * @param {*} req
 * @param {*} res
 */
async function companiesWithMostPress(req, res) {
    const startday = req.query.startday ? req.query.startday : "2021-09-01"
    const endday = req.query.endday ? req.query.endday : "2021-10-29"

    connection.query(
        `WITH ArticlesMentioningCompanies as (
            SELECT article_id, c.company_name as company_name, m.ticker as ticker
            FROM CompanyMentions c JOIN Company m
            on c.company_name = m.company_name
        ), TitleMentions AS (
            SELECT a.ticker as ticker, w.article_id as article_id
            FROM WSJArticles w JOIN
                 ArticlesMentioningCompanies a on w.article_id = a.article_id
            WHERE w.date >= STR_TO_DATE('${startday}','%Y-%m-%d')
                AND w.date <= STR_TO_DATE('${endday}','%Y-%m-%d')
                AND (w.title LIKE CONCAT('%', a.ticker, '%')
                        OR w.title LIKE CONCAT('%', a.company_name, '%')
                    )
        ), ContentMentions AS (
            SELECT a.ticker as ticker, w.article_id as article_id
            FROM WSJArticles w JOIN
                 ArticlesMentioningCompanies a on w.article_id = a.article_id
            WHERE w.date >= STR_TO_DATE('${startday}','%Y-%m-%d')
                AND w.date <= STR_TO_DATE('${endday}','%Y-%m-%d')
                AND ( w.content LIKE CONCAT('%', a.ticker, '%')
                        OR w.content LIKE CONCAT('%', a.company_name, '%')
                    )
        )
        SELECT temp1.ticker, (2 * numBigMentions + 1 * numSmallMentions) as score
            FROM
            (SELECT t.ticker, COUNT(*) as numBigMentions
            FROM TitleMentions t JOIN ContentMentions c ON t.ticker = c.ticker AND t.article_id = c.article_id
            GROUP BY ticker) AS temp1
        NATURAL JOIN
            (SELECT ticker, COUNT(*) as numSmallMentions
            FROM ContentMentions
            GROUP BY ticker) AS temp2
        ORDER BY score desc
        LIMIT 10
    `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

// ********************************************
//         AGGREGATE INDSUTRY ROUTES
// ********************************************

/**
 * Returns the top 3 industries that saw the most intraday volatility
 * on a specific date.
 *
 * Query parameters
 * date - date to analyze industry intraday volatilities. Make sure this is a
 *      valid trading day(defaults to 2021-11-12)
 *
 * Returns 3 x 2
 * Columns: industry, intradayMovement
 *
 * Rows sorted by descending order of intradayMovement
 *
 * @param {*} req
 * @param {*} res
 */

async function industriesMostVolatility(req, res) {
    const date = req.query.date ? req.query.date : "2021-10-29"

    connection.query(
        `SELECT industry, ROUND(AVG (high / low), 3) as intradayMovement
    FROM Stocks s
      JOIN Company c ON s.ticker = c.ticker
    WHERE date = STR_TO_DATE('${date}','%Y-%m-%d')
    GROUP BY industry
    ORDER BY intradayMovement desc
    LIMIT 3`,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns the top 3 industries that saw the most WSJ Press over a specified time
 * period [startday, endday]
 *
 * Query parameters
 * startday - starting date of the time period to analyze press amounts over. (defaults to 2021-01-01)
 * endday - starting date of the time period to analyze press amounts over. (defaults to 2021-11-12)
 *
 * Returns 3 x 2
 * Columns: industry, numMentions
 *
 * Rows sorted by descending order of numMentions
 *
 * @param {*} req
 * @param {*} res
 */

async function industriesMostPress(req, res) {
    const startday = req.query.startday ? req.query.startday : "2021-09-01"
    const endday = req.query.startday ? req.query.startday : "2021-10-29"

    connection.query(
        `WITH industries as (
        SELECT DISTINCT industry
        from Company
      ) SELECT industry, COUNT(*) AS numMentions
      FROM WSJArticles a, industries i
      WHERE a.content LIKE CONCAT('%', i.industry, '%')
         AND date >= STR_TO_DATE('${startday}','%Y-%m-%d')
         AND date <= STR_TO_DATE('${endday}','%Y-%m-%d')
      GROUP BY industry
      ORDER BY numMentions desc
      LIMIT 3
      `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns the top 3 industries that we expect to move soon. Analyzes this by analyzing
 * which industries have seen low amounts of price volatility since newday, but higher amounts
 * of press coverage since newday than between oldday and newday.
 *
 * Query parameters
 * oldday - refer to above description to understand function of oldday. (defaults to 2021-09-01)
 * newday - refer to above description to understand function of oldday. (defaults to 2021-03-01)
 *
 * Returns 3 x 3
 * Columns: industry, mentionIncrease, avgRange
 * mentionIncrease = ratio of WSJ coverage of industry since newday to WSJ coverage between old day and new day
 * avgRange = average ratio of highest price since newday to lowest price since newday across all companies in industry
 *
 * Rows sorted by descending order of mentionIncrease / avgRange
 *
 * @param {*} req
 * @param {*} res
 */
async function industriesToMoveSoon(req, res) {
    const oldday = req.query.startday ? req.query.startday : "2021-03-01"
    const newday = req.query.startday ? req.query.startday : "2021-09-01"

    connection.query(
        `WITH moveData AS (
        SELECT ticker,
            MAX(high) / MIN(low) as priceRange
        FROM Stocks
        WHERE date > STR_TO_DATE('${newday}','%Y-%m-%d')
        GROUP BY ticker
       ), mentionsRecent AS (
        WITH CompanyTablesJoined AS (
             SELECT comp.*, c.article_id
             FROM CompanyMentions c JOIN Company comp on (comp.company_name LIKE CONCAT('%',c.company_name,'%'))
        )
        SELECT c.ticker, COUNT(*) AS numMentions
        FROM WSJArticles w JOIN CompanyTablesJoined c on w.article_id = c.article_id
        WHERE w.date >= STR_TO_DATE('${newday}','%Y-%m-%d')
        GROUP BY c.ticker
       ), mentionsEarlier AS (
        WITH CompanyTablesJoined AS (
             SELECT comp.*, c.article_id
             FROM CompanyMentions c JOIN Company comp on (comp.company_name LIKE CONCAT('%',c.company_name,'%'))
        )
        SELECT ticker, COUNT(*) AS numMentions
        FROM WSJArticles w JOIN CompanyTablesJoined c on w.article_id = c.article_id
        WHERE w.date < STR_TO_DATE('${newday}','%Y-%m-%d')
        AND w.date >= STR_TO_DATE('${oldday}','%Y-%m-%d')
        GROUP BY ticker
       )
       SELECT industry, ROUND(AVG(r.numMentions / e.numMentions), 3) as mentionIncrease, ROUND(avg(priceRange), 3) as avgRange
       FROM moveData m
       JOIN mentionsRecent r ON m.ticker = r.ticker
       JOIN mentionsEarlier e ON m.ticker = e.ticker
       JOIN Company c ON m.ticker = c.ticker
       GROUP BY industry
       ORDER BY mentionIncrease / avgRange desc
       LIMIT 3
      `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns the perfomance of each of the industries on the market on
 * a specific date.
 *
 * Query parameters
 * date - date to analyze industry performance on. Make sure this is a
 *      valid trading day (defaults to 2021-11-12)
 *
 * Returns 12 x 2
 * Columns: industry, performance
 * performance = average daily move of the companies in that industry on date
 * 12 industries
 *
 * Rows sorted by descending order of performance
 *
 * @param {*} req
 * @param {*} res
 */
async function industriesPerformance(req, res) {
    const date = req.query.date ? req.query.date : "2021-10-29"

    connection.query(
        `WITH LabeledTickerTable AS (
            SELECT ticker, date, close, row_number() over (partition by ticker ORDER BY date desc) as row_num
            FROM Stocks
            WHERE date <= STR_TO_DATE('${date}','%Y-%m-%d')
              AND date >= DATE_SUB('${date}', INTERVAL 3 DAY)
            ORDER BY row_num asc
        ), DailyMoves AS (
            SELECT l2.ticker as ticker, l2.date as date, l2.close / l.close as dailyMove
            FROM LabeledTickerTable l JOIN LabeledTickerTable l2 on l.ticker = l2.ticker and l.row_num = (l2.row_num + 1)
            where l2.date = STR_TO_DATE('${date}','%Y-%m-%d')
        )
        SELECT industry, AVG(dailyMove) as performance
             FROM DailyMoves d JOIN Company c on d.ticker = c.ticker
             GROUP BY industry
             ORDER BY performance desc
      `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

/**
 * Returns list of all stocks for the UI
 *
 * @param {*} req
 * @param {*} res
 */
async function allStocks(req, res) {
    connection.query(
        `SELECT ticker, company_name as name
        FROM Company
    `,
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        }
    )
}

module.exports = {
    stockStats,
    recentArticles,
    articlesBeforeBigMoves,
    stocksBiggestMovers,
    stocksBiggestVolatility,
    consistentMovers,
    companiesWithMostPress,
    industriesMostVolatility,
    industriesMostPress,
    industriesToMoveSoon,
    industriesPerformance,
    allStocks,
    stockData,
}
