import React from "react"

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTicker: "",
        }
    }

    fetchStockData() {}

    render() {
        return (
            <div>
                <input className="" onChange={(e) => this.setState({ activeTicker: e.target.value })}></input>
            </div>
        )
    }
}
export default Home
