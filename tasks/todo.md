# Plano v4 — INOVAR: paradigmas de interação distintos por site

## Diagnóstico do feedback
"Os sites ainda estão no fundo bem parecidos... muitos elementos e componentes parecidos, e não elementos distintos para criar uma experiência visual única."

Causa raiz real: até agora variei **paleta, tipografia e ordem de seções** — mas todos os sites compartilham o mesmo **vocabulário de componentes** (grid de cards com ícone, barra de stats com contador, timeline de passos, strip de depoimentos, CTA+form). Trocar cor não cria identidade; trocar o **paradigma de interação e o sistema de layout** cria.

## Regra desta rodada
Cada site ganha um **paradigma de interação exclusivo** + no mínimo 2 interações que NENHUM outro site do projeto tem. Componentes proibidos por serem repetidos: grid de 3-4 cards com ícone SVG, barra de contadores genérica, timeline horizontal de passos numerados.

## Assinatura por site

| Site | Paradigma exclusivo | Interações-assinatura | Números expressos como |
|---|---|---|---|
| `site-01-boxfit` | **NÃO MEXER** (usuário aprovou) | — | — |
| `site-02-nutricionista` | Composição circular / orgânica | Seletor **orbital** (chips em órbita → prato central troca); **prato que se monta** com scroll scrub; **slider drag antes/depois** (Draggable) | Gauge em arco animado |
| `site-03-construtora` | Lista editorial + expansão espacial | **Preview de imagem seguindo o cursor** na lista de obras; clique **expande via GSAP Flip** para fullscreen; **scrubber de fases da obra** | Readout de status fixo |
| `site-04-advocacia` | Split-screen com trilho fixo | **Coluna esquerda pinada** que troca conforme áreas passam; **SplitText** revelando linha a linha com máscara clip-path; trilho de índice vertical | Ledger tipográfico (documento) |
| `site-05-gastronomia` | **Scroll horizontal cinematográfico** (spec explícita do usuário) | Cardápio entra da **direita → centro → esquerda** conforme scroll, pinado até "A Casa"; **clique no item pequeno → vira o grande central** (Flip) | — |

## Coffee-shop: o que o usuário pediu 2x e eu não entreguei
Descobertas da referência real (`webild-templates-ref/coffee-shop/`):
- **Fontes**: `Inter` + `Messy Handwritten` (manuscrita de destaque) → usar **Inter + Caveat** (Google Fonts).
- **Molduras**: `border-radius` grande — `radius-3xl/4xl`, `5rem`, `100%` (círculo), pílula (`3.4e38px`). Molduras em arco/círculo para pratos e ambiente.
- **Selo circular giratório** (`rotate(...) translateX(120px) rotate(-...)`).
- Microcopy lúdica ("Move your cursor!").

## Stack confirmada
GSAP 3.13.0 no cdnjs com TODOS os plugins livres (verificado, HTTP 200): gsap, ScrollTrigger, **Flip**, **SplitText**, **Draggable**, Observer, ScrollSmoother.

## Execução
- [ ] 4 subagentes em paralelo (nutri, construtora, advocacia, gastronomia). Boxfit intocado.
- [ ] Mobile-first obrigatório em todos (explícito para gastronomia).
- [ ] Checklist de bug herdado: nunca pré-esconder via CSS puro (bug real da nutri); `min-width:0` em flex/grid com e-mail/select; `overflow-x:hidden` no body; teste numérico 375/768/1280.
- [ ] Revisão final minha: abrir os 4, conferir que as assinaturas existem e funcionam.
