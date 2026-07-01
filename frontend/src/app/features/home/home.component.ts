import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../cors/services/auth.service';

interface MockArtist {
  name: string;
  genre: string;
  matchScore: number;
  listenTime: string;
  trend: 'up' | 'stable' | 'down';
  rank: number;
  initials: string;
  color: string;
}

interface MockFeature {
  name: string;
  value: number;
  percentage: number;
  description: string;
  color: string;
}

interface MockTrack {
  title: string;
  artist: string;
  duration: string;
  album: string;
  coverColor: string;
  isPlaying?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private authservice: AuthService,) { }
  // Navigation active tab
  activeSection = 'hero';

  // Theme Toggler state: 'purple' (Amethyst), 'spotify' (Classic Green), 'light' (Ice Light)
  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';

  // Dropdown states for premium theme customizer buttons
  showThemeDropdown = false;
  showFloatingCustomizer = false;

  // Music Player Simulation
  isPlaying = false;
  playerProgress = 35;
  playerInterval: any;
  currentTrack: MockTrack = {
    title: 'Starboy',
    artist: 'The Weeknd',
    duration: '3:50',
    album: 'Starboy',
    coverColor: 'from-[#e11d48] to-[#4c1d95]',
    isPlaying: false
  };

  // Demo Scan State
  isAnalyzing = false;
  analysisStep = 0;
  analysisProgress = 0;
  analysisProgressLabel = '0%';
  demoProfileReady = false;
  analysisSteps = [
    'Establishing secure library connection...',
    'Fetching top artists and listening history...',
    'Running AI acoustic profiling & sonic vector analysis...',
    'Generating personalized musical DNA profile...'
  ];
  analysisInterval: any;

  // Interactive Recommendation Slider
  discoveryFactor = 65; // Percentage (Safe vs. Adventurous)
  recommendedTracks: MockTrack[] = [];

  // Active Category for the Big-Tech Features Catalog
  activeFeatureCategory: 'ai' | 'playlist' | 'premium' | 'social' = 'ai';

  // Playlist Deduplication Simulator State
  hasDuplicates = true;
  duplicatesList = [
    { title: 'Blinding Lights', artist: 'The Weeknd', reason: 'Found in "Late Night" & "Favorites"' },
    { title: 'Genesis', artist: 'Grimes', reason: 'Exact double in "Synthesized Moods"' }
  ];

  // Achievements State
  achievements = [
    { name: 'Night Owl', desc: 'Listened after 2 AM', unlocked: true, icon: '🌙', color: 'from-indigo-500 to-purple-600' },
    { name: 'Deep Diver', desc: 'Discovered obscure artists', unlocked: false, icon: '🤿', color: 'from-emerald-500 to-cyan-500' },
    { name: 'Consistent Hearer', desc: '7 Day streak active', unlocked: true, icon: '🔥', color: 'from-orange-500 to-red-500' }
  ];

  // Mock Data
  topArtists: MockArtist[] = [
    { name: 'The Weeknd', genre: 'R&B / Synthpop', matchScore: 98, listenTime: '12h 45m', trend: 'up', rank: 1, initials: 'TW', color: 'from-[#e11d48] to-[#4c1d95]' },
    { name: 'Daft Punk', genre: 'Electronic / House', matchScore: 94, listenTime: '8h 20m', trend: 'up', rank: 2, initials: 'DP', color: 'from-[#d97706] to-[#b91c1c]' },
    { name: 'Billie Eilish', genre: 'Alt Pop', matchScore: 89, listenTime: '6h 15m', trend: 'stable', rank: 3, initials: 'BE', color: 'from-[#0d9488] to-[#0f766e]' },
    { name: 'Tame Impala', genre: 'Psychedelic Rock', matchScore: 87, listenTime: '5h 40m', trend: 'down', rank: 4, initials: 'TI', color: 'from-[#8b5cf6] to-[#6d28d9]' }
  ];

  audioFeatures: MockFeature[] = [
    { name: 'Energy', value: 78, percentage: 78, description: 'High energy tracks dominate your library.', color: 'bg-emerald-500 shadow-emerald-500/20' },
    { name: 'Danceability', value: 64, percentage: 64, description: 'Groovy, rhythm-heavy tracks are preferred.', color: 'bg-teal-500 shadow-teal-500/20' },
    { name: 'Acousticness', value: 18, percentage: 18, description: 'Electric and synthesized instruments lead.', color: 'bg-cyan-500 shadow-cyan-500/20' },
    { name: 'Valence (Happiness)', value: 52, percentage: 52, description: 'A balanced mix of euphoric and melancholic vibes.', color: 'bg-indigo-500 shadow-indigo-500/20' }
  ];

  allTracksList: MockTrack[] = [
    { title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', album: 'After Hours', coverColor: 'from-red-600 to-black' },
    { title: 'Get Lucky', artist: 'Daft Punk', duration: '4:08', album: 'Random Access Memories', coverColor: 'from-amber-500 to-yellow-900' },
    { title: 'Birds of a Feather', artist: 'Billie Eilish', duration: '3:30', album: 'Hit Me Hard and Soft', coverColor: 'from-teal-600 to-indigo-900' },
    { title: 'The Less I Know The Better', artist: 'Tame Impala', duration: '3:38', album: 'Currents', coverColor: 'from-purple-600 to-pink-900' }
  ];

  Spotify_auth_URl: string = "";
  ngOnInit() {
    this.updateRecommendations();
    // Simulate player progress ticking if active
    this.playerInterval = setInterval(() => {
      if (this.isPlaying) {
        this.playerProgress += 0.8;
        if (this.playerProgress >= 100) {
          this.playerProgress = 0;
          this.nextTrack();
        }
      }
    }, 300);

    this.authservice.getAccessToken().subscribe({
      next: (res: any) => {
        this.Spotify_auth_URl = res.url;
        console.log(this.Spotify_auth_URl);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  connectSpotify() {
    window.location.href = this.Spotify_auth_URl;
  }

  ngOnDestroy() {
    if (this.playerInterval) clearInterval(this.playerInterval);
    if (this.analysisInterval) clearInterval(this.analysisInterval);
  }

  // Toggles active theme dynamically
  setTheme(theme: 'purple' | 'spotify' | 'light') {
    this.activeTheme = theme;
    this.showThemeDropdown = false;
    this.showFloatingCustomizer = false;
  }

  // Helper Methods to Map Colors according to active theme
  getThemeTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-400';
  }

  getThemeLogoColorClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-500';
    if (this.activeTheme === 'light') return 'text-indigo-600';
    return 'text-violet-500';
  }

  getThemeBgClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-500/20';
    if (this.activeTheme === 'light') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20';
    return 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20';
  }

  getThemeGradientTextClass(): string {
    if (this.activeTheme === 'spotify') return 'from-emerald-400 via-green-200 to-emerald-200';
    if (this.activeTheme === 'light') return 'from-indigo-600 via-purple-600 to-pink-600';
    return 'from-violet-400 via-indigo-200 to-cyan-400';
  }

  getThemeGlowClass(): string {
    if (this.activeTheme === 'spotify') return 'bg-emerald-600/5';
    if (this.activeTheme === 'light') return 'bg-indigo-600/5';
    return 'bg-violet-600/5';
  }

  getThemeAccentTextClass(): string {
    if (this.activeTheme === 'spotify') return 'text-emerald-400';
    if (this.activeTheme === 'light') return 'text-indigo-500';
    return 'text-violet-400';
  }

  // Toggle playback
  togglePlayback() {
    this.isPlaying = !this.isPlaying;
  }

  // Skip track simulation
  nextTrack() {
    const currentIndex = this.allTracksList.findIndex(t => t.title === this.currentTrack.title);
    const nextIndex = (currentIndex + 1) % this.allTracksList.length;
    const next = this.allTracksList[nextIndex];

    this.currentTrack = {
      ...next,
      isPlaying: this.isPlaying
    };
    this.playerProgress = 0;
  }

  // Previous track simulation
  prevTrack() {
    const currentIndex = this.allTracksList.findIndex(t => t.title === this.currentTrack.title);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = this.allTracksList.length - 1;
    const prev = this.allTracksList[prevIndex];

    this.currentTrack = {
      ...prev,
      isPlaying: this.isPlaying
    };
    this.playerProgress = 0;
  }

  // Interactive Recommendation logic based on Slider
  onSliderChange(event: any) {
    this.discoveryFactor = Number(event.target.value);
    this.updateRecommendations();
  }

  updateRecommendations() {
    if (this.discoveryFactor < 30) {
      // Safe zone: core favorites
      this.recommendedTracks = [
        { title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', album: 'After Hours', coverColor: 'from-red-500 to-purple-800' },
        { title: 'Instant Crush', artist: 'Daft Punk ft. Julian Casablancas', duration: '5:37', album: 'Random Access Memories', coverColor: 'from-amber-600 to-amber-950' },
        { title: 'Borderline', artist: 'Tame Impala', duration: '3:57', album: 'The Slow Rush', coverColor: 'from-pink-600 to-purple-900' }
      ];
    } else if (this.discoveryFactor >= 30 && this.discoveryFactor <= 75) {
      // Hybrid zone: similar artists, slightly new vibes
      this.recommendedTracks = [
        { title: 'Nightcall', artist: 'Kavinsky', duration: '4:18', album: 'Outrun', coverColor: 'from-blue-600 to-fuchsia-900' },
        { title: 'Midnight City', artist: 'M83', duration: '4:03', album: 'Hurry Up, We\'re Dreaming', coverColor: 'from-indigo-600 to-cyan-900' },
        { title: 'Genesis', artist: 'Grimes', duration: '4:15', album: 'Visions', coverColor: 'from-rose-500 to-teal-800' }
      ];
    } else {
      // Experimental zone: wildly new recommendation matching acoustic vector
      this.recommendedTracks = [
        { title: 'Abrasive', artist: 'Ratatat', duration: '4:41', album: 'Magnifique', coverColor: 'from-orange-500 to-stone-900' },
        { title: 'Space Song', artist: 'Beach House', duration: '5:20', album: 'Depression Cherry', coverColor: 'from-red-900 to-emerald-950' },
        { title: 'Resonance', artist: 'Home', duration: '3:32', album: 'Odyssey', coverColor: 'from-blue-500 to-purple-600' }
      ];
    }
  }

  // Set active bento features category
  setFeatureCategory(category: 'ai' | 'playlist' | 'premium' | 'social') {
    this.activeFeatureCategory = category;
  }

  // Playlist deduplication simulation
  deduplicatePlaylist() {
    this.hasDuplicates = false;
    this.duplicatesList = [];
  }

  // Unlock music achievement simulation
  unlockAchievement(index: number) {
    this.achievements[index].unlocked = true;
  }

  // Interactive Live Analyzer Simulation
  startDemoAnalysis() {
    if (this.isAnalyzing) return;

    this.isAnalyzing = true;
    this.analysisStep = 0;
    this.analysisProgress = 0;
    this.demoProfileReady = false;

    const stepDuration = 2000; // 2 seconds per step
    const intervalTick = 50; // Update progress bar every 50ms
    const totalTicks = stepDuration / intervalTick;
    let tickCount = 0;

    this.analysisInterval = setInterval(() => {
      tickCount++;

      // Calculate overall progress across 4 steps
      const currentStepWeight = 25;
      const stepProgress = (tickCount / totalTicks) * 100;
      const overallProgress = (this.analysisStep * currentStepWeight) + (stepProgress * 0.25);

      this.analysisProgress = Math.min(Math.round(overallProgress), 100);
      this.analysisProgressLabel = `${this.analysisProgress}%`;

      if (tickCount >= totalTicks) {
        tickCount = 0;
        this.analysisStep++;

        if (this.analysisStep >= this.analysisSteps.length) {
          clearInterval(this.analysisInterval);
          this.isAnalyzing = false;
          this.demoProfileReady = true;
          this.analysisProgress = 100;
          this.analysisProgressLabel = '100%';
        }
      }
    }, intervalTick);
  }

  // Scroll smoothly to sections
  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }


}

