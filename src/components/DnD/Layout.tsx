export type Position = [number, number, number]
export type PositionObserver = ((position: Position) => void) | null

export class Layout {
  public position: Position = [0, 0, -1]
  private observers: PositionObserver[] = []

  public observe(o: PositionObserver): () => void {
    this.observers.push(o)
    this.emitChange()

    return (): void => {
      this.observers = this.observers.filter((t) => t !== o)
    }
  }

  public moveKnight(toX: number, toY: number, index: number): void {
    this.position = [toX, toY, index]
    this.emitChange()
  }

  private emitChange() {
    const pos = this.position
    this.observers.forEach((o) => o && o(pos))
  }
}
