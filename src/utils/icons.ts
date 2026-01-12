import { 
  Bot, 
  FileText, 
  Languages, 
  PenTool, 
  Mic, 
  GraduationCap, 
  Zap,
  Map,
  Briefcase,
  BookOpen,
  Image,
  Layers,
  Edit3,
  Palette
} from 'lucide-react';

export type IconName = 
  | 'bot' 
  | 'file-text' 
  | 'languages' 
  | 'pen-tool' 
  | 'mic' 
  | 'graduation-cap' 
  | 'zap'
  | 'map'
  | 'briefcase'
  | 'book-open'
  | 'image'
  | 'layers'
  | 'edit-3';

export const getIcon = (name: string) => {
  const icons = {
    'bot': Bot,
    'file-text': FileText,
    'languages': Languages,
    'pen-tool': PenTool,
    'mic': Mic,
    'graduation-cap': GraduationCap,
    'zap': Zap,
    'map': Map,
    'briefcase': Briefcase,
    'book-open': BookOpen,
    'image': Image,
    'layers': Layers,
    'edit-3': Edit3
  };
  
  return icons[name as IconName];
};
