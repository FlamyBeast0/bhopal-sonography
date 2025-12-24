
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { SparklesIcon } from '../../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsGuest } = useContext(AuthContext);
  const { loadDemoData, patients } = useContext(AppContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to log in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
        await loginAsGuest();
        // If the app is empty, automatically load the demo data for the guest
        if (patients.length === 0) {
            loadDemoData();
        }
    } catch (err) {
        setError('Failed to enter demo mode.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-gray-900 bg-gradient-to-br from-primary-600/20 via-transparent to-transparent">
      <div className="w-full max-w-md mx-auto p-4 animate-fade-in-up">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-primary-600 dark:text-primary-400">🩺</h1>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Bhopal Sonography Center
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Professional Clinic Management Suite</p>
        </div>
        
        <Card className="shadow-2xl border-t-4 border-primary-500">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your work email"
                />
                <Input
                    label="Password"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                />
                
                {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                        {error}
                    </div>
                )}
                
                <Button type="submit" className="w-full py-3" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Sign In to Portal'}
                </Button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                    <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 font-medium">OR</span>
                </div>
            </div>

            <div className="space-y-4">
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full py-3 border-2 border-primary-500/20 hover:border-primary-500/50" 
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    icon={<SparklesIcon className="w-5 h-5 text-primary-500" />}
                >
                    Explore as Guest (Showcase Mode)
                </Button>
                <p className="text-center text-xs text-slate-400 px-4">
                    Guest mode populates the app with sample data for demonstration purposes.
                </p>
            </div>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500 flex justify-center gap-6">
            <span className="flex items-center gap-1">🔒 SSL Encrypted</span>
            <span className="flex items-center gap-1">☁️ Cloud Sync</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
