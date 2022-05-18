const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should presist new thread and return added thread correctly', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });

      const newThread = new NewThread({
        title: 'test thread',
        body: 'test thread body',
        owner: ownerId,
      });

      const fakeIdGenerator = () => '123';
      const idFake = `thread-${fakeIdGenerator()}`;
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await threadRepositoryPostgres.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById(idFake);
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual(idFake);
    });
    it('should return addedThread correctly', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });

      const newThread = new NewThread({
        title: 'test thread',
        body: 'test thread body',
        owner: ownerId,
      });

      const fakeIdGenerator = () => '123';
      const idFake = `thread-${fakeIdGenerator()}`;
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const addedThread = await threadRepositoryPostgres.addThread(newThread);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: idFake,
        title: newThread.title,
        owner: newThread.owner,
      }));
    });
  });

  describe('getThreadById', () => {
    it('should throw notFound error when thread not found', async () => {
      const threadId = 'thread-000';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById(threadId))
        .rejects.toThrow(NotFoundError);
    });

    it('should return correct thread', async () => {
      const username = 'test';
      const ownerId = await UsersTableTestHelper.addUser({ username });
      const threadId = await ThreadsTableTestHelper.addThread({ owner: ownerId });
      const expectResult = await ThreadsTableTestHelper.findThreadById(threadId);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const thread = await threadRepositoryPostgres.getThreadById(threadId);
      expect(thread.id).toEqual(expectResult[0].id);
      expect(thread.title).toEqual(expectResult[0].title);
      expect(thread.body).toEqual(expectResult[0].body);
      expect(thread.date).toEqual(expectResult[0].date);
      expect(thread.username).toEqual(username);
    });
  });

  describe('verifyAvailableThreadById', () => {
    it('should throw not found error when thread not found', async () => {
      const threadRepositoryPostgress = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgress.verifyAvailableThreadById('thread-000'),
      )
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw not found error when thread is found', async () => {
      const ownerId = await UsersTableTestHelper.addUser({ username: 'test' });
      const threadId = await ThreadsTableTestHelper.addThread({ owner: ownerId });

      const threadRepositoryPostgress = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgress.verifyAvailableThreadById(threadId))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
