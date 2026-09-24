const Badge = ({ value }) => {
  // No value = no badge
  if (!value) {
    return null;
  }

  // "In Progress" → "in-progress"
  const className = value.toLowerCase().replace(/\s+/g, "-");

  return <span className={`badge badge-${className}`}>{value}</span>;
};

export default Badge;
