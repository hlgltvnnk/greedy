import { JSX } from 'react';
import { toast } from 'react-toastify';

const defaultToastOptions = {
  autoClose: 3000,
};

const createToastOptions = (className: string, bodyClassName: string) => ({
  ...defaultToastOptions,
  className,
  bodyClassName,
});

const defaultOptions = createToastOptions('default-toast', 'success-toast-body');

type ToastType = 'success' | 'warning' | 'error';

interface ToastOptions {
  link?: {
    text: string;
    href: string;
    target?: '_blank' | '_self';
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const showToast = (type: ToastType, message: string, options: ToastOptions = {}) => {
  const toastOptions = {
    success: defaultOptions,
    warning: defaultOptions,
    error: defaultOptions,
  }[type];

  const { link, ...restOptions } = options;

  const content: JSX.Element | string = link ? (
    <span>
      {message}{' '}
      <a
        href={link.href}
        target={link.target ?? '_blank'}
        rel="noopener noreferrer"
        className="toast-link underline">
        {link.text}
      </a>
    </span>
  ) : (
    message
  );

  toast[type](content, { ...toastOptions, ...restOptions });
};
