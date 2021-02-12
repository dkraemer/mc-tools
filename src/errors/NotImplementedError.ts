export class NotImplementedError implements Error {
  name: string;
  message: string;
  stack?: string | undefined;

  public constructor(message?: string) {
    this.name = 'NOT_IMPLEMENTED';
    this.message = `[${this.name}]: ${message}`;
  }
}
