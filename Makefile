# ═══════════════════════════════════════
#  Discord Clone — Comandos rápidos
# ═══════════════════════════════════════

.PHONY: db-up db-down db-reset db-logs db-shell migrate seed dev

# ── Docker Database ──
db-up:
	@echo "🐘 Levantando PostgreSQL + pgAdmin..."
	docker compose --env-file .env.docker up -d
	@echo ""
	@echo "✅ Base de datos lista:"
	@echo "   PostgreSQL → localhost:5432"
	@echo "   pgAdmin    → http://localhost:5050"
	@echo "   User/Pass  → postgres / postgres"

db-down:
	@echo "🛑 Deteniendo contenedores..."
	docker compose down

db-reset:
	@echo "🔄 Reiniciando base de datos (borra todos los datos)..."
	docker compose down -v
	docker compose --env-file .env.docker up -d
	@echo "⏳ Esperando a que PostgreSQL esté listo..."
	@sleep 3
	@echo "🔧 Ejecutando migraciones..."
	cd server && npx prisma migrate dev
	@echo "✅ Base de datos reiniciada"

db-logs:
	docker compose logs -f postgres

db-shell:
	docker exec -it discord_db psql -U postgres -d discord_clone

# ── Development ──
migrate:
	cd server && npx prisma migrate dev

seed:
	cd server && npm run db:seed

studio:
	cd server && npx prisma studio

dev:
	@echo "🚀 Iniciando desarrollo..."
	@echo "   Asegúrate de que la BD está corriendo (make db-up)"
	@echo ""
	@echo "Terminal 1: cd server && npm run dev"
	@echo "Terminal 2: cd client && npm run dev"
