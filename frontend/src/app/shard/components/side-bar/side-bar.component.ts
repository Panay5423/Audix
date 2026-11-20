import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../../cors/services/theme.service';
import { AuthService, UserProfile } from '../../../cors/services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent implements OnInit, OnDestroy {
  currentRoute = '/dashboard';
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  userProfile: UserProfile | null = null;
  private subs = new Subscription();

  navSections = [
    {
      title: 'DISCOVER',
      items: [
        { route: '/dashboard', name: 'Dashboard', icon: '📊' },
        { route: '/discover', name: 'Explore & Vibe', icon: '⚡' },
        { route: '/search', name: 'Search Library', icon: '🔍' }
      ]
    },
    {
      title: 'AI STUDIO',
      items: [
        { route: '/ai-assistant', name: 'Music Assistant', icon: '🤖' },
        { route: '/ai-playlist-generator', name: 'Playlist Generator', icon: '✨' },
        { route: '/analytics', name: 'Taste Analytics', icon: '📈' }
      ]
    },
    {
      title: 'COLLECTION',
      items: [
        { route: '/playlists', name: 'My Playlists', icon: '📁' },
        { route: '/liked-songs', name: 'Liked Songs', icon: '💜' },
        { route: '/recently-played', name: 'Recent History', icon: '🕒' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { route: '/profile', name: 'Profile & Dossier', icon: '👤' },
        { route: '/settings', name: 'Preferences', icon: '⚙️' }
      ]
    }
  ];

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService
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
      this.authService.currentUser$.subscribe(user => {
        this.userProfile = user;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute === route;
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

  getAvatar(): string {
    if (this.userProfile?.images && this.userProfile.images.length > 0) {
      return this.userProfile.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80';
  }
}
