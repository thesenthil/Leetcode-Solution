import { getInitials } from '../../utils/avatar';

const Avatar = ({ src, firstName, lastName, size = 48, className = '' }) => {
  const initials = getInitials(firstName, lastName);

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName || ''} ${lastName || ''}`.trim()}
        className={`avatar avatar--img ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--initials ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

export default Avatar;
