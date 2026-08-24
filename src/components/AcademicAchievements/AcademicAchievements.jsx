import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Tabs,
    Tab,
    Stack,
    Collapse,
    useTheme,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedIcon from '@mui/icons-material/Verified';
import { alpha } from '@mui/material/styles';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import {
    featuredCertificates,
    otherCertificates,
    totalCertificateCount,
    awards,
} from '../../data/certificates';

const CertificateCard = ({ cert, compact = false }) => {
    const theme = useTheme();
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box
                component="img"
                src={cert.image}
                alt={cert.label}
                loading="lazy"
                sx={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                    display: 'block',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                }}
            />
            <CardContent sx={{ flexGrow: 1, py: 1.5, px: 2 }}>
                <Typography
                    variant={compact ? 'caption' : 'body2'}
                    sx={{ fontWeight: 600, lineHeight: 1.35, display: 'block' }}
                >
                    {cert.label}
                </Typography>
                {cert.issuer && (
                    <Typography variant="caption" color="text.secondary">
                        {cert.issuer}
                    </Typography>
                )}
            </CardContent>
            {cert.verifyUrl && (
                <CardActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
                    <Button
                        size="small"
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{ fontSize: '0.75rem' }}
                    >
                        Verify
                    </Button>
                </CardActions>
            )}
        </Card>
    );
};

/**
 * Certificates and awards.
 *
 * The certificate wall used to be ~92 entries behind 12 pages of pagination,
 * most of them individual course completions with no verification link, and it
 * dwarfed the projects section. Twelve are featured; the rest are one click
 * away for anyone who wants the full list.
 */
const AcademicAchievements = () => {
    const [tab, setTab] = useState(0);
    const [showAll, setShowAll] = useState(false);

    return (
        <Section>
            <SectionHeading
                eyebrow="Credentials"
                title="Certificates & awards"
                description="Specialisations, professional certificates and competition placings. Verification links go straight to the issuer."
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab icon={<VerifiedIcon />} iconPosition="start" label="Certificates" />
                <Tab icon={<EmojiEventsIcon />} iconPosition="start" label="Awards & competitions" />
            </Tabs>

            {tab === 0 && (
                <>
                    <Grid container spacing={2.5}>
                        {featuredCertificates.map((cert) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={cert.id}>
                                <CertificateCard cert={cert} />
                            </Grid>
                        ))}
                    </Grid>

                    {otherCertificates.length > 0 && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowAll((open) => !open)}
                                    endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    aria-expanded={showAll}
                                >
                                    {showAll ? 'Hide the rest' : `View all ${totalCertificateCount} certificates`}
                                </Button>
                            </Box>

                            <Collapse in={showAll} unmountOnExit>
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        {`Coursework - ${otherCertificates.length} more`}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {otherCertificates.map((cert) => (
                                            <Grid item xs={6} sm={4} md={3} lg={2} key={cert.id}>
                                                <CertificateCard cert={cert} compact />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Collapse>
                        </>
                    )}
                </>
            )}

            {tab === 1 && (
                <Grid container spacing={2.5}>
                    {awards.map((award) => (
                        <Grid item xs={12} sm={6} key={award.title}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ mb: 1 }}>
                                        <EmojiEventsIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                                        <Box>
                                            <Typography variant="h5" component="h3">
                                                {award.title}
                                            </Typography>
                                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                                                {award.subtitle}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                        {award.description}
                                    </Typography>
                                </CardContent>
                                {award.url && (
                                    <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                                        <Button
                                            href={award.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            endIcon={<OpenInNewIcon />}
                                            variant="outlined"
                                            size="small"
                                        >
                                            Details
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Section>
    );
};

export default AcademicAchievements;
