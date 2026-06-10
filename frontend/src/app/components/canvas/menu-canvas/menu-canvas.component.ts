import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DropEvent } from '../../../models/drag-state.model';
import { LayoutItem, MenuLayout } from '../../../models/menu-layout.model';
import { MenuItem } from '../../../models/menu-item.model';
import { DragService } from '../../../services/drag.service';
import { TemplateService } from '../../../services/template.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { CanvasItemComponent } from '../canvas-item/canvas-item.component';
import { GridOverlayComponent } from '../grid-overlay/grid-overlay.component';

@Component({
  selector: 'app-menu-canvas',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, CanvasItemComponent, GridOverlayComponent],
  templateUrl: './menu-canvas.component.html',
  styleUrl: './menu-canvas.component.css'
})
export class MenuCanvasComponent {
  @Input({ required: true }) layout!: MenuLayout;
  @Input({ required: true }) menuItems: MenuItem[] = [];
  @Input() selectedItemId = '';
  @Input() zoom = 1;
  @Input() panX = 0;
  @Input() panY = 0;
  @Input() showGrid = true;
  @Output() selectionChange = new EventEmitter<string>();
  @ViewChild('paper', { static: true }) paperRef!: ElementRef<HTMLElement>;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly dragService: DragService,
    private readonly templateService: TemplateService,
    private readonly undoRedo: UndoRedoService
  ) {
    this.dragService.dropEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleDrop(event));
  }

  get paperStyle(): Record<string, string> {
    return {
      background: this.layout.style.bgColor,
      color: this.layout.style.textColor,
      fontFamily: this.layout.style.fontFamily,
      transform: `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`
    };
  }

  menuItemFor(item: LayoutItem): MenuItem | null {
    return this.menuItems.find((menuItem) => menuItem.id === item.menuItemId) ?? null;
  }

  selectCanvas(): void {
    this.selectionChange.emit('');
  }

  selectItem(id: string): void {
    this.selectionChange.emit(id);
  }

  resizeItem(id: string, width: number, height: number): void {
    this.templateService.updateLayoutItem(id, {
      width: Math.round(width / this.zoom),
      height: Math.round(height / this.zoom)
    });
    this.undoRedo.record(this.templateService.snapshot());
  }

  removeItem(id: string): void {
    this.templateService.deleteLayoutItem(id);
    this.selectionChange.emit('');
    this.undoRedo.record(this.templateService.snapshot());
  }

  trackByLayoutItem(_index: number, item: LayoutItem): string {
    return item.id;
  }

  private handleDrop(event: DropEvent): void {
    const rect = this.paperRef.nativeElement.getBoundingClientRect();
    const inside = event.current.x >= rect.left && event.current.x <= rect.right && event.current.y >= rect.top && event.current.y <= rect.bottom;
    if (!inside) {
      return;
    }

    if (event.data.source === 'library' && event.data.menuItemId) {
      const x = (event.current.x - rect.left) / this.zoom;
      const y = (event.current.y - rect.top) / this.zoom;
      const item = this.templateService.createLayoutItem(event.data.menuItemId, x, y);
      this.templateService.addLayoutItem(item);
      this.selectionChange.emit(item.id);
      this.undoRedo.record(this.templateService.snapshot());
    }

    if (event.data.source === 'canvas' && event.data.layoutItemId) {
      const currentItem = this.layout.items.find((item) => item.id === event.data.layoutItemId);
      if (!currentItem) {
        return;
      }
      this.templateService.updateLayoutItem(currentItem.id, {
        x: Math.round(currentItem.x + event.delta.x / this.zoom),
        y: Math.round(currentItem.y + event.delta.y / this.zoom)
      });
      this.selectionChange.emit(currentItem.id);
      this.undoRedo.record(this.templateService.snapshot());
    }
  }
}
