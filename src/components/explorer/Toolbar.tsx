import { useRef } from 'react';
import { FolderPlus, Upload } from 'lucide-react';

interface ToolbarProps {
  onNewFolder: () => void;
  onUploadFile: (file: File) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Toolbar({ onNewFolder, onUploadFile }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }

    if (file.size === 0) {
      alert('Cannot upload empty file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File exceeds 50MB limit.');
      return;
    }

    onUploadFile(file);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onNewFolder}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-foreground hover:bg-white/10 transition-colors"
      >
        <FolderPlus size={16} />
        <span className="hidden sm:inline">New Folder</span>
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 rounded-lg bg-primary/90 px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary transition-all shadow-lg shadow-primary/20"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Upload PDF</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
