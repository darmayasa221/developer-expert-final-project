const AddedThread = require('../AddedThread');

describe('AddedThread ', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'test thread',
    };

    expect(() => new AddedThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should thow error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'test thread',
      owner: true,
    };

    expect(() => new AddedThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'test thread',
      owner: 'user-123',
    };

    const { title, body, owner } = new AddedThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
