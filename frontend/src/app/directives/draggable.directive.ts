import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostBinding, HostListener, Inject, Input, OnDestroy, Renderer2 } from '@angular/core';
import { DragData, PointerPosition } from '../models/drag-state.model';
import { DragService } from '../services/drag.service';

type RemoveListener = () => void;

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective implements OnDestroy {
  @Input('appDraggable') dragData: DragData | null = null;
  @HostBinding('class.drag-active') dragging = false;
  private removeMoveListener: RemoveListener | null = null;
  private removeUpListener: RemoveListener | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly dragService: DragService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.dragData || event.button !== 0 || this.shouldIgnore(event.target)) {
      return;
    }
    event.preventDefault();
    const start = this.positionFromEvent(event);
    this.dragging = true;
    this.renderer.setStyle(this.elementRef.nativeElement, 'touch-action', 'none');
    this.dragService.start(this.dragData, start);
    this.removeMoveListener = this.renderer.listen(this.document, 'pointermove', (moveEvent: PointerEvent) => this.onPointerMove(moveEvent));
    this.removeUpListener = this.renderer.listen(this.document, 'pointerup', (upEvent: PointerEvent) => this.onPointerUp(upEvent));
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragService.move(this.positionFromEvent(event));
  }

  private onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      this.cleanup();
      return;
    }
    this.dragging = false;
    this.dragService.drop(this.positionFromEvent(event));
    this.cleanup();
  }

  private shouldIgnore(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return Boolean(target.closest('button, input, select, textarea, a, [data-resize-handle="true"]'));
  }

  private positionFromEvent(event: PointerEvent): PointerPosition {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }

  private cleanup(): void {
    this.removeMoveListener?.();
    this.removeUpListener?.();
    this.removeMoveListener = null;
    this.removeUpListener = null;
    this.renderer.removeStyle(this.elementRef.nativeElement, 'touch-action');
  }
}
