export const SITE = 'https://marcostsujino.vercel.app'

// Título e descrição de cada rota (o que aparece no Google, na aba e no histórico)
export const PAGINAS = {
    '/': {
        titulo: 'Marcos Tsujino | Desenvolvedor: Python, React e automação',
        descricao:
            'Portfólio de Marcos Tsujino, desenvolvedor com base em eletrônica e instrumentação: Python, React, OpenCV e automação.',
    },
    '/sobre': {
        titulo: 'Sobre | Marcos Tsujino',
        descricao:
            'Trajetória de Marcos Tsujino: oito anos em eletrônica e instrumentação, formação em Controle e Automação e em Análise e Desenvolvimento de Sistemas.',
    },
    '/projetos': {
        titulo: 'Projetos | Marcos Tsujino',
        descricao:
            'Projetos de Marcos Tsujino: medidor de objetos com OpenCV, calculadora de temperatura e MKT em React e este portfólio.',
    },
    '/calculadora': {
        titulo: 'Calculadora de temperatura e MKT | Marcos Tsujino',
        descricao:
            'Carregue o CSV de um datalogger e veja mínima, máxima, média, MKT, excursões e o gráfico da faixa aceitável, tudo no navegador.',
    },
    '/servicos': {
        titulo: 'Serviços | Marcos Tsujino',
        descricao: 'Automação com Python, integração de dispositivos e dados e documentação técnica em português, inglês e espanhol.',
    },
    '/contato': {
        titulo: 'Contato | Marcos Tsujino',
        descricao: 'Fale com Marcos Tsujino sobre vagas ou projetos por WhatsApp, e-mail, LinkedIn ou GitHub.',
    },
}

export const PAGINA_404 = {
    titulo: 'Página não encontrada | Marcos Tsujino',
    descricao: 'O endereço que você abriu não existe ou mudou de lugar.',
}

// "/sobre/" e "/sobre" são a mesma página
export function normalizar(caminho) {
    return caminho !== '/' ? caminho.replace(/\/+$/, '') : caminho
}

export function dadosDaPagina(caminho) {
    const normal = normalizar(caminho)
    const pagina = PAGINAS[normal]
    return pagina
        ? { ...pagina, url: `${SITE}${normal}`, existe: true }
        : { ...PAGINA_404, url: `${SITE}/`, existe: false }
}
