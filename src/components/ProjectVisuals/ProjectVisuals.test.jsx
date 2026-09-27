import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PROJECT_VISUALS } from './index';
import LinkTrackerVisual from './LinkTrackerVisual';
import { ProjectMedia } from '../CategoryPage/CategoryPage';
import { projects } from '../../data/projects';
import { casefileTheme } from '../../utilities/themeConfig';

const renderInTheme = (ui) => render(<ThemeProvider theme={createTheme(casefileTheme)}>{ui}</ThemeProvider>);

const tracker = projects.find((p) => p.id === 'link-tracker');

describe('project visuals', () => {
  it('registers a visual for every project that names one', () => {
    // A typo in `visual` would silently drop the figure; this makes it fail instead.
    const missing = projects.filter((p) => p.visual && !PROJECT_VISUALS[p.visual]).map((p) => p.id);
    expect(missing).toEqual([]);
  });

  it('draws Link Tracker as a labelled illustration', () => {
    renderInTheme(<LinkTrackerVisual />);
    // One image to assistive tech, labelled as an illustration - its counts
    // are illustrative and should not be read out as data.
    expect(screen.getByRole('img', { name: /^Illustration of Link Tracker/ })).toBeInTheDocument();
  });

  it('shows the real screenshot on a row when the project has one', () => {
    renderInTheme(<ProjectMedia project={tracker} title="Link Tracker" />);
    expect(screen.getByRole('img', { name: 'Screenshot of Link Tracker' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /^Illustration/ })).not.toBeInTheDocument();
  });

  it('falls back to the drawn visual when there is no screenshot', () => {
    renderInTheme(<ProjectMedia project={{ ...tracker, screenshot: null }} title="Link Tracker" />);
    expect(screen.getByRole('img', { name: /^Illustration of Link Tracker/ })).toBeInTheDocument();
  });

  it('never invents a picture for a project with neither', () => {
    const { container } = renderInTheme(<ProjectMedia project={{ ...tracker, screenshot: null, visual: null }} title="Link Tracker" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container).toHaveTextContent(tracker.primaryTech.slice(0, 3).join(' / '));
  });
});
