import { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Label, TextInput, Textarea, Spinner } from 'flowbite-react';

export const MinistryFormModal = ({ open, ministry, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ministry) {
      setFormData({
        name: ministry.name || '',
        description: ministry.description || '',
        leader_id: ministry.leader?.id || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        leader_id: '',
      });
    }
    setErrors({});
  }, [ministry, open]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Ministry name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      // Only include leader_id if it's set
      if (formData.leader_id) {
        submitData.leader_id = parseInt(formData.leader_id);
      }

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
    }
  }, [formData, onSubmit, onClose]);

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <Modal.Header>
        {ministry ? 'Edit Ministry' : 'Create New Ministry'}
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" value="Ministry Name *" />
            <TextInput
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              color={errors.name ? 'failure' : undefined}
              helperText={errors.name}
              placeholder="e.g., Music Ministry"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" value="Description" />
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the ministry..."
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Note about leader */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Ministry leaders can be assigned later from the ministry details page.
            </p>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex gap-3 w-full justify-end">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#FDB54A] hover:bg-[#e5a43b]"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {ministry ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              ministry ? 'Update Ministry' : 'Create Ministry'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MinistryFormModal;
