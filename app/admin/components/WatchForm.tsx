"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, X } from "lucide-react"

interface Props {
  onSubmit: (data: any) => void
  initialData?: any
  onCancel: () => void
  isEditing: boolean
}

const WatchForm: React.FC<Props> = ({ onSubmit, initialData = {}, onCancel, isEditing }) => {
  const [form, setForm] = useState<any>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm(initialData)
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(form)
      if (!isEditing) {
        setForm({})
      }
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label htmlFor="external_id" className="block text-sm font-medium text-slate-200">
            External ID *
          </label>
          <input
            id="external_id"
            name="external_id"
            type="text"
            placeholder="Enter unique identifier"
            value={form.external_id || ""}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="name" className="block text-sm font-medium text-slate-200">
            Watch Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter watch name"
            value={form.name || ""}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="brand" className="block text-sm font-medium text-slate-200">
            Brand
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            placeholder="Enter brand name"
            value={form.brand || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="model" className="block text-sm font-medium text-slate-200">
            Model
          </label>
          <input
            id="model"
            name="model"
            type="text"
            placeholder="Enter model number"
            value={form.model || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="price" className="block text-sm font-medium text-slate-200">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            placeholder="Enter price"
            value={form.price || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-sm"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-200">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter watch description..."
            value={form.description || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-sm">Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span className="text-sm">{isEditing ? "Update Watch" : "Add Watch"}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 disabled:bg-slate-600 px-6 py-4 rounded-xl flex items-center gap-3 transition-colors text-sm font-medium"
        >
          <X className="h-5 w-5" />
          <span className="text-sm">Cancel</span>
        </button>
      </div>
    </form>
  )
}

export default WatchForm
