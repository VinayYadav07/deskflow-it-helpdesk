import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useTickets from "../hooks/useTickets";
import useAssets from "../hooks/useAssets";
import Badge from "../components/Badge";
import { CATEGORIES } from "../constants";
import { daysUntil, formatDate, formatDateTime } from "../utils";

const StatCard = ({ label, value, tone = "" }) => {
  return (
    <div className={`card stat stat-${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const { tickets, loading, error } = useTickets();
  const { assets } = useAssets();

  if (loading) {
    return <p className="muted">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  // Count tickets by status
  const count = (status) => {
    return tickets.filter((ticket) => ticket.status === status).length;
  };

  // Count high priority tickets that are not resolved
  const highPending = tickets.filter(
    (ticket) => ticket.priority === "High" && ticket.status !== "Resolved",
  ).length;

  // Show latest 5 tickets
  const recent = tickets.slice(0, 5);

  // Count tickets by category
  const byCategory = CATEGORIES.map((category) => ({
    name: category,
    count: tickets.filter((ticket) => ticket.category === category).length,
  })).filter((category) => category.count > 0);

  const maxCategory = Math.max(
    1,
    ...byCategory.map((category) => category.count),
  );

  // Find assets with warranty ending in 30 days
  const expiring = assets
    .filter((asset) => {
      const days = daysUntil(asset.warrantyExpiry);

      return days !== null && days <= 30 && asset.status !== "Retired";
    })
    .sort((a, b) => daysUntil(a.warrantyExpiry) - daysUntil(b.warrantyExpiry));

  // Find resolved tickets
  const resolved = tickets.filter(
    (ticket) =>
      ticket.status === "Resolved" && ticket.resolvedAt && ticket.createdAt,
  );

  // Find average time to resolve tickets
  const avgHours = resolved.length
    ? Math.round(
        resolved.reduce(
          (total, ticket) =>
            total +
            (ticket.resolvedAt.toMillis() - ticket.createdAt.toMillis()),
          0,
        ) /
          resolved.length /
          3600000,
      )
    : null;

  const assetCount = (status) => {
    return assets.filter((asset) => asset.status === status).length;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Hi, {user.name.split(" ")[0]}</h2>

          <p className="muted">
            {isAdmin
              ? "Here is what's happening across the office."
              : "Track your IT issues and the devices assigned to you."}
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary">
          Raise a ticket
        </Link>
      </div>

      <div className="stats">
        <StatCard
          label={isAdmin ? "Total tickets" : "My tickets"}
          value={tickets.length}
        />

        <StatCard label="Open" value={count("Open")} tone="open" />

        <StatCard
          label="In progress"
          value={count("In Progress")}
          tone="progress"
        />

        <StatCard label="Resolved" value={count("Resolved")} tone="resolved" />

        {isAdmin ? (
          <StatCard
            label="High priority pending"
            value={highPending}
            tone="high"
          />
        ) : (
          <StatCard label="My devices" value={assets.length} />
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Recent tickets</h3>

          {recent.length === 0 ? (
            <p className="muted">
              No tickets yet.{" "}
              <Link to="/tickets/new">Raise your first ticket</Link>.
            </p>
          ) : (
            <ul className="list">
              {recent.map((ticket) => (
                <li key={ticket.id}>
                  <div>
                    <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>

                    <small className="muted">
                      {isAdmin ? `${ticket.createdBy.name}, ` : ""}
                      {formatDateTime(ticket.createdAt)}
                    </small>
                  </div>

                  <Badge value={ticket.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Tickets by category</h3>

          {byCategory.length === 0 ? (
            <p className="muted">
              Categories will show here once tickets come in.
            </p>
          ) : (
            byCategory.map((category) => (
              <div className="bar-row" key={category.name}>
                <span className="bar-label">{category.name}</span>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(category.count / maxCategory) * 100}%`,
                    }}
                  />
                </div>

                <span className="bar-count">{category.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid-2">
          <div className="card">
            <h3>Warranty expiring in 30 days</h3>

            {expiring.length === 0 ? (
              <p className="muted">No warranties expiring soon.</p>
            ) : (
              <ul className="list">
                {expiring.map((asset) => {
                  const days = daysUntil(asset.warrantyExpiry);

                  return (
                    <li key={asset.id}>
                      <div>
                        <strong>{asset.name}</strong>

                        <small className="muted">
                          {asset.serialNo}

                          {asset.assignedTo
                            ? `, with ${asset.assignedTo.name}`
                            : ""}
                        </small>
                      </div>

                      <span
                        className={`warranty ${
                          days < 0 ? "warranty-expired" : "warranty-soon"
                        }`}
                      >
                        {days < 0
                          ? `Expired ${formatDate(asset.warrantyExpiry)}`
                          : `${days} days left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card">
            <h3>Office summary</h3>

            <ul className="list summary">
              <li>
                <span>Total assets</span>
                <strong>{assets.length}</strong>
              </li>

              <li>
                <span>In use</span>
                <strong>{assetCount("In Use")}</strong>
              </li>

              <li>
                <span>In stock</span>
                <strong>{assetCount("In Stock")}</strong>
              </li>

              <li>
                <span>Under repair</span>
                <strong>{assetCount("Under Repair")}</strong>
              </li>

              <li>
                <span>Average resolution time</span>

                <strong>{avgHours === null ? "-" : `${avgHours} hrs`}</strong>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
