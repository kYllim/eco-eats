import { Message } from './Message';

describe('Message', () => {
  it('creates a private message with receiverId only', () => {
    const privateMessage = Message.createPrivate({
      id: '1',
      senderId: 'a',
      receiverId: 'b',
      content: 'salut',
    });
    expect(privateMessage.type).toBe('PRIVATE');
    expect(privateMessage.receiverId).toBe('b');
    expect(privateMessage.roomId).toBeNull();
  });

  it('creates a group message with roomId only', () => {
    const groupMessage = Message.createGroupMessage({
      id: '2',
      senderId: 'a',
      roomId: 'staff-room',
      content: 'hello',
    });
    expect(groupMessage.type).toBe('GROUP');
    expect(groupMessage.roomId).toBe('staff-room');
    expect(groupMessage.receiverId).toBeNull();
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
