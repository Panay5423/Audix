import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService, AnalyticsSummary } from '../../cors/services/analytics.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  timeRange = 'medium_term';
  analytics: AnalyticsSummary | null = null;
  loading = true;
  error: string | null = null;

  private subs = new Subscription();

  constructor(
    private analyticsService: AnalyticsService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setTimeRange(range: string): void {
    if (this.timeRange === range) return;
    this.timeRange = range;
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    this.analyticsService.getAnalytics(this.timeRange).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Analytics load error', err);
        this.error = 'Failed to load music analytics. Please ensure your Spotify profile is connected.';
        this.loading = false;
      }
    });
  }

  playTrack(track: any): void {
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artist: track.artist,
      album: track.album || '',
      albumArt: track.image || '',
      durationMs: track.durationMs || 180000,
      uri: `spotify:track:${track.id}`,
      previewUrl: ''
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
    if (this.activeTheme === 'spotify') return 'bg-emerald-500 hover:bg-emerald-400 text-black';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white';
    return 'bg-violet-600 hover:bg-violet-500 text-white';
  }

  getThemeProgressBarClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-500';
    if (this.activeTheme === 'light') return 'bg-indigo-600';
    return 'bg-violet-500';
  }
}
