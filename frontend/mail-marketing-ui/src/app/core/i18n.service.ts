import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'mailmarketing_lang';
  private readonly defaultLang = 'tr';
  private readonly supportedLangs = ['tr', 'en'];

  constructor(private translate: TranslateService) {}

  init(): void {
    this.translate.setDefaultLang(this.defaultLang);
    const saved = localStorage.getItem(this.storageKey);
    const lang = this.isSupported(saved) ? saved : this.defaultLang;
    this.translate.use(lang);
  }

  setLanguage(lang: string): void {
    if (!this.isSupported(lang)) return;
    this.translate.use(lang);
    localStorage.setItem(this.storageKey, lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || this.defaultLang;
  }

  private isSupported(lang: string | null): lang is string {
    return !!lang && this.supportedLangs.includes(lang);
  }
}
