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

export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = ({ className, ...props }) => (
  <Button
    variant="secondary"
    className={clsx('text-sbcc-dark', className)}
    {...props}
  />
);

export const IconButton = ({ icon: Icon, className, ...props }) => (
  <Button 
    className={clsx('!p-2', className)}
    {...props}
  >
    <Icon className="h-5 w-5" />
  </Button>
);
