const NewComment = require('../NewComment');

describe('NewComment', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'thread comment',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: 'thread-123',
      content: 123,
      owner: 'user-123',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      content: 'thread comment',
      owner: 'user-123',
    };

    const { threadId, content, owner } = new NewComment(payload);

    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
