import React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import moment from "moment"
function GraphWidget({ timeseries }) {
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

    return (
        // A react-chart hyper-responsively and continuously fills the available
        // space of its parent element automatically
        <div
            style={{
                width: "400px",
                height: "300px",
            }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart width={500} height={300} data={timeseries}>
                    <XAxis
                        dataKey="date"
                        domain={["auto", "auto"]}
                        name="date"
                        tickFormatter={(unixTime) => moment(unixTime).format("DD-MM-YY")}
                        type="number"
                    ></XAxis>
                    <YAxis />
                    <Line type="monotone" dataKey="close" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default GraphWidget
