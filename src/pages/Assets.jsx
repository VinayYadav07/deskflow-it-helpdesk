import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import useAssets from "../hooks/useAssets";
import Badge from "../components/Badge";
import { ASSET_STATUSES, ASSET_TYPES } from "../constants";
import { daysUntil, formatDate } from "../utils";

const emptyForm = {
  name: "",
  type: "Laptop",
  serialNo: "",
  purchaseDate: "",
  warrantyExpiry: "",
  status: "In Stock",
  assignedUid: "",
};

// Show warranty status
const WarrantyCell = ({ date }) => {
  const days = daysUntil(date);

  if (days === null) {
    return <span className="muted">-</span>;
  }

  let type = "ok";
  let text = `${days} days left`;

  if (days < 0) {
    type = "expired";
    text = "Expired";
  } else if (days <= 30) {
    type = "soon";
  }

  return (
    <span className={`warranty warranty-${type}`}>
      {formatDate(date)} ({text})
    </span>
  );
};

const Assets = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const { assets, loading, error } = useAssets();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Get employees for device assignment
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    getDocs(collection(db, "users"))
      .then((snapshot) => {
        const userList = snapshot.docs
          .map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setUsers(userList);
      })
      .catch(console.error);
  }, [isAdmin]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  };

  const startEdit = (asset) => {
    setForm({
      name: asset.name,
      type: asset.type,
      serialNo: asset.serialNo,
      purchaseDate: asset.purchaseDate || "",
      warrantyExpiry: asset.warrantyExpiry || "",
      status: asset.status,
      assignedUid: asset.assignedTo?.uid || "",
    });

    setEditingId(asset.id);
    setShowForm(true);
    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const serialNo = form.serialNo.trim();

    if (!name || !serialNo) {
      return setFormError("Asset name and serial number are required.");
    }

    // Check for same serial number
    const duplicate = assets.some(
      (asset) =>
        asset.serialNo.toLowerCase() === serialNo.toLowerCase() &&
        asset.id !== editingId,
    );

    if (duplicate) {
      return setFormError("An asset with this serial number already exists.");
    }

    if (
      form.purchaseDate &&
      form.warrantyExpiry &&
      form.warrantyExpiry < form.purchaseDate
    ) {
      return setFormError("Warranty expiry can't be before the purchase date.");
    }

    const assignee = users.find((user) => user.uid === form.assignedUid);

    // Change status based on assignment
    let status = form.status;

    if (assignee && status === "In Stock") {
      status = "In Use";
    }

    if (!assignee && status === "In Use") {
      status = "In Stock";
    }

    const data = {
      name,
      type: form.type,
      serialNo,
      purchaseDate: form.purchaseDate,
      warrantyExpiry: form.warrantyExpiry,
      status,
      assignedTo: assignee
        ? {
            uid: assignee.uid,
            name: assignee.name,
            email: assignee.email,
          }
        : null,
      updatedAt: serverTimestamp(),
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, "assets", editingId), data);
      } else {
        await addDoc(collection(db, "assets"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setFormError("Could not save the asset. Try again.");
    }

    setSaving(false);
  };

  const handleDelete = async (asset) => {
    const confirmDelete = window.confirm(
      `Delete "${asset.name}" (${asset.serialNo})? This can't be undone.`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, "assets", asset.id));
    } catch (error) {
      console.error(error);
      alert("Could not delete the asset. Try again.");
    }
  };

  const searchText = search.trim().toLowerCase();

  const filteredAssets = assets.filter(
    (asset) =>
      !searchText ||
      asset.name.toLowerCase().includes(searchText) ||
      asset.serialNo.toLowerCase().includes(searchText) ||
      (asset.assignedTo?.name || "").toLowerCase().includes(searchText),
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{isAdmin ? "Assets" : "My devices"}</h2>

          <p className="muted">
            {isAdmin
              ? "Every device and licence in the office, and who has it."
              : "Devices the IT team has assigned to you."}
          </p>
        </div>

        {isAdmin && !showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add asset
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit asset" : "Add asset"}</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Asset name</label>

              <input
                id="name"
                name="name"
                placeholder="e.g. Dell Latitude 5420"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="serialNo">Serial number</label>

              <input
                id="serialNo"
                name="serialNo"
                value={form.serialNo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>

              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                {ASSET_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {ASSET_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase date</label>

              <input
                id="purchaseDate"
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="warrantyExpiry">Warranty expiry</label>

              <input
                id="warrantyExpiry"
                type="date"
                name="warrantyExpiry"
                value={form.warrantyExpiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assignedUid">Assigned to</label>

            <select
              id="assignedUid"
              name="assignedUid"
              value={form.assignedUid}
              onChange={handleChange}
            >
              <option value="">Not assigned</option>

              {users.map((user) => (
                <option key={user.uid} value={user.uid}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {formError && <p className="error">{formError}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetForm}
            >
              Cancel
            </button>

            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add asset"}
            </button>
          </div>
        </form>
      )}

      {assets.length > 0 && (
        <div className="card filters">
          <input
            placeholder={
              isAdmin
                ? "Search by name, serial number or employee"
                : "Search your devices"
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}

      {loading && <p className="muted">Loading assets...</p>}

      {error && <p className="error">{error}</p>}

      {!loading &&
        !error &&
        (filteredAssets.length === 0 ? (
          <div className="card empty">
            {assets.length === 0 ? (
              isAdmin ? (
                <p>
                  No assets yet. Add your first laptop, printer or licence to
                  start tracking.
                </p>
              ) : (
                <p>No devices are assigned to you yet.</p>
              )
            ) : (
              <p>No assets match your search.</p>
            )}
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Serial no.</th>
                  <th>Status</th>

                  {isAdmin && <th>Assigned to</th>}

                  <th>Warranty</th>

                  {isAdmin && <th></th>}
                </tr>
              </thead>

              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <strong>{asset.name}</strong>
                    </td>

                    <td>{asset.type}</td>

                    <td className="muted">{asset.serialNo}</td>

                    <td>
                      <Badge value={asset.status} />
                    </td>

                    {isAdmin && (
                      <td>
                        {asset.assignedTo ? (
                          asset.assignedTo.name
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                    )}

                    <td>
                      <WarrantyCell date={asset.warrantyExpiry} />
                    </td>

                    {isAdmin && (
                      <td className="row-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => startEdit(asset)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(asset)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {!isAdmin && assets.length > 0 && (
        <p className="muted hint">
          Problem with one of these?{" "}
          <Link to="/tickets/new">Raise a ticket</Link> and pick the device.
        </p>
      )}
    </>
  );
};

export default Assets;
