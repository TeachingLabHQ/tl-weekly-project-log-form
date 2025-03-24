interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner = ({ className = "" }: LoadingSpinnerProps) => (
  <div
    className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm ${className}`}
  >
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
  </div>
);
