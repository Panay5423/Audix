import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private activeThemeSubject = new BehaviorSubject<'purple' | 'spotify' | 'light'>('purple');
  activeTheme$ = this.activeThemeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme') as 'purple' | 'spotify' | 'light';
    if (savedTheme) {
      this.activeThemeSubject.next(savedTheme);
    }
  }

  setTheme(theme: 'purple' | 'spotify' | 'light') {
    localStorage.setItem('theme', theme);
    this.activeThemeSubject.next(theme);
  }

  getTheme(): 'purple' | 'spotify' | 'light' {
    return this.activeThemeSubject.value;
  }
}
