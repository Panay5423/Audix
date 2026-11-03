
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../cors/services/auth.service';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // ================= VIEW REFERENCES =================

  @ViewChild('scrollScene') scrollScene!: ElementRef<HTMLDivElement>;
  @ViewChild('heroWrapper') heroWrapper!: ElementRef<HTMLDivElement>;

  @ViewChild('audixOutlineBlack') audixOutlineBlack!: ElementRef<HTMLHeadingElement>;
  @ViewChild('audixSolidBlack') audixSolidBlack!: ElementRef<HTMLHeadingElement>;
  @ViewChild('audixOutlineGrey') audixOutlineGrey!: ElementRef<HTMLHeadingElement>;

  @ViewChild('taglineGroup') taglineGroup!: ElementRef<HTMLDivElement>;
  @ViewChild('ctaContainer') ctaContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('staffContainer') staffContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('footerSection') footerSection!: ElementRef<HTMLElement>;
  @ViewChild('footerInner') footerInner!: ElementRef<HTMLDivElement>;


  // ================= APPLICATION STATE =================

  spotifyAuthUrl: string = '';

  currentYear: number = new Date().getFullYear();

  toastMessage: string | null = null;

  activeModal: 'about' | 'privacy' | null = null;

  isReducedMotion: boolean = false;


  // ================= GSAP STATE =================

  private scrollTimeline: gsap.core.Timeline | null = null;

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  private resizeDebounce: ReturnType<typeof setTimeout> | null = null;


  constructor(
    private authService: AuthService,
    private router: Router
  ) { }


  // ================= INITIALIZATION =================

  ngOnInit(): void {

    // Prefetch Spotify authorization URL

    this.authService.getAccessToken().subscribe({
      next: (res: any) => {
        if (res?.url) {
          this.spotifyAuthUrl = res.url;
        }
      },
      error: (err: any) => {
        console.warn(
          'Could not prefetch Spotify authorization URL:',
          err
        );
      }
    });

  }


  ngAfterViewInit(): void {

    if (typeof window === 'undefined') return;

    window.scrollTo(0, 0);

    // Wait for fonts and layout

    setTimeout(() => {
      this.initScrollAnimation();
    }, 150);

  }


  // ================= MAIN SCROLL ANIMATION =================

  initScrollAnimation(): void {

    if (typeof window === 'undefined') return;

    // Reduced motion support

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

      this.isReducedMotion = true;

      if (this.footerSection?.nativeElement) {
        this.footerSection.nativeElement.style.pointerEvents = 'auto';
      }

      return;
    }

    this.isReducedMotion = false;

    // Check required elements

    if (
      !this.scrollScene?.nativeElement ||
      !this.heroWrapper?.nativeElement ||
      !this.audixSolidBlack?.nativeElement
    ) {
      return;
    }


    // Clean previous animation only

    if (this.scrollTimeline) {

      this.scrollTimeline.scrollTrigger?.kill();

      this.scrollTimeline.kill();

      this.scrollTimeline = null;
    }


    // ================= ELEMENTS =================

    const sceneEl = this.scrollScene.nativeElement;

    const wrapperEl = this.heroWrapper.nativeElement;

    const solidEl = this.audixSolidBlack.nativeElement;


    // Reset GSAP transforms

    gsap.set(
      [
        solidEl,
        wrapperEl,
        this.audixOutlineBlack?.nativeElement,
        this.audixOutlineGrey?.nativeElement,
        this.taglineGroup?.nativeElement,
        this.ctaContainer?.nativeElement,
        this.staffContainer?.nativeElement,
        this.footerInner?.nativeElement
      ].filter(Boolean),
      {
        clearProps: 'transform,opacity'
      }
    );


    // Fresh layout measurements

    const rect = solidEl.getBoundingClientRect();

    const viewportWidth = window.innerWidth;

    const viewportHeight = window.innerHeight;


    // ================= CENTER POSITION =================

    const elemCenterX = rect.left + rect.width / 2;

    const elemCenterY = rect.top + rect.height / 2;

    const viewportCenterX = viewportWidth / 2;

    const viewportCenterY = viewportHeight / 2;

    const deltaX = viewportCenterX - elemCenterX;

    const deltaY = viewportCenterY - elemCenterY;


    // ================= SCALE VALUES =================

    // First scale: Audix takes approximately 75% width

    const centerScale = Math.min(
      Math.max(
        (viewportWidth * 0.75) / Math.max(rect.width, 1),
        1
      ),
      3.5
    );


    // Final scale: Audix expands beyond viewport edges

    const zoomScale = Math.max(
      centerScale,
      (viewportWidth * 1.8) / Math.max(rect.width, 1)
    );


    // ================= FADE ELEMENTS =================

    const fadeElements = [
      this.audixOutlineBlack?.nativeElement,
      this.audixOutlineGrey?.nativeElement,
      this.taglineGroup?.nativeElement,
      this.ctaContainer?.nativeElement
    ].filter(Boolean);


    // ================= MASTER TIMELINE =================

    this.scrollTimeline = gsap.timeline({

      scrollTrigger: {

        trigger: sceneEl,

        start: 'top top',

        end: 'bottom bottom',

        pin: wrapperEl,

        scrub: 0.8,

        anticipatePin: 1,

        invalidateOnRefresh: true,

        onUpdate: (self) => {

          // Footer interaction

          if (this.footerSection?.nativeElement) {

            this.footerSection.nativeElement.style.pointerEvents =
              self.progress >= 0.90 ? 'auto' : 'none';

          }

        }

      }

    });


    const tl = this.scrollTimeline;


    // ==================================================
    // PHASE 1: INITIAL STACKED AUDIX
    // ==================================================

    // Outlined Audix + tagline + CTA fade out

    if (fadeElements.length) {

      tl.to(
        fadeElements,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        },
        0
      );

    }


    // Musical staff dims

    if (this.staffContainer?.nativeElement) {

      tl.to(
        this.staffContainer.nativeElement,
        {
          opacity: 0.15,
          duration: 0.3,
          ease: 'power2.out'
        },
        0
      );

    }


    // ==================================================
    // PHASE 2: SOLID AUDIX MOVES TO CENTER
    // ==================================================

    tl.to(
      solidEl,
      {

        x: deltaX,

        y: deltaY,

        scale: centerScale,

        transformOrigin: 'center center',

        duration: 0.35,

        ease: 'power3.inOut'

      },
      0.10
    );


    // ==================================================
    // PHASE 3: AUDIX ZOOM EFFECT
    // ==================================================

    tl.to(
      solidEl,
      {

        scale: zoomScale,

        duration: 0.35,

        ease: 'power2.inOut'

      },
      0.48
    );


    // ==================================================
    // PHASE 4: FADE STAFF AND WORDMARK
    // ==================================================

    if (this.staffContainer?.nativeElement) {

      tl.to(
        this.staffContainer.nativeElement,
        {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in'
        },
        0.76
      );

    }


    tl.to(
      solidEl,
      {

        opacity: 0,

        duration: 0.12,

        ease: 'power2.in'

      },
      0.82
    );


    // ==================================================
    // PHASE 5: HERO CURTAIN SLIDES UP
    // ==================================================

    tl.to(
      wrapperEl,
      {

        yPercent: -100,

        duration: 0.40,

        ease: 'power3.inOut'

      },
      0.88
    );


    // ==================================================
    // PHASE 6: FOOTER REVEAL
    // ==================================================

    if (this.footerInner?.nativeElement) {

      tl.fromTo(

        this.footerInner.nativeElement,

        {
          y: 40,
          opacity: 0
        },

        {
          y: 0,
          opacity: 1,

          duration: 0.35,

          ease: 'power2.out'

        },

        0.94

      );

    }


    // Refresh measurements

    ScrollTrigger.refresh();

  }


  // ================= RESPONSIVE RESIZE =================

  @HostListener('window:resize')

  onResize(): void {

    if (this.isReducedMotion) return;

    if (this.resizeDebounce) {
      clearTimeout(this.resizeDebounce);
    }

    this.resizeDebounce = setTimeout(() => {

      this.initScrollAnimation();

    }, 250);

  }


  // ================= SPOTIFY AUTHENTICATION =================

  getStarted(): void {

    const existingToken = localStorage.getItem('token');

    if (existingToken) {

      this.router.navigate(['/dashboard']);

      return;
    }


    if (this.spotifyAuthUrl) {

      window.location.href = this.spotifyAuthUrl;

      return;
    }


    this.authService.getAccessToken().subscribe({

      next: (res: any) => {

        if (res?.url) {

          window.location.href = res.url;

        } else {

          this.router.navigate(['/dashboard']);

        }

      },

      error: () => {

        this.router.navigate(['/dashboard']);

      }

    });

  }


  // ================= MODALS =================

  onAboutClick(event: Event): void {

    event.preventDefault();

    this.activeModal = 'about';

  }


  onPrivacyClick(event: Event): void {

    event.preventDefault();

    this.activeModal = 'privacy';

  }


  closeModal(): void {

    this.activeModal = null;

  }


  // ================= LOGOUT =================

  onLogoutClick(): void {

    localStorage.removeItem('token');

    this.showToast('Logged out successfully.');

    if (typeof window !== 'undefined') {

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }

  }


  // ================= TOAST NOTIFICATION =================

  showToast(message: string): void {

    this.toastMessage = message;

    if (this.toastTimeout) {

      clearTimeout(this.toastTimeout);

    }

    this.toastTimeout = setTimeout(() => {

      this.toastMessage = null;

      this.toastTimeout = null;

    }, 3000);

  }


  // ================= CLEANUP =================

  ngOnDestroy(): void {

    if (this.scrollTimeline) {

      this.scrollTimeline.scrollTrigger?.kill();

      this.scrollTimeline.kill();

      this.scrollTimeline = null;

    }

    if (this.toastTimeout) {

      clearTimeout(this.toastTimeout);

    }

    if (this.resizeDebounce) {

      clearTimeout(this.resizeDebounce);

    }

  }

}
