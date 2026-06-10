import { TemplateType } from './enums';

export interface LayoutStyle {
  id: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  headerText: string;
  subtitleText: string;
}

export interface LayoutItem {
  id: string;
  menuItemId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontStyle: string;
}

export interface MenuLayout {
  id: string;
  name: string;
  templateType: TemplateType;
  items: LayoutItem[];
  style: LayoutStyle;
  createdAt: number;
  updatedAt: number;
}

export interface TemplateDefinition {
  type: TemplateType;
  name: string;
  description: string;
  style: LayoutStyle;
  previewItems: LayoutItem[];
}

export interface CanvasMetrics {
  width: number;
  height: number;
  zoom: number;
}
