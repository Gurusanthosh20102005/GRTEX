import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const variants = {
        primary: 'bg-brand text-white hover:bg-brand-light shadow-md hover:shadow-lg',
        secondary: 'bg-white text-brand border border-brand hover:bg-gray-50',
        accent: 'bg-accent text-brand-dark hover:bg-accent-light shadow-md hover:shadow-lg',
        ghost: 'bg-transparent text-brand hover:bg-gray-100',
        outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50'
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10 p-2 flex items-center justify-center'
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50 transition-all duration-200',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
