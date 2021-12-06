import logo from "./logo.svg"
import "./App.css"
import Nav from "./components/Nav"
import Home from "./components/Home"
import Industries from "./components/Industries"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import SingleStock from "./components/SingleStock"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <BrowserRouter>
                <div className="App">
                    <Nav></Nav>
                    <Routes>
                        <Route path="/home" element={<Home></Home>} />
                        <Route path="/stock" element={<SingleStock></SingleStock>} />
                    </Routes>
                </div>
            </BrowserRouter>
        </LocalizationProvider>
    )
}

export default App
