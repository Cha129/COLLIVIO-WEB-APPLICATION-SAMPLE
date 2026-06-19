import React, { useState, useEffect, useRef } from "react";
import { State, KanbanCard, ChatMessage } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  Users, Plus, Paperclip, Send, Hash, Search, Pin, MessageSquare, 
  CheckCircle, MoreHorizontal, Calendar, Sliders, ChevronDown, CheckSquare,
  Megaphone, X, CornerDownRight, ExternalLink, ThumbsUp
} from "lucide-react";

interface TeamWorkspaceProps {
  state: State;
  onUpdateState: (batch: Partial<State>) => void;
}

export const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({ state, onUpdateState }) => {
  const [activeChannel, setActiveTabChannel] = useState<string>("#general");
  const [searchText, setSearchText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskColumn, setTaskColumn] = useState<"todo" | "inProgress" | "done">("todo");

  const [workspaceMode, setWorkspaceMode] = useState<"kanban" | "whiteboard" | "timeline">("kanban");
  
  // Whiteboard States
  const [whiteboardElements, setWhiteboardElements] = useState<any[]>([
    { id: "wb-1", type: "sticky", x: 40, y: 30, text: "Brainstorming Session: AI Integrations & LLM Handshakes", color: "bg-amber-100 text-amber-900 border-amber-300" },
    { id: "wb-2", type: "sticky", x: 320, y: 40, text: "Research Mapping: User retention and matching score metrics", color: "bg-blue-100 text-blue-900 border-blue-300" },
    { id: "wb-3", type: "shape", shapeType: "circle", x: 140, y: 150, text: "Core Model Pipeline", color: "bg-emerald-50 text-emerald-800 border-emerald-300" },
    { id: "wb-4", type: "shape", shapeType: "diamond", x: 440, y: 140, text: "Verify Trust Badges?", color: "bg-purple-100 text-purple-900 border-purple-300" }
  ]);
  const [selectedWbColor, setSelectedWbColor] = useState("bg-amber-100 text-amber-900 border-amber-300");
  const [selectedWbShape, setSelectedWbShape] = useState<"sticky" | "rect" | "circle" | "diamond">("sticky");
  const [newElementText, setNewElementText] = useState("");
  const [wbTool, setWbTool] = useState<"select" | "draw">("select");
  
  // Timeline States
  const [timelineView, setTimelineView] = useState<"roadmap" | "calendar">("roadmap");
  const [timelineItems, setTimelineItems] = useState([
    { id: "tl-1", title: "Milestone Alpha: Design Mockups", date: "Sep 25", status: "completed", progress: 100, dependency: "None" },
    { id: "tl-2", title: "Core Architecture Handshake", date: "Oct 05", status: "completed", progress: 100, dependency: "Milestone Alpha" },
    { id: "tl-3", title: "Milestone Beta: Matcher Launch", date: "Oct 18", status: "active", progress: 65, dependency: "Core Architecture" },
    { id: "tl-4", title: "Deliverable: Verification Gate V4", date: "Nov 12", status: "upcoming", progress: 0, dependency: "Beta Launch" },
    { id: "tl-5", title: "Production Freeze & Sandbox Review", date: "Dec 01", status: "upcoming", progress: 0, dependency: "Verification Gate V4" }
  ]);

  // New Chat module states
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [selectedFileReference, setSelectedFileReference] = useState<any | null>(null);
  const [showFileAttachMenu, setShowFileAttachMenu] = useState(false);
  const [activeThreadMessage, setActiveThreadMessage] = useState<ChatMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  // Sync active thread with live replies
  useEffect(() => {
    if (activeThreadMessage) {
      const updatedMsg = state.teamChat.find(m => m.id === activeThreadMessage.id);
      if (updatedMsg) {
        setActiveThreadMessage(updatedMsg);
      }
    }
  }, [state.teamChat]);

  // Real-time WebSocket connection setup
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    function connect() {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const url = `${protocol}//${window.location.host}`;
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connection established inside TeamWorkspace");
          ws?.send(JSON.stringify({ type: "request-sync" }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "sync" || data.type === "update") {
              onUpdateState({ teamChat: data.payload });
            }
          } catch (err) {
            console.error("Failed to parse websocket payload:", err);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected. Attempting reconnect in 5 seconds...");
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = (err) => {
          console.error("WebSocket encounter error:", err);
          ws?.close();
        };
      } catch (err) {
        console.error("Error building WebSocket instance:", err);
      }
    }

    connect();

    // Constant REST fallback synchronization (10-second intervals)
    const fallbackPoll = setInterval(async () => {
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const latest = await res.json();
          if (latest.teamChat) {
            onUpdateState({ teamChat: latest.teamChat });
          }
        }
      } catch (err) {
        console.error("Automatic fallback sync polling failed:", err);
      }
    }, 12000);

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      clearTimeout(reconnectTimer);
      clearInterval(fallbackPoll);
    };
  }, []);

  // Send message handler with WS/REST dual channels
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && !selectedFileReference) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: state.profile.fullName || "Alex Rivera",
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      channel: isAnnouncement ? "#announcements" : activeChannel,
      isAnnouncement: isAnnouncement,
      replies: []
    };

    if (selectedFileReference) {
      newMsg.fileAttachment = selectedFileReference.title || selectedFileReference.name;
      newMsg.fileAttachmentSize = selectedFileReference.size || "1.4 MB";
      newMsg.fileAttachmentUrl = selectedFileReference.url || "#";
    }

    // Reset editor inputs
    setChatMessage("");
    setIsAnnouncement(false);
    setSelectedFileReference(null);
    setShowFileAttachMenu(false);

    // Optimistic state sync
    onUpdateState({
      teamChat: [...state.teamChat, newMsg]
    });

    // Try WS broadcast
    let sentWs = false;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: "new-message",
          payload: newMsg
        }));
        sentWs = true;
      } catch (err) {
        console.error("Skipping WebSocket broadcast send: ", err);
      }
    }

    // Fall back to REST API to guarantee durability inside sandboxes
    if (!sentWs) {
      try {
        const res = await fetch("/api/team-chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: newMsg })
        });
        if (res.ok) {
          const data = await res.json();
          onUpdateState({ teamChat: data.teamChat });
        }
      } catch (err) {
        console.error("HTTP chat submission backup error:", err);
      }
    }
  };

  // Reply handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThreadMessage) return;

    const newReply: ChatMessage = {
      id: `reply-${Date.now()}`,
      sender: state.profile.fullName || "Alex Rivera",
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      replies: []
    };

    setReplyText("");

    // Optimistic Update
    const updatedChats = state.teamChat.map(m => {
      if (m.id === activeThreadMessage.id) {
        return {
          ...m,
          replies: [...(m.replies || []), newReply]
        };
      }
      return m;
    });
    onUpdateState({ teamChat: updatedChats });

    let sentWsReply = false;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: "new-reply",
          payload: {
            messageId: activeThreadMessage.id,
            reply: newReply
          }
        }));
        sentWsReply = true;
      } catch (err) {
        console.error("Skipping WebSocket reply broadcast:", err);
      }
    }

    if (!sentWsReply) {
      try {
        const res = await fetch("/api/team-chat/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: activeThreadMessage.id,
            reply: newReply
          })
        });
        if (res.ok) {
          const data = await res.json();
          onUpdateState({ teamChat: data.teamChat });
        }
      } catch (err) {
        console.error("HTTP reply backup submission error:", err);
      }
    }
  };

  // Create new task live tracker
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: KanbanCard = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      due: "Oct 30",
      progress: taskColumn === "done" ? 100 : taskColumn === "inProgress" ? 30 : 0,
      listType: Math.random() > 0.5 ? "wool" : "caramel",
      commentsCount: 0,
      avatarInitials: ["AR"],
      checked: taskColumn === "done"
    };

    const currentCols = { ...state.kanbanColumns };
    currentCols[taskColumn] = [...currentCols[taskColumn], newTask];

    onUpdateState({
      kanbanColumns: currentCols
    });
    setNewTaskTitle("");
    setShowTaskModal(false);
  };

  const handleToggleTaskChecked = (column: "todo" | "inProgress" | "done", taskId: string) => {
    const currentCols = { ...state.kanbanColumns };
    currentCols[column] = currentCols[column].map(task => {
      if (task.id === taskId) {
        const checkedState = !task.checked;
        return {
          ...task,
          checked: checkedState,
          progress: checkedState ? 100 : 30
        };
      }
      return task;
    });
    onUpdateState({ kanbanColumns: currentCols });
  };

  return (
    <>
    <div className="flex flex-col xl:flex-row gap-6 pb-12 selection:bg-caramel-500 selection:text-burgundy-950">
      
      {/* ── CENTRAL DASHBOARD CANVAS (8 spans equivalent) ── */}
      <div className="flex-1 flex flex-col gap-6 text-left">
        
        {/* MILESTONE HEADER PROGRESS (Image 4 top strip) */}
        <Card variant="glass" className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-wine-red rounded-lg flex items-center justify-center font-bold text-wool-100">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-wool-100">Team Collaboration</h2>
              <span className="text-[10px] text-caramel-400 font-bold uppercase font-mono tracking-wider">Milestone Board Tracker</span>
            </div>
          </div>

          {/* Stepper milestones dots layout matching Image 4 */}
          <div className="flex-1 max-w-xl hidden md:flex items-center justify-between relative pl-8">
            {/* Connecting baseline progress line */}
            <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-caramel-500/15 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-[12%] right-[50%] h-[2px] bg-caramel-500 -translate-y-1/2 z-0" />

            {state.milestones.map((ms, idx) => (
              <div key={idx} className="flex items-center gap-2 relative z-10 bg-burgundy-950 p-1.5 rounded-lg border border-caramel-500/10">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono shadow-md ${
                  ms.status === "completed" 
                    ? "bg-caramel-500 text-burgundy-950" 
                    : ms.status === "active" 
                      ? "bg-wine-red text-wool-100 border border-caramel-500" 
                      : "bg-burgundy-800 text-wool-200/50"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-wool-100 leading-tight">{ms.name}</span>
                  <span className="text-[8px] text-wool-200/40 font-mono leading-none">{ms.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Workspace Mode Subnavigation Tabs */}
        <div className="flex border-b border-caramel-500/10 gap-2 pb-2 select-none font-sans text-xs">
          <button 
            type="button"
            onClick={() => setWorkspaceMode("kanban")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              workspaceMode === "kanban" 
                ? "bg-wine-red text-wool-100 shadow-sm border border-caramel-500/30" 
                : "text-caramel hover:bg-wine-red/15 hover:text-wool-100"
            }`}
          >
            📋 Kanban Board & Chat
          </button>
          
          <button 
            type="button"
            onClick={() => setWorkspaceMode("whiteboard")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              workspaceMode === "whiteboard" 
                ? "bg-wine-red text-wool-100 shadow-sm border border-caramel-500/30" 
                : "text-caramel hover:bg-wine-red/15 hover:text-wool-100"
            }`}
          >
            🎨 Collaborative Whiteboard
          </button>
          
          <button 
            type="button"
            onClick={() => setWorkspaceMode("timeline")}
            className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              workspaceMode === "timeline" 
                ? "bg-wine-red text-wool-100 shadow-sm border border-caramel-500/30" 
                : "text-caramel hover:bg-wine-red/15 hover:text-wool-100"
            }`}
          >
            📅 Project Timeline & Gantt
          </button>
        </div>

        {workspaceMode === "kanban" && (
          <>
            {/* Action controls row */}
            <div className="flex justify-between items-center bg-[#52130C]/40 p-3 rounded-xl border border-caramel/10">
              <span className="text-xs text-wool-100">Sprint Backlog</span>
              <Button 
                variant="primary" 
                size="xs" 
                className="flex gap-1 py-1 px-3 text-[10px] uppercase font-bold"
                onClick={() => { setTaskColumn("todo"); setShowTaskModal(true); }}
              >
                <Plus size={12} /> New Task
              </Button>
            </div>

            {/* KANBAN BOARD WRAPPER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* COLUMN 1: TO DO */}
              <div className="flex flex-col gap-4 bg-[#52130C]/60 border border-caramel/5 p-4 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-caramel/10 mb-1">
                  <span className="text-xs font-semibold text-wool uppercase tracking-wider font-accent">To Do</span>
                  <span className="text-[10px] bg-burgundy-950 font-mono text-wool-200/50 px-2 py-0.5 rounded">
                    {state.kanbanColumns.todo.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {state.kanbanColumns.todo.map(task => (
                    <div key={task.id} className="glass-panel hover:border-caramel-500/30 p-4 rounded-xl flex flex-col gap-3 border border-caramel-500/10 transition-all select-none">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-wool-100 leading-relaxed font-sans">{task.title}</h4>
                        <input 
                          type="checkbox" 
                          className="accent-wine-red rounded mt-0.5"
                          checked={!!task.checked}
                          onChange={() => handleToggleTaskChecked("todo", task.id)}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-wool/40 font-mono border-t border-caramel/5 pt-3">
                        <span className="flex items-center gap-1 font-bold text-caramel-400">
                          <Calendar size={10} /> Due: {task.due}
                        </span>
                        <span className="uppercase text-[8px] bg-caramel-500/10 text-caramel-300 font-bold px-1.5 rounded">Wool Track</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-caramel-500/5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {task.avatarInitials?.map((init, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-wine-red border border-burgundy-900 flex items-center justify-center font-bold text-[8px] text-wool-100">
                              {init}
                            </div>
                          ))}
                        </div>
                        {task.commentsCount > 0 && (
                          <span className="text-[9px] text-wool-200/30 flex items-center gap-1 font-mono">
                            <MessageSquare size={10} /> {task.commentsCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {state.kanbanColumns.todo.length === 0 && (
                    <p className="text-[10px] text-wool-200/20 py-8 text-center font-mono">All tasks assigned or complete</p>
                  )}
                </div>
              </div>

              {/* COLUMN 2: IN PROGRESS */}
              <div className="flex flex-col gap-4 bg-[#52130C]/60 border border-caramel/5 p-4 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-caramel/10 mb-1">
                  <span className="text-xs font-semibold text-caramel uppercase tracking-wider font-accent">In Progress</span>
                  <span className="text-[10px] bg-wine-red/35 text-caramel-400 font-mono font-bold px-2 py-0.5 rounded">
                    {state.kanbanColumns.inProgress.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {state.kanbanColumns.inProgress.map(task => (
                    <div key={task.id} className="glass-panel p-4 rounded-xl flex flex-col gap-3 border border-caramel-500/15 relative">
                      {task.id === "task-2" && (
                        <div className="absolute top-4 right-4 text-caramel-400">
                          <Pin size={12} className="rotate-45" />
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-2 pr-6">
                        <h4 className="text-xs font-semibold text-wool-100 leading-normal">{task.title}</h4>
                        <input 
                          type="checkbox" 
                          className="accent-wine-red rounded mt-0.5"
                          checked={!!task.checked}
                          onChange={() => handleToggleTaskChecked("inProgress", task.id)}
                        />
                      </div>

                      {/* Subtasks and detailed metrics for Phase 1 inside image 4 */}
                      {task.subtasks && (
                        <div className="flex flex-col gap-1.5 py-1">
                          <div className="flex justify-between text-[9px] text-wool-200/50 font-mono uppercase">
                            <span>Checklists Progress</span>
                            <span>{task.subtasks}</span>
                          </div>
                          <div className="w-full h-1 bg-burgundy-950 rounded-full">
                            <div className="h-1 bg-caramel-500 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Attachment node display (e.g. Wireframes_v3.pdf) */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center gap-1.5 p-1.5 bg-[#52130C]/90 text-[10px] text-wool border border-caramel/10 rounded">
                          <Paperclip size={10} className="text-caramel-400" />
                          <span className="truncate">{task.attachments[0]}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[9px] text-wool/40 font-mono border-t border-caramel/5 pt-3">
                        <span className="flex items-center gap-1 font-bold text-caramel-400">
                          <Calendar size={10} /> Due: {task.due}
                        </span>
                        <span className={`text-[8px] uppercase font-bold px-1.5 rounded ${task.listType === "caramel" ? "bg-caramel-500 text-burgundy-950" : "bg-caramel-500/10 text-caramel-300"}`}>
                          {task.listType} Track
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-caramel-500/5">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {task.avatarInitials?.map((init, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-burgundy-800 border border-burgundy-900 flex items-center justify-center font-bold text-[8px] text-wool-100">
                              {init}
                            </div>
                          ))}
                        </div>
                        {task.commentsCount > 0 && (
                          <span className="text-[9px] text-wool-200/40 flex items-center gap-1 font-mono">
                            <MessageSquare size={10} /> {task.commentsCount} Comments
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 3: DONE */}
              <div className="flex flex-col gap-4 bg-[#52130C]/60 border border-caramel/5 p-4 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-caramel/10 mb-1">
                  <span className="text-xs font-semibold text-wool uppercase tracking-wider font-accent">Done</span>
                  <span className="text-[10px] bg-caramel-500/20 text-caramel-400 font-mono font-bold px-2 py-0.5 rounded">
                    {state.kanbanColumns.done.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {state.kanbanColumns.done.map(task => (
                    <div key={task.id} className="glass-panel p-4 rounded-xl flex flex-col gap-2 border border-caramel-500/10 opacity-70">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-wool-100 line-through leading-relaxed">{task.title}</h4>
                        <input 
                          type="checkbox" 
                          className="accent-wine-red rounded mt-0.5 cursor-pointer"
                          checked={true}
                          onChange={() => handleToggleTaskChecked("done", task.id)}
                        />
                      </div>

                      {/* Standard completed tags/emoji mapping of Published report inside image 4 */}
                      <div className="flex items-center justify-between text-[9px] text-caramel-400/60 font-mono border-t border-caramel-500/5 pt-2 mt-1">
                        <span className="bg-caramel-500/10 text-caramel-400 px-2 py-0.5 rounded uppercase font-bold flex gap-1 items-center">
                          <CheckCircle size={10} /> Verified
                        </span>
                        <span>100% Complete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

        {workspaceMode === "whiteboard" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center bg-[#52130C]/40 p-4 rounded-xl border border-caramel/10">
              <div className="flex items-center gap-1.5 text-xs text-wool-100 font-mono font-bold uppercase tracking-wide">
                <span>Paint Mode:</span>
                <span className="text-caramel-400 font-black">{wbTool === "select" ? "SELECT / DRAG" : "DRAW / ERASE"}</span>
              </div>
              <div className="h-4 w-[1px] bg-caramel-500/20" />
              
              <div className="flex gap-1.5">
                <Button 
                  variant={wbTool === "select" ? "primary" : "outline"} 
                  size="xs"
                  onClick={() => setWbTool("select")}
                >
                  🖐 Select
                </Button>
                <Button 
                  variant={wbTool === "draw" ? "primary" : "outline"} 
                  size="xs"
                  onClick={() => {
                    setWbTool("draw");
                    alert("Draw mode active: click on canvas to add drawings.");
                  }}
                >
                  ✏ Pen Draw
                </Button>
              </div>

              <div className="h-4 w-[1px] bg-caramel-500/20" />

              {/* Elements selector */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-wool-200/50">Element:</span>
                <select 
                  className="bg-burgundy-950 text-wool-200 border border-caramel-500/20 rounded px-1.5 py-1 text-xs outline-none"
                  value={selectedWbShape}
                  onChange={e => setSelectedWbShape(e.target.value as any)}
                >
                  <option value="sticky">📌 Sticky Note</option>
                  <option value="rect">⬛ Rectangle</option>
                  <option value="circle">⚪ Circle</option>
                  <option value="diamond">🔶 Mind Map Diamond</option>
                </select>
              </div>

              {/* Color selector */}
              <div className="flex gap-1">
                {[
                  { value: "bg-amber-100 text-amber-900 border-amber-300", color: "bg-amber-200" },
                  { value: "bg-blue-100 text-blue-900 border-blue-300", color: "bg-blue-200" },
                  { value: "bg-emerald-50 text-emerald-800 border-emerald-300", color: "bg-emerald-200" },
                  { value: "bg-purple-100 text-purple-900 border-purple-300", color: "bg-purple-200" },
                  { value: "bg-red-100 text-red-900 border-red-300", color: "bg-red-200" }
                ].map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setSelectedWbColor(col.value)}
                    className={`w-4 h-4 rounded-full border ${col.color} ${selectedWbColor === col.value ? "ring-2 ring-white scale-125" : ""}`}
                  />
                ))}
              </div>

              {/* Add Input */}
              <div className="flex gap-1.5 flex-1 min-w-[150px]">
                <input 
                  type="text"
                  placeholder="Enter element title..."
                  className="bg-burgundy-950 text-wool-100 placeholder-wool-200/25 border border-caramel-500/20 rounded px-2.5 py-1 text-xs flex-1 outline-none focus:border-caramel-500"
                  value={newElementText}
                  onChange={e => setNewElementText(e.target.value)}
                />
                <Button 
                  variant="caramel" 
                  size="xs"
                  onClick={() => {
                    if (!newElementText.trim()) return;
                    setWhiteboardElements([
                      ...whiteboardElements,
                      {
                        id: `wb-user-${Date.now()}`,
                        type: selectedWbShape === "sticky" ? "sticky" : "shape",
                        shapeType: selectedWbShape !== "sticky" ? selectedWbShape : undefined,
                        x: 50 + Math.random() * 200,
                        y: 50 + Math.random() * 120,
                        text: newElementText,
                        color: selectedWbColor
                      }
                    ]);
                    setNewElementText("");
                  }}
                >
                  Add Node
                </Button>
              </div>
            </div>

            {/* Simulated collaborative canvas board */}
            <div className="relative h-[340px] w-full border border-caramel-500/15 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center bg-[#FAF8F6]">
              {/* Overlay graph papers lines */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#741717 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              
              {/* Collaborative Avatars Floating */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-[#E8E0DC] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-chestnut">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>3 Peers Online:</span>
                <span className="text-[#741717]">Alex, Sarah, Bob</span>
              </div>

              {/* Whiteboard elements container */}
              <div className="absolute inset-0">
                {whiteboardElements.map((el) => {
                  return (
                    <div
                      key={el.id}
                      className={`absolute p-3 rounded-lg border shadow-md font-sans text-xs cursor-all-scroll group select-none transition-all duration-100 ${el.color}`}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: el.shapeType === "circle" ? "100px" : el.shapeType === "diamond" ? "110px" : "150px",
                        height: el.shapeType === "circle" ? "100px" : el.shapeType === "diamond" ? "110px" : "auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        borderRadius: el.shapeType === "circle" ? "50%" : el.shapeType === "diamond" ? "8px" : "8px"
                      }}
                      onMouseDown={(evt) => {
                        if (wbTool !== "select") return;
                        const dragStartLeft = el.x;
                        const dragStartTop = el.y;
                        const startClientX = evt.clientX;
                        const startClientY = evt.clientY;

                        const onMouseMove = (moveEvt: MouseEvent) => {
                          const deltaX = moveEvt.clientX - startClientX;
                          const deltaY = moveEvt.clientY - startClientY;
                          
                          setWhiteboardElements(prev => prev.map(item => {
                            if (item.id === el.id) {
                              return {
                                ...item,
                                x: Math.max(0, dragStartLeft + deltaX),
                                y: Math.max(0, dragStartTop + deltaY)
                              };
                            }
                            return item;
                          }));
                        };

                        const onMouseUp = () => {
                          document.removeEventListener("mousemove", onMouseMove);
                          document.removeEventListener("mouseup", onMouseUp);
                        };

                        document.addEventListener("mousemove", onMouseMove);
                        document.addEventListener("mouseup", onMouseUp);
                      }}
                    >
                      {/* Close button */}
                      <button
                        type="button"
                        onClick={() => {
                          setWhiteboardElements(whiteboardElements.filter(item => item.id !== el.id));
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black opacity-0 group-hover:opacity-100 transition shadow-sm pointer-events-auto cursor-pointer"
                      >
                        ×
                      </button>

                      {el.type === "sticky" && (
                        <div className="text-[9px] uppercase font-mono font-bold opacity-40 leading-none mb-1">Sticky Note</div>
                      )}
                      <p className="font-semibold text-[10px] leading-tight select-none">{el.text}</p>
                    </div>
                  );
                })}
              </div>

              {whiteboardElements.length === 0 && (
                <div className="text-center z-10 p-6 pointer-events-none">
                  <p className="text-xs font-mono text-wool-300">Whiteboard is clean.</p>
                  <p className="text-[10px] text-wool-200/50 font-mono mt-1">Use the element adder above to populate ideas.</p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-wool-200/40 text-center font-mono">💡 Pro-tip: Choose "SELECT" mode to drag Sticky Notes around on the canvas.</p>
          </div>
        )}

        {workspaceMode === "timeline" && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            {/* View options bar */}
            <div className="flex justify-between items-center bg-[#52130C]/40 p-4 rounded-xl border border-caramel/10">
              <span className="text-xs text-wool-100 font-bold uppercase font-mono">Project Milestone Execution Tracker</span>
              <div className="flex gap-1.5">
                <Button 
                  variant={timelineView === "roadmap" ? "primary" : "outline"} 
                  size="xs"
                  onClick={() => setTimelineView("roadmap")}
                >
                   Roadmap View
                </Button>
                <Button 
                  variant={timelineView === "calendar" ? "primary" : "outline"} 
                  size="xs"
                  onClick={() => setTimelineView("calendar")}
                >
                   Calendar View
                </Button>
              </div>
            </div>

            {timelineView === "roadmap" ? (
              <Card variant="glass" className="p-5 flex flex-col gap-4">
                <span className="text-[10px] uppercase font-bold text-caramel font-mono tracking-widest border-b border-caramel-500/10 pb-2 mb-1 block font-accent">Execution Timeline Gantt Blocks</span>
                
                <div className="space-y-4">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-burgundy-950/20 border border-caramel-500/10 rounded-xl hover:border-caramel-500/30 transition">
                      {/* Name of Milestone */}
                      <div className="md:col-span-4 text-left">
                        <span className="text-[9px] font-mono font-bold text-caramel uppercase block">Task Name:</span>
                        <span className="text-xs font-bold text-wool-100 leading-tight">{item.title}</span>
                      </div>

                      {/* Dependent tasks */}
                      <div className="md:col-span-3 text-left font-mono text-[10px]">
                        <span className="text-[8px] uppercase tracking-wide text-wool-200/40 block">Dependency:</span>
                        <span className="text-caramel font-semibold">🔗 {item.dependency}</span>
                      </div>

                      {/* Timeline duration bar */}
                      <div className="md:col-span-3 text-left">
                        <div className="flex justify-between text-[9px] text-wool/40 font-mono mb-1">
                          <span>Progress:</span>
                          <span className="font-bold">{item.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-burgundy-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-caramel-500 to-[#741717] rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Deadline & Status */}
                      <div className="md:col-span-2 text-right text-xs">
                        <span className="text-[9px] font-mono text-wool-200/50 block">Target: {item.date}</span>
                        <span className={`inline-block text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase mt-1 ${
                          item.status === "completed" 
                            ? "bg-emerald-500/15 text-emerald-500" 
                            : item.status === "active"
                              ? "bg-amber-500/15 text-amber-500 animate-pulse"
                              : "bg-burgundy-800 text-wool-200/40"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card variant="glass" className="p-5">
                <span className="text-[10px] uppercase font-bold text-caramel font-mono tracking-widest border-b border-caramel-500/10 pb-2 mb-3 block font-accent">Project Deadlines Calendar</span>
                
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono font-bold text-wool-200/40 uppercase mb-2">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }).map((_, idx) => {
                    const dayNum = (idx - 3) > 0 && (idx - 3) <= 31 ? (idx - 3) : null;
                    const isToday = dayNum === 17;
                    const matchedDeadline = dayNum === 25 ? "Alpha" : dayNum === 5 ? "Core API" : dayNum === 18 ? "Beta" : null;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`h-14 p-1 rounded-lg border text-left flex flex-col justify-between transition-all ${
                          isToday 
                            ? "bg-[#741717]/20 border-[#741717]" 
                            : matchedDeadline
                              ? "bg-caramel-500/10 border-caramel/40"
                              : "bg-burgundy-950/10 border-caramel-500/5 hover:border-caramel-500/15"
                        }`}
                      >
                        <span className={`text-[9px] font-mono font-bold leading-none ${isToday ? "text-[#741717]" : "text-wool-200/40"}`}>
                          {dayNum}
                        </span>
                        
                        {matchedDeadline && (
                          <div className="text-[7px] leading-tight font-black uppercase text-caramel truncate bg-caramel-500/10 p-0.5 rounded" title={matchedDeadline}>
                            🎯 {matchedDeadline}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}  </div>

            {/* ── RIGHT COLUMN: TEAM CHAT & UPDATES PANEL (Supports responsive double-wide panel for Active thread replies) ── */}
      <div className={`w-full shrink-0 text-left transition-all duration-300 ${activeThreadMessage ? "xl:w-[720px]" : "xl:w-[350px]"}`}>
        <Card variant="glass" className="h-full flex flex-col justify-between p-5 min-h-[550px] relative overflow-hidden border border-caramel-500/10">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">
            
            {/* COLUMN A: Primary Chat list (6 layout slots if thread is open, 12 if not) */}
            <div className={`flex flex-col justify-between h-full ${activeThreadMessage ? "xl:col-span-6 border-r border-caramel-500/10 pr-2 xl:pr-5" : "xl:col-span-12"}`}>
              
              <div>
                <div className="flex justify-between items-center border-b border-caramel-500/10 pb-3 mb-4">
                  <h3 className="font-accent text-sm font-semibold tracking-wide uppercase text-caramel-400">
                    Team Workspace Chat
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Live Connected
                  </div>
                </div>

                {/* Quick search input */}
                <div className="relative mb-4">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-wool-200/30" />
                  <input 
                    type="text"
                    placeholder="Search messages or members..."
                    className="w-full bg-burgundy-950 border border-caramel-500/10 rounded-lg pl-8 pr-4 py-2 text-[11px] text-wool-100 placeholder-wool-200/20 focus:outline-none focus:border-caramel-500/30 transition shadow-inner font-light"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                  {searchText && (
                    <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-wool-200/30 hover:text-wool-100">
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Channels toggle block */}
                <div className="flex flex-col gap-1 text-[11px] text-wool-200/85 mb-4 uppercase tracking-wider font-mono">
                  {[
                    { name: "# general", active: activeChannel === "#general", channel: "#general" },
                    { name: "# projects", active: activeChannel === "#projects", channel: "#projects" },
                    { name: "# announcements", active: activeChannel === "#announcements", channel: "#announcements" }
                  ].map(chan => {
                    const count = state.teamChat.filter(m => (m.channel || "#general") === chan.channel).length;
                    return (
                      <div 
                        key={chan.name}
                        onClick={() => {
                          setActiveTabChannel(chan.channel);
                          // If on announcements and sending normal, default is announcements
                          if (chan.channel === "#announcements") {
                            setIsAnnouncement(true);
                          } else {
                            setIsAnnouncement(false);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${chan.active ? "bg-wine-red/45 border-l-2 border-caramel-500 text-wool-100 font-bold" : "hover:bg-wine-red/10 text-wool-200/50"}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Hash size={12} className={chan.active ? "text-caramel" : "text-wool-200/30"} />
                          <span>{chan.name.split(" ")[1]}</span>
                        </div>
                        <span className="text-[9px] font-mono font-light text-wool-200/30">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* PINNED ANNOUNCEMENT ALERT STRIP */}
                {(() => {
                  const latestAnn = [...state.teamChat].reverse().find(m => m.isAnnouncement);
                  if (latestAnn && activeChannel !== "#announcements") {
                    return (
                      <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-2.5 text-left text-xs text-amber-100/90 flex gap-2 items-start relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1 font-mono text-[7px] text-amber-500/30 uppercase font-black tracking-widest">Pin</div>
                        <Megaphone size={14} className="text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-amber-400 flex items-center gap-1.5 leading-none mb-1">
                            Latest Announcement <span className="text-[8px] opacity-40 font-mono">• {latestAnn.time}</span>
                          </div>
                          <p className="line-clamp-2 text-[11px] leading-relaxed italic">{latestAnn.text}</p>
                          <button 
                            onClick={() => {
                              setActiveTabChannel("#announcements");
                              setIsAnnouncement(true);
                            }}
                            className="text-[9px] font-bold text-amber-500 hover:text-amber-300 uppercase tracking-wider font-mono mt-1.5 inline-flex gap-1 items-center hover:underline focus:outline-none"
                          >
                            Jump to Announcements <CornerDownRight size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Live Message Threads Feed list based on Image 4 */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  <span className="text-[10px] text-wool-200/30 uppercase font-mono block">Real-time Session Feed:</span>
                  
                  {state.teamChat
                    .filter(m => {
                      const channelMatches = (m.channel || "#general") === activeChannel;
                      // Show in main list if matches channel.
                      return channelMatches && (!searchText || m.text.toLowerCase().includes(searchText.toLowerCase()) || m.sender.toLowerCase().includes(searchText.toLowerCase()));
                    })
                    .map(msg => (
                      <div 
                        key={msg.id} 
                        className={`group/msg flex gap-2.5 items-start p-2 rounded-xl transition border ${
                          msg.isAnnouncement 
                            ? "border-amber-500/25 bg-gradient-to-br from-amber-500/5 to-transparent" 
                            : "border-transparent hover:bg-wine-red/10"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-burgundy-800 border border-caramel-500/10 flex items-center justify-center font-bold text-xs uppercase text-wool-100 flex-shrink-0">
                          {msg.sender[0]}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-semibold text-wool-100 leading-none flex items-center gap-1.5">
                              {msg.sender}
                              {msg.isAnnouncement && (
                                <span className="text-[8px] bg-amber-500/15 text-amber-500 font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider leading-none flex items-center gap-0.5">
                                  <Pin size={6} /> Announcement
                                </span>
                              )}
                            </span>
                            <span className="text-[8px] text-wool-200/40 font-mono">{msg.time}</span>
                          </div>
                          
                          <p className="text-xs text-wool-200/80 leading-relaxed font-light">{msg.text}</p>
                          
                          {/* clip/file attachment layout inside Image 4 chat list */}
                          {msg.fileAttachment && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-burgundy-950 rounded-lg border border-caramel-500/10 text-[10px] text-wool-100">
                              <Paperclip size={10} className="text-caramel-400 shrink-0" />
                              <span className="truncate flex-1 font-mono font-light text-[9px] text-wool-200">{msg.fileAttachment}</span>
                              <span className="text-[8px] bg-caramel-500/10 text-caramel-400 px-1.5 py-0.5 rounded font-mono">
                                {msg.fileAttachmentSize || "1.4 MB"}
                              </span>
                            </div>
                          )}

                          {/* Thread button & reply tracker */}
                          <div className="flex items-center gap-3.5 mt-2 pt-1">
                            <button 
                              onClick={() => setActiveThreadMessage(msg)}
                              className={`text-[9px] font-bold text-caramel hover:text-caramel-300 font-mono uppercase flex items-center gap-1 py-0.5 px-1.5 rounded transition ${
                                activeThreadMessage?.id === msg.id 
                                  ? "bg-caramel-500/15 text-caramel-300 font-black" 
                                  : "hover:bg-caramel-500/10 text-caramel/70"
                              }`}
                            >
                              <MessageSquare size={10} />
                              {msg.replies && msg.replies.length > 0 
                                ? `${msg.replies.length} Reply` 
                                : "Reply Thread"}
                            </button>
                            
                            {msg.replies && msg.replies.length > 0 && (
                              <div className="flex -space-x-1 items-center">
                                {Array.from(new Set(msg.replies.map(r => r.sender))).slice(0, 3).map((author, i) => (
                                  <div key={i} title={author} className="w-4 h-4 rounded-full bg-wine-red border border-burgundy-950 flex items-center justify-center font-bold text-[7px] text-wool-100">
                                    {author[0]}
                                  </div>
                                ))}
                                <span className="text-[8px] text-wool-200/40 font-mono ml-1">{msg.replies.length} replies</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}

                  {state.teamChat.filter(m => (m.channel || "#general") === activeChannel).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-xs text-wool-200/30 font-mono">No messages in {activeChannel} yet.</p>
                      <p className="text-[10px] text-wool-200/20 font-mono mt-1">Be the first to say something!</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Interactive Chat Input Area */}
              <div className="relative mt-4">
                
                {/* Active attachment indicator */}
                {selectedFileReference && (
                  <div className="absolute bottom-full left-2 mb-2 p-1.5 bg-caramel-500/10 border border-caramel-500/25 rounded-lg text-[9px] text-wool-100 flex items-center gap-2 animate-fade-in shadow-md">
                    <span className="text-xs">📎</span>
                    <span className="truncate max-w-[150px] font-mono leading-none">
                      Attached: {selectedFileReference.title || selectedFileReference.name}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedFileReference(null)}
                      className="text-wool-200/50 hover:text-wool hover:bg-caramel-500/20 rounded p-0.5 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}

                {/* File picker selection container */}
                {showFileAttachMenu && (
                  <div className="absolute bottom-full mb-2 right-2 left-2 z-40 bg-burgundy-950 border border-caramel-500/30 rounded-xl p-3 shadow-2xl animate-fade-in text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-caramel-500/10 mb-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-caramel flex items-center gap-1.5">
                        <Paperclip size={12} /> Reference File from Media Lab
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowFileAttachMenu(false)}
                        className="text-wool-200/30 hover:text-wool-100 transition p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {/* List featured assets */}
                      <span className="text-[9px] text-wool-200/30 uppercase font-mono block">Featured Assets:</span>
                      {(state.mediaLab.featured || []).map((file: any) => (
                        <div 
                          key={file.id}
                          onClick={() => {
                            setSelectedFileReference(file);
                            setShowFileAttachMenu(false);
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#52130C]/40 border border-caramel-500/10 hover:border-caramel-500/20 hover:bg-[#52130C]/75 cursor-pointer transition text-left"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs">📂</span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-wool-100 truncate leading-none">{file.title}</div>
                              <span className="text-[8px] text-caramel-400 font-mono uppercase">{file.type || "Design File"}</span>
                            </div>
                          </div>
                          <span className="text-[8px] bg-caramel-500/10 text-caramel px-1.5 py-0.5 rounded uppercase font-mono">Select</span>
                        </div>
                      ))}

                      {/* List user-uploaded files */}
                      {state.mediaLab.userUploads && state.mediaLab.userUploads.length > 0 && (
                        <>
                          <span className="text-[9px] text-wool-200/30 uppercase font-mono block pt-1.5">Your Uploads:</span>
                          {state.mediaLab.userUploads.map((file: any) => (
                            <div 
                              key={file.id}
                              onClick={() => {
                                setSelectedFileReference(file);
                                setShowFileAttachMenu(false);
                              }}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#52130C]/40 border border-caramel-500/10 hover:border-caramel-500/20 hover:bg-[#52130C]/75 cursor-pointer transition text-left"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs">📄</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-wool-100 truncate leading-none">{file.name}</div>
                                  <span className="text-[8px] text-wool-200/40 font-mono">{file.size}</span>
                                </div>
                              </div>
                              <span className="text-[8px] bg-caramel-500/10 text-caramel px-1.5 py-0.5 rounded uppercase font-mono">Select</span>
                            </div>
                          ))}
                        </>
                      )}

                      {(!state.mediaLab.featured || state.mediaLab.featured.length === 0) && (!state.mediaLab.userUploads || state.mediaLab.userUploads.length === 0) && (
                        <div className="text-center py-4 text-[10px] text-wool-100/20 font-mono">No Media assets uploaded. Go to Media Lab to upload.</div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="pt-2 border-t border-caramel-500/10 flex flex-col gap-2">
                  <div className="relative">
                    <textarea 
                      className="w-full bg-burgundy-950 border border-caramel-500/10 focus:border-caramel-500/30 rounded-xl p-3 text-xs text-wool-100 focus:outline-none focus:ring-1 focus:ring-caramel-500/40 transition placeholder-wool-200/30 h-16 resize-none pr-10"
                      placeholder={`Post, announce or reference files on ${activeChannel}...`}
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    
                    <div className="absolute bottom-2.5 right-2 px-1 flex gap-1.5 items-center">
                      <button 
                        type="button"
                        title="Add reference file from Media Lab"
                        onClick={() => setShowFileAttachMenu(!showFileAttachMenu)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition border ${
                          showFileAttachMenu 
                            ? "bg-caramel text-burgundy-950 border-caramel" 
                            : "bg-[#52130C]/65 text-caramel border-caramel-500/10 hover:border-caramel-500/30"
                        }`}
                      >
                        <Paperclip size={12} />
                      </button>

                      <button 
                        type="submit"
                        className="w-7 h-7 bg-caramel hover:bg-caramel-400 transition text-burgundy-950 rounded-lg flex items-center justify-center shadow-md cursor-pointer"
                      >
                        <Send size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] text-wool-200/40 uppercase font-mono px-1">
                    <label className="flex items-center gap-1 cursor-pointer select-none text-caramel hover:text-caramel-300">
                      <input 
                        type="checkbox" 
                        className="accent-caramel rounded w-2.5 h-2.5 pointer-events-auto"
                        checked={isAnnouncement}
                        onChange={e => setIsAnnouncement(e.target.checked)}
                      />
                      <span>Pin as Announcement</span>
                    </label>
                    <span>Press Enter to send</span>
                  </div>

                </form>

              </div>

            </div>

            {/* COLUMN B: Pinned Thread replies (Only visible if activeThreadMessage contains a value) */}
            {activeThreadMessage && (
              <div className="xl:col-span-6 flex flex-col justify-between h-full bg-burgundy-950/25 p-3 rounded-2xl border border-caramel-500/10 animate-fade-in">
                
                <div>
                  <div className="flex justify-between items-center border-b border-caramel-500/10 pb-2.5 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-caramel uppercase font-accent tracking-wider">Thread Discussion</span>
                      <span className="text-[8px] bg-wine-red text-wool-200 font-mono px-1.5 rounded-full uppercase leading-none">Replies</span>
                    </div>
                    
                    <button 
                      onClick={() => setActiveThreadMessage(null)}
                      className="text-wool-200/30 hover:text-wool-100 p-1 rounded-lg hover:bg-wine-red/20 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Seed statement card */}
                  <div className="p-3 bg-burgundy-950/40 rounded-xl mb-3.5 border border-caramel-500/5 text-left text-xs text-wool-200/90 flex gap-2 items-start relative">
                    <div className="w-6 h-6 rounded-full bg-burgundy-800 border border-caramel-500/10 flex items-center justify-center font-bold text-[10px] uppercase text-wool-100 flex-shrink-0">
                      {activeThreadMessage.sender[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-wool-100 leading-none">{activeThreadMessage.sender}</span>
                        <span className="text-[8px] text-wool-200/40 font-mono">{activeThreadMessage.time}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-wool-200">{activeThreadMessage.text}</p>
                    </div>
                  </div>

                  {/* Replies output list */}
                  <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                    {activeThreadMessage.replies && activeThreadMessage.replies.length > 0 ? (
                      activeThreadMessage.replies.map((rep: any) => (
                        <div key={rep.id} className="flex gap-2 items-start pl-4 relative">
                          {/* Thread guide indicators */}
                          <div className="absolute top-0 bottom-0 left-2.5 w-[1px] bg-caramel-500/15" />
                          <div className="absolute top-2.5 left-2.5 w-1.5 h-[1px] bg-caramel-500/15" />
                          
                          <div className="w-5 h-5 rounded-full bg-wine-red border border-caramel-500/5 flex items-center justify-center font-bold text-[9px] uppercase text-wool-100 flex-shrink-0 z-10">
                            {rep.sender[0]}
                          </div>

                          <div className="flex-1 min-w-0 bg-burgundy-950/20 p-2 rounded-xl border border-transparent hover:border-caramel-500/5">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[10px] font-semibold text-wool-100">{rep.sender}</span>
                              <span className="text-[8px] text-wool-200/30 font-mono">{rep.time}</span>
                            </div>
                            <p className="text-[11.5px] leading-relaxed text-wool-200/80 font-light">{rep.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-[10px] text-wool-200/30 font-mono">No replies in this thread yet.</p>
                        <p className="text-[9px] text-wool-200/20 font-mono">Start the conversation below.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Reply composer */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-caramel-500/10 mt-3">
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-burgundy-950 border border-caramel-500/10 focus:border-caramel-500/30 rounded-lg pl-3 pr-10 py-2 text-[11px] text-wool-100 placeholder-wool-200/20 focus:outline-none"
                      placeholder="Type threaded reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="absolute right-1 text-burgundy-950 top-1/2 -translate-y-1/2 w-7 h-7 bg-caramel hover:bg-caramel-400 rounded-md flex items-center justify-center transition"
                    >
                      <Send size={10} />
                    </button>
                  </div>
                  <div className="text-[8px] text-wool-200/30 font-mono mt-1 text-right">Press Enter to send reply</div>
                </form>

              </div>
            )}

          </div>

        </Card>
      </div>

      {/* ── CREATE TASK MODAL DIALOG ── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative glass-panel p-6 rounded-2xl max-w-sm w-full border border-caramel-500/30 text-left shadow-2xl flex flex-col gap-4">
            <h3 className="font-display font-bold text-base text-wool-100">Add New Kanban Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-caramel-400 mb-1.5 uppercase font-mono">Task Name / Deliverable</label>
                <input 
                  type="text"
                  className="w-full bg-burgundy-950 border border-caramel-500/10 p-2.5 rounded-lg text-xs focus:outline-none focus:border-caramel-500/30 text-wool-100 placeholder-wool-100/20"
                  placeholder="e.g. Design UI components"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-caramel-400 mb-1.5 uppercase font-mono">Select Kanban Column</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["todo", "inProgress", "done"].map(c => (
                    <div 
                      key={c}
                      onClick={() => setTaskColumn(c as any)}
                      className={`p-2 rounded-lg border cursor-pointer text-center capitalize font-bold text-[10px] ${
                        taskColumn === c 
                          ? "bg-wine-red text-wool-100 border-caramel-500/50" 
                          : "bg-burgundy-950 border-caramel-500/10 text-wool-200/40 hover:border-caramel-500/30"
                      }`}
                    >
                      {c === "inProgress" ? "Working" : c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button variant="caramel" size="sm" type="submit">Submit Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </>
  );
};
