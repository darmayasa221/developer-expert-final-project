const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and presisted comments', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'jhon',
          password: 'secret_password',
          fullname: 'jhon Indonesia',
        },
      });

      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'jhon',
          password: 'secret_password',
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(responseLogin.payload);

      const postThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: {
          title: 'thread title',
          body: 'thread body',
        },
      });

      const {
        data: { addedThread },
      } = JSON.parse(postThreadResponse.payload);

      const postCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'thread comment',
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const {
        data: { addedComment },
      } = JSON.parse(postCommentResponse.payload);

      const result = await CommentsTableTestHelper.findCommentById(addedComment.id);

      expect(postCommentResponse.statusCode).toEqual(201);
      expect(result).toHaveLength(1);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'jhon',
          password: 'secret_password',
          fullname: 'jhon Indonesia',
        },
      });

      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'jhon',
          password: 'secret_password',
        },
      });

      const {
        data: { accessToken },
      } = JSON.parse(responseLogin.payload);

      const postThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'thread title',
          body: 'thread body',
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const {
        data: { addedThread },
      } = JSON.parse(postThreadResponse.payload);

      const postCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: {
          content: 'thread comment',
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const {
        data: { addedComment },
      } = JSON.parse(postCommentResponse.payload);

      const deleteCommentResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(deleteCommentResponse.statusCode).toEqual(200);
      const deletedComment = await CommentsTableTestHelper.findCommentById(
        addedComment.id,
      );
      expect(deletedComment[0].is_delete).toBeTruthy();
    });
  });
});
