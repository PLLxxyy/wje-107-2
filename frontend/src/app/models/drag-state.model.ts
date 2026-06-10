export type DragPhase = 'idle' | 'dragging' | 'dropping';
export type DragSource = 'library' | 'canvas' | 'category';

export interface DragData {
  source: DragSource;
  menuItemId?: string;
  layoutItemId?: string;
  categoryId?: string;
}

export interface PointerPosition {
  x: number;
  y: number;
}

export interface DragState {
  phase: DragPhase;
  data: DragData | null;
  start: PointerPosition | null;
  current: PointerPosition | null;
  delta: PointerPosition;
}

export interface DropEvent {
  data: DragData;
  start: PointerPosition;
  current: PointerPosition;
  delta: PointerPosition;
}
