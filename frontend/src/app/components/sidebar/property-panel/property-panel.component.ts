import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutItem, LayoutStyle, MenuLayout } from '../../../models/menu-layout.model';
import { MenuItem } from '../../../models/menu-item.model';

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './property-panel.component.html',
  styleUrl: './property-panel.component.css'
})
export class PropertyPanelComponent {
  @Input({ required: true }) layout!: MenuLayout;
  @Input() selectedItem: LayoutItem | null = null;
  @Input() selectedMenuItem: MenuItem | null = null;
  @Output() itemChange = new EventEmitter<Partial<LayoutItem>>();
  @Output() styleChange = new EventEmitter<LayoutStyle>();
  @Output() removeItem = new EventEmitter<string>();
  readonly fontStyles = [
    { value: 'normal', label: '常规' },
    { value: 'bold', label: '加粗' },
    { value: 'italic', label: '斜体' }
  ];
  readonly fontFamilies = [
    { value: 'Georgia, Songti SC, serif', label: '经典衬线' },
    { value: 'Avenir Next, PingFang SC, sans-serif', label: '现代无衬线' },
    { value: 'Kaiti SC, STKaiti, serif', label: '雅致楷体' }
  ];

  updateNumber(key: 'x' | 'y' | 'width' | 'height' | 'fontSize', value: string | number): void {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      this.itemChange.emit({ [key]: Math.round(numeric) });
    }
  }

  updateFontStyle(value: string): void {
    this.itemChange.emit({ fontStyle: value });
  }

  updateStyle(key: keyof LayoutStyle, value: string): void {
    this.styleChange.emit({
      ...this.layout.style,
      [key]: value
    });
  }
}
