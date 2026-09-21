# Tornar o site totalmente portátil

## Situação atual confirmada

- O site **não usa banco de dados ativo**. Obras, textos, dados da empresa e configurações estão em arquivos versionados no projeto.
- Não há WordPress/CMS conectado ao funcionamento atual.
- O site publicado na KingHost é um pacote estático; não precisa de servidor de aplicação para exibir as páginas.
- As imagens já possuem cópias locais no projeto, mas ainda existem referências e rotinas herdadas da CDN da Lovable.
- GitHub e FTP são hoje canais de publicação, não fontes de dados necessárias para o site funcionar.

## Objetivo

Entregar um projeto estático autocontido, que possa ser compilado e publicado na KingHost, GitHub Pages ou qualquer hospedagem de arquivos estáticos, sem depender da Lovable, de banco de dados ou de um CMS.

## Implementação

1. **Consolidar todos os arquivos do site**
   - Migrar as imagens ainda representadas por ponteiros da Lovable para uma estrutura local comum.
   - Atualizar as referências para usar apenas arquivos incluídos no próprio projeto.
   - Remover fallbacks de download para domínios da Lovable.

2. **Desacoplar a compilação da Lovable**
   - Substituir a configuração de compilação específica da Lovable pela configuração oficial do TanStack Start/Vite.
   - Remover o pacote de compilação exclusivo da Lovable.
   - Preservar as páginas prerenderizadas, navegação, SEO, galeria e funcionamento em subpastas.

3. **Adequar recursos que hoje pressupõem servidor**
   - Transformar `/health` em uma verificação compatível com hospedagem estática, sem consulta opcional ao Supabase.
   - Desativar no pacote estático o envio de erros para um endpoint de servidor inexistente.
   - Remover referências opcionais ao coletor de erros da Lovable.

4. **Manter publicação independente**
   - Preservar o envio por FTP com credenciais externas ao código.
   - Manter o GitHub Actions como opção, sem torná-lo obrigatório para publicar.
   - Gerar um pacote final que possa ser enviado manualmente por FTP para qualquer hospedagem Apache/LiteSpeed.

5. **Documentar operação e portabilidade**
   - Atualizar as instruções para instalação, compilação, publicação manual, publicação pelo GitHub e troca de hospedagem.
   - Documentar onde editar textos, obras e imagens sem banco de dados.
   - Registrar claramente quais arquivos e credenciais nunca devem entrar no GitHub.

6. **Validar antes da entrega**
   - Conferir todas as páginas, links, metadados e imagens no pacote estático.
   - Testar a navegação direta para páginas internas em ambiente Apache compatível.
   - Confirmar que o pacote não faz chamadas obrigatórias à Lovable, Supabase ou WordPress.
   - Fazer uma publicação de validação no FTP atual e verificar o domínio principal.

## Resultado esperado

- Código e conteúdo completos no repositório.
- Nenhum banco de dados necessário.
- Nenhuma dependência da Lovable durante a visita ao site ou durante uma compilação externa.
- Publicação possível por GitHub Actions, por comando local ou por upload manual do pacote estático.
- Mesmo visual, conteúdo, URLs e comportamento atuais.

## Detalhes técnicos

- A estrutura continuará em React/TanStack Router e será gerada como HTML, CSS, JavaScript e imagens estáticas.
- Os arquivos de dados em `src/data` continuarão como fonte do conteúdo.
- O pacote de publicação continuará compatível com `.htaccess`, prerenderização e rotas internas da KingHost.
- Credenciais FTP permanecerão somente em variáveis protegidas ou arquivo local não versionado.
