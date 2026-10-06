# Atualizar o domínio da Rezende Saback

## Diagnóstico confirmado
- Em 06/10/2026, o domínio `https://rsengenharia.eng.br/` responde normalmente, mas informa que o arquivo da página inicial foi modificado em **30/09/2026 às 13:39 UTC**.
- A página é enviada com instruções para não guardar cache. Portanto, o cache da página não é a principal hipótese neste momento.
- Os diretórios de arquivos prontos para publicação (`dist/client`, `.output/public` e `.tanstack/start/build/client`) não estão disponíveis neste ambiente. O envio FTP depende desses arquivos.
- O fluxo configurado no GitHub gera os arquivos e envia para produção quando recebe alterações na branch `main`. A execução mais recente desse fluxo e seu resultado ainda precisam ser confirmados.

## Plano
1. Conferir se as últimas alterações chegaram ao GitHub e verificar o resultado da última publicação automática, mediante acesso disponível.
2. Obter o pacote atualizado pelo fluxo de publicação disponível. Se este ambiente continuar sem permitir gerar ou obter o pacote, indicar a etapa necessária no GitHub, sem afirmar que o envio foi feito.
3. Confirmar o acesso FTP usando as credenciais protegidas e enviar o pacote atualizado para a pasta de produção da KingHost.
4. Conferir diretamente no domínio a página inicial, as três páginas de categorias, o Golden Mall, a logo e as fotos, comparando os arquivos publicados com o pacote enviado.

## Limites
- Não alterar o visual, textos ou conteúdo do site.
- Não considerar a publicação concluída apenas porque a prévia está atualizada ou o acesso FTP funciona.
- Não expor senhas nem colocá-las no código.
- A publicação depende de acesso ao pacote atualizado e ao serviço que executa o envio.