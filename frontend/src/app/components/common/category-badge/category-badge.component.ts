import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Category } from '../../../models/category.model';

type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [NgIf],
  templateUrl: './category-badge.component.html',
  styleUrl: './category-badge.component.css'
})
export class CategoryBadgeComponent {
  @Input({ required: true }) category!: Category;
  @Input() size: BadgeSize = 'md';
  @Input() showCount = false;
  @Input() count = 0;
}
