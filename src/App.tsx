import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import StyledQRCode from "./components/StyledQRCode";
import ColorPicker from "./components/ColorPicker";
import type { DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import {
  Link2, AlignLeft, Mail, Phone, MessageSquare, Contact,
  MessageCircle, Wifi, FileText, Download, Scan, Moon, Sun, Settings,
  Upload, X, Image as ImageIcon, Camera, ShieldCheck, HardDrive, QrCode,
  Folder, Info, Heart
} from "lucide-react";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Media } from '@capacitor-community/media';
import { Capacitor } from '@capacitor/core';
import { Camera as NativeCamera } from '@capacitor/camera';

const QR_TYPES = [
  { id: "link", label: "Link", icon: Link2 },
  { id: "text", label: "Text", icon: AlignLeft },
  { id: "email", label: "E-mail", icon: Mail },
  { id: "call", label: "Call", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "vcard", label: "V-card", icon: Contact },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "wifi", label: "WI-FI", icon: Wifi },
];

const transparentPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const FRAME_STYLES = [
  { id: "none", label: "None" },
  { id: "bottom-block", label: "Bottom Block" },
  { id: "bottom-tooltip", label: "Bottom Tooltip" },
  { id: "top-block", label: "Top Block" },
  { id: "top-tooltip", label: "Top Tooltip" },
  { id: "bottom-pill", label: "Bottom Pill" },
  { id: "bottom-pill-icon", label: "Icon Pill" },
  { id: "bottom-text", label: "Bottom Text" },
  { id: "phone", label: "Phone" },
  { id: "clipboard", label: "Clipboard" },
  { id: "bag", label: "Bag" },
  { id: "clapperboard", label: "Clapperboard" },
  { id: "top-ribbon", label: "Top Ribbon" },
  { id: "bottom-ribbon", label: "Bottom Ribbon" },
  { id: "circular", label: "Circular" },
  { id: "speech-bubble", label: "Speech Bubble" },
  { id: "bottom-block-rounded", label: "Bottom Rounded" },
  { id: "side-arrows", label: "Side Arrows" },
  { id: "top-pill-overlap", label: "Top Pill Overlap" },
  { id: "top-block-rounded", label: "Top Rounded" },
  { id: "polaroid", label: "Polaroid" },
  { id: "neon-border", label: "Neon Border" },
  { id: "floating-badge", label: "Floating Badge" }
];

const DOT_TYPES = [
  { id: "square", label: "Square" },
  { id: "dots", label: "Dots" },
  { id: "rounded", label: "Rounded" },
  { id: "extra-rounded", label: "Extra Rounded" },
  { id: "classy", label: "Classy" },
  { id: "classy-rounded", label: "Classy Rounded" },
];

