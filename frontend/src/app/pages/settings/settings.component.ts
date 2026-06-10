import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AppTheme } from '../../models/enums';
import { StorageService } from '../../services/storage.service';
import { ThemeService } from '../../services/theme.service';

interface ThemeChoice {
  value: AppTheme;
  label: string;
  description: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  readonly theme$ = this.themeService.theme$;
  readonly themeChoices: ThemeChoice[] = [
    { value: AppTheme.LIGHT, label: '亮色', description: '适合白天编辑与打印校对。' },
    { value: AppTheme.DARK, label: '暗色', description: '适合低光环境下长时间排版。' },
    { value: AppTheme.WARM, label: '暖色', description: '偏餐厅纸张与木质工作台氛围。' }
  ];
  importMessage = '';

  constructor(
    private readonly themeService: ThemeService,
    private readonly storage: StorageService
  ) {}

  get usagePercent(): string {
    return `${Math.round(this.storage.usageRatio() * 100)}%`;
  }

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }

  exportData(): void {
    const data = this.storage.exportProjectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `餐厅菜单设计器数据_${new Date().toISOString().slice(0, 10)}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }

  importData(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const file = input?.files?.item(0);
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return;
      }
      const parsed = this.parseRecord(reader.result);
      if (!parsed) {
        this.importMessage = '导入文件格式不正确。';
        return;
      }
      this.storage.importProjectData(parsed);
      this.importMessage = '导入完成，页面将刷新。';
      window.setTimeout(() => window.location.reload(), 600);
    };
    reader.readAsText(file);
  }

  resetData(): void {
    if (window.confirm('确定清空本地数据并恢复示例内容吗？')) {
      this.storage.clearProjectData();
      window.location.reload();
    }
  }

  private parseRecord(raw: string): Record<string, string> | null {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!this.isStringRecord(parsed)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private isStringRecord(value: unknown): value is Record<string, string> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }
    return Object.values(value).every((entry) => typeof entry === 'string');
  }
}
