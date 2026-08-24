import React from 'react';
import useLayout from '../../hooks/useLayout';
import Panel from './arrangements/Panel';
import Masthead from './arrangements/Masthead';
import Cover from './arrangements/Cover';
import Plate from './arrangements/Plate';

/**
 * The first screen, arranged four ways.
 *
 * Each mode opens with the most characteristic thing in its own world: an
 * instrument panel, the masthead of an audit sheet, the cover of a notebook, or
 * the first object in a gallery. Each owns its timeline, because motion is one
 * of the things the modes vary - a snap and an unveiling are not the same
 * gesture at different speeds.
 *
 * What every arrangement keeps: the name as the page's only h1, "See my work"
 * spelled that way, the resume link, the socials, and all three evidence rows
 * linking to the case studies that substantiate the thesis above them.
 */
const ARRANGEMENTS = {
  panel: Panel,
  masthead: Masthead,
  cover: Cover,
  plate: Plate,
};

const Hero = ({ onSeeWork }) => {
  const { hero } = useLayout();
  const Arrangement = ARRANGEMENTS[hero] ?? Panel;

  return <Arrangement onSeeWork={onSeeWork} />;
};

export default Hero;
