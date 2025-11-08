export const PageHeader = ({
  breadcrumb,
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <p className="text-[15px] text-[#A0A0A0] leading-none mb-1">
          {breadcrumb}
        </p>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[30px] text-[#383838] leading-none font-bold">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-[#A0A0A0] mt-2">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
