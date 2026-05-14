export enum UserRole {
  CLIENT = 'CLIENT',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  COURIER = 'COURIER',
  ADMIN = 'ADMIN'
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRole,
    public name: string,
    public address?: string
  ) {}

  public isOwner(): boolean {
    return this.role === UserRole.RESTAURANT_OWNER;
  }
}