import React from "react"
import moment from "moment"
import GraphWidget from "./GraphWidget"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"
import format from "date-fns/format"


let SERVER_URL = "http://localhost:8080"

const colors = ["red", "yellow", "green", "black", "purple"]

class FindStock extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allTickers: [],
            activeTicker: "",
            searchMatches: [],
            stockPriceData: [],
            articles: [],
            simpleStats: [{minMove: "loading...", maxMove: "loading...", avgMove: "loading..."}],
            currPrice: 'loading...',
            recentArticles: [{title: "loading...", date: 'loading...', url: ""}],
            bigMovers: []
        }
        this.inputRef = React.createRef()
    }

    dateToUnix = (dateString) => {
        const toDate = moment(dateString, "DD-MM-YY").toDate()
        const toUnix = toDate.getTime()
        return toUnix
    }

    getRecentArticles() {
        console.log(this.state.activeTicker)
        let url = SERVER_URL + "/stockStats" 
            + (this.state.activeTicker ? "?ticker=" + this.state.activeTicker : "")
        console.log(url)
        fetch(url)
            .then((res) => res.json())
            .then((result) => {
                console.log("results are", result.results)
                this.setState({ recentArticles: result.results })
            })
    }

    getSimpleStats(date) {
        console.log(this.state.activeTicker)
        let url = SERVER_URL + "/stockStats" 
            + (date ? "?startday=" + date : "")
            + (date ? "&endday=" + date : "")
            + (this.state.activeTicker ? "&ticker=" + this.state.activeTicker : "")
        console.log(url)
        fetch(url)
            .then((res) => res.json())
            .then((result) => {
                console.log("results are", result.results)
                this.setState({ simpleStats: result.results })
            })
    }

    getBigMovers(date) {
        let url = SERVER_URL + "/stockStats" 
            + (date ? "?date=" + date : "")
        console.log(url)
        fetch(url)
            .then((res) => res.json())
            .then((result) => {
                console.log("results are", result.results)
                this.setState({ bigMovers: result.results })
            })
    }

    getCurrPrice() {
        fetch('https://finnhub.io/api/v1/quote?symbol=' + this.state.activeTicker + '&token=c6r6djiad3i891nj8vfg') // LIVE STOCK PRICE
            .then((res) => res.json())
            .then((result) => {
                this.state.currPrice = result.c
                console.log('Got the live price: ', result.c)
            })
    }


    

    componentDidMount() {

        this.getBigMovers(null)

        fetch(SERVER_URL + "/allStocks")
            .then((res) => res.json())
            .then((result) => {
                this.setState({ allTickers: result.results, searchMatches: result.results })
            })

        const sp = new URLSearchParams(window.location.search)
        if (sp.has("ticker")) {
            console.log("getting", sp.get("ticker"))
            this.fetchStockData(sp.get("ticker"))
        }

    }

    fetchStockData(ticker) {
        this.state.activeTicker = ticker
        console.log(ticker)
        //let ticker = e.target.value
        if (this.inputRef.current) {
            this.inputRef.current.value = ticker
        }

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

        const sectionHeader = {
            // paddingTop: '120px',
            fontSize: "40px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "48px",
            letterSpacing: "0.20000000298023224px",
            textAlign: "center",
        }

        const subSection = {}

        const Heading = {
            fontSize: "20px",

            paddingTop: "100px",
            fontWeight: "bold",
        }

        const subHeading = {
            width: "400px",
            paddingRight: "50px",
            paddingBottom: "30px",
            textAlign: "justify",
        }

        const columnHeader = {
            paddingTop: "100px",

            width: "200px",
            fontWeight: "bold",
            padding: "10px",
        }

        const content = {
            padding: "10px",
        }

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
                        <div className="text-white">Live current price: { this.state.currPrice }</div>

                        <div className="p-4 flex-center w-full">
                            <div class="h-96 w-full">
                                <GraphWidget
                                    timeseries={this.state.stockPriceData}
                                    articleDates={this.state.articles.map((item) => item.dateOfPriceMove)}
                                />
                            </div>
                            <div class="flex flex-row flex-wrap justify-center">
                                {this.state.articles.map((article, i) => (
                                    <a class="bg-white rounded-md w-56 h-56 m-4 p-4" href={article.url} target="_blank">
                                        <div class="flex flex-row items-center">
                                            <div className="w-16 h-16">
                                                <svg height="16" width="16">
                                                    <circle cx="8" cy="8" r="8" fill={colors[i]} />
                                                </svg>
                                            </div>
                                            <div class="font-bold">{article.title}</div>
                                        </div>
                                        <div class="font-sm line-clamp-4">{article.content}</div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white w-full flex-center p-8 paddingBottom p-60">
                    {" "}
                    {/* Section I */}
                    <div style={sectionHeader}>I. simple start</div>
                    <div style={subSection} className="text-sm my-4">
                        To start off, let's keep it simple including just the basics.
                    </div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Some of the simple stats
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                    Let's see how the stock did on the chosen date.
                                </div>

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DesktopDatePicker
                                        label="Pick a Date!"
                                        inputFormat="yyyy-MM-dd"
                                        minDate={new Date(2020, 10, 1)}
                                        dateFormat="yyyy-MM-dd"
                                        maxDate={new Date(2021, 10, 31)}
                                        value={this.state.datePicked}
                                        onChange={(newValue) => {
                                            this.setState({ datePicked: newValue })
                                            this.getSimpleStats(format(newValue, "yyyy-MM-dd"))
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Min Movement</div>
                                    {this.state.simpleStats.map((v) => {
                                        return <h6 style={content}>{v.minMove} </h6>
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Max Movement</div>
                                    {this.state.simpleStats.map((v) => {
                                        return <h6 style={content}>{v.maxMove} </h6>
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Avg Movement</div>
                                    {this.state.simpleStats.map((v) => {
                                        return <h6 style={content}>{v.avgMove} </h6>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue w-full flex-center p-8 paddingBottom p-60">
                    {" "}
                    {/* Section II */}
                    <div style={sectionHeader}>II. recent fame</div>
                    <div style={subSection} className="text-sm my-4">
                    </div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Explore recent articles
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                    These are the most recent articles to date concerning this company.
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <div> {/* TODO Add link to redirect externally! */}
                                    <div style={columnHeader}>Title</div>
                                    {this.state.recentArticles.map((v) => {
                                        return <h6 style={content}>{v.title} </h6>
                                    })} 
                                </div>
                                <div>
                                    <div style={columnHeader}>Date</div>
                                    {this.state.recentArticles.map((v) => {
                                        return <h6 style={content}>{v.date} </h6>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white w-full flex-center p-8 paddingBottom p-60">
                    {" "}
                    {/* Section III */}
                    <div style={sectionHeader}>III. @mention and jump</div>
                    <div style={subSection} className="text-sm my-4">
                        The whole world knows about it, once it's in the news.
                    </div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Impact of news on stocks
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                We rank the average ratios of how the daily price movement of each stock compares to the times it got mentioned in WSJ.
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Stock</div>
                                    {this.state.bigMovers.map((v) => {
                                        return <h6 style={content}>{v.ticker} </h6>
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Ratio</div>
                                    {this.state.bigMovers.map((v) => {
                                        return <h6 style={content}>{v.dailyMove} </h6>
                                    })}
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
