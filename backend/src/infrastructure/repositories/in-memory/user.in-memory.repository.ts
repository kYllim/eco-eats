import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../application/ports/user.repository';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  public async save(user: User): Promise<void> {
    const index = this.users.findIndex(user => user.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }

  public async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }
}