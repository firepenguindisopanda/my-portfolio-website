import React from 'react';

/**
 * Renders a Credly badge by embedding its iframe directly.
 *
 * The previous approach used Credly's `embed.js`, with one copy of the script
 * appended to <body> per badge. Eight copies raced each other and the resulting
 * iframes were left at 0x0, so the whole strip rendered blank. The script only
 * scans for `[data-share-badge-id]` placeholders when it loads, which never
 * lines up with when React mounts them.
 *
 * `https://www.credly.com/embedded_badge/{id}` is the same URL the script
 * resolves to, so pointing an iframe at it directly is deterministic, needs no
 * third-party JavaScript, and lets us set explicit dimensions.
 */
const CredlyBadge = ({ badgeId, title, width = 180, height = 162 }) => (
  <iframe
    src={`https://www.credly.com/embedded_badge/${badgeId}`}
    title={title ? `${title} badge` : 'Credly badge'}
    width={width}
    height={height}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    style={{ border: 0, display: 'block', width, height, maxWidth: '100%', colorScheme: 'light' }}
  />
);

export default CredlyBadge;
