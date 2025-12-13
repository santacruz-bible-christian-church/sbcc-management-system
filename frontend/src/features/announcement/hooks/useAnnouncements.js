import { useState, useEffect, useCallback } from 'react';
import announcementsApi from '../../../api/announcements.api';

export function useAnnouncements(ministryId = null) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = ministryId
                ? await announcementsApi.listPublished(ministryId)
                : await announcementsApi.list();
            setAnnouncements(data);
        } catch (err) {
            setError(err);
            console.error('Error fetching announcements:', err);
        } finally {
            setLoading(false);
        }
    }, [ministryId]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const createAnnouncement = useCallback(async (data) => {
        try {
            const newAnnouncement = await announcementsApi.create(data);
            setAnnouncements(prev => [newAnnouncement, ...prev]);
            return newAnnouncement;
        } catch (err) {
            console.error('Error creating announcement:', err);
            throw err;
        }
    }, []);

    const updateAnnouncement = useCallback(async (id, data) => {
        try {
            const updated = await announcementsApi.update(id, data);
            setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
            return updated;
        } catch (err) {
            console.error('Error updating announcement:', err);
            throw err;
        }
    }, []);

    const deleteAnnouncement = useCallback(async (id) => {
        try {
            await announcementsApi.delete(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting announcement:', err);
            throw err;
        }
    }, []);

    const sendNow = useCallback(async (id) => {
        try {
            const result = await announcementsApi.sendNow(id);
            // Update the announcement's sent status locally
            setAnnouncements(prev =>
                prev.map(a => a.id === id ? { ...a, sent: true } : a)
            );
            return result;
        } catch (err) {
            console.error('Error sending announcement:', err);
            throw err;
        }
    }, []);

    const previewRecipients = useCallback(async (id) => {
        try {
            return await announcementsApi.previewRecipients(id);
        } catch (err) {
            console.error('Error previewing recipients:', err);
            throw err;
        }
    }, []);

    return {
        announcements,
        loading,
        error,
        fetchAnnouncements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        sendNow,
        previewRecipients,
    };
}
