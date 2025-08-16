import React from "react";

function HistoryModal({ isOpen, onClose, title, logs }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-red-500 font-bold hover:text-red-700"
          >
            ✖
          </button>
        </div>
        <pre  className="text-gray-800 hover:text-gray-800">
          {logs || "Log bulunamadı"}
        </pre>
      </div>
    </div>
  );
}

export default HistoryModal;
