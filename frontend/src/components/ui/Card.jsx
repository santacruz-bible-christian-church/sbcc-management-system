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

// Stats Card with SBCC styling
export const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  variant = 'default', // default, orange, gradient, blue, green, purple
}) => {
  const backgroundMap = {
    default: 'bg-white',
    orange: 'bg-sbcc-light-orange',
    gradient: 'bg-gradient-to-br from-[#F6C67E] to-[#FDB54A]',
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    purple: 'bg-purple-50',
  };

  const labelTextMap = {
    gradient: 'text-white/80',
    default: 'text-sbcc-gray',
    orange: 'text-sbcc-gray',
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
  };

  const valueTextMap = {
    gradient: 'text-white',
    default: 'text-sbcc-dark',
    orange: 'text-sbcc-dark',
    blue: 'text-blue-900',
    green: 'text-emerald-900',
    purple: 'text-purple-900',
  };

  const iconColorMap = {
    gradient: 'bg-white/20 text-white',
    default: 'bg-sbcc-orange text-white',
    orange: 'bg-sbcc-orange text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-emerald-500 text-white',
    purple: 'bg-purple-500 text-white',
  };

  const changeTextMap = {
    gradient: 'text-white/70',
    default: 'text-sbcc-gray',
    orange: 'text-sbcc-gray',
    blue: 'text-blue-500',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
  };

  const bgClass = backgroundMap[variant] ?? backgroundMap.default;
  const labelText = labelTextMap[variant] ?? labelTextMap.default;
  const valueText = valueTextMap[variant] ?? valueTextMap.default;
  const iconClasses = iconColorMap[variant] ?? iconColorMap.default;
  const changeText = changeTextMap[variant] ?? changeTextMap.default;

  return (
    <Card className={bgClass}>
      <div className="flex items-center justify-between">
        <div>
          <p className={clsx('text-sm font-medium', labelText)}>{title}</p>
          <p className={clsx('text-2xl font-bold mt-1', valueText)}>{value}</p>
          {change && <p className={clsx('text-sm mt-1', changeText)}>{change}</p>}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-full shadow-sm', iconClasses)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};
