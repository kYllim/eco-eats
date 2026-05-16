import { Message } from './Message';

describe('Message', () => {
  it('creates a private message with receiverId only', () => {
    const m = Message.createPrivate({
      id: '1',
      senderId: 'a',
      receiverId: 'b',
      content: 'salut',
    });
    expect(m.type).toBe('PRIVATE');
    expect(m.receiverId).toBe('b');
    expect(m.roomId).toBeNull();
  });

  it('creates a group message with roomId only', () => {
    const m = Message.createGroupMessage({
      id: '2',
      senderId: 'a',
      roomId: 'staff-room',
      content: 'hello',
    });
    expect(m.type).toBe('GROUP');
    expect(m.roomId).toBe('staff-room');
    expect(m.receiverId).toBeNull();
  });

  it('rejects an empty content', () => {
    expect(() =>
      Message.createPrivate({
        id: '1',
        senderId: 'a',
        receiverId: 'b',
        content: '   ',
      }),
    ).toThrow();
    expect(() =>
      Message.createGroupMessage({
        id: '2',
        senderId: 'a',
        roomId: 'r',
        content: '',
      }),
    ).toThrow();
  });
});
