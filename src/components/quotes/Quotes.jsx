import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Fade from '@mui/material/Fade';

const defaultQuotes = [
    { text: "To learn something: Step1: Identify a topic, Step 2: Try to explain it to a 5-year old, Step 3: Study to fill in the knowledge gaps, Step 4: Organize, convey and review. True understanding is the ability to simplify, not complicate. Simple is beautiful.", author: "The Feynman Technique" },
    { text: "Humans tend to have an expectation that they will be justly rewarded and praised for all of their hardwork and sacrifice. The reality is that a lot of it goes unnoticed - it's thankless. The pursuit of external affirmation just breeds resentment.", author: "Heaven's Reward Fallacy" },
    { text: "You have to put in more effort to make something appear effortless. Effortless, elegant, performances are simply the result of a large volume of consistent, effortful, gritty practice. Small things become big things. Simple is not simple.", author: "The paradox of effort" },
    { text: "When choosing who to spend time with, prioritize spending more time with optimists. Pessimists see closed doors. Optimists see open doors - probably kick down closed doors along the way. Pessimists sound smart, optimists get rich.", author: "The Optimist Razor" },
    { text: "Humans tend to prefer avoiding losses vs achieving gains. The pain of losing something is more powerful than the pleasure of winning it. We typically do more to avoid losses than we will to seek gains. We systematically overvalue what we already have.", author: "Loss Aversion" },
    { text: "Money is NOT the only type of wealth. There are 5 types:\n- Financial (Money)\n- Social (Relationships)\n- Physical (Health)\n- Mental (Knowledge)\n- Time (Freedom). The pursuit of financial wealth can rob you of the others. Don't let that happen.", author: "The 5 types of wealth" },
    { text: "All or nothing thinking. Ignoring Complexity.", author: "Polarized Thinking" },
    { text: "Expecting the worst case scenario. Minimizing the positive.", author: "Catastrophizing" },
    { text: "Desire increases with price or exclusivity due to perceived status and prestige.", author: "The Veblen Effect" },
    { text: "Humans overestimate the degree to which other people are noticing or observing our appearance or actions. This keeps people from being themselves due to an irrational fear of judgement. It's liberating to realize that most people don't care about you.", author: "Spotlight Effect" },
];

