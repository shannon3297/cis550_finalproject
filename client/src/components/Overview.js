import React from "react"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"
import format from "date-fns/format"
import { Link } from "react-router-dom"
import { SERVER_URL } from "../config"

class Overview extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTicker: "",
            datePicked: "2021-2-20",
            section3Date: "2021-10-14",
            stocksI: [{ ticker: "loading...", intradayMovement: "loading..." }],
            stocksII: [{ ticker: "loading...", score: "loading..." }],
            stocksIII: [{ ticker: "loading...", dailyMove: "loading..." }],
            stocksIV: [{ ticker: "loading...", performance: "loading..." }],
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

    getStocksBiggestMovement(date) {
        this.setState({
            stocksIII: [{ ticker: "loading...", dailyMove: "loading..." }],
        })
        console.log("fetching stocks movers", date)

        fetch(SERVER_URL + "/stocksBiggestMovers" + (date ? "?date=" + date : "")) // industriesII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ stocksIII: result.results })
            })
    }

    formatMovement(number, fixed = 0, includePlus = true) {
        if (isNaN(number)) {
            return number
        }
        return (number > 1 && includePlus ? "+" : "") + (number * 100 - 100).toFixed(fixed) + "%"
    }

    fetchStockData() {
        this.getStocksMostVolatility(null)

        fetch(SERVER_URL + "/companiesWithMostPress") // industriesII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ stocksII: result.results })
            })

        this.getStocksBiggestMovement(this.state.section3Date)

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
                                <div style={subHeading} className="text-sm my-4">
                                    ** Score is determined as 2 times the number of title mentions, plus the number of
                                    article content mentions.
                                </div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Stock</div>
                                    {this.state.stocksII.map((v) => {
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
                                    <div style={columnHeader}>Score</div>
                                    {this.state.stocksII.map((v) => {
                                        return <h6 style={content}>{v.score} </h6>
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
                        III. Biggest movers
                    </div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">
                                    Click on these stocks to see what happened recently!
                                </div>
                                <div style={subHeading} className="text-sm my-4">
                                    These are the stocks with the biggest moves (up or down) on the given trading day,
                                    relative to the previous day.
                                </div>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DesktopDatePicker
                                        label="Pick a Date!"
                                        inputFormat="yyyy-MM-dd"
                                        minDate={new Date(2020, 11, 1)}
                                        dateFormat="yyyy-MM-dd"
                                        maxDate={new Date(2021, 11, 1)}
                                        value={this.state.section3Date}
                                        onChange={(newValue) => {
                                            this.setState({ section3Date: newValue })
                                            this.getStocksBiggestMovement(format(newValue, "yyyy-MM-dd"))
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader}>Stock</div>
                                    {this.state.stocksIII.map((v) => {
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
                                    <div style={columnHeader}>Percent Change Since Previous Trading Day</div>
                                    {this.state.stocksIII.map((v) => {
                                        return <h6 style={content}>{this.formatMovement(v.dailyMove)} </h6>
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
