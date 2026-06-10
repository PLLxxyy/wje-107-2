import { NgFor, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TemplateType } from '../../../models/enums';
import { LayoutItem, LayoutStyle } from '../../../models/menu-layout.model';

@Component({
  selector: 'app-template-preview',
  standalone: true,
  imports: [NgFor, NgStyle],
  templateUrl: './template-preview.component.html',
  styleUrl: './template-preview.component.css'
})
export class TemplatePreviewComponent {
  readonly TemplateType = TemplateType;
  @Input({ required: true }) templateType: TemplateType = TemplateType.CLASSIC;
  @Input({ required: true }) layoutStyle!: LayoutStyle;
  @Input() items: LayoutItem[] = [];

  readonly baseWidth = 794;
  readonly baseHeight = 1123;

  itemStyle(item: LayoutItem): Record<string, string> {
    return {
      left: `${(item.x / this.baseWidth) * 100}%`,
      top: `${(item.y / this.baseHeight) * 100}%`,
      width: `${(item.width / this.baseWidth) * 100}%`,
      height: `${(item.height / this.baseHeight) * 100}%`
    };
  }
}
