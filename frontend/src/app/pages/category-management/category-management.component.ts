import { AsyncPipe, DOCUMENT, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, Inject, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { CategoryBadgeComponent } from '../../components/common/category-badge/category-badge.component';
import { ConfirmDialogComponent } from '../../components/common/confirm-dialog/confirm-dialog.component';
import { DraggableDirective } from '../../directives/draggable.directive';
import { Category, CategoryInput } from '../../models/category.model';
import { DragData, DropEvent } from '../../models/drag-state.model';
import { DragService } from '../../services/drag.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, FormsModule, CategoryBadgeComponent, ConfirmDialogComponent, DraggableDirective],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent {
  readonly viewModel$ = combineLatest([
    this.menuService.categories$,
    this.menuService.categoryCounts$
  ]).pipe(
    map(([categories, counts]) => ({ categories, counts }))
  );
  form: CategoryInput = this.blankForm(1);
  editingId = '';
  deleteCandidate: Category | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly menuService: MenuService,
    private readonly dragService: DragService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.dragService.dropEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleDrop(event));
  }

  dragDataFor(category: Category): DragData {
    return {
      source: 'category',
      categoryId: category.id
    };
  }

  startEdit(category: Category): void {
    this.editingId = category.id;
    this.form = {
      name: category.name,
      sortOrder: category.sortOrder,
      color: category.color,
      icon: category.icon
    };
  }

  submit(categories: Category[]): void {
    const input: CategoryInput = {
      ...this.form,
      name: this.form.name.trim(),
      sortOrder: Number(this.form.sortOrder)
    };
    if (!input.name) {
      return;
    }
    if (this.editingId) {
      this.menuService.updateCategory(this.editingId, input);
    } else {
      this.menuService.createCategory({
        ...input,
        sortOrder: categories.length + 1
      });
    }
    this.cancelEdit(categories.length + 1);
  }

  cancelEdit(nextOrder: number): void {
    this.editingId = '';
    this.form = this.blankForm(nextOrder);
  }

  confirmDelete(): void {
    if (this.deleteCandidate) {
      this.menuService.deleteCategory(this.deleteCandidate.id);
      this.deleteCandidate = null;
    }
  }

  trackByCategory(_index: number, category: Category): string {
    return category.id;
  }

  private blankForm(sortOrder: number): CategoryInput {
    return {
      name: '',
      sortOrder,
      color: '#B64D2D',
      icon: '🍽️'
    };
  }

  private handleDrop(event: DropEvent): void {
    if (event.data.source !== 'category' || !event.data.categoryId) {
      return;
    }
    const targetId = this.targetCategoryId(event);
    if (targetId) {
      this.menuService.reorderCategory(event.data.categoryId, targetId);
    }
  }

  private targetCategoryId(event: DropEvent): string {
    const elements = this.document.elementsFromPoint(event.current.x, event.current.y);
    for (const element of elements) {
      const target = element.closest('[data-category-id]');
      if (target instanceof HTMLElement) {
        return target.dataset['categoryId'] ?? '';
      }
    }
    return '';
  }
}
