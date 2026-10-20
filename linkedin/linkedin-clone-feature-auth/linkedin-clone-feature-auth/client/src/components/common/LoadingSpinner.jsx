const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => (
  <div className={`spinner spinner--${size}`} role="status" aria-label={label}>
    <span className="spinner__ring" />
    <span className="visually-hidden">{label}</span>
  </div>
);

export default LoadingSpinner;
