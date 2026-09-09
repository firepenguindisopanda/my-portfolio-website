import React, { useState } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  CPlusPlus,
  Android,
  Javascript,
  Python,
  Windows,
  Java,
  Jenkins,
  SpringBoot,
  Flask,
  Heroku,
  Angular,
  MaterialUi,
  Bootstrap,
  ReactIcon,
  NodejsIcon,
  PostgresqlIcon,
  FirebaseIcon,
  GitIcon,
  DockerIcon,
  AWSIcon,
  NginxIcon,
  GCPIcon,
  GithubIcon,
  TailwindCssIcon,
} from '../SvgIcons';

const tools = [
  { Icon: CPlusPlus, colour: '#00599C', name: 'C++', category: 'Language' },
  { Icon: Android, colour: '#3DDC84', name: 'Android', category: 'Mobile' },
  { Icon: Javascript, colour: '#F7DF1E', name: 'JavaScript', category: 'Language' },
  { Icon: Python, colour: '#3776AB', name: 'Python', category: 'Language' },
  { Icon: Windows, colour: '#0078D4', name: 'Windows', category: 'OS' },
  { Icon: Java, colour: '#ED8B00', name: 'Java', category: 'Language' },
  { Icon: Jenkins, colour: '#D33833', name: 'Jenkins', category: 'DevOps' },
  { Icon: SpringBoot, colour: '#6DB33F', name: 'Spring Boot', category: 'Framework' },
  { Icon: Flask, colour: '#000000', name: 'Flask', category: 'Framework' },
  { Icon: Heroku, colour: '#430098', name: 'Heroku', category: 'Cloud' },
  { Icon: Angular, colour: '#DD0031', name: 'Angular', category: 'Framework' },
  { Icon: MaterialUi, colour: '#007FFF', name: 'Material UI', category: 'UI Library' },
  { Icon: Bootstrap, colour: '#7952B3', name: 'Bootstrap', category: 'UI Library' },
  { Icon: ReactIcon, colour: '#61DAFB', name: 'React', category: 'Framework' },
  { Icon: NodejsIcon, colour: '#339933', name: 'Node.js', category: 'Runtime' },
  { Icon: PostgresqlIcon, colour: '#336791', name: 'PostgreSQL', category: 'Database' },
  { Icon: FirebaseIcon, colour: '#FFCA28', name: 'Firebase', category: 'Cloud' },
  { Icon: GitIcon, colour: '#F05032', name: 'Git', category: 'Version Control' },
  { Icon: DockerIcon, colour: '#2496ED', name: 'Docker', category: 'DevOps' },
  { Icon: NginxIcon, colour: '#009639', name: 'NGINX', category: 'Web Server' },
  { Icon: AWSIcon, colour: '#FF9900', name: 'AWS', category: 'Cloud' },
  { Icon: GCPIcon, colour: '#4285F4', name: 'Google Cloud', category: 'Cloud' },
  { Icon: GithubIcon, colour: '#181717', name: 'GitHub', category: 'Version Control' },
  { Icon: TailwindCssIcon, colour: '#06B6D4', name: 'Tailwind CSS', category: 'UI Library' },
];

/** One full pass of the strip. Roughly 2.5s per tool, close to the old autoplay pace. */
const LOOP_SECONDS = 60;

/**
 * The track holds the row twice and slides by exactly one copy, so the end of
 * the second row lands where the first began and the loop has no seam. Each
 * tile carries its own right margin rather than the track using `gap`, because
 * a gap between the two copies would be one short and the seam would jump.
 */
const slide = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const TILE_GAP = { xs: 20, sm: 30, md: 40 };
const TILE_SIZE = { xs: 40, sm: 50, md: 60 };

const Tile = ({ tool, copy }) => {
  const theme = useTheme();
  const { Icon, colour, name, category } = tool;

  return (
    <Box
      className={copy ? 'marquee-copy' : undefined}
      aria-hidden={copy ? 'true' : undefined}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        mr: { xs: `${TILE_GAP.xs}px`, sm: `${TILE_GAP.sm}px`, md: `${TILE_GAP.md}px` },
      }}
    >
      <Box
        sx={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderRadius: `${theme.custom.radius.control}px`,
          mb: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          transition: 'border-color 0.2s ease',
          '&:hover': { borderColor: theme.custom.card.hoverBorderColor },
          '& svg': { width: '70%', height: '70%' },
        }}
      >
        <Icon colour={colour} />
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
          mb: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>

      <Chip
        label={category}
        size="small"
        sx={{
          fontSize: '0.65rem',
          height: 20,
          bgcolor: 'transparent',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
          '& .MuiChip-label': { px: 0.75 },
        }}
      />
    </Box>
  );
};

/**
 * A slow, continuous strip of the tools in the toolkit.
 *
 * This was Swiper: 78kB of JavaScript plus four stylesheets on the home page,
 * for one autoplaying row. A CSS keyframe does the same job for the cost of a
 * rule. It pauses under the pointer, whenever anything inside it has focus,
 * and on the button; under prefers-reduced-motion it does not run at all and
 * the row wraps into a static grid instead.
 */
const IconCarousel = () => {
  const theme = useTheme();
  const [paused, setPaused] = useState(false);

  return (
    <Box
      component="section"
      aria-labelledby="tech-stack-heading"
      sx={{
        overflow: 'hidden',
        width: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${theme.custom.radius.container}px`,
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 3, sm: 4, md: 5 },
        mt: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h3" id="tech-stack-heading" sx={{ mb: 0.5 }}>
            Tech Stack
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Technologies and tools I work with
          </Typography>
        </Box>

        <IconButton
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? 'Resume the tech stack strip' : 'Pause the tech stack strip'}
          sx={{
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
          }}
        >
          {paused ? <PlayArrowIcon /> : <PauseIcon />}
        </IconButton>
      </Box>

      <Box
        sx={{
          overflow: 'hidden',
          '&:hover .marquee-track, &:focus-within .marquee-track': { animationPlayState: 'paused' },
        }}
      >
        <Box
          className="marquee-track"
          sx={{
            display: 'flex',
            width: 'max-content',
            animation: `${slide} ${LOOP_SECONDS}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              width: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center',
              rowGap: 3,
              '& .marquee-copy': { display: 'none' },
            },
          }}
        >
          {tools.map((tool) => (
            <Tile key={tool.name} tool={tool} />
          ))}
          {tools.map((tool) => (
            <Tile key={`${tool.name}-copy`} tool={tool} copy />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default IconCarousel;
