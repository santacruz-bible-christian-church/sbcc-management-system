import { Card as FlowbiteCard } from 'flowbite-react';
import { clsx } from 'clsx';

export const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  className,
  hoverable = false,
  variant = 'default', // default, orange, gradient
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    orange: 'bg-sbcc-light-orange border-sbcc-orange',
    gradient: 'bg-sbcc-gradient text-white border-transparent',
  };

  return (
    <FlowbiteCard
      className={clsx(
        variantClasses[variant],
        hoverable && 'hover:shadow-lg transition-shadow',
        className
      )}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h5 className={clsx(
                "text-xl font-bold tracking-tight",
                variant === 'gradient' ? 'text-white' : 'text-sbcc-dark'
              )}>
                {title}
              </h5>
            )}
            {subtitle && (
              <p className={clsx(
                "text-sm mt-1",
                variant === 'gradient' ? 'text-white/80' : 'text-sbcc-gray'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>
      )}
      
      <div className="flex-1">{children}</div>
      
      {footer && (
        <div className={clsx(
          "mt-4 pt-4 border-t",
          variant === 'gradient' ? 'border-white/20' : 'border-gray-200'
        )}>
          {footer}
        </div>
      )}
    </FlowbiteCard>
  );
};

// Stats Card with SBCC styling
export const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default' // default, orange, gradient
}) => {
  const gradientBg = 'bg-gradient-to-br from-[#F6C67E] to-[#FDB54A]';
  const orangeBg = 'bg-sbcc-light-orange';
  const defaultBg = 'bg-white';

  const bgClass = variant === 'gradient' ? gradientBg : variant === 'orange' ? orangeBg : defaultBg;
  const textColor = variant === 'gradient' ? 'text-white' : 'text-sbcc-dark';
  const iconColor = variant === 'gradient' ? 'bg-white/20 text-white' : 'bg-sbcc-orange text-white';

  return (
    <Card className={bgClass}>
      <div className="flex items-center justify-between">
        <div>
          <p className={clsx(
            "text-sm font-medium",
            variant === 'gradient' ? 'text-white/80' : 'text-sbcc-gray'
          )}>
            {title}
          </p>
          <p className={clsx("text-2xl font-bold mt-1", textColor)}>
            {value}
          </p>
          {change && (
            <p className={clsx(
              "text-sm mt-1",
              variant === 'gradient' ? 'text-white/70' : 'text-sbcc-gray'
            )}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-full', iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};