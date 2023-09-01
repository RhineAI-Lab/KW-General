
declare class LoadingPage {
  static setProgress(progress: number, msg: string): void

  static show(): void

  static hide(): void

  static getProgress(progress: number, msg: string): number
}
