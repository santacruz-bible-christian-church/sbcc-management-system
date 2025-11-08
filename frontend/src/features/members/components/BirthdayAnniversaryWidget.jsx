import { useEffect, useState } from 'react';
import { HiOutlineCake, HiOutlineHeart } from 'react-icons/hi';
import { Spinner } from 'flowbite-react';
import { membersApi } from '../../../api/members.api';

export const BirthdayAnniversaryWidget = ({ days = 7 }) => {
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      setError(null);
      try {
        const [birthdaysData, anniversariesData] = await Promise.all([
          membersApi.upcomingBirthdays(days),
          membersApi.upcomingAnniversaries(days),
        ]);

        setBirthdays(birthdaysData || []);
        setAnniversaries(anniversariesData || []);
      } catch (err) {
        console.error('Failed to fetch reminders:', err);
        setError('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [days]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="flex justify-center py-8">
          <Spinner size="lg" color="warning" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const hasEvents = birthdays.length > 0 || anniversaries.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Upcoming Events</h3>
        <span className="text-xs text-gray-500">Next {days} days</span>
      </div>

      {!hasEvents ? (
        <p className="text-gray-500 text-sm py-4 text-center">
          No upcoming birthdays or anniversaries
        </p>
      ) : (
        <div className="space-y-4">
          {/* Birthdays Section */}
          {birthdays.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineCake className="w-5 h-5 text-pink-500" />
                <h4 className="text-sm font-semibold text-gray-700">Birthdays</h4>
              </div>
              <div className="space-y-2">
                {birthdays.map((item, index) => (
                  <div
                    key={`birthday-${index}`}
                    className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.member_name || item.first_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(item.date_of_birth)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-pink-600 bg-white px-2 py-1 rounded">
                      {getDaysUntil(item.upcoming_date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anniversaries Section */}
          {anniversaries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineHeart className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-semibold text-gray-700">Membership Anniversaries</h4>
              </div>
              <div className="space-y-2">
                {anniversaries.map((item, index) => (
                  <div
                    key={`anniversary-${index}`}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.member_name || item.first_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.years_of_membership} {item.years_of_membership === 1 ? 'year' : 'years'} with us
                      </p>
                    </div>
                    <span className="text-xs font-medium text-red-600 bg-white px-2 py-1 rounded">
                      {getDaysUntil(item.upcoming_date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BirthdayAnniversaryWidget;
