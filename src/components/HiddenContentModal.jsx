import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon } from "lucide-react";

export default function HiddenContentModal({ isOpen, onClose, title, items = [], setPreviewImage, setPage }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[10px] flex items-center justify-center p-[20px]"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[24px] max-w-[820px] w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#e2e8f0] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-[24px] border-b border-[#f1f5f9] bg-[#f8fafc]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-[12px] bg-[#eef3ff] text-[#0D6EFD] flex items-center justify-center font-bold text-[18px]">
                📁
              </div>
              <div>
                <h3 className="font-sans font-bold text-[20px] text-[#0f172a] m-0">{title}</h3>
                <p className="font-sans text-[13px] text-[#64748b] m-0 mt-[2px]">{items.length} items</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-[36px] h-[36px] rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className="p-[24px] overflow-y-auto flex flex-col gap-[16px]">
            {items.length > 0 ? (
              items.map((item) => {
                const activityImg = item.gallery?.[0];
                const certImg = item.gallery?.[1] || item.gallery?.[0];

                return (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff]">
                    <div>
                      <div className="font-sans font-bold text-[17px] text-[#0f172a] flex items-center flex-wrap">
                        {item.title}
                        {item.year && <span className="text-[13px] text-[#64748b] font-normal ml-[8px]">({item.year})</span>}
                        {item.link_url && (
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem("targetProjectId", item.link_url || item.id);
                              if (setPage) setPage("Projects");
                              onClose();
                            }}
                            className="ml-[12px] bg-[#eef3ff] text-[#0D6EFD] text-[12px] font-semibold px-[12px] py-[4px] rounded-full hover:bg-[#0D6EFD] hover:text-white transition-colors cursor-pointer"
                          >
                            Project
                          </button>
                        )}
                      </div>
                      {item.my_role && (
                        <div className="font-sans font-bold text-[14px] text-[#0D6EFD] mt-[2px]">{item.my_role}</div>
                      )}
                      <div className="font-sans text-[14px] text-[#334155] mt-[4px] leading-[1.6]">{item.description}</div>
                    </div>

                    <div className="flex gap-[10px] shrink-0 self-end md:self-center">
                      {activityImg ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (setPreviewImage) setPreviewImage(activityImg);
                          }}
                          className="w-[42px] h-[42px] rounded-[12px] border border-[#eef3ff] bg-white text-[#0D6EFD] hover:bg-[#0D6EFD] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          title="View Photo"
                        >
                          <ImageIcon size={18} />
                        </button>
                      ) : null}
                      {certImg && certImg !== activityImg ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (setPreviewImage) setPreviewImage(certImg);
                          }}
                          className="w-[42px] h-[42px] rounded-[12px] border border-[#eef3ff] bg-white text-[#0D6EFD] hover:bg-[#0D6EFD] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          title="View Certificate"
                        >
                          <ImageIcon size={18} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-[40px] text-[#64748b] text-[14px]">No hidden items.</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
