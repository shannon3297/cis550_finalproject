import React from "react"
import GraphWidget from "./GraphWidget"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"

let SERVER_URL = "http://localhost:8080"

class SingleStock extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allTickers: [],
            activeTicker: "",
            searchMatches: [],
            stockPriceData: [],
        }
        this.inputRef = React.createRef()
    }

    componentDidMount() {
        fetch(SERVER_URL + "/allStocks")
            .then((res) => res.json())
            .then((result) => {
                this.setState({ allTickers: result, searchMatches: result })
            })
    }

    fetchStockData(ticker) {
        console.log(ticker)
        //let ticker = e.target.value
        this.inputRef.current.value = ticker

        fetch(SERVER_URL + "/stockData")
            .then((res) => res.json())
            .then((result) => {
                console.log("result is", result)
                this.setState({ stockPriceData: result })
            })

        this.setState({
            searchActive: false,
        })
    }

    updateAutofill = (e) => {
        let search = e.currentTarget.value
        let matches = this.state.allTickers.filter(
            (item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.value.toLowerCase().includes(search.toLowerCase())
        )
        console.log("matches are", matches)
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
                                placeholder="Enter stock here..."
                                className="input"
                                ref={this.inputRef}
                            ></input>
                            {this.state.searchActive && (
                                <div class="absolute z-50 h-64 w-64 overflow-y-scroll bg-white shadow-md">
                                    {this.state.searchMatches.map((match) => (
                                        <div
                                            key={match.value}
                                            onClick={() => this.fetchStockData(match.value)}
                                            value={match.value}
                                            className="hover:bg-blue p-4"
                                        >
                                            <div>{match.name}</div>
                                            <div class="text-sm text-gray">{match.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <GraphWidget timeseries={this.state.stockPriceData} />
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

export default SingleStock
