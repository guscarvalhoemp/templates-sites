# Lições — projeto templates sites

## 1. Identidade ≠ paleta. Identidade = paradigma de interação.
**Erro repetido 3 rodadas:** variei cor, fonte e ordem de seções achando que isso criava sites distintos. O usuário disse "os sites ainda estão no fundo bem parecidos" porque todos usavam o mesmo vocabulário: grid de cards com ícone, barra de contadores, timeline numerada, strip de depoimentos, CTA+form.
**Regra:** antes de delegar qualquer site, definir um paradigma de interação EXCLUSIVO + ≥2 interações que nenhum outro site do conjunto tem, e listar no briefing os componentes dos outros sites como PROIBIDOS.

## 2. Quando o usuário cita uma referência, extrair os dados concretos EU MESMO antes de delegar.
**Erro:** o usuário pediu "mais parecido com o coffee shop" e eu repassei a instrução vaga ao agente, que manteve Cormorant Garamond. O usuário teve que repetir: "você esqueceu que eu disse...".
**Regra:** grep nos arquivos da referência (font-family, border-radius, transforms) e colocar os valores reais no briefing. Coffee-shop = Inter + manuscrita (Messy Handwritten → Caveat), molduras de raio enorme (arco/círculo/pílula), selo circular giratório.

## 3. Screenshot em branco no painel de teste NÃO prova que é artefato — nem que é bug.
**Erro:** vi elementos presos em opacity:0 e concluí "rAF congelado no painel oculto, não é bug". O usuário depois reportou seções vazias no navegador real. Era bug real (CSS pré-escondia `.reveal` → `gsap.from()` animava 0→0).
**Regra:** avançar o ticker manualmente (`gsap.globalTimeline.seek(9999)` / `gsap.ticker.tick()`) E inspecionar o código. Só é artefato se, com o ticker avançado, o elemento chega ao estado final.

## 4. Bugs de GSAP que já apareceram neste projeto (checar sempre)
- CSS `.classe-js .reveal{opacity:0}` + `gsap.from()` → 0→0, conteúdo invisível. Usar `fromTo()` com destino explícito ou `gsap.set()` no JS.
- `gsap.quickSetter(el,'scale')` é no-op no GSAP 3.13 — usar `scaleX` + `scaleY`.
- `gsap.matchMedia()` com condições não exaustivas → callback nunca roda em algumas telas.
- `overflow-x:hidden` no body pode quebrar `position:sticky`/pin.
- Grid blowout: `min-width:0` em flex/grid com e-mail ou `<select>` longo.

## 5. Agentes em paralelo batem no limite de sessão
4 agentes pesados em paralelo derrubaram tudo 2 vezes no meio da verificação. Os arquivos sobreviveram, mas o QA não. **Regra:** checar mtimes após queda; relançar só o que parou, com briefing de "verificar e finalizar", nunca reconstruir. Agentes sobrescrevem `.claude/launch.json` — restaurar depois.
**Atualização:** 5 agentes em paralelo só para ESCREVER arquivos (sem abrir o Browser pane em nenhum deles) rodou sem queda — o problema é o Browser pane compartilhado, não os agentes em si. Regra revisada: pode paralelizar a escrita à vontade, mas instrua cada agente a NÃO abrir preview/Browser pane; faça a verificação visual você mesmo, depois, um site de cada vez.

## 6. Abrir `file://` direto no Browser pane não carrega CSS/recursos — sempre suba um servidor
Navegar para `file:///C:/.../index.html` renderiza sem estilos (fallback do navegador: links azuis, bullets padrão) mesmo com o `<link rel="stylesheet">` correto. **Regra:** sempre usar `preview_start` com a config de `.claude/launch.json` (servidor `python -m http.server`) e navegar via `http://localhost:PORT/...`, nunca `file://`, para qualquer verificação visual.

## 7. `position:fixed` some/quebra quando um ANCESTRO ganha `backdrop-filter` (ou `filter`/`transform`/`contain`/`container-type`)
**Bug real (estética, header com menu mobile fullscreen):** o menu mobile é `position:fixed;inset:0` dentro do `<header>`. Ao rolar, o header ganha classe `.is-scrolled` que aplica `backdrop-filter:blur()` diretamente nele — isso cria um novo *containing block* para os descendentes fixed, então o menu "fullscreen" passa a preencher só a caixinha de ~60px do header em vez da viewport inteira, e os links do menu aparecem como uma faixa sobreposta ao conteúdo.
**Regra:** nunca aplicar `backdrop-filter`/`filter`/`transform`/`will-change:transform`/`contain:layout|paint`/`container-type` diretamente num elemento que seja ANCESTRO de algo `position:fixed` cuja área deva cobrir a viewport inteira. Se precisar do efeito visual (ex: header com vidro fosco ao rolar), aplique num `::before`/wrapper interno, nunca no elemento que contém o fixed. Ao depurar "fixed com inset:0 mas altura errada", sempre checar a cadeia de ancestrais para essas propriedades (inclusive condicionadas a uma classe como `.is-scrolled`, que só aparece DEPOIS de rolar — testar sempre com scroll).

