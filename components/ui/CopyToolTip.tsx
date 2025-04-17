"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface CopyTooltipProps {
  key?: number | string;
  prefix?: string;
  suffix?: string;
  content: string;
  triggerContent: React.ReactNode;
  className?: string;
}

const CopyTooltip = ({
  prefix, 
  suffix, 
  content, 
  triggerContent,
  className = "" 
}: CopyTooltipProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <motion.span 
            initial={{ scale: 1 }} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }} 
            className={`cursor-help ${className}`}
            >
            {triggerContent}
            </motion.span>
        </TooltipTrigger>
        <TooltipContent className="flex items-center space-x-2 p-3">
          <div className="flex items-center">
            {prefix && <span className="text-gray-400 mr-1">{prefix}</span>}
            <span className="font-medium">{content}</span>
            {suffix && <span className="text-gray-400 ml-1">{suffix}</span>}
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 w-7 p-0 ml-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
              onClick={handleCopy}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                    <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    >
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Copy className="h-3.5 w-3.5 text-blue-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyTooltip;
