import React from 'react';
import './AnimatedTitle.css';

const AnimatedTitle: React.FC = () => {
  return (
    <div className="animated-title-container">
      <h1 className="animated-title">
        <span className="title-char" style={{ animationDelay: '0s' }}>C</span>
        <span className="title-char" style={{ animationDelay: '0.1s' }}>o</span>
        <span className="title-char" style={{ animationDelay: '0.2s' }}>m</span>
        <span className="title-char" style={{ animationDelay: '0.3s' }}>m</span>
        <span className="title-char" style={{ animationDelay: '0.4s' }}>e</span>
        <span className="title-char" style={{ animationDelay: '0.5s' }}>r</span>
        <span className="title-char" style={{ animationDelay: '0.6s' }}>c</span>
        <span className="title-char" style={{ animationDelay: '0.7s' }}>e</span>
        <span className="title-char" style={{ animationDelay: '0.8s' }}> </span>
        <span className="title-char" style={{ animationDelay: '0.9s' }}>F</span>
        <span className="title-char" style={{ animationDelay: '1.0s' }}>l</span>
        <span className="title-char" style={{ animationDelay: '1.1s' }}>o</span>
        <span className="title-char" style={{ animationDelay: '1.2s' }}>w</span>
      </h1>
    </div>
  );
};

export default AnimatedTitle;