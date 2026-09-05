import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BackupFile {
  name: string;
  type: 'app' | 'mail';
  size: number;
  sizeFormatted: string;
  createdAt: string;
}

export interface BackupStatus {
  lastAppBackup: string | null;
  lastMailBackup: string | null;
  totalBackups: number;
  totalSize: string;
  backups: BackupFile[];
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly BACKUP_DIR = '/home/admin/backups';

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async listBackups(): Promise<BackupStatus> {
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) {
        return { lastAppBackup: null, lastMailBackup: null, totalBackups: 0, totalSize: '0 B', backups: [] };
      }

      const files = fs.readdirSync(this.BACKUP_DIR)
        .filter(f => f.endsWith('.sql.gz'))
        .map(f => {
          const fullPath = path.join(this.BACKUP_DIR, f);
          const stat = fs.statSync(fullPath);
          const isApp = f.startsWith('psicoaissist_');
          return {
            name: f,
            type: isApp ? 'app' as const : 'mail' as const,
            size: stat.size,
            sizeFormatted: this.formatSize(stat.size),
            createdAt: stat.mtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const appBackups = files.filter(f => f.type === 'app');
      const mailBackups = files.filter(f => f.type === 'mail');

      return {
        lastAppBackup: appBackups[0]?.createdAt ?? null,
        lastMailBackup: mailBackups[0]?.createdAt ?? null,
        totalBackups: files.length,
        totalSize: this.formatSize(totalSize),
        backups: files,
      };
    } catch (error) {
      this.logger.error('Error listing backups:', error);
      return { lastAppBackup: null, lastMailBackup: null, totalBackups: 0, totalSize: '0 B', backups: [] };
    }
  }

  async createBackup(type: 'app' | 'mail' | 'all'): Promise<{ success: boolean; message: string; files: string[] }> {
    this.logger.log(`Creating backup type: ${type}`);
    const createdFiles: string[] = [];
    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');

    if (!fs.existsSync(this.BACKUP_DIR)) {
      fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
    }

    try {
      if (type === 'app' || type === 'all') {
        const file = path.join(this.BACKUP_DIR, `psicoaissist_${date}.sql.gz`);
        await execAsync(
          `docker exec psicoaissist_prod_db pg_dump -U postgres psicoaissist_beta_db | gzip > ${file}`
        );
        if (fs.existsSync(file) && fs.statSync(file).size > 0) {
          createdFiles.push(`psicoaissist_${date}.sql.gz`);
        }
      }

      if (type === 'mail' || type === 'all') {
        const file = path.join(this.BACKUP_DIR, `mailcow_${date}.sql.gz`);
        const mysqlPass = await this.getMailcowPassword();
        await execAsync(
          `docker exec mailcowdockerized-mysql-mailcow-1 mysqldump -u mailcow -p${mysqlPass} mailcow | gzip > ${file}`
        );
        if (fs.existsSync(file) && fs.statSync(file).size > 0) {
          createdFiles.push(`mailcow_${date}.sql.gz`);
        }
      }

      return {
        success: createdFiles.length > 0,
        message: createdFiles.length > 0
          ? `Backup creado correctamente: ${createdFiles.join(', ')}`
          : 'No se pudo crear el backup',
        files: createdFiles,
      };
    } catch (error) {
      this.logger.error('Error creating backup:', error);
      throw new Error(`Error al crear el backup: ${error.message}`);
    }
  }

  async restoreBackup(filename: string): Promise<{ success: boolean; message: string }> {
    // Security checks
    if (!filename.endsWith('.sql.gz') || filename.includes('..') || filename.includes('/')) {
      throw new ForbiddenException('Nombre de archivo no permitido');
    }

    const fullPath = path.join(this.BACKUP_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      throw new ForbiddenException('Archivo de backup no encontrado');
    }

    this.logger.warn(`Restoring backup: ${filename}`);

    try {
      if (filename.startsWith('psicoaissist_')) {
        await execAsync(
          `gunzip -c ${fullPath} | docker exec -i psicoaissist_prod_db psql -U postgres psicoaissist_beta_db`
        );
        return { success: true, message: `Base de datos de la app restaurada desde: ${filename}` };
      } else if (filename.startsWith('mailcow_')) {
        const mysqlPass = await this.getMailcowPassword();
        await execAsync(
          `gunzip -c ${fullPath} | docker exec -i mailcowdockerized-mysql-mailcow-1 mysql -u mailcow -p${mysqlPass} mailcow`
        );
        return { success: true, message: `Base de datos de Mailcow restaurada desde: ${filename}` };
      } else {
        throw new Error('Tipo de backup no reconocido');
      }
    } catch (error) {
      this.logger.error('Error restoring backup:', error);
      throw new Error(`Error al restaurar: ${error.message}`);
    }
  }

  async deleteBackup(filename: string): Promise<{ success: boolean }> {
    if (!filename.endsWith('.sql.gz') || filename.includes('..') || filename.includes('/')) {
      throw new ForbiddenException('Nombre de archivo no permitido');
    }
    const fullPath = path.join(this.BACKUP_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return { success: true };
  }

  private async getMailcowPassword(): Promise<string> {
    const { stdout } = await execAsync(
      `grep DBPASS /home/admin/dockers/mailcow-dockerized/mailcow.conf | cut -d= -f2`
    );
    return stdout.trim();
  }

  // ─── CRON Jobs — Backup Automàtic ────────────────────────────────────────────

  /**
   * Backup diari de la base de dades de l'app a les 02:00 AM
   */
  @Cron('0 2 * * *', { name: 'daily-app-backup' })
  async scheduledDailyAppBackup(): Promise<void> {
    this.logger.log('🗄️ Starting scheduled daily app backup...');
    try {
      const result = await this.createBackup('app');
      if (result.success) {
        this.logger.log(`✅ Daily app backup completed: ${result.files.join(', ')}`);
      } else {
        this.logger.warn(`⚠️ Daily app backup failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`❌ Daily app backup error: ${error.message}`);
    }
  }

  /**
   * Backup setmanal complet (app + mail) els dilluns a les 03:00 AM
   */
  @Cron('0 3 * * 1', { name: 'weekly-full-backup' })
  async scheduledWeeklyFullBackup(): Promise<void> {
    this.logger.log('🗄️ Starting scheduled weekly full backup (app + mail)...');
    try {
      const result = await this.createBackup('all');
      if (result.success) {
        this.logger.log(`✅ Weekly full backup completed: ${result.files.join(', ')}`);
      } else {
        this.logger.warn(`⚠️ Weekly full backup failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`❌ Weekly full backup error: ${error.message}`);
    }
  }

  /**
   * Purga de backups antics (>30 dies) els dissabtes a les 04:00 AM
   */
  @Cron('0 4 * * 6', { name: 'backup-cleanup' })
  async scheduledBackupCleanup(): Promise<void> {
    this.logger.log('🧹 Starting scheduled backup cleanup (>30 days)...');
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) return;

      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(this.BACKUP_DIR).filter(f => f.endsWith('.sql.gz'));
      let deleted = 0;

      for (const file of files) {
        const fullPath = path.join(this.BACKUP_DIR, file);
        const stat = fs.statSync(fullPath);
        if (stat.mtime.getTime() < thirtyDaysAgo) {
          fs.unlinkSync(fullPath);
          this.logger.log(`🗑️ Deleted old backup: ${file}`);
          deleted++;
        }
      }

      this.logger.log(`✅ Backup cleanup completed. Deleted ${deleted} old backup(s).`);
    } catch (error) {
      this.logger.error(`❌ Backup cleanup error: ${error.message}`);
    }
  }
}
