import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, FreeMode, A11y } from 'swiper';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Pause, PlayArrow } from '@mui/icons-material';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import 'swiper/css/free-mode';
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
    TailwindCssIcon
} from '../SvgIcons';

// Install Swiper modules
// eslint-disable-next-line react-hooks/rules-of-hooks
SwiperCore.use([Autoplay, Navigation, FreeMode, A11y]);


const rowIcons = [
    { id: 1, icon: <CPlusPlus colour="#00599C" />, text: 'C++', category: 'Language' },
    { id: 2, icon: <Android colour="#3DDC84" />, text: 'Android', category: 'Mobile' },
    { id: 3, icon: <Javascript colour="#F7DF1E" />, text: 'JavaScript', category: 'Language' },
    { id: 4, icon: <Python colour="#3776AB" />, text: 'Python', category: 'Language' },
    { id: 5, icon: <Windows colour="#0078D4" />, text: 'Windows', category: 'OS' },
    { id: 6, icon: <Java colour="#ED8B00" />, text: 'Java', category: 'Language' },
    { id: 7, icon: <Jenkins colour="#D33833" />, text: 'Jenkins', category: 'DevOps' },
    { id: 8, icon: <SpringBoot colour="#6DB33F" />, text: 'Spring Boot', category: 'Framework' },
    { id: 9, icon: <Flask colour="#000000" />, text: 'Flask', category: 'Framework' },
    { id: 10, icon: <Heroku colour="#430098" />, text: 'Heroku', category: 'Cloud' },
    { id: 11, icon: <Angular colour="#DD0031" />, text: 'Angular', category: 'Framework' },
    { id: 12, icon: <MaterialUi colour="#007FFF" />, text: 'Material UI', category: 'UI Library' },
    { id: 13, icon: <Bootstrap colour="#7952B3" />, text: 'Bootstrap', category: 'UI Library' },
    { id: 14, icon: <ReactIcon colour="#61DAFB" />, text: 'React', category: 'Framework' },
    { id: 15, icon: <NodejsIcon colour="#339933" />, text: 'Node.js', category: 'Runtime' },
    { id: 16, icon: <PostgresqlIcon colour="#336791" />, text: 'PostgreSQL', category: 'Database' },
    { id: 17, icon: <FirebaseIcon colour="#FFCA28" />, text: 'Firebase', category: 'Cloud' },
    { id: 18, icon: <GitIcon colour="#F05032" />, text: 'Git', category: 'Version Control' },
    { id: 19, icon: <DockerIcon colour="#2496ED" />, text: 'Docker', category: 'DevOps' },
    { id: 20, icon: <NginxIcon colour="#009639" />, text: 'NGINX', category: 'Web Server' },
    { id: 21, icon: <AWSIcon colour="#FF9900" />, text: 'AWS', category: 'Cloud' },
    { id: 22, icon: <GCPIcon colour="#4285F4" />, text: 'Google Cloud', category: 'Cloud' },
    { id: 23, icon: <GithubIcon colour="#181717" />, text: 'GitHub', category: 'Version Control' },
    { id: 24, icon: <TailwindCssIcon colour="#06B6D4" />, text: 'Tailwind CSS', category: 'UI Library' },
];

const IconCarousel = () => {
    const [isPaused, setIsPaused] = useState(false);
    const swiperRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Responsive settings
    let iconSize = 60;
    let slidesPerView = 6;
    let spaceBetween = 40;
    if (isMobile) {
        iconSize = 40;
        slidesPerView = 2.5;
        spaceBetween = 20;
    } else if (isTablet) {
        iconSize = 50;
        slidesPerView = 4;
        spaceBetween = 30;
    }

    const handlePlayPause = () => {
        if (swiperRef.current?.autoplay) {
            if (isPaused) {
                swiperRef.current.autoplay.start();
            } else {
                swiperRef.current.autoplay.stop();
            }
            setIsPaused(!isPaused);
        }
    };

    return (
        <Box component="section" aria-label="Technology skills carousel"
            sx={{
                // Was a full-bleed solid teal panel, which read as a different
                // site from the rest of the page. Now a normal bordered surface.
                overflow: 'hidden',
                width: '100%',
                position: 'relative',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${theme.custom.radius.container}px`,
                padding: { xs: '1.5rem 1rem', sm: '2rem', md: '2.5rem 3rem' },
                marginTop: { xs: '2rem', md: '3rem' },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="h3"
                        component="h3"
                        sx={{ marginBottom: '0.25rem' }}
                    >
                        Tech Stack
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"

                    >
                        Technologies and tools I work with
                    </Typography>
                </Box>

                <Tooltip title={isPaused ? 'Resume animation' : 'Pause animation'}>
                    <IconButton
                        onClick={handlePlayPause}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                        }}
                        aria-label={isPaused ? 'Resume carousel' : 'Pause carousel'}
                    >
                        {isPaused ? <PlayArrow /> : <Pause />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    '& .swiper': {
                        paddingBottom: '20px',
                    },
                    '& .swiper-slide': {
                        display: 'flex',
                        justifyContent: 'center',
                        height: 'auto',
                    }
                }}
            >
                <Swiper
                    spaceBetween={spaceBetween}
                    slidesPerView={slidesPerView}
                    freeMode={true}
                    loop={true}
                    autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                    }}
                    speed={3000}
                    allowTouchMove={true}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onMouseEnter={() => {
                        if (swiperRef.current?.autoplay && !isPaused) {
                            swiperRef.current.autoplay.stop();
                        }
                    }}
                    onMouseLeave={() => {
                        if (swiperRef.current?.autoplay && !isPaused) {
                            swiperRef.current.autoplay.start();
                        }
                    }}
                >
                    {rowIcons.map((icon) => (
                        <SwiperSlide key={icon.id}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': { transform: 'translateY(-2px)' }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: iconSize,
                                        height: iconSize,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                                        borderRadius: `${theme.custom.radius.control}px`,
                                        marginBottom: '0.75rem',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'border-color 0.2s ease',
                                        '&:hover': { borderColor: theme.custom.card.hoverBorderColor }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: iconSize * 0.7,
                                            height: iconSize * 0.7,
                                            '& svg': {
                                                width: '100%',
                                                height: '100%',
                                            }
                                        }}
                                    >
                                        {icon.icon}
                                    </Box>
                                </Box>

                                {/* Technology Name */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                        marginBottom: '0.25rem',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {icon.text}
                                </Typography>

                                {/* Category Chip */}
                                    <Chip
                                    label={icon.category}
                                    size="small"
                                    sx={{
                                        fontSize: '0.65rem',
                                        height: '20px',
                                        bgcolor: 'transparent',
                                        color: 'text.secondary',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '& .MuiChip-label': {
                                            padding: '0 6px',
                                        }
                                    }}
                                />
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100%',
                    background: 'transparent',
                    pointerEvents: 'none',
                    zIndex: 3,
                }}
            />
        </Box>
    );
};

export default IconCarousel;