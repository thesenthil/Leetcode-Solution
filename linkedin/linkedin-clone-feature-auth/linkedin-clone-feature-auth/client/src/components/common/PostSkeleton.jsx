const PostSkeleton = () => (
  <div className="post-skeleton">
    <div className="post-skeleton__header">
      <div className="post-skeleton__avatar skeleton-shimmer" />
      <div className="post-skeleton__meta">
        <div className="skeleton-shimmer skeleton-line skeleton-line--short" />
        <div className="skeleton-shimmer skeleton-line skeleton-line--shorter" />
      </div>
    </div>
    <div className="skeleton-shimmer skeleton-line" />
    <div className="skeleton-shimmer skeleton-line" />
    <div className="skeleton-shimmer skeleton-line skeleton-line--medium" />
  </div>
);

export default PostSkeleton;
