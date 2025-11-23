import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.wrapper}>

      {/* Mobile Toggle Button */}
      <button style={styles.toggleBtn} className="d-md-none" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          transform: open ? "translateX(0)" : "translateX(-260px)",
        }}
        className="admin-sidebar"
      >
        <AdminSidebar onClose={() => setOpen(false)} />
      </aside>

      {/* CONTENT */}
      <main style={styles.content}>
        {children}
      </main>

    </div>
  );
}

/*--------------------------
     INLINE STYLES
--------------------------*/
const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "#f5f5f5",
  },

  toggleBtn: {
    position: "fixed",
    top: 15,
    left: 15,
    padding: "8px 12px",
    background: "#0d6efd",
    color: "white",
    border: "none",
    borderRadius: 5,
    zIndex: 1100,
    cursor: "pointer",
  },

  sidebar: {
    width: 240,
    background: "#111",
    color: "white",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    transition: "0.3s ease",
    overflowY: "auto",
    zIndex: 1000,
  },

  content: {
    marginLeft: 240,
    padding: 20,
    width: "100%",
  },
};

/* Desktop override */
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
  @media (min-width: 768px) {
    .admin-sidebar {
      transform: translateX(0) !important;
    }
  }
  @media (max-width: 767px) {
    main {
      margin-left: 0 !important;
      width: 100% !important;
    }
  }
`;
document.head.appendChild(styleSheet);
