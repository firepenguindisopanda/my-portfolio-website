import { useTheme } from '@mui/material/styles';

/**
 * The active mode's layout contract.
 *
 * This is the hook that makes `theme.id` unnecessary. A component that needs to
 * arrange itself differently per mode reads a named value from here and
 * switches on it:
 *
 *   const { projects } = useLayout();
 *   if (projects === 'table') return <ProjectTable items={items} />;
 *
 * rather than asking which theme is active and hand-writing four layouts, which
 * is the pattern AboutMe.jsx documents having already been removed once.
 *
 * Returns: { id, container, sectionSpacing, measure, gutter, surface, heading,
 * hero, range, projects, experience } - see buildLayout in utilities/themeConfig.
 */
const useLayout = () => useTheme().custom.layout;

export default useLayout;
