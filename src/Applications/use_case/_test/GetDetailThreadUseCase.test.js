const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should return thread detail correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };
    const detailThread = new DetailThread({
      id: 'thread-123',
      title: 'test thread',
      body: 'test thread body',
      date: '2022-05-06T14:41:43.840Z',
      username: 'test',
      comments: [],
    });
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'test thread',
      body: 'test thread body',
      date: '2022-05-06T14:41:43.840Z',
      username: 'test',
    }));

    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(
      [
        new DetailComment({
          id: 'comment-001',
          username: 'jhon',
          date: ' 2022-05-06T06:45:10.527Z',
          is_delete: false,
          content: 'jhon test comment content',
        }),
      ],
    ));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const result = await getDetailThreadUseCase.execute(useCasePayload);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);

    expect(result).toEqual(new DetailThread({
      id: 'thread-123',
      title: 'test thread',
      body: 'test thread body',
      date: '2022-05-06T14:41:43.840Z',
      username: 'test',
      comments: [
        new DetailComment({
          id: 'comment-001',
          username: 'jhon',
          date: ' 2022-05-06T06:45:10.527Z',
          is_delete: false,
          content: 'jhon test comment content',
        }),
      ],
    }));
  });
});
