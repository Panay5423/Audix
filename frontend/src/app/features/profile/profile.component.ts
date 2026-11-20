import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../cors/services/auth.service';
import { AiService, TasteAnalysisData } from '../../cors/services/ai.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  userProfile: UserProfile | null = null;
  tasteAnalysis: TasteAnalysisData | null = null;
  loadingTaste = false;
  private subs = new Subscription();

  constructor(
    private authService: AuthService,
    private aiService: AiService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.subs.add(
      this.authService.currentUser$.subscribe(u => {
        this.userProfile = u;
        if (u) this.loadTasteAnalysis();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadTasteAnalysis(): void {
    this.loadingTaste = true;
    this.aiService.getTasteAnalysis().subscribe({
      next: (res) => {
        this.tasteAnalysis = res;
        this.loadingTaste = false;
      },
      error: (err) => {
        console.error('Failed to load taste analysis', err);
        this.loadingTaste = false;
      }
    });
  }

  getAvatar(): string {
    if (this.userProfile?.images && this.userProfile.images.length > 0) {
      return this.userProfile.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
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
