declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  
  export const Apple: FC<IconProps>;
  export const Leaf: FC<IconProps>;
  // Add other icons as needed
} 