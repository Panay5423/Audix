import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayerService, PlayerTrack, PlaybackDevice } from '../../../cors/services/player.service';
import { ThemeService } from '../../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.css'
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  currentTrack: PlayerTrack | null = null;
  isPlaying = false;
  progressMs = 0;
  durationMs = 0;
  volume = 80;
  devices: PlaybackDevice[] = [];
  activeDevice: PlaybackDevice | null = null;
  showDeviceMenu = false;
  statusMessage: string | null = null;

  private subs = new Subscription();

  constructor(
    public playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(theme => this.activeTheme = theme)
    );
    this.subs.add(
      this.playerService.currentTrack$.subscribe(t => this.currentTrack = t)
    );
    this.subs.add(
      this.playerService.isPlaying$.subscribe(p => this.isPlaying = p)
    );
    this.subs.add(
      this.playerService.progressMs$.subscribe(p => this.progressMs = p)
    );
    this.subs.add(
      this.playerService.durationMs$.subscribe(d => this.durationMs = d)
    );
    this.subs.add(
      this.playerService.volume$.subscribe(v => this.volume = v)
    );
    this.subs.add(
      this.playerService.devices$.subscribe(d => this.devices = d)
    );
    this.subs.add(
      this.playerService.activeDevice$.subscribe(d => this.activeDevice = d)
    );
    this.subs.add(
      this.playerService.playbackStatusMessage$.subscribe(m => this.statusMessage = m)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  togglePlay(): void {
    this.playerService.togglePlay();
  }

  next(): void {
    this.playerService.next();
  }

  previous(): void {
    this.playerService.previous();
  }

  onSeek(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.playerService.seek(val);
  }

  onVolumeChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.playerService.setVolume(val);
  }

  selectDevice(deviceId: string): void {
    this.playerService.transferDevice(deviceId);
    this.showDeviceMenu = false;
  }

  formatTime(ms: number): string {
    if (!ms || isNaN(ms)) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  getThemeBgClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
    return 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20';
  }

  getThemeProgressClass(): string {
    if (this.activeTheme === 'spotify') return 'accent-emerald-500 bg-emerald-500';
    if (this.activeTheme === 'light') return 'accent-indigo-600 bg-indigo-600';
    return 'accent-violet-500 bg-violet-500';
  }

  getThemeTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-400';
  }
}
