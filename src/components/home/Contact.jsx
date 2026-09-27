import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { usePostHog } from '@posthog/react';
import { profile } from '../../data/profile';
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
 */

const EMAILJS = {
  serviceId: 'service_wf5ex2f',
  templateId: 'template_0ouoimq',
  publicKey: 'Mbp02i3iokIucc48d',
};

const ContactForm = () => {
  const formRef = useRef(null);
  const posthog = usePostHog();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ kind: '', text: '' });

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
      <label htmlFor="cf-name">
        Your name
        <input id="cf-name" name="name" autoComplete="name" required />
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
    const done = () => setCopyStatus(`Copied ${profile.email} to the clipboard.`);
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
              <button className="copy-btn" type="button" onClick={copy}>Copy email</button>
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
