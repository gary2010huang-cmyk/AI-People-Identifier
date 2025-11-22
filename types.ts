export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Person {
  name: string;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] - 1000 scale
}

export interface IdentificationResult {
  people: Person[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}