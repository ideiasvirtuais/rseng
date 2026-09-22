# Página de diagnóstico de imagens

## Objetivo
Criar uma página interna em `/diagnostico-imagens` que confira, no próprio navegador, todas as imagens do catálogo local antes da publicação.

## O que será entregue
- Resumo automático com total, imagens aprovadas, avisos e falhas.
- Verificação individual de caminho, resposta de carregamento, formato declarado, formato real e dimensões.
- Identificação de caminhos externos ou inválidos, extensões incompatíveis e imagens que excedem o tempo limite.
- Lista pesquisável e filtrável por status, com miniatura, caminho e detalhe do erro.
- Botão para executar novamente toda a auditoria.
- Metadados próprios com bloqueio de indexação, pois é uma página operacional.

## Implementação técnica
- Usar o catálogo central existente para obter todas as imagens sem duplicação.
- Executar as verificações somente no navegador, sem banco de dados ou serviço externo.
- Carregar cada arquivo com concorrência limitada e timeout para evitar travar a página.
- Ler os primeiros bytes via `fetch` para validar JPEG, PNG, WebP e GIF contra a extensão informada.
- Adicionar a rota ao conjunto de páginas verificadas pelo processo de pré-publicação.
- Manter o visual e os tokens já usados no site.

## Validação
- Conferir a página em desktop e celular.
- Confirmar que a auditoria termina, os filtros funcionam e as imagens locais válidas aparecem como aprovadas.
- Executar a verificação de imagens já existente para garantir que o novo recurso não afeta a publicação.
