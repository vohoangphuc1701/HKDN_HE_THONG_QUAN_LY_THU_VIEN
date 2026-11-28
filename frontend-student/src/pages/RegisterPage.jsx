import React from 'react';
import AuthPage from '../components/pages/AuthPage';
import AuthPageMobile from './AuthPageMobile';
import useMediaQuery from '../hooks/useMediaQuery';

export default function RegisterPage(props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? (
    <AuthPage initialMode="register" {...props} />
  ) : (
    <AuthPageMobile initialMode="register" {...props} />
  );
}
