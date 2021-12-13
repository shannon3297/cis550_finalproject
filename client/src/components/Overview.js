import React from "react"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"
import format from "date-fns/format"
import { Link } from "react-router-dom"

let SERVER_URL = "http://localhost:8080"

class Overview extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTicker: "",
            datePicked: "2021-2-20",
            stocksI: [{ industry: "loading...", intradayMovement: "loading..." }],
            stocksII: [{ industry: "loading...", numMentions: "loading..." }],
            stocksIII: [{ industry: "loading...", mentionIncrease: "loading...", avgRange: "loading..." }],
            stocksIV: [{ industry: "loading...", performance: "loading..." }],
        }
    }

    getStocksMostVolatility(date) {
        console.log("fetching stocks volatility", date)
        fetch(SERVER_URL + "/stocksBiggestVolatility" + (date ? "?date=" + date : ""))
            .then((res) => res.json())
            .then((result) => {
                console.log("results are", result.results)
                this.setState({ stocksI: result.results })
            })
    }

    formatMovement(number, fixed = 0, includePlus = true) {
        return (number > 0 && includePlus ? "+" : "") + (number * 100 - 100).toFixed(fixed) + "%"
    }

    fetchStockData() {
        this.getStocksMostVolatility(null)

        fetch(SERVER_URL + "/companiesWithMostPress") // industriesII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ stocksII: result.results })
            })

        fetch(SERVER_URL + "/stocksBiggestMovers") // industriesII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ stocksIII: result.results })
            })

        fetch(SERVER_URL + "/consistentMovers") // industriesIII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ stocksIV: result.results })
            })
    }

    componentDidMount() {
        this.fetchStockData()
    }

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
                <div className="bg-white w-full flex-center p-8 paddingBottom p-60">
                    {" "}
                    {/* Section I */}
                    <div style={sectionHeader}>I. intraday volatility</div>
                    <div style={subSection} className="text-sm my-4 text-center">
                        This measures how many percent higher the highest value of the day was than the lowest value.
                    </div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Top @ [Enter Date]
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                    Identify industries that saw the most intraday volatility on a given date.
                                </div>

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DesktopDatePicker
                                        label="Pick a Date!"
                                        inputFormat="yyyy-MM-dd"
                                        minDate={new Date(2020, 11, 1)}
                                        dateFormat="yyyy-MM-dd"
                                        maxDate={new Date(2021, 11, 1)}
                                        value={this.state.datePicked}
                                        onChange={(newValue) => {
                                            this.setState({ datePicked: newValue })
                                            this.getStocksMostVolatility(format(newValue, "yyyy-MM-dd"))
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Stock Ticker</div>
                                    {this.state.stocksI.map((v) => {
                                        return (
                                            <Link to={{ pathname: "/findstock", search: "?ticker=" + v.ticker }}>
                                                <h6 className="hover:underline" style={content}>
                                                    {v.ticker}{" "}
                                                </h6>
                                            </Link>
                                        )
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Movement</div>
                                    {this.state.stocksI.map((v) => {
                                        return (
                                            <h6 style={content}>
                                                {this.formatMovement(v.intradayMovement, 0, false)}{" "}
                                            </h6>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue text-white w-full flex-center p-8 paddingBottom p-60">
                    {" "}
                    {/* Section II */}
                    <div style={sectionHeader} className="text-lg my-4">
                        II. the famous ones
                    </div>
                    <div className="text-sm my-4">Over the last 30 days, what companies received the most press?</div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Industries in the news
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                    Here are the companies that received the most press on Wall Street Journal.
                                    articles.{" "}
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Stock</div>
                                    {this.state.stocksII.map((v) => {
                                        return <h6 style={content}>{v.ticker} </h6>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white w-full flex-center p-8 paddingBottom p-60">
                    {" "}
                    {/* Section III */}
                    <div style={sectionHeader} className="text-lg my-4">
                        III. soon risers
                    </div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Slow now, but starting to buzz
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                    Based on increased mentions of these stocks in WSJ, we expect them to start moving -
                                    either up or down. Soon! Specifically, if the stock has seen +50% increase in press
                                    coverage over the last 30 days, compared to the last 60 days, and has remained
                                    fairly price-constant, then we expect it to move soon.
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Industry</div>
                                    {this.state.stocksIII.map((v) => {
                                        return <h6 style={content}>{v.industry} </h6>
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Increase in mentions</div>
                                    {this.state.stocksIII.map((v) => {
                                        return <h6 style={content}>{v.mentionIncrease} </h6>
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Price Range</div>
                                    {this.state.stocksIII.map((v) => {
                                        return <h6 style={content}>{v.avgRange} </h6>
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue text-white w-full flex-center p-8 padding p-60">
                    {" "}
                    {/* Section IV */}
                    <div style={sectionHeader} className="text-lg my-4">
                        IV. What goes up must come down.
                    </div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Stocks that have been going up consistently for the last five days.
                                </div>
                                <div style={subHeading} className="text-sm my-4"></div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Ticker</div>
                                    {this.state.stocksIV.map((v) => {
                                        return (
                                            <Link to={{ pathname: "/findstock", search: "?ticker=" + v.ticker }}>
                                                <h6 className="hover:underline" style={content}>
                                                    {v.ticker}{" "}
                                                </h6>
                                            </Link>
                                        )
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Day 1 Change</div>
                                    {this.state.stocksIV.map((v) => {
                                        return (
                                            <h6 style={content}>
                                                {this.formatMovement(v.dayTwoClose / v.dayOneClose, 2)}
                                            </h6>
                                        )
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Day 2 Change</div>
                                    {this.state.stocksIV.map((v) => {
                                        return (
                                            <h6 style={content}>
                                                {this.formatMovement(v.dayThreeClose / v.dayTwoClose, 2)}
                                            </h6>
                                        )
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Day 3 Change</div>
                                    {this.state.stocksIV.map((v) => {
                                        return (
                                            <h6 style={content}>
                                                {this.formatMovement(v.dayFourClose / v.dayThreeClose, 2)}
                                            </h6>
                                        )
                                    })}
                                </div>
                                <div>
                                    <div style={columnHeader}>Day 4 Change</div>
                                    {this.state.stocksIV.map((v) => {
                                        return (
                                            <h6 style={content}>
                                                {this.formatMovement(v.dayFiveClose / v.dayFourClose, 2)}
                                            </h6>
                                        )
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
export default Overview
