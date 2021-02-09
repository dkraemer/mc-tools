export class CommonBase {
  public stringify(): string {
    return JSON.stringify(this, null, 2);
  }
}
