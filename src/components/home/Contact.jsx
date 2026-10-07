import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { usePostHog } from '@posthog/react';
import { profile } from '../../data/profile';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { gsap, gsapEnabled } from '../../utilities/gsapSetup';
import { EXT, NewTab, Arrow } from './links';

/**
 * Contact, on the night ground: the email large enough to read across a room,
 * a copy button, the other channels, and the message form.
 *
 * The form sends through EmailJS exactly as it always has - same service,
 * template and public key, same field names (`name`, `email`, `message`) the
 * template reads. EmailJS public keys are meant to live in the browser.
 *
 * Analytics are unchanged from the old contact section: `contact_form_submitted`
 * or `contact_form_failed`, `contact_channel_clicked`, and on a successful send
 * the visitor is marked `contacted` - with no name or email in PostHog; the
 * message itself carries those. Session replay masks every input.
 *
 * A sent message is filed: the fields fold away, the letter goes into an
 * envelope, the flap closes and it is stamped RECEIVED (with motion off it is
 * simply shown filed). Copying the address stamps COPIED beside the button.
 */

const EMAILJS = {
  serviceId: 'service_wf5ex2f',
  templateId: 'template_0ouoimq',
  publicKey: 'Mbp02i3iokIucc48d',
};

/**
 * The filed message: an envelope seen from the back, the letter inside it,
 * and the flap closed over it. Drawn at rest as filed; the timeline in
 * ContactForm starts it open, with the letter above, and closes it.
 */
const Envelope = () => (
  <svg className="env" viewBox="0 0 240 170" aria-hidden="true" focusable="false">
    <rect x="20" y="74" width="200" height="90" fill="#C9D1DB" stroke="#0B1220" strokeWidth="2" />
    <path className="env-flap-open" d="M 20 74 L 120 18 L 220 74 Z" fill="#C9D1DB" stroke="#0B1220" strokeWidth="2" strokeLinejoin="round" opacity="0" />
    <g className="env-letter">
      <rect x="44" y="80" width="152" height="78" fill="#F7F9FB" stroke="#A3AEBF" />
      {[94, 106, 118, 130].map((y) => (
        <line key={y} x1="60" x2={y === 130 ? 140 : 180} y1={y} y2={y} stroke="#A3AEBF" strokeWidth="2" strokeLinecap="round" />
      ))}
    </g>
    <path d="M 20 74 L 120 132 L 220 74 L 220 164 L 20 164 Z" fill="#E6EAF0" stroke="#0B1220" strokeWidth="2" strokeLinejoin="round" />
    <path d="M 20 164 L 104 118 M 220 164 L 136 118" stroke="#A3AEBF" strokeWidth="1.5" />
    <text x="36" y="154" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1" fill="#26344A">
      TO: {profile.name.toUpperCase()}
    </text>
    <path className="env-flap" d="M 20 74 L 120 132 L 220 74 Z" fill="#DCE1E7" stroke="#0B1220" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const ContactForm = () => {
  const formRef = useRef(null);
  const fieldsRef = useRef(null);
  const filedRef = useRef(null);
  const nameRef = useRef(null);
  const posthog = usePostHog();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ kind: '', text: '' });
  /** 'form' while writing, 'folding' while the fields fold away, 'filed' once sent. */
  const [phase, setPhase] = useState('form');
  const animate = gsapEnabled && !prefersReducedMotion;

  // Folding: the fields close up like a sheet being folded, then the envelope takes their place.
  useEffect(() => {
    if (phase !== 'folding') return undefined;
    const fields = fieldsRef.current;
    if (!animate || !fields) {
      setPhase('filed');
      return undefined;
    }
    const tween = gsap.to(fields, {
      scaleY: 0.08,
      opacity: 0.3,
      transformOrigin: '50% 0%',
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => setPhase('filed'),
    });
    return () => {
      tween.kill();
      gsap.set(fields, { clearProps: 'transform,opacity' });
    };
  }, [phase, animate]);

  // Filed: the letter goes in, the flap closes, the stamp comes down. Focus
  // moves to the filed note, since the button that had it is gone.
  useEffect(() => {
    if (phase !== 'filed' || !filedRef.current) return undefined;
    filedRef.current.focus({ preventScroll: true });
    if (!animate) return undefined;
    const root = filedRef.current;
    const tl = gsap
      .timeline()
      .from(root.querySelector('.env'), { y: 26, rotation: -3, opacity: 0, duration: 0.45, ease: 'power3.out' })
      // Open: the flap up behind the letter, the letter standing out of the envelope.
      .set(root.querySelector('.env-flap-open'), { opacity: 1 }, 0)
      .set(root.querySelector('.env-flap'), { scaleY: 0, svgOrigin: '120 74' }, 0)
      .from(root.querySelector('.env-letter'), { y: -70, duration: 0.55, ease: 'power2.inOut' }, 0.25)
      // The flap folds down over it: up half shrinks to the fold, the closed half grows from it.
      .to(root.querySelector('.env-flap-open'), { scaleY: 0, svgOrigin: '120 74', duration: 0.16, ease: 'power2.in' }, 0.85)
      .to(root.querySelector('.env-flap'), { scaleY: 1, svgOrigin: '120 74', duration: 0.18, ease: 'power2.out' }, 1.01)
      .from(root.querySelector('.cf-received'), { opacity: 0, scale: 2.5, rotation: -20, duration: 0.24, ease: 'power4.in' }, 1.3)
      .fromTo(root.querySelector('.cf-received .ring'), { opacity: 0.6, scale: 0.9 }, { opacity: 0, scale: 1.5, duration: 0.5, ease: 'power2.out' }, '>');
    return () => tl.revert();
  }, [phase, animate]);

  const writeAnother = () => {
    setPhase('form');
    setStatus({ kind: '', text: '' });
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const send = (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSending(true);
    setStatus({ kind: '', text: '' });
    emailjs
      .sendForm(EMAILJS.serviceId, EMAILJS.templateId, form, EMAILJS.publicKey)
      .then(() => {
        setStatus({ kind: 'ok', text: 'Message sent. I usually reply within a day.' });
        setPhase('folding');
        posthog?.capture('contact_form_submitted');
        posthog?.setPersonProperties({ contacted: true });
        form.reset();
      })
      .catch((err) => {
        setStatus({ kind: 'err', text: `That did not go through. Email me at ${profile.email} and it will reach me.` });
        posthog?.capture('contact_form_failed', { error: err?.text || String(err) });
        posthog?.captureException?.(err);
      })
      .finally(() => setSending(false));
  };

  return (
    <form className="cform" ref={formRef} onSubmit={send} noValidate aria-labelledby="cform-title">
      <h3 className="cform-title" id="cform-title">Send a message</h3>
      <div className="cform-fields" ref={fieldsRef} hidden={phase === 'filed'}>
        <label htmlFor="cf-name">
          Your name
          <input id="cf-name" name="name" autoComplete="name" required ref={nameRef} />
        </label>
        <label htmlFor="cf-email">
          Your email
          <input id="cf-email" name="email" type="email" autoComplete="email" required />
        </label>
        <label htmlFor="cf-message">
          Message
          <textarea id="cf-message" name="message" required />
        </label>
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
      {phase === 'filed' && (
        <div className="cf-filed" ref={filedRef} tabIndex={-1} aria-label="Message filed">
          <div className="cf-env-wrap">
            <Envelope />
            <span className="cf-received" aria-hidden="true">
              Received
              <span className="ring" />
            </span>
          </div>
          <button type="button" className="cf-again" onClick={writeAnother}>
            Write another message
          </button>
        </div>
      )}
      <p className={`cform-status ${status.kind}`} role="status" aria-live="polite">
        {status.text}
      </p>
    </form>
  );
};

