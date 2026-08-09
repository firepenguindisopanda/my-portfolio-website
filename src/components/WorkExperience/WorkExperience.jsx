import React, { useState } from 'react'
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
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
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import WorkIcon from '@mui/icons-material/Work'
import SchoolIcon from '@mui/icons-material/School'
import CodeIcon from '@mui/icons-material/Code'
import BusinessIcon from '@mui/icons-material/Business'
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SectionHeading from '../SectionHeading/SectionHeading'

const MotionCard = motion(Card)
const MotionChip = motion(Chip)

/**
 * One accent for the whole timeline.
 *
 * This used to rotate through seven palette colours by index - primary,
 * secondary, warning, info, error, success - so a run of jobs read as a
 * traffic-light chart where the colours carried no meaning.
 */
const getExperienceColor = (theme) => theme.palette.primary.main;

const workExperiences = [
    {
        id: 'tutor',
        title: 'Part Time Tutor',
        organization: 'UWI, Department of Computing and Information Technology',
        period: 'September 2024 - May 2026',
        type: 'Education',
        icon: SchoolIcon,
        achievements: ['Software Engineering', 'Mentorship', 'Best Practices'],
        items: [
            {
                type: 'task',
                icon: SchoolIcon,
                text: 'Delivered practical sessions on software engineering concepts and coding best practices.',
            },
            {
                type: 'task',
                icon: CodeIcon,
                text: 'Mentored Students on projects, emphasizing version control, design patterns, CI/CD and modern development methodologies.',
            },
        ],
    },
    {
        id: 'scs-contract',
        title: 'Full Stack Developer',
        organization: 'Scarlet Creative Software',
        period: 'September 2024 - May 2025',
        type: 'Full Stack',
        icon: CodeIcon,
        achievements: ['Nuxt.js', 'Firebase', 'Cloud Functions'],
        items: [
            {
                type: 'task',
                icon: CodeIcon,
                text: 'Maintained and improved a Nuxt js application that uses Firebase services, implementing Cloud Functions for server-side logic and data workflows.',
            },
            {
                type: 'task',
                icon: DeveloperModeIcon,
                text: 'Architected and refactored user facing features such as form creation, editing and management, ensuring seamless integration between front end components and backend APIs.',
            },
            {
                type: 'task',
                icon: BusinessIcon,
                text: 'Built and consumed RESTful APIs via cloud functions to handle account management and pdf report generations.',
            },
            {
                type: 'task',
                icon: WorkIcon,
                text: 'Optimized UX across devices and browsers by enforcing responsive design principles and maintaining brand consistency throughout the application.',
            },
        ],
    },
    {
        id: 'ccudev-may24',
        title: 'Independent Developer',
        organization: 'UWI, Department of Computing and Information Technology',
        period: 'May - June 2024',
        type: 'Development',
        icon: DeveloperModeIcon,
        achievements: ['99.59% Performance', 'System Design', 'Optimization'],
        items: [
            { type: 'task', icon: BusinessIcon, text: 'Created various software design artefacts.' },
            { type: 'task', icon: CodeIcon, text: 'Ensured the frontend and backend were connected and working as expected.' },
            { type: 'task', icon: DeveloperModeIcon, text: 'Improved Design of Frontend components to display data in a more user-friendly and accessible manner.' },
            { type: 'achievement', icon: WorkspacePremiumIcon, text: 'Optimized PDF parsing functionality, reducing processing time and achieving a 99.59% performance improvement.' },
            { type: 'task', icon: CodeIcon, text: 'Improved the backend to handle errors and exceptions.' },
            { type: 'task', icon: BusinessIcon, text: 'Conducted thorough performance analysis and profiling to identify bottlenecks and implement effective optimization strategies.' },
        ],
    },
    {
        id: 'ccudev-jan24',
        title: 'Independent Developer',
        organization: 'UWI, Department of Computing and Information Technology',
        period: 'January - February 2024',
        type: 'Development',
        icon: DeveloperModeIcon,
        achievements: ['System Design', 'Testing', 'Deployment'],
        items: [
            { type: 'task', icon: BusinessIcon, text: 'Created various software design artefacts.' },
            { type: 'task', icon: CodeIcon, text: 'Implemented the system according to the design artefacts and requirements.' },
            { type: 'task', icon: CheckCircleIcon, text: 'Performed unit testing.' },
            { type: 'task', icon: DeveloperModeIcon, text: 'Delivered a prototype deployment of the system.' },
        ],
    },
    {
        id: 'beuwi-may23',
        title: 'Independent Developer',
        organization: 'UWI, Department of Computing and Information Technology',
        period: 'May - July 2023',
        type: 'Development',
        icon: DeveloperModeIcon,
        achievements: ['Migration', 'CI/CD', 'Production Deploy'],
        items: [
            { type: 'task', icon: CodeIcon, text: 'Performed migration and dependencies updates' },
            { type: 'task', icon: BusinessIcon, text: 'Deployed updates to staging and production environments' },
            { type: 'task', icon: DeveloperModeIcon, text: 'Created various software design artefacts.' },
            { type: 'task', icon: CodeIcon, text: 'Implemented the system according to the design artefacts and requirements.' },
            { type: 'task', icon: CheckCircleIcon, text: 'Performed unit testing.' },
            { type: 'task', icon: BusinessIcon, text: 'Delivered a prototype deployment of the system.' },
            { type: 'task', icon: CodeIcon, text: 'Updated routes and controllers for the backend to successfully handle errors and exceptions.' },
        ],
    },
    {
        id: 'web3-intern',
        title: 'Intern',
        organization: 'UWI Department of Computing and Information Technology',
        period: 'July - August, 2022',
        type: 'Internship',
        icon: WorkIcon,
        achievements: ['Web3/Blockchain', 'CI/CD Pipeline', 'Angular'],
        items: [
            { type: 'task', icon: BusinessIcon, text: 'Created scripts to automatically deploy applications using Jenkins CI / CD pipeline.' },
            { type: 'task', icon: CodeIcon, text: 'Updated the Flask API with new functions and routes to send data to the frontend applications.' },
            { type: 'achievement', icon: DeveloperModeIcon, text: 'Created 5 Angular Blockchain Web3 Applications and connected them to the Flask API and the Blockchain.' },
            { type: 'task', icon: CheckCircleIcon, text: 'Created Unit Test for the 5 Angular Blockchain Web3 Applications to automatically run on the Jenkins Server before deploying.' },
        ],
    },
    {
        id: 'beuwi-jan22',
        title: 'Independent Developer',
        organization: 'UWI, Department of Computing and Information Technology',
        period: 'January - February, 2022',
        type: 'Development',
        icon: DeveloperModeIcon,
        achievements: ['Angular Migration', 'Search Feature', 'CI/CD'],
        items: [
            { type: 'task', icon: CodeIcon, text: 'Updated existing Angular Applications to the latest version, fixing errors that occured.' },
            { type: 'task', icon: DeveloperModeIcon, text: 'Updated existing search feature to autocomplete search.' },
            { type: 'task', icon: CheckCircleIcon, text: 'Identified and fixed bugs with the existing application. The fix contributed to the overall user experience of the application.' },
            { type: 'task', icon: BusinessIcon, text: 'Changed CircleCI workflow to Github Actions.' },
        ],
    },
]

