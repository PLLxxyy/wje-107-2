import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Category, CategoryInput } from '../models/category.model';
import { SpiceLevel } from '../models/enums';
import { MenuItem, MenuItemInput } from '../models/menu-item.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly itemKey = 'menu_items';
  private readonly categoryKey = 'categories';
  private readonly categoriesSubject: BehaviorSubject<Category[]>;
  private readonly itemsSubject: BehaviorSubject<MenuItem[]>;
  readonly categories$: Observable<Category[]>;
  readonly items$: Observable<MenuItem[]>;
  readonly categoryCounts$: Observable<Record<string, number>>;

  constructor(private readonly storage: StorageService) {
    const categories = this.storage.get<Category[]>(this.categoryKey, []);
    const items = this.storage.get<MenuItem[]>(this.itemKey, []);
    const seededCategories = categories.length > 0 ? categories : this.seedCategories();
    const seededItems = items.length > 0 ? items : this.seedItems(seededCategories);
    this.categoriesSubject = new BehaviorSubject<Category[]>(this.sortCategories(seededCategories));
    this.itemsSubject = new BehaviorSubject<MenuItem[]>(seededItems);
    this.categories$ = this.categoriesSubject.asObservable();
    this.items$ = this.itemsSubject.asObservable();
    this.categoryCounts$ = combineLatest([this.categories$, this.items$]).pipe(
      map(([categoryList, itemList]) => {
        const counts: Record<string, number> = {};
        categoryList.forEach((category) => {
          counts[category.id] = itemList.filter((item) => item.categoryId === category.id).length;
        });
        return counts;
      })
    );
    this.persist();
  }

  snapshotItems(): MenuItem[] {
    return structuredClone(this.itemsSubject.value);
  }

  snapshotCategories(): Category[] {
    return structuredClone(this.categoriesSubject.value);
  }

  findItem(id: string): MenuItem | undefined {
    return this.itemsSubject.value.find((item) => item.id === id);
  }

  findCategory(id: string): Category | undefined {
    return this.categoriesSubject.value.find((category) => category.id === id);
  }

  createItem(input: MenuItemInput): MenuItem {
    const now = Date.now();
    const item: MenuItem = {
      ...input,
      id: this.createId(),
      description: input.description.slice(0, 200),
      price: this.normalizePrice(input.price),
      createdAt: now,
      updatedAt: now
    };
    this.itemsSubject.next([...this.itemsSubject.value, item]);
    this.persistItems();
    return item;
  }

  updateItem(id: string, input: MenuItemInput): void {
    const updated = this.itemsSubject.value.map((item) => item.id === id
      ? {
          ...item,
          ...input,
          description: input.description.slice(0, 200),
          price: this.normalizePrice(input.price),
          updatedAt: Date.now()
        }
      : item
    );
    this.itemsSubject.next(updated);
    this.persistItems();
  }

  deleteItem(id: string): void {
    this.itemsSubject.next(this.itemsSubject.value.filter((item) => item.id !== id));
    this.persistItems();
  }

  createCategory(input: CategoryInput): Category {
    const category: Category = {
      ...input,
      id: this.createId()
    };
    this.categoriesSubject.next(this.sortCategories([...this.categoriesSubject.value, category]));
    this.persistCategories();
    return category;
  }

  updateCategory(id: string, input: CategoryInput): void {
    const updated = this.categoriesSubject.value.map((category) => category.id === id
      ? { ...category, ...input }
      : category
    );
    this.categoriesSubject.next(this.sortCategories(updated));
    this.persistCategories();
  }

  deleteCategory(id: string): void {
    this.categoriesSubject.next(this.categoriesSubject.value.filter((category) => category.id !== id));
    const clearedItems = this.itemsSubject.value.map((item) => item.categoryId === id
      ? { ...item, categoryId: '', updatedAt: Date.now() }
      : item
    );
    this.itemsSubject.next(clearedItems);
    this.persist();
  }

  reorderCategory(draggedId: string, targetId: string): void {
    if (draggedId === targetId) {
      return;
    }
    const categories = [...this.categoriesSubject.value];
    const from = categories.findIndex((category) => category.id === draggedId);
    const to = categories.findIndex((category) => category.id === targetId);
    if (from < 0 || to < 0) {
      return;
    }
    const [dragged] = categories.splice(from, 1);
    categories.splice(to, 0, dragged);
    const reordered = categories.map((category, index) => ({
      ...category,
      sortOrder: index + 1
    }));
    this.categoriesSubject.next(reordered);
    this.persistCategories();
  }

  private persist(): void {
    this.persistCategories();
    this.persistItems();
  }

  private persistCategories(): void {
    this.storage.set(this.categoryKey, this.categoriesSubject.value);
  }

  private persistItems(): void {
    this.storage.set(this.itemKey, this.itemsSubject.value);
  }

  private sortCategories(categories: Category[]): Category[] {
    return [...categories].sort((left, right) => left.sortOrder - right.sortOrder);
  }

  private normalizePrice(value: number): number {
    return Math.max(0, Math.round(value * 100) / 100);
  }

  private seedCategories(): Category[] {
    return [
      { id: 'cat-appetizer', name: '开胃菜', sortOrder: 1, color: '#FF6B35', icon: '🥗' },
      { id: 'cat-main', name: '主菜', sortOrder: 2, color: '#C62828', icon: '🍽️' },
      { id: 'cat-dessert', name: '甜品', sortOrder: 3, color: '#AD1457', icon: '🍰' },
      { id: 'cat-beverage', name: '饮品', sortOrder: 4, color: '#1565C0', icon: '🍹' }
    ];
  }

  private seedItems(categories: Category[]): MenuItem[] {
    const categoryId = (name: string) => categories.find((category) => category.name === name)?.id ?? '';
    const now = Date.now();
    const rows: Array<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'image' | 'categoryId'> & { category: string; icon: string }> = [
      { name: '凯撒沙拉', description: '罗马生菜、帕玛森芝士与烤面包粒，口感清爽。', price: 38, category: '开胃菜', icon: '🥗', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: false },
      { name: '蒜香面包', description: '外脆内软的手工法棍，搭配浓郁蒜香黄油。', price: 22, category: '开胃菜', icon: '🥖', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: true },
      { name: '四川口水鸡', description: '红油椒香与鲜嫩鸡肉融合，适合作为招牌前菜。', price: 45, category: '开胃菜', icon: '🍗', isRecommended: true, spiceLevel: SpiceLevel.MEDIUM, isVegetarian: false },
      { name: '香煎三文鱼', description: '低温慢煎三文鱼配时蔬与柠檬黄油汁。', price: 128, category: '主菜', icon: '🐟', isRecommended: true, spiceLevel: SpiceLevel.NONE, isVegetarian: false },
      { name: '黑椒牛排', description: '精选牛排搭配黑椒汁，外焦内嫩。', price: 168, category: '主菜', icon: '🥩', isRecommended: true, spiceLevel: SpiceLevel.MILD, isVegetarian: false },
      { name: '宫保鸡丁', description: '鸡丁、花生与干辣椒快炒，咸甜微辣。', price: 58, category: '主菜', icon: '🍛', isRecommended: false, spiceLevel: SpiceLevel.MEDIUM, isVegetarian: false },
      { name: '意式海鲜意面', description: '鲜虾、贝类与番茄白酒汁包裹劲道意面。', price: 88, category: '主菜', icon: '🍝', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: false },
      { name: '麻婆豆腐', description: '豆腐软嫩，花椒麻香明显，热辣下饭。', price: 38, category: '主菜', icon: '🌶️', isRecommended: false, spiceLevel: SpiceLevel.HOT, isVegetarian: true },
      { name: '素食咖喱', description: '椰香咖喱搭配根茎蔬菜，温和饱满。', price: 48, category: '主菜', icon: '🍛', isRecommended: false, spiceLevel: SpiceLevel.MILD, isVegetarian: true },
      { name: '提拉米苏', description: '马斯卡彭奶油与咖啡酒香层层叠合。', price: 42, category: '甜品', icon: '🍮', isRecommended: true, spiceLevel: SpiceLevel.NONE, isVegetarian: false },
      { name: '芒果布丁', description: '果香浓郁，口感顺滑，适合餐后分享。', price: 32, category: '甜品', icon: '🥭', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: false },
      { name: '抹茶冰淇淋', description: '抹茶茶香清苦，奶香收尾柔和。', price: 28, category: '甜品', icon: '🍨', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: true },
      { name: '经典莫吉托', description: '青柠、薄荷与气泡感组合，清爽解腻。', price: 35, category: '饮品', icon: '🍹', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: true },
      { name: '鲜榨橙汁', description: '每日鲜榨，酸甜平衡。', price: 25, category: '饮品', icon: '🍊', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: true },
      { name: '拿铁咖啡', description: '浓缩咖啡与绵密奶泡，温润香醇。', price: 32, category: '饮品', icon: '☕', isRecommended: false, spiceLevel: SpiceLevel.NONE, isVegetarian: true }
    ];

    return rows.map((row, index) => ({
      id: `item-${index + 1}`,
      name: row.name,
      description: row.description,
      price: row.price,
      categoryId: categoryId(row.category),
      image: `icon:${row.icon}`,
      isRecommended: row.isRecommended,
      spiceLevel: row.spiceLevel,
      isVegetarian: row.isVegetarian,
      createdAt: now + index,
      updatedAt: now + index
    }));
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
