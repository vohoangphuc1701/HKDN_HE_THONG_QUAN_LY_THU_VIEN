import React from 'react';
import AuthPage from '../components/pages/AuthPage';

export default function LoginPage(props) {
  return <AuthPage initialMode="login" {...props} />;
}

