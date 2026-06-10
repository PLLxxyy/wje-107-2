import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LayoutItem, MenuLayout } from '../../../models/menu-layout.model';
import { MenuItem } from '../../../models/menu-item.model';
import { MenuItemCardComponent } from '../../common/menu-item-card/menu-item-card.component';

@Component({
  selector: 'app-print-preview',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, MenuItemCardComponent],
  templateUrl: './print-preview.component.html',
  styleUrl: './print-preview.component.css'
})
export class PrintPreviewComponent {
  @Input({ required: true }) layout!: MenuLayout;
  @Input({ required: true }) menuItems: MenuItem[] = [];

  get paperStyle(): Record<string, string> {
    return {
      background: this.layout.style.bgColor,
      color: this.layout.style.textColor,
      fontFamily: this.layout.style.fontFamily
    };
  }

  itemStyle(item: LayoutItem): Record<string, string> {
    return {
      left: `${item.x}px`,
      top: `${item.y}px`,
      width: `${item.width}px`,
      height: `${item.height}px`,
      fontSize: `${item.fontSize}px`
    };
  }

  menuItemFor(item: LayoutItem): MenuItem | null {
    return this.menuItems.find((menuItem) => menuItem.id === item.menuItemId) ?? null;
  }

  trackByLayoutItem(_index: number, item: LayoutItem): string {
    return item.id;
  }
}
