# Halo Salon MVP

A responsive salon consultation workspace with guided scan, visual hair report, hairstyle recommendations, and Hair Passport flows.

## Clone and run in VS Code

```bash
git clone https://github.com/mkrajireddy9/saloonapp.git
cd saloonapp
```

Install [Node.js](https://nodejs.org/) (18+), then:

```bash
npm install -g pnpm
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/halo-salon-mvp run dev
```

Open http://localhost:5173/

`PORT` and `BASE_PATH` are required. Do not use npm or yarn — this workspace only installs with pnpm.

### Optional API (needs Postgres)

```bash
export DATABASE_URL="postgres://USER:PASSWORD@localhost:5432/halo"
pnpm --filter @workspace/api-server run dev
```

The API listens on port 5000.
