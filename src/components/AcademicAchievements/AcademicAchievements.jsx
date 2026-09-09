import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Link,
    Grid,
    CardContent,
    CardActions,
    Tabs,
    Tab,
    Stack,
    Collapse,
    useTheme,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VerifiedIcon from '@mui/icons-material/Verified';
import Section from '../Section/Section';
import SectionHeading from '../SectionHeading/SectionHeading';
import Surface from '../Surface/Surface';
import {
    featuredCertificates,
    otherCertificates,
    totalCertificateCount,
    awards,
} from '../../data/certificates';

/**
 * One credential, one ruled line.
 *
 * This was a 4:3 image card. Twelve of them, then eighty more behind the
 * disclosure, then eight Credly iframes in a second section below - which made
 * credentials 21% of the page, more than projects and experience put together
 * had. The thumbnails were the giveaway: a certificate PDF shrunk to 260px is
 * unreadable, so every card spent its area on a picture of proof rather than on
 * the proof.
 *
 * An index row spends it on the two things a reader actually scans for - who
 * issued it and what it is - and puts the proof behind one link. Issuer sits in
 * the mono label face, which is this site's one constant across all four modes
 * and does exactly this job everywhere else: labels, codes, and the line saying
 * where a claim can be checked.
 *
 * The link text is not decoration either. `Verify` goes to the issuer's own
 * record and is the stronger claim; `Certificate` opens the document itself,
 * which is all there is when the issuer publishes no badge. Naming which one a
 * row has is the same standard the Range board holds its numbers to.
 */
const CredentialRow = ({ cert }) => {
    const theme = useTheme();
    const proofUrl = cert.verifyUrl || cert.image;
    const proofLabel = cert.verifyUrl ? 'Verify' : 'Certificate';

    return (
        <Box
            component="li"
            sx={{
                display: 'grid',
                // Wide enough for the longest issuer on the list - "University of
                // the West Indies" - to hold one line. A wrapping issuer makes
                // that one row taller than the rest, which is the only thing
                // that can break the rhythm of a ruled index.
                gridTemplateColumns: { xs: '1fr auto', md: '232px minmax(0, 1fr) auto' },
                alignItems: 'baseline',
                columnGap: 2,
                rowGap: 0.25,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    fontFamily: theme.custom.codeFont,
                    // Below md the issuer sits above the name rather than
                    // beside it, and the proof link keeps the right edge.
                    gridColumn: { xs: '1 / -1', md: 'auto' },
                    order: { xs: -1, md: 0 },
                }}
            >
                {cert.issuer || 'Coursework'}
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {cert.label}
            </Typography>

            {proofUrl && (
                <Link
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    underline="hover"
                    // Ninety rows of a link reading "Verify" is ninety identical
                    // entries in a screen reader's link list. The name says
                    // which credential this one proves.
                    aria-label={`${proofLabel}: ${cert.label}`}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        whiteSpace: 'nowrap',
                        justifySelf: 'end',
                    }}
                >
                    {proofLabel}
                    <OpenInNewIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                </Link>
            )}
        </Box>
    );
};

const CredentialIndex = ({ items, 'aria-label': ariaLabel }) => (
    <Box
        component="ul"
        aria-label={ariaLabel}
        sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
        }}
    >
        {items.map((cert) => (
            <CredentialRow key={cert.id} cert={cert} />
        ))}
    </Box>
);

/**
 * How many certificate rows the home page shows before handing off to /background.
 *
 * Seventeen featured rows ran to ~880px on a page where credentials and
 * community together were 21% of the scroll - more than projects and experience
 * combined. Six is the top of the same list, and because FEATURED is ordered
 * strongest-first it is also the half that covers both halves of the job:
 * two ML specialisations and three data-analytics certificates.
 */
const HOME_LIMIT = 6;

/**
 * Certificates and awards.
 *
 * The certificate wall used to be ~92 entries behind 12 pages of pagination,
 * most of them individual course completions with no verification link, and it
 * dwarfed the projects section. Twelve are featured; the rest are one click
 * away for anyone who wants the full list.
 *
 * Awards keep the block treatment. They are four things with a story each -
 * a placing, a field, a margin - not rows in an index, and the mode's `surface`
 * token is what decides how a block is enclosed.
 *
 * `full` is what /background passes. The home page shows the first six rows and
 * a link; the background page shows the index in full, with the coursework
 * behind the same disclosure it has always had. One component either way - the
 * two views differ by how many rows they slice, not by having their own layout.
 */
const AcademicAchievements = ({ full = false }) => {
    const [tab, setTab] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();

    const shown = full ? featuredCertificates : featuredCertificates.slice(0, HOME_LIMIT);

    return (
        <Section>
            <SectionHeading
                eyebrow="Credentials"
                title="Certificates & awards"
                description={
                    full
                        ? 'Every certificate on file, plus competition placings. Verification links go straight to the issuer.'
                        : 'Specialisations, professional certificates and competition placings. Verification links go straight to the issuer.'
                }
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab icon={<VerifiedIcon />} iconPosition="start" label="Certificates" />
                <Tab icon={<EmojiEventsIcon />} iconPosition="start" label="Awards & competitions" />
            </Tabs>

            {tab === 0 && (
                <>
                    <CredentialIndex items={shown} aria-label="Featured certificates" />

                    {!full && (
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="outlined"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate('/background')}
                            >
                                {`All ${totalCertificateCount} credentials and community work`}
                            </Button>
                        </Box>
                    )}

                    {full && otherCertificates.length > 0 && (
                        <>
                            <Box sx={{ mt: 3 }}>
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
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                        {`Coursework - ${otherCertificates.length} more`}
                                    </Typography>
                                    <CredentialIndex items={otherCertificates} aria-label="Coursework certificates" />
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
                            <Surface flush>
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
                            </Surface>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Section>
    );
};

export default AcademicAchievements;
