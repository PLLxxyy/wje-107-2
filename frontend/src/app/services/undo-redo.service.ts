import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuLayout } from '../models/menu-layout.model';

export interface HistoryAvailability {
  canUndo: boolean;
  canRedo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {
  private readonly availabilitySubject = new BehaviorSubject<HistoryAvailability>({ canUndo: false, canRedo: false });
  private undoStack: MenuLayout[] = [];
  private redoStack: MenuLayout[] = [];
  readonly availability$: Observable<HistoryAvailability> = this.availabilitySubject.asObservable();

  initialize(snapshot: MenuLayout): void {
    this.undoStack = [structuredClone(snapshot)];
    this.redoStack = [];
    this.emitAvailability();
  }

  record(snapshot: MenuLayout): void {
    const cloned = structuredClone(snapshot);
    const current = this.undoStack[this.undoStack.length - 1];
    if (current && JSON.stringify(current) === JSON.stringify(cloned)) {
      return;
    }
    this.undoStack = [...this.undoStack, cloned].slice(-60);
    this.redoStack = [];
    this.emitAvailability();
  }

  undo(current: MenuLayout): MenuLayout | null {
    if (this.undoStack.length <= 1) {
      return null;
    }
    this.redoStack = [...this.redoStack, structuredClone(current)];
    this.undoStack = this.undoStack.slice(0, -1);
    this.emitAvailability();
    return structuredClone(this.undoStack[this.undoStack.length - 1]);
  }

  redo(current: MenuLayout): MenuLayout | null {
    const next = this.redoStack[this.redoStack.length - 1];
    if (!next) {
      return null;
    }
    this.redoStack = this.redoStack.slice(0, -1);
    this.undoStack = [...this.undoStack, structuredClone(current), structuredClone(next)].slice(-60);
    this.emitAvailability();
    return structuredClone(next);
  }

  private emitAvailability(): void {
    this.availabilitySubject.next({
      canUndo: this.undoStack.length > 1,
      canRedo: this.redoStack.length > 0
    });
  }
}
