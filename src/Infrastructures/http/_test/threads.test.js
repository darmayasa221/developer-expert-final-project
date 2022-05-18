const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted threads', async () => {
      const registerPayload = {
        username: 'jhon',
        password: 'secret_password',
        fullname: 'jhon Indonesia',
      };
      const server = await createServer(container);

      const loginPayload = {
        username: 'jhon',
        password: 'secret_password',
      };

      const threadPayload = {
        title: 'thread title',
        body: 'thread body',
      };

      // register user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: registerPayload,
      });
      // login user
      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });

      const {
        data: { accessToken },
      } = JSON.parse(responseLogin.payload);

      // post thread
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      const result = await ThreadsTableTestHelper.findThreadById(responseJson.data.addedThread.id);

      expect(response.statusCode).toEqual(201);
      expect(result).toHaveLength(1);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail correctly', async () => {
      const server = await createServer(container);
      const threadOwnerId = await UsersTableTestHelper.addUser({
        id: 'user-001',
        username: 'dicoding',
      });
      const threadCommenterId1 = await UsersTableTestHelper.addUser({
        id: 'user-002',
        username: 'mark',
      });
      const threadCommenterId2 = await UsersTableTestHelper.addUser({
        id: 'user-003',
        username: 'jeff',
      });

      const threadId = await ThreadsTableTestHelper.addThread({
        id: 'thread-001',
        owner: threadOwnerId,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-001',
        owner: threadCommenterId1,
        threadId,
        content: 'amazing!!!',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-002',
        owner: threadCommenterId2,
        threadId,
        content: 'good thread ever!',
      });

      const getThreadResponse = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(getThreadResponse.payload);
      expect(getThreadResponse.statusCode).toEqual(200);
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toHaveLength(2);
    });
  });
});
