const DetailComment = require('../DetailComment');

describe('DetailComment', () => {
  it('should return corectly value if is_delete false', () => {
    const comments = [
      {
        id: 'comment-001',
        username: 'jhon',
        date: '2022-04-27T09:02:30.754Z',
        content: 'jhon test comment content',
        is_delete: false,
      },
    ];

    const result = comments.map((content) => new DetailComment(content));
    expect(result[0].id).toEqual(comments[0].id);
    expect(result[0].username).toEqual(comments[0].username);
    expect(result[0].date).toEqual(comments[0].date);
    expect(result[0].content).toEqual(comments[0].content);
  });

  it('should return corectly value if is_delet true', () => {
    const comments = [
      {
        id: 'comment-002',
        username: 'jhoni',
        date: '2022-04-27T09:02:30.756Z',
        content: 'test coment',
        is_delete: true,
      },
    ];
    const result = comments.map((content) => new DetailComment(content));

    expect(result[0].id).toEqual(comments[0].id);
    expect(result[0].username).toEqual(comments[0].username);
    expect(result[0].date).toEqual(comments[0].date);
    expect(result[0].content).toEqual('**komentar telah dihapus**');
  });
});
