"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, X } from "lucide-react"
import type { Watch } from "../types/watch";

interface Props {
  onSubmit: (data: Watch) => void;
  initialData?: Partial<Watch>;
  onCancel: () => void;
  isEditing: boolean;
}

const WatchForm: React.FC<Props> = ({ onSubmit, initialData = {}, onCancel, isEditing }) => {
  const [form, setForm] = useState<Partial<Watch>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm(initialData)
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm({ ...form, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!form.external_id || !form.name) {
        alert("External ID and Watch Name are required.");
        setIsSubmitting(false);
        return;
      }
      // Add more required field checks if needed

      await onSubmit(form as Watch);
      if (!isEditing) {
        setForm({});
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label
            htmlFor="external_id"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
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
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="name"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
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
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="brand"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
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
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="model"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
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
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="price"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
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
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="description"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
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
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-[1.2rem]"
          />
        </div>

        {/* Images (as JSON or separate fields) */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="images"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Images (JSON)
          </label>
          <textarea
            id="images"
            name="images"
            placeholder="Enter image URLs as JSON..."
            value={form.images || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={2}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-[1.2rem]"
          />
        </div>

        {/* Characteristics */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="characteristics"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Characteristics
          </label>
          <textarea
            id="characteristics"
            name="characteristics"
            placeholder="Enter watch characteristics..."
            value={form.characteristics || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={2}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-[1.2rem]"
          />
        </div>

        {/* Colors (as JSON or dynamic fields) */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="colors"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Colors (JSON)
          </label>
          <textarea
            id="colors"
            name="colors"
            placeholder="Enter colors as JSON..."
            value={form.colors || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={2}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-[1.2rem]"
          />
        </div>

        {/* Prices */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="prices"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Prices
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              id="actual_price"
              name="actual_price"
              type="number"
              placeholder="Actual Price"
              value={form.actual_price || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
            <input
              id="offer_price"
              name="offer_price"
              type="number"
              placeholder="Offer Price"
              value={form.offer_price || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
            <input
              id="offer_percentage"
              name="offer_percentage"
              type="number"
              placeholder="Offer %"
              value={form.offer_percentage || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
          </div>
        </div>

        {/* Rating and reviews */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="reviews"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Rating & Reviews
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              id="rating"
              name="rating"
              type="number"
              step="0.1"
              placeholder="Rating"
              value={form.rating || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
            <input
              id="reviews_count"
              name="reviews_count"
              type="number"
              placeholder="Reviews Count"
              value={form.reviews_count || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
          </div>
        </div>

        {/* Category, series, model group, release date, theme, warranty */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="category"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Category, Series & Model Group
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              id="category"
              name="category"
              type="text"
              placeholder="Category"
              value={form.category || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
            <input
              id="series"
              name="series"
              type="text"
              placeholder="Series"
              value={form.series || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
            <input
              id="model_group"
              name="model_group"
              type="text"
              placeholder="Model Group"
              value={form.model_group || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
            />
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="release_date"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Release Date
          </label>
          <input
            id="release_date"
            name="release_date"
            type="date"
            placeholder="Select release date"
            value={form.release_date || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="theme"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Theme
          </label>
          <input
            id="theme"
            name="theme"
            type="text"
            placeholder="Enter theme"
            value={form.theme || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="warranty_period"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Warranty Period
          </label>
          <input
            id="warranty_period"
            name="warranty_period"
            type="text"
            placeholder="Enter warranty period"
            value={form.warranty_period || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        {/* Stock availability */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="stock_availability"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Stock Availability
          </label>
          <input
            id="stock_availability"
            name="stock_availability"
            type="text"
            placeholder="Enter stock availability"
            value={typeof form.stock_availability === "string" ? form.stock_availability : ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>

        {/* Dimensions and weight (as JSON or dynamic fields) */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="dimensions"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Dimensions (JSON)
          </label>
          <textarea
            id="dimensions"
            name="dimensions"
            placeholder="Enter dimensions as JSON..."
            value={typeof form.dimensions === "string" ? form.dimensions : form.dimensions ? JSON.stringify(form.dimensions) : ""}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={2}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-[1.2rem]"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="weight"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Weight (JSON)
          </label>
          <textarea
            id="weight"
            name="weight"
            placeholder="Enter weight as JSON..."
            value={typeof form.weight === "string" ? form.weight : form.weight ? JSON.stringify(form.weight) : ""}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={2}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 resize-none text-[1.2rem]"
          />
        </div>

        {/* Is featured */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="is_featured"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Featured
          </label>
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            checked={form.is_featured || false}
            onChange={handleCheckboxChange}
            disabled={isSubmitting}
            className="h-5 w-5 text-emerald-600 border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-600"
          />
        </div>

        {/* Tags (comma separated or dynamic fields) */}
        <div className="space-y-3 md:col-span-2">
          <label
            htmlFor="tags"
            className="block text-[1.2rem] font-medium text-slate-200"
          >
            Tags (comma separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="Enter tags, separated by commas"
            value={form.tags || ""}
            onChange={handleChange}
            disabled={isSubmitting}
            className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-[1.2rem]"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-colors text-[1.2rem] font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-[1.2rem]">Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span className="text-[1.2rem]">
                {isEditing ? "Update Watch" : "Add Watch"}
              </span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 disabled:bg-slate-600 px-6 py-4 rounded-xl flex items-center gap-3 transition-colors text-[1.2rem] font-medium"
        >
          <X className="h-5 w-5" />
          <span className="text-[1.2rem]">Cancel</span>
        </button>
      </div>
    </form>
  );
}

export default WatchForm
