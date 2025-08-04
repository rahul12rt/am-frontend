"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Watch {
  id?: string;
  name: string;
  description: string;
  characteristics: string;
  actualprice: number;
  offerprice: number;
  offerpercentage: string;
  rating: number;
  reviewscount: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: boolean;
  isfeatured: boolean;
}

interface WatchFormProps {
  initialData?: Watch;
  isEdit?: boolean;
}

const WatchForm: React.FC<WatchFormProps> = ({
  initialData,
  isEdit = false,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Watch>({
    name: "",
    description: "",
    characteristics: "",
    actualprice: 0,
    offerprice: 0,
    offerpercentage: "0%",
    rating: 0,
    reviewscount: 0,
    category: "",
    series: "",
    modelgroup: "",
    releasedate: new Date().toISOString().split("T")[0],
    theme: "Standard",
    warrantyperiod: "",
    stockavailability: true,
    isfeatured: false,
    ...initialData,
  });

  // Calculate offer percentage when prices change
  useEffect(() => {
    if (formData.actualprice > 0 && formData.offerprice > 0) {
      const percentage = Math.round(
        ((formData.actualprice - formData.offerprice) / formData.actualprice) *
          100
      );
      setFormData((prev) => ({
        ...prev,
        offerpercentage: `${percentage}%`,
      }));
    }
  }, [formData.actualprice, formData.offerprice]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/watches/${formData.id}` : "/api/watches";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/watches"); // Adjust redirect path as needed
      } else {
        console.error("Failed to save watch");
      }
    } catch (error) {
      console.error("Error saving watch:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-8">
          {isEdit ? "Edit Watch" : "Add New Watch"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Watch Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="Enter watch name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Category</option>
                <option value="Luxury">Luxury</option>
                <option value="Sports">Sports</option>
                <option value="Casual">Casual</option>
                <option value="Smart">Smart</option>
                <option value="Dress">Dress</option>
                <option value="Vintage">Vintage</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder="Enter watch description"
            />
          </div>

          {/* Characteristics */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Characteristics
            </label>
            <textarea
              name="characteristics"
              value={formData.characteristics}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder="Enter watch characteristics"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Actual Price *
              </label>
              <input
                type="number"
                name="actualprice"
                value={formData.actualprice}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Offer Price
              </label>
              <input
                type="number"
                name="offerprice"
                value={formData.offerprice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Offer Percentage
              </label>
              <input
                type="text"
                name="offerpercentage"
                value={formData.offerpercentage}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="0%"
                readOnly
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Series
              </label>
              <input
                type="text"
                name="series"
                value={formData.series}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="Enter series"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Model Group
              </label>
              <input
                type="text"
                name="modelgroup"
                value={formData.modelgroup}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="Enter model group"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Theme
              </label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Standard">Standard</option>
                <option value="Limited Edition">Limited Edition</option>
                <option value="Classic">Classic</option>
                <option value="Modern">Modern</option>
                <option value="Retro">Retro</option>
              </select>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Reviews Count
              </label>
              <input
                type="number"
                name="reviewscount"
                value={formData.reviewscount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* Date and Warranty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Release Date
              </label>
              <input
                type="date"
                name="releasedate"
                value={formData.releasedate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Warranty Period
              </label>
              <input
                type="text"
                name="warrantyperiod"
                value={formData.warrantyperiod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="e.g., 2 years"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="stockavailability"
                checked={formData.stockavailability}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-800 rounded focus:ring-blue-500"
              />
              <label className="ml-3 text-sm font-medium text-white">
                Stock Available
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isfeatured"
                checked={formData.isfeatured}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-800 rounded focus:ring-blue-500"
              />
              <label className="ml-3 text-sm font-medium text-white">
                Featured Product
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEdit ? "Updating..." : "Adding..."}
                </span>
              ) : isEdit ? (
                "Update Watch"
              ) : (
                "Add Watch"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border border-gray-600 text-gray-300 bg-gray-800 font-medium rounded-lg hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WatchForm;
