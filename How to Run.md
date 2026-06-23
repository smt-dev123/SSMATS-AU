- `chmod +x ./start.sh`
- `./start.sh`

- `docker compose exec backend_ssmats_au bun run drizzle-kit generate`
- `docker compose exec backend_ssmats_au bun run drizzle-kit push`
- `docker compose exec backend_ssmats_au bun run drizzle-kit migrate`
- `docker compose exec backend_ssmats_au bun run src/database/seeds/admin.ts`

- Website → http://localhost
- API → http://localhost/api
