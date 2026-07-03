import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Upload, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Search, 
  Trash2, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Languages, 
  Moon, 
  UserPlus, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  MapPin, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Info,
  Leaf,
  Cpu
} from "lucide-react";
import { translations } from "./translations";
import { regionalWeather, defaultWeather } from "./weatherData";
import { cropSamples } from "./samples";
import { User, DiagnosisResult, ScanRecord, ChatMessage, WeatherInfo, Language, Theme } from "./types";

export default function App() {
  // 1. Language & Theme States
  const [lang, setLang] = useState<Language>("sw");
  const [theme, setTheme] = useState<Theme>("dark");

  // 2. Auth States
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("plantdoctor_users");
    if (saved) return JSON.parse(saved);
    // Seed an initial test user
    return [{
      id: "1",
      email: "mkulima@gmail.com",
      fullName: "Juma Said",
      location: "Morogoro",
      createdAt: new Date().toISOString()
    }];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("plantdoctor_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Landing Page Interactive States
  const [viewingLanding, setViewingLanding] = useState(true);
  const [previewSelectedSample, setPreviewSelectedSample] = useState<any>(cropSamples[0]);
  const [activePreviewTab, setActivePreviewTab] = useState<"immediate" | "organic" | "chemical" | "prevent">("immediate");
  const [previewSelectedChatIndex, setPreviewSelectedChatIndex] = useState<number | null>(null);

  const previewChatQuestions = [
    {
      qSw: "Njia gani bora ya kupambana na viwavi jeshi wa mahindi?",
      qEn: "What is the best way to fight fall armyworms in maize?",
      aSw: "1. **Tiba ya Kiasili**: Nyunyizia mchanganyiko wa mafuta ya mwarobaini (Neem Oil) au ponda majani ya mwarobaini na kuloweka kwenye maji kwa masaa 24 kisha upige chujio. Pia unaweza kuweka mchanga mwepesi au majivu ya jikoni kwenye kitovu cha mmea wa mahindi mchanga.\n2. **Tiba ya Kemikali**: Tumia dawa zenye viambata hai kama *Emamectin Benzoate* (mf. Escort, Spitfire) kwa kiasi cha 10ml kwenye bomba la lita 20. Puliza jioni wakati wadudu wanapoanza kula.",
      aEn: "1. **Organic Solution**: Spray Neem Oil extract or make a suspension by crushing neem leaves, soaking them in water for 24 hours, and filtering. You can also place wood ash or fine sand into the maize leaf whorls to kill young caterpillars.\n2. **Chemical Control**: Use insecticides containing *Emamectin Benzoate* (e.g., Spitfire) at 10ml per 20L sprayer pump. Spray during late afternoon or evening when armyworms are active and feeding."
    },
    {
      qSw: "Jinsi ya kuboresha rutuba ya udongo wa mfinyanzi?",
      qEn: "How do I improve clay soil fertility?",
      aSw: "1. **Weka Mbolea ya Samadi**: Weka mbolea ya samadi iliyooza vizuri au mboji kwa wingi. Hii inasaidia kufanya udongo kuwa na nafasi za hewa na maji kupita vizuri.\n2. **Badilisha Mazao**: Panda mazao ya jamii ya kunde (kama maharage au njegere) ili kuongeza nitrojeni asilia kwenye udongo na kuboresha mfumo wa udongo.",
      aEn: "1. **Apply Well-Rotted Manure**: Incorporate generous amounts of organic compost or decomposed farmyard manure. This loosens clay soil, improving drainage and aeration.\n2. **Crop Rotation**: Grow leguminous cover crops (like beans, cowpeas, or alfalfa) which naturally fix nitrogen and improve soil structural aggregation."
    },
    {
      qSw: "Nyanya zinapooza chini madoa meusi husababishwa na nini?",
      qEn: "What causes black rotten spots on the bottom of tomatoes?",
      aSw: "Hali hii inajulikana kama **Blossom End Rot** (Kuoza kwa Kitako cha Tunda). Sio ugonjwa wa ukungu, bali husababishwa na:\n1. **Ukosefu wa madini ya Chokaa (Calcium)** kwenye udongo au mmea kushindwa kuyasafirisha.\n2. **Maji kutokuwa na usawa**: Kumwagilia bila ratiba thabiti (mara udongo unakauka sana, mara unalowa sana).\n\n**Tiba**: Wagilia mara kwa mara kwa usawa thabiti, na weka mbolea ya chokaa (Calcium Ammonium Nitrate - CAN) au majivu ya mbao kwenye udongo.",
      aEn: "This condition is known as **Blossom End Rot**:\n1. **Calcium Deficiency**: Caused by a lack of calcium in the soil or the plant's inability to absorb it.\n2. **Irregular Watering**: Soil moisture fluctuating wildly between bone-dry and waterlogged.\n\n**Cure**: Establish a consistent irrigation schedule, and apply calcium-rich fertilizers (like CAN) or agricultural lime to the root zone."
    }
  ];

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    fullName: "",
    location: "Morogoro"
  });
  const [authError, setAuthError] = useState("");

  // 3. App Feature States
  const [activeTab, setActiveTab] = useState<"home" | "history" | "chat">("home");
  const [weatherRegion, setWeatherRegion] = useState("morogoro");
  const [farmerNotes, setFarmerNotes] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null);

  // States for immersive diagnosis loading effect
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const diagnosisStepsSw = [
    "Inapakia picha ya jani kwa ajili ya uchambuzi wa kina...",
    "Inachambua aina ya mmea na muundo wa majani ya zao...",
    "Inakagua alama za magonjwa na uwepo wa bakteria...",
    "Inalinganisha na kanzi-data ya magonjwa ya mimea ya AI...",
    "Inaandaa ushauri sahihi wa dawa na matibabu ya kiasili..."
  ];

  const diagnosisStepsEn = [
    "Uploading leaf photo for comprehensive server analysis...",
    "Identifying plant species and foliage health patterns...",
    "Scanning leaf surface for pathogens and infections...",
    "Cross-referencing with global plant disease pathology database...",
    "Compiling recommended organic remedies and market chemicals..."
  ];

  useEffect(() => {
    let stepInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isAnalyzing) {
      setLoadingStep(0);
      setLoadingProgress(0);

      // Cycle steps smoothly every 1.5 seconds
      stepInterval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1500);

      // Ticking up loading progress smoothly
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 96) {
            const increment = prev < 50 ? 6 : prev < 80 ? 3 : 1;
            return prev + increment;
          }
          return prev;
        });
      }, 100);
    } else {
      setLoadingStep(0);
      setLoadingProgress(0);
    }

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isAnalyzing]);

  // 4. Saved Scans History
  const [scans, setScans] = useState<ScanRecord[]>(() => {
    const saved = localStorage.getItem("plantdoctor_scans");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScanDetails, setSelectedScanDetails] = useState<ScanRecord | null>(null);

  // 5. Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("plantdoctor_chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Refs for media device
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const t = translations[lang];

  // Save data state changes
  useEffect(() => {
    localStorage.setItem("plantdoctor_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("plantdoctor_current_user", JSON.stringify(currentUser));
      // Set default weather region to user's registered location if supported
      const locLower = currentUser.location.toLowerCase().trim();
      if (regionalWeather[locLower]) {
        setWeatherRegion(locLower);
      }
    } else {
      localStorage.removeItem("plantdoctor_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("plantdoctor_scans", JSON.stringify(scans));
  }, [scans]);

  useEffect(() => {
    localStorage.setItem("plantdoctor_chat_messages", JSON.stringify(chatMessages));
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Handle weather info according to region
  const activeWeather: WeatherInfo = regionalWeather[weatherRegion] || defaultWeather;

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      if (authMode === "login") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || t.invalidCredentials);
        }

        const data = await response.json();
        setCurrentUser({ ...data.user, token: data.token });
        setAuthForm({ email: "", password: "", fullName: "", location: "Morogoro" });
      } else {
        if (!authForm.fullName || !authForm.email || !authForm.password) {
          setAuthError(lang === "sw" ? "Tafadhali jaza nafasi zote." : "Please fill in all fields.");
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
            fullName: authForm.fullName,
            location: authForm.location
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || t.emailTaken);
        }

        const data = await response.json();
        setCurrentUser({ ...data.user, token: data.token });
        setAuthForm({ email: "", password: "", fullName: "", location: "Morogoro" });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setAuthError(err.message || (lang === "sw" ? "Imeshindwa kuunganisha kwenye seva." : "Server connection failed."));
    }
  };

  // Demo login has been removed for security — redirect to auth form
  const handleDemoLogin = () => {
    setViewingLanding(false);
    setAuthMode("login");
  };

  // Camera integration
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setErrorMsg(lang === "sw" ? "Imeshindwa kufungua kamera yako." : "Could not open camera.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        setImageMimeType("image/jpeg");
        stopCamera();
      }
    }
  };

  // Drag and drop / Manual file selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit diagnosis request to Server backend
  const handleDiagnose = async () => {
    if (!selectedImage || !imageMimeType) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setCurrentDiagnosis(null);

    try {
      // Remove dataurl prefix to send raw base64 data to backend
      const base64Data = selectedImage.split(",")[1];
      
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: imageMimeType,
          language: lang,
          notes: farmerNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed diagnosis request");
      }

      const result: DiagnosisResult = await response.json();
      setCurrentDiagnosis(result);
    } catch (err: any) {
      console.error("Diagnosis request failed:", err);
      setErrorMsg(err.message || (lang === "sw" ? "Mawasiliano na seva yamefeli. Jaribu tena." : "Connection to the server failed. Try again."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger quick demo from sample plants
  const handleSampleSelect = (sample: typeof cropSamples[0]) => {
    const selectedDiagnosis = lang === "sw" ? sample.diagnosisSw : sample.diagnosisEn;
    setSelectedImage(sample.imageUrl);
    setImageMimeType("image/svg+xml");
    setFarmerNotes(lang === "sw" ? sample.notesSw : sample.notesEn);
    setCurrentDiagnosis(selectedDiagnosis);
    setErrorMsg(null);
  };

  // Save scan result permanently for user
  const handleSaveScan = () => {
    if (!currentUser || !currentDiagnosis || !selectedImage) return;

    const newRecord: ScanRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      imageUrl: selectedImage,
      diagnosis: currentDiagnosis,
      timestamp: new Date().toISOString(),
      farmerNotes: farmerNotes
    };

    setScans(prev => [newRecord, ...prev]);
    alert(t.savedToHistory);
  };

  const handleDeleteScan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === "sw" ? "Je, Una uhakika unataka kufuta rekodi hii?" : "Are you sure you want to delete this scan record?")) {
      setScans(prev => prev.filter(s => s.id !== id));
      if (selectedScanDetails?.id === id) {
        setSelectedScanDetails(null);
      }
    }
  };

  // Chat request
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const historyPayload = chatMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          message: originalInput,
          history: historyPayload,
          language: lang
        })
      });

      if (!response.ok) {
        throw new Error("Chat api request failed");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.reply,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: lang === "sw" 
          ? "Pole sana mkulima, nimeshindwa kuunganishwa kwa sasa. Tafadhali kagua mtandao wako."
          : "Sorry farmer, I couldn't connect right now. Please check your internet connection.",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, modelMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Clear Chat helper
  const handleClearChat = () => {
    if (confirm(lang === "sw" ? "Futa historia yote ya mazungumzo?" : "Clear all chat history?")) {
      setChatMessages([]);
    }
  };

  // Filter scan records belonging only to current user
  const userScans = scans.filter(s => currentUser && s.userId === currentUser.id);
  const filteredScans = userScans.filter(s => {
    const text = searchTerm.toLowerCase();
    return (
      s.diagnosis.plantType.toLowerCase().includes(text) ||
      s.diagnosis.diseaseName.toLowerCase().includes(text)
    );
  });

  // Calculate statistics
  const totalScans = userScans.length;
  const diseasedScans = userScans.filter(s => {
    const dName = s.diagnosis.diseaseName.toLowerCase();
    return !dName.includes("afya") && !dName.includes("healthy") && !dName.includes("none");
  }).length;
  const healthyScans = totalScans - diseasedScans;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === "dark" ? "bg-[#050807] text-slate-100" : "bg-emerald-50/50 text-slate-800"
    }`}>
      
      {/* Background glow effects for Immersive feeling */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>

      {/* Main Header / Top navigation */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-300 ${
        theme === "dark" ? "bg-[#050807]/90 border-green-950/40" : "bg-white/95 border-emerald-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => {
              if (!currentUser) {
                setViewingLanding(true);
              }
            }}
          >
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
              </svg>
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                {t.appName}
              </h1>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Toggle Button */}
            <button 
              onClick={() => setLang(l => l === "sw" ? "en" : "sw")}
              className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-all ${
                theme === "dark" 
                  ? "bg-[#101915] border-green-900/30 text-green-400 hover:bg-[#1a2c22]" 
                  : "bg-emerald-100/60 border-emerald-200 text-emerald-800 hover:bg-emerald-200"
              }`}
              id="language-btn"
              title={t.language}
            >
              <Languages className="w-4 h-4" />
              <span>{lang === "sw" ? "ENG" : "KISW"}</span>
            </button>

            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              className={`p-2 rounded-xl border transition-all ${
                theme === "dark" 
                  ? "bg-[#101915] border-green-900/30 text-yellow-400 hover:bg-[#1a2c22]" 
                  : "bg-emerald-100/60 border-emerald-200 text-slate-700 hover:bg-emerald-200"
              }`}
              id="theme-btn"
              title={t.theme}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser && (
              <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-emerald-800/20">
                <div className="hidden md:block text-right">
                  <p className={`text-xs font-bold leading-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                    {currentUser.fullName}
                  </p>
                  <p className="text-[9px] text-green-500 font-medium">{currentUser.location}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center font-bold text-xs text-black">
                  {currentUser.fullName.charAt(0)}
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setViewingLanding(true);
                    setActiveTab("home");
                    setSelectedScanDetails(null);
                  }}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    theme === "dark" 
                      ? "text-red-400 hover:bg-red-500/10" 
                      : "text-red-700 hover:bg-red-50"
                  }`}
                  id="logout-btn"
                  title={t.logout}
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Conditional Rendering: If not logged in, show beautiful Immersive Auth screen */}
      {!currentUser ? (
        viewingLanding ? (
          /* BREATHTAKING MODERN EXTERNAL LANDING PAGE */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
            {/* HERO SECTION */}
            <div className="relative rounded-3xl overflow-hidden border border-green-950/20 p-8 sm:p-12 md:p-16 bg-gradient-to-tr from-[#050807] via-[#09110d] to-[#040605] shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
              {/* Absolutes for neon glows */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] text-green-400 font-extrabold uppercase tracking-widest">
                      {lang === "sw" ? "SURA MPYA YA KILIMO CHA AI" : "NEXT-GEN AGRICULTURAL AI ENGINE"}
                    </span>
                  </div>
                  
                  <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none ${
                    theme === "dark" ? "text-white" : "text-emerald-950"
                  }`}>
                    {lang === "sw" ? (
                      <>Daktari wa Mimea wa <span className="text-green-500 underline decoration-green-500/30 decoration-wavy">AI</span> Shambani Mwako</>
                    ) : (
                      <>Your Personal <span className="text-green-500 underline decoration-green-500/30 decoration-wavy">AI</span> Crop Doctor</>
                    )}
                  </h1>
                  
                  <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                    {lang === "sw" 
                      ? "Teknolojia ya kisasa ya computer vision na akili mnemba (Gemini) inayokuwezesha kupata majibu, matibabu na ushauri wa kitaalamu wa kuzuia magonjwa ya mimea kwa sekunde chache shambani."
                      : "Empower your farm with cutting-edge computer vision. Identify diseases instantly, receive localized treatment advice, and consult our 24/7 agricultural AI agronomist."}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => {
                        setViewingLanding(false);
                        setAuthMode("login");
                      }}
                      className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{lang === "sw" ? "Ingia / Jisajili" : "Login to Start"}</span>
                    </button>
                    
                    <button
                      onClick={() => setViewingLanding(false)}
                      className={`px-8 py-4 rounded-xl border font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2.5 ${
                        theme === "dark"
                          ? "border-green-950/50 bg-[#0d1612]/40 text-slate-200 hover:bg-[#15241d]/40"
                          : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{lang === "sw" ? "Ingia / Jisajili" : "Login / Register"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-green-950/20">
                    <div>
                      <p className="text-xl font-black text-green-500">98%</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{lang === "sw" ? "Usahihi wa AI" : "AI Accuracy"}</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-green-500">3s</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{lang === "sw" ? "Muda wa Scan" : "Diagnostic Speed"}</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-green-500">24/7</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{lang === "sw" ? "Usaidizi Shambani" : "Expert Agronomist"}</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex justify-center">
                  <div className={`p-6 rounded-2xl border ${
                    theme === "dark" ? "bg-black/40 border-green-950/40" : "bg-emerald-100/10 border-emerald-200/50"
                  } w-full max-w-[380px] shadow-2xl relative overflow-hidden group`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
                    <div className="flex items-center justify-between mb-4 border-b border-green-950/15 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                        <p className="text-[10px] font-black uppercase text-green-500 tracking-wider">Live Scanner Shield</p>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">v2.5_active</span>
                    </div>
                    
                    {/* Simulated scanning leaf */}
                    <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-green-950/30 to-black relative flex items-center justify-center overflow-hidden border border-green-950/20">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
                      <svg className="w-20 h-20 text-green-500/45 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
                      </svg>
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-mono text-green-400 px-2 py-1 rounded border border-green-500/20">
                        Scanning: Leaf_Pathogen_048.jpg
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {lang === "sw" 
                          ? "Kichujio cha Gemini kinalinganisha muundo wa seli za jani na dharura za kilimo..." 
                          : "AI Engine analyzing lesion patterns and surface necrosis index..."}
                      </p>
                      <div className="w-full bg-green-950/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[85%] rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRESENTATION CARDS: 4 MODERN BENTO GRID CARD MODULES */}
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1.5">
                  {lang === "sw" ? "MISINGI YA TEKNOLOJIA" : "CORE TECHNOLOGY MODULES"}
                </p>
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                  {lang === "sw" ? "Sifa za Kisasa za Kila Kadi" : "Modern Pillars of PlantDoctor AI"}
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  {lang === "sw"
                    ? "Tumeunganisha zana nne zenye nguvu katika kiolesura kimoja cha kisasa kukupa uzoefu bora wa kilimo asilia."
                    : "We combined industry-grade visual processing and localized datasets for immediate agronomic action."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CARD 1: Vision scanner */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 ${
                  theme === "dark" 
                    ? "bg-[#0a0f0d] border-green-950/40 hover:border-green-500/30 hover:shadow-[0_10px_35px_rgba(34,197,94,0.06)]" 
                    : "bg-white border-slate-200/70 hover:border-emerald-300 hover:shadow-2xl"
                }`}>
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className={`font-black text-base mb-2.5 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                    {lang === "sw" ? "Utambuzi wa Picha" : "Computer Vision Scanner"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === "sw" 
                      ? "Piga picha ya jani lililoathirika. AI yetu inachambua seli na alama za magonjwa kwa usahihi dhabiti wa hadi 98%."
                      : "Snap any diseased crop leaf. Our proprietary algorithm identifies fungal spots, viral mosaic, and bacterial wilts instantly."}
                  </p>
                </div>

                {/* CARD 2: Remedy Generator */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 ${
                  theme === "dark" 
                    ? "bg-[#0a0f0d] border-green-950/40 hover:border-green-500/30 hover:shadow-[0_10px_35px_rgba(34,197,94,0.06)]" 
                    : "bg-white border-slate-200/70 hover:border-emerald-300 hover:shadow-2xl"
                }`}>
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className={`font-black text-base mb-2.5 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                    {lang === "sw" ? "Ushauri wa Tiba Mbili" : "Dual-Remedy Prescriptions"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === "sw" 
                      ? "Kila ripoti inakuja na matibabu ya asilia (organic) na ya kemikali, pamoja na hatua za dharura na namna ya kuzuia magonjwa baadaye."
                      : "Receive balanced treatment routes: non-toxic botanical treatments for organic farming, alongside standard localized chemical options."}
                  </p>
                </div>

                {/* CARD 3: Agro-Weather Radar */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 ${
                  theme === "dark" 
                    ? "bg-[#0a0f0d] border-green-950/40 hover:border-green-500/30 hover:shadow-[0_10px_35px_rgba(34,197,94,0.06)]" 
                    : "bg-white border-slate-200/70 hover:border-emerald-300 hover:shadow-2xl"
                }`}>
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Sun className="w-6 h-6" />
                  </div>
                  <h3 className={`font-black text-base mb-2.5 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                    {lang === "sw" ? "Hali ya Hewa na Mlipuko" : "Agro-Weather Correlation"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === "sw" 
                      ? "Kuunganisha kiwango cha joto na unyevu wa mkoa wako (mf. Morogoro, Dodoma) kukupa tahadhari ya ukungu au wadudu mapema."
                      : "Correlates local temperature and moisture with pathogen models to warn you of fungal outbreaks before symptoms show."}
                  </p>
                </div>

                {/* CARD 4: AI Chat Bot */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 group hover:-translate-y-1.5 ${
                  theme === "dark" 
                    ? "bg-[#0a0f0d] border-green-950/40 hover:border-green-500/30 hover:shadow-[0_10px_35px_rgba(34,197,94,0.06)]" 
                    : "bg-white border-slate-200/70 hover:border-emerald-300 hover:shadow-2xl"
                }`}>
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className={`font-black text-base mb-2.5 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                    {lang === "sw" ? "Mtaalamu Kilimo AI 24/7" : "Interactive Farm AI Advisor"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === "sw" 
                      ? "Piga mazungumzo na mtaalamu wa kilimo kwa lugha ya Kiswahili au Kiingereza ili kuuliza maswali yote ya kilimo ukiwa shambani."
                      : "Chat anytime with our crop doctor. Get seed choices, soil enrichment tips, and dosage recommendations in natural language."}
                  </p>
                </div>
              </div>
            </div>

            {/* INTERACTIVE COMPONENT: LIVE DIAGNOSIS SIMULATOR PLAYGROUND */}
            <div className={`p-8 rounded-3xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-[#070b09] border-green-950/30 shadow-[0_10px_45px_rgba(0,0,0,0.5)]" 
                : "bg-white border-emerald-100 shadow-2xl"
            }`}>
              <div className="max-w-3xl mx-auto text-center mb-8">
                <div className="inline-flex items-center gap-1.5 mb-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Interactive Playground Simulator</span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                  {lang === "sw" ? "Chagua Zao la Mfano Kuona AI Inavyofanya Kazi" : "Interact with Live Diagnosis Examples"}
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  {lang === "sw" 
                    ? "Bofya zao lolote hapa chini ili kuona namna AI inavyochambua, inavyogundua ugonjwa, na kuandaa matibabu kamili."
                    : "Select any crop sample below to experience real-time pathogen mapping, confidence metrics, and structured treatment routes."}
                </p>
              </div>

              {/* Crop selectors */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                {cropSamples.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setPreviewSelectedSample(sample);
                      setActivePreviewTab("immediate");
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 border ${
                      previewSelectedSample?.id === sample.id
                        ? "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        : theme === "dark"
                          ? "bg-[#0d1310] border-green-950/40 text-slate-300 hover:bg-[#15201a]"
                          : "bg-emerald-50 border-emerald-100 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 bg-current rounded-full"></span>
                    <span>{lang === "sw" ? sample.nameSw : sample.nameEn}</span>
                  </button>
                ))}
              </div>

              {/* Simulated Diagnosis Report Result */}
              {previewSelectedSample && (
                <div className={`rounded-2xl border p-6 transition-all duration-300 text-left ${
                  theme === "dark" ? "bg-[#0a0f0d] border-green-950/45" : "bg-slate-50 border-emerald-100"
                }`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Diagnostic Panel */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#0c120e] border border-green-950/30 flex items-center justify-center relative p-4">
                        <img 
                          src={previewSelectedSample.imageUrl} 
                          alt="Leaf" 
                          className="w-4/5 h-4/5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase px-2 py-1 rounded">
                          {lang === "sw" ? "Magonjwa" : "Infected"}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{lang === "sw" ? "Kiwango cha Uhakika (AI Confidence)" : "Confidence Level"}</span>
                          <span className="text-green-500">{(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).confidence}%</span>
                        </div>
                        <div className="w-full bg-green-950/20 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full" 
                            style={{ width: `${(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).confidence}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{lang === "sw" ? "Kiwango cha Hatari" : "Severity Index"}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            (lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).severity.toLowerCase() === "kali" ||
                            (lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).severity.toLowerCase() === "high"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}></span>
                          <p className={`text-xs font-black uppercase ${
                            (lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).severity.toLowerCase() === "kali" ||
                            (lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).severity.toLowerCase() === "high"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}>
                            {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).severity}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Explanation & Cure Panel */}
                    <div className="lg:col-span-2 space-y-6 text-left">
                      <div>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-wider mb-0.5">
                          {lang === "sw" ? "UGUNDUZI WA LAB" : "LABORATORY DIAGNOSIS REPORT"}
                        </p>
                        <h4 className={`text-lg font-black ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                          {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).diseaseName}
                        </h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).description}
                        </p>
                      </div>

                      {/* Diagnostic Tabs */}
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5 border-b border-green-950/20 pb-3">
                          {[
                            { id: "immediate", labelSw: "Hatua za Awali", labelEn: "First-Steps" },
                            { id: "organic", labelSw: "Dawa ya Asili", labelEn: "Organic Remedy" },
                            { id: "chemical", labelSw: "Dawa ya Kemikali", labelEn: "Chemical Route" },
                            { id: "prevent", labelSw: "Njia za Kinga", labelEn: "Prevention" }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActivePreviewTab(tab.id as any)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                                activePreviewTab === tab.id
                                  ? "bg-green-500/10 text-green-400 border-green-500/40"
                                  : "border-transparent text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {lang === "sw" ? tab.labelSw : tab.labelEn}
                            </button>
                          ))}
                        </div>

                        {/* Tab Content Display */}
                        <div className="min-h-[110px]">
                          {activePreviewTab === "immediate" && (
                            <ul className="space-y-2.5">
                              {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).treatment.immediateActions.map((act: string, idx: number) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                                  <span className="leading-relaxed">{act}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {activePreviewTab === "organic" && (
                            <ul className="space-y-2.5">
                              {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).treatment.organicRemedies.map((rem: string, idx: number) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                                  <span className="leading-relaxed">{rem}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {activePreviewTab === "chemical" && (
                            <ul className="space-y-2.5">
                              {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).treatment.chemicalOptions.map((chem: string, idx: number) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                                  <span className="leading-relaxed">{chem}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {activePreviewTab === "prevent" && (
                            <ul className="space-y-2.5">
                              {(lang === "sw" ? previewSelectedSample.diagnosisSw : previewSelectedSample.diagnosisEn).treatment.preventiveMeasures.map((prev: string, idx: number) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                                  <span className="leading-relaxed">{prev}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INTERACTIVE COMPONENT: CHAT PREVIEW MODULE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>AI Advisor Quick Demo</span>
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                  {lang === "sw" ? "Ongea na Afisa Kilimo AI Shambani" : "Interactive AI Agronomist Consultation"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "sw" 
                    ? "Bofya swali lolote la mfano hapa kulia ili kuona jinsi roboti yetu ya kilimo inavyoweza kutoa miongozo na ushauri wa kitaalamu kwa lugha rahisi kueleweka."
                    : "Test-drive the intelligence. Select an agro-question on the right and watch the model render a deep agricultural feedback."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setViewingLanding(false);
                      setAuthMode("login");
                    }}
                    className="px-6 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                  >
                    {lang === "sw" ? "Ingia Kuanza Chat" : "Login to Open Chat"}
                  </button>
                </div>
              </div>

              {/* Chat preview console */}
              <div className={`p-6 rounded-3xl border ${
                theme === "dark" ? "bg-[#070b09] border-green-950/40" : "bg-white border-emerald-100 shadow-2xl"
              } space-y-4 text-left`}>
                <div className="flex items-center gap-2 border-b border-green-950/10 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xs">
                    PD
                  </div>
                  <div>
                    <h4 className={`text-xs font-black ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {lang === "sw" ? "Mtaalamu Kilimo AI" : "Agronomist AI Expert"}
                    </h4>
                    <span className="text-[9px] text-green-500 font-mono">Agent active</span>
                  </div>
                </div>

                {/* Question options */}
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{lang === "sw" ? "Maswali ya Mfano" : "Select a Sample Query:"}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {previewChatQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewSelectedChatIndex(idx)}
                        className={`p-3 rounded-xl text-xs text-left font-medium transition-all border ${
                          previewSelectedChatIndex === idx
                            ? "bg-green-500/10 border-green-500/40 text-green-400"
                            : theme === "dark"
                              ? "bg-black/30 border-green-950/35 text-slate-300 hover:bg-[#0c130f]"
                              : "bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-emerald-50"
                        }`}
                      >
                        {lang === "sw" ? q.qSw : q.qEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation feed */}
                {previewSelectedChatIndex !== null && (
                  <div className={`p-4 rounded-xl border space-y-3 transition-all duration-300 ${
                    theme === "dark" ? "bg-black/30 border-green-950/30" : "bg-emerald-50/20 border-slate-100"
                  }`}>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-[10px] bg-green-500 text-black font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter shrink-0">YOU</span>
                      <p className="text-slate-300 italic">
                        {lang === "sw" ? previewChatQuestions[previewSelectedChatIndex].qSw : previewChatQuestions[previewSelectedChatIndex].qEn}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-xs pt-2 border-t border-green-950/10">
                      <span className="text-[10px] bg-green-500/15 text-green-400 font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter shrink-0">BOT</span>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-line text-xs font-medium">
                        {lang === "sw" ? previewChatQuestions[previewSelectedChatIndex].aSw : previewChatQuestions[previewSelectedChatIndex].aEn}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CALL TO ACTION ACCENT BOTTOM BANNER */}
            <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden border border-green-950/20 bg-gradient-to-b from-[#050906] to-[#0a110d] shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-[90px] pointer-events-none"></div>
              
              <div className="max-w-xl mx-auto space-y-6 relative z-10">
                <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                  {lang === "sw" ? "Anza Kulinda Mavuno Yako Leo" : "Empower Your Harvest Today"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "sw" 
                    ? "Usiruhusu magonjwa ya kupukutisha mazao kuharibu jasho lako. Jiunge na maelfu ya wakulima wanaotumia PlantDoctor AI kutunza afya ya mazao yao."
                    : "Protect your crops from fungal spots, late blight, and insects. Sign in to start scanning real fields, or explore with a single click."}
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      setViewingLanding(false);
                      setAuthMode("login");
                    }}
                    className="px-8 py-3.5 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    {lang === "sw" ? "Ingia kwenye Mfumo" : "Login to Enter App"}
                  </button>
                  <button
                    onClick={() => {
                      setViewingLanding(false);
                      setAuthMode("register");
                    }}
                    className={`px-6 py-3.5 rounded-xl border font-black uppercase text-xs tracking-wider transition-all ${
                      theme === "dark"
                        ? "border-green-950 text-slate-300 hover:bg-[#0d1612]"
                        : "border-emerald-200 text-emerald-800 bg-white hover:bg-emerald-50"
                    }`}
                  >
                    {lang === "sw" ? "Jisajili Hapa" : "Register Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATION CONTAINER */
          <div className="max-w-md mx-auto px-4 py-16 text-left">
            <div className="mb-4">
              <button
                onClick={() => setViewingLanding(true)}
                className="text-xs font-bold text-green-500 hover:underline flex items-center gap-1.5 uppercase tracking-wider"
              >
                ← {lang === "sw" ? "Rudi Ukurasa Mkuu" : "Back to Home Page"}
              </button>
            </div>
            <div className={`p-8 rounded-3xl shadow-2xl border transition-colors duration-300 ${
              theme === "dark" ? "bg-[#0a0f0d] border-green-900/30" : "bg-white border-emerald-100"
            }`}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
                  </svg>
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                  {authMode === "login" ? t.welcomeBack : t.signUp}
                </h2>
                <p className="text-xs text-slate-400 mt-2">
                  {authMode === "login" ? t.loginSubtitle : t.tagline}
                </p>
              </div>

              {authError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.fullName}</label>
                    <input
                      type="text"
                      required
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      placeholder="e.g. Juma Said"
                      className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                        theme === "dark" 
                          ? "bg-black/30 border-green-950/40 text-white focus:border-green-500" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600"
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="name@email.com"
                    className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                      theme === "dark" 
                        ? "bg-black/30 border-green-950/40 text-white focus:border-green-500" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.password}</label>
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                      theme === "dark" 
                        ? "bg-black/30 border-green-950/40 text-white focus:border-green-500" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600"
                    }`}
                  />
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.location}</label>
                    <select
                      value={authForm.location}
                      onChange={(e) => setAuthForm({ ...authForm, location: e.target.value })}
                      className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                        theme === "dark" 
                          ? "bg-black/30 border-green-950/40 text-white focus:border-green-500" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600"
                      }`}
                    >
                      <option value="Morogoro">Morogoro</option>
                      <option value="Dodoma">Dodoma</option>
                      <option value="Arusha">Arusha</option>
                      <option value="Mbeya">Mbeya</option>
                      <option value="Dar es Salaam">Dar es Salaam</option>
                      <option value="Mwanza">Mwanza</option>
                      <option value="Iringa">Iringa</option>
                      <option value="Nairobi">Nairobi</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] tracking-wider uppercase text-xs"
                >
                  {authMode === "login" ? t.login : t.register}
                </button>
              </form>

              <div className="relative my-6 text-center">
                <hr className={theme === "dark" ? "border-green-950/40" : "border-slate-100"} />
                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] font-bold uppercase ${
                  theme === "dark" ? "bg-[#0a0f0d] text-slate-500" : "bg-white text-slate-400"
                }`}>
                  {t.or}
                </span>
              </div>

              <button
                onClick={() => setAuthMode(m => m === "login" ? "register" : "login")}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  theme === "dark" 
                    ? "border-green-950/40 text-slate-300 hover:bg-white/5" 
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {authMode === "login" ? t.dontHaveAccount : t.alreadyHaveAccount}
              </button>

              <div className={`mt-8 p-4 rounded-2xl border text-center ${
                theme === "dark" ? "bg-[#0d1612]/60 border-green-900/10" : "bg-emerald-50 border-emerald-100/50"
              }`}>
                <p className="text-[11px] font-bold text-green-500 uppercase tracking-widest mb-1.5">
                  {lang === "sw" ? "BADO HUNA AKAUNTI?" : "DON'T HAVE AN ACCOUNT?"}
                </p>
                <p className="text-xs text-slate-400 leading-normal mb-3">
                  {lang === "sw" 
                    ? "Jisajili bure ili kupata ufikiaji kamili wa mfumo wa AI wa kilimo." 
                    : "Create a free account to get full access to the AI plant diagnosis system."}
                </p>
                <button
                  onClick={() => setAuthMode(m => m === "login" ? "register" : "login")}
                  className="px-4 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-500 text-[10px] font-bold uppercase rounded-lg tracking-wider"
                >
                  {lang === "sw" ? "Jisajili Sasa" : "Create Free Account"}
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Logged In Farmer Dashboard Screen */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Main Dashboard Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b pb-4 border-emerald-800/10">
            <button
              onClick={() => { setActiveTab("home"); setSelectedScanDetails(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
                activeTab === "home"
                  ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  : theme === "dark"
                    ? "text-slate-400 hover:bg-white/5"
                    : "text-slate-600 hover:bg-emerald-50"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{lang === "sw" ? "Uchunguzi / Scan" : "Diagnosis & Scan"}</span>
            </button>

            <button
              onClick={() => { setActiveTab("history"); setSelectedScanDetails(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  : theme === "dark"
                    ? "text-slate-400 hover:bg-white/5"
                    : "text-slate-600 hover:bg-emerald-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.history} ({totalScans})</span>
            </button>

            <button
              onClick={() => { setActiveTab("chat"); setSelectedScanDetails(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
                activeTab === "chat"
                  ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  : theme === "dark"
                    ? "text-slate-400 hover:bg-white/5"
                    : "text-slate-600 hover:bg-emerald-50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{lang === "sw" ? "Mtaalamu AI" : "AI Farm Assistant"}</span>
            </button>
          </div>

          {/* Quick Stats Banner (Visible at top) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors duration-300 ${
              theme === "dark" ? "bg-[#0a0f0d] border-green-900/20" : "bg-white border-emerald-100"
            }`}>
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{t.scansCount}</p>
                <p className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>{totalScans}</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors duration-300 ${
              theme === "dark" ? "bg-[#0a0f0d] border-green-900/20" : "bg-white border-emerald-100"
            }`}>
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{t.diseasedCount}</p>
                <p className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>{diseasedScans}</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors duration-300 ${
              theme === "dark" ? "bg-[#0a0f0d] border-green-900/20" : "bg-white border-emerald-100"
            }`}>
              <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{t.healthyCount}</p>
                <p className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>{healthyScans}</p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* TAB 1: Diagnostic Home view */}
            {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left & Middle Column: Diagnostic Interface */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Weather Widget */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
                  theme === "dark" ? "bg-[#0a0f0d] border-green-900/20" : "bg-white border-emerald-100"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-green-500 font-extrabold uppercase tracking-widest">{t.weatherTitle}</span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      </div>
                      <h3 className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                        {activeWeather.condition}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {activeWeather.conditionCode === "sunny" && <Sun className="w-10 h-10 text-yellow-400" />}
                        {activeWeather.conditionCode === "cloudy" && <Cloud className="w-10 h-10 text-slate-400" />}
                        {activeWeather.conditionCode === "rainy" && <CloudRain className="w-10 h-10 text-blue-400" />}
                        {activeWeather.conditionCode === "windy" && <Wind className="w-10 h-10 text-teal-400" />}
                        
                        <div className="text-3xl font-black">{activeWeather.temp}°C</div>
                      </div>

                      <div className="h-8 w-px bg-slate-800/20"></div>

                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.locationLabel}</p>
                        <select 
                          value={weatherRegion} 
                          onChange={(e) => setWeatherRegion(e.target.value)}
                          className={`text-xs font-black bg-transparent border-b outline-none cursor-pointer ${
                            theme === "dark" ? "text-white border-green-900/30" : "text-emerald-900 border-slate-200"
                          }`}
                        >
                          <option value="morogoro">Morogoro</option>
                          <option value="dodoma">Dodoma</option>
                          <option value="arusha">Arusha</option>
                          <option value="mbeya">Mbeya</option>
                          <option value="dar es salaam">Dar es Salaam</option>
                          <option value="mwanza">Mwanza</option>
                          <option value="iringa">Iringa</option>
                          <option value="nairobi">Nairobi</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Weather parameters details */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/10 text-xs text-slate-400">
                    <div>
                      <span className="font-semibold">{t.humidity}: </span>
                      <span className="text-green-500 font-bold">{activeWeather.humidity}%</span>
                    </div>
                    <div>
                      <span className="font-semibold">{t.precipitation}: </span>
                      <span className="text-green-500 font-bold">{activeWeather.precipitationChance}%</span>
                    </div>
                  </div>

                  {/* Agro Farming Tip based on weather */}
                  <div className={`mt-4 p-3 rounded-xl text-xs leading-relaxed border flex gap-2.5 items-start ${
                    theme === "dark" ? "bg-[#111915]/60 border-green-900/20 text-slate-300" : "bg-emerald-50/50 border-emerald-100 text-slate-700"
                  }`}>
                    <div className="p-1 bg-green-500/10 text-green-500 rounded-md shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <p>
                      <strong className="text-green-500">{t.weatherTip}: </strong>
                      {lang === "sw" ? activeWeather.recommendationSw : activeWeather.recommendation}
                    </p>
                  </div>
                </div>

                {/* Primary Diagnostic Uploader Interface */}
                <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                  theme === "dark" ? "bg-[#0a0f0d] border-green-500/20 shadow-2xl" : "bg-white border-emerald-200 shadow-xl"
                }`}>
                  <div className="mb-6">
                    <h3 className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {t.uploadSectionTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{t.uploadSubtitle}</p>
                  </div>

                  {/* Scanning active effect */}
                  <div className="relative group rounded-2xl border-2 border-dashed border-slate-700 overflow-hidden min-h-[220px] flex flex-col items-center justify-center p-4">
                    {/* Glowing Scan Line when analyzing */}
                    {isAnalyzing && (
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] animate-bounce z-10"></div>
                    )}

                    {isCameraActive ? (
                      /* Active Camera Stream viewport */
                      <div className="w-full max-w-md flex flex-col items-center">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full rounded-xl aspect-video bg-black object-cover"
                        ></video>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={capturePhoto}
                            className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase rounded-xl shadow-md flex items-center gap-1"
                          >
                            <Camera className="w-4 h-4" />
                            {t.capturePhoto}
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold uppercase rounded-xl"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    ) : selectedImage ? (
                      /* Selected/Captured Image Preview */
                      <div className="w-full max-w-sm flex flex-col items-center">
                        <div className="relative rounded-xl overflow-hidden aspect-video w-full bg-slate-900 border border-slate-700/50">
                          <img 
                            src={selectedImage} 
                            alt="Plant Leaf Scan" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => { setSelectedImage(null); setCurrentDiagnosis(null); }}
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[10px] text-green-500 font-semibold mt-3 bg-green-500/10 px-2.5 py-1 rounded-full">
                          ✓ {lang === "sw" ? "Picha Imepakiwa vizuri" : "Image loaded successfully"}
                        </p>
                      </div>
                    ) : (
                      /* Drag & Drop File Loader UI */
                      <div className="text-center p-6 flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-300">{t.dragDropText}</p>
                        <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG (Max 10MB)</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          <label className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-xs font-extrabold uppercase rounded-lg cursor-pointer tracking-wider">
                            {lang === "sw" ? "Chagua Faili" : "Browse Files"}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>

                          <button
                            onClick={startCamera}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5"
                          >
                            <Camera className="w-4 h-4" />
                            {lang === "sw" ? "Piga Picha" : "Take Photo"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Notes Input */}
                  <div className="mt-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t.notes}</label>
                    <textarea
                      value={farmerNotes}
                      onChange={(e) => setFarmerNotes(e.target.value)}
                      placeholder={t.farmerNotesPlaceholder}
                      rows={2}
                      className={`w-full p-3 rounded-xl border text-xs transition-all outline-none resize-none ${
                        theme === "dark" 
                          ? "bg-black/20 border-green-950/40 text-white focus:border-green-500" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600"
                      }`}
                    />
                  </div>

                  {/* Diagnose Action Button */}
                  {selectedImage && (
                    <button
                      onClick={handleDiagnose}
                      disabled={isAnalyzing}
                      className="w-full mt-6 py-4 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t.loading}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4.5 h-4.5" />
                          <span>{t.diagnoseButton}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Error Notification */}
                  {errorMsg && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Sample Plants quick preview triggers */}
                  <div className="mt-8 border-t border-slate-800/20 pt-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t.quickDemoText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {cropSamples.map(sample => (
                        <button
                          key={sample.id}
                          onClick={() => handleSampleSelect(sample)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            theme === "dark" 
                              ? "bg-[#111915]/60 border-green-950/40 hover:border-green-500/60" 
                              : "bg-emerald-50/50 border-emerald-100 hover:border-green-600"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-[10px] font-bold uppercase text-green-500">
                              {lang === "sw" ? sample.nameSw : sample.nameEn}
                            </span>
                          </div>
                          <p className="text-[11px] font-extrabold truncate">
                            {lang === "sw" ? sample.diseaseSw : sample.diseaseEn}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Live Diagnostic Results */}
              <div className="space-y-6">
                
                {currentDiagnosis ? (
                  /* Diagnostic Details Card with 4-step treatment */
                  <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                    theme === "dark" ? "bg-[#0a0f0d] border-green-500/30 shadow-2xl" : "bg-white border-emerald-200 shadow-xl"
                  }`}>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/10">
                      <h3 className={`text-sm font-black uppercase text-green-500 tracking-wider flex items-center gap-1.5`}>
                        <Sparkles className="w-4 h-4" />
                        {t.diagnosisResultTitle}
                      </h3>
                      <button
                        onClick={handleSaveScan}
                        className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black text-[10px] font-bold uppercase rounded-lg tracking-wider"
                      >
                        {t.saveToHistory}
                      </button>
                    </div>

                    {/* Plant type and Confidence */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-black/30 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">{t.plantType}</span>
                        <span className="text-xs font-bold text-slate-300">{currentDiagnosis.plantType}</span>
                      </div>
                      <div className="p-3 bg-black/30 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">{t.confidence}</span>
                        <span className="text-xs font-black text-green-400">{currentDiagnosis.confidence}%</span>
                      </div>
                    </div>

                    {/* Identified Disease Title with Severity badge */}
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">{t.diseaseName}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          currentDiagnosis.severity.toLowerCase().includes("high") || currentDiagnosis.severity.toLowerCase().includes("kali")
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {t.severity}: {currentDiagnosis.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-red-400">{currentDiagnosis.diseaseName}</h4>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.description}</h5>
                      <p className="text-xs leading-relaxed text-slate-300">{currentDiagnosis.description}</p>
                    </div>

                    {/* Symptoms list */}
                    {currentDiagnosis.symptoms && currentDiagnosis.symptoms.length > 0 && (
                      <div className="mb-5">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.symptoms}</h5>
                        <ul className="space-y-1">
                          {currentDiagnosis.symptoms.map((sym, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-normal">
                              <span className="text-green-500 font-bold shrink-0">•</span>
                              <span>{sym}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 4-Step Treatment & Recovery Plan */}
                    <div className="border-t border-slate-800/10 pt-5 space-y-4">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t.treatmentPlan}</h5>

                      {/* 1. Immediate Actions */}
                      <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-yellow-500">
                        <h6 className="text-[11px] font-black text-yellow-500 uppercase tracking-tight mb-1">{t.immediateActions}</h6>
                        <ul className="space-y-1.5">
                          {currentDiagnosis.treatment.immediateActions.map((act, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{act}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. Organic Remedies */}
                      <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-emerald-500">
                        <h6 className="text-[11px] font-black text-emerald-500 uppercase tracking-tight mb-1">{t.organicRemedies}</h6>
                        <ul className="space-y-1.5">
                          {currentDiagnosis.treatment.organicRemedies.map((rem, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{rem}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Chemical Options */}
                      <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-red-500">
                        <h6 className="text-[11px] font-black text-red-400 uppercase tracking-tight mb-1">{t.chemicalOptions}</h6>
                        <ul className="space-y-1.5">
                          {currentDiagnosis.treatment.chemicalOptions.map((chem, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">
                              {chem}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 4. Preventive Measures */}
                      <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-blue-500">
                        <h6 className="text-[11px] font-black text-blue-400 uppercase tracking-tight mb-1">{t.preventiveMeasures}</h6>
                        <ul className="space-y-1.5">
                          {currentDiagnosis.treatment.preventiveMeasures.map((prev, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{prev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  /* STUNNING IMMERSIVE DIAGNOSTIC LOADING STATE */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl border transition-all duration-300 ${
                      theme === "dark" 
                        ? "bg-gradient-to-b from-[#0c1410] to-[#060a08] border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]" 
                        : "bg-gradient-to-b from-emerald-50/80 to-white border-emerald-300 shadow-xl"
                    }`}
                  >
                    <div className="text-center py-6">
                      {/* Interactive Holographic Scanner Ring */}
                      <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                        {/* Outer rotating ring */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className="absolute inset-0 border-4 border-dashed border-green-500/30 rounded-full"
                        ></motion.div>
                        
                        {/* Inner rotating ring (counter clockwise) */}
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                          className="absolute inset-2 border-2 border-dotted border-emerald-400/50 rounded-full"
                        ></motion.div>

                        {/* Pulse glow background */}
                        <div className="absolute inset-4 bg-green-500/10 rounded-full animate-pulse blur-md"></div>

                        {/* Centered pulsing crop/leaf scanning indicator */}
                        <div className="relative bg-[#101915] border border-green-500/40 w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                          <motion.div
                            animate={{ y: [-15, 15, -15] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute left-1 right-1 h-0.5 bg-green-400 shadow-[0_0_8px_#22c55e] z-10"
                          ></motion.div>
                          <svg className="w-8 h-8 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
                          </svg>
                        </div>

                        {/* Rotating progress percentage badge */}
                        <div className="absolute -bottom-2 px-3 py-1 bg-green-500 text-black text-[11px] font-black uppercase rounded-full tracking-widest shadow-md">
                          {loadingProgress}%
                        </div>
                      </div>

                      {/* Descriptive Step Tracker */}
                      <h4 className={`text-sm font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"} mb-2 px-4`}>
                        {lang === "sw" ? "Mtaalamu wa AI anachambua..." : "AI Specialist analyzing..."}
                      </h4>
                      
                      {/* Animated text indicating the active process */}
                      <div className="min-h-[40px] px-6">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-xs text-green-400 font-bold leading-relaxed"
                          >
                            {lang === "sw" ? diagnosisStepsSw[loadingStep] : diagnosisStepsEn[loadingStep]}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      {/* Continuous Progress Bar */}
                      <div className="w-full max-w-xs mx-auto bg-slate-800/35 h-2.5 rounded-full overflow-hidden mb-6 border border-white/5 relative mt-4">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full"
                          style={{ width: `${loadingProgress}%` }}
                          transition={{ ease: "easeInOut" }}
                        ></motion.div>
                      </div>

                      {/* Steps Checklist Visual Indicator */}
                      <div className="max-w-xs mx-auto text-left space-y-2 px-4 mt-6 border-t border-slate-800/10 pt-6">
                        {[0, 1, 2, 3, 4].map((stepIdx) => {
                          const isCompleted = loadingStep > stepIdx;
                          const isActive = loadingStep === stepIdx;
                          return (
                            <div key={stepIdx} className="flex items-center gap-2.5 text-[11px] font-semibold">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                                isCompleted 
                                  ? "bg-green-500/20 border-green-500 text-green-400" 
                                  : isActive 
                                    ? "bg-green-500 text-black border-green-500 animate-pulse" 
                                    : "border-slate-800 text-slate-600"
                              }`}>
                                {isCompleted ? "✓" : stepIdx + 1}
                              </span>
                              <span className={`${
                                isCompleted 
                                  ? "text-slate-300 line-through decoration-slate-600/50" 
                                  : isActive 
                                    ? "text-green-400 font-bold" 
                                    : "text-slate-600"
                              }`}>
                                {lang === "sw" 
                                  ? ["Pakia Picha", "Utambuzi wa Zao", "Utafutaji wa Ukungu", "Kanzi-Data ya AI", "Mpango wa Dawa"][stepIdx]
                                  : ["Upload Image", "Identify Crop", "Pathogen Scan", "AI Database Match", "Formulate Medicine"][stepIdx]
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </motion.div>
                ) : (
                  /* Fallback display before scan */
                  <div className={`p-8 rounded-3xl border text-center transition-colors duration-300 ${
                    theme === "dark" ? "bg-[#0a0f0d] border-green-900/10" : "bg-white border-slate-100"
                  }`}>
                    <div className="w-16 h-16 bg-slate-800/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-bold">{lang === "sw" ? "Subiri Matokeo ya Uchunguzi" : "Awaiting Plant Scan"}</h4>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                      {lang === "sw" 
                        ? "Pakia au piga picha ya jani la mmea ili kupata uchambuzi wa ugonjwa wa papo hapo pamoja na aina sahihi ya dawa ya kupulizia."
                        : "Upload or capture a leaf photo to generate an instant diagnosis report and complete crop recovery instructions."}
                    </p>
                  </div>
                )}

                {/* Farmers advice tip card */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 ${
                  theme === "dark" ? "bg-[#0d1612] border-green-900/20" : "bg-emerald-50/40 border-emerald-100"
                }`}>
                  <h4 className="text-xs font-bold text-green-500 uppercase mb-3 tracking-wider">{lang === "sw" ? "Ushauri wa Mwezi huu" : "Farming Tip of the Month"}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic z-10 relative">
                    {lang === "sw" 
                      ? `"Daima safisha na kuua viini kwenye jembe na kisu chako baada ya kukata mimea iliyoathirika ili kuzuia kuenea kwa wadudu na fungus shambani."`
                      : `"Always sanitize crop tools like pruners after cutting diseased foliage to avoid transferring harmful fungal spores to healthy fields."`}
                  </p>
                  <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
                    <svg className="w-24 h-24 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L7.66 18.37C13.5 19 17.88 15 19 9C20 12 21 15 22 16L23 15C20 12 19 8 19 8C19 8 20 4 20 2L18 3C18 5 17 8 17 8Z"></path></svg>
                  </div>
                </div>
              </div> {/* Closes Right Column */}
            </div> {/* Closes Grid Wrapper */}

            {/* MODERN EXPLANATORY BENTO SECTION ON PLANTDOCTOR AI */}
              <div className={`p-8 rounded-3xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gradient-to-b from-[#070b09] to-[#040605] border-green-950/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" 
                  : "bg-gradient-to-b from-white to-emerald-50/20 border-emerald-100 shadow-xl"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-[10px] text-green-500 font-extrabold uppercase tracking-widest">
                        {lang === "sw" ? "Jinsi inavyofanya kazi" : "How it Works"}
                      </span>
                    </div>
                    <h3 className={`text-xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {lang === "sw" ? "Miongozo na Teknolojia ya PlantDoctor AI" : "PlantDoctor AI Technology & Systems"}
                    </h3>
                  </div>
                  <div className={`text-xs px-3.5 py-1.5 rounded-full border ${
                    theme === "dark" ? "bg-black/35 border-green-950/40 text-green-400" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                  } font-semibold flex items-center gap-2`}>
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    <span>Gemini 2.5 Flash Engine Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Computer Vision */}
                  <div className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                    theme === "dark" 
                      ? "bg-[#0a0f0d] border-green-950/35 hover:border-green-500/30 hover:shadow-[0_4px_25px_rgba(34,197,94,0.06)]" 
                      : "bg-white border-slate-100 hover:border-emerald-300 hover:shadow-xl"
                  }`}>
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h4 className={`font-black text-sm mb-2 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {lang === "sw" ? "Uchambuzi wa Picha (Vision)" : "Computer Vision Diagnostics"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === "sw" 
                        ? "AI yetu inasoma pikseli za majani kubaini magonjwa ya virusi, bakteria na virusi kwa usahihi wa hadi 98%."
                        : "Our AI scans leaf pixels to pinpoint viral, bacterial, and fungal infections with up to 98% precision."}
                    </p>
                  </div>

                  {/* Card 2: Treatment Plans */}
                  <div className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                    theme === "dark" 
                      ? "bg-[#0a0f0d] border-green-950/35 hover:border-green-500/30 hover:shadow-[0_4px_25px_rgba(34,197,94,0.06)]" 
                      : "bg-white border-slate-100 hover:border-emerald-300 hover:shadow-xl"
                  }`}>
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <h4 className={`font-black text-sm mb-2 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {lang === "sw" ? "Tiba Maalum za Hatua 4" : "4-Step Medical Prescriptions"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === "sw" 
                        ? "Kupata matibabu thabiti: hatua za kwanza, tiba ya asili (organic), kemikali sahihi, na ushauri wa kuzuia magonjwa mapema."
                        : "Get structured instructions: urgent first-steps, organic remedies, recommended chemicals, and future prevention."}
                    </p>
                  </div>

                  {/* Card 3: Localized Weather Grounding */}
                  <div className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                    theme === "dark" 
                      ? "bg-[#0a0f0d] border-green-950/35 hover:border-green-500/30 hover:shadow-[0_4px_25px_rgba(34,197,94,0.06)]" 
                      : "bg-white border-slate-100 hover:border-emerald-300 hover:shadow-xl"
                  }`}>
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Sun className="w-5 h-5" />
                    </div>
                    <h4 className={`font-black text-sm mb-2 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {lang === "sw" ? "Hali ya Hewa ya Kilimo" : "Agro-Weather Correlation"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === "sw" 
                        ? "Kuunganisha kiwango cha unyevu na joto la eneo lako kukupa tahadhari ya uwezekano wa mlipuko wa fungus kabla haujasambaa."
                        : "Correlating local humidity and warmth to warn you about fungal outbreak risks before they devastate your harvest."}
                    </p>
                  </div>

                  {/* Card 4: natural language chat */}
                  <div className={`p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 ${
                    theme === "dark" 
                      ? "bg-[#0a0f0d] border-green-950/35 hover:border-green-500/30 hover:shadow-[0_4px_25px_rgba(34,197,94,0.06)]" 
                      : "bg-white border-slate-100 hover:border-emerald-300 hover:shadow-xl"
                  }`}>
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className={`font-black text-sm mb-2 ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {lang === "sw" ? "Msaidizi wa Sauti/Maandishi" : "Interactive Chat Expert"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === "sw" 
                        ? "Uliza maswali ya kilimo kwa lugha ya kawaida (Kiswahili au English) na upokee mwongozo kamili kutoka kwa Afisa Kilimo wa AI."
                        : "Ask follow-up questions in Swahili or English and receive prompt farming tips from our expert digital agronomist."}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: Scan Records History Log */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Left & Center Column: Historical Scans List */}
              <div className="lg:col-span-2 space-y-4">
                <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  theme === "dark" ? "bg-[#0a0f0d] border-green-900/10" : "bg-white border-emerald-100"
                }`}>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-white" : "text-emerald-950"}`}>
                      {t.historyTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === "sw" ? "Kagua vipimo na ripoti zako za zamani." : "Review all your saved crop analyses and progress."}
                    </p>
                  </div>

                  {/* Search Bar filter */}
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition-all ${
                        theme === "dark" 
                          ? "bg-black/40 border-green-950/40 text-white focus:border-green-500" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:border-green-600"
                      }`}
                    />
                  </div>
                </div>

                {filteredScans.length === 0 ? (
                  <div className={`p-12 rounded-3xl text-center border ${
                    theme === "dark" ? "bg-[#0a0f0d] border-green-900/10" : "bg-white border-slate-100"
                  }`}>
                    <Info className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-sm font-semibold">{t.noMatches}</p>
                    <button
                      onClick={() => { setSearchTerm(""); setActiveTab("home"); }}
                      className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-xs font-bold uppercase rounded-lg"
                    >
                      {lang === "sw" ? "Chunguza Mmea Mpya" : "Perform New Scan"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredScans.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => setSelectedScanDetails(record)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                          selectedScanDetails?.id === record.id
                            ? theme === "dark" ? "bg-green-500/10 border-green-500" : "bg-green-50 border-green-600"
                            : theme === "dark" ? "bg-[#0a0f0d] border-green-900/20 hover:border-green-500/40" : "bg-white border-emerald-100 hover:border-green-600"
                        }`}
                      >
                        <div>
                          <div className="aspect-video rounded-xl bg-slate-900 mb-3 overflow-hidden relative border border-slate-800">
                            <img src={record.imageUrl} alt="Scan Record" className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] font-bold text-slate-300">
                              {new Date(record.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase text-green-500">
                              {record.diagnosis.plantType}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              record.diagnosis.severity.toLowerCase().includes("high") || record.diagnosis.severity.toLowerCase().includes("kali")
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {record.diagnosis.severity}
                            </span>
                          </div>

                          <h4 className="text-xs font-black truncate">{record.diagnosis.diseaseName}</h4>
                          {record.farmerNotes && (
                            <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">
                              "{record.farmerNotes}"
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/10 flex justify-between items-center">
                          <span className="text-[9px] text-slate-500">{t.confidence}: {record.diagnosis.confidence}%</span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleDeleteScan(record.id, e)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                              title={t.deleteScan}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] text-green-500 font-bold">{t.viewDetails} →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Active Scan Details (Comprehensive Steps) */}
              <div className="space-y-6">
                {selectedScanDetails ? (
                  <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                    theme === "dark" ? "bg-[#0a0f0d] border-green-500/30 shadow-2xl" : "bg-white border-emerald-200 shadow-xl"
                  }`}>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/10">
                      <div>
                        <h4 className="text-xs font-black uppercase text-green-500 tracking-wider">
                          {lang === "sw" ? "MAOMBI YA RIPOTI" : "SAVED TREATMENT REPORT"}
                        </h4>
                        <span className="text-[9px] text-slate-400">{new Date(selectedScanDetails.timestamp).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => setSelectedScanDetails(null)}
                        className="p-1 text-slate-400 hover:text-white rounded"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="aspect-video rounded-2xl bg-black mb-4 overflow-hidden border border-slate-800">
                      <img src={selectedScanDetails.imageUrl} alt="Details" className="w-full h-full object-cover" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-black/40 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">{t.plantType}</span>
                        <span className="text-xs font-bold text-slate-300">{selectedScanDetails.diagnosis.plantType}</span>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">{t.confidence}</span>
                        <span className="text-xs font-bold text-green-400">{selectedScanDetails.diagnosis.confidence}%</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.diseaseName}</h5>
                      <p className="text-xs font-bold text-red-400 leading-normal">{selectedScanDetails.diagnosis.diseaseName}</p>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.description}</h5>
                      <p className="text-xs leading-relaxed text-slate-300">{selectedScanDetails.diagnosis.description}</p>
                    </div>

                    <div className="border-t border-slate-800/10 pt-4 space-y-4">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider mb-2">{t.treatmentPlan}</h5>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-yellow-500">
                        <h6 className="text-[11px] font-black text-yellow-500 uppercase tracking-tight mb-1">{t.immediateActions}</h6>
                        <ul className="space-y-1">
                          {selectedScanDetails.diagnosis.treatment.immediateActions.map((act, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{act}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-emerald-500">
                        <h6 className="text-[11px] font-black text-emerald-500 uppercase tracking-tight mb-1">{t.organicRemedies}</h6>
                        <ul className="space-y-1">
                          {selectedScanDetails.diagnosis.treatment.organicRemedies.map((rem, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{rem}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-red-500">
                        <h6 className="text-[11px] font-black text-red-400 uppercase tracking-tight mb-1">{t.chemicalOptions}</h6>
                        <ul className="space-y-1">
                          {selectedScanDetails.diagnosis.treatment.chemicalOptions.map((chem, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{chem}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 border-l-4 border-l-blue-500">
                        <h6 className="text-[11px] font-black text-blue-400 uppercase tracking-tight mb-1">{t.preventiveMeasures}</h6>
                        <ul className="space-y-1">
                          {selectedScanDetails.diagnosis.treatment.preventiveMeasures.map((prev, i) => (
                            <li key={i} className="text-[11px] text-slate-300 leading-relaxed list-disc list-inside">{prev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-8 rounded-3xl border text-center transition-colors duration-300 ${
                    theme === "dark" ? "bg-[#0a0f0d] border-green-900/10" : "bg-white border-slate-100"
                  }`}>
                    <div className="w-12 h-12 bg-slate-800/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-bold">{lang === "sw" ? "Chagua Kipimo Kwenye Orodha" : "Select Record to view steps"}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                      {lang === "sw" 
                        ? "Bonyeza kadi yoyote ya kipimo katika orodha ili kuona muhtasari kamili wa utambuzi na maelekezo ya dawa ya kupulizia."
                        : "Click any scan from the history list to load the step-by-step treatment details, preventive guides, and medicine options."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Farmer AI Assistant Chat interface */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto w-full"
            >
              <div className={`rounded-3xl border overflow-hidden flex flex-col h-[580px] transition-all duration-300 ${
                theme === "dark" ? "bg-[#0a0f0d] border-green-900/20" : "bg-white border-emerald-100 shadow-xl"
              }`}>
                {/* Chat header */}
                <div className="p-5 border-b border-slate-800/10 flex justify-between items-center bg-black/10">
                  <div>
                    <h3 className={`text-sm font-black uppercase text-green-500 tracking-wider flex items-center gap-1.5`}>
                      <MessageSquare className="w-4 h-4 animate-pulse" />
                      {t.askTitle}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.askSubtitle}</p>
                  </div>
                  {chatMessages.length > 0 && (
                    <button
                      onClick={handleClearChat}
                      className="px-3 py-1 text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase rounded-lg border border-red-500/20"
                    >
                      {lang === "sw" ? "Futa Maongezi" : "Clear All"}
                    </button>
                  )}
                </div>

                {/* Messages body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {/* Default greeting message */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center font-bold text-xs text-black shrink-0">
                      AI
                    </div>
                    <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      theme === "dark" ? "bg-[#111915]/80 text-slate-100" : "bg-emerald-50 text-slate-800"
                    }`}>
                      {t.chatWelcome}
                    </div>
                  </div>

                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        msg.role === "user" 
                          ? "bg-slate-700 text-white" 
                          : "bg-green-500 text-black"
                      }`}>
                        {msg.role === "user" ? "U" : "AI"}
                      </div>
                      <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                        msg.role === "user"
                          ? theme === "dark" 
                            ? "bg-slate-800/80 text-white" 
                            : "bg-slate-100 text-slate-900"
                          : theme === "dark"
                            ? "bg-[#111915]/80 text-slate-100"
                            : "bg-emerald-50 text-slate-800"
                      }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center font-bold text-xs text-black shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                        AI
                      </div>
                      <div className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed border ${
                        theme === "dark" 
                          ? "bg-[#111915]/60 border-green-900/10 text-slate-400 shadow-md" 
                          : "bg-emerald-50 border-emerald-100 text-slate-600 shadow-sm"
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider">
                            {lang === "sw" ? "Afisa Kilimo AI anaandika..." : "Agricultural Officer AI thinking..."}
                          </span>
                          <span className="flex gap-1">
                            <motion.span 
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"
                            ></motion.span>
                            <motion.span 
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                              className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"
                            ></motion.span>
                            <motion.span 
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                              className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"
                            ></motion.span>
                          </span>
                        </div>
                        <p className="italic text-[11px]">
                          {lang === "sw" 
                            ? "Tafadhali subiri wakati Afisa Kilimo wa AI anachambua swali lako na kutafuta ushauri bora wa uzalishaji..." 
                            : "Formulating organic strategies and cross-referencing agricultural guidelines for you..."}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatBottomRef}></div>
                </div>

                {/* Input submission bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800/10 bg-black/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.chatPlaceholder}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isChatLoading}
                      className={`flex-1 p-3 rounded-xl border text-xs outline-none transition-all ${
                        theme === "dark" 
                          ? "bg-black/40 border-green-950/40 text-white focus:border-green-500" 
                          : "bg-white border-slate-200 text-slate-900 focus:border-green-600"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="px-5 py-3 bg-green-500 hover:bg-green-400 disabled:bg-slate-800 disabled:text-slate-500 text-black font-extrabold rounded-xl transition-all flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

        </div>
      )}

      {/* Decorative footer */}
      <footer className="py-8 text-center border-t border-slate-800/10 text-[10px] text-slate-500 uppercase tracking-widest mt-12">
        <p>© 2026 {t.appName} • {lang === "sw" ? "Imeundwa kwa Kilimo Endelevu" : "Empowering Farmers Globally"}</p>
      </footer>
    </div>
  );
}
