import { PrismaService } from '../../prisma.service';
import { User, UserRole } from '../../../domain/entities/User';
import { UserRepository } from '../../../application/ports/user.repository';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) {
      throw new Error('Utilisateur introuvable.');
    }

    const role = UserRole.CLIENT;
    return new User(row.id, row.email, role, row.name ?? '', undefined);
  }

  async findByEmail(email: string): Promise<User> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) {
      throw new Error('Utilisateur introuvable.');
    }

    const role = UserRole.CLIENT;
    return new User(row.id, row.email, role, row.name ?? '', undefined);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email, name: user.name },
      create: { id: user.id, email: user.email, name: user.name },
    });
  }
}
