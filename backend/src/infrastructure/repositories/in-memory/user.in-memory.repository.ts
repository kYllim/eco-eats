import { User } from '../../../domain/entities/User';
import { UserRepository } from '../../../application/ports/user.repository';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  public save(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    return Promise.resolve();
  }

  public findById(id: string): Promise<User> {
    const user = this.users.find((candidate) => candidate.id === id);

    if (!user) {
      return Promise.reject(new Error('Utilisateur introuvable.'));
    }

    return Promise.resolve(user);
  }

  public findByEmail(email: string): Promise<User> {
    const user = this.users.find((candidate) => candidate.email === email);

    if (!user) {
      return Promise.reject(new Error('Utilisateur introuvable.'));
    }

    return Promise.resolve(user);
  }
}
