# This file is generated by Nx.
#
# Build the docker image with `npx nx docker-build tomorrow-api`.
# Tip: Modify "docker-build" options in project.json to change docker build args.
#
# Run the container with `docker run -p 3000:3000 -t tomorrow-api`.
FROM node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app

COPY dist/apps/tomorrow-api tomorrow-api/
COPY dist/apps/tomorrow/browser static
RUN chown -R node:node /app

RUN mkdir -p /data && chown -R node:node /data

VOLUME /data

RUN npm --prefix=tomorrow-api ci

USER node

CMD [ "node", "tomorrow-api" ]
