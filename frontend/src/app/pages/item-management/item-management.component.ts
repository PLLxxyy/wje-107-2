import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SpiceLevel } from '../../models/enums';
import { MenuItemInput } from '../../models/menu-item.model';
import { MenuService } from '../../services/menu.service';
import { UnsavedChangesAware } from '../../guards/unsaved-changes.guard';

@Component({
  selector: 'app-item-management',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './item-management.component.html',
  styleUrl: './item-management.component.css'
})
export class ItemManagementComponent implements OnInit, UnsavedChangesAware {
  readonly categories$ = this.menuService.categories$;
  readonly spiceOptions = [
    { value: SpiceLevel.NONE, label: '不辣' },
    { value: SpiceLevel.MILD, label: '微辣' },
    { value: SpiceLevel.MEDIUM, label: '中辣' },
    { value: SpiceLevel.HOT, label: '特辣' }
  ];
  form: MenuItemInput = this.blankForm();
  editingId = '';
  errorMessage = '';
  private dirty = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly menuService: MenuService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id && id !== 'new') {
      const item = this.menuService.findItem(id);
      if (item) {
        this.editingId = item.id;
        this.form = {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          image: item.image,
          isRecommended: item.isRecommended,
          spiceLevel: item.spiceLevel,
          isVegetarian: item.isVegetarian
        };
      }
    }
  }

  get isEditing(): boolean {
    return this.editingId.length > 0;
  }

  get imageIcon(): string {
    return this.form.image.startsWith('icon:') ? this.form.image.replace('icon:', '') : '🍽️';
  }

  get hasImage(): boolean {
    return this.form.image.startsWith('data:image');
  }

  get pricePreview(): string {
    const value = Number(this.form.price);
    return `¥${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
  }

  markDirty(): void {
    this.dirty = true;
  }

  hasUnsavedChanges(): boolean {
    return this.dirty;
  }

  onFileSelected(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const file = input?.files?.item(0);
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.form = {
          ...this.form,
          image: reader.result
        };
        this.markDirty();
      }
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    this.errorMessage = '';
    const normalized = {
      ...this.form,
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      price: Number(this.form.price)
    };
    if (!normalized.name) {
      this.errorMessage = '请输入菜品名称。';
      return;
    }
    if (!Number.isFinite(normalized.price) || normalized.price < 0) {
      this.errorMessage = '价格需要是非负数字。';
      return;
    }
    if (this.isEditing) {
      this.menuService.updateItem(this.editingId, normalized);
    } else {
      this.menuService.createItem(normalized);
    }
    this.dirty = false;
    void this.router.navigate(['/menu']);
  }

  private blankForm(): MenuItemInput {
    return {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      image: 'icon:🍽️',
      isRecommended: false,
      spiceLevel: SpiceLevel.NONE,
      isVegetarian: false
    };
  }
}
