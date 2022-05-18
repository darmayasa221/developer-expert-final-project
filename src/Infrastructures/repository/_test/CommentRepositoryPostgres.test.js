const pool = require('../../database/postgres/pool');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment ', () => {
    it('should presist new comment and return added comment correctly', async () => {
      const ownerId = await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'test',
      });

      const threadId = await ThreadsTableTestHelper.addThread({ owner: ownerId });
      const commentUserId = await UsersTableTestHelper.addUser({
        id: 'user-111',
        username: 'commenter',
      });

      const newComment = {
        threadId,
        content: 'test comment',
        owner: commentUserId,
      };

      const mockIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        mockIdGenerator,
      );

      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: `comment-${mockIdGenerator()}`,
          content: 'test comment',
          owner: commentUserId,
        }),
      );

      const dataBaseComments = await CommentsTableTestHelper.findCommentById(addedComment.id);

      expect(dataBaseComments).toHaveLength(1);
    });
  });

  describe('checkCommentAccess', () => {
    it('should throw 404 error when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const id = {
        commentId: 'comment-123',
        threadId: 'thread-123',
        credentialId: 'user-123',
      };

      await expect(commentRepositoryPostgres.checkCommentAccess(id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw Authorization error when cannot access resourse', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });
      const threadId = await ThreadsTableTestHelper.addThread({ owner: ownerId });

      const commenterId = await UsersTableTestHelper.addUser({
        id: 'user-000',
        username: 'commenter',
      });
      const commentId = await CommentsTableTestHelper.addComment({
        threadId,
        owner: commenterId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const id = {
        commentId,
        threadId,
        credentialId: ownerId,
      };

      await expect(commentRepositoryPostgres.checkCommentAccess(id))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw error when comment is exist and can access resourse', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });
      const threadId = await ThreadsTableTestHelper.addThread({ owner: ownerId });

      const commenterId = await UsersTableTestHelper.addUser({
        id: 'user-000',
        username: 'commenter',
      });
      const commentId = await CommentsTableTestHelper.addComment({
        threadId,
        owner: commenterId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const id = {
        commentId,
        threadId,
        credentialId: commenterId,
      };

      await expect(commentRepositoryPostgres.checkCommentAccess(id))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteCommentById ', () => {
    it('should delete comment correctly', async () => {
      const ownerId = await UsersTableTestHelper.addUser({
        username: 'test',
      });
      const threadId = await ThreadsTableTestHelper.addThread({
        owner: ownerId,
      });

      const commentId = await CommentsTableTestHelper.addComment({
        threadId,
        owner: ownerId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const deletedId = await commentRepositoryPostgres.deleteCommentById(commentId);
      const deletedComment = await CommentsTableTestHelper.findCommentById(commentId);

      expect(deletedId).toEqual(commentId);
      expect(deletedComment[0].is_delete).toBeTruthy();
    });
  });

  describe('getCommentsByThreadId ', () => {
    it('should return comments correctly', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });
      const threadId1 = await ThreadsTableTestHelper.addThread({
        id: 'thread-001',
        owner: ownerId,
      });
      const threadId2 = await ThreadsTableTestHelper.addThread({
        id: 'thread-002',
        owner: ownerId,
      });
      const commenterId1 = await UsersTableTestHelper.addUser({
        id: 'user-001',
        username: 'jhon',
      });
      const commenterId2 = await UsersTableTestHelper.addUser({
        id: 'user-002',
        username: 'jhoni',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-001',
        threadId: threadId1,
        owner: commenterId1,
        content: 'jhon test comment content',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-002',
        threadId: threadId1,
        owner: commenterId2,
        content: 'test thread!!',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-003',
        threadId: threadId2,
        owner: commenterId2,
      });

      await CommentsTableTestHelper.deleteCommentById('comment-002');
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const results = await commentRepositoryPostgres.getCommentsByThreadId(threadId1);
      const [comment1, comment2] = results;

      expect(results).toHaveLength(2);
      expect(comment1.id).toEqual('comment-001');
      expect(comment1.username).toEqual('jhon');
      expect(comment1.content).toEqual('jhon test comment content');
      expect(comment2.id).toEqual('comment-002');
      expect(comment2.username).toEqual('jhoni');
      expect(comment2.content).toEqual('**komentar telah dihapus**');
    });
  });

  describe('checkComment ', () => {
    it('should throw not found error when comment is not found', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });
      const threadId = await ThreadsTableTestHelper.addThread({
        id: 'thread-001',
        owner: ownerId,
      });

      const commentId = await CommentsTableTestHelper.addComment({
        id: 'comment-001',
        threadId,
        owner: ownerId,
        content: 'thread comment content',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkComment(commentId, 'thread-000'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw not found error when comment is found', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });

      const threadId = await ThreadsTableTestHelper.addThread({
        id: 'thread-001',
        owner: ownerId,
      });

      const commentId = await CommentsTableTestHelper.addComment({
        id: 'comment-001',
        threadId,
        owner: ownerId,
        content: 'thread comment content',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkComment(commentId, threadId))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
