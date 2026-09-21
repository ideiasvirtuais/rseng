# RS Engenharia — imagem portátil independente.
# Serve o pacote estático (dist/client/) em Nginx Alpine.
# Zero dependência de GitHub, Lovable, KingHost ou Node em produção.
#
# Uso:
#   npm run build:static
#   docker build -t rseng-static .
#   docker run -p 8080:80 rseng-static
#   # ou: docker compose -f docker-compose.portable.yml up -d

FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="RS Engenharia — pacote estático"
LABEL org.opencontainers.image.description="Site estático independente. GitHub e FTP Napoleon sao apenas opcoes."

# Config SPA: index + _shell.html fallback, cache imutável p/ assets
COPY hosting/docker-nginx.conf /etc/nginx/conf.d/default.conf

# Pacote estático gerado pelo build (nunca o código-fonte)
COPY dist/client/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health.json | grep -q '"ok": *true' || exit 1
