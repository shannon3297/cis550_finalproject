import { Link } from "react-router-dom"

function Nav() {
    return (
        <div className="container">
            <div className="flex-apart py-4">
                <img class="h-12" src={require("../img/logo.png").default} />
                <div class="flex flex-row space-x-6">
                    <Link to="/" className="hover:underline">
                        Home
                    </Link>
                    <Link to="/findstock" className="hover:underline">
                        Find a Stock
                    </Link>
                    <Link to="/industries" className="hover:underline">
                        Industries
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Nav
