import React from 'react';

const Spinner = ({
  animation = 'border', // 'border', 'grow', 'dots', 'pulse'
  size = '', // 'sm', 'lg', or empty for default
  variant = '', // 'primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'
  className = '',
  children,
  ...props
}) => {
  // Build class names
  const baseClass = `spinner-${animation}`;
  const sizeClass = size ? `${baseClass}-${size}` : '';
  const variantClass = variant ? `spinner-${variant}` : '';
  
  const classes = [
    'spinner',
    baseClass,
    sizeClass,
    variantClass,
    className
  ].filter(Boolean).join(' ');

  // For dots spinner, we need special structure
  if (animation === 'dots') {
    return (
      <div className={classes} {...props}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }

  return (
    <div className={classes} role="status" aria-hidden="true" {...props}>
      {children && <span className="visually-hidden">{children}</span>}
    </div>
  );
};

// Convenience components for common use cases
export const LoadingSpinner = ({ text = 'Loading...', ...props }) => (
  <div className="spinner-with-text">
    <Spinner {...props} />
    {text && <span>{text}</span>}
  </div>
);

export const CenteredSpinner = ({ children, ...props }) => (
  <div className="spinner-centered">
    <Spinner {...props}>
      {children}
    </Spinner>
  </div>
);

export const OverlaySpinner = ({ children, ...props }) => (
  <div className="spinner-overlay">
    <Spinner {...props}>
      {children}
    </Spinner>
  </div>
);

export default Spinner;