const CORNER_SQUARE_TYPES = [
  { id: "square", label: "Square" },
  { id: "dot", label: "Dot" },
  { id: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_DOT_TYPES = [
  { id: "square", label: "Square" },
  { id: "dot", label: "Dot" },
];

export default function App() {
  // Persistence Helper
  const initial = (() => {
    try {
      const saved = localStorage.getItem("nazu_qr_app_state");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();

  const [selectedType, setSelectedType] = useState(initial.selectedType || "link");
  const [isDarkMode, setIsDarkMode] = useState(initial.isDarkMode ?? false);

  // Content States
  const [linkUrl, setLinkUrl] = useState(initial.linkUrl ?? "https://facebook.com");
  const [textContent, setTextContent] = useState(initial.textContent ?? "");
  const [emailTo, setEmailTo] = useState(initial.emailTo ?? "");
  const [emailSubj, setEmailSubj] = useState(initial.emailSubj ?? "");
  const [emailBody, setEmailBody] = useState(initial.emailBody ?? "");
  const [phoneNum, setPhoneNum] = useState(initial.phoneNum ?? "");
  const [smsNum, setSmsNum] = useState(initial.smsNum ?? "");
  const [smsBody, setSmsBody] = useState(initial.smsBody ?? "");
  const [wifiSsid, setWifiSsid] = useState(initial.wifiSsid ?? "");
  const [wifiPass, setWifiPass] = useState(initial.wifiPass ?? "");
  const [wifiEnc, setWifiEnc] = useState(initial.wifiEnc ?? "WPA");
  const [wifiHidden, setWifiHidden] = useState(initial.wifiHidden ?? false);

  const [vcard, setVcard] = useState(initial.vcard ?? {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    job: "",
    address: "",
    website: "",
  });

  const [qrContent, setQrContent] = useState("https://facebook.com");

  // Update qrContent based on selected type and inputs
  useEffect(() => {
    switch (selectedType) {
      case "link":
        setQrContent(linkUrl || "https://");
        break;
      case "text":
        setQrContent(textContent || " ");
        break;
      case "email":
        setQrContent(
          `mailto:${emailTo}?subject=${encodeURIComponent(emailSubj)}&body=${encodeURIComponent(emailBody)}`,
        );
        break;
      case "call":
        setQrContent(`tel:${phoneNum}`);
        break;
      case "sms":
        setQrContent(`smsto:${smsNum}:${smsBody}`);
        break;
      case "whatsapp":
        setQrContent(
          `https://wa.me/${phoneNum.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(smsBody)}`,
        );
        break;
      case "wifi":
        setQrContent(
          `WIFI:T:${wifiEnc};S:${wifiSsid};P:${wifiPass};H:${wifiHidden};;`,
        );
        break;
      case "vcard":
        setQrContent(
          `BEGIN:VCARD\nVERSION:3.0\nN:${vcard.lastName};${vcard.firstName}\nFN:${vcard.firstName} ${vcard.lastName}\nORG:${vcard.company}\nTITLE:${vcard.job}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nADR:;;${vcard.address}\nURL:${vcard.website}\nEND:VCARD`,
        );
        break;
      default:
        setQrContent("https://qr.io");
    }
  }, [
    selectedType,
    linkUrl,
    textContent,
    emailTo,
    emailSubj,
    emailBody,
    phoneNum,
    smsNum,
    smsBody,
    wifiSsid,
    wifiPass,
    wifiEnc,
    wifiHidden,
    vcard,
  ]);

  // Design state
  const [activeDesignTab, setActiveDesignTab] = useState(initial.activeDesignTab || "frame");
  const [frameStyle, setFrameStyle] = useState(initial.frameStyle || "bottom-block");
  const [framePhrase, setFramePhrase] = useState(initial.framePhrase || "SCAN ME");
  const [frameFont, setFrameFont] = useState(initial.frameFont || "'Outfit', sans-serif");
  const [frameColor, setFrameColor] = useState(initial.frameColor || "#000000");

  // Shape & Color state
  const [qrFgColor, setQrFgColor] = useState(initial.qrFgColor || "#000000");
  const [qrBgColor, setQrBgColor] = useState(initial.qrBgColor || "#ffffff");
  const [dotsType, setDotsType] = useState<DotType>(initial.dotsType || "square");
  const [cornersSquareType, setCornersSquareType] =
    useState<CornerSquareType>(initial.cornersSquareType || "square");
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>(initial.cornersDotType || "square");
  const [isGradient, setIsGradient] = useState(initial.isGradient ?? false);
  const [logo, setLogo] = useState<string | null>(initial.logo || null);
  const [logoSize, setLogoSize] = useState(initial.logoSize ?? 0.4);
  const [logoBgImage, setLogoBgImage] = useState<string | null>(initial.logoBgImage || null);
  const [logoBgSize, setLogoBgSize] = useState(initial.logoBgSize ?? 0.45);
  const [logoBgOpacity, setLogoBgOpacity] = useState(initial.logoBgOpacity ?? 1);
  const [logoMargin, setLogoMargin] = useState(initial.logoMargin ?? 10);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg" | "pdf">(initial.downloadFormat || "png");

  // Permission & Settings state
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saveToFolder, setSaveToFolder] = useState(() => localStorage.getItem("nazu_qr_save_folder") || "Gallery");
  const [customFolderPath, setCustomFolderPath] = useState(() => localStorage.getItem("nazu_qr_custom_folder") || "NazuQRCodes");

  useEffect(() => {
    const permissionsGranted = localStorage.getItem("nazu_permissions_granted");
    if (!permissionsGranted) {
      setShowPermissionModal(true);
    }
  }, []);

  // Sync state to local storage for persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      const stateToSave = {
        selectedType, isDarkMode, linkUrl, textContent, emailTo, emailSubj,
        emailBody, phoneNum, smsNum, smsBody, wifiSsid, wifiPass, wifiEnc,
        wifiHidden, vcard, frameStyle, framePhrase, frameFont, frameColor,
        qrFgColor, qrBgColor, dotsType, cornersSquareType, cornersDotType,
        isGradient, logo, logoSize, logoBgImage, logoBgSize, logoBgOpacity,
        logoMargin, downloadFormat, activeDesignTab
      };
      try {
        localStorage.setItem("nazu_qr_app_state", JSON.stringify(stateToSave));
      } catch (e) {
        console.warn("Failed to save app state to localStorage (likely space limit):", e);
      }
    }, 1000); // 1s debounce to avoid excessive writes
    return () => clearTimeout(timer);
  }, [
    selectedType, isDarkMode, linkUrl, textContent, emailTo, emailSubj,
    emailBody, phoneNum, smsNum, smsBody, wifiSsid, wifiPass, wifiEnc,
    wifiHidden, vcard, frameStyle, framePhrase, frameFont, frameColor,
    qrFgColor, qrBgColor, dotsType, cornersSquareType, cornersDotType,
    isGradient, logo, logoSize, logoBgImage, logoBgSize, logoBgOpacity,
    logoMargin, downloadFormat, activeDesignTab
  ]);

  const handleGrantPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Step 1: Request Storage/Media permissions FIRST
        try {
          // For Android 12 and below, we need READ/WRITE storage
          // For Android 13+, Media plugin handles it internally
          // We request via Media plugin to cover all Android versions
          await Media.getAlbums(); // Triggers storage permission prompt on older Android
        } catch (storageErr) {
          console.warn("Storage permission request step:", storageErr);
          // Non-fatal — continue to camera
        }

        // Step 2: Check camera permission status
        const currentStatus = await NativeCamera.checkPermissions();

        if (currentStatus.camera === 'denied') {
          alert("Camera permission was previously denied. Please enable Camera access in your phone settings to use the scanner.");
          // Mark granted to close modal — user can still generate QR codes
          localStorage.setItem("nazu_permissions_granted", "true");
          setShowPermissionModal(false);
          return;
        }

        // Request Camera permissions SECOND
        const cameraStatus = await NativeCamera.requestPermissions();
        if (cameraStatus.camera !== 'granted') {
          alert("Camera permission is required for scanning. You can still generate QR codes!");
        }

      } else {
        // Web Fallback — camera covers getUserMedia
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        }
      }

      localStorage.setItem("nazu_permissions_granted", "true");
      setShowPermissionModal(false);
    } catch (err) {
      console.warn("Permission could not be obtained:", err);
      alert("Could not request permissions. Please check your device settings.");
    }
  };

  const qrRef = useRef<HTMLDivElement>(null);

  const inputClass = `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${isDarkMode ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500" : "bg-white border-slate-300 text-slate-900"}`;
  const labelClass = `text-sm font-medium block mb-2 text-slate-700`;
  const whiteInputClass = "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder:text-slate-400";

  const handleDownload = async () => {
    if (!qrRef.current) return;

    console.log("Generating QR image...");

    try {
      const scale = 4;
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: "#ffffff",
        scale: scale,
        useCORS: true,
        allowTaint: true,
      });

      const fileName = `qrcode_${Date.now()}`;
      const fileExt = downloadFormat === "jpg" ? "jpg" : "png";
      const mimeType = downloadFormat === "jpg" ? "image/jpeg" : "image/png";

      if (downloadFormat === "pdf") {
        const { jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

        if (Capacitor.isNativePlatform()) {
          const pdfBase64 = pdf.output('datauristring').split(',')[1];
          await Filesystem.writeFile({
            path: `${fileName}.pdf`,
            data: pdfBase64,
            directory: Directory.Documents
          });
          alert(`PDF saved to Documents folder! ✅`);
        } else {
          pdf.save(`${fileName}.pdf`);
        }
        return;
      }

      const base64Data = canvas.toDataURL(mimeType, 1.0);

      if (Capacitor.isNativePlatform()) {
        const rawBase64 = base64Data.split(',')[1];
        const fullFileName = `${fileName}.${fileExt}`;

        if (saveToFolder === "Gallery") {
          const dataUri = `data:${mimeType};base64,${rawBase64}`;

          // ─── Step 1: Check & request Photos/Storage permission via Camera plugin ───
          try {
            const permStatus = await NativeCamera.checkPermissions();
            console.log("Permission status:", JSON.stringify(permStatus));

            // 'photos' covers READ_MEDIA_IMAGES / READ_EXTERNAL_STORAGE on Android
            if (permStatus.photos !== 'granted' && permStatus.photos !== 'limited') {
              const reqStatus = await NativeCamera.requestPermissions({ permissions: ['photos'] });
              console.log("Permission after request:", JSON.stringify(reqStatus));

              if (reqStatus.photos !== 'granted' && reqStatus.photos !== 'limited') {
                alert("Storage/Photos permission denied.\n\nGo to: Settings → Apps → Nazu QR Scanner → Permissions → Photos/Media → Allow.");
                return;
              }
            }
          } catch (permErr) {
            console.warn("Permission check skipped (Android 13+ may handle internally):", permErr);
            // Non-fatal — continue, plugin may handle internally
          }

          // ─── Step 2: Try saving to album ───
          try {
            let albumIdentifier: string | undefined;

            try {
              const albums = await Media.getAlbums();
              const albumsPath = await Media.getAlbumsPath();
              const albumName = "Nazu QR";

              let album = albums.albums.find(a =>
                a.name === albumName && a.identifier.startsWith(albumsPath.path)
              );

              if (!album) {
                await Media.createAlbum({ name: albumName });
                const refreshed = await Media.getAlbums();
                album = refreshed.albums.find(a =>
                  a.name === albumName && a.identifier.startsWith(albumsPath.path)
                );
              }
              albumIdentifier = album?.identifier;
            } catch (albumErr) {
              console.warn("Album lookup failed, saving to default gallery:", albumErr);
            }

            await Media.savePhoto({
              path: dataUri,
              albumIdentifier,
              fileName: fileName
            });
            alert("Saved to Gallery! ✅");

          } catch (mediaErr: any) {
            console.error("Media.savePhoto failed:", mediaErr);

            // ─── Step 3: Filesystem fallback — save to Documents ───
            try {
              await Filesystem.writeFile({
                path: fullFileName,
                data: rawBase64,
                directory: Directory.Documents,
              });
              alert("Gallery save failed. Saved to Documents folder instead! ✅");
            } catch (fsErr: any) {
              console.error("Filesystem fallback also failed:", fsErr);
              throw new Error(`Media: ${mediaErr?.message || mediaErr} | FS: ${fsErr?.message || fsErr}`);
            }
          }

        } else {
          // Documents / Custom folder save
          let targetDir = Directory.Documents;
          let targetPath = fullFileName;

          if (saveToFolder === "Custom") {
            try {
              await Filesystem.mkdir({
                path: customFolderPath,
                directory: Directory.Documents,
                recursive: true
              });
              targetPath = `${customFolderPath}/${fullFileName}`;
            } catch (e) {
              console.warn("Subfolder creation failed, saving to root Documents", e);
            }
          }

          await Filesystem.writeFile({
            path: targetPath,
            data: rawBase64,
            directory: targetDir
          });

          const location = saveToFolder === "Custom"
            ? `Documents/${customFolderPath}`
            : "Documents";
          alert(`Saved to ${location}! ✅`);
        }

      } else {
        // Web download
        const link = document.createElement("a");
        link.download = `${fileName}.${fileExt}`;
        link.href = base64Data;
        link.click();
      }

    } catch (error: any) {
      console.error("Save error:", error);
      alert(`Failed to save: ${error?.message || error}\n\nPlease check app permissions in device Settings.`);
    }
  };


  return (
    <div className={`min-h-screen pb-[env(safe-area-inset-bottom)] font-sans transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative max-w-md w-full rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}>
            <button
              onClick={() => setShowPermissionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} className={isDarkMode ? 'text-zinc-500' : 'text-slate-400'} />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <ShieldCheck size={40} className="text-emerald-500" />
              </div>
            </div>

            <h2 className={`text-2xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Permissions Required
            </h2>

            <p className={`text-center mb-8 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              To provide the best experience, Nazu QR Scanner needs access to the following:
            </p>

            <div className="space-y-4 mb-8">
              {/* Storage FIRST */}
              <div className={`flex items-start gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                <div className="mt-1 text-emerald-500">
                  <HardDrive size={20} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>Storage Access</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>Required to save and download your generated QR codes to your device.</p>
                </div>
              </div>

              {/* Camera SECOND */}
              <div className={`flex items-start gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                <div className="mt-1 text-emerald-500">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>Camera Access</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>Required for scanning QR codes directly from your camera.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGrantPermissions}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/30"
              >
                Allow Permissions
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("nazu_permissions_granted", "true");
                  setShowPermissionModal(false);
                }}
                className={`w-full py-3 text-sm font-medium transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Skip for now
              </button>
            </div>

            <p className="text-[10px] text-center mt-6 text-slate-500 uppercase tracking-widest font-medium">
              Your privacy is our priority
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`border-b px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md ${isDarkMode ? 'bg-zinc-950/80 border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white p-2">
            <QrCode className="w-full h-full" strokeWidth={2.5} />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Nazu QR Scanner
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* QR Types */}
          <div className={`rounded-xl shadow-lg border p-6 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-black/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {QR_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-200 ${isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-sm"
                      : isDarkMode
                        ? "border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        : "border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 1: Content */}
          <div className={`rounded-xl shadow-lg border p-6 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-black/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className={`${isDarkMode ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-white'} w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold`}>
                1
              </span>
              Complete the content
            </h2>

            {/* Dynamic Form based on selectedType */}
            <div className="space-y-4">
              {selectedType === "link" && (
                <div className="space-y-2">
                  <label className={labelClass}>
                    Enter your Website
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {selectedType === "text" && (
                <div className="space-y-2">
                  <label className={labelClass}>
                    Enter your Text
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className={`${whiteInputClass} h-32 resize-none`}
                    placeholder="Enter your message here..."
                  />
                </div>
              )}

              {selectedType === "email" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Email to
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className={whiteInputClass}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubj}
                      onChange={(e) => setEmailSubj(e.target.value)}
                      className={whiteInputClass}
                      placeholder="Email Subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Message
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className={`${whiteInputClass} h-24 resize-none`}
                      placeholder="Your message..."
                    />
                  </div>
                </>
              )}

              {selectedType === "call" && (
                <div className="space-y-2">
                  <label className={labelClass}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    className={whiteInputClass}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              )}

              {selectedType === "sms" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={smsNum}
                      onChange={(e) => setSmsNum(e.target.value)}
                      className={whiteInputClass}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Message
                    </label>
                    <textarea
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      className={`${whiteInputClass} h-24 resize-none`}
                      placeholder="Your message..."
                    />
                  </div>
                </>
              )}

              {selectedType === "whatsapp" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className={whiteInputClass}
                      placeholder="+12345678900 (Include country code)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Message
                    </label>
                    <textarea
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      className={`${whiteInputClass} h-24 resize-none`}
                      placeholder="Your message..."
                    />
                  </div>
                </>
              )}

              {selectedType === "wifi" && (
                <>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className={whiteInputClass}
                      placeholder="My WiFi Network"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className={whiteInputClass}
                      placeholder="Password"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Encryption
                      </label>
                      <select
                        value={wifiEnc}
                        onChange={(e) => setWifiEnc(e.target.value)}
                        className={whiteInputClass}
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-8">
                      <input
                        type="checkbox"
                        id="hidden"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="hidden"
                        className={labelClass}
                      >
                        Hidden Network
                      </label>
                    </div>
                  </div>
                </>
              )}

              {selectedType === "vcard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={vcard.firstName}
                      onChange={(e) =>
                        setVcard({ ...vcard, firstName: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={vcard.lastName}
                      onChange={(e) =>
                        setVcard({ ...vcard, lastName: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={vcard.phone}
                      onChange={(e) =>
                        setVcard({ ...vcard, phone: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={vcard.email}
                      onChange={(e) =>
                        setVcard({ ...vcard, email: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Company
                    </label>
                    <input
                      type="text"
                      value={vcard.company}
                      onChange={(e) =>
                        setVcard({ ...vcard, company: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="Company Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={vcard.job}
                      onChange={(e) =>
                        setVcard({ ...vcard, job: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="Developer"
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className={labelClass}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={vcard.website}
                      onChange={(e) =>
                        setVcard({ ...vcard, website: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className={labelClass}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={vcard.address}
                      onChange={(e) =>
                        setVcard({ ...vcard, address: e.target.value })
                      }
                      className={whiteInputClass}
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Design */}
          <div className={`rounded-xl shadow-lg border p-6 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-black/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className={`${isDarkMode ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-white'} w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold`}>
                2
              </span>
              Design your QR Code
            </h2>

            {/* Design Tabs */}
            <div className={`flex border-b mb-6 overflow-x-auto scrollbar-hide ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              {["Frame", "Shape", "Colors", "Logo"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDesignTab(tab.toLowerCase())}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeDesignTab === tab.toLowerCase()
                    ? "border-emerald-500 text-emerald-500"
                    : isDarkMode
                      ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Frame Tab Content */}
            {activeDesignTab === "frame" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Frame Selector */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {FRAME_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setFrameStyle(style.id)}
                      className={`flex-shrink-0 w-24 h-24 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${frameStyle === style.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : isDarkMode
                          ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                          : "border-slate-200 hover:border-slate-300 text-slate-500"
                        }`}
                    >
                      <div className="w-8 h-8 border-2 border-current rounded border-dashed opacity-50"></div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Frame phrase
                    </label>
                    <input
                      type="text"
                      value={framePhrase}
                      onChange={(e) => setFramePhrase(e.target.value)}
                      disabled={frameStyle === "none"}
                      className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Phrase font
                    </label>
                    <select
                      value={frameFont}
                      onChange={(e) => setFrameFont(e.target.value)}
                      disabled={frameStyle === "none"}
                      className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="'Outfit', sans-serif">Outfit</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                      <option value="'Kalam', cursive">Kalam (Handwritten)</option>
                      <option value="'Pacifico', cursive">Pacifico</option>
                      <option value="'Dancing Script', cursive">Dancing Script</option>
                      <option value="'Bebas Neue', cursive">Bebas Neue</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="system-ui, sans-serif">System Default</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className={frameStyle === "none" ? "opacity-50 pointer-events-none" : ""}>
                      <ColorPicker
                        label="Frame color"
                        color={frameColor}
                        onChange={setFrameColor}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Tab Content */}
            {activeDesignTab === "logo" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Add a logo to the center of your QR code. Recommended size is 1:1.
                </p>

                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="space-y-3">
                    <label className={labelClass}>Upload Logo</label>
                    <div className="flex items-center gap-4">
                      {logo ? (
                        <div className="relative group">
                          <div className={`w-20 h-20 rounded-xl border flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                          <button
                            onClick={() => setLogo(null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDarkMode ? 'border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5' : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                          <Upload size={20} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                          <span className="text-[10px] mt-1 font-medium uppercase tracking-wider text-slate-500">Upload</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setLogo(event.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className={labelClass}>Logo Size</label>
                          <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {Math.round(logoSize * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="0.5"
                          step="0.05"
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Clearance / Margin */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Logo Clearance (Space)</label>
                      <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {logoMargin}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="2"
                      value={logoMargin}
                      onChange={(e) => setLogoMargin(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Adjust the empty space around the logo to prevent dots from touching it.
                    </p>
                  </div>

                  {/* Preset Logos */}
                  <div className="space-y-3">
                    <label className={labelClass}>Popular Logos</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {[
                        { id: 'google', url: 'https://www.google.com/favicon.ico' },
                        { id: 'facebook', url: 'https://www.facebook.com/favicon.ico' },
                        { id: 'instagram', url: 'https://www.instagram.com/favicon.ico' },
                        { id: 'twitter', url: 'https://twitter.com/favicon.ico' },
                        { id: 'linkedin', url: 'https://www.linkedin.com/favicon.ico' },
                        { id: 'github', url: 'https://github.com/favicon.ico' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setLogo(preset.url)}
                          className={`aspect-square rounded-lg border flex items-center justify-center p-2 transition-all ${logo === preset.url
                            ? "border-emerald-500 bg-emerald-500/10"
                            : isDarkMode
                              ? "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/60"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50"
                            }`}
                        >
                          <img src={preset.url} alt={preset.id} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Background Area */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Logo Background
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {logoBgImage ? (
                          <div className="relative group">
                            <div className={`w-20 h-20 rounded-xl border flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                              <img src={logoBgImage} alt="Logo BG" className="max-w-full max-h-full object-cover" />
                            </div>
                            <button
                              onClick={() => setLogoBgImage(null)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDarkMode ? 'border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5' : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                            <ImageIcon size={20} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                            <span className="text-[10px] mt-1 font-medium uppercase tracking-wider text-slate-500">BG Image</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setLogoBgImage(event.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}

                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className={labelClass}>BG Size</label>
                              <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {Math.round(logoBgSize * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="0.6"
                              step="0.05"
                              value={logoBgSize}
                              onChange={(e) => setLogoBgSize(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className={labelClass}>BG Opacity</label>
                              <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {Math.round(logoBgOpacity * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={logoBgOpacity}
                              onChange={(e) => setLogoBgOpacity(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeDesignTab === "shape" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Shape customization provides different patterns for the QR
                  code data modules.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>
                      Dot Pattern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {DOT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setDotsType(type.id as DotType)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${dotsType === type.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                            : isDarkMode
                              ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                              : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Corner Square Pattern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CORNER_SQUARE_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() =>
                            setCornersSquareType(type.id as CornerSquareType)
                          }
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${cornersSquareType === type.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                            : isDarkMode
                              ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                              : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Corner Dot Pattern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CORNER_DOT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() =>
                            setCornersDotType(type.id as CornerDotType)
                          }
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${cornersDotType === type.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                            : isDarkMode
                              ? "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                              : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
                    <input
                      type="checkbox"
                      id="gradient"
                      checked={isGradient}
                      onChange={(e) => setIsGradient(e.target.checked)}
                      className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div>
                      <label
                        htmlFor="gradient"
                        className={`text-sm font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}
                      >
                        Stylish Gradient Effect
                      </label>
                      <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                        Apply a premium radial gradient to all shapes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Colors Tab Content */}
            {activeDesignTab === "colors" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ColorPicker
                    label="Foreground Color"
                    color={qrFgColor}
                    onChange={setQrFgColor}
                    isDarkMode={isDarkMode}
                  />
                  <ColorPicker
                    label="Background Color"
                    color={qrBgColor}
                    onChange={setQrBgColor}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview & Download */}
        <div className="space-y-6">
          <div className={`rounded-xl shadow-lg border p-6 flex flex-col items-center sticky top-24 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800 shadow-black/40' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className={`text-lg font-semibold mb-6 flex items-center gap-3 self-start ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <span className={`${isDarkMode ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-white'} w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold`}>
                3
              </span>
              Download QR Code
            </h2>

            {/* QR Preview Area */}
            <div className={`p-8 rounded-2xl mb-8 w-full flex items-center justify-center min-h-[400px] transition-colors ${isDarkMode ? 'bg-zinc-800 shadow-inner border border-zinc-700' : 'bg-slate-50 border border-slate-100'}`}>
              <div ref={qrRef} className="flex items-center justify-center">
                {(() => {
                  const qrSize = 200;
                  const qrWrapper = (
                    <div
                      className="bg-white p-2 rounded-lg relative z-10"
                      style={{ backgroundColor: qrBgColor }}
                    >
                      <div className="relative">
                        <StyledQRCode
                          data={qrContent || "https://qr.io"}
                          size={qrSize}
                          fgColor={qrFgColor}
                          bgColor={qrBgColor}
                          dotsType={dotsType}
                          cornersSquareType={cornersSquareType}
                          cornersDotType={cornersDotType}
                          isGradient={isGradient}
                          logo={(logo || logoBgImage) ? transparentPixel : null}
                          logoSize={Math.max(logoSize, logoBgSize)}
                          logoMargin={logoMargin}
                        />
                        {logoBgImage && (
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-lg"
                            style={{
                              width: `${logoBgSize * 100}%`,
                              height: `${logoBgSize * 100}%`,
                              opacity: logoBgOpacity,
                            }}
                          >
                            <img src={logoBgImage} className="w-full h-full object-cover" />
                          </div>
                        )}
                        {logo && (
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                            style={{
                              width: `${logoSize * 100}%`,
                              height: `${logoSize * 100}%`,
                            }}
                          >
                            <img src={logo} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  const textElement = (color = "#ffffff") => (
                    <div
                      className="font-bold text-center px-2 truncate w-full"
                      style={{
                        color,
                        fontFamily: frameFont,
                        fontSize: "32px",
                        lineHeight: "1",
                        letterSpacing: "2px",
                      }}
                    >
                      {framePhrase}
                    </div>
                  );

                  switch (frameStyle) {
                    case "none":
                      return qrWrapper;

                    case "bottom-block":
                      return (
                        <div
                          className="flex flex-col rounded-xl overflow-hidden"
                          style={{
                            border: `4px solid ${frameColor}`,
                            backgroundColor: frameColor,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="bg-white p-4">{qrWrapper}</div>
                          <div className="h-12 flex items-center justify-center">
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "bottom-tooltip":
                      return (
                        <div
                          className="flex flex-col rounded-xl overflow-hidden"
                          style={{
                            border: `4px solid ${frameColor}`,
                            backgroundColor: frameColor,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="bg-white p-4 relative">
                            {qrWrapper}
                            <div
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-transparent"
                              style={{ borderBottomColor: frameColor }}
                            />
                          </div>
                          <div className="h-12 flex items-center justify-center">
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "top-block":
                      return (
                        <div
                          className="flex flex-col rounded-xl overflow-hidden"
                          style={{
                            border: `4px solid ${frameColor}`,
                            backgroundColor: frameColor,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="h-12 flex items-center justify-center">
                            {textElement("#ffffff")}
                          </div>
                          <div className="bg-white p-4">{qrWrapper}</div>
                        </div>
                      );

                    case "top-tooltip":
                      return (
                        <div className="flex flex-col items-center w-full max-w-[280px]">
                          <div
                            className="w-[90%] rounded-2xl h-[72px] flex items-center justify-center relative z-10"
                            style={{ backgroundColor: frameColor }}
                          >
                            {textElement("#ffffff")}
                            <div
                              className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[16px] border-transparent"
                              style={{ borderTopColor: frameColor }}
                            />
                          </div>
                          <div
                            className="bg-white p-3 rounded-3xl mt-2 w-full"
                            style={{ border: `12px solid ${frameColor}` }}
                          >
                            {qrWrapper}
                          </div>
                        </div>
                      );

                    case "bottom-pill":
                      return (
                        <div className="relative pb-6">
                          <div
                            className="bg-white p-4 rounded-xl"
                            style={{ border: `4px solid ${frameColor}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                          >
                            {qrWrapper}
                          </div>
                          <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-10 px-6 rounded-full flex items-center justify-center whitespace-nowrap min-w-[140px]"
                            style={{ backgroundColor: frameColor, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' }}
                          >
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "bottom-pill-icon":
                      return (
                        <div className="relative pb-6">
                          <div
                            className="bg-white p-4 rounded-xl"
                            style={{ border: `4px solid ${frameColor}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                          >
                            {qrWrapper}
                          </div>
                          <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-10 pl-2 pr-6 rounded-full flex items-center justify-center whitespace-nowrap min-w-[140px] gap-2"
                            style={{ backgroundColor: frameColor, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' }}
                          >
                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shrink-0">
                              <Scan size={14} color={frameColor} />
                            </div>
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "bottom-text":
                      return (
                        <div className="flex flex-col items-center">
                          <div
                            className="bg-white p-4 rounded-xl mb-3"
                            style={{ border: `4px solid ${frameColor}`, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                          >
                            {qrWrapper}
                          </div>
                          <div className="h-8 flex items-center justify-center">
                            {textElement(frameColor)}
                          </div>
                        </div>
                      );

                    case "phone":
                      return (
                        <div
                          className="flex flex-col rounded-[28px] overflow-hidden relative"
                          style={{
                            border: `8px solid ${frameColor}`,
                            backgroundColor: frameColor,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="h-10 flex items-center justify-center">
                            <div className="w-14 h-1.5 bg-white/40 rounded-full" />
                          </div>
                          <div className="bg-white p-4 mx-1 rounded-sm">
                            {qrWrapper}
                          </div>
                          <div className="h-16 flex items-center justify-center">
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "clipboard":
                      return (
                        <div className="relative pt-5">
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-7 rounded-t-lg z-20 flex justify-center"
                            style={{ backgroundColor: frameColor }}
                          >
                            <div className="w-10 h-2 bg-white/40 rounded-full mt-1.5" />
                            <div
                              className="absolute -top-2 w-6 h-4 rounded-t-full"
                              style={{ backgroundColor: frameColor }}
                            ></div>
                            <div className="absolute -top-1 w-3 h-2 bg-white/40 rounded-full" />
                          </div>
                          <div
                            className="bg-white p-4 rounded-xl flex flex-col pt-6"
                            style={{ border: `4px solid ${frameColor}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          >
                            {qrWrapper}
                            <div className="mt-4 border-t-2 border-dashed pt-4 flex justify-center items-center" style={{ borderColor: `${frameColor}40` }}>
                              {textElement(frameColor)}
                            </div>
                          </div>
                        </div>
                      );

                    case "polaroid":
                      return (
                        <div
                          className="bg-white p-3 pb-12 rounded shadow-2xl flex flex-col relative"
                        >
                          {qrWrapper}
                          <div className="absolute bottom-2 left-0 w-full flex justify-center h-10 items-center">
                            {textElement("#333333")}
                          </div>
                        </div>
                      );

                    case "neon-border":
                      return (
                        <div
                          className="p-4 rounded-xl flex flex-col items-center"
                          style={{
                            border: `4px solid ${frameColor}`,
                            boxShadow: `0 0 15px ${frameColor}90, inset 0 0 10px ${frameColor}60`,
                            backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
                          }}
                        >
                          <div className="bg-white p-2 mb-3 rounded-lg shadow-inner">{qrWrapper}</div>
                          <div className="h-8 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                            {textElement(frameColor)}
                          </div>
                        </div>
                      );

                    case "floating-badge":
                      return (
                        <div className="relative pt-6 px-4 pb-4 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100">
                          <div
                            className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-lg z-10 whitespace-nowrap border-2 border-white"
                            style={{ backgroundColor: frameColor }}
                          >
                            {textElement("#ffffff")}
                          </div>
                          <div className="pt-2">{qrWrapper}</div>
                        </div>
                      );
                    case "bag":
                      return (
                        <div className="relative pt-12 w-full max-w-[280px]">
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-[16px] border-b-0 rounded-t-3xl z-0"
                            style={{ borderColor: frameColor }}
                          />
                          <div
                            className="flex flex-col rounded-[32px] overflow-hidden relative z-10"
                            style={{
                              backgroundColor: frameColor,
                              padding: "16px",
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <div className="bg-white p-4 rounded-2xl">
                              {qrWrapper}
                            </div>
                            <div className="h-20 flex items-center justify-center mt-2">
                              {textElement("#ffffff")}
                            </div>
                          </div>
                        </div>
                      );

                    case "clapperboard":
                      return (
                        <div
                          className="flex flex-col rounded-xl overflow-hidden"
                          style={{
                            border: `4px solid ${frameColor}`,
                            backgroundColor: frameColor,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="h-10 w-full relative overflow-hidden bg-white">
                            <div
                              className="absolute inset-0 flex"
                              style={{
                                width: "150%",
                                transform: "translateX(-10%)",
                              }}
                            >
                              {[...Array(10)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-full w-8 skew-x-[-30deg] border-r-4"
                                  style={{
                                    backgroundColor:
                                      i % 2 === 0 ? frameColor : "#ffffff",
                                    borderColor: frameColor,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <div
                            className="bg-white p-4 border-t-4"
                            style={{ borderColor: frameColor }}
                          >
                            {qrWrapper}
                          </div>
                          <div className="h-12 flex items-center justify-center">
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "top-ribbon":
                      return (
                        <div className="relative w-full max-w-[280px] mt-6 flex flex-col items-center">
                          <div
                            className="bg-white p-3 pt-[48px] rounded-3xl w-full relative z-10"
                            style={{ border: `12px solid ${frameColor}` }}
                          >
                            {qrWrapper}
                          </div>

                          <div
                            className="absolute -top-[12px] left-[-8px] right-[-8px] h-[64px] z-20 flex items-center justify-center"
                            style={{ backgroundColor: frameColor }}
                          >
                            {textElement("#ffffff")}

                            <div
                              className="absolute top-[20px] -left-[24px] w-[32px] h-[56px] -z-10"
                              style={{
                                backgroundColor: frameColor,
                                clipPath:
                                  "polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)",
                              }}
                            />
                            <div
                              className="absolute top-[64px] left-[0px] w-[12px] h-[12px] -z-10"
                              style={{
                                backgroundColor: "#000000",
                                opacity: 0.4,
                                clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                              }}
                            />

                            <div
                              className="absolute top-[20px] -right-[24px] w-[32px] h-[56px] -z-10"
                              style={{
                                backgroundColor: frameColor,
                                clipPath:
                                  "polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%)",
                              }}
                            />
                            <div
                              className="absolute top-[64px] right-[0px] w-[12px] h-[12px] -z-10"
                              style={{
                                backgroundColor: "#000000",
                                opacity: 0.4,
                                clipPath: "polygon(0 0, 0 100%, 100% 0)",
                              }}
                            />
                          </div>
                        </div>
                      );

                    case "bottom-ribbon":
                      return (
                        <div className="relative w-full max-w-[280px] mb-6 flex flex-col items-center">
                          <div
                            className="bg-white p-3 pb-[48px] rounded-3xl w-full relative z-10"
                            style={{ border: `12px solid ${frameColor}` }}
                          >
                            {qrWrapper}
                          </div>

                          <div
                            className="absolute -bottom-[12px] left-[-8px] right-[-8px] h-[64px] z-20 flex items-center justify-center"
                            style={{ backgroundColor: frameColor }}
                          >
                            {textElement("#ffffff")}

                            <div
                              className="absolute bottom-[20px] -left-[24px] w-[32px] h-[56px] -z-10"
                              style={{
                                backgroundColor: frameColor,
                                clipPath:
                                  "polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)",
                              }}
                            />
                            <div
                              className="absolute bottom-[64px] left-[0px] w-[12px] h-[12px] -z-10"
                              style={{
                                backgroundColor: "#000000",
                                opacity: 0.4,
                                clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
                              }}
                            />

                            <div
                              className="absolute bottom-[20px] -right-[24px] w-[32px] h-[56px] -z-10"
                              style={{
                                backgroundColor: frameColor,
                                clipPath:
                                  "polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%)",
                              }}
                            />
                            <div
                              className="absolute bottom-[64px] right-[0px] w-[12px] h-[12px] -z-10"
                              style={{
                                backgroundColor: "#000000",
                                opacity: 0.4,
                                clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                              }}
                            />
                          </div>
                        </div>
                      );

                    case "circular":
                      return (
                        <div
                          className="flex flex-col items-center justify-center rounded-full p-6 relative"
                          style={{
                            backgroundColor: frameColor,
                            width: 280,
                            height: 280,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="bg-white p-4 rounded-full flex items-center justify-center w-full h-full overflow-hidden relative">
                            <StyledQRCode
                              data={qrContent || "https://qr.io"}
                              size={180}
                              fgColor={qrFgColor}
                              bgColor={qrBgColor}
                              dotsType={dotsType}
                              cornersSquareType={cornersSquareType}
                              cornersDotType={cornersDotType}
                              isGradient={isGradient}
                              logo={(logo || logoBgImage) ? transparentPixel : null}
                              logoSize={Math.max(logoSize, logoBgSize)}
                              logoMargin={logoMargin}
                            />
                            {logoBgImage && (
                              <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden rounded-lg"
                                style={{
                                  width: `${logoBgSize * 180}px`,
                                  height: `${logoBgSize * 180}px`,
                                  opacity: logoBgOpacity,
                                }}
                              >
                                <img src={logoBgImage} className="w-full h-full object-cover" />
                              </div>
                            )}
                            {logo && (
                              <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                                style={{
                                  width: `${logoSize * 180}px`,
                                  height: `${logoSize * 180}px`,
                                }}
                              >
                                <img src={logo} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "speech-bubble":
                      return (
                        <div className="flex flex-col items-center w-full max-w-[280px]">
                          <div
                            className="flex flex-col rounded-3xl overflow-hidden w-full relative z-10"
                            style={{
                              border: `12px solid ${frameColor}`,
                              backgroundColor: frameColor,
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <div className="bg-white p-3 rounded-2xl">
                              {qrWrapper}
                            </div>
                            <div className="h-16 flex items-center justify-center">
                              {textElement("#ffffff")}
                            </div>
                          </div>
                          <div
                            className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[24px] border-transparent relative -top-2 z-0"
                            style={{ borderTopColor: frameColor }}
                          />
                        </div>
                      );

                    case "bottom-block-rounded":
                      return (
                        <div className="flex flex-col w-full max-w-[280px]">
                          <div
                            className="bg-white p-4 rounded-t-3xl border-t-[12px] border-l-[12px] border-r-[12px] pb-8"
                            style={{ borderColor: frameColor }}
                          >
                            {qrWrapper}
                          </div>
                          <div
                            className="h-16 flex items-center justify-center rounded-t-3xl relative -mt-6 z-10"
                            style={{ backgroundColor: frameColor }}
                          >
                            {textElement("#ffffff")}
                          </div>
                        </div>
                      );

                    case "side-arrows":
                      return (
                        <div className="flex items-center justify-center w-full max-w-[320px]">
                          <div
                            className="w-0 h-0 border-t-[16px] border-b-[16px] border-r-[20px] border-transparent relative -mr-2 z-0"
                            style={{ borderRightColor: frameColor }}
                          />
                          <div
                            className="flex flex-col rounded-3xl overflow-hidden w-full max-w-[260px] relative z-10"
                            style={{
                              border: `12px solid ${frameColor}`,
                              backgroundColor: frameColor,
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            }}
                          >
                            <div className="bg-white p-3 rounded-2xl">
                              {qrWrapper}
                            </div>
                            <div className="h-16 flex items-center justify-center">
                              {textElement("#ffffff")}
                            </div>
                          </div>
                          <div
                            className="w-0 h-0 border-t-[16px] border-b-[16px] border-l-[20px] border-transparent relative -ml-2 z-0"
                            style={{ borderLeftColor: frameColor }}
                          />
                        </div>
                      );

                    case "top-pill-overlap":
                      return (
                        <div className="relative pt-6 w-full max-w-[280px]">
                          <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 h-12 px-8 rounded-full flex items-center justify-center z-20 min-w-[160px]"
                            style={{ backgroundColor: frameColor }}
                          >
                            {textElement("#ffffff")}
                          </div>
                          <div
                            className="bg-white p-4 pt-8 rounded-3xl relative z-10"
                            style={{ border: `12px solid ${frameColor}` }}
                          >
                            {qrWrapper}
                          </div>
                        </div>
                      );

                    case "top-block-rounded":
                      return (
                        <div
                          className="flex flex-col rounded-[32px] overflow-hidden w-full max-w-[280px]"
                          style={{
                            border: `12px solid ${frameColor}`,
                            backgroundColor: frameColor,
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="h-20 flex items-center justify-center">
                            {textElement("#ffffff")}
                          </div>
                          <div className="bg-white p-4 rounded-[20px]">
                            {qrWrapper}
                          </div>
                        </div>
                      );

                    default:
                      return qrWrapper;
                  }
                })()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 w-full">
              {(["png", "jpg", "pdf"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setDownloadFormat(fmt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${downloadFormat === fmt
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transform active:scale-[0.98]"
            >
              <Download size={20} />
              Download Ultra-HD {downloadFormat.toUpperCase()}
            </button>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Professional {downloadFormat.toUpperCase()} format. No signup required.
            </p>
          </div>
        </div >
      </main >

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`relative max-w-md w-full rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}>
            <button
              onClick={() => setShowSettingsModal(false)}
              className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Settings size={24} className="text-emerald-500" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
                <p className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>Customize your app experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                  Storage & Saving
                </span>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "Gallery", label: "Phone Gallery", desc: "Saves to DCIM folder", icon: ImageIcon },
                    { id: "Documents", label: "Documents", desc: "Native documents folder", icon: Folder },
                    { id: "Custom", label: "Custom Folder", desc: "Specify a subfolder", icon: HardDrive },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSaveToFolder(option.id);
                        localStorage.setItem("nazu_qr_save_folder", option.id);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${saveToFolder === option.id
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : isDarkMode ? 'border-zinc-800 bg-zinc-800/30' : 'border-slate-100 bg-slate-50'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${saveToFolder === option.id ? 'bg-emerald-500 text-white' : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-slate-400 border border-slate-100'
                        }`}>
                        <option.icon size={20} />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{option.label}</p>
                        <p className="text-[10px] text-zinc-500">{option.desc}</p>
                      </div>
                      {saveToFolder === option.id && (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <ShieldCheck size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {saveToFolder === "Custom" && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                    <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                      Subfolder Name (under Documents)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customFolderPath}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "");
                          setCustomFolderPath(val);
                          localStorage.setItem("nazu_qr_custom_folder", val);
                        }}
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-slate-100 text-slate-900 focus:border-emerald-500'}`}
                        placeholder="MyQRCodes"
                      />
                      <Folder size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2">
                      Will be saved in: /Documents/{customFolderPath || 'Custom'}
                    </p>
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/80' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                <Info size={18} className="shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Tip: Use <b>Phone Gallery</b> for easiest access. QR codes will show up in your recent photos instantly.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <div className={`flex items-center justify-between p-4 rounded-2xl ${isDarkMode ? 'bg-zinc-800/30' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <Heart size={16} className="text-rose-500 fill-rose-500" />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Version 2.0.0</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">Build #774</span>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800/50">
                <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                  Data Management
                </span>

                <div className={`p-4 rounded-2xl border mb-4 flex items-center justify-between transition-all ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Caching System Active</p>
                      <p className={`text-[10px] opacity-70 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Auto-saving your progress & settings</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm("Reset all settings and clear cache? Your current design will be lost.")) {
                      localStorage.removeItem("nazu_qr_app_state");
                      localStorage.removeItem("nazu_qr_save_folder");
                      localStorage.removeItem("nazu_qr_custom_folder");
                      localStorage.removeItem("nazu_permissions_granted");
                      window.location.reload();
                    }
                  }}
                  className={`w-full py-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-sm ${isDarkMode
                    ? 'border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40'
                    : 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200'
                    }`}
                >
                  <X size={18} />
                  Reset to Factory Settings
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 transform active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <footer className={`py-12 text-center border-t transition-colors ${isDarkMode ? 'border-zinc-900 bg-zinc-950/50 text-zinc-600' : 'border-slate-100 bg-slate-50/50 text-slate-400'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <QrCode size={12} className="text-emerald-500" />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase">Nazu QR Scanner</p>
        </div>
        <p className="text-sm font-medium">Developed by <span className="text-emerald-500">Md Nazmul Hassan</span></p>
        <div className="mt-4 flex items-center justify-center gap-4 opacity-50">
          <div className="w-1 h-1 rounded-full bg-current"></div>
          <p className="text-[10px] uppercase tracking-[0.2em]">Privacy First</p>
          <div className="w-1 h-1 rounded-full bg-current"></div>
          <p className="text-[10px] uppercase tracking-[0.2em]">Ultra HD Quality</p>
          <div className="w-1 h-1 rounded-full bg-current"></div>
        </div>
      </footer>
    </div >
  );
}
