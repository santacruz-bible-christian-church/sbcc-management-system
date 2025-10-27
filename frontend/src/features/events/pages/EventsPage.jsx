import SCBCSidebar from '../../../components/layout/Sidebar';

export const EventsPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SCBCSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="events-shell">
          {/* ...rest of your existing EventsPage content... */}
        </div>
      </div>
    </div>
  );
};