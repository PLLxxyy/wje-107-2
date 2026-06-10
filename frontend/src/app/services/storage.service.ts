import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface StoredEnvelope<T> {
  version: number;
  value: T;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = environment.storagePrefix;
  private readonly schemaVersion = 1;

  constructor() {
    this.migrate();
  }

  get<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(this.key(key));
    if (!raw) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(raw) as StoredEnvelope<T> | T;
      if (this.isEnvelope(parsed)) {
        return parsed.value;
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    const envelope: StoredEnvelope<T> = {
      version: this.schemaVersion,
      value
    };
    localStorage.setItem(this.key(key), JSON.stringify(envelope));
  }

  remove(key: string): void {
    localStorage.removeItem(this.key(key));
  }

  clearProjectData(): void {
    const keys = this.allProjectKeys();
    keys.forEach((key) => localStorage.removeItem(key));
  }

  exportProjectData(): Record<string, string> {
    const data: Record<string, string> = {};
    this.allProjectKeys().forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        data[key] = value;
      }
    });
    return data;
  }

  importProjectData(data: Record<string, string>): void {
    this.clearProjectData();
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(`${this.prefix}:`)) {
        localStorage.setItem(key, value);
      }
    });
  }

  usageRatio(): number {
    const used = this.allProjectKeys()
      .map((key) => localStorage.getItem(key)?.length ?? 0)
      .reduce((total, length) => total + length, 0);
    const conservativeLimit = 5 * 1024 * 1024;
    return Math.min(used / conservativeLimit, 1);
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  private allProjectKeys(): string[] {
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const storageKey = localStorage.key(index);
      if (storageKey?.startsWith(`${this.prefix}:`)) {
        keys.push(storageKey);
      }
    }
    return keys;
  }

  private migrate(): void {
    const versionKey = this.key('schema_version');
    const storedVersion = Number(localStorage.getItem(versionKey) ?? '0');
    if (storedVersion < this.schemaVersion) {
      localStorage.setItem(versionKey, String(this.schemaVersion));
    }
  }

  private isEnvelope<T>(value: StoredEnvelope<T> | T): value is StoredEnvelope<T> {
    return typeof value === 'object' && value !== null && 'version' in value && 'value' in value;
  }
}
