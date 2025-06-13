import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  href?: string
  children: React.ReactNode
  className?: string
  external?: boolean
  onClick?: () => void
}

export const FooterLink = ({
  href,
  children,
  className,
  external,
  onClick,
}: Props) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'text-left text-neutral-400 hover:text-white transition-colors duration-200',
          className,
        )}
        type="button"
      >
        {children}
      </button>
    )
  }

  if (!href) {
    throw new Error('FooterLink requires either href or onClick prop')
  }

  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Link
      href={href}
      className={cn(
        'text-neutral-400 hover:text-white transition-colors duration-200',
        className,
      )}
      {...linkProps}
    >
      {children}
    </Link>
  )
}
