import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppTheme } from '../models/enums';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly themeSubject: BehaviorSubject<AppTheme>;
  readonly theme$: Observable<AppTheme>;

  constructor(
    private readonly storage: StorageService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    const storedTheme = this.storage.get<AppTheme>(this.storageKey, AppTheme.LIGHT);
    this.themeSubject = new BehaviorSubject<AppTheme>(storedTheme);
    this.theme$ = this.themeSubject.asObservable();
    this.applyBodyClass(storedTheme);
  }

  setTheme(theme: AppTheme): void {
    this.storage.set(this.storageKey, theme);
    this.themeSubject.next(theme);
    this.applyBodyClass(theme);
  }

  currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  private applyBodyClass(theme: AppTheme): void {
    const body = this.document.body;
    body.classList.remove('theme-light', 'theme-dark', 'theme-warm');
    body.classList.add(`theme-${theme}`);
  }
}
