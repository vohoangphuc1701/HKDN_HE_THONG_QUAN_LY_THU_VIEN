import React from 'react';
import AuthPage from '../components/pages/AuthPage';

export default function RegisterPage(props) {
  return <AuthPage initialMode="register" {...props} />;
}

