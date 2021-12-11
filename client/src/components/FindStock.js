import React from "react"
import moment from "moment"
import GraphWidget from "./GraphWidget"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"

const colors = ["red", "yellow", "green", "black", "white"]

let SERVER_URL = "http://localhost:8080"

class FindStock extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allTickers: [],
            activeTicker: "",
            searchMatches: [],
            stockPriceData: [],
            articles: [],
        }
        this.inputRef = React.createRef()
    }

    dateToUnix = (dateString) => {
        const toDate = moment(dateString, "DD-MM-YY").toDate()
        const toUnix = toDate.getTime()
        return toUnix
    }

    componentDidMount() {
        fetch(SERVER_URL + "/allStocks")
            .then((res) => res.json())
            .then((result) => {
                this.setState({ allTickers: result.results, searchMatches: result.results })
            })
    }

    fetchStockData(ticker) {
        console.log(ticker)
        //let ticker = e.target.value
        this.inputRef.current.value = ticker

        Promise.all([
            fetch(SERVER_URL + "/stockData?ticker=" + ticker).then((res) => res.json()),
            fetch(SERVER_URL + "/articlesBeforeBigMoves?ticker=" + ticker).then((res) => res.json()),
        ]).then((result) => {
            this.setState({
                stockPriceData: result[0].results.map((item) => ({
                    ...item,
                    date: new Date(item.date),
                    numericalDate: Date.parse(item.date),
                    stringDate: item.date.substring(0, 10),
                })),
                articles: result[1].results,
                searchActive: false,
            })
        })
    }

    updateAutofill = (e) => {
        let search = e.currentTarget.value

        let matches = this.state.allTickers.filter(
            (item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.ticker.toLowerCase().includes(search.toLowerCase())
        )
        this.setState({
            searchMatches: matches,
        })
    }

    getStockStats = (e) => {}

    render() {
        return (
            <>
                <div className="bg-blue w-full flex-center p-8">
                    <div className="container flex-center">
                        <div className="text-white">Enter a stock to learn all about it!</div>
                        <div class="relative">
                            <input
                                className=""
                                onChange={this.updateAutofill}
                                onFocus={() => this.setState({ searchActive: true })}
                                onBlur={() => window.setTimeout(() => this.setState({ searchActive: false }), 100)}
                                placeholder="Enter stock here..."
                                className="input"
                                ref={this.inputRef}
                            ></input>
                            {this.state.searchActive && (
                                <div class="absolute z-50 h-64 w-64 overflow-y-scroll bg-white shadow-md">
                                    {this.state.searchMatches.map((match) => (
                                        <div
                                            key={match.ticker}
                                            onClick={() => this.fetchStockData(match.ticker)}
                                            value={match.ticker}
                                            className="hover:bg-blue p-4"
                                        >
                                            <div>{match.name}</div>
                                            <div class="text-sm text-gray">{match.ticker}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <GraphWidget
                                timeseries={this.state.stockPriceData}
                                articleDates={this.state.articles.map((item) => item.dateOfPriceMove)}
                            />
                            <div class="flex flex-row flex-wrap">
                                {this.state.articles.map((article, i) => (
                                    <div class="bg-white rounded-md w-48 h-48 m-4">
                                        <div class="flex flex-row items-center">
                                            <div className="w-16 h-16">
                                                <svg height="16" width="10">
                                                    <circle cx="8" cy="8" r="8" fill={colors[i]} />
                                                </svg>
                                            </div>
                                            <div>{article.url}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue w-full flex-center p-8">
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            <div>
                                <div className="text-lg my-4">Some of the simple stats</div>
                                <div className="text-sm my-4">Let's see how the stock did on the chosen date.</div>

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DesktopDatePicker
                                        label="Date desktop"
                                        inputFormat="MM/dd/yyyy"
                                        value="2020-12-01"
                                        onChange={this.getStockStats}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div>High</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Low</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Intraday Volatility</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Volume</div>
                                    <div>1.2</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default FindStock
