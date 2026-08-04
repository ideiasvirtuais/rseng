## Objetivo

Cadastrar a foto real do **Edifício Santorini** nos empreendimentos, substituindo o placeholder atual (`src/assets/building-santorini.jpg`).

## O que será feito

1. Subir a foto enviada para o CDN de assets, gerando `src/assets/residenciais/edificio-santorini.jpg.asset.json`.

2. **`src/data/projects.ts`**: trocar o import do placeholder pela nova foto na ficha da obra `edificio-santorini` (capa + galeria "Fachadas") e no item correspondente da galeria da home.

3. **`src/data/residential.ts`**: adicionar o Edifício Santorini à lista de obras residenciais (3 quartos · Espírito Santo, entregue em 2021), com texto alternativo descritivo da fachada branca/cinza com faixas em pastilha preta.

4. Manter os demais dados da ficha (endereço, ano, destaques) como já cadastrados.

## Detalhes técnicos

- Asset via `lovable-assets create`, importado como `.asset.json` e usado por `.url`, no mesmo padrão do Íris/Malbec/Rosário.
- O placeholder `building-santorini.jpg` deixa de ser referenciado; será removido se não houver outros usos.
