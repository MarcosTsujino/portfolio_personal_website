import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Sobre from "./components/pages/Sobre"
import Servicos from "./components/pages/Servicos"
import Projetos from "./components/pages/Projetos"
import Calculadora from "./components/pages/Calculadora"
import Contato from "./components/pages/Contato"
import Page404 from "./components/pages/Page404";
import PaginaBase from './components/pages/PaginaBase'

function AppRoutes () {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <PaginaBase /> }>
                    <Route index path="/" element={ <Home /> }></Route>
                    <Route path="/sobre" element={ <Sobre /> }></Route>
                    <Route path="/projetos" element={ <Projetos /> }></Route>
                    <Route path="/calculadora" element={ <Calculadora /> }></Route>
                    <Route path="/servicos" element={ <Servicos /> }></Route>
                    <Route path="/contato" element={ <Contato /> }></Route>
                    <Route path="/page404" element={ <Page404 /> }></Route>
                    <Route path="*" element={ <Page404 /> }></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes