import SCBCSidebar from '../../../components/layout/Sidebar';

export const EventsPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-sbcc-dark">Events</h1>
        <p className="text-sbcc-gray mt-2">Manage church events and registrations</p>
      </div>
      
      <div className="events-shell">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Events content will go here</p>
        </div>
      </div>
    </div>
  );
};