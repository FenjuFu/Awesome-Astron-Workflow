import { Bot, FileText, Languages, PenTool, Mic, GraduationCap, Zap } from 'lucide-react';

export type IconName = 'bot' | 'file-text' | 'languages' | 'pen-tool' | 'mic' | 'graduation-cap' | 'zap';

export const getIcon = (name: string) => {
  const icons = {
    'bot': Bot,
    'file-text': FileText,
    'languages': Languages,
    'pen-tool': PenTool,
    'mic': Mic,
    'graduation-cap': GraduationCap,
    'zap': Zap
  };
  
  return icons[name as IconName];
};