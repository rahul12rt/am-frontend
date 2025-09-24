"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCreateWatch,
  useUpdateWatch,
  useGetWatchById,
} from "@/hooks/useWatch";

interface Watch {
  id?: string;
  name: string;
  description: string | { [key: string]: any };
  characteristics: string | { [key: string]: any };
  actualprice: number;
  offerprice: number;
  offerpercentage: number;
  category: string;
  series: string;
  modelgroup: string;
  releasedate: string;
  theme: string;
  warrantyperiod: string;
  stockavailability: boolean;
  isfeatured: boolean;
  WatchImages?: any[];
  WatchColors?: any[];
  reviews?: any[];
}

// Helper functions to handle object/string conversion
const stringifyObjectField = (field: string | { [key: string]: any }): string => {
  if (typeof field === 'string') return field;
  try {
    return JSON.stringify(field, null, 2);
  } catch (e) {
    return '';
  }
};

const parseStringField = (field: string): string => {
  // We'll just keep it as a string for the form
  return field;
};

interface WatchFormProps {
  initialData?: Watch;
}

const WatchForm: React.FC<WatchFormProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const watchId = searchParams.get("id");

  const createWatchMutation = useCreateWatch();
  const updateWatchMutation = useUpdateWatch();

  // Fetch watch details if ID is present
  const {
    data: watchData,
    isLoading: isFetching,
    error: fetchError,
  } = useGetWatchById(watchId || "");

  const loading =
    createWatchMutation.isPending ||
    updateWatchMutation.isPending ||
    isFetching;

  const [formData, setFormData] = useState<Watch>({
    name: "",
    description: "",
    characteristics: "",
    actualprice: 0,
    offerprice: 0,
    offerpercentage: 0,
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

  // Image files state
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    isoview: null,
    front: null,
    back: null,
    side: null,
    strap: null,
    closeup: null,
    dial: null,
  });

  // Update form data when watch data is fetched
  useEffect(() => {
    if (watchData) {
      setFormData({
        ...watchData,
        // Convert object fields to strings for the form
        description: stringifyObjectField(watchData.description),
        characteristics: stringifyObjectField(watchData.characteristics),
        releasedate: watchData.releasedate
          ? new Date(watchData.releasedate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        stockavailability:
          typeof watchData.stockavailability === "string"
            ? watchData.stockavailability === "true"
            : watchData.stockavailability,
      });
    }
  }, [watchData]);

  // Test data

  // useEffect(() => {
  //   setFormData({
  //     name: "Watch",
  //     description:
  //       "Luxurious day-date watch featuring an elegant olive green sunburst dial with Roman numeral hour markers. The watch displays both day and date complications with a distinctive green gradient face that shifts from deep forest green at the edges to lighter olive in the center.",
  //     characteristics:
  //       "Stainless steel case and bracelet, fluted bezel, day-date display, Roman numeral markers, green sunburst dial, automatic movement, water resistant",
  //     actualprice: 8500,
  //     offerprice: 7650,
  //     offerpercentage: 10,
  //     category: "Luxury",
  //     series: "Day-Date",
  //     modelgroup: "Classic",
  //     releasedate: "2025-08-07",
  //     theme: "Standard",
  //     warrantyperiod: "24",
  //     stockavailability: true,
  //     isfeatured: false,
  //   });
  // }, []);

  // Calculate offer percentage when prices change
  useEffect(() => {
    if (formData.actualprice > 0 && formData.offerprice > 0) {
      const percentage = Math.round(
        ((formData.actualprice - formData.offerprice) / formData.actualprice) *
          100
      );
      setFormData((prev) => ({
        ...prev,
        offerpercentage: percentage,
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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0] || null;
    setImageFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (watchId && formData.id) {
        // Update existing watch
        await updateWatchMutation.mutateAsync({
          id: formData.id,
          formData: {
            name: formData.name,
            // Convert to string for API
            description: typeof formData.description === 'string' ? formData.description : '',
            characteristics: typeof formData.characteristics === 'string' ? formData.characteristics : '',
            actualprice: formData.actualprice,
            offerprice: formData.offerprice,
            offerpercentage: formData.offerpercentage,
            category: formData.category,
            series: formData.series,
            modelgroup: formData.modelgroup,
            releasedate: formData.releasedate,
            theme: formData.theme,
            warrantyperiod: formData.warrantyperiod,
            stockavailability: formData.stockavailability ? "true" : "false",
            isfeatured: formData.isfeatured,
          },
          images: imageFiles, // Only include if there are new images
        });
      } else {
        // Create new watch
        await createWatchMutation.mutateAsync({
          formData: {
            name: formData.name,
            // Convert to string for API
            description: typeof formData.description === 'string' ? formData.description : '',
            characteristics: typeof formData.characteristics === 'string' ? formData.characteristics : '',
            actualprice: formData.actualprice,
            offerprice: formData.offerprice,
            offerpercentage: formData.offerpercentage,
            category: formData.category,
            series: formData.series,
            modelgroup: formData.modelgroup,
            releasedate: formData.releasedate,
            theme: formData.theme,
            warrantyperiod: formData.warrantyperiod,
            stockavailability: formData.stockavailability ? "true" : "false",
            isfeatured: formData.isfeatured,
          },
          images: imageFiles,
        });
      }

      // Navigate to collections page on success
      router.push("/collections");
    } catch (error) {
      // Error handling is already done in the mutation hooks
      console.error("Error saving watch:", error);
    }
  };

  const imageFields = [
    { key: "isoview", label: "Isometric View" },
    { key: "front", label: "Front View" },
    { key: "back", label: "Back View" },
    { key: "side", label: "Side View" },
    { key: "strap", label: "Strap View" },
    { key: "closeup", label: "Close-up View" },
    { key: "dial", label: "Dial View" },
  ];

  // Show error message if fetch failed
  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <h2 className="text-red-400 font-bold text-lg mb-2">Error</h2>
          <p className="text-red-300">
            Failed to load watch details. Please try again.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-8">
          {watchId ? "Edit Watch" : "Add New Watch"}
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
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
              value={typeof formData.description === 'string' ? formData.description : stringifyObjectField(formData.description)}
              onChange={handleInputChange}
              rows={4}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
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
              value={typeof formData.characteristics === 'string' ? formData.characteristics : stringifyObjectField(formData.characteristics)}
              onChange={handleInputChange}
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
              placeholder="Enter watch characteristics"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Product Images
            </h3>
            <div className="space-y-4">
              {imageFields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, key)}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                    />
                    {imageFiles[key] && (
                      <p className="text-xs text-green-400 mt-1">
                        Selected: {imageFiles[key]?.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Offer Percentage
              </label>
              <input
                type="number"
                name="offerpercentage"
                value={formData.offerpercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
                placeholder="0"
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
              >
                <option value="Standard">Standard</option>
                <option value="Limited Edition">Limited Edition</option>
                <option value="Classic">Classic</option>
                <option value="Modern">Modern</option>
                <option value="Retro">Retro</option>
              </select>
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
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Warranty Period (In months)
              </label>
              <input
                type="text"
                name="warrantyperiod"
                value={formData.warrantyperiod}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 disabled:opacity-50"
                placeholder="e.g., 24"
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
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-800 rounded focus:ring-blue-500 disabled:opacity-50"
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
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-800 rounded focus:ring-blue-500 disabled:opacity-50"
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
                  {watchId ? "Updating..." : "Adding..."}
                </span>
              ) : watchId ? (
                "Update Watch"
              ) : (
                "Add Watch"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-8 py-3 border border-gray-600 text-gray-300 bg-gray-800 font-medium rounded-lg hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
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
