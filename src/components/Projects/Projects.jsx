import React from 'react';
import { Box, Button, Chip, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import useLayout from '../../hooks/useLayout';
import useScrollRestore from '../../hooks/useScrollRestore';
import useProjectList from './useProjectList';
import Cards from './renderers/Cards';
import Table from './renderers/Table';
import Entries from './renderers/Entries';
import Plates from './renderers/Plates';

/**
 * The work, arranged four ways.
 *
 * Each mode presents the same list in the format it argues for: a modular grid,
 * an audit table, notebook entries, gallery plates. The renderers are siblings
 * fed by one `useProjectList`, and the choice between them is a single token
 * lookup - no component here or below asks which theme is active.
 *
 * What does not vary: the filter control, the visible window, the heading level
 * and text of every project, and the analytics each action fires. A mode
 * changes the arrangement, never the content or the contract.
 */
const RENDERERS = {
  cards: Cards,
  table: Table,
  entries: Entries,
  plates: Plates,
};

const Projects = () => {
  const { projects: renderer } = useLayout();
  const { categories, selectedCategory, selectCategory, filtered, visible, hiddenCount, showAll } =
    useProjectList();

  useScrollRestore('projectsScrollY');

  const Renderer = RENDERERS[renderer] ?? Cards;

  return (
    <Section>
      <SectionHeading
        eyebrow="Selected work"
        title="Projects"
        description="Things I've designed, built and shipped. Each one links to a write-up, the live site, or the source."
        // What is on screen, not what exists. `${filtered.length} shown` read as
        // 18 while six were rendered, which is the same unverifiable claim the
        // Range board's source lines exist to prevent.
        count={`${visible.length} of ${filtered.length}`}
      />

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => selectCategory(cat)}
            variant={selectedCategory === cat ? 'filled' : 'outlined'}
            color={selectedCategory === cat ? 'primary' : 'default'}
          />
        ))}
      </Stack>

      <Renderer projects={visible} />

      {hiddenCount > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="outlined" size="large" endIcon={<ArrowForwardIcon />} onClick={showAll}>
            {`View all ${filtered.length} projects`}
          </Button>
        </Box>
      )}
    </Section>
  );
};

export default Projects;
