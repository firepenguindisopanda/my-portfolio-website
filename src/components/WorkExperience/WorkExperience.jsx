import React from 'react';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import useLayout from '../../hooks/useLayout';
import { workExperiences, useExpanded } from './experienceData';
import TimelineView from './renderers/TimelineView';
import TableView from './renderers/TableView';
import RailView from './renderers/RailView';
import StackView from './renderers/StackView';

/**
 * Work history, arranged four ways.
 *
 * The dates are the content here, so each mode puts them where its own format
 * puts a date: on a timeline rail, in a Period column, written in the margin,
 * or set against the role as a credit line.
 */
const RENDERERS = {
  timeline: TimelineView,
  table: TableView,
  rail: RailView,
  stack: StackView,
};

const WorkExperience = () => {
  const { experience: renderer } = useLayout();
  const { expanded, toggle } = useExpanded();

  const Renderer = RENDERERS[renderer] ?? TimelineView;

  return (
    <Section>
      <SectionHeading
        eyebrow="Where I've worked"
        title="Experience"
        description="Full-stack development, system optimisation and technical leadership, mostly with UWI's Department of Computing and Information Technology."
        count={`${workExperiences.length} roles`}
      />

      <Renderer experiences={workExperiences} expanded={expanded} onToggle={toggle} />
    </Section>
  );
};

export default WorkExperience;
