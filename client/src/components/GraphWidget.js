import React, { useEffect } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts"
import moment from "moment"

const colors = ["red", "yellow", "green", "black", "purple"]

function GraphWidget({ timeseries, articleDates }) {
    const data = React.useMemo(
        () => [
            {
                label: "Series 1",
                data: timeseries,
            },
        ],
        [timeseries]
    )

    const axes = React.useMemo(
        () => [
            { primary: true, type: "time", position: "bottom" },
            { type: "linear", position: "left" },
        ],
        []
    )

    const CustomizedDot = (props) => {
        const { cx, cy, stroke, payload, value } = props

        let index = articleDates.indexOf(payload.stringDate)
        if (index != -1) {
            return <circle cx={cx} cy={cy} r={4} style={{ opacity: "0.9" }} fill={colors[index]} />
        }

        return null
    }

    return (
        // A react-chart hyper-responsively and continuously fills the available
        // space of its parent element automatically
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                width={700}
                height={400}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                }}
                data={timeseries}
            >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="white" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="white" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    stroke="white"
                    dataKey="numericalDate"
                    domain={["auto", "auto"]}
                    name="date"
                    tickFormatter={(unixTime) => moment(unixTime).format("MM/DD/YY")}
                    type="number"
                ></XAxis>
                <YAxis stroke="white" domain={["auto", "auto"]} />
                <Area
                    type="monotone"
                    dataKey="close"
                    stroke="white"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    dot={<CustomizedDot />}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export default GraphWidget
