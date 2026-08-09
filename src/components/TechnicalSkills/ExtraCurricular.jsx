import React, { useState } from 'react'
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
    Avatar,
} from '@mui/material'
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
} from '@mui/lab'
import { motion, AnimatePresence } from 'framer-motion'
import { alpha } from '@mui/material/styles'
import CardMembershipIcon from '@mui/icons-material/CardMembership'
import WorkIcon from '@mui/icons-material/Work'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupIcon from '@mui/icons-material/Group'
import CodeIcon from '@mui/icons-material/Code'
import SchoolIcon from '@mui/icons-material/School'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CCUDEVTECHLEAD from '../../assets/CCU_Tech_lead.pdf'
import SectionHeading from '../SectionHeading/SectionHeading'

const MotionCard = motion(Card)
const MotionChip = motion(Chip)

// One accent, as in the Experience timeline - see WorkExperience.jsx.
const getSectionColor = (theme) => theme.palette.primary.main

const sections = [
    {
        id: 'wids24',
        title: 'Mentor - WiDS Datathon 2022 - Present',
        organization: 'U.W.I, D.C.I.T',
        period: 'Ongoing',
        type: 'Data Science',
        icon: EmojiEventsIcon,
        achievements: ['3rd Place Local', 'Content Creation', 'Team Collaboration'],
        items: [
            {
                type: 'certificate',
                icon: CardMembershipIcon,
                label: 'View Certificate',
                href: 'https://www.linkedin.com/in/nicholas-smith-933125148/details/certifications/1711166446408/single-media-viewer/?profileId=ACoAACOdFPcBKISwS8FqrESmFMsZpo9GSQh6yk4',
            },
            {
                type: 'achievement',
                icon: SchoolIcon,
                text: 'Developed comprehensive training content for fellow mentors',
            },
            {
                type: 'achievement',
                icon: EmojiEventsIcon,
                text: 'Secured 3rd place in local Datathon competition (Team of 4)',
            },
        ],
    },
    {
        id: 'ccu',
        title: 'Tech Lead - Computer Connections Unit Apprenticeship Programme',
        organization: 'U.W.I, D.C.I.T',
        period: 'Aug 2024 - Sep 2024',
        type: 'Leadership',
        icon: CodeIcon,
        achievements: ['Certificate of Achievement', 'Team Management', 'Agile Methodology'],
        items: [
            {
                type: 'certificate',
                icon: CardMembershipIcon,
                label: 'Certificate of Achievement',
                href: CCUDEVTECHLEAD,
            },
            {
                type: 'achievement',
                icon: WorkIcon,
                text: 'Led tech team on My Advisor project using modern development practices',
            },
            {
                type: 'skill',
                icon: GroupIcon,
                text: 'Managed cross-functional team using Agile methodologies',
            },
            {
                type: 'task',
                icon: CodeIcon,
                text: 'Architected GitHub project structure and created development tasks',
            },
        ],
    },
    {
        id: 'wids23',
        title: 'Lead Mentor - WiDS Datathon 2022/23',
        organization: 'U.W.I, D.C.I.T',
        period: '2023',
        type: 'Data Science',
        icon: EmojiEventsIcon,
        achievements: ['2nd Place Local', 'Tutorial Presentation', 'Team Leadership'],
        items: [
            {
                type: 'certificate',
                icon: CardMembershipIcon,
                label: 'View Certificate',
                href: 'https://www.linkedin.com/posts/nicholas-smith-933125148_certificate-of-participation-in-wids-2023-activity-7040796180926099457-wvrs?utm_source=share&utm_medium=member_desktop',
            },
            {
                type: 'achievement',
                icon: SchoolIcon,
                text: 'Delivered interactive Exploratory Data Analysis tutorial',
            },
            {
                type: 'achievement',
                icon: EmojiEventsIcon,
                text: 'Led team to 2nd place finish in local competition',
            },
        ],
    },
    {
        id: 'youth',
        title: 'Digital Literacy Mentor - Youth Speak Up Program',
        organization: 'St. Augustine Rotary Club & U.W.I',
        period: '2022',
        type: 'Education',
        icon: SchoolIcon,
        achievements: ['Google Workspace Training', 'Youth Empowerment'],
        items: [
            {
                type: 'skill',
                icon: SchoolIcon,
                text: 'Google Docs proficiency training',
            },
            {
                type: 'skill',
                icon: SchoolIcon,
                text: 'Google Sheets data management workshops',
            },
            {
                type: 'skill',
                icon: SchoolIcon,
                text: 'Google Slides presentation skills development',
            },
        ],
    },
    {
        id: 'robotics',
        title: 'Robotics Mentor - DCIT Robotics Boot Camp',
        organization: 'U.W.I, D.C.I.T - St. Augustine',
        period: 'Boot Camp',
        type: 'STEM',
        icon: CodeIcon,
        achievements: ['1st Place Winner', 'Python Programming', 'Computer Vision'],
        items: [
            {
                type: 'achievement',
                icon: CodeIcon,
                text: 'Guided students in Python programming for autonomous robot navigation',
            },
            {
                type: 'achievement',
                icon: EmojiEventsIcon,
                text: 'Coached winning team in maze-solving robotics challenge',
            },
        ],
    },
]

