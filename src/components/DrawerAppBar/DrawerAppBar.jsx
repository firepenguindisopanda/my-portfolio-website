import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import { usePostHog } from '@posthog/react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    useMediaQuery,
    Typography,
    Select,
    Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';
import { useAppTheme } from '../../App';
import { themeLabels, themeOrder } from '../../utilities/themeConfig';
import { profile, sections, portfolioPages } from '../../data/profile';
import useSectionSpy from '../../hooks/useSectionSpy';

// Capped against the viewport so the drawer still leaves a dismiss target on a
// 320px screen, where a flat 280px covers almost everything.
const drawerWidth = 'min(280px, 85vw)';

const ThemeSwatch = ({ swatch, mode }) => (
    <Box
        sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: swatch,
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
            flexShrink: 0,
        }}
    />
);

function DrawerAppBar(props) {
    const { window } = props;
    const { current, setTheme } = useAppTheme();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const posthog = usePostHog();
    const isCompact = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [portfolioAnchor, setPortfolioAnchor] = React.useState(null);

    const isHome = location.pathname === '/';
    // Section links only mean something on the page that has those sections.
    const activeSection = useSectionSpy(isHome ? sections.map((s) => s.id) : []);

    const handleDrawerToggle = () => setMobileOpen((open) => !open);

    /**
     * The reveal circle grows from the menu item that was chosen, so the
     * switch reads as an action with a source rather than a page-wide flash.
     * The rect is read synchronously - the item is gone by the time the
     * timeout fires - and the short delay lets the dropdown finish closing,
     * otherwise the view-transition snapshot catches it mid-dismiss.
     */
    const handleThemeChange = (event) => {
        const newTheme = event.target.value;
        posthog?.capture('theme_changed', { theme: newTheme, previous_theme: current });

        const el = event.currentTarget instanceof Element ? event.currentTarget : null;
        const rect = el?.getBoundingClientRect();
        const origin = rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : undefined;
        setTimeout(() => setTheme(newTheme, origin), 230);
    };

    /** Scrolls to a section, navigating home first if we are on another page. */
    const goToSection = (sectionId) => {
        posthog?.capture('section_navigated', { section: sectionId });
        setMobileOpen(false);

        if (!isHome) {
            navigate('/', { state: { scrollTo: sectionId } });
            return;
        }
        const element = document.getElementById(sectionId);
        if (!element) return;
        const top = element.getBoundingClientRect().top + globalThis.scrollY - 72;
        globalThis.scrollTo({ top, behavior: 'smooth' });
    };

    const handleNavigate = (path) => {
        setPortfolioAnchor(null);
        setMobileOpen(false);
        navigate(path);
    };

    const drawerContent = (
        <Box sx={{ width: '100%' }} role="presentation">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
                    {profile.name}
                </Typography>
                <IconButton onClick={handleDrawerToggle} aria-label="Close navigation" size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Divider />

            <List
                subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>This page</ListSubheader>}
            >
                {sections.map((section) => (
                    <ListItem key={section.id} disablePadding>
                        <ListItemButton
                            onClick={() => goToSection(section.id)}
                            selected={isHome && activeSection === section.id}
                        >
                            <ListItemText primary={section.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />
            <List
                subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>Deep dives</ListSubheader>}
            >
                {portfolioPages.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigate(item.path)}
                            selected={location.pathname === item.path}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    fullWidth
                    onClick={() => posthog?.capture('resume_downloaded')}
                >
                    View Resume
                </Button>
                <Select
                    value={current}
                    onChange={handleThemeChange}
                    size="small"
                    fullWidth
                    inputProps={{ 'aria-label': 'Colour theme' }}
                >
                    {themeOrder.map((key) => (
                        <MenuItem key={key} value={key}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ThemeSwatch swatch={themeLabels[key].swatch} mode={themeLabels[key].mode} />
                                {themeLabels[key].label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <>
            <AppBar
                component="nav"
                position="fixed"
                elevation={0}
                sx={{
                    // Translucent over a blur, so the page is felt scrolling
                    // underneath. The solid fallback colour stands in where
                    // backdrop-filter is unsupported.
                    bgcolor: alpha(theme.palette.background.default, 0.72),
                    '@supports not (backdrop-filter: blur(1px))': {
                        bgcolor: 'background.paper',
                    },
                    backdropFilter: 'saturate(1.5) blur(12px)',
                    WebkitBackdropFilter: 'saturate(1.5) blur(12px)',
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ gap: 1, minWidth: 0 }}>
                    {isCompact && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleDrawerToggle}
                            aria-label="Open navigation"
                            sx={{ mr: 0.5, flexShrink: 0 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Deliberately not an <h1>: the hero owns the page heading. */}
                    <Typography
                        variant="h5"
                        component="span"
                        onClick={() => navigate('/')}
                        sx={{
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            mr: 'auto',
                            fontSize: { xs: '1.05rem', md: '1.25rem' },
                            // nowrap + auto margin would otherwise push the
                            // Resume button off-screen rather than give ground.
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {profile.name}
                    </Typography>

                    {!isCompact && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {sections.map((section) => {
                                const isActive = isHome && activeSection === section.id;
                                return (
                                    <Button
                                        key={section.id}
                                        onClick={() => goToSection(section.id)}
                                        color="inherit"
                                        sx={{
                                            position: 'relative',
                                            fontWeight: isActive ? 700 : 500,
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
                                            // The active-section underline slides between links as
                                            // the reader scrolls: each button carries its own bar and
                                            // scales it in, which reads as one moving indicator.
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 10,
                                                right: 10,
                                                bottom: 4,
                                                height: 2,
                                                bgcolor: 'primary.main',
                                                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                                                transformOrigin: 'center',
                                                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                            },
                                        }}
                                    >
                                        {section.label}
                                    </Button>
                                );
                            })}

                            <Button
                                color="inherit"
                                endIcon={<ExpandMoreIcon />}
                                onClick={(e) => setPortfolioAnchor(e.currentTarget)}
                                aria-haspopup="true"
                                sx={{ fontWeight: 500, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                            >
                                Deep dives
                            </Button>
                            <Menu
                                anchorEl={portfolioAnchor}
                                open={Boolean(portfolioAnchor)}
                                onClose={() => setPortfolioAnchor(null)}
                            >
                                {portfolioPages.map((item) => (
                                    <MenuItem
                                        key={item.path}
                                        selected={location.pathname === item.path}
                                        onClick={() => handleNavigate(item.path)}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Menu>

                            <Tooltip title="Colour theme">
                                <Select
                                    value={current}
                                    onChange={handleThemeChange}
                                    size="small"
                                    variant="standard"
                                    disableUnderline
                                    renderValue={(key) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 0.5 }}>
                                            <PaletteIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <ThemeSwatch swatch={themeLabels[key].swatch} mode={themeLabels[key].mode} />
                                        </Box>
                                    )}
                                    inputProps={{ 'aria-label': 'Colour theme' }}
                                    sx={{ ml: 1, '& .MuiSelect-select': { py: 0.5 } }}
                                >
                                    {themeOrder.map((key) => (
                                        <MenuItem key={key} value={key}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ThemeSwatch swatch={themeLabels[key].swatch} mode={themeLabels[key].mode} />
                                                {themeLabels[key].label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Tooltip>

                            <Button
                                href={profile.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="contained"
                                onClick={() => posthog?.capture('resume_downloaded')}
                                sx={{ ml: 1.5 }}
                            >
                                Resume
                            </Button>
                        </Box>
                    )}

                    {isCompact && (
                        <Button
                            href={profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            size="small"
                            onClick={() => posthog?.capture('resume_downloaded')}
                            sx={{ flexShrink: 0 }}
                        >
                            Resume
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}

export default DrawerAppBar;
