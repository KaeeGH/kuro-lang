import { ILoc } from '../interfaces'
import { Sliceable } from '../types'

/*
 * Loc class.
 */
export class Loc implements ILoc {
  /**
   * Loc constructor.
   *
   * @param start Start location.
   * @param end End location.
   */
  constructor(public start: number, public end: number) {}

  slice<T>(sliceable: Sliceable<T>): T {
    return sliceable.slice(this.start, this.end)
  }

  /**
   * Returns Loc object by given start and given length.
   *
   * @param start Start location.
   * @param length Location length from start.
   */
  static fromStart(start: number, length = 1): Loc {
    return new Loc(start, start + length)
  }
}
