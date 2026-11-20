import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, UserProfile } from '../../cors/services/auth.service';
import { SpotifyService } from '../../cors/services/spotify.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  userProfile: UserProfile | null = null;
  topTracks: any[] = [];
  topArtists: any[] = [];
  recentTracks: any[] = [];
  userPlaylists: any[] = [];
  recommendations: any[] = [];

  loading = true;
  loadingSpotifyData = false;
  error: string | null = null;

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(theme => {
        this.activeTheme = theme;
      })
    );

    // Capture token from query params or localStorage
    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
          this.authService.setToken(tokenFromUrl);
          this.router.navigate(['/dashboard'], {
            queryParams: {},
            replaceUrl: true
          });
          this.fetchUserProfile();
          return;
        }

        const storedToken = this.authService.getToken();
        if (storedToken) {
          this.fetchUserProfile();
        } else {
          this.loading = false;
          this.error = 'No Spotify connection detected. Please connect your account.';
        }
      })
    );
  }

  fetchUserProfile() {
    this.loading = true;
    this.error = null;

    this.subs.add(
      this.authService.fetchCurrentUser().subscribe({
        next: (user) => {
          this.userProfile = user;
          this.loading = false;
          this.fetchLiveSpotifyData();
        },
        error: (err) => {
          console.error('Failed to load profile in dashboard', err);
          this.error = 'Failed to load profile. Please reconnect your Spotify account.';
          this.loading = false;
        }
      })
    );
  }

  fetchLiveSpotifyData() {
    this.loadingSpotifyData = true;

    forkJoin({
      topTracks: this.spotifyService.getTopTracks('medium_term', 6),
      topArtists: this.spotifyService.getTopArtists('medium_term', 6),
      recent: this.spotifyService.getRecentlyPlayed(6),
      playlists: this.spotifyService.getUserPlaylists(6)
    }).subscribe({
      next: (res) => {
        this.topTracks = res.topTracks?.items || [];
        this.topArtists = res.topArtists?.items || [];
        this.recentTracks = res.recent?.items || [];
        this.userPlaylists = res.playlists?.items || [];
        this.loadingSpotifyData = false;

        // Fetch recommendations based on top seed track
        if (this.topTracks.length > 0) {
          this.spotifyService.getRecommendations({
            seed_tracks: this.topTracks[0].id,
            limit: 5
          }).subscribe({
            next: (rec) => this.recommendations = rec?.tracks || [],
            error: () => {}
          });
        }
      },
      error: (err) => {
        console.warn('Non-fatal: could not fetch all Spotify dashboard sub-items', err.message);
        this.loadingSpotifyData = false;
      }
    });
  }

  playTrack(track: any): void {
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artist: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      album: track.album?.name || '',
      albumArt: track.album?.images?.[0]?.url || '',
      durationMs: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url
    };
    this.playerService.playTrack(playerTrack);
  }

  formatTime(ms: number): string {
    if (!ms) return '0:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  retry() {
    const token = this.authService.getToken();
    if (token) {
      this.fetchUserProfile();
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
    if (this.userProfile?.images && this.userProfile.images.length > 0) {
      return this.userProfile.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&h=160&q=80';
  }
}
