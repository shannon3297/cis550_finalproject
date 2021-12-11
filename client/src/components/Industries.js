import React from "react"
import moment from "moment"
import GraphWidget from "./GraphWidget"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"

const colors = ["red", "yellow", "green", "black", "white"]
let SERVER_URL = "http://localhost:8080"

class Industries extends React.Component {
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
                <div className="bg-white w-full flex-center p-8"> {/* Section I */}
                    <div className="text-lg my-4">I. intraday volatility</div>
                    <div className="text-sm my-4">This measure uses the highest and lowest  prices of the day.</div>
                    <div className="container flex-center"> {/*Row #1: Some of the simple stats */}
                        <div className="flex flex-apart text-black">
                            <div>
                                
                                <div className="text-lg my-4">Top @ [Enter Date]</div>
                                <div className="text-sm my-4">Identify industries that saw the most intraday volatility on a given date.</div>
                            
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
                                    <div>Industry</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Movement</div>
                                    <div>1.2</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue text-white w-full flex-center p-8"> {/* Section II */}
                    <div className="text-lg my-4">II. the famous ones</div>
                    <div className="text-sm my-4">Over the last.</div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            <div>
                                <div className="text-lg my-4">Industries in the news</div>
                                <div className="text-sm my-4">Here’s the industries receiving the top 3 number of company mentions in WSJ articles. </div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div>Industry</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>News Mentions</div>
                                    <div>1.2</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white w-full flex-center p-8"> {/* Section III */}
                    <div className="text-lg my-4">III. soon risers</div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div className="text-lg my-4">Slow now, but starting to buzz</div>
                                <div className="text-sm my-4">Based on increased mentions of these stocks in WSJ, we expect them to start moving - either up or down. Soon!
                                                              Specifically, if the stock has seen +50% increase in press coverage over the last 30 days, compared to the last 60 days, and has remained fairly price-constant, then we expect it to move soon.</div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div>Industry</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Increase in mentions</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Price Range</div>
                                    <div>1.2</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue text-white w-full flex-center p-8"> {/* Section IV */}
                    <div className="text-lg my-4">IV. yesterday is yesterday</div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            <div>
                                <div className="text-lg my-4">Industry performance yesterday</div>
                                <div className="text-sm my-4">Based on yesterday’s performance of companies in the particular industries, we sort them based on best to worst performance.</div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div>Industry</div>
                                    <div>1.2</div>
                                </div>
                                <div>
                                    <div>Performance</div>
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

export default Industries
