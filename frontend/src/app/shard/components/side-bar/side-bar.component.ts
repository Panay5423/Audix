import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../cors/services/auth.service';
import { ThemeService } from '../../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent implements OnInit, OnDestroy {
  activeTab = 'overview';
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  userProfile: any = null;
  private subs = new Subscription();

  navItems = [
    { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
    { id: 'analytics', name: 'Music Analytics', icon: '🎵' },
    { id: 'playlists', name: 'Playlist Curation', icon: '📁' },
    { id: 'ai-studio', name: 'AI Features', icon: '🤖' },
    { id: 'discovery', name: 'Discovery Engine', icon: '⚡' },
    { id: 'social', name: 'Social Matrix', icon: '👥' },
    { id: 'achievements', name: 'Achievements & Badges', icon: '🏆' },
    { id: 'premium-lab', name: 'Premium Lab', icon: '🧪' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    public themeService: ThemeService
  ) {}

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

    const spotifyId = this.authService.getSpotifyId();
    if (spotifyId) {
      this.loadProfile(spotifyId);
    } else {
      // Fallback: check query param if not in service
      this.subs.add(
        this.route.queryParams.subscribe(params => {
          if (params['spotifyId']) {
            this.authService.saveSpotifyId(params['spotifyId']);
            this.loadProfile(params['spotifyId']);
          }
        })
      );
    }
  }

  loadProfile(spotifyId: string) {
    this.subs.add(
      this.authService.getUserProfile(spotifyId).subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (err) => {
          console.error('Failed to load user profile in sidebar', err);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  selectTab(tabId: string) {
    const spotifyId = this.authService.getSpotifyId() || this.route.snapshot.queryParams['spotifyId'];
    this.router.navigate(['/dashboard'], {
      queryParams: { spotifyId, tab: tabId }
    });
  }

  logout() {
    this.authService.clearSpotifyId();
    this.router.navigate(['/home']);
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
    if (this.userProfile?.images?.length > 0) {
      return this.userProfile.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';
  }
}
