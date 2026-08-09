import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './LazySpaceEmbed.css';

// Click-to-load focused lazy iframe embed for Hugging Face Spaces
export default function LazySpaceEmbed({
  src,
  title = 'IdeasPrinter',
  height = 450,
  sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms allow-modals',
  className = ''
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const startLoad = () => {
    if (loaded) return;
    setLoading(true);
    // Minor delay to allow UI feedback; actual loading happens via iframe src
    requestAnimationFrame(() => {
      setLoaded(true);
      setLoading(false);
    });
  };

  return (
    <div
      ref={containerRef}
      className={`hf-embed-wrap ${className}`}
      style={{ height }}
      aria-live="polite"
    >
      {!loaded ? (
        <div className="hf-placeholder">
          <div className="hf-placeholder-title">IdeasPrinter preview</div>
          <div className="hf-ctas">
            <button
              className="hf-load-btn"
              onClick={startLoad}
              aria-label="Load IdeasPrinter iframe"
            >
              {loading ? 'Loading…' : 'Load widget'}
            </button>
            <a
              className="hf-open-link"
              href={src}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in new tab
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={src}
          title={title}
          frameBorder="0"
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox={sandbox}
        />
      )}
    </div>
  );
}

LazySpaceEmbed.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sandbox: PropTypes.string,
  className: PropTypes.string
};
