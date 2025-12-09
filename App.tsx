
import React, { useState, useEffect, useRef } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { TagList } from './components/TagList';
import { ArtGallery } from './components/ArtGallery';
import { Tag } from './types';
import { generateId, extractWebVideoUrl, fileToBase64 } from './utils';
import { Upload, Film, Link as LinkIcon, AlertCircle, ArrowRight, Home, Edit2, ArrowLeft, RefreshCw, FileVideo, Images } from 'lucide-react';
import { Button } from './components/Button';
import { StorageService, ProjectState } from './services/storage';
import { ProjectList } from './components/ProjectList';
import { FrameData } from './services/gemini';

// Custom WeChat Icon Component
const WechatIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 1024 1024" 
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        p-id="2990" 
        className={className}
        fill="currentColor"
    >
        <path d="M996.427776 623.853568c0-139.354112-138.063872-251.815936-291.87072-251.815936-162.281472 0-290.656256 112.461824-290.656256 251.815936 0 139.352064 128.374784 251.807744 290.656256 251.807744 35.119104 0 69.031936-11.001856 104.148992-18.331648l92.043264 52.559872-24.2176-88.014848c67.821568-50.122752 119.896064-119.791616 119.896064-198.02112z m-386.338816-45.24032c-16.95744 0-33.906688-15.890432-33.906688-31.77472 0-19.562496 16.95744-35.446784 33.906688-35.446784 25.438208 0 43.599872 15.890432 43.599872 35.446784 0.002048 15.884288-18.161664 31.77472-43.599872 31.77472z m190.144512 0c-18.167808 0-33.910784-15.890432-33.910784-31.77472 0-19.562496 15.745024-35.446784 33.910784-35.446784 24.219648 0 42.387456 15.890432 42.387456 35.446784 0 15.884288-18.169856 31.77472-42.387456 31.77472z" fill="currentColor" p-id="2991"></path>
        <path d="M683.97056 352.48128c9.68704 0 20.588544 1.216512 32.700416 3.672064-29.063168-141.809664-178.03264-242.044928-345.155584-242.044928-188.925952 0-343.943168 127.127552-343.943168 293.373952 0 94.130176 50.868224 171.145216 136.855552 232.25344l-35.131392 105.132032 122.318848-62.347264c42.385408 12.232704 75.087872 19.562496 119.90016 19.562496 9.68704 0 20.594688 0 30.27968-1.216512-6.053888-24.45312-9.684992-47.681536-9.684992-73.34912 0-150.355968 127.156224-275.03616 291.86048-275.03616z m-185.2928-91.686912c26.64448 0 43.599872 15.890432 43.599872 42.78272 0 25.675776-16.955392 42.784768-43.599872 42.784768-25.432064 0-49.657856-17.1008-49.657856-42.784768 0-26.894336 24.225792-42.78272 49.657856-42.78272z m-239.794176 85.573632c-25.432064 0-52.076544-17.115136-52.076544-42.79296 0-26.894336 26.64448-42.78272 52.076544-42.78272 24.223744 0 43.599872 15.890432 43.599872 42.78272 0 25.677824-19.376128 42.79296-43.599872 42.79296z" fill="currentColor" p-id="2992"></path>
    </svg>
);

// Custom Github Icon Component
const GithubIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 1024 1024" 
        className={className} 
        fill="currentColor"
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M511.542857 14.057143C228.914286 13.942857 0 242.742857 0 525.142857 0 748.457143 143.2 938.285714 342.628571 1008c26.857143 6.742857 22.742857-12.342857 22.742858-25.371429v-88.571428c-155.085714 18.171429-161.371429-84.457143-171.771429-101.6C172.571429 756.571429 122.857143 747.428571 137.714286 730.285714c35.314286-18.171429 71.314286 4.571429 113.028571 66.171429 30.171429 44.685714 89.028571 37.142857 118.857143 29.714286 6.514286-26.857143 20.457143-50.857143 39.657143-69.485715-160.685714-28.8-227.657143-126.857143-227.657143-243.428571 0-56.571429 18.628571-108.571429 55.2-150.514286-23.314286-69.142857 2.171429-128.342857 5.6-137.142857 66.4-5.942857 135.428571 47.542857 140.8 51.771429 37.714286-10.171429 80.8-15.542857 129.028571-15.542858 48.457143 0 91.657143 5.6 129.714286 15.885715 12.914286-9.828571 76.914286-55.771429 138.628572-50.171429 3.314286 8.8 28.228571 66.628571 6.285714 134.857143 37.028571 42.057143 55.885714 94.514286 55.885714 151.2 0 116.8-67.428571 214.971429-228.571428 243.314286a145.714286 145.714286 0 0 1 43.542857 104v128.571428c0.914286 10.285714 0 20.457143 17.142857 20.457143 202.4-68.228571 348.114286-259.428571 348.114286-484.685714 0-282.514286-229.028571-511.2-511.428572-511.2z" p-id="2005"></path></svg>
);

