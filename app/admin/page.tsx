"use client";
import { useEffect, useState } from "react";
import WatchForm from "./components/WatchForm";
import WatchList from "./components/WatchList";
import {
  addWatch,
  deleteWatch,
  fetchWatches,
  updateWatch,
} from "./utils/adminApi";
import { Plus, Watch } from "lucide-react";

const AdminPage = () => {
  const [watches, setWatches] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadWatches = async () => {
      try {
        const data = await fetchWatches();
        setWatches(data);
      } catch (error) {
        console.error("Failed to fetch watches:", error);
      } finally {
        setLoading(false);
      }
    };
    loadWatches();
  }, []);

  const handleAdd = async (data: any) => {
    try {
      await addWatch(data);
      const updatedWatches = await fetchWatches();
      setWatches(updatedWatches);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add watch:", error);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateWatch(data);
      setEditing(null);
      setShowForm(false);
      const updatedWatches = await fetchWatches();
      setWatches(updatedWatches);
    } catch (error) {
      console.error("Failed to update watch:", error);
    }
  };

  const handleDelete = async (external_id: string) => {
    try {
      await deleteWatch(external_id);
      const updatedWatches = await fetchWatches();
      setWatches(updatedWatches);
    } catch (error) {
      console.error("Failed to delete watch:", error);
    }
  };

  const handleEdit = (watch: any) => {
    setEditing(watch);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-6"></div>
          <p className="text-slate-300 text-lg">Loading watches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-[63px]">
      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <Watch className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Watch Collection Admin
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Manage your watch inventory with ease
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">
              {editing ? "Edit Watch" : "Add New Watch"}
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-colors text-base font-medium"
              >
                <Plus className="h-5 w-5" />
                Add Watch
              </button>
            )}
          </div>

          {(showForm || editing) && (
            <WatchForm
              onSubmit={editing ? handleUpdate : handleAdd}
              initialData={editing || {}}
              onCancel={handleCancelEdit}
              isEditing={!!editing}
            />
          )}
        </div>

        {/* List Section */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
          <div className="p-8 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Watch Collection
                </h2>
                <p className="text-slate-300 mt-2 text-base">
                  {watches.length} {watches.length === 1 ? "watch" : "watches"}{" "}
                  in collection
                </p>
              </div>
            </div>
          </div>
          <WatchList
            watches={watches}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
