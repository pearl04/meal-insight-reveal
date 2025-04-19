
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  
  export const Apple: FC<IconProps>;
  export const Leaf: FC<IconProps>;
  export const X: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const Plus: FC<IconProps>;
  export const Utensils: FC<IconProps>;
  export const Camera: FC<IconProps>;
  export const Upload: FC<IconProps>;
  export const Key: FC<IconProps>;
  export const Info: FC<IconProps>;
  export const ArrowLeft: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const ChevronRight: FC<IconProps>;
  export const MoreHorizontal: FC<IconProps>;
  export const ChevronLeft: FC<IconProps>;
  export const ArrowRight: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const Circle: FC<IconProps>;
  export const Dot: FC<IconProps>;
  export const GripVertical: FC<IconProps>;
  export const ChevronUp: FC<IconProps>;
  export const PanelLeft: FC<IconProps>;
  export const AlertTriangle: FC<IconProps>;
  export const MessageCircle: FC<IconProps>;
  export const LogIn: FC<IconProps>; // Added this line
} 
