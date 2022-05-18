const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentByIdHandler = this.deleteCommentByIdHandler.bind(this);
  }

  async postCommentHandler({ auth, payload, params }, h) {
    const { id: credentialId } = auth.credentials;
    const { threadId } = params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute({
      ...payload,
      threadId,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: { addedComment },
    });
    response.code(201);
    return response;
  }

  async deleteCommentByIdHandler({ auth, params }) {
    const { id: credentialId } = auth.credentials;
    const { threadId, commentId } = params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    await deleteCommentUseCase.execute({ credentialId, threadId, commentId });

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
