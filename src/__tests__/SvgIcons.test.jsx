import {
  CPlusPlus,
  Android,
  Javascript,
  Python,
  Java,
  ReactIcon,
  NodejsIcon,
  DockerIcon,
} from '../components/SvgIcons';
import React from 'react';
import { render } from '@testing-library/react';

describe('SvgIcons', () => {
  const testIcon = (IconComponent, name) => {
    it(`${name} renders without crashing`, () => {
      const { container } = render(<IconComponent colour="#000000" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it(`${name} accepts colour prop`, () => {
      const testColor = '#FF5733';
      const { container } = render(<IconComponent colour={testColor} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  };

  describe('Language Icons', () => {
    testIcon(CPlusPlus, 'CPlusPlus');
    testIcon(Javascript, 'Javascript');
    testIcon(Python, 'Python');
    testIcon(Java, 'Java');
  });

  describe('Framework Icons', () => {
    testIcon(ReactIcon, 'ReactIcon');
    testIcon(NodejsIcon, 'NodejsIcon');
  });

  describe('Platform Icons', () => {
    testIcon(Android, 'Android');
    testIcon(DockerIcon, 'DockerIcon');
  });
});

describe('Icon Accessibility', () => {
  it('CPlusPlus SVG has proper structure', () => {
    const { container } = render(<CPlusPlus colour="#00599C" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('xmlns');
    expect(svg).toHaveAttribute('viewBox');
  });
});
