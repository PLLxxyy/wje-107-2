import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, HostListener, Inject, OnDestroy, Output, Renderer2 } from '@angular/core';

export interface ResizeResult {
  width: number;
  height: number;
}

type RemoveListener = () => void;

@Directive({
  selector: '[appResizable]',
  standalone: true
})
export class ResizableDirective implements OnDestroy {
  @Output() resizeEnd = new EventEmitter<ResizeResult>();
  private removeMoveListener: RemoveListener | null = null;
  private removeUpListener: RemoveListener | null = null;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.isResizeHandle(event.target)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.removeMoveListener = this.renderer.listen(this.document, 'pointermove', (moveEvent: PointerEvent) => this.onPointerMove(moveEvent));
    this.removeUpListener = this.renderer.listen(this.document, 'pointerup', () => this.onPointerUp());
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private onPointerMove(event: PointerEvent): void {
    const width = Math.max(130, Math.round(this.startWidth + event.clientX - this.startX));
    const height = Math.max(72, Math.round(this.startHeight + event.clientY - this.startY));
    this.renderer.setStyle(this.elementRef.nativeElement, 'width', `${width}px`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'height', `${height}px`);
  }

  private onPointerUp(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.resizeEnd.emit({
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });
    this.cleanup();
  }

  private isResizeHandle(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest('[data-resize-handle="true"]'));
  }

  private cleanup(): void {
    this.removeMoveListener?.();
    this.removeUpListener?.();
    this.removeMoveListener = null;
    this.removeUpListener = null;
  }
}
