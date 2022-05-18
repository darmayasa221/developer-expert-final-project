const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { threadId, content, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments  VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, threadId, date, content],
    };

    const { rows } = await this._pool.query(query);

    return new AddedComment({ ...rows[0] });
  }

  async checkCommentAccess(id) {
    const { commentId, threadId, credentialId } = id;

    const query = {
      text: 'SELECT id, owner, thread_id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (rowCount < 1) {
      throw new NotFoundError('comment not found');
    }

    const comment = rows[0];

    if (comment.owner !== credentialId) {
      throw new AuthorizationError('not have access to this resourses');
    }
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rows } = await this._pool.query(query);

    return rows[0].id;
  }

  async getCommentsByThreadId(id) {
    const query = {
      text: `SELECT comments.id, users.username, date, content, is_delete 
              FROM comments
              INNER JOIN users
              ON users.id = comments.owner
              WHERE thread_id = $1
              ORDER BY date ASC`,
      values: [id],
    };
    const { rows } = await this._pool.query(query);
    return rows.map((comment) => new DetailComment(comment));
  }

  async checkComment(commentId, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const { rowCount } = await this._pool.query(query);

    if (rowCount < 1) {
      throw new NotFoundError('comment not found');
    }
  }
}

module.exports = CommentRepositoryPostgres;
