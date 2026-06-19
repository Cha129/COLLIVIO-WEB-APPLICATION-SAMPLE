import React, { useRef, useState } from "react";
import { State } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Upload, Film, Image, Music, FileText, Heart, MessageSquare, Trash2, Sliders, Play, Sparkles } from "lucide-react";

interface MediaLabProps {
  state: State;
  onUpdateState: (batch: Partial<State>) => void;
}

export const MediaLab: React.FC<MediaLabProps> = ({ state, onUpdateState }) => {
  const [activeCategory, setActiveCategory] = useState("Featured");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // File Upload Handlers (Usability Pattern Guidelines compliance)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleOnFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const newUpload = {
      id: `up-${Date.now()}`,
      name: file.name,
      size: sizeStr,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      time: "Just now"
    };

    onUpdateState({
      mediaLab: {
        ...state.mediaLab,
        userUploads: [newUpload, ...state.mediaLab.userUploads]
      }
    });

    // Append to live feed as well
    const updatedActivity = [
      {
        id: `act-media-${Date.now()}`,
        text: `You uploaded a portfolio item: ${file.name} in Media Lab.`,
        time: "Just now",
        type: "system"
      },
      ...state.activityFeed
    ];
    onUpdateState({ activityFeed: updatedActivity });
  };

  const handleDeleteUpload = (id: string, name: string) => {
    const remaining = state.mediaLab.userUploads.filter(u => u.id !== id);
    onUpdateState({
      mediaLab: {
        ...state.mediaLab,
        userUploads: remaining
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 text-left selection:bg-caramel-500 selection:text-burgundy-950 font-sans">
      
      {/* ── LEFT FILTER NAVIGATION RAIL (3 Spans, Image 8 style) ── */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <Card variant="glass" className="p-4 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-wool-200/40 border-b border-caramel-500/10 pb-2 mb-2 block">Media Sections</span>
          
          <div className="flex flex-col gap-1 text-xs text-wool-200 font-semibold font-accent">
            {state.mediaLab.categories.map(cat => (
              <div 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                  activeCategory === cat 
                    ? "bg-wine-red/50 border-caramel-500/40 text-wool-100 font-bold" 
                    : "bg-burgundy-950 border-caramel-500/5 text-wool-200/40 hover:border-caramel-500/20"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[9px] font-mono text-wool-200/20">/</span>
              </div>
            ))}
          </div>
        </Card>

        {/* DRAG-AND-DROP FILE UPLOAD SECTOR (Image 8 interactive addition) */}
        <div 
          onDragEnter={handleDrag} 
          onDragOver={handleDrag} 
          onDragLeave={handleDrag} 
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive 
              ? "border-caramel-500 bg-caramel-500/10" 
              : "border-caramel/15 hover:border-caramel/35 bg-dark-fire/40 hover:bg-[#603A30]/30"
          }`}
        >
          <Upload size={28} className="text-caramel-400 mx-auto mb-2 animate-bounce-slow" />
          <p className="text-xs font-semibold text-wool-100 uppercase tracking-widest font-mono">Upload Project</p>
          <p className="text-[10px] text-wool-200/50 mt-1 font-light leading-relaxed">Drag and drop or click manually to add files to your live portfolio.</p>
          <p className="text-[8px] text-wool/25 font-mono mt-2">Images, Video modules · Max 50MB</p>
          
          <input 
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleOnFileInput}
          />
        </div>

      </div>

      {/* ── CENTRAL MEDIA VIEWPORT / CARDS (9 Spans, Image 8 center) ── */}
      <div className="lg:col-span-9 flex flex-col gap-6">
        
        {/* HERO TITLE MODULE (Image 8 style banner) */}
        <Card variant="glass" className="relative overflow-hidden bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-wine-red/25 p-7 border-caramel-500/15">
          <div className="absolute inset-0 bg-radial-gradient from-wine-red/20 to-transparent blur-3xl opacity-40 z-0" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-caramel-400 bg-caramel-500/10 px-2 py-0.5 rounded leading-none">Showcase Hub</span>
              <h1 className="font-display text-2xl md:text-3.5xl font-bold tracking-wide text-wool-100 mt-2">Media Lab</h1>
              <p className="text-xs md:text-sm text-wool-200/80 font-light leading-normal max-w-lg mt-1 font-sans">
                Premium Showcase Platform for pre-college innovation. Present your micro-internships, startup designs, and code-rep assets in high fidelity.
              </p>
            </div>
            
            <Button 
              variant="caramel" 
              className="py-2.5 px-5 font-semibold text-xs uppercase shadow-md flex gap-2 items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Project <Upload size={13} />
            </Button>
          </div>
        </Card>

        {/* FEATURED WORK DISPLAY CARDS GRID */}
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-caramel-500/10">
            <span className="text-xs font-semibold text-wool-100 uppercase tracking-wider font-accent">{activeCategory} Project Cards</span>
            <span className="text-[10px] text-wool-200/40 uppercase tracking-widest font-mono">Continuous streams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {state.mediaLab.featured.map((card, idx) => (
              <div 
                key={card.id} 
                onClick={() => setPreviewItem(card)}
                className={`glass-panel p-4 rounded-xl border flex flex-col justify-between hover:scale-[1.01] transition-all min-h-[220px] cursor-pointer group ${
                  idx === 2 ? "border-caramel-500/30 ring-1 ring-caramel-500/10" : "border-caramel-500/10"
                }`}
              >
                <div>
                  <div className="w-full h-24 bg-[#52130C]/90 rounded-lg flex items-center justify-center relative overflow-hidden border border-caramel/5 mb-3 group-hover:border-caramel/25 transition-colors">
                    {/* Abstract placeholder layout */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-burgundy-950 to-wine-red opacity-50 z-0" />
                    <Film size={20} className="text-caramel-400 opacity-60 z-10" />
                    <div className="absolute bottom-2 left-2 bg-burgundy-950/80 px-2 py-0.5 rounded text-[8px] font-mono border border-caramel-500/5 uppercase font-bold text-caramel-400 z-10">
                      {card.type}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-wool-100 leading-snug truncate">{card.title}</h4>
                  <p className="text-[10px] text-wool-200/60 leading-normal line-clamp-2 mt-1.5 font-light">{card.desc}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-wool-200/30 border-t border-caramel-500/5 pt-3.5 mt-3 shrink-0">
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 font-mono hover:text-red-400 transition">
                      <Heart size={10} className="text-[#741717]" /> {card.likes}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <MessageSquare size={10} /> {card.comments}
                    </span>
                  </div>
                  
                  {idx === 2 ? (
                    <span className="text-[9px] text-[#8D695D] font-semibold bg-caramel/10 px-2 py-0.5 rounded shadow">View Details</span>
                  ) : (
                    <span className="text-[9px] hover:text-caramel-400 transition font-mono">Expand</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOM USER PORTFOLIO UPLOADED FILES STREAM */}
        {state.mediaLab.userUploads.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-caramel-500/10">
              <span className="text-xs font-semibold text-wool-100 uppercase tracking-wider font-accent">Your Live Portfolio</span>
              <span className="text-[10px] text-wool-200/40 uppercase tracking-widest font-mono">Active Showcase</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {state.mediaLab.userUploads.map(item => (
                <div key={item.id} className="glass-panel p-3.5 rounded-xl border border-caramel-500/10 hover:border-caramel-500/20 relative group transition-all">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUpload(item.id, item.name);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-burgundy-950/90 text-red-400 hover:text-red-300 rounded-md border border-red-500/15 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 size={11} />
                  </button>

                  <div className="w-full h-16 bg-[#52130C] rounded-lg border border-caramel/5 flex items-center justify-center mb-2.5 relative overflow-hidden">
                    {item.url ? (
                      <img src={item.url} alt="User upload" className="w-full h-full object-cover rounded" />
                    ) : (
                      <FileText size={18} className="text-caramel-400/50" />
                    )}
                  </div>
                  <h5 className="text-[11px] font-bold text-wool-100 truncate pr-6" title={item.name}>{item.name}</h5>
                  <p className="text-[9px] text-[#8D695D] font-mono mt-0.5">{item.size} • {item.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRENDING SHOWCASES SLIDER FOOTER (Image 8 bottom list folders) */}
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-caramel-500/10">
            <span className="text-xs font-semibold text-wool-100 uppercase tracking-wider font-accent">Trending Showcases Slider</span>
            <span className="text-[10px] text-wool-200/40 uppercase tracking-widest font-mono">Continuous view</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-caramel-500/20 font-mono">
            {[
              { id: "f-1", name: "Interactive Biometric Simulators", path: "Simulation" },
              { id: "f-2", name: "Robotic Telemetry Sensor UI", path: "Telemetry" },
              { id: "f-3", name: "AI Heart Rate Visualizers", path: "Healthtech" },
              { id: "f-4", name: "Holographic Neural Maps", path: "BioMatch" }
            ].map(folder => (
              <div key={folder.id} className="p-3 bg-burgundy-950/80 border border-caramel-500/5 rounded-lg shrink-0 w-[200px] text-left hover:border-caramel-500/25 transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-wine-red flex items-center justify-center font-bold text-[10px] text-wool-100 text-center font-mono">📁</div>
                  <span className="text-[10px] font-semibold text-wool-100 truncate flex-1">{folder.name}</span>
                </div>
                <div className="flex justify-between text-[8px] text-wool-200/40 mt-2 tracking-wider">
                  <span>Category Path</span>
                  <span className="text-caramel-400 font-bold uppercase">{folder.path}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── EXPANSION DETAILS PREVIEW DRAWER ── */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewItem(null)}>
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-caramel-500/30 text-left shadow-2xl flex flex-col gap-4 relative" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-caramel-300">{previewItem.title}</h3>
            
            <div className="w-full h-40 bg-[#52130C] rounded-xl border border-caramel/10 flex items-center justify-center">
              <Film size={36} className="text-caramel-400 opacity-50" />
            </div>

            <p className="text-xs text-wool-200 leading-relaxed font-light">{previewItem.desc}</p>

            <div className="flex items-center gap-4 text-xs font-mono text-wool-200/45 pt-3 border-t border-caramel-500/10">
              <span className="flex items-center gap-1"><Heart size={11} className="text-red-400" /> {previewItem.likes} Likes</span>
              <span className="flex items-center gap-1"><MessageSquare size={11} /> {previewItem.comments} Comments</span>
              <span className="text-caramel-400 uppercase font-bold text-[9px] bg-caramel-500/10 px-2 py-0.5 rounded ml-auto">{previewItem.type}</span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>Close</Button>
              <Button variant="caramel" size="sm" onClick={() => {
                const likedCerts = state.mediaLab.featured.map(f => {
                  if (f.id === previewItem.id) {
                    const lCount = parseFloat(f.likes) + 0.1;
                    return { ...f, likes: `${lCount.toFixed(1)}k` };
                  }
                  return f;
                });
                onUpdateState({
                  mediaLab: {
                    ...state.mediaLab,
                    featured: likedCerts
                  }
                });
                setPreviewItem(null);
              }}>Like Project</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
