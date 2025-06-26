import React, { useState } from 'react';
import CustomerLogin from './CustomerLogin';
import CustomerRegister from './CustomerRegister';

const CustomerAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <>
      {isLogin ? (
        <CustomerLogin onSwitchToRegister={switchToRegister} />
      ) : (
        <CustomerRegister onSwitchToLogin={switchToLogin} />
      )}
    </>
  );
};

export default CustomerAuth; 