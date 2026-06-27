import { X } from 'lucide-react';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Button } from '@/components/ui/button';

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4200}
      hideProgressBar
      newestOnTop
      closeOnClick={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      transition={Slide}
      icon={false}
      className="top-16 w-[36rem] max-w-[calc(100vw-2rem)] p-0"
      toastClassName={() =>
        'rounded-r8 border border-border !bg-popover px-4 py-3 !text-popover-foreground shadow-2xl'
      }
      closeButton={({ closeToast }) => (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-4 top-4 size-8 rounded-r8 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
          onClick={closeToast}
          aria-label="Dismiss notification"
        >
          <X className="size-5" />
        </Button>
      )}
    />
  );
}