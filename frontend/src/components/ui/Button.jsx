import { Button as FlowbiteButton, Spinner } from 'flowbite-react';
import { clsx } from 'clsx';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  ...props
}) => {
  // Map variants to Flowbite colors using SBCC theme
  const variantMap = {
    primary: 'warning',
    secondary: 'gray',
    success: 'success',
    danger: 'failure',
    warning: 'yellow',
    info: 'info',
  };

  return (
    <FlowbiteButton
      color={variantMap[variant]}
      size={size}
      disabled={disabled || loading}
      className={clsx(
        '!border-none shadow-[0_16px_32px_rgba(31,41,55,0.12)] hover:shadow-[0_24px_48px_rgba(31,41,55,0.18)] transition-shadow',
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" light />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {Icon && iconPosition === 'left' && <Icon className="h-5 w-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="h-5 w-5" />}
        </div>
      )}
    </FlowbiteButton>
  );
};

export const PrimaryButton = ({
  children,
  icon: Icon,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm
        bg-sbcc-gradient text-white font-medium rounded-md
        hover:opacity-90 active:scale-95
        transition-all duration-200 shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
};

export const SecondaryButton = ({
  children,
  icon: Icon,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm
        bg-white text-sbcc-dark font-medium rounded-md
        border border-gray-200
        hover:bg-sbcc-light-orange hover:border-sbcc-orange
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
};

export const IconButton = ({ icon: Icon, className, ...props }) => (
  <Button
    className={clsx('!p-2', className)}
    {...props}
  >
    <Icon className="h-5 w-5" />
  </Button>
);
