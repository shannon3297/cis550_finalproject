import { Link } from "react-router-dom"

function Nav() {
    return (
        <div className="container">
            <div className="flex-apart py-4">
                <img class="h-12" src={require("../img/logo.png").default} />
                <div class="flex flex-row space-x-6">
                    <Link to="/home">Home</Link>
                    <Link to="/stock">Stock</Link>
                </div>
            </div>
        </div>
    )
}

export default Nav
