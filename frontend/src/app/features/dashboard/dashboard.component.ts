import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../cors/services/auth.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

interface MockTrack {
  title: string;
  artist: string;
  duration: string;
  album: string;
  coverColor: string;
  isPlaying?: boolean;
}

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

  // Analytics Date Range Filters: 'short_term' (4 Weeks), 'medium_term' (6 Months), 'long_term' (All Time)
  selectedTimeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term';

  // Playlist Duplicate Detection State
  isScanningDuplicates = false;
  scanComplete = false;
  duplicatesList: any[] = [];

  // AI Playlist Generator state
  aiPrompt = '';
  isGeneratingPlaylist = false;
  generatedPlaylist: any = null;

  // Social Compatibility Check
  selectedFriend: string | null = null;
  compatibilityScore: number | null = null;
  sharedArtists: string[] = [];

  // Mock Data Suites
  topArtistsShort = [
    { name: 'The Weeknd', genres: 'R&B / Synthpop', playCount: 48, trend: 'up', cover: 'from-rose-500 to-indigo-700' },
    { name: 'Daft Punk', genres: 'Electronic / House', playCount: 36, trend: 'up', cover: 'from-amber-500 to-red-700' },
    { name: 'Billie Eilish', genres: 'Alt Pop', playCount: 29, trend: 'stable', cover: 'from-teal-500 to-cyan-800' },
    { name: 'Tame Impala', genres: 'Psychedelic Rock', playCount: 22, trend: 'down', cover: 'from-purple-500 to-pink-700' }
  ];

  topArtistsMedium = [
    { name: 'Daft Punk', genres: 'Electronic / House', playCount: 124, trend: 'stable', cover: 'from-amber-500 to-red-700' },
    { name: 'The Weeknd', genres: 'R&B / Synthpop', playCount: 110, trend: 'up', cover: 'from-rose-500 to-indigo-700' },
    { name: 'Kavinsky', genres: 'Synthwave', playCount: 84, trend: 'up', cover: 'from-blue-600 to-fuchsia-900' },
    { name: 'Grimes', genres: 'Dream Pop', playCount: 78, trend: 'up', cover: 'from-rose-500 to-teal-800' }
  ];

  topArtistsLong = [
    { name: 'Michael Jackson', genres: 'Pop / Soul', playCount: 520, trend: 'stable', cover: 'from-yellow-600 to-stone-900' },
    { name: 'Daft Punk', genres: 'Electronic / House', playCount: 440, trend: 'up', cover: 'from-amber-500 to-red-700' },
    { name: 'The Weeknd', genres: 'R&B / Synthpop', playCount: 380, trend: 'up', cover: 'from-rose-500 to-indigo-700' },
    { name: 'Linkin Park', genres: 'Alt Rock', playCount: 310, trend: 'down', cover: 'from-zinc-700 to-black' }
  ];

  topTracksShort = [
    { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50', match: '99%' },
    { title: 'Instant Crush', artist: 'Daft Punk', album: 'RAM', duration: '5:37', match: '96%' },
    { title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'HMHAS', duration: '3:30', match: '92%' }
  ];

  topTracksMedium = [
    { title: 'Nightcall', artist: 'Kavinsky', album: 'Outrun', duration: '4:18', match: '95%' },
    { title: 'Midnight City', artist: 'M83', album: 'Hurry Up', duration: '4:03', match: '93%' },
    { title: 'Get Lucky', artist: 'Daft Punk', album: 'RAM', duration: '4:08', match: '89%' }
  ];

  topTracksLong = [
    { title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', match: '98%' },
    { title: 'One More Time', artist: 'Daft Punk', album: 'Discovery', duration: '5:20', match: '94%' },
    { title: 'In The End', artist: 'Linkin Park', album: 'Hybrid Theory', duration: '3:36', match: '91%' }
  ];

  playlists = [
    { name: 'Late Night Synthwave', tracks: 42, vibe: 'Cyberpunk Focus', status: 'Healthy', duplicates: 0 },
    { name: 'Indie Chill Vibes', tracks: 68, vibe: 'Nostalgic Acoustic', status: 'Duplicates Found', duplicates: 2 },
    { name: 'Weekend Workout High', tracks: 35, vibe: 'Energetic Hype', status: 'Healthy', duplicates: 0 }
  ];

  genresBreakdown = [
    { name: 'Synthwave / Synthpop', percentage: 42, color: 'bg-violet-500 shadow-violet-500/20' },
    { name: 'Alternative Indie', percentage: 28, color: 'bg-cyan-500 shadow-cyan-500/20' },
    { name: 'Electronic House', percentage: 18, color: 'bg-emerald-500 shadow-emerald-500/20' },
    { name: 'Modern Hip Hop', percentage: 12, color: 'bg-pink-500 shadow-pink-500/20' }
  ];

  achievements = [
    { title: 'Night Owl', desc: 'Listened to ambient synth after 2:00 AM', unlocked: true, icon: '🌙', badgeColor: 'from-purple-500 to-indigo-700' },
    { title: 'Acoustic Purist', desc: 'Maintained 80%+ acoustic ratio for a week', unlocked: true, icon: '🎻', badgeColor: 'from-amber-400 to-yellow-600' },
    { title: 'Genre Nomad', desc: 'Explored 15 distinct genres in 48 hours', unlocked: false, icon: '🧭', badgeColor: 'from-teal-400 to-emerald-600' },
    { title: 'Curation Champion', desc: 'Cleaned up 10 duplicate tracks in your libraries', unlocked: false, icon: '🧹', badgeColor: 'from-rose-500 to-pink-600' }
  ];

  friendsList = [
    { name: 'Aarav Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Rohan Verma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80' },
    { name: 'Ananya Goel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80' }
  ];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(theme => {
        this.activeTheme = theme;
      })
    );

    // this.subs.add(
    //   this.route.queryParams.subscribe(params => {
    //     if (params['tab']) {
    //       this.activeTab = params['tab'];
    //     }

    //     const spotifyId = params['spotifyId'] || this.authService.getSpotifyId();
    //     if (spotifyId) {
    //       this.authService.saveSpotifyId(spotifyId);
    //       this.fetchProfile(spotifyId);
    //     } else {
    //       this.loading = false;
    //       this.error = 'No Spotify connection detected. Please log in first.';
    //     }
    //   })
    // );

    // Audio player progress simulation
    this.playerInterval = setInterval(() => {
      if (this.isPlaying) {
        this.playerProgress += 0.8;
        if (this.playerProgress >= 100) {
          this.playerProgress = 0;
        }
      }
    }, 400);
  }

  // fetchProfile(spotifyId: string) {
  //   this.loading = true;
  //   this.authService.getUserProfile(spotifyId).subscribe({
  //     next: (profile) => {
  //       this.userProfile = profile;
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Failed to load user profile in dashboard', err);
  //       this.error = 'Failed to load profile. Please connect again.';
  //       this.loading = false;
  //     }
  //   });
  // }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.playerInterval) {
      clearInterval(this.playerInterval);
    }
  }

  // Player Operations
  togglePlayback() {
    this.isPlaying = !this.isPlaying;
  }

  // Duplicate Playlist detection simulation
  startDuplicateScan() {
    this.isScanningDuplicates = true;
    this.scanComplete = false;
    setTimeout(() => {
      this.isScanningDuplicates = false;
      this.scanComplete = true;
      this.duplicatesList = [
        { title: 'Blinding Lights', artist: 'The Weeknd', playlist: 'Indie Chill Vibes', reason: 'Duplicate file matching acoustic nodes' },
        { title: 'Genesis', artist: 'Grimes', playlist: 'Indie Chill Vibes', reason: 'Exact track copy found twice' }
      ];
    }, 2000);
  }

  removeDuplicates() {
    this.duplicatesList = [];
    // Mark playlist duplicate count as 0
    this.playlists[1].duplicates = 0;
    this.playlists[1].status = 'Healthy';
  }

  // AI features
  generateAiPlaylist(event: Event) {
    event.preventDefault();
    if (!this.aiPrompt.trim()) return;

    this.isGeneratingPlaylist = true;
    this.generatedPlaylist = null;
    setTimeout(() => {
      this.isGeneratingPlaylist = false;
      this.generatedPlaylist = {
        name: 'AI: ' + this.aiPrompt.substring(0, 15) + '...',
        description: 'Bespoke AI Curation generated by Audix Neural Mapper matching context: "' + this.aiPrompt + '".',
        tracks: [
          { title: 'Resonance', artist: 'Home', matchScore: '98%' },
          { title: 'Space Song', artist: 'Beach House', matchScore: '95%' },
          { title: 'Midnight City', artist: 'M83', matchScore: '92%' }
        ]
      };
    }, 2500);
  }

  // Social Compatibility checks
  checkCompatibility(friendName: string) {
    this.selectedFriend = friendName;
    this.compatibilityScore = null;
    setTimeout(() => {
      // Generate compatibility score
      if (friendName.includes('Aarav')) {
        this.compatibilityScore = 84;
        this.sharedArtists = ['The Weeknd', 'Daft Punk', 'Kavinsky'];
      } else if (friendName.includes('Rohan')) {
        this.compatibilityScore = 62;
        this.sharedArtists = ['Linkin Park', 'Michael Jackson'];
      } else {
        this.compatibilityScore = 95;
        this.sharedArtists = ['Billie Eilish', 'Tame Impala', 'Grimes', 'The Weeknd'];
      }
    }, 1000);
  }

  // Styling helpers
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

  getAvatar(): string {
    if (this.userProfile?.images?.length > 0) {
      return this.userProfile.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80';
  }
}
