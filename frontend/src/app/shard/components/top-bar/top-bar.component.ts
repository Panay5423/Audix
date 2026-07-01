import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  activeTab = 'overview';
  showThemeDropdown = false;
  private subs = new Subscription();

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(theme => {
        this.activeTheme = theme;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getBreadcrumb(): string {
    switch (this.activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'analytics': return 'Music Analytics';
      case 'playlists': return 'Playlist Curation';
      case 'ai-studio': return 'AI Features';
      case 'discovery': return 'Discovery Engine';
      case 'social': return 'Social Matrix';
      case 'achievements': return 'Achievements & Badges';
      case 'premium-lab': return 'Premium Lab';
      default: return 'User Dashboard';
    }
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
    this.router.navigate(['/home']);
  }
}
