import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="full-center">
      <div className="card empty">
        <h2>Page not found</h2>

        <p className="muted">The link may be broken or the page was removed.</p>

        <Link to="/" className="btn btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
