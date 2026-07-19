import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import ScrollSection from "../components/ScrollSection";
import LoadingPage from "../components/LoadingPage";
import { supabase, getTransformedUrl } from "../lib/supabase";

export default function ExperiencesPage({ setPage }) {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("category", "Experience")
          .order("year", { ascending: false })
          .order("id", { ascending: false });

        if (data) setExperiences(data);
        if (error) console.error("Error fetching experiences:", error);
      } catch (err) {
        console.error("Error loading experiences:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  if (isLoading) return <LoadingPage />;

  const sectionPad = isMobile ? "p-[40px_24px_80px]" : "p-[40px_48px_100px]";

  return (
    <div data-testid="experiences-container" className="pt-[64px] min-h-[calc(100vh-64px)] max-w-[1440px] mx-auto relative z-[1]">
      <section className={sectionPad}>


        {/* Experience List */}
        <div className="flex flex-col gap-[24px] max-w-[1000px] mx-auto">
          {experiences.length > 0 ? (
            experiences.map((exp) => {
              const imageToShow = exp.gallery?.[0] || exp.gallery?.[1];
              return (
                <ScrollSection
                  key={exp.id}
                  id={`exp-card-${exp.id}`}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff] hover:border-brand-secondary/25 transition-all shadow-card-base"
                >
                  <div>
                    <div className="font-sans font-bold text-[18px] text-brand-dark flex items-center flex-wrap">
                      {exp.title}
                      {exp.year && <span className="text-[14px] text-brand-muted font-normal ml-[8px]">({exp.year})</span>}
                      {exp.link_url && (
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("targetProjectId", exp.link_url);
                            setPage("Projects");
                          }}
                          className="ml-[12px] bg-[#eef3ff] text-[#0D6EFD] text-[12px] font-semibold px-[12px] py-[4px] rounded-full hover:bg-[#0D6EFD] hover:text-white transition-colors cursor-pointer"
                        >
                          Project
                        </button>
                      )}
                    </div>
                    {exp.my_role && (
                      <div className="font-sans font-bold text-[14.5px] text-[#0D6EFD] mt-[2px]">
                        {exp.my_role}
                      </div>
                    )}
                    <div className="font-sans text-[15.5px] text-[#334155] leading-[1.7] mt-[6px] max-w-[800px] font-medium opacity-95">
                      {exp.description}
                    </div>
                  </div>
                  <div className="flex gap-[12px] shrink-0 self-end md:self-center">
                    {imageToShow ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(imageToShow)}
                        className="w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] bg-white text-brand-primary hover:bg-[#0D6EFD] hover:text-white flex items-center justify-center shadow-[0_2px_8px_rgba(13,110,253,0.05)] transition-colors cursor-pointer"
                        title="View Experience Picture"
                      >
                        <ImageIcon size={20} />
                      </button>
                    ) : (
                      <div
                        className="w-[44px] h-[44px] rounded-[12px] bg-[#e0e0e0] text-[#9e9e9e] border border-[#eef3ff] flex items-center justify-center opacity-50 cursor-not-allowed"
                        title="No Image available"
                      >
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                </ScrollSection>
              );
            })
          ) : (
            <div className="text-center py-[64px] font-sans text-brand-muted text-[15px] bg-white/40 backdrop-blur-[8px] rounded-[24px] border border-dashed border-brand-secondary/30">
              No experiences recorded yet.
            </div>
          )}
        </div>
      </section>

      {/* Simple Lightbox Overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-brand-dark/85 backdrop-blur-[8px] z-[9999] flex items-center justify-center p-[24px] cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={getTransformedUrl(previewImage, { width: 1200 })}
              alt="Enlarged view"
              loading="lazy"
              onError={(e) => { e.target.src = previewImage; }}
              className="max-w-[95%] max-h-[90%] rounded-[16px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