## 8. Flex com `min-width:0` num item e `flex:none` no vizinho pode espremer o item a quase 0, não só estourar
Variante do item 4 (grid blowout): no card de produto do e-commerce, `.product-price{min-width:0}` ao lado de `.product-buy{flex:none}` num container `flex;nowrap` estreito (grid de 2 colunas no mobile) fez o preço encolher para ~24px de largura e o texto "R$ 54,90" quebrar linha por caractere, sobrepondo o botão. `min-width:0` remove o piso de encolhimento — sem ele o flex não estoura, mas ele sozinho não garante espaço, só permite encolher além do conteúdo.
**Regra:** ao colocar preço/texto curto + botão de largura fixa num flex row estreito, prefira `flex-wrap:wrap` (empilha se não couber) + `white-space:nowrap` no texto (nunca deixa quebrar caractere a caractere) em vez de confiar só em `min-width:0`.

## 9. GSAP `xPercent` + CSS `transform: translateX(%)` pré-existente somam (dobram o deslocamento)
**Bug real (e-commerce, drawer do carrinho):** CSS definia `.cart-drawer{transform:translateX(100%)}` como estado fechado (fallback sem JS). O JS fazia `gsap.set(cartDrawer,{xPercent:100})` para "fechar" via GSAP. Resultado: fechava a 200% (776px numa caixa de 388px), porque o GSAP, ao tocar o elemento pela primeira vez, parseia o `transform` computado (já resolvido em px pelo navegador) como um componente `x` fixo, e depois `xPercent` soma por cima em vez de substituir.
**Regra:** se o CSS já define um `transform: translateX(%)`/`translateY(%)` como estado inicial (para fallback sem JS), ao assumir esse elemento via GSAP sempre zere o componente correspondente explicitamente: `gsap.set(el, { x: 0, xPercent: 100 })` (não só `{xPercent:100}`). Ou, mais simples: não duplique o sistema — deixe o CSS cuidar só do fallback `[data-open]`/classe, e o JS sempre usar GSAP desde o primeiro frame (sem transform de CSS concorrente).

## 10. `[hidden]` some se qualquer regra CSS posterior/mais específica setar `display` na mesma classe
**Bug real (gastronomia, menu mobile):** `.mobile-nav{ display:flex; ... }` sem media query, no elemento que também tem o atributo `hidden` no HTML. Como `display:flex` do autor tem mais especificidade que o `[hidden]{display:none}` do UA stylesheet, o menu ficava **permanentemente visível cobrindo a página inteira**, em qualquer tela, desde o primeiro load — e passou despercebido numa rodada inteira de verificação porque quem testou não teve esse site na lista (ver item 5: paralelizar exige depois checar TODOS, não só uma amostra).
**Regra:** toda vez que um componente usa o atributo `hidden` pra controlar visibilidade E também tem uma classe com `display` fora de `[hidden]`, adicionar explicitamente `.classe[hidden]{ display:none }` (maior especificidade que `.classe{display:...}` sozinho) — ou trocar o controle de visibilidade para uma classe (`.is-open`) em vez de `hidden` + `display` conflitantes. Ao revisar qualquer overlay/menu/modal, sempre testar o estado FECHADO logo no load, não só o aberto.

## 11. O painel de preview (Browser pane) cacheia CSS/HTML de forma teimosa — nem `?query` na página, nem Ctrl+Shift+R, nem aba nova bastam
**Sintoma:** depois de editar `css/style.css` e recarregar (inclusive com `?v=2` na URL da página, hard reload via tecla, ou até fechando e abrindo uma aba nova), o navegador continuava aplicando o CSS ANTIGO — confirmado comparando `curl`/`fetch(...,{cache:'no-store'})` (sempre retornam o conteúdo certo do servidor) contra `document.styleSheets` da página carregada (continha as regras antigas). Não é bug do código, é cache de disco do Chromium que sobrevive a hard-reload sintético e a novas abas (mesmo perfil = mesmo cache).
**Regra:** para forçar CSS fresco durante verificação, não confie em reload — injete um `<link>` novo com `?bust=timestamp` via `javascript_tool` e remova o `<link>` antigo (`document.head.appendChild(novoLink); linkAntigo.remove()`), ou navegue direto para a URL da página com um query string novo E aceite que só a checagem via `fetch(...,{cache:'no-store'})`/`document.styleSheets` prova o estado real — screenshot sozinho pode estar mostrando cache. Mesma lógica vale pra `script.js`.
