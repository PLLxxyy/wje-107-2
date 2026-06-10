import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category } from '../../../models/category.model';
import { CategoryBadgeComponent } from '../../common/category-badge/category-badge.component';

@Component({
  selector: 'app-category-panel',
  standalone: true,
  imports: [NgFor, CategoryBadgeComponent],
  templateUrl: './category-panel.component.html',
  styleUrl: './category-panel.component.css'
})
export class CategoryPanelComponent {
  @Input({ required: true }) categories: Category[] = [];
  @Input() counts: Record<string, number> = {};
  @Input() selectedCategoryId = '';
  @Output() categoryChange = new EventEmitter<string>();
}
