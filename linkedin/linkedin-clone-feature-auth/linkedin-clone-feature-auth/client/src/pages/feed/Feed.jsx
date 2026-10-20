import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getFeedPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
  resetFeed
} from '../../features/posts/postSlice';
import { getPendingRequests } from '../../features/connections/connectionSlice';
import Avatar from '../../components/common/Avatar';
import PostSkeleton from '../../components/common/PostSkeleton';
import EmptyState from '../../components/common/EmptyState';

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, isLoading, isCreating, hasMore, currentPage, error } = useSelector(
    (state) => state.posts
  );
  const { user } = useSelector((state) => state.auth);

  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(resetFeed());
    dispatch(getFeedPosts(1));
    dispatch(getPendingRequests());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setPostImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    const result = await dispatch(createPost({ content: postContent, image: postImage }));
    if (createPost.fulfilled.match(result)) {
      setPostContent('');
      clearImage();
      toast.success('Post shared!');
    }
  };

  const handleLike = (postId) => dispatch(likePost(postId));

  const handleComment = (postId) => {
    if (!commentText[postId]?.trim()) return;
    dispatch(addComment({ postId, text: commentText[postId] }));
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleDelete = (postId) => {
    dispatch(deletePost(postId));
    toast.success('Post deleted');
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(getFeedPosts(currentPage + 1));
    }
  };

  const isLiked = (post) =>
    (post.likes || []).some((id) => id === user?._id || id?._id === user?._id);

  return (
    <div className="feed-page">
      <div className="feed-page__content">
        <div className="card create-post">
          <div className="create-post__header">
            <Avatar
              src={user?.profileImage}
              firstName={user?.firstName}
              lastName={user?.lastName}
              size={48}
            />
            <textarea
              className="create-post__input"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Start a post..."
              rows={3}
            />
          </div>

          {imagePreview && (
            <div className="create-post__preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" onClick={clearImage} className="create-post__remove-img">
                Remove
              </button>
            </div>
          )}

          <div className="create-post__footer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageSelect}
              hidden
              id="post-image"
            />
            <label htmlFor="post-image" className="create-post__media-btn">
              <ImagePlus size={20} />
              Photo
            </label>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleCreatePost}
              disabled={!postContent.trim() || isCreating}
            >
              {isCreating ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {isLoading && posts.length === 0 && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {posts.map((post) => (
          <article key={post._id} className="card post-card">
            <div className="post-card__header">
              <Avatar
                src={post.author?.profileImage}
                firstName={post.author?.firstName}
                lastName={post.author?.lastName}
                size={48}
              />
              <div className="post-card__author">
                <button
                  type="button"
                  className="post-card__name"
                  onClick={() => navigate(`/profile/${post.author?._id}`)}
                >
                  {post.author?.firstName} {post.author?.lastName}
                </button>
                <span className="post-card__headline">
                  {post.author?.headline || 'LinkedIn Member'}
                </span>
                <time className="post-card__time">
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
              </div>
              {user?._id === post.author?._id && (
                <button
                  type="button"
                  className="post-card__delete"
                  onClick={() => handleDelete(post._id)}
                  aria-label="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <p className="post-card__content">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post attachment" className="post-card__image" />
            )}

            <div className="post-card__stats">
              <span>{(post.likes || []).length} reactions</span>
              <span>{(post.comments || []).length} comments</span>
            </div>

            <div className="post-card__actions">
              <button
                type="button"
                className={`post-card__action ${isLiked(post) ? 'post-card__action--active' : ''}`}
                onClick={() => handleLike(post._id)}
              >
                <Heart size={18} fill={isLiked(post) ? 'currentColor' : 'none'} />
                Like
              </button>
              <button
                type="button"
                className="post-card__action"
                onClick={() =>
                  setShowComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))
                }
              >
                <MessageCircle size={18} />
                Comment
              </button>
            </div>

            {showComments[post._id] && (
              <div className="post-card__comments">
                {(post.comments || []).map((comment) => (
                  <div key={comment._id} className="comment">
                    <Avatar
                      src={comment.user?.profileImage}
                      firstName={comment.user?.firstName}
                      lastName={comment.user?.lastName}
                      size={32}
                    />
                    <div className="comment__bubble">
                      <strong>
                        {comment.user?.firstName} {comment.user?.lastName}
                      </strong>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
                <div className="comment comment--input">
                  <Avatar
                    src={user?.profileImage}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    size={32}
                  />
                  <input
                    type="text"
                    value={commentText[post._id] || ''}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                    placeholder="Add a comment..."
                  />
                  <button type="button" className="btn btn--sm" onClick={() => handleComment(post._id)}>
                    Post
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}

        {hasMore && posts.length > 0 && (
          <button type="button" className="btn btn--outline btn--full" onClick={loadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        )}

        {!isLoading && posts.length === 0 && (
          <EmptyState
            title="No posts yet"
            description="Be the first to share something with your network."
          />
        )}
      </div>
    </div>
  );
};

export default Feed;