const ExtraCurricular = () => {
    const [expandedCards, setExpandedCards] = useState(new Set())
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const toggleCard = (id) => {
        const newSet = new Set(expandedCards)
        newSet.has(id) ? newSet.delete(id) : newSet.add(id)
        setExpandedCards(newSet)
    }

    const getTypeIcon = (type) => {
        const iconProps = { fontSize: 'small', sx: { color: 'white' } }
        switch (type) {
            case 'Leadership': return <GroupIcon {...iconProps} />
            case 'Data Science': return <EmojiEventsIcon {...iconProps} />
            case 'Education': return <SchoolIcon {...iconProps} />
            case 'STEM': return <CodeIcon {...iconProps} />
            default: return <WorkIcon {...iconProps} />
        }
    }

    const renderTimelineView = () => (
        <Timeline position="right" sx={{ p: 0, maxWidth: 860 }}>
            {sections.map((section, idx) => {
                const secColor = getSectionColor(theme)
                return (
                    <TimelineItem key={section.id} sx={{ '&::before': { display: 'none' } }}>

                        <TimelineSeparator>
                            <TimelineDot
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: '2px solid',
                                    borderColor: secColor,
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    m: 0,
                                }}
                            >
                                <section.icon sx={{ color: secColor, fontSize: 18 }} />
                            </TimelineDot>
                            {idx < sections.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                            {renderCard(section, secColor)}
                        </TimelineContent>
                    </TimelineItem>
                )
            })}
        </Timeline>
    )

    const renderListView = () => (
        <Stack spacing={3}>
            {sections.map((section) => {
                const secColor = getSectionColor(theme)
                return (
                    <Box key={section.id}>{renderCard(section, secColor)}</Box>
                )
            })}
        </Stack>
    )

    const renderCard = (section, secColor) => (
        <MotionCard
            variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
                hover: { scale: 1.02, y: -4 },
            }}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            sx={{
                width: '100%',
                borderRadius: 6,
                border: `2px solid ${alpha(secColor, 0.12)}`,
                overflow: 'hidden',
            }}
        >
            <CardContent sx={{ px: 2, py: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: secColor, width: 32, height: 32 }}>
                        {getTypeIcon(section.type)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 600 }}>
                            {section.title}
                        </Typography>
                        {!isMobile && (
                            <Typography variant="caption" color="text.secondary">
                                {section.organization} • {section.period}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
                    {section.achievements.slice(0, 3).map((ach, i) => (
                        <MotionChip
                            key={ach}
                            label={ach}
                            size="small"
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.1 }}
                            sx={{
                                bgcolor: alpha(secColor, 0.1),
                                color: secColor,
                                fontWeight: 500,
                                fontSize: '0.75rem',
                            }}
                        />
                    ))}
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pt: 0, pb: 1 }}>
                <Button
                    size="small"
                    onClick={() => toggleCard(section.id)}
                    startIcon={expandedCards.has(section.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ color: secColor }}
                    aria-expanded={expandedCards.has(section.id)}
                >
                    {expandedCards.has(section.id) ? 'Less Details' : 'View Details'}
                </Button>
            </CardActions>

            <AnimatePresence>
                {expandedCards.has(section.id) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <CardContent sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: 2, py: 1 }}>
                            <Stack spacing={2}>
                                {section.items.map((item, i) => (
                                    <Box key={i} display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                bgcolor: alpha(secColor, 0.08),
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 32,
                                                height: 32,
                                            }}
                                        >
                                            <item.icon sx={{ fontSize: 16, color: secColor }} />
                                        </Box>
                                        {item.type === 'certificate' ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener"
                                                endIcon={<OpenInNewIcon />}
                                                sx={{
                                                    borderColor: secColor,
                                                    color: secColor,
                                                    '&:hover': { bgcolor: alpha(secColor, 0.08) },
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        ) : (
                                            <Typography variant="body2">{item.text}</Typography>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </MotionCard>
    )

    return (
        <Box sx={{ py: { xs: 6, md: 9 } }}>
            <SectionHeading
                eyebrow="Beyond the day job"
                title="Mentorship & community"
                description="Leadership and mentoring across university programmes, datathons and bootcamps."
            />

            {isMobile ? renderListView() : renderTimelineView()}

            <Box mt={6} p={3} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={6} sm={3} textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            2
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Programs Led
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3} textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            1
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Awards Won
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3} textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            50+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Students Tutored
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3} textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            3
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Organizations
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}

export default ExtraCurricular
