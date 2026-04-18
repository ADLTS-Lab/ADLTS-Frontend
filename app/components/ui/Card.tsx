// A white card with rounded corners and subtle shadow
interface CardProps {
    children: React.ReactNode;
    className?: string;
  }
  export const Card = ({ children, className = "" }: CardProps) => (
    <div className={`bg-card rounded-2xl shadow-md border border-slate-100 p-6 ${className}`}>
      {children}
    </div>
  );