import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Sobre from "./components/pages/Sobre"
import Servicos from "./components/pages/Servicos"
import Contato from "./components/pages/Contato"
import Page404 from "./components/pages/Page404";
import PaginaBase from './components/pages/PaginaBase'
import Tecnico from './components/pages/Tecnico'

function AppRoutes () {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <PaginaBase /> }>
                    <Route index path="/" element={ <Home /> }></Route>
                    <Route path="/sobre" element={ <Sobre /> }></Route>
                    <Route path="/servicos" element={ <Servicos /> }></Route>
                    <Route path="/contato" element={ <Contato /> }></Route>
                    <Route path="/page404" element={ <Page404 /> }></Route>
                    <Route path="/Tecnico" element={ <Tecnico />}></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes