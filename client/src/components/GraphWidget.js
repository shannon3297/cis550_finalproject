import React from "react"
import { Chart } from "react-charts"

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
            <Chart data={data} axes={axes} />
        </div>
    )
}

export default GraphWidget
