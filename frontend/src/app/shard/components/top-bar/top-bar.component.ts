import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../cors/services/theme.service';
import { AuthService, UserProfile } from '../../../cors/services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  currentRoute = '/dashboard';
  searchQuery = '';
  showThemeDropdown = false;
  userProfile: UserProfile | null = null;
  private subs = new Subscription();

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url.split('?')[0];

    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
        this.currentRoute = e.urlAfterRedirects.split('?')[0];
      })
    );

    this.subs.add(
      this.themeService.activeTheme$.subscribe(theme => {
        this.activeTheme = theme;
      })
    );

    this.subs.add(
      this.authService.currentUser$.subscribe(u => this.userProfile = u)
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  getBreadcrumb(): string {
    if (this.currentRoute.includes('/discover')) return 'Discovery Engine';
    if (this.currentRoute.includes('/search')) return 'Catalog Search';
    if (this.currentRoute.includes('/artist')) return 'Artist Spotlight';
    if (this.currentRoute.includes('/album')) return 'Album Tracklist';
    if (this.currentRoute.includes('/playlists') || this.currentRoute.includes('/playlist/')) return 'Playlist Vault';
    if (this.currentRoute.includes('/liked-songs')) return 'Liked Music';
    if (this.currentRoute.includes('/recently-played')) return 'Listening History';
    if (this.currentRoute.includes('/analytics')) return 'Music Analytics';
    if (this.currentRoute.includes('/ai-assistant')) return 'AI Music Assistant';
    if (this.currentRoute.includes('/ai-playlist-generator')) return 'AI Playlist Generator';
    if (this.currentRoute.includes('/profile')) return 'Identity Dossier';
    if (this.currentRoute.includes('/settings')) return 'System Settings';
    return 'Dashboard Overview';
  }

  setTheme(theme: 'purple' | 'spotify' | 'light') {
    this.themeService.setTheme(theme);
    this.showThemeDropdown = false;
  }

  getThemeLogoColorClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-500';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-500';
  }

  getThemeTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-400';
  }

  logout() {
    this.authService.logout();
  }
}
