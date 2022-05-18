const DetailThread = require('../DetailThread');

describe('DetailThread', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'threadBody',
      date: new Date(),
      comments: [],
    };

    expect(() => new DetailThread(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 'thread-123',
      title: 'thread title',
      body: 'threadBody',
      date: new Date(),
      username: 'test',
      comments: 'comments',
    };

    expect(() => new DetailThread(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'test title',
      body: 'threadBody',
      date: new Date().toISOString(),
      username: 'test',
      comments: [],
    };

    const {
      id,
      title,
      body,
      date,
      username,
      comments,
    } = new DetailThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
