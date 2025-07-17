// client/src/pages/Admin.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { Modpack } from "../types";
import AdminModpackRow from "../components/AdminModpackRow";
import "../assets/css/admin.css";

const Admin: React.FC = () => {
  const [modpacks, setModpacks] = useState<Modpack[]>([]);
  const [originalModpacks, setOriginalModpacks] = useState<Modpack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [newModpackFile, setNewModpackFile] = useState<File | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    if (newModpackFile) return true;
    if (JSON.stringify(modpacks) !== JSON.stringify(originalModpacks))
      return true;
    return false;
  }, [modpacks, originalModpacks, newModpackFile]);

  useEffect(() => {
    if (message) {
      const timerId = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timerId);
    }
  }, [message]);

  useEffect(() => {
    document.body.classList.add("admin-page-active");
    return () => {
      document.body.classList.remove("admin-page-active");
    };
  }, []);

  const fetchModpacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/modpacks");
      if (!response.ok) throw new Error("Failed to fetch modpacks.");
      const data: Modpack[] = await response.json();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setModpacks(sortedData);
      setOriginalModpacks(JSON.parse(JSON.stringify(sortedData)));
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModpacks();
  }, [fetchModpacks]);

  const handleInputChange = (
    filename: string,
    field: keyof Modpack,
    value: string
  ) => {
    setModpacks((currentPacks) =>
      currentPacks.map((p) =>
        p.filename === filename ? { ...p, [field]: value } : p
      )
    );
  };

  const handleDelete = async (filename: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${filename}"? This cannot be undone.`
      )
    )
      return;
    try {
      const response = await fetch(`/api/modpacks/${filename}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Delete failed");
      setMessage({ text: result.message, type: "success" });
      fetchModpacks();
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: "error" });
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      if (newModpackFile) {
        const formData = new FormData();
        formData.append("modpackFile", newModpackFile);
        const uploadRes = await fetch("/api/modpacks", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok)
          throw new Error(
            (await uploadRes.json()).message || "Modpack upload failed"
          );
      }

      const changedPacks = modpacks.filter((pack) => {
        const original = originalModpacks.find(
          (p) => p.filename === pack.filename
        );
        return !original || JSON.stringify(pack) !== JSON.stringify(original);
      });

      const updatePromises = changedPacks.map((pack) =>
        fetch(`/api/modpacks/${pack.filename}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pack),
        })
      );
      if (updatePromises.length > 0) await Promise.all(updatePromises);

      setMessage({ text: "All changes saved successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message}`, type: "error" });
    } finally {
      setIsSaving(false);
      setNewModpackFile(null);
      fetchModpacks();
    }
  };

  const triggerFileUpload = () => {
    document.getElementById("new-modpack-input")?.click();
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      {message && (
        <p className={`admin-message ${message.type}`}>{message.text}</p>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Manage Existing Modpacks</h2>
          <button className="upload-new-btn" onClick={triggerFileUpload}>
            + Upload New Modpack
          </button>
        </div>
        <input
          type="file"
          id="new-modpack-input"
          className="is-hidden"
          accept=".mrpack"
          onChange={(e) =>
            setNewModpackFile(e.target.files ? e.target.files[0] : null)
          }
        />
        {newModpackFile && (
          <div
            className="admin-file-display"
            style={{ marginBottom: "20px", background: "var(--surface-0)" }}
          >
            <span style={{ color: "var(--subtext-0)" }}>
              New pack to upload:
            </span>
            <span className="filename">{newModpackFile.name}</span>
            <button
              className="clear-btn"
              onClick={() => setNewModpackFile(null)}
            >
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="admin-placeholder">Loading modpacks...</div>
        ) : (
          <div className="modpack-list-container">
            {modpacks.length > 0 ? (
              modpacks.map((pack) => (
                <AdminModpackRow
                  key={pack.filename}
                  pack={pack}
                  onInputChange={handleInputChange}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="admin-placeholder">
                No modpacks found. Upload one to get started!
              </div>
            )}
          </div>
        )}
      </div>

      <div className="submit-btn-container">
        <button
          onClick={handleSaveAll}
          disabled={!hasUnsavedChanges || isSaving}
          className="submit-btn"
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
};

export default Admin;
