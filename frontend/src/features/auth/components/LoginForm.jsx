import { useState } from 'react';
import { Button, Label, TextInput, Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await login(username, password);
    
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">Error!</span> {error}
        </Alert>
      )}

      <div>
        <div className="mb-2 block">
          <Label htmlFor="username" value="Username" />
        </div>
        <TextInput
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="password" value="Password" />
        </div>
        <TextInput
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading} isProcessing={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};