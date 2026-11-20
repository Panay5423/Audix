import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AiService, ChatMessageItem } from '../../cors/services/ai.service';
import { PlayerService, PlayerTrack } from '../../cors/services/player.service';
import { ThemeService } from '../../cors/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  activeTheme: 'purple' | 'spotify' | 'light' = 'purple';
  messages: ChatMessageItem[] = [];
  inputPrompt = '';
  sending = false;
  loadingHistory = true;
  shouldScroll = false;

  suggestedPrompts = [
    'Recommend songs based on my recent taste',
    'Suggest underrated artists I might like',
    'Recommend something for deep study and focus',
    'Suggest songs for a moody late-night drive',
    'Find songs similar to Arctic Monkeys and The Weeknd',
    'Suggest something completely wild and different from my usual taste'
  ];

  private subs = new Subscription();

  constructor(
    private aiService: AiService,
    private playerService: PlayerService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.themeService.activeTheme$.subscribe(t => this.activeTheme = t)
    );
    this.loadHistory();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadHistory(): void {
    this.loadingHistory = true;
    this.aiService.getChatHistory().subscribe({
      next: (hist) => {
        if (hist && hist.length > 0) {
          this.messages = hist;
        } else {
          // Welcome greeting
          this.messages = [
            {
              role: 'assistant',
              content: 'Greetings. I am Audix AI, your personal sonic intelligence. I am connected directly to your Spotify profile and listening habits. Ask me for personalized recommendations, artist deep-dives, or mood curation.'
            }
          ];
        }
        this.loadingHistory = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.loadingHistory = false;
        this.messages = [
          {
            role: 'assistant',
            content: 'Hello! I am ready to explore your Spotify universe. What kind of music are you in the mood for today?'
          }
        ];
      }
    });
  }

  send(promptText?: string): void {
    const text = (promptText || this.inputPrompt).trim();
    if (!text || this.sending) return;

    this.inputPrompt = '';
    this.messages.push({
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    });

    this.sending = true;
    this.shouldScroll = true;

    this.aiService.chat(text).subscribe({
      next: (res) => {
        this.messages.push({
          role: 'assistant',
          content: res.reply,
          recommendedTracks: res.recommendedTracks,
          createdAt: new Date().toISOString()
        });
        this.sending = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        console.error('Chat error', err);
        this.messages.push({
          role: 'assistant',
          content: 'I had trouble connecting to the neural audio pipeline. Please check your network or try again.',
          createdAt: new Date().toISOString()
        });
        this.sending = false;
        this.shouldScroll = true;
      }
    });
  }

  playTrack(track: any): void {
    const playerTrack: PlayerTrack = {
      id: track.id,
      name: track.name,
      artist: Array.isArray(track.artists) ? track.artists.join(', ') : (track.artists || 'Unknown Artist'),
      album: track.album || '',
      albumArt: track.albumCover || '',
      durationMs: track.duration_ms || 180000,
      uri: track.uri,
      previewUrl: track.previewUrl
    };
    this.playerService.playTrack(playerTrack);
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
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
