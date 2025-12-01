'use client';

import { useState } from 'react';
import LoginForm from '../../components/LoginForm';

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <LoginForm 
      onToggleMode={toggleMode} 
      isLoginMode={isLoginMode} 
    />
  );
}