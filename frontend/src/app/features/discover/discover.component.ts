import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SpotifyService } from '../../cors/services/spotify.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.css'
})
export class DiscoverComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  featuredPlaylists: any[] = [];
  newReleases: any[] = [];
  recommendations: any[] = [];
  categories: any[] = [];
  loading = true;
  error: string | null = null;
  private subs = new Subscription();

  constructor(
    private spotifyService: SpotifyService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.loadDiscoveryData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadDiscoveryData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      featured: this.spotifyService.getFeaturedPlaylists(10),
      releases: this.spotifyService.getNewReleases(10),
      categories: this.spotifyService.getCategories(12)
    }).subscribe({
      next: (res) => {
        this.featuredPlaylists = res.featured?.playlists?.items || [];
        this.newReleases = res.releases?.albums?.items || [];
        this.categories = res.categories?.categories?.items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Discover data load error', err);
        this.error = 'Failed to load discovery data. Please check your Spotify connection.';
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
