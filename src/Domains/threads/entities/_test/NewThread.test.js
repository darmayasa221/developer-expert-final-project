const NewThread = require('../NewThread');

describe('NewThread', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'test thread',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should thow error when payload did not meet data type specification', () => {
    const payload = {
      title: 'test thread',
      body: ['test'],
      owner: true,
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    const payload = {
      title: 'test thread',
      body: 'test thread body',
      owner: 'user-123',
    };

    const { title, body, owner } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