const Quotes = () => {
    const [currentQuote, setCurrentQuote] = useState(0);
    const [quotes, setQuotes] = useState(defaultQuotes);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNextQuote = () => {
        setCurrentQuote((prevQuote) => (prevQuote + 1) % quotes.length);
    };

    // support ASCII double-hyphen authors, available to parseBlock and renderQuote
    const reAsciiDash = useMemo(() => /^[-]{2,}\s*(.+)$/, []); // support ASCII double hyphen authors like '-- Author'

    // Parse a block from the markdown file into a quote object
    const parseBlock = useCallback((block) => {
        const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
        const lastLine = lines.at(-1) || '';
        let author = '';
        let quoteText = block;
        const reDash = /^-\s*(.+)$/;
        const reAuthor = /^Author:\s*(.+)$/i;
        const reInlineAuthor = /\s[--]\s*(.+)$/;
        let authorMatch = reDash.exec(lastLine) || reAuthor.exec(lastLine) || reInlineAuthor.exec(lastLine) || reAsciiDash.exec(lastLine);
        if (authorMatch) {
            author = authorMatch[1].trim();
            quoteText = lines.slice(0, -1).join('\n');
        }
        return { text: quoteText.trim(), author: author || 'Unknown' };
    }, [reAsciiDash]);

    useEffect(() => {
        // try to fetch markdown file of quotes
        fetch('/markdowns/quotes.md')
            .then(res => res.text())
            .then(text => {
                const blocks = text.split(/\n---\n/).map(b => b.trim()).filter(Boolean);
                if (blocks.length === 0) return;
                const parsed = blocks.map(block => parseBlock(block));
                if (parsed.length) setQuotes(parsed);
            })
            .catch(err => {
                // ignore, use default quotes
                console.warn('Unable to load markdown quotes', err);
            });
    }, [parseBlock]);

    const renderQuote = (text) => {
        if (!text) return null;
        // Split into steps first (Step1: Step 2) so it has priority over paragraph fallback
        const stepIndex = text.search(/Step\s*\d+/i);
        if (stepIndex !== -1) {
            const intro = text.slice(0, stepIndex).trim();
            const stepsString = text.slice(stepIndex);
            const stepRegexAll = /Step\s*\d+\s*[:\s-]*/gi;
            const labels = stepsString.match(stepRegexAll) || [];
            const parts = stepsString.split(stepRegexAll).map(s => s.trim()).filter(Boolean);
            const steps = parts.slice(0).map((s, i) => ({ label: labels[i] ? labels[i].trim() : `Step ${i + 1}`, content: s }));
            return (
                <Box>
                    {intro && <Typography variant="body1" sx={{ color: textColor, mb: 1 }}>{intro}</Typography>}
                    <Box component="ol" sx={{ pl: 3, m: 0 }}>
                        {steps.map((s, i) => (
                            <Box component="li" key={`quote-${currentQuote}-step-${i}-${s.label}`} sx={{ mb: 0.5 }}>
                                <Typography variant="body1" sx={{ color: textColor }}>{s.content}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            );
        }

        // Process text into lines for analysis
        const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        // Detect standard bullet lines that start with - or * or • but exclude double-hyphen author lines like '-- Author'
        const isBulletLine = (l) => (/^[*-•]\s+/.test(l));
        const bulletLines = rawLines.filter(l => isBulletLine(l) && !reAsciiDash.test(l));
        // If we have bullet style lines, render as UL
        if (bulletLines.length > 0 && bulletLines.length === rawLines.length) {
            const items = rawLines.map(l => l.replace(/^[*-•]\s+/, '').trim()).filter(Boolean);
            if (items.length > 0) {
                return (
                    <Box component="ul" sx={{ pl: 3, m: 0 }}>
                        {items.map((it, i) => (
                            <Box component="li" key={`quote-${currentQuote}-item-${i}-${it.substring(0, 48)}`} sx={{ mb: 0.5 }}>
                                <Typography variant="body1" sx={{ color: textColor }}>{it}</Typography>
                            </Box>
                        ))}
                    </Box>
                );
            }
        }

        // If there are multiple lines but they are not bullets, treat as paragraphs
        if (rawLines.length > 1) {
            return (
                <Box>
                    {rawLines.map((line, i) => (
                        <Typography key={`quote-${currentQuote}-para-${i}`} variant="body1" sx={{ color: textColor, mb: 1 }}>
                            {line}
                        </Typography>
                    ))}
                </Box>
            );
        }

        // Step-based parsing handled earlier

        // Fallback: render plain text with pre-line handling
        return (
            <Typography 
                variant="body1" 
                sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    fontSize: '1.35rem',
                    fontFamily: 'Merriweather, serif',
                    color: textColor,
                    mb: 2,
                    transition: '0.3s ease-in-out'
                }}
            >
                {text}
            </Typography>
        );
    };

    const bg = theme.palette.mode === 'light' ? theme.palette.background.paper : alpha(theme.palette.background.paper, 0.8);
    const titleColor = theme.palette.primary.main;
    const textColor = theme.palette.text.primary;
    const captionColor = theme.palette.text.secondary;
    const listItemSelectedBg = theme.palette.action.selected;
    const listItemHoverBg = alpha(theme.palette.primary.main, 0.08);

    return (
        <Card 
            sx={{ 
                margin: 'auto', 
                mt: 6, 
                padding: '2rem', 
                marginBottom: '5rem', 
                background: bg,
                borderRadius: '6px',
            }}
        >
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', color: titleColor }}>
                            Inspiring Quotes
                        </Typography>
                        <Fade in>
                            {renderQuote(quotes[currentQuote].text)}
                        </Fade>
                        <Typography 
                            variant="caption" 
                            display="block" 
                            gutterBottom 
                            sx={{ 
                                color: captionColor, 
                                fontStyle: 'italic' 
                            }}
                        >
                            - {quotes[currentQuote].author}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {isMobile ? (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <WorkspacePremiumIcon
                                    onClick={handleNextQuote}
                                    sx={{
                                        cursor: 'pointer',
                                        fontSize: '3rem',
                                        color: theme.palette.mode === 'light' ? '#ff4081' : '#f48fb1',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'rotate(20deg)',
                                        }
                                    }}
                                />
                            </Box>
                        ) : (
                                <List>
                                {quotes.map((quote, index) => {
                                    const selected = index === currentQuote;
                                    return (
                                    <ListItem
                                        key={`quote-${index}-${(quote.author || 'unknown').substring(0, 32)}`}
                                        onClick={() => setCurrentQuote(index)}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: selected ? listItemSelectedBg : 'transparent',
                                            '&:hover': {
                                                backgroundColor: listItemHoverBg,
                                            },
                                            transition: 'background-color 0.3s ease-in-out',
                                            borderRadius: '6px',
                                        }}
                                    >
                                        <ListItemText
                                            primary={quote.author}
                                            primaryTypographyProps={{
                                                fontFamily: 'Roboto, sans-serif',
                                                color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
                                                fontWeight: selected ? 'bold' : 'normal',
                                            }}
                                        />
                                    </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </Grid>
                </Grid>
                {!isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <WorkspacePremiumIcon
                            onClick={handleNextQuote}
                            sx={{
                                cursor: 'pointer',
                                fontSize: '3rem',
                                color: theme.palette.mode === 'light' ? '#ff4081' : '#f48fb1',
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'rotate(20deg)',
                                }
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default Quotes;
