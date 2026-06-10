import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DragData, DragState, DropEvent, PointerPosition } from '../models/drag-state.model';

const IDLE_STATE: DragState = {
  phase: 'idle',
  data: null,
  start: null,
  current: null,
  delta: { x: 0, y: 0 }
};

@Injectable({
  providedIn: 'root'
})
export class DragService {
  private readonly dragStateSubject = new BehaviorSubject<DragState>(IDLE_STATE);
  private readonly dropSubject = new Subject<DropEvent>();
  readonly dragState$: Observable<DragState> = this.dragStateSubject.asObservable();
  readonly dropEvents$: Observable<DropEvent> = this.dropSubject.asObservable();

  start(data: DragData, start: PointerPosition): void {
    this.dragStateSubject.next({
      phase: 'dragging',
      data,
      start,
      current: start,
      delta: { x: 0, y: 0 }
    });
  }

  move(current: PointerPosition): void {
    const state = this.dragStateSubject.value;
    if (state.phase !== 'dragging' || !state.start || !state.data) {
      return;
    }
    this.dragStateSubject.next({
      ...state,
      current,
      delta: {
        x: current.x - state.start.x,
        y: current.y - state.start.y
      }
    });
  }

  drop(current: PointerPosition): void {
    const state = this.dragStateSubject.value;
    if (state.phase !== 'dragging' || !state.start || !state.data) {
      this.cancel();
      return;
    }
    const event: DropEvent = {
      data: state.data,
      start: state.start,
      current,
      delta: {
        x: current.x - state.start.x,
        y: current.y - state.start.y
      }
    };
    this.dragStateSubject.next({
      ...state,
      phase: 'dropping',
      current,
      delta: event.delta
    });
    this.dropSubject.next(event);
    this.cancel();
  }

  cancel(): void {
    this.dragStateSubject.next(IDLE_STATE);
  }
}