export default function App() {
  // Project State
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [projectList, setProjectList] = useState<ProjectState[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Restoration State
  const [sourceType, setSourceType] = useState<'local' | 'web' | 'images'>('local');
  const [originalSource, setOriginalSource] = useState<string>('');
  const [isVideoMissing, setIsVideoMissing] = useState(false);
  const [isReloaderLoading, setIsReloaderLoading] = useState(false);

  // Loaded Source Frames for Image Mode
  const [loadedSourceFrames, setLoadedSourceFrames] = useState<FrameData[]>([]);

  const [videoDuration, setVideoDuration] = useState<number>(0);
  // Metadata states
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [videoContent, setVideoContent] = useState<string | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  
  // URL Import State
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Loading State
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchImageInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);

  // Drag State for Image Reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 1. Init: Check URL for projectId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('projectId');
    if (pid) {
      loadProject(pid);
    } else {
      // Load recent projects
      refreshProjectList();
    }
  }, []);

  const refreshProjectList = async () => {
    const list = await StorageService.getAllProjects();
    setProjectList(list);
  };

  // 2. Load Project Logic with Smart Restore
  const loadProject = async (id: string) => {
    setIsLoadingProject(true);
    setIsVideoMissing(false);
    setLoadedSourceFrames([]);
    try {
      const project = await StorageService.getProject(id);
      if (project) {
        setProjectId(project.id);
        setProjectName(project.name || '未命名项目');
        setTags(project.tags || []);
        setVideoTitle(project.name);
        setVideoContent(project.contextDescription || null);
        
        setSourceType(project.sourceType || 'local');
        setOriginalSource(project.originalSource || '');
        setLoadedSourceFrames(project.sourceFrames || []);

        // Smart Video Restoration Logic
        if (project.sourceType === 'images') {
             // Image project, videoUrl is irrelevant/empty
             setVideoUrl(null);
        } else if (project.sourceType === 'web') {
             // For Web: Always try to use existing URL first, but be ready to reload
             // Actually, web links (Bili/XHS) expire fast. Let's try to reload automatically if it's a web source.
             console.log("Restoring Web Project, attempting to refresh link...");
             try {
                // Optimistically set the old URL first so user sees something (if valid)
                // But generally we want to refresh.
                setIsReloaderLoading(true);
                const metadata = await extractWebVideoUrl(project.originalSource);
                setVideoUrl(metadata.url);
                // Update DB with fresh URL
                await StorageService.updateProject(project.id, { videoUrl: metadata.url });
             } catch (e) {
                console.warn("Auto-refresh of web link failed, prompting user retry", e);
                setIsVideoMissing(true);
                setVideoUrl(null); // Clear invalid URL
             } finally {
                setIsReloaderLoading(false);
             }

        } else {
             // For Local: Check if Blob is in DB
             if (project.videoBlob) {
                 console.log("Restoring Local Project from Cached Blob...");
                 const url = URL.createObjectURL(project.videoBlob);
                 setVideoUrl(url);
             } else {
                 console.warn("Local project missing blob.");
                 setVideoUrl(null);
                 setIsVideoMissing(true);
             }
        }

        // Update URL
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('projectId', project.id);
            window.history.replaceState({ path: url.toString() }, '', url.toString());
        } catch (err) {
            console.debug("History API restricted:", err);
        }
      } else {
        console.warn("Project not found");
        setProjectId(null);
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('projectId');
            window.history.replaceState({ path: url.toString() }, '', url.toString());
        } catch (err) {}
        refreshProjectList();
      }
    } catch (e) {
      console.error("Failed to load project", e);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleCreateProject = async (
      url: string, 
      name: string, 
      type: 'local' | 'web' | 'images',
      source: string,
      metadata: any = {},
      blob?: Blob,
      initialFrames: FrameData[] = [],
      initialTags: Tag[] = []
  ) => {
      const newId = generateId();
      const newProject: ProjectState = {
          id: newId,
          name: name,
          videoUrl: url,
          sourceType: type,
          originalSource: source,
          videoBlob: blob, // Store blob if local
          lastUpdated: Date.now(),
          tags: initialTags,
          activeStrategyId: null,
          sourceFrames: initialFrames,
          stepDescriptions: [],
          baseArt: null,
          generatedArt: null,
          avatarImage: null,
          watermarkText: '',
          panelCount: initialFrames.length,
          subPanels: [],
          captionOptions: [],
          selectedCaption: null,
          coverImage: null,
          workflowStep: 'input',
          contextDescription: metadata.content || '',
          customPrompt: '',
          batchJobId: null,
          batchStatus: 'idle',
          viewStep: 1,
          aspectRatio: '9:16'
      };

      await StorageService.saveProject(newProject);
      // Directly set state instead of reloading to avoid double-fetch
      setProjectId(newId);
      setProjectName(name);
      setVideoUrl(url);
      setTags(initialTags);
      setSourceType(type);
      setOriginalSource(source);
      setVideoContent(metadata.content || '');
      setLoadedSourceFrames(initialFrames);
      setIsVideoMissing(false);
      
      try {
        const pageUrl = new URL(window.location.href);
        pageUrl.searchParams.set('projectId', newId);
        window.history.pushState({ path: pageUrl.toString() }, '', pageUrl.toString());
      } catch(e) {}
  };

  const handleBackToDashboard = () => {
    setProjectId(null);
    setVideoUrl(null);
    setTags([]);
    setVideoFile(null);
    setImportUrl('');
    setLoadedSourceFrames([]);
    setIsVideoMissing(false);
    try {
        const url = new URL(window.location.href);
        url.searchParams.delete('projectId');
        window.history.pushState({ path: url.toString() }, '', url.toString());
    } catch (err) {}
    refreshProjectList();
  };

  const handleDeleteProject = async (id: string) => {
      await StorageService.deleteProject(id);
      refreshProjectList();
  };

  // 3. Name Editing
  const handleNameSave = () => {
      setIsEditingName(false);
      if (projectId && projectName.trim()) {
          StorageService.updateProject(projectId, { name: projectName });
      }
  };

  useEffect(() => {
      if (isEditingName && nameInputRef.current) {
          nameInputRef.current.focus();
      }
  }, [isEditingName]);


  // 4. Import Handlers
  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await extractWebVideoUrl(importUrl);
      const name = result.title || `Web Video ${new Date().toLocaleTimeString()}`;
      
      await handleCreateProject(
          result.url, 
          name, 
          'web', 
          importUrl, // Keep original user input as source
          result
      );

      setImportUrl('');
    } catch (err: any) {
      setImportError(err.message || '导入视频失败');
    } finally {
      setIsImporting(false);
    }
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      handleCreateProject(
          url, 
          file.name, 
          'local', 
          file.name,
          {},
          file // Pass the file object (which is a Blob)
      );
      e.target.value = ''; 
    }
  };

  const handleBatchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    try {
        const frameDataList: FrameData[] = [];
        const newTags: Tag[] = [];

        // Convert all files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const base64 = await fileToBase64(file);
            const id = generateId();
            
            frameDataList.push({
                tagId: id,
                timestamp: i, // Dummy timestamp for ordering
                data: base64
            });

            newTags.push({
                id: id,
                timestamp: i,
                label: file.name,
                createdAt: Date.now()
            });
        }

        const name = `图片集 ${new Date().toLocaleTimeString()}`;
        await handleCreateProject(
            '', // No Video URL
            name,
            'images',
            'batch_upload',
            {},
            undefined,
            frameDataList,
            newTags
        );

    } catch (e) {
        console.error("Batch image upload failed", e);
        setImportError("图片导入失败，请重试。");
    } finally {
        setIsImporting(false);
        if (batchImageInputRef.current) batchImageInputRef.current.value = '';
    }
  };

  // 5. Recovery Handlers
  const handleRetryWebLoad = async () => {
      if (!projectId || !originalSource) return;
      
      setIsReloaderLoading(true);
      try {
          const metadata = await extractWebVideoUrl(originalSource);
          setVideoUrl(metadata.url);
          setIsVideoMissing(false);
          await StorageService.updateProject(projectId, { videoUrl: metadata.url });
      } catch (e) {
          alert("重试失败，请检查链接是否有效或网络连接。");
      } finally {
          setIsReloaderLoading(false);
      }
    };

  const handleReuploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && projectId) {
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
          setIsVideoMissing(false);
          // Update DB - intentionally do not overwrite name/tags, just the video
          StorageService.updateProject(projectId, { 
              videoUrl: url,
              videoBlob: file
          });
      }
  };

  const handleAddTag = (timestamp: number) => {
    const newTag: Tag = {
      id: generateId(),
      timestamp,
      createdAt: Date.now(),
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    if (projectId) {
        StorageService.updateProject(projectId, { tags: updatedTags });
    }
  };

  const handleRemoveTag = (id: string) => {
    const updatedTags = tags.filter(tag => tag.id !== id);
    setTags(updatedTags);
    // Remove corresponding sourceFrame if in image mode
    if (sourceType === 'images') {
        const tagToRemove = tags.find(t => t.id === id);
        const updatedFrames = loadedSourceFrames.filter(f => f.tagId !== id);
        setLoadedSourceFrames(updatedFrames);
        if (projectId) {
            StorageService.updateProject(projectId, { tags: updatedTags, sourceFrames: updatedFrames });
        }
    } else {
        if (projectId) {
            StorageService.updateProject(projectId, { tags: updatedTags });
        }
    }
  };

  const handleImportTags = (importedTags: Tag[]) => {
    const updatedTags = [...tags, ...importedTags];
    setTags(updatedTags);
    if (projectId) {
        StorageService.updateProject(projectId, { tags: updatedTags });
    }
  };

  const handleJumpToTag = (timestamp: number) => {
    const event = new CustomEvent('jump-to-timestamp', { detail: timestamp });
    window.dispatchEvent(event);
  };

  const updateProjectName = (newName: string) => {
      setProjectName(newName);
  };

  // 6. Drag and Drop Handlers for Image Reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFrames = [...loadedSourceFrames];
    const [movedItem] = newFrames.splice(draggedIndex, 1);
    newFrames.splice(dropIndex, 0, movedItem);

    // Re-assign timestamps/indices to maintain order logic (0, 1, 2...)
    const reorderedFrames = newFrames.map((f, i) => ({ ...f, timestamp: i }));

    // Re-sync tags to match the new frame order
    const reorderedTags: Tag[] = [];
    reorderedFrames.forEach(f => {
       const t = tags.find(tag => tag.id === f.tagId);
       if (t) {
           reorderedTags.push({ ...t, timestamp: f.timestamp });
       }
    });

    setLoadedSourceFrames(reorderedFrames);
    setTags(reorderedTags);

    if (projectId) {
        StorageService.updateProject(projectId, { 
            sourceFrames: reorderedFrames, 
            tags: reorderedTags 
        });
    }
    setDraggedIndex(null);
  };

  // --- RENDER ---

  // 1. Dashboard View
  if (!projectId) {
      return (
        <div className="min-h-screen bg-slate-950 text-white overflow-y-auto custom-scrollbar">
            {/* Simple Header */}
            <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 sticky top-0 z-20 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Film className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">ClipSketch AI</h1>
                </div>
                
                <div className="flex items-center gap-4">
                     {/* WeChat Group QR Code */}
                    <div className="relative group">
                        <button className="text-slate-400 hover:text-green-500 transition-colors flex items-center justify-center pt-1" title="微信交流群">
                            <WechatIcon className="w-6 h-6" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0">
                             <img src="https://kid-prj-oss.oss-cn-beijing.aliyuncs.com/clipsketch/wechat-qrcode.JPG" alt="微信群二维码" className="w-full h-auto rounded-lg shadow-inner border border-slate-100" />
                             <p className="text-center text-xs text-slate-600 mt-2 font-medium">扫码加入微信群</p>
                        </div>
                    </div>

                    <a 
                        href="https://github.com/RanFeng/clipsketch-ai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                        title="View on GitHub"
                    >
                        <GithubIcon className="w-6 h-6" />
                    </a>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Import/Create Section */}
                <div className="max-w-2xl w-full mx-auto">
                    <div className="p-6 md:p-8 border border-slate-800 rounded-2xl bg-slate-900 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold text-white">开始新创作</h3>
                            </div>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                            支持 <span className="text-pink-400 font-medium">小红书</span>、<span className="text-blue-400 font-medium">Bilibili</span> 或 <span className="text-purple-500 font-medium">Instagram</span> 链接。
                            </p>
                        </div>

                        <form onSubmit={handleUrlImport} className="mt-6">
                            <div className="flex flex-col gap-4">
                            <textarea
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                placeholder="在此粘贴视频链接 (支持小红书、Bilibili、Instagram)..."
                                className="w-full h-20 bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none text-sm font-normal custom-scrollbar"
                            />
                            
                            <Button 
                                type="submit"
                                disabled={isImporting || !importUrl.trim()}
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-none shadow-lg shadow-indigo-500/20 rounded-xl transition-all"
                            >
                                {isImporting ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    创建项目中...
                                </span>
                                ) : (
                                <span className="flex items-center gap-2">
                                    创建项目 <ArrowRight className="w-5 h-5" />
                                </span>
                                )}
                            </Button>
                            </div>
                            
                            {importError && (
                            <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                <span className="leading-relaxed">{importError}</span>
                            </div>
                            )}
                        </form>

                        <div className="flex items-center gap-4 my-6">
                            <div className="h-px bg-slate-800 flex-1"></div>
                            <span className="text-xs text-slate-500 font-medium">或者</span>
                            <div className="h-px bg-slate-800 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleLocalFileUpload} 
                                accept="video/*" 
                                className="hidden" 
                            />
                            <Button 
                                type="button"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-12 border-dashed border-2 border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:border-indigo-500 hover:bg-slate-800 transition-all"
                            >
                                <Upload className="w-5 h-5 mr-2" />
                                导入本地视频
                            </Button>

                            <input 
                                type="file" 
                                ref={batchImageInputRef} 
                                onChange={handleBatchImageUpload} 
                                accept="image/*" 
                                multiple
                                className="hidden" 
                            />
                            <Button 
                                type="button"
                                variant="secondary"
                                onClick={() => batchImageInputRef.current?.click()}
                                className="w-full h-12 border-dashed border-2 border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:border-indigo-500 hover:bg-slate-800 transition-all"
                            >
                                <Images className="w-5 h-5 mr-2" />
                                批量导入图片
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Recent Projects List */}
                <ProjectList 
                    projects={projectList}
                    onSelectProject={loadProject}
                    onDeleteProject={handleDeleteProject}
                />
            </div>
        </div>
      );
  }

  // 2. Project Editor View
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-900 overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[55vh] lg:h-full min-w-0 shrink-0 lg:shrink-1 border-b lg:border-b-0 lg:border-r border-slate-800">
        
        {/* Header - Project Mode */}
        <header className="px-4 py-3 border-b border-slate-800 flex items-center gap-3 bg-slate-950 shrink-0 z-20 relative justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackToDashboard}
                className="w-8 h-8 text-slate-400 hover:text-white"
                title="返回首页"
             >
                <ArrowLeft className="w-5 h-5" />
             </Button>

             <div className="w-px h-6 bg-slate-800"></div>

             {/* Project Title (Editable) */}
             <div className="flex items-center gap-2 group min-w-0">
                 {isEditingName ? (
                     <input
                        ref={nameInputRef}
                        type="text"
                        value={projectName}
                        onChange={(e) => updateProjectName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                        className="bg-slate-800 text-white px-2 py-1 rounded text-base font-bold outline-none border border-indigo-500 min-w-[200px]"
                     />
                 ) : (
                     <h1 
                        className="text-base lg:text-lg font-bold text-white tracking-tight truncate cursor-pointer hover:text-indigo-300 transition-colors flex items-center gap-2"
                        onClick={() => setIsEditingName(true)}
                        title="点击重命名"
                     >
                        {projectName}
                        <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
                     </h1>
                 )}
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {sourceType === 'images' && (
                 <span className="text-xs bg-indigo-900/30 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">图片模式</span>
             )}
             <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
                 ID: {projectId?.slice(0,6)}
             </div>
          </div>
        </header>

        {/* Video Area / Image Grid */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden min-h-0">
          {isReloaderLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80">
                   <div className="text-center">
                       <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                       <p className="text-slate-300 text-sm">正在重新加载视频资源...</p>
                   </div>
              </div>
          )}
          
          {sourceType === 'images' ? (
              // Image Grid View for Batch Import with Drag and Drop
              <div className="w-full h-full bg-slate-900 p-4 overflow-y-auto custom-scrollbar">
                  {loadedSourceFrames.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {loadedSourceFrames.map((frame, idx) => (
                              <div 
                                key={frame.tagId || idx} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={(e) => handleDrop(e, idx)}
                                className={`relative aspect-[9/16] bg-slate-950 rounded-lg overflow-hidden border transition-all duration-200 group cursor-move
                                    ${draggedIndex === idx 
                                        ? 'border-indigo-500 opacity-40 scale-95 ring-2 ring-indigo-500/50' 
                                        : 'border-slate-800 hover:border-slate-600 hover:shadow-lg'}`}
                              >
                                  <img src={frame.data} alt={`Uploaded ${idx}`} className="w-full h-full object-cover pointer-events-none" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center backdrop-blur-sm pointer-events-none">
                                      <span className="text-[10px] text-slate-300">图 {idx + 1}</span>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1 pointer-events-none">
                                      <Edit2 className="w-3 h-3 text-white" />
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500">
                          <Images className="w-12 h-12 mb-3 opacity-20" />
                          <p>暂无图片</p>
                      </div>
                  )}
              </div>
          ) : (
              // Video Player Logic
              videoUrl && !isVideoMissing ? (
                <VideoPlayer 
                  src={videoUrl} 
                  onTag={handleAddTag} 
                  overrideDuration={videoDuration > 0 ? videoDuration : undefined}
                />
              ) : (
                 <div className="text-center text-slate-400 p-8 max-w-md bg-slate-900/50 rounded-xl border border-slate-800">
                     <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                     <p className="text-lg font-medium text-slate-200 mb-2">视频资源失效或丢失</p>
                     
                     {sourceType === 'local' ? (
                         <div className="flex flex-col items-center">
                             <p className="text-sm text-slate-500 mb-4">
                                 这是本地文件项目。为了继续编辑，请重新选择原始视频文件。
                             </p>
                             <input 
                                 type="file" 
                                 ref={reuploadInputRef}
                                 onChange={handleReuploadLocal}
                                 accept="video/*"
                                 className="hidden"
                             />
                             <Button onClick={() => reuploadInputRef.current?.click()}>
                                 <FileVideo className="w-4 h-4 mr-2" />
                                 重新上传文件
                             </Button>
                         </div>
                     ) : (
                         <div className="flex flex-col items-center">
                             <p className="text-sm text-slate-500 mb-4">
                                 原链接已过期或失效。点击下方按钮尝试重新解析分享链接。
                             </p>
                             <Button onClick={handleRetryWebLoad} disabled={isReloaderLoading}>
                                 <RefreshCw className={`w-4 h-4 mr-2 ${isReloaderLoading ? 'animate-spin' : ''}`} />
                                 重新加载链接
                             </Button>
                             <p className="text-xs text-slate-600 mt-3 break-all px-4">
                                 {originalSource}
                             </p>
                         </div>
                     )}
                 </div>
              )
          )}
        </div>
      </div>

      {/* Sidebar - Tag List */}
      <div className="h-[45vh] lg:h-full lg:w-96 shrink-0 bg-slate-900">
        <TagList 
          tags={tags} 
          videoUrl={videoUrl}
          sourceType={sourceType}
          onRemoveTag={handleRemoveTag} 
          onJumpToTag={handleJumpToTag}
          onClearTags={() => {
              setTags([]);
              if (sourceType === 'images') {
                  setLoadedSourceFrames([]);
                  if(projectId) StorageService.updateProject(projectId, { tags: [], sourceFrames: [] });
              } else {
                  if(projectId) StorageService.updateProject(projectId, { tags: [] });
              }
          }}
          onGenerateArt={() => setShowGallery(true)}
          onImportTags={handleImportTags}
        />
      </div>

      {/* Art Gallery Overlay */}
      {showGallery && projectId && (
        <ArtGallery 
          tags={tags} 
          videoUrl={videoUrl || ''} // Fallback for safety, though frames likely cached in project
          projectId={projectId} // Pass Project ID for persistence
          videoTitle={projectName}
          videoContent={videoContent || undefined}
          onClose={() => setShowGallery(false)} 
        />
      )}
    </div>
  );
}