const Contact = () => {
  const posthog = usePostHog();
  const emailRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState('');
  /** Bumped on every successful copy, so the COPIED stamp comes down again; 0 = no stamp. */
  const [copied, setCopied] = useState(0);
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(0), 2600);
    return () => clearTimeout(t);
  }, [copied]);
  const ghUser = profile.links.github.replace(/\/+$/, '').split('/').pop();
  const channel = (name) => () => posthog?.capture('contact_channel_clicked', { channel: name });

  const selectEmail = () => {
    try {
      const range = document.createRange();
      range.selectNodeContents(emailRef.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      // Selection is a convenience; the address is on screen either way.
    }
  };

  const copy = () => {
    posthog?.capture('contact_channel_clicked', { channel: 'email_copy' });
    const done = () => {
      setCopyStatus(`Copied ${profile.email} to the clipboard.`);
      setCopied((n) => n + 1);
    };
    const fail = () => {
      selectEmail();
      setCopyStatus('Could not copy automatically. The address is selected: press Ctrl+C or Cmd+C.');
    };
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(profile.email).then(done, fail);
      else fail();
    } catch {
      fail();
    }
  };

  return (
    <section className="contact on-night" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="sec-tab">Roles and contract work</p>
        <h2 className="sec-title" id="contact-title">Contact</h2>
        <p className="lede">{profile.availability} The fastest route is email.</p>
        <div className="contact-cols">
          <div>
            <div className="email-row">
              <span className="email" ref={emailRef}>{profile.email}</span>
              <span className="copy-wrap">
                <button className="copy-btn" type="button" onClick={copy}>Copy email</button>
                {copied > 0 && (
                  <span className="copied-stamp" key={copied} aria-hidden="true">
                    Copied
                  </span>
                )}
              </span>
              <a className="mail-link" href={`mailto:${profile.email}`} onClick={channel('email')}>Open in mail app</a>
            </div>
            <p className="copy-status" role="status" aria-live="polite">{copyStatus}</p>
            <ul className="contact-grid">
              <li>
                <span className="lbl">GitHub</span>
                <a href={profile.links.github} {...EXT} onClick={channel('github')}>{ghUser}<NewTab /><Arrow /></a>
              </li>
              <li>
                <span className="lbl">LinkedIn</span>
                <a href={profile.links.linkedin} {...EXT} onClick={channel('linkedin')}>{profile.name}<NewTab /><Arrow /></a>
              </li>
              <li>
                <span className="lbl">WhatsApp</span>
                <a href={profile.whatsapp.href} {...EXT} onClick={channel('whatsapp')}>{profile.whatsapp.display}<NewTab /><Arrow /></a>
              </li>
              <li>
                <span className="lbl">Resume</span>
                <a href={profile.resume} {...EXT} onClick={() => posthog?.capture('resume_downloaded', { source: 'contact' })}>
                  Open resume<NewTab /><Arrow />
                </a>
              </li>
            </ul>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
