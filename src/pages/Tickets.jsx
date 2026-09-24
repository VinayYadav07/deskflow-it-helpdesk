import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useTickets from "../hooks/useTickets";
import Badge from "../components/Badge";
import { PRIORITIES, STATUSES } from "../constants";
import { formatDate, shortId } from "../utils";

const Tickets = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const { tickets, loading, error } = useTickets();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const searchText = search.trim().toLowerCase();

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchText =
      !searchText ||
      ticket.title.toLowerCase().includes(searchText) ||
      shortId(ticket.id).toLowerCase().includes(searchText) ||
      (isAdmin && ticket.createdBy.name.toLowerCase().includes(searchText));

    return (
      matchText &&
      (status === "All" || ticket.status === status) &&
      (priority === "All" || ticket.priority === priority)
    );
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{isAdmin ? "All tickets" : "My tickets"}</h2>

          <p className="muted">
            {filteredTickets.length} of {tickets.length} tickets
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary">
          Raise a ticket
        </Link>
      </div>

      <div className="card filters">
        <input
          placeholder={
            isAdmin
              ? "Search by title, ID or employee"
              : "Search by title or ID"
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="All">All statuses</option>

          {STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="All">All priorities</option>

          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </div>

      {loading && <p className="muted">Loading tickets...</p>}

      {error && <p className="error">{error}</p>}

      {!loading &&
        !error &&
        (filteredTickets.length === 0 ? (
          <div className="card empty">
            {tickets.length === 0 ? (
              <p>
                No tickets yet. <Link to="/tickets/new">Raise a ticket</Link>{" "}
                when something isn't working.
              </p>
            ) : (
              <p>
                No tickets match these filters. Clear the search or pick a
                different status.
              </p>
            )}
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>

                  {isAdmin && <th>Raised by</th>}

                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="clickable"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <td className="muted">{shortId(ticket.id)}</td>

                    <td>
                      <strong>{ticket.title}</strong>
                    </td>

                    <td>{ticket.category}</td>

                    <td>
                      <Badge value={ticket.priority} />
                    </td>

                    <td>
                      <Badge value={ticket.status} />
                    </td>

                    {isAdmin && <td>{ticket.createdBy.name}</td>}

                    <td>{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </>
  );
};

export default Tickets;
