import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import {
    Box,
    Grid,
    Typography,
    Chip,
    Card,
    CardContent,
    CardActions,
    Button,
    Stack,
    useTheme,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, useReducedMotion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import { projects as projectsData } from '../../data/projects';
import useScrollRestore from '../../hooks/useScrollRestore';

/** How many cards to show before the visitor asks for more. */
const INITIAL_COUNT = 6;

const projects = projectsData
    .filter((p) => p.featured)
    .map((p) => ({
        id: p.id,
        title: p.title,
        highlight: p.highlight || p.shortDescription || p.description || '',
        demoLink: p.liveUrl || p.demoLink || null,
        repoLink: p.githubUrl || p.repoLink || null,
        // Cap the chip list here rather than in the view, so the data decides
        // which four technologies are worth the space.
        techLabels: (p.primaryTech || p.technologies || []).slice(0, 4),
        screenshot: p.screenshot || p.thumbnail || null,
        techIcons: p.techIcons || [],
        markdown: p.markdown || null,
        category: p.category || '',
        topPick: Boolean(p.topPick),
    }));

/**
 * Placeholder for projects without a screenshot yet: the tech icons on a flat
 * tinted panel. Every project with a reachable live URL should get a real
 * capture instead - see src/assets/screenshots.
 */
const IconPlaceholder = ({ techIcons, theme }) => (
    <Box
        sx={{
            aspectRatio: '16 / 9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            borderBottom: '1px solid',
            borderColor: 'divider',
        }}
    >
        {techIcons.slice(0, 3).map(({ Icon, src, label }) => (
            <Box
                key={label || Icon?.name}
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {Icon ? <Icon style={{ width: 22, height: 22 }} /> : <img src={src} alt="" width="22" height="22" />}
            </Box>
        ))}
    </Box>
);

const ProjectCard = ({ project, index }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const posthog = usePostHog();
    const prefersReducedMotion = useReducedMotion();

    const openDetail = () => {
        if (!project.markdown) return;
        posthog?.capture('project_viewed', {
            project_id: project.id,
            project_title: project.title,
            category: project.category,
        });
        try {
            sessionStorage.setItem('projectsScrollY', String(globalThis.scrollY || 0));
        } catch {
            // Private browsing blocks sessionStorage; scroll restore is optional.
        }
        navigate(`/projects/${project.id}`);
    };

    const reveal = theme.custom.motion;
    const motionProps = prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: reveal.distance },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-40px' },
              transition: {
                  duration: reveal.duration,
                  // Capped at six steps: past that the last card in a long grid
                  // arrives late enough to read as broken rather than staggered.
                  delay: Math.min(index, 5) * reveal.stagger,
                  ease: reveal.ease,
              },
          };

    return (
        <motion.div style={{ height: '100%' }} {...motionProps}>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: project.markdown ? 'pointer' : 'default',
                    ...(project.topPick && {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                    }),
                }}
                onClick={openDetail}
            >
                {project.screenshot ? (
                    <Box
                        sx={{
                            overflow: 'hidden',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box
                            component="img"
                            src={project.screenshot}
                            alt={`${project.title} screenshot`}
                            loading="lazy"
                            width={1200}
                            height={675}
                            sx={{
                                width: '100%',
                                // height:auto is load-bearing - without it the height attribute
                                // above makes both dimensions definite and aspectRatio is ignored,
                                // stretching the band to a 675px portrait strip.
                                height: 'auto',
                                aspectRatio: '16 / 9',
                                objectFit: 'cover',
                                // Slightly below the top edge, so thumbnails taller than 16/9
                                // show their middle instead of only their header.
                                objectPosition: '50% 25%',
                                display: 'block',
                                transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                                '.MuiCard-root:hover &': { transform: 'scale(1.035)' },
                                '@media (prefers-reduced-motion: reduce)': {
                                    transition: 'none',
                                    '.MuiCard-root:hover &': { transform: 'none' },
                                },
                            }}
                        />
                    </Box>
                ) : (
                    <IconPlaceholder techIcons={project.techIcons} theme={theme} />
                )}

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.25, p: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="overline" color="text.secondary">
                            {project.category}
                        </Typography>
                        {project.topPick && (
                            <Chip
                                label="Top pick"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.65rem', letterSpacing: '0.04em' }}
                            />
                        )}
                    </Stack>

                    <Typography variant="h3" component="h3" sx={{ fontSize: '1.125rem' }}>
                        {project.title}
                    </Typography>

                    {/* No line clamp: the highlight is written short enough to fit. */}
                    <Typography variant="body2" color="text.secondary">
                        {project.highlight}
                    </Typography>

                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 'auto', pt: 1 }}>
                        {project.techLabels.map((tech) => (
                            <Chip
                                key={tech}
                                label={tech}
                                size="small"
                                sx={{
                                    fontFamily: theme.custom.codeFont,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: 'primary.main',
                                }}
                            />
                        ))}
                    </Stack>
                </CardContent>

                <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1 }}>
                    {project.markdown && (
                        <Button size="small" variant="contained" onClick={openDetail}>
                            Case study
                        </Button>
                    )}
                    {project.demoLink && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LaunchIcon />}
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                posthog?.capture('project_demo_clicked', { project_id: project.id });
                            }}
                        >
                            Live
                        </Button>
                    )}
                    {project.repoLink && (
                        <Button
                            size="small"
                            startIcon={<GitHubIcon />}
                            href={project.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: 'text.secondary' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                posthog?.capture('project_github_clicked', { project_id: project.id });
                            }}
                        >
                            Code
                        </Button>
                    )}
                </CardActions>
            </Card>
        </motion.div>
    );
};

const Projects = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showAll, setShowAll] = useState(false);

    useScrollRestore('projectsScrollY');

    const categories = useMemo(() => {
        const cats = projects.reduce((acc, p) => {
            if (p.category && !acc.includes(p.category)) acc.push(p.category);
            return acc;
        }, []);
        return ['All', ...cats];
    }, []);

    const filtered = useMemo(() => {
        const base = selectedCategory === 'All'
            ? projects
            : projects.filter((p) => p.category === selectedCategory);
        // Top picks lead, so the strongest work is what a visitor sees first.
        return [...base].sort((a, b) => Number(b.topPick) - Number(a.topPick));
    }, [selectedCategory]);

    const visible = showAll ? filtered : filtered.slice(0, INITIAL_COUNT);
    const hiddenCount = filtered.length - visible.length;

    return (
        <Section>
            <SectionHeading
                eyebrow="Selected work"
                title="Projects"
                description="Things I've designed, built and shipped. Each one links to a write-up, the live site, or the source."
                count={`${filtered.length} shown`}
            />

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat}
                        label={cat}
                        onClick={() => { setSelectedCategory(cat); setShowAll(false); }}
                        variant={selectedCategory === cat ? 'filled' : 'outlined'}
                        color={selectedCategory === cat ? 'primary' : 'default'}
                    />
                ))}
            </Stack>

            <Grid container spacing={3}>
                {visible.map((project, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={project.id}>
                        <ProjectCard project={project} index={index} />
                    </Grid>
                ))}
            </Grid>

            {hiddenCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => setShowAll(true)}
                    >
                        {`View all ${filtered.length} projects`}
                    </Button>
                </Box>
            )}
        </Section>
    );
};

export default Projects;
