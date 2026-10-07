import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionProvider } from './Motion';
import { closeFile, isFileTransition, openFile } from './fileOpen';
import { CaseStudyLink } from '../components/home/links';

/*
 * jsdom has no view transitions, so a stand-in records what the browser would
 * see: which elements carry a view-transition-name when the old page is
 * photographed (the call), and after the update callback (the new page).
 */
let transitions = [];
const named = () =>
  Object.fromEntries(
    [...document.querySelectorAll('*')].filter((el) => el.style.viewTransitionName).map((el) => [el.style.viewTransitionName, el.className])
  );
const fakeStartViewTransition = (update) => {
  const t = { oldNames: named(), direction: document.documentElement.dataset.fileTransition };
  let finish;
  t.finished = new Promise((resolve) => {
    finish = resolve;
  });
  t.finish = async () => {
    finish();
    await t.finished;
    await Promise.resolve();
  };
  t.updateCallbackDone = Promise.resolve()
    .then(update)
    .then(() => {
      t.newNames = named();
    });
  transitions.push(t);
  return t;
};

const inViewRect = { top: 100, bottom: 300, left: 0, right: 400, width: 400, height: 200, x: 0, y: 100 };

beforeEach(() => {
  transitions = [];
  document.startViewTransition = fakeStartViewTransition;
  // jsdom lays nothing out; every element reads as on screen.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(inViewRect);
});

afterEach(() => {
  delete document.startViewTransition;
  document.body.innerHTML = '';
  delete document.documentElement.dataset.fileTransition;
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

const indexRow = (id) => {
  const li = document.createElement('li');
  li.className = 'ix-row';
  li.innerHTML = `<div class="ix-thumb"><img alt=""></div><h4 class="ix-title"><a href="/projects/${id}">Title</a></h4>`;
  document.body.appendChild(li);
  return li;
};
const caseHead = () => {
  const head = document.createElement('header');
  head.className = 'case-head';
  head.innerHTML = '<h1 class="pg-title case-title">Title</h1><figure class="case-shot"><img class="shot" alt=""></figure>';
  document.body.appendChild(head);
  return head;
};

describe('the file opens', () => {
  it('travels the row screenshot and title into the case study, then lets go of the names', async () => {
    const row = indexRow('timetable-builder');
    openFile({
      link: row.querySelector('a'),
      go: () => {
        row.remove();
        caseHead();
      },
    });

    const [t] = transitions;
    expect(t.direction).toBe('open');
    expect(t.oldNames).toEqual({ 'file-shot': 'ix-thumb', 'file-title': 'ix-title' });
    expect(isFileTransition()).toBe(true);

    await t.updateCallbackDone;
    expect(t.newNames).toEqual({ 'file-shot': 'shot', 'file-title': 'pg-title case-title' });

    await t.finish();
    expect(named()).toEqual({});
    expect(document.documentElement.dataset.fileTransition).toBeUndefined();
    expect(isFileTransition()).toBe(false);
  });

  it('closes back onto the row the file was opened from, at the reader\'s place', async () => {
    const head = caseHead();
    sessionStorage.setItem('projectsScrollY', '1234');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    closeFile({
      projectId: 'timetable-builder',
      go: () => {
        head.remove();
        indexRow('another');
        indexRow('timetable-builder').classList.add('origin');
      },
    });

    const [t] = transitions;
    expect(t.direction).toBe('close');
    expect(t.oldNames).toEqual({ 'file-shot': 'shot', 'file-title': 'pg-title case-title' });
    await t.updateCallbackDone;
    expect(t.newNames).toEqual({ 'file-shot': 'ix-thumb', 'file-title': 'ix-title' });
    expect(document.querySelector('.origin .ix-thumb').style.viewTransitionName).toBe('file-shot');
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1234 }));
    await t.finish();
  });

  it('does not travel what is off screen (a case study screenshot below the fold on a phone)', async () => {
    const row = indexRow('timetable-builder');
    Element.prototype.getBoundingClientRect.mockImplementation(function rect() {
      return this.classList?.contains('shot') ? { ...inViewRect, top: 2000, bottom: 2200 } : inViewRect;
    });
    openFile({ link: row.querySelector('a'), go: () => caseHead() });
    const [t] = transitions;
    await t.updateCallbackDone;
    expect(t.newNames).toEqual({ 'file-title': 'pg-title case-title' });
    await t.finish();
  });

  it('never lets an earlier transition, finishing late, clear a newer one', async () => {
    const row = indexRow('timetable-builder');
    openFile({ link: row.querySelector('a'), go: () => caseHead() });
    const [first] = transitions;
    await first.updateCallbackDone;

    closeFile({ projectId: 'timetable-builder', go: () => {} });
    await first.finish();

    expect(document.documentElement.dataset.fileTransition).toBe('close');
    expect(document.querySelector('.case-title').style.viewTransitionName).toBe('');
    expect(isFileTransition()).toBe(true);
    await transitions[1].updateCallbackDone;
    await transitions[1].finish();
    expect(isFileTransition()).toBe(false);
  });
});

describe('a case study link', () => {
  const Where = () => <p data-testid="where">{useLocation().pathname}</p>;
  const renderLink = () =>
    render(
      <MotionProvider>
        <MemoryRouter initialEntries={['/']}>
          <CaseStudyLink project={{ id: 'timetable-builder', title: 'Timetable Builder' }} source="test" />
          <Routes>
            <Route path="*" element={<Where />} />
          </Routes>
        </MemoryRouter>
      </MotionProvider>
    );

  it('opens the file through a view transition when motion is on', async () => {
    renderLink();
    fireEvent.click(screen.getByRole('link', { name: 'Case study' }));
    expect(transitions).toHaveLength(1);
    expect(await screen.findByText('/projects/timetable-builder')).toBeInTheDocument();
    await transitions[0].finish();
  });

  it('leaves a modified click (a new tab) to the browser', () => {
    renderLink();
    // jsdom cannot open a tab; stop it trying once the page has had its say.
    window.addEventListener('click', (e) => e.preventDefault(), { once: true });
    fireEvent.click(screen.getByRole('link', { name: 'Case study' }), { ctrlKey: true });
    expect(transitions).toHaveLength(0);
  });

  it('just changes page with motion off', () => {
    window.localStorage.setItem('casefile-motion', 'off');
    renderLink();
    fireEvent.click(screen.getByRole('link', { name: 'Case study' }));
    expect(transitions).toHaveLength(0);
    expect(screen.getByTestId('where')).toHaveTextContent('/projects/timetable-builder');
  });

  it('just changes page in a browser without view transitions', () => {
    delete document.startViewTransition;
    renderLink();
    fireEvent.click(screen.getByRole('link', { name: 'Case study' }));
    expect(screen.getByTestId('where')).toHaveTextContent('/projects/timetable-builder');
  });
});
