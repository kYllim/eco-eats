import { SendMessage } from './SendMessage';
import { InMemoryMessageRepository } from '../../infrastructure/repositories/in-memory/InMemoryMessageRepository';

describe('SendMessage (use case)', () => {
  let repo: InMemoryMessageRepository;
  let useCase: SendMessage;

  beforeEach(() => {
    repo = new InMemoryMessageRepository();
    useCase = new SendMessage(repo);
  });

  it('saves a private message and returns it', async () => {
    const message = await useCase.execute({
      id: 'm-1',
      senderId: 'courier-1',
      receiverId: 'moderator-1',
      content: 'salut',
      type: 'PRIVATE',
    });
    expect(message.id).toBe('m-1');
    const history = await repo.findPrivateHistory('courier-1', 'moderator-1');
    expect(history.length).toBe(1);
  });

  it('saves a group message and returns it', async () => {
    await useCase.execute({
      id: 'm-2',
      senderId: 'moderator-1',
      roomId: 'staff-room',
      content: 'meeting now',
      type: 'GROUP',
    });
    const history = await repo.findGroupHistory('staff-room');
    expect(history.length).toBe(1);
  });

  it('refuses a PRIVATE message without receiverId', async () => {
    await expect(
      useCase.execute({
        id: 'm-3',
        senderId: 'a',
        content: 'hi',
        type: 'PRIVATE',
      }),
    ).rejects.toThrow();
  });

  it('refuses a GROUP message without roomId', async () => {
    await expect(
      useCase.execute({
        id: 'm-4',
        senderId: 'a',
        content: 'hi',
        type: 'GROUP',
      }),
    ).rejects.toThrow();
  });
});
