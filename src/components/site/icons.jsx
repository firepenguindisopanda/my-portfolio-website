import React from 'react';
import { LuArrowBigUp, LuArrowDown, LuArrowLeft, LuArrowRight, LuArrowUpRight, LuMinus, LuPlus } from 'react-icons/lu';

/**
 * The site's icons, in one place: Lucide's line icons through react-icons, so
 * every arrow on the site is the same drawing, instead of arrow characters
 * whose look depends on the font. Each is decorative - the words beside it
 * say what the link or button does - so it is hidden from assistive tech.
 * casefile.css sizes them to the text (`.icon`).
 */

const hidden = { 'aria-hidden': true, focusable: 'false' };
const cls = (extra) => (extra ? `icon ${extra}` : 'icon');

/** Opens another site, in a new tab. */
export const ExternalIcon = ({ className }) => <LuArrowUpRight className={cls(className)} {...hidden} />;
export const BackIcon = ({ className }) => <LuArrowLeft className={cls(className)} {...hidden} />;
export const NextIcon = ({ className }) => <LuArrowRight className={cls(className)} {...hidden} />;
export const DownIcon = ({ className }) => <LuArrowDown className={cls(className)} {...hidden} />;
/** Expand and collapse, for disclosures. */
export const ExpandIcon = ({ className }) => <LuPlus className={cls(className)} {...hidden} />;
export const CollapseIcon = ({ className }) => <LuMinus className={cls(className)} {...hidden} />;
/** The Shift key, where a shortcut is drawn. */
export const ShiftIcon = (props) => <LuArrowBigUp {...hidden} {...props} />;
