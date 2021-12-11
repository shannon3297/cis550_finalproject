import logo from "./logo.svg"
import "./App.css"
import Nav from "./components/Nav"
import Overview from "./components/Overview"
import Industries from "./components/Industries"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import FindStock from "./components/FindStock"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <BrowserRouter>
                <div className="App">
                    <Nav></Nav>
                    <Routes>
                        <Route path="/overview" element={<Overview></Overview>} />
                        <Route path="/findstock" element={<FindStock></FindStock>} />
                        <Route path="/industries" element={<Industries></Industries>} />
                    </Routes>
                </div>
            </BrowserRouter>
        </LocalizationProvider>
    )
}

export default App