const WorkExperience = () => {
    const [expandedCards, setExpandedCards] = useState(new Set())
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const toggleCard = (id) => {
        const newSet = new Set(expandedCards)
        newSet.has(id) ? newSet.delete(id) : newSet.add(id)
        setExpandedCards(newSet)
    }

    const renderTimelineView = () => (
        <Timeline position="right" sx={{ p: 0, maxWidth: 860 }}>
            {workExperiences.map((experience, idx) => {
                const expColor = getExperienceColor(theme)
                return (
                    // The card carries the organisation and period now, so the
                    // opposite-content column would just repeat them. ::before
                    // is MUI Lab's spacer for that column.
                    <TimelineItem key={experience.id} sx={{ '&::before': { display: 'none' } }}>

                        <TimelineSeparator>
                            <TimelineDot
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: '2px solid',
                                    borderColor: expColor,
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    m: 0,
                                }}
                            >
                                <experience.icon sx={{ color: expColor, fontSize: 18 }} />
                            </TimelineDot>
                            {idx < workExperiences.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                            {renderCard(experience, expColor)}
                        </TimelineContent>
                    </TimelineItem>
                )
            })}
        </Timeline>
    )

    const renderListView = () => (
        <Stack spacing={3}>
            {workExperiences.map((experience) => {
                const expColor = getExperienceColor(theme)
                return (
                    <Box key={experience.id}>{renderCard(experience, expColor)}</Box>
                )
            })}
        </Stack>
    )

    const renderCard = (experience, expColor) => (
        <MotionCard
            variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            sx={{ width: '100%', overflow: 'hidden' }}
        >
            <CardContent sx={{ px: 2, py: 1.5 }}>
                <Box>
                    <Typography variant="h3" component="h3" sx={{ fontSize: '1.05rem' }}>
                        {experience.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {experience.organization}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: theme.custom.codeFont }}>
                        {experience.period}
                    </Typography>
                </Box>

                <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
                    {experience.achievements.slice(0, 3).map((ach, i) => (
                        <MotionChip
                            key={ach}
                            label={ach}
                            size="small"
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.1 }}
                            sx={{
                                bgcolor: alpha(expColor, 0.08),
                                color: expColor,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                            }}
                        />
                    ))}
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pt: 0, pb: 1 }}>
                <Button
                    size="small"
                    onClick={() => toggleCard(experience.id)}
                    startIcon={expandedCards.has(experience.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ color: expColor }}
                    aria-expanded={expandedCards.has(experience.id)}
                >
                    {expandedCards.has(experience.id) ? 'Less Details' : 'View Details'}
                </Button>
            </CardActions>

            <AnimatePresence>
                {expandedCards.has(experience.id) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <CardContent sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: 2, py: 1 }}>
                            <Stack spacing={2}>
                                {experience.items.map((item, i) => (
                                    <Box key={i} display="flex" alignItems="flex-start" gap={2}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                bgcolor: alpha(expColor, 0.08),
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: 32,
                                                height: 32,
                                                mt: 0.5,
                                            }}
                                        >
                                            <item.icon sx={{ fontSize: 16, color: expColor }} />
                                        </Box>
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                            {item.text}
                                        </Typography>
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
                eyebrow="Where I've worked"
                title="Experience"
                description="Full-stack development, system optimisation and technical leadership, mostly with UWI's Department of Computing and Information Technology."
            />

            {isMobile ? renderListView() : renderTimelineView()}
        </Box>
    )
}

export default WorkExperience
