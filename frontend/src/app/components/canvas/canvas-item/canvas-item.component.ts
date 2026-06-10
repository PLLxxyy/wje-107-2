import { NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective, ResizeResult } from '../../../directives/resizable.directive';
import { DragData } from '../../../models/drag-state.model';
import { LayoutItem, LayoutStyle } from '../../../models/menu-layout.model';
import { MenuItem } from '../../../models/menu-item.model';
import { MenuItemCardComponent } from '../../common/menu-item-card/menu-item-card.component';

@Component({
  selector: 'app-canvas-item',
  standalone: true,
  imports: [NgIf, NgStyle, DraggableDirective, ResizableDirective, MenuItemCardComponent],
  templateUrl: './canvas-item.component.html',
  styleUrl: './canvas-item.component.css'
})
export class CanvasItemComponent {
  @Input({ required: true }) layoutItem!: LayoutItem;
  @Input({ required: true }) menuItem!: MenuItem;
  @Input({ required: true }) layoutStyle!: LayoutStyle;
  @Input() selected = false;
  @Output() selectItem = new EventEmitter<string>();
  @Output() resizeItem = new EventEmitter<ResizeResult>();
  @Output() removeItem = new EventEmitter<string>();

  get dragData(): DragData {
    return {
      source: 'canvas',
      layoutItemId: this.layoutItem.id
    };
  }

  get itemStyles(): Record<string, string> {
    return {
      left: `${this.layoutItem.x}px`,
      top: `${this.layoutItem.y}px`,
      width: `${this.layoutItem.width}px`,
      height: `${this.layoutItem.height}px`,
      fontSize: `${this.layoutItem.fontSize}px`,
      fontFamily: this.layoutStyle.fontFamily,
      color: this.layoutStyle.textColor,
      fontStyle: this.layoutItem.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: this.layoutItem.fontStyle === 'bold' ? '800' : '500'
    };
  }
}
