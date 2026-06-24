"use client";

import { useEffect, useState } from "react";
import { MediaItem, getAllMediaAPI } from "@/src/services/adminService";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
}: MediaPickerModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAllMediaAPI()
        .then((data) => setMediaItems(data || []))
        .catch(() => setMediaItems([]))
        .finally(() => setLoading(false));
      setSelectedUrls([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageClick = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedUrls);
    onClose();
  };

  const filteredItems = mediaItems.filter((item) =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Select Image from Media Gallery</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {multiple ? "Select one or more images" : "Select a single image"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <input
            type="text"
            placeholder="Search images by URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-100 transition-all bg-white"
          />
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[250px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
              <span className="animate-spin text-3xl mb-2">📷</span>
              <p>Loading media items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm italic">
              No images found in your gallery.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredItems.map((item) => {
                const isSelected = selectedUrls.includes(item.url);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleImageClick(item.url)}
                    className={`relative aspect-square rounded-xl border overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#b5374a] ring-2 ring-red-100 scale-95"
                        : "border-gray-150 hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={`media-${item.id}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#b5374a]/15 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-[#b5374a] text-white flex items-center justify-center text-xs font-bold shadow-md">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs font-medium text-gray-500">
            {selectedUrls.length} image{selectedUrls.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs text-gray-500 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedUrls.length === 0}
              className="px-5 py-2 rounded-full text-white text-xs font-semibold bg-[#b5374a] hover:bg-[#8c2536] transition disabled:opacity-50 cursor-pointer"
            >
              Select Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
