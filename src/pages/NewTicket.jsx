import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import useAssets from "../hooks/useAssets";
import { CATEGORIES, PRIORITIES } from "../constants";

const NewTicket = () => {
  const { user } = useAuth();
  const { assets } = useAssets();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Hardware",
    priority: "Medium",
    description: "",
    assetId: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.title.trim().length < 5) {
      return setError("Title should be at least 5 characters.");
    }

    if (form.description.trim().length < 10) {
      return setError("Please describe the problem in at least 10 characters.");
    }

    // Find the selected device
    const asset = assets.find((asset) => asset.id === form.assetId);

    setSaving(true);

    try {
      const ticket = await addDoc(collection(db, "tickets"), {
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        status: "Open",

        asset: asset
          ? {
              id: asset.id,
              name: asset.name,
              serialNo: asset.serialNo,
            }
          : null,

        createdBy: {
          uid: user.uid,
          name: user.name,
          email: user.email,
        },

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        resolvedAt: null,
      });

      // Open the new ticket
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      console.error(error);
      setError("Could not create the ticket. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="narrow">
      <div className="page-header">
        <div>
          <h2>Raise a ticket</h2>

          <p className="muted">
            Tell the IT team what's wrong. You'll get updates on the ticket
            page.
          </p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>

          <input
            id="title"
            name="title"
            placeholder="e.g. Laptop not connecting to office Wi-Fi"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>

            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="assetId">Related device (optional)</label>

          <select
            id="assetId"
            name="assetId"
            value={form.assetId}
            onChange={handleChange}
          >
            <option value="">Not related to a device</option>

            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.serialNo})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>

          <textarea
            id="description"
            name="description"
            rows="5"
            placeholder="What happened, when did it start, and what have you already tried?"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Submitting..." : "Submit ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTicket;
