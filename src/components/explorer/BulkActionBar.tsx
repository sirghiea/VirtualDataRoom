import { Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onClearSelection,
}: BulkActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#111118]/95 backdrop-blur-xl px-5 py-3 shadow-2xl shadow-black/60 ring-1 ring-white/[0.04]"
    >
      <span className="text-sm font-medium text-foreground tabular-nums">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="h-5 w-[1px] bg-white/[0.08]" />

      <Button
        variant="destructive"
        size="sm"
        className="h-8 text-xs"
        onClick={onDelete}
      >
        <Trash2 size={14} />
        Delete
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted hover:text-foreground"
        onClick={onClearSelection}
      >
        <X size={14} />
      </Button>
    </motion.div>
  );
}
