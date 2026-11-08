import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../style/confirmModal.css';

/**
 * Reusable Confirmation Modal matching GoCart's exact popup design:
 * - Centered card with rounded corners & soft drop shadow
 * - Top circular icon with soft tinted background
 * - Bold title & subtitle text
 * - Cancel button (outline) + Filled action button (orange or red)
 * - Portaled directly to document.body to avoid any z-index or stacking context clipping issues
 */
const ConfirmModal = ({
  isOpen,
  title = 'Confirmation',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = null,
  iconBg = '#fff0e6',
  iconColor = '#ff6b00',
  confirmVariant = 'primary', // 'primary' | 'danger'
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="gocart-modal-overlay"
      onClick={() => {
        if (!loading && onCancel) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gocart-modal-title"
    >
      <div
        className="gocart-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div
            className="gocart-modal-icon-circle"
            style={{ background: iconBg, color: iconColor }}
          >
            {icon}
          </div>
        )}

        <h3 id="gocart-modal-title" className="gocart-modal-title">
          {title}
        </h3>

        <p className="gocart-modal-message">
          {message}
        </p>

        <div className="gocart-modal-actions">
          <button
            type="button"
            className="gocart-modal-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`gocart-modal-btn-confirm gocart-modal-btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
