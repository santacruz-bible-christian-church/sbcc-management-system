import { Card as FlowbiteCard } from 'flowbite-react';
import { clsx } from 'clsx';

const baseShadowClass = 'shadow-[0_24px_60px_rgba(31,41,55,0.12)] transition-shadow !border-none';
const hoverShadowClass = 'hover:shadow-[0_30px_80px_rgba(31,41,55,0.16)]';

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
    default: `bg-white ${baseShadowClass}`,
    orange: `bg-sbcc-light-orange ${baseShadowClass}`,
    gradient: `bg-sbcc-gradient text-white ${baseShadowClass}`,
  };

  return (
    <FlowbiteCard
      className={clsx(
        variantClasses[variant],
        hoverable && hoverShadowClass,
        className
      )}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h5
                className={clsx(
                  'text-xl font-bold tracking-tight',
                  variant === 'gradient' ? 'text-white' : 'text-sbcc-dark'
                )}
              >
                {title}
              </h5>
            )}
            {subtitle && (
              <p
                className={clsx(
                  'text-sm mt-1',
                  variant === 'gradient' ? 'text-white/80' : 'text-sbcc-gray'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>
      )}

      <div className="flex-1">{children}</div>

      {footer && <div className="mt-4 pt-4">{footer}</div>}
    </FlowbiteCard>
  );
};

// Stats Card - Completely custom without Flowbite
export const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default', // default, orange, blue, green, purple
}) => {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      label: 'text-gray-500',
      value: 'text-gray-900',
      change: 'text-gray-500',
      icon: 'bg-sbcc-primary text-white',
    },
    orange: {
      bg: 'bg-orange-50',
      label: 'text-orange-600',
      value: 'text-orange-900',
      change: 'text-orange-600',
      icon: 'bg-orange-500 text-white',
    },
    blue: {
      bg: 'bg-blue-50',
      label: 'text-blue-600',
      value: 'text-blue-900',
      change: 'text-blue-600',
      icon: 'bg-blue-500 text-white',
    },
    green: {
      bg: 'bg-emerald-50',
      label: 'text-emerald-600',
      value: 'text-emerald-900',
      change: 'text-emerald-600',
      icon: 'bg-emerald-500 text-white',
    },
    purple: {
      bg: 'bg-purple-50',
      label: 'text-purple-600',
      value: 'text-purple-900',
      change: 'text-purple-600',
      icon: 'bg-purple-500 text-white',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={clsx(
        'rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100',
        styles.bg
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={clsx('text-sm font-medium uppercase tracking-wide', styles.label)}>
            {title}
          </p>
          <p className={clsx('text-3xl font-bold mt-2', styles.value)}>
            {value}
          </p>
          {change && (
            <p className={clsx('text-xs mt-2 font-medium', styles.change)}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl shadow-sm', styles.icon)}>
            <Icon className="h-7 w-7" />
          </div>
        )}
      </div>
    </div>
  );
};
