# Portfolio Project Page Setup Guide

## Step 1: Install Markdown Renderer

```bash
npm install react-markdown remark-gfm react-syntax-highlighter
```

## Step 2: Project Data Structure

Create `src/data/projects.js`:

```javascript
export const projects = [
  {
    id: 'game-rentals-platform',
    title: 'Game Rentals Platform',
    shortDescription: 'Full-stack MERN application for peer-to-peer game rentals',
    category: 'Full Stack',
    technologies: ['MongoDB', 'Express', 'React', 'Next.js', 'Redis', 'TypeScript'],
    thumbnail: '/images/projects/game-rentals-thumb.png',
    featured: true,
    githubUrl: 'https://github.com/yourusername/game-rentals',
    liveUrl: 'https://game-rentals.vercel.app',
    markdown: '/markdowns/game-rentals.md', // Path to markdown file
  },
  // Add more projects...
];
```

## Step 3: Create Project Detail Page Component

Create `src/pages/ProjectDetail.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { projects } from '../data/projects';
import { Box, Container, Typography, Button, Chip, IconButton } from '@mui/material';
import { ArrowBack, GitHub, Launch } from '@mui/icons-material';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);

  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (project?.markdown) {
      fetch(project.markdown)
        .then(response => response.text())
        .then(text => {
          setMarkdownContent(text);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading markdown:', error);
          setLoading(false);
        });
    }
  }, [project]);

  if (!project) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Project not found</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ color: 'white', mb: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h2" gutterBottom>
            {project.title}
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            {project.shortDescription}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {project.technologies.map(tech => (
              <Chip 
                key={tech} 
                label={tech} 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {project.githubUrl && (
              <Button
                variant="contained"
                startIcon={<GitHub />}
                href={project.githubUrl}
                target="_blank"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              >
                View Code
              </Button>
            )}
            {project.liveUrl && (
              <Button
                variant="outlined"
                startIcon={<Launch />}
                href={project.liveUrl}
                target="_blank"
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Live Demo
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Markdown Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box 
            sx={{ 
              '& h1': { fontSize: '2.5rem', mt: 4, mb: 2, borderBottom: '2px solid', pb: 1 },
              '& h2': { fontSize: '2rem', mt: 4, mb: 2, borderBottom: '1px solid', pb: 1 },
              '& h3': { fontSize: '1.5rem', mt: 3, mb: 1.5 },
              '& p': { lineHeight: 1.8, mb: 2 },
              '& ul, & ol': { mb: 2, pl: 3 },
              '& li': { mb: 1 },
              '& code': { 
                bgcolor: 'grey.100', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                fontSize: '0.9em',
                fontFamily: 'monospace'
              },
              '& pre': { mb: 2 },
              '& blockquote': { 
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
                color: 'text.secondary'
              },
              '& hr': { my: 4 },
              '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: 2 }
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProjectDetail;
```

## Step 4: Update Router in App.js

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
```

## Step 5: Update Projects Section to Link to Detail Pages

In your projects section component:

```javascript
import { useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';

const ProjectsSection = () => {
  const navigate = useNavigate();

  return (
    <Box id="projects" sx={{ py: 8 }}>
      <Container>
        <Typography variant="h3" align="center" gutterBottom>
          Projects
        </Typography>
        
        <Grid container spacing={4}>
          {projects.map(project => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-8px)' }
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={project.thumbnail}
                  alt={project.title}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.shortDescription}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {project.technologies.slice(0, 3).map(tech => (
                      <Chip key={tech} label={tech} size="small" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  {project.githubUrl && (
                    <IconButton size="small" href={project.githubUrl} onClick={(e) => e.stopPropagation()}>
                      <GitHub />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
```

## Step 6: Add Markdown File to Public Folder

Place your markdown file in `public/markdowns/game-rentals.md` (copy the PORTFOLIO_WRITEUP.md content)

## Alternative: Simpler Approach Without Markdown

If you prefer not to use markdown, create a React component directly:

```javascript
// src/pages/GameRentalsProject.jsx
import React from 'react';
import { Container, Typography, Box, Chip, Button, Divider } from '@mui/material';
import { GitHub, Launch, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GameRentalsProject = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header section with tech stack */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container>
          <Button startIcon={<ArrowBack />} sx={{ color: 'white', mb: 2 }} onClick={() => navigate('/')}>
            Back
          </Button>
          <Typography variant="h2" gutterBottom>Game Rentals Platform</Typography>
          {/* ... rest of content */}
        </Container>
      </Box>
      
      {/* Content sections */}
      <Container sx={{ py: 6 }}>
        {/* Overview, Features, Tech Stack, etc. */}
      </Container>
    </Box>
  );
};
```
