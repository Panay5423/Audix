import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../cors/services/auth.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  userProfile: UserProfile | null = null;
  discoveryDegree = 50;
  autoPlay = false;
  savedNotice = false;
  private subs = new Subscription();

  constructor(
    public themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.subs.add(
      this.authService.currentUser$.subscribe(u => {
        this.userProfile = u;
        if (u?.preferences) {
          this.discoveryDegree = u.preferences.discoveryDegree ?? 50;
          this.autoPlay = u.preferences.autoPlayRecommendations ?? false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setTheme(theme: 'purple' | 'spotify' | 'light'): void {
    this.themeService.setTheme(theme);
    this.savePreferences();
  }

  savePreferences(): void {
    this.authService.updatePreferences({
      preferredTheme: this.activeTheme,
      discoveryDegree: this.discoveryDegree,
      autoPlayRecommendations: this.autoPlay
    }).subscribe({
      next: () => {
        this.savedNotice = true;
        setTimeout(() => this.savedNotice = false, 2500);
      },
      error: (err) => console.error('Failed to save preferences', err)
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getThemeTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-400';
  }

  getThemeBgClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-500 hover:bg-emerald-400 text-black';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white';
    return 'bg-violet-600 hover:bg-violet-500 text-white';
  }
}
