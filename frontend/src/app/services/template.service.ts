import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SpiceLevel, TemplateType } from '../models/enums';
import { LayoutItem, LayoutStyle, MenuLayout, TemplateDefinition } from '../models/menu-layout.model';
import { MenuItem } from '../models/menu-item.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly layoutKey = 'current_layout';
  private readonly layoutSubject: BehaviorSubject<MenuLayout>;
  readonly currentLayout$: Observable<MenuLayout>;
  readonly templates: TemplateDefinition[];

  constructor(private readonly storage: StorageService) {
    this.templates = this.buildTemplates();
    const stored = this.storage.get<MenuLayout | null>(this.layoutKey, null);
    this.layoutSubject = new BehaviorSubject<MenuLayout>(stored ?? this.createEmptyLayout(TemplateType.CLASSIC));
    this.currentLayout$ = this.layoutSubject.asObservable();
    this.persist();
  }

  snapshot(): MenuLayout {
    return structuredClone(this.layoutSubject.value);
  }

  saveLayout(layout: MenuLayout): void {
    this.layoutSubject.next({
      ...structuredClone(layout),
      updatedAt: Date.now()
    });
    this.persist();
  }

  applyTemplate(type: TemplateType, items: MenuItem[]): MenuLayout {
    const template = this.templates.find((entry) => entry.type === type) ?? this.templates[0];
    const layout: MenuLayout = {
      id: this.createId(),
      name: template.name,
      templateType: type,
      items: this.generateItems(type, items),
      style: {
        ...structuredClone(template.style),
        id: this.createId()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.layoutSubject.next(layout);
    this.persist();
    return structuredClone(layout);
  }

  updateStyle(style: LayoutStyle): void {
    const current = this.layoutSubject.value;
    this.saveLayout({
      ...current,
      style: { ...style }
    });
  }

  addLayoutItem(item: LayoutItem): void {
    const current = this.layoutSubject.value;
    this.saveLayout({
      ...current,
      items: [...current.items, item]
    });
  }

  updateLayoutItem(id: string, patch: Partial<LayoutItem>): void {
    const current = this.layoutSubject.value;
    this.saveLayout({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item)
    });
  }

  deleteLayoutItem(id: string): void {
    const current = this.layoutSubject.value;
    this.saveLayout({
      ...current,
      items: current.items.filter((item) => item.id !== id)
    });
  }

  createLayoutItem(menuItemId: string, x: number, y: number): LayoutItem {
    return {
      id: this.createId(),
      menuItemId,
      x: Math.round(x),
      y: Math.round(y),
      width: 220,
      height: 112,
      fontSize: 16,
      fontStyle: 'normal'
    };
  }

  private buildTemplates(): TemplateDefinition[] {
    const classicStyle = this.style('#FFF8F0', '#3E2723', '#C6953B', 'Georgia, Songti SC, serif', '晚餐菜单', '精选当季食材');
    const modernStyle = this.style('#FFFFFF', '#212121', '#FF6B6B', 'Avenir Next, PingFang SC, sans-serif', '今日菜单', '现代双栏排版');
    const cardStyle = this.style('#1A1A2E', '#EAEAEA', '#7B2FF7', 'Avenir Next, PingFang SC, sans-serif', '招牌菜单', '卡片式推荐');
    return [
      {
        type: TemplateType.CLASSIC,
        name: '经典单栏',
        description: '分类标题分隔，名称与价格使用引导线连接，适合正式餐厅。',
        style: classicStyle,
        previewItems: this.previewItems(TemplateType.CLASSIC)
      },
      {
        type: TemplateType.MODERN,
        name: '双栏现代',
        description: '左右双栏组织菜品，强调价格与推荐标签，适合咖啡馆和轻餐。',
        style: modernStyle,
        previewItems: this.previewItems(TemplateType.MODERN)
      },
      {
        type: TemplateType.CARD,
        name: '卡片式',
        description: '网格卡片承载图片与描述，适合新品推广和社媒视觉。',
        style: cardStyle,
        previewItems: this.previewItems(TemplateType.CARD)
      }
    ];
  }

  private generateItems(type: TemplateType, menuItems: MenuItem[]): LayoutItem[] {
    const selected = menuItems.slice(0, 12);
    if (type === TemplateType.CLASSIC) {
      return selected.map((item, index) => ({
        id: this.createId(),
        menuItemId: item.id,
        x: 92,
        y: 150 + index * 64,
        width: 620,
        height: 50,
        fontSize: 17,
        fontStyle: item.isRecommended ? 'bold' : 'normal'
      }));
    }

    if (type === TemplateType.MODERN) {
      return selected.map((item, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        return {
          id: this.createId(),
          menuItemId: item.id,
          x: 72 + column * 350,
          y: 150 + row * 96,
          width: 302,
          height: 78,
          fontSize: 15,
          fontStyle: item.isRecommended ? 'bold' : 'normal'
        };
      });
    }

    return selected.slice(0, 9).map((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      return {
        id: this.createId(),
        menuItemId: item.id,
        x: 58 + column * 228,
        y: 160 + row * 185,
        width: 198,
        height: 154,
        fontSize: 14,
        fontStyle: item.isRecommended ? 'bold' : 'normal'
      };
    });
  }

  private createEmptyLayout(type: TemplateType): MenuLayout {
    const template = this.templates.find((entry) => entry.type === type) ?? this.templates[0];
    return {
      id: this.createId(),
      name: template.name,
      templateType: type,
      items: [],
      style: {
        ...structuredClone(template.style),
        id: this.createId()
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private previewItems(type: TemplateType): LayoutItem[] {
    return this.generateItems(type, [
      this.previewMenuItem('preview-1'),
      this.previewMenuItem('preview-2'),
      this.previewMenuItem('preview-3'),
      this.previewMenuItem('preview-4'),
      this.previewMenuItem('preview-5'),
      this.previewMenuItem('preview-6')
    ]);
  }

  private previewMenuItem(id: string): MenuItem {
    return {
      id,
      name: id,
      description: '',
      price: 0,
      categoryId: '',
      image: 'icon:🍽️',
      isRecommended: false,
      spiceLevel: SpiceLevel.NONE,
      isVegetarian: false,
      specifications: [],
      createdAt: 0,
      updatedAt: 0
    };
  }

  private style(bgColor: string, textColor: string, accentColor: string, fontFamily: string, headerText: string, subtitleText: string): LayoutStyle {
    return {
      id: this.createId(),
      bgColor,
      textColor,
      accentColor,
      fontFamily,
      headerText,
      subtitleText
    };
  }

  private persist(): void {
    this.storage.set(this.layoutKey, this.layoutSubject.value);
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
