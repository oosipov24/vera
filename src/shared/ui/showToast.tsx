import { toast } from 'react-toastify';

import { ToastContent } from './ToastContent';

export const showToast = {
  success: (title: string, message?: string) =>
    toast(<ToastContent type="success" title={title} message={message} />, {
      type: 'success',
    }),

  error: (title: string, message?: string) =>
    toast(<ToastContent type="error" title={title} message={message} />, {
      type: 'error',
    }),

  info: (title: string, message?: string) =>
    toast(<ToastContent type="info" title={title} message={message} />, {
      type: 'info',
    }),
};