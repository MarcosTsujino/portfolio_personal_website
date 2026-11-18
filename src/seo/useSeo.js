import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { dadosDaPagina } from './paginas'

function definirMeta(seletor, atributo, valor) {
    const elemento = document.head.querySelector(seletor)
    if (elemento) elemento.setAttribute(atributo, valor)
}

// Atualiza título, descrição, canonical e Open Graph a cada troca de rota
export function useSeo() {
    const { pathname } = useLocation()
    useEffect(() => {
        const { titulo, descricao, url, existe } = dadosDaPagina(pathname)
        document.title = titulo
        definirMeta('meta[name="description"]', 'content', descricao)
        definirMeta('meta[property="og:title"]', 'content', titulo)
        definirMeta('meta[property="og:description"]', 'content', descricao)
        definirMeta('meta[property="og:url"]', 'content', url)
        definirMeta('link[rel="canonical"]', 'href', url)
        definirMeta('meta[name="robots"]', 'content', existe ? 'index, follow' : 'noindex')
    }, [pathname])
}
