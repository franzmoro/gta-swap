import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';
import { ReactNode } from 'react';

const InfoButton = ({ content }: { content: ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip useTouch>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 fill-foreground text-primary-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs border" side="bottom" sideOffset={10}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoButton;
