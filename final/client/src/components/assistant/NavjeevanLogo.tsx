interface NavjeevanLogoProps {
  size?: number;
  className?: string;
}

export function NavjeevanLogo({ size = 40, className = '' }: NavjeevanLogoProps) {
  return (
    <img
      src="/navjeevan-logo.jpeg"
      width={size}
      height={size}
      alt="Navjeevan Clinic"
      className={`rounded-full object-contain bg-white ${className}`}
    />
  );
}
