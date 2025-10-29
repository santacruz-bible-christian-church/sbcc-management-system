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
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        bg-sbcc-gradient text-white font-medium rounded-lg
        hover:opacity-90 active:scale-95
        transition-all duration-200 shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </button>
  );
};

export const SecondaryButton = ({
  children,
  icon: Icon,
  onClick,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        bg-white text-sbcc-dark font-medium rounded-lg
        border-2 border-sbcc-gray/20
        hover:bg-sbcc-light-orange hover:border-sbcc-orange
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
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
