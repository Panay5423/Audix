import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpotifyService } from '../../cors/services/spotify.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  query = '';
  activeFilter: 'all' | 'tracks' | 'artists' | 'albums' | 'playlists' = 'all';
  tracks: any[] = [];
  artists: any[] = [];
  albums: any[] = [];
  playlists: any[] = [];
  loading = false;
  hasSearched = false;

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );

    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['q']) {
          this.query = params['q'];
          this.performSearch(this.query);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearch(): void {
    if (this.query.trim()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.query.trim() },
        queryParamsHandling: 'merge'
      });
      this.performSearch(this.query.trim());
    }
  }

  performSearch(q: string): void {
    if (!q) return;
    this.loading = true;
    this.hasSearched = true;

    this.spotifyService.search(q, 'track,artist,album,playlist', 20).subscribe({
      next: (res) => {
        this.tracks = res.tracks?.items || [];
        this.artists = res.artists?.items || [];
        this.albums = res.albums?.items || [];
        this.playlists = res.playlists?.items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error', err);
        this.loading = false;
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

  getThemeTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-400';
  }

  getThemeBgClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
    return 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20';
  }
}
