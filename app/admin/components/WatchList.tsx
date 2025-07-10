"use client";

import type React from "react";
import { useState } from "react";
import { Edit, Trash2, Watch as WatchIcon, DollarSign, Tag } from "lucide-react";
import type { Watch } from "../types/watch";

interface Props {
  watches: Watch[];
  onEdit: (watch: Watch) => void;
  onDelete: (external_id: string) => void;
}

const WatchList: React.FC<Props> = ({ watches, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (external_id: string) => {
    setDeletingId(external_id);
    try {
      await onDelete(external_id);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (watches.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="mx-auto w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mb-6">
          <WatchIcon className="h-16 w-16 text-slate-400" />
        </div>
        <h3 className="text-2xl font-medium text-white mb-3">No watches yet</h3>
        <p className="text-slate-400 text-lg">
          Get started by adding your first watch to the collection.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-750">
              <th className="text-left py-6 px-8 font-semibold text-slate-200 text-[1.2rem]">
                Watch Details
              </th>
              <th className="text-left py-6 px-8 font-semibold text-slate-200 text-[1.2rem]">
                Brand & Model
              </th>
              <th className="text-left py-6 px-8 font-semibold text-slate-200 text-[1.2rem]">
                Price
              </th>
              <th className="text-right py-6 px-8 font-semibold text-slate-200 text-[1.2rem]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {watches.map((watch, index) => (
              <tr
                key={watch.external_id}
                className={`border-b border-slate-700 hover:bg-slate-750 transition-colors ${
                  index % 2 === 0 ? "bg-slate-800" : "bg-slate-775"
                }`}
              >
                <td className="py-6 px-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-700 rounded-xl">
                      <WatchIcon className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {watch.name}
                      </div>
                      <div className="text-[1.2rem] text-slate-400 flex items-center gap-2 mt-2">
                        <Tag className="h-4 w-4" />
                        <span className="text-[1.2rem]">{watch.external_id}</span>
                      </div>
                      {watch.description && (
                        <div className="text-[1.2rem] text-slate-300 mt-2 max-w-md">
                          {watch.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-6 px-8">
                  <div>
                    {watch.brand && (
                      <div className="font-semibold text-white text-[1.2rem]">
                        {watch.brand}
                      </div>
                    )}
                    {watch.model && (
                      <div className="text-[1.2rem] text-slate-400 mt-1">
                        {watch.model}
                      </div>
                    )}
                    {!watch.brand && !watch.model && (
                      <span className="text-slate-500 text-[1.2rem]">
                        Not specified
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-6 px-8">
                  {watch.price ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-lg">
                        {Number.parseFloat(watch.price).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[1.2rem]">Not set</span>
                  )}
                </td>
                <td className="py-6 px-8">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onEdit(watch)}
                      className="bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 hover:text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-colors text-[1.2rem] font-medium"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(watch.external_id)}
                      disabled={deletingId === watch.external_id}
                      className="bg-slate-700 text-red-400 border border-slate-600 hover:bg-red-900 hover:border-red-700 hover:text-red-300 disabled:bg-slate-600 px-4 py-3 rounded-xl flex items-center gap-2 transition-colors text-[1.2rem] font-medium"
                    >
                      {deletingId === watch.external_id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-6 p-6">
        {watches.map((watch) => (
          <div
            key={watch.external_id}
            className="bg-slate-750 border border-slate-700 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-700 rounded-xl">
                  <WatchIcon className="h-6 w-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {watch.name}
                  </h3>
                  <p className="text-[1.2rem] text-slate-400 flex items-center gap-2 mt-1">
                    <Tag className="h-4 w-4" />
                    <span className="text-[1.2rem]">{watch.external_id}</span>
                  </p>
                </div>
              </div>
            </div>

            {(watch.brand || watch.model) && (
              <div className="mb-4">
                {watch.brand && (
                  <span className="font-semibold text-white text-[1.2rem]">
                    {watch.brand}
                  </span>
                )}
                {watch.brand && watch.model && (
                  <span className="text-slate-400 text-[1.2rem]"> • </span>
                )}
                {watch.model && (
                  <span className="text-slate-300 text-[1.2rem]">{watch.model}</span>
                )}
              </div>
            )}

            {watch.price && (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4 text-lg">
                <DollarSign className="h-5 w-5" />
                <span className="text-lg">
                  ${Number.parseFloat(watch.price).toLocaleString()}
                </span>
              </div>
            )}

            {watch.description && (
              <p className="text-[1.2rem] text-slate-300 mb-4">{watch.description}</p>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => onEdit(watch)}
                className="flex-1 bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 hover:text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-[1.2rem] font-medium"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(watch.external_id)}
                disabled={deletingId === watch.external_id}
                className="flex-1 bg-slate-700 text-red-400 border border-slate-600 hover:bg-red-900 hover:text-red-300 disabled:bg-slate-600 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-[1.2rem] font-medium"
              >
                {deletingId === watch.external_id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchList;
