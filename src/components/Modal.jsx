// src/components/Modal.jsx
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  // Filtreleme fonksiyonu
  function filtreleLog(log) {
    if (typeof log !== "string") return log;
    const regex =
      /(👥 Kullanıcı Listesi:[\s\S]*?)(?=🔍|$)|(🔍 Güncelleme Kontrolü:[\s\S]*?)(?=🌐|$)|(🌐 IIS Site Listesi:[\s\S]*?)(?=📦|$)|(📦 Yüklü Programlar:[\s\S]*)/g;

    const matches = log.match(regex) || [];
    return matches.map(m => m.trim()).join("\n\n");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg text-black font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ✖
          </button>
        </div>
        <div className="overflow-auto max-h-[70vh] whitespace-pre-wrap text-sm text-black">
          {filtreleLog(children)}
        </div>
      </div>
    </div>
  );
}
