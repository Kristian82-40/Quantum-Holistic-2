import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'gold' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  as: Tag = 'button',
  href,
  ...props
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    fullWidth ? styles.full : '',
    className,
  ].join(' ');

  if (Tag === 'a') {
    return (
      <a href={href} className={cls}>
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button className={cls} {...props}>
      <span>{children}</span>
    </button>
  );
}
