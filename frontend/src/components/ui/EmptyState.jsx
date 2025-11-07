export const EmptyState = ({
  message,
  actionLabel,
  onAction,
  icon: Icon
}) => {
  return (
    <div className="text-center py-20">
      {Icon && <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
      <p className="text-gray-500 text-lg mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[#FDB54A] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
