const pool = require('../../../Infrastructures/database/postgres/pool');
const CommentRepositoryPostgres = require('../../../Infrastructures/repository/CommentRepositoryPostgres');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should delete the comment correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      credentialId: 'user-123',
    };

    const mockRepository = new CommentRepositoryPostgres(pool, {});

    mockRepository.checkCommentAccess = jest.fn(() => Promise.resolve());

    mockRepository.deleteCommentById = jest.fn(() => Promise.resolve('comment-123'));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockRepository,
    });

    await deleteCommentUseCase.execute(useCasePayload);

    expect(mockRepository.checkCommentAccess).toBeCalledWith(useCasePayload);
    expect(mockRepository.deleteCommentById).toBeCalledWith(
      useCasePayload.commentId,
    );
  });
});
