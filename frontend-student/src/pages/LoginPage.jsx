import React from 'react';
import AuthPage from '../components/pages/AuthPage';
import AuthPageMobile from './AuthPageMobile';
import useMediaQuery from '../hooks/useMediaQuery';

export default function LoginPage(props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? (
    <AuthPage initialMode="login" {...props} />
  ) : (
    <AuthPageMobile initialMode="login" {...props} />
  );
}
