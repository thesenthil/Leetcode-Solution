const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state">
    {icon && <div className="empty-state__icon">{icon}</div>}
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__desc">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
