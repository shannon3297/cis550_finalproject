import React from "react"
import moment from "moment"
import GraphWidget from "./GraphWidget"
import TextField from "@mui/material/TextField"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import DesktopDatePicker from "@mui/lab/DesktopDatePicker"
import format from "date-fns/format"

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
            datePicked: "2021-2-20",
            industriesI: [{industry: 'loading...', intradayMovement: 'loading...'}],
            industriesII: [{industry: 'loading...', numMentions: 'loading...'}],
            industriesIII: [{industry: 'loading...', mentionIncrease: 'loading...', avgRange: 'loading...'}],
            industriesIV: [{industry: 'loading...', performance: 'loading...'}]
        }
        // this.inputRef = React.createRef()
    }

    // dateToUnix = (dateString) => {
    //     const toDate = moment(dateString, "DD-MM-YY").toDate()
    //     const toUnix = toDate.getTime()
    //     return toDate
    // }

    componentDidMount() {
        fetch(SERVER_URL + "/industriesMostVolatility") // industriesI ?date=" + this.state.datePicked
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
        const sectionHeader = {
            // paddingTop: '120px',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '48px',
            letterSpacing: '0.20000000298023224px',
            textAlign: 'center'
        };

        const subSection = {
        };

        const Heading = {
            fontSize: '20px',

            paddingTop: '100px',
            fontWeight: "bold"
        };

        const subHeading = {
            width: "400px",
            paddingRight: '50px',
            paddingBottom: '30px',
            textAlign: 'justify'

        };

        const columnHeader = {
            paddingTop: '100px',

            width: "200px",
            fontWeight: "bold",
            padding: '10px'
        };

        const content = {
            padding: '10px'
        };


      
        return (
            <>  
                
                <div className="bg-white w-full flex-center p-8 paddingBottom p-60">           {/* Section I */}
                    <div style={sectionHeader} >I. intraday volatility</div>
                    <div style={subSection} className="text-sm my-4">This measure uses the highest and lowest  prices of the day.</div>
                    <div className="container flex-center"> 
                        <div className="flex flex-apart text-black">
                            <div>
                                
                                <div style={Heading} className="text-lg my-4">Top @ [Enter Date]</div>
                                <div style={subHeading} className="text-sm my-4">Identify industries that saw the most intraday volatility on a given date.</div>
                            
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DesktopDatePicker
                                        label="Pick a Date!"
                                        inputFormat="yyyy-MM-dd"
                                        minDate={new Date(2020, 11, 1)}
                                        dateFormat="yyyy-MM-dd"
                                        maxDate={new Date(2021, 11, 1)}
                                        value={this.state.datePicked}  
                                        onChange={(newValue) => {
                                            this.state.datePicked = format(newValue, "yyyy-MM-dd");
                                            // setValue(newValue)
                                            // console.log(this.state.datePicked)
                                            {/*THIS STUPID THING ISNT CHANGING ON TIME!*/}
                                          }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader} >Industry</div>
                                    {this.state.industriesI.map((v) => {return( <h6 style={content}>{v.industry} </h6>)})}
                                </div>
                                <div>
                                    <div style={columnHeader} >Movement</div>
                                    {this.state.industriesI.map((v) => {return( <h6 style={content}>{v.intradayMovement} </h6>)} )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue text-white w-full flex-center p-8 paddingBottom p-60"> {/* Section II */}
                    <div style={sectionHeader} className="text-lg my-4">II. the famous ones</div>
                    <div className="text-sm my-4">Over the last 30 days, some industries were popular!</div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            
                            
                            <div>
                                <div style={Heading} className="text-lg my-4">Industries in the news</div>
                                <div style={subHeading} className="text-sm my-4">Here’s the industries receiving the top 3 number of company mentions in WSJ articles. </div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader} >Industry</div>
                                    {this.state.industriesII.map((v) => {return( <h6 style={content}>{v.industry} </h6>)} )}
                                </div>
                                <div>
                                    <div style={columnHeader} >News Mentions</div>
                                    {this.state.industriesII.map((v) => {return( <h6 style={content}>{v.numMentions} </h6>)} )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white w-full flex-center p-8 paddingBottom p-60">           {/* Section III */}
                    <div style={sectionHeader} className="text-lg my-4">III. soon risers</div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-black">
                            <div>
                                <div style={Heading} className="text-lg my-4">Slow now, but starting to buzz</div>
                                <div style={subHeading} className="text-sm my-4">Based on increased mentions of these stocks in WSJ, we expect them to start moving - either up or down. Soon!
                                                              Specifically, if the stock has seen +50% increase in press coverage over the last 30 days, compared to the last 60 days, and has remained fairly price-constant, then we expect it to move soon.</div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader} >Industry</div>
                                    {this.state.industriesIII.map((v) => {return( <h6 style={content}>{v.industry} </h6>)} )}
                                </div>
                                <div>
                                    <div style={columnHeader} >Increase in mentions</div>
                                    {this.state.industriesIII.map((v) => {return( <h6 style={content}>{v.mentionIncrease} </h6>)} )}
                                </div>
                                <div>
                                    <div style={columnHeader} >Price Range</div>
                                    {this.state.industriesIII.map((v) => {return( <h6 style={content}>{v.avgRange} </h6>)} )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue text-white w-full flex-center p-8 padding p-60"> {/* Section IV */}
                    <div style={sectionHeader} className="text-lg my-4">IV. yesterday is yesterday</div>
                    <div className="text-sm my-4"></div>
                    <div className="container flex-center">
                        <div className="flex flex-apart text-white">
                            <div>
                                <div style={Heading} className="text-lg my-4">Industry performance yesterday</div>
                                <div style={subHeading} className="text-sm my-4">Based on yesterday’s performance of companies in the particular industries, we sort them based on best to worst performance.</div>
                            </div>
                            <div className="flex flex-row">
                                <div>
                                    <div style={columnHeader} >Industry</div>
                                    {this.state.industriesIV.map((v) => {return( <h6 style={content}>{v.industry} </h6>)} )}
                                </div>
                                <div>
                                    <div style={columnHeader} >Performance</div>
                                    {this.state.industriesIV.map((v) => {return( <h6 style={content}>{v.performance} </h6>)} )}
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
