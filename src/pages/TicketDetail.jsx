import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/Badge";
import { PRIORITIES, STATUSES } from "../constants";
import { formatDateTime, shortId } from "../utils";

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Get ticket from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "tickets", id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("This ticket doesn't exist.");
        } else {
          setTicket({
            id: snapshot.id,
            ...snapshot.data(),
          });
        }

        setLoading(false);
      },
      () => {
        setError("This ticket doesn't exist or you don't have access to it.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [id]);

  // Get comments in real time
  useEffect(() => {
    const commentsQuery = query(
      collection(db, "tickets", id, "comments"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComments(commentList);
      },
      (error) => {
        console.error(error);
      },
    );

    return unsubscribe;
  }, [id]);

  const addComment = (message, system = false) => {
    return addDoc(collection(db, "tickets", id, "comments"), {
      text: message,
      system,
      by: {
        uid: user.uid,
        name: user.name,
        role: user.role,
      },
      createdAt: serverTimestamp(),
    });
  };

  const handleComment = async (event) => {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    setSending(true);

    try {
      await addComment(text.trim());
      setText("");
    } catch (error) {
      console.error(error);
      alert("Could not post the comment. Try again.");
    }

    setSending(false);
  };

  const changeField = async (field, value) => {
    if (value === ticket[field]) {
      return;
    }

    setUpdating(true);

    try {
      const changes = {
        [field]: value,
        updatedAt: serverTimestamp(),
      };

      // Save the resolved time
      if (field === "status") {
        changes.resolvedAt = value === "Resolved" ? serverTimestamp() : null;
      }

      const label = field === "status" ? "Status" : "Priority";

      await updateDoc(doc(db, "tickets", id), changes);

      await addComment(
        `${label} changed from ${ticket[field]} to ${value}`,
        true,
      );
    } catch (error) {
      console.error(error);
      alert("Could not update the ticket. Try again.");
    }

    setUpdating(false);
  };

  if (loading) {
    return <p className="muted">Loading ticket...</p>;
  }

  if (error) {
    return (
      <div className="card empty">
        <p>{error}</p>

        <Link to="/tickets">Back to tickets</Link>
      </div>
    );
  }

  return (
    <div className="narrow">
      <Link to="/tickets" className="back-link">
        Back to tickets
      </Link>

      <div className="card">
        <div className="ticket-head">
          <div>
            <span className="muted">{shortId(ticket.id)}</span>

            <h2>{ticket.title}</h2>
          </div>

          <div className="badges">
            <Badge value={ticket.priority} />
            <Badge value={ticket.status} />
          </div>
        </div>

        <div className="meta">
          <div>
            <span>Raised by</span>
            {ticket.createdBy.name}
          </div>

          <div>
            <span>Category</span>
            {ticket.category}
          </div>

          <div>
            <span>Created</span>
            {formatDateTime(ticket.createdAt)}
          </div>

          <div>
            <span>Last updated</span>
            {formatDateTime(ticket.updatedAt)}
          </div>

          {ticket.asset && (
            <div>
              <span>Device</span>
              {ticket.asset.name} ({ticket.asset.serialNo})
            </div>
          )}

          {ticket.resolvedAt && (
            <div>
              <span>Resolved</span>
              {formatDateTime(ticket.resolvedAt)}
            </div>
          )}
        </div>

        <p className="description">{ticket.description}</p>

        {isAdmin && (
          <div className="admin-controls">
            <div className="form-group">
              <label htmlFor="status">Status</label>

              <select
                id="status"
                value={ticket.status}
                disabled={updating}
                onChange={(event) => changeField("status", event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>

              <select
                id="priority"
                value={ticket.priority}
                disabled={updating}
                onChange={(event) =>
                  changeField("priority", event.target.value)
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Updates</h3>

        {comments.length === 0 ? (
          <p className="muted">No updates yet. Add a comment below.</p>
        ) : (
          <ul className="comments">
            {comments.map((comment) =>
              comment.system ? (
                <li key={comment.id} className="comment-system">
                  {comment.text} by {comment.by.name},{" "}
                  {formatDateTime(comment.createdAt)}
                </li>
              ) : (
                <li
                  key={comment.id}
                  className={`comment ${
                    comment.by.role === "admin" ? "comment-admin" : ""
                  }`}
                >
                  <div className="comment-head">
                    <strong>{comment.by.name}</strong>

                    {comment.by.role === "admin" && (
                      <span className="role role-admin">IT team</span>
                    )}

                    <small className="muted">
                      {formatDateTime(comment.createdAt)}
                    </small>
                  </div>

                  <p>{comment.text}</p>
                </li>
              ),
            )}
          </ul>
        )}

        <form className="comment-form" onSubmit={handleComment}>
          <textarea
            rows="3"
            placeholder={
              isAdmin
                ? "Reply to the employee..."
                : "Add more details or reply to IT..."
            }
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          <button
            className="btn btn-primary"
            disabled={sending || !text.trim()}
          >
            {sending ? "Posting..." : "Post comment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
