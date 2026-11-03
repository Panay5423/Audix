import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-audix-scroll-intro',
  standalone: true,
  templateUrl: './audix-scroll-intro.component.html',
  styleUrl: './audix-scroll-intro.component.css'
})
export class AudixScrollIntroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollScene') scrollScene!: ElementRef<HTMLElement>;
  @ViewChild('wordmarkStack') wordmarkStack!: ElementRef<HTMLDivElement>;
  @ViewChild('blackWipe') blackWipe!: ElementRef<HTMLDivElement>;
  @ViewChild('headlineWrap') headlineWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('headlineUnderline') headlineUnderline!: ElementRef<HTMLDivElement>;
  @ViewChild('waveform') waveform!: ElementRef<SVGSVGElement>;
  @ViewChild('finalHeadline') finalHeadline!: ElementRef<HTMLSpanElement>;

  private timeline: gsap.core.Timeline | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private reducedMotion = false;

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) return;

    void document.fonts.ready.then(() => {
      if (!this.destroyed) this.buildTimeline();
    });
  }

  private buildTimeline(): void {
    const scene = this.scrollScene.nativeElement;
    const stack = this.wordmarkStack.nativeElement;
    const solid = stack.querySelector<HTMLElement>('.word-solid');
    if (!solid) return;

    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();

    const wipe = this.blackWipe.nativeElement;
    const headline = this.headlineWrap.nativeElement;
    const underline = this.headlineUnderline.nativeElement;
    const waveform = this.waveform.nativeElement;
    const finalHeadline = this.finalHeadline.nativeElement;
    const outlines = stack.querySelectorAll<HTMLElement>('.word-outline');
    const bars = waveform.querySelectorAll('rect');
    const solidRect = solid.getBoundingClientRect();
    const targetLeft = (window.innerWidth - solidRect.width) / 2;
    const targetTop = window.innerHeight * 0.369;
    const translateX = targetLeft - solidRect.left;
    const translateY = targetTop - solidRect.top;

    gsap.set(solid, { x: 0, y: 0, scale: 1, transformOrigin: 'center center' });
    gsap.set(outlines, { opacity: 1 });
    gsap.set(wipe, { scaleY: 0, transformOrigin: 'bottom center' });
    gsap.set(headline, { opacity: 0, x: 0, y: 15, left: 5 });
    gsap.set(underline, { width: Math.min(window.innerWidth * 0.378, 545) });
    gsap.set(waveform, { opacity: 0 });
    gsap.set(bars, { scaleY: 0.15, transformOrigin: 'center center' });
    gsap.set(finalHeadline, { color: '#fff' });

    this.timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    this.timeline
      .to(outlines, { opacity: 0, duration: 0.45, ease: 'power1.inOut' }, 0.55)
      .to(solid, { x: translateX, y: translateY, duration: 0.6, ease: 'power2.inOut' }, 0.55)
      .to(solid, { scale: 5.2, duration: 1.1, ease: 'power1.inOut' }, 1.35)
      .to(solid, { y: translateY - window.innerHeight * 0.28, duration: 0.95, ease: 'power1.inOut' }, 2.45)
      .to(wipe, { scaleY: 1, duration: 0.95, ease: 'power1.inOut' }, 2.45)
      .to(headline, { opacity: 1, y: 0, duration: 0.35, ease: 'power1.out' }, 3.65)
      .to(headline, { left: 20, duration: 0.5, ease: 'none' }, 4.15)
      .to(underline, { width: () => Math.max(0, window.innerWidth - 40), duration: 0.55, ease: 'power1.inOut' }, 4.15)
      .to(waveform, { opacity: 1, duration: 0.2, ease: 'none' }, 4.52)
      .to(bars, { scaleY: 1, duration: 0.45, stagger: 0.035, ease: 'power2.out' }, 4.52)
      .to(finalHeadline, { color: '#F8E209', duration: 0.25, ease: 'none' }, 4.9);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.reducedMotion) return;
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.buildTimeline();
      ScrollTrigger.refresh();
    }, 180);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.timeline?.scrollTrigger?.kill();
    this.timeline?.kill();
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
  }
}
