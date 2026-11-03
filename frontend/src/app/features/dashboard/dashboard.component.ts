import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../cors/services/auth.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTab = 'overview';
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  userProfile: any = null;
  loading = true;
  error: string | null = null;
  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(theme => {
        this.activeTheme = theme;
      })
    );

    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['tab']) {
          this.activeTab = params['tab'];
        }
      })
    );

    // Capture token from query params or localStorage
    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
          localStorage.setItem('token', tokenFromUrl);
          this.router.navigate(['/dashboard'], {
            queryParams: {},
            replaceUrl: true
          });
          this.fetchUserProfile(tokenFromUrl);
          return;
        }

        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          this.fetchUserProfile(storedToken);
        } else {
          this.loading = false;
          this.error = 'No Spotify connection detected. Please log in first.';
        }
      })
    );
  }

  fetchUserProfile(token: string) {
    this.loading = true;
    this.error = null;

    this.subs.add(
      this.authService.getcurrentuser(token).subscribe({
        next: (user) => {
          this.userProfile = user;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load profile in dashboard', err);
          this.error = 'Failed to load profile. Please reconnect your Spotify account.';
          this.loading = false;
        }
      })
    );
  }

  retry() {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchUserProfile(token);
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // Styling helpers matching Amethyst theme aesthetic
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

  getThemeBgClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-500/20';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
    return 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20';
  }

  getThemeBorderClass(): string {
    if (this.activeTheme === 'spotify') return 'border-emerald-500/30';
    if (this.activeTheme === 'light') return 'border-indigo-500/30';
    return 'border-violet-500/30';
  }

  getThemeGlowClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-600';
    if (this.activeTheme === 'light') return 'bg-indigo-600';
    return 'bg-violet-600';
  }

  getThemeBadgeClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (this.activeTheme === 'light') return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
  }

  getAvatar(): string {
    if (this.userProfile?.images?.length > 0) {
      return this.userProfile.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80';
  }
}
