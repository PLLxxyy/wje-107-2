import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppTheme } from './models/enums';
import { ThemeService } from './services/theme.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly theme$ = this.themeService.theme$;
  readonly themes = [
    { value: AppTheme.LIGHT, label: '亮' },
    { value: AppTheme.DARK, label: '暗' },
    { value: AppTheme.WARM, label: '暖' }
  ];
  readonly navItems: NavItem[] = [
    { label: '设计器', path: '/designer' },
    { label: '菜品', path: '/menu' },
    { label: '分类', path: '/categories' },
    { label: '模板', path: '/templates' },
    { label: '设置', path: '/settings' }
  ];

  constructor(private readonly themeService: ThemeService) {}

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
