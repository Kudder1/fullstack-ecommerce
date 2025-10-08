import React from 'react';

// Main Pagination component
const Pagination = ({ 
  size = '', // 'sm', 'lg', or empty for default
  align = 'center', // 'start', 'center', 'end'
  className = '',
  children,
  ...props 
}) => {
  const sizeClass = size ? `pagination-${size}` : '';
  const alignClass = align !== 'center' ? `pagination-${align}` : 'pagination-center';
  
  const classes = [
    'pagination',
    sizeClass,
    alignClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <nav aria-label="Page navigation" {...props}>
      <ul className={classes}>
        {children}
      </ul>
    </nav>
  );
};

// Pagination Item component
const PaginationItem = ({ 
  active = false,
  disabled = false,
  ellipsis = false,
  className = '',
  onClick,
  href,
  children,
  ...props 
}) => {
  const itemClasses = [
    'page-item',
    active && 'active',
    disabled && 'disabled',
    ellipsis && 'ellipsis',
    className
  ].filter(Boolean).join(' ');

  const linkClasses = [
    'page-link'
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || ellipsis) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  // For ellipsis, render without link
  if (ellipsis) {
    return (
      <li className={itemClasses} {...props}>
        <span className={linkClasses} aria-disabled="true">
          {children || '…'}
        </span>
      </li>
    );
  }

  // Render as link or button
  const Element = href ? 'a' : 'button';
  const elementProps = {
    className: linkClasses,
    onClick: handleClick,
    'aria-current': active ? 'page' : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    ...(href && { href }),
    ...(Element === 'button' && { type: 'button' })
  };

  return (
    <li className={itemClasses}>
      <Element {...elementProps}>
        {children}
      </Element>
    </li>
  );
};

// Convenience components
const PaginationFirst = ({ disabled, onClick, ...props }) => (
  <PaginationItem 
    disabled={disabled} 
    onClick={onClick}
    className="page-first"
    {...props}
  >
    First
  </PaginationItem>
);

const PaginationPrev = ({ disabled, onClick, ...props }) => (
  <PaginationItem 
    disabled={disabled} 
    onClick={onClick}
    className="page-prev"
    {...props}
  >
    Previous
  </PaginationItem>
);

const PaginationNext = ({ disabled, onClick, ...props }) => (
  <PaginationItem 
    disabled={disabled} 
    onClick={onClick}
    className="page-next"
    {...props}
  >
    Next
  </PaginationItem>
);

const PaginationLast = ({ disabled, onClick, ...props }) => (
  <PaginationItem 
    disabled={disabled} 
    onClick={onClick}
    className="page-last"
    {...props}
  >
    Last
  </PaginationItem>
);

const PaginationEllipsis = ({ ...props }) => (
  <PaginationItem ellipsis {...props} />
);

// Attach subcomponents to main Pagination component
Pagination.Item = PaginationItem;
Pagination.First = PaginationFirst;
Pagination.Prev = PaginationPrev;
Pagination.Next = PaginationNext;
Pagination.Last = PaginationLast;
Pagination.Ellipsis = PaginationEllipsis;

export default Pagination;