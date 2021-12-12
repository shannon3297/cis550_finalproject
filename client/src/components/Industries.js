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
            industriesI: [{industry: 'loading', intradayMovement: 'loading...'}],
            industriesII: [{industry: 'loading...', numMentions: 'loading...'}],
            industriesIII: [{industry: 'loading...', mentionIncrease: 'loading...', avgRange: 'loading...'}],
            industriesIV: [{industry: 'loading...', performance: 'loading...'}]
        }
        // this.inputRef = React.createRef()
    }

    dateToUnix = (dateString) => {
        const toDate = moment(dateString, "DD-MM-YY").toDate()
        const toUnix = toDate.getTime()
        return toUnix
    }

    componentDidMount() {
        fetch(SERVER_URL + "/industriesMostVolatility") // industriesI
            .then((res) => res.json())
            .then((result) => {
                this.setState({ industriesI: result.results })
            })
        
        fetch(SERVER_URL + "/industriesMostPress") // industriesII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ industriesII: result.results })
            })
        
        fetch(SERVER_URL + "/industriesToMoveSoon") // industriesIII
            .then((res) => res.json())
            .then((result) => {
                this.setState({ industriesIII: result.results })
            })
        
        fetch(SERVER_URL + "/industriesPerformance") // industriesIV
            .then((res) => res.json())
            .then((result) => {
                this.setState({ industriesIV: result.results })
            })
    }
    
    render() {
        return (
            <>
                <div className="bg-white w-full flex-center p-8">           {/* Section I */}
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
                                    {this.state.industriesI.map((v) => {return( <h6>{v.industry} </h6>)})}
                                </div>
                                <div>
                                    <div>Movement</div>
                                    {this.state.industriesI.map((v) => {return( <h6>{v.intradayMovement} </h6>)} )}
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
                                    {this.state.industriesII.map((v) => {return( <h6>{v.industry} </h6>)} )}
                                </div>
                                <div>
                                    <div>News Mentions</div>
                                    {this.state.industriesII.map((v) => {return( <h6>{v.numMentions} </h6>)} )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white w-full flex-center p-8">           {/* Section III */}
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
                                    {this.state.industriesIII.map((v) => {return( <h6>{v.industry} </h6>)} )}
                                </div>
                                <div>
                                    <div>Increase in mentions</div>
                                    {this.state.industriesIII.map((v) => {return( <h6>{v.mentionIncrease} </h6>)} )}
                                </div>
                                <div>
                                    <div>Price Range</div>
                                    {this.state.industriesIII.map((v) => {return( <h6>{v.avgRange} </h6>)} )}
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
                                    {this.state.industriesIV.map((v) => {return( <h6>{v.industry} </h6>)} )}
                                </div>
                                <div>
                                    <div>Performance</div>
                                    {this.state.industriesIV.map((v) => {return( <h6>{v.performance} </h6>)} )}
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
