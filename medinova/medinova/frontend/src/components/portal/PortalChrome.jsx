import { Link, useLocation } from 'react-router-dom'

const portalBackgroundStyle = {
  background: `
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='rgba(15,118,110,0.06)' stroke-width='8' stroke-linecap='round'%3E%3Ccircle cx='110' cy='110' r='30'/%3E%3Cpath d='M110 84v52'/%3E%3Cpath d='M84 110h52'/%3E%3C/g%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='none' stroke='rgba(20,184,166,0.05)' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='82' y='106' width='76' height='28' rx='14'/%3E%3Cpath d='M120 106v28'/%3E%3C/g%3E%3C/svg%3E"),
    radial-gradient(circle at top left, rgba(20,184,166,0.10), transparent 20%),
    radial-gradient(circle at bottom right, rgba(56,189,248,0.10), transparent 18%),
    linear-gradient(135deg, #F7FFFE 0%, #EEF9F6 52%, #F4FBFF 100%)
  `,
  backgroundSize: '220px 220px, 250px 250px, auto, auto, auto',
  backgroundPosition: '0 0, 120px 120px, left top, right bottom, center',
}

function joinClasses(...classNames) {
  return classNames.filter(Boolean).join(' ')
}

function isActivePath(pathname, item) {
  if (item.match) return pathname.startsWith(item.match)
  if (item.exact) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function formatFilterLabel(option) {
  return option.replace(/_/g, ' ')
}

export function PortalPage({
  user,
  moduleLabel,
  moduleName,
  sidebarItems,
  focusTitle,
  focusDescription,
  progressValue = 100,
  progressLabel = 'Workspace readiness',
  progressText,
  focusEyebrow = "Today's focus",
  avatarFallback = 'M',
  maxWidth = '1800px',
  children,
}) {
  const location = useLocation()
  const safeProgress = Math.max(0, Math.min(100, Number(progressValue) || 0))
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || avatarFallback

  return (
    <div className="page portal-page" style={portalBackgroundStyle}>
      <div className="page-content portal-page-content" style={{ maxWidth }}>
        <div className="portal-layout">
          <aside className="portal-sidebar fade-up">
            <div className="portal-sidebar__brand">
              <div className="portal-sidebar__avatar">{avatarLetter}</div>
              <div>
                <div className="portal-sidebar__eyebrow">{moduleLabel}</div>
                <div className="portal-sidebar__title">{moduleName}</div>
              </div>
            </div>

            <div className="portal-sidebar__profile">
              <div className="portal-sidebar__name">{user?.name || moduleLabel}</div>
              <div className="portal-sidebar__email">{user?.email || `${moduleLabel.toLowerCase()} account`}</div>
              <div className="portal-sidebar__metric-label">{progressLabel}</div>
              <div className="portal-progress">
                <div className="portal-progress__value" style={{ width: `${safeProgress}%` }} />
              </div>
              <div className="portal-sidebar__caption">
                {progressText || `${safeProgress}% ready for daily operations.`}
              </div>
            </div>

            <nav className="portal-sidebar__nav">
              {sidebarItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={joinClasses('portal-sidebar__link', isActivePath(location.pathname, item) && 'is-active')}
                >
                  <span className="portal-sidebar__code">{item.code}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {(focusTitle || focusDescription) && (
              <div className="portal-sidebar__focus">
                <div className="portal-sidebar__metric-label">{focusEyebrow}</div>
                {focusTitle && <div className="portal-sidebar__focus-title">{focusTitle}</div>}
                {focusDescription && <div className="portal-sidebar__focus-copy">{focusDescription}</div>}
              </div>
            )}
          </aside>

          <main className="portal-main">{children}</main>
        </div>
      </div>
    </div>
  )
}

export function PortalHero({ eyebrow, title, description, actions, aside, className = '' }) {
  return (
    <section className={joinClasses('portal-hero fade-up-1', className)}>
      <div className={joinClasses('portal-hero__layout', !aside && 'portal-hero__layout--single')}>
        <div>
          {eyebrow && <div className="portal-kicker">{eyebrow}</div>}
          <h1 className="portal-hero__title">{title}</h1>
          {description && <p className="portal-hero__description">{description}</p>}
          {actions && <div className="portal-button-row">{actions}</div>}
        </div>

        {aside && <div className="portal-hero__aside">{aside}</div>}
      </div>
    </section>
  )
}

export function PortalStatGrid({ items, className = '' }) {
  return (
    <section className={joinClasses('portal-stat-grid fade-up-2', className)}>
      {items.map((item) => (
        <div key={item.title} className="portal-stat-card">
          <div className="portal-stat-card__title">{item.title}</div>
          <div className="portal-stat-card__value">{item.value}</div>
          <div className="portal-stat-card__note">{item.note}</div>
        </div>
      ))}
    </section>
  )
}

export function PortalCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className = '',
  soft = false,
}) {
  return (
    <section className={joinClasses('portal-card', soft && 'portal-card--soft', className)}>
      {(eyebrow || title || description || action) && (
        <div className="portal-card__header">
          <div>
            {eyebrow && <div className="portal-kicker">{eyebrow}</div>}
            {title && <h2 className="portal-card__title">{title}</h2>}
            {description && <p className="portal-card__description">{description}</p>}
          </div>
          {action && <div className="portal-card__action">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function PortalActionTile({ to, code, title, description }) {
  const content = (
    <div className="portal-action-tile">
      <div className="portal-action-tile__code">{code}</div>
      <div className="portal-action-tile__title">{title}</div>
      <div className="portal-action-tile__description">{description}</div>
      <div className="portal-action-tile__link">Open section</div>
    </div>
  )

  if (!to) return content

  return (
    <Link to={to} className="portal-action-link">
      {content}
    </Link>
  )
}

export function PortalMessage({ kind = 'success', children }) {
  return (
    <div className={joinClasses('portal-message', `portal-message--${kind}`)}>
      {children}
    </div>
  )
}

export function StatusPill({ label, tone = 'neutral' }) {
  return <span className={joinClasses('portal-pill', `portal-pill--${tone}`)}>{label}</span>
}

export function PortalEmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={joinClasses('portal-empty', className)}>
      {icon && <div className="portal-empty__icon">{icon}</div>}
      <div className="portal-empty__title">{title}</div>
      {description && <div className="portal-empty__description">{description}</div>}
      {action && <div className="portal-empty__action">{action}</div>}
    </div>
  )
}

export function PortalModal({ eyebrow, title, description, onClose, footer, children }) {
  return (
    <div className="portal-modal-backdrop" onClick={onClose}>
      <div className="portal-modal" onClick={(event) => event.stopPropagation()}>
        <div className="portal-modal__header">
          <div>
            {eyebrow && <div className="portal-kicker">{eyebrow}</div>}
            <h2 className="portal-modal__title">{title}</h2>
            {description && <p className="portal-modal__description">{description}</p>}
          </div>
          <button type="button" className="portal-modal__close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="portal-modal__body">{children}</div>
        {footer && <div className="portal-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}

export function PortalFilterPills({
  options,
  value,
  onChange,
  counts = {},
  getLabel,
  className = '',
}) {
  return (
    <div className={joinClasses('portal-filter-bar', className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={joinClasses('portal-filter-pill', value === option && 'is-active')}
          onClick={() => onChange(option)}
        >
          {getLabel
            ? getLabel(option)
            : `${formatFilterLabel(option)}${Object.prototype.hasOwnProperty.call(counts, option) ? ` (${counts[option]})` : ''}`}
        </button>
      ))}
    </div>
  )
}

export function PortalField({ label, hint, children, fullWidth = false }) {
  return (
    <div className={joinClasses('portal-field', fullWidth && 'portal-field--full')}>
      <label className="portal-field__label">{label}</label>
      {children}
      {hint && <div className="portal-field__hint">{hint}</div>}
    </div>
  )
}
