import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[MiddleEllipsis]',
  standalone: true,
})
export class MiddleEllipsisDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  public minLength = input<number>(10); // Default minimum length
  private originalText: string = '';
  private observer: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    this.originalText = this.el.nativeElement.textContent || '';
    this.applyEllipsis();

    this.observer = new ResizeObserver(() => this.applyEllipsis());
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private applyEllipsis(): void {
    const element = this.el.nativeElement;
    const containerWidth = element.clientWidth;
    const computedStyle = window.getComputedStyle(element);
    const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Create canvas for text measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    context.font = font;

    // 1. Check if original text fits
    if (context.measureText(this.originalText).width <= containerWidth) {
      this.renderer.setProperty(element, 'textContent', this.originalText);
      return;
    }

    // 2. Check minLength constraint
    const minLen = this.minLength();
    if (this.originalText.length <= minLen) {
      this.renderer.setProperty(element, 'textContent', this.originalText);
      return;
    }

    // 3. Calculate maximum possible middle without overlap
    const maxMiddle = Math.floor((this.originalText.length - 3) / 2);
    let start = 0;
    let end = maxMiddle;
    let truncatedText = '';

    // 4. Binary search for optimal truncation
    while (start <= end) {
      const middle = Math.floor((start + end) / 2);
      const left = this.originalText.slice(0, middle);
      const right = this.originalText.slice(-middle);
      const tempText = `${left}...${right}`;

      if (context.measureText(tempText).width > containerWidth) {
        end = middle - 1;
      } else {
        truncatedText = tempText;
        start = middle + 1;
      }
    }

    // 5. Fallback to minLength truncation if needed
    if (!truncatedText || truncatedText.length < minLen) {
      truncatedText = this.originalText.slice(0, minLen) + '...';
    }

    this.renderer.setProperty(element, 'textContent', truncatedText);
  }
}
