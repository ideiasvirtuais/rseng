## Objetivo

Colocar as 10 fotos enviadas na página **Edifícios Comerciais** (`/edificios-comerciais`), substituindo os placeholders atuais (hoje a página só reaproveita imagens do Edifício Rosário).

## O que será feito

1. **Subir as 10 imagens** para o CDN de assets (pointers `.asset.json` em `src/assets/comerciais/`), sem carregar binários no repositório.

2. **Novo arquivo `src/data/commercial.ts`** com o portfólio comercial, no mesmo padrão de `src/data/houses.ts` (imagem, nome, tipo, alt descritivo):

| Foto | Nome | Tipo |
|---|---|---|
| EPA | Supermercado EPA Plus | Loja âncora / varejo |
| Galpão Marco Túlio | Galpão Marco Túlio | Galpão industrial |
| Inovatta | Edifício Inovatta Odontologia | Clínica / sede corporativa |
| Janio | Edifício Jânio | Uso misto — lojas + escritório |
| Lojas Niterói | Centro Comercial Niterói | Centro comercial de esquina |
| Marcelo Av. Amazonas | Edifício Marcelo — Av. Amazonas | Loja + salas comerciais |
| Nilza | Edifício Nilza | Salas comerciais |
| Portal | Edifício Portal | Sede corporativa |
| Reauto Bernardoni | Concessionária Reauto Betim | Showroom automotivo |
| Ed. Scala | Edifício Scala Centro Comercial | Centro comercial |

Os textos acima são inferidos das fachadas/letreiros — me avise se algum nome, endereço ou ano estiver errado que eu ajusto.

3. **Atualizar `src/data/segments.ts`**: o segmento `edificios-comerciais` passa a usar essas 10 fotos na galeria, com capa (hero) na foto do Ed. Scala, e o texto de intro/features ajustado para refletir o portfólio real (galpões, showrooms, centros comerciais, clínicas, salas).

4. **Ajustar a categoria "Comerciais" da galeria da home** (`src/data/projects.ts`) para usar as fotos reais em vez das imagens repetidas do Rosário.

5. Mantém-se o Edifício Rosário como empreendimento com página própria no bloco "Empreendimentos" do segmento.

## Detalhes técnicos

- Assets via `lovable-assets create --file /mnt/user-uploads/... > src/assets/comerciais/<slug>.jpg.asset.json`, importados como `import x from "@/assets/comerciais/x.jpg.asset.json"` e usados via `x.url`.
- Nenhuma mudança em `SegmentPage.tsx` — a galeria com lightbox e o SEO/JSON-LD já existentes passam a exibir as novas fotos automaticamente.
