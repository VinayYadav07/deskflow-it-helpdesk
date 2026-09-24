// Convert Firebase Timestamp, Date, or date string into a Date
const toDate = (value) => {
  if (!value) {
    return null;
  }

  if (value.toDate) {
    return value.toDate();
  }

  return new Date(value);
};

// Format date like: 24 Sep 2026
export const formatDate = (value) => {
  const date = toDate(value);

  if (!date || isNaN(date)) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format date and time
export const formatDateTime = (value) => {
  const date = toDate(value);

  if (!date || isNaN(date)) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Find how many days are left until the date
export const daysUntil = (dateString) => {
  if (!dateString) {
    return null;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateString + "T00:00:00");

  return Math.round((targetDate - today) / 86400000);
};

// Create a short ticket ID
export const shortId = (id) => {
  return "#" + id.slice(0, 6).toUpperCase();
};

// Show simple Firebase error messages
export const friendlyError = (error) => {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-credential": "Email or password is incorrect.",

    "auth/wrong-password": "Email or password is incorrect.",

    "auth/user-not-found": "No account found with this email.",

    "auth/email-already-in-use":
      "An account with this email already exists. Log in instead.",

    "auth/weak-password": "Password must be at least 6 characters.",

    "auth/invalid-email": "Enter a valid email address.",

    "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",

    "permission-denied": "You don't have permission to do this.",
  };

  return messages[code] || "Something went wrong. Please try again.";
};
