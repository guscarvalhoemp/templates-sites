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
