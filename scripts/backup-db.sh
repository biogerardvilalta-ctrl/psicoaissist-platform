#!/bin/bash
# ============================================================
# Backup automático diario - Psicoaissist + Mailcow
# Cron: 0 2 * * * /home/admin/dockers/psicoaissist-platform/scripts/backup-db.sh >> /home/admin/backups/backup.log 2>&1
# ============================================================

set -euo pipefail

BACKUP_DIR="/home/admin/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
KEEP_DAYS=30  # Guardar últimos 30 días (ajusta según espacio disponible)

mkdir -p "$BACKUP_DIR"

echo ""
echo "========================================"
echo " BACKUP $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ----------------------------------------------------------
# 1. POSTGRESQL - Base de datos de Psicoaissist
# ----------------------------------------------------------
echo "[1/2] Backup PostgreSQL (psicoaissist)..."

PG_FILE="$BACKUP_DIR/psicoaissist_${DATE}.sql.gz"
PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "^psicoaissist_(prod|beta|preprod)_db$" | head -1)

if [ -n "$PG_CONTAINER" ]; then
    PG_DB=$(docker exec "$PG_CONTAINER" env | grep POSTGRES_DB | cut -d= -f2 || echo "psicoaissist_beta_db")
    docker exec "$PG_CONTAINER" pg_dump -U postgres "$PG_DB" | gzip > "$PG_FILE"
    if [ -s "$PG_FILE" ]; then
        echo "  ✅ PostgreSQL OK ($PG_CONTAINER): $(du -sh "$PG_FILE" | cut -f1)"
    else
        echo "  ❌ ERROR: Backup PostgreSQL vacío"
        rm -f "$PG_FILE"
    fi
else
    echo "  ⚠️  Contenedor PostgreSQL de Psicoaissist no está corriendo"
fi

# ----------------------------------------------------------
# 2. MYSQL - Base de datos de Mailcow
# ----------------------------------------------------------
echo "[2/2] Backup MySQL (Mailcow)..."

MYSQL_FILE="$BACKUP_DIR/mailcow_${DATE}.sql.gz"
MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep "mysql-mailcow" | head -1)

if [ -n "$MYSQL_CONTAINER" ]; then
    MYSQL_PASS=$(grep DBPASS /home/admin/dockers/mailcow-dockerized/mailcow.conf | cut -d= -f2)
    docker exec "$MYSQL_CONTAINER" mysqldump -u mailcow -p"${MYSQL_PASS}" mailcow | gzip > "$MYSQL_FILE"
    if [ -s "$MYSQL_FILE" ]; then
        echo "  ✅ MySQL OK: $(du -sh "$MYSQL_FILE" | cut -f1)"
    else
        echo "  ❌ ERROR: Backup MySQL vacío"
        rm -f "$MYSQL_FILE"
    fi
else
    echo "  ⚠️  Contenedor MySQL de Mailcow no está corriendo"
fi

# ----------------------------------------------------------
# 3. Limpiar backups antiguos
# ----------------------------------------------------------
echo "[3] Limpiando backups de más de ${KEEP_DAYS} días..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${KEEP_DAYS} -delete
echo "  ✅ Limpieza hecha"

# ----------------------------------------------------------
# 4. Resumen
# ----------------------------------------------------------
echo ""
echo "📦 Backups disponibles en $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  (ninguno)"
echo ""
TOTAL=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "💾 Espacio total usado: $TOTAL"
echo "========================================"
echo " FIN BACKUP $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
