import { useCallback, useEffect, useRef, useState, forwardRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import YGOlogo from '../assets/images/ygo.png'
import './main-navbar.scss';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const MainNavbar = (props) => {
    const { parentCallback } = props;

    const [inputSearch, setInputSearch] = useState('');
    const [language, setLanguage] = useState('');
    const [openHelp, setOpenHelp] = useState(false);
    const [loading, setLoading] = useState(false);
    const activeRequest = useRef(null);
    const latestRequestId = useRef(0);
    const lastSubmittedSearch = useRef('');
    const isFirstLanguageRender = useRef(true);
    const languageRef = useRef('');

    const sendData = useCallback((data) => {
        parentCallback(data);
    }, [parentCallback]);

    const handleChange = (event) => {
        setInputSearch(event.target.value);
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !loading) {
            handleSearch();
        }
    }

    const handleOpenHelp = () => {
        setOpenHelp(true);
    };

    const handleCloseHelp = () => {
        setOpenHelp(false);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        languageRef.current = lang;
    };

    const onSearch = useCallback(async (searchValue) => {
        if (!searchValue) {
            sendData({ data: [], loading: false, error: '' });
            return;
        }

        const params = new URLSearchParams({
            fname: searchValue,
            misc: 'yes'
        });

        if (languageRef.current) {
            params.set('language', languageRef.current);
        }

        if (activeRequest.current) {
            activeRequest.current.abort();
        }

        const controller = new AbortController();
        const requestId = latestRequestId.current + 1;
        let timedOut = false;
        latestRequestId.current = requestId;
        activeRequest.current = controller;

        setLoading(true);
        sendData({ data: [], loading: true, error: '' });

        const timeoutId = window.setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 15000);

        try {
            const response = await fetch(
                `https://db.ygoprodeck.com/api/v7/cardinfo.php?${params.toString()}`,
                { signal: controller.signal }
            );
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message = data?.error || data?.message || response.statusText || 'API request failed';
                throw new Error(message);
            }

            // La API devuelve { data: [...] } o directamente un array
            const cardData = Array.isArray(data) ? data : (data?.data || []);

            if (requestId === latestRequestId.current) {
                sendData({ data: cardData, loading: false, error: '' });
            }
        } catch (error) {
            if (requestId === latestRequestId.current) {
                const message = timedOut
                    ? 'La API tardó demasiado en responder. Intenta de nuevo en unos segundos.'
                    : error.message || 'No se pudo completar la búsqueda.';

                console.error('Search error:', message);
                sendData({ data: [], loading: false, error: message });
            }
        } finally {
            window.clearTimeout(timeoutId);

            if (activeRequest.current === controller) {
                activeRequest.current = null;
            }

            if (requestId === latestRequestId.current) {
                setLoading(false);
            }
        }
    }, [sendData]);

    const handleSearch = useCallback(() => {
        const searchValue = inputSearch.trim();
        lastSubmittedSearch.current = searchValue;
        onSearch(searchValue);
    }, [inputSearch, onSearch]);

    useEffect(() => {
        if (isFirstLanguageRender.current) {
            isFirstLanguageRender.current = false;
            return;
        }

        if (lastSubmittedSearch.current) {
            onSearch(lastSubmittedSearch.current);
        }
    }, [language, onSearch]);

    useEffect(() => {
        return () => {
            if (activeRequest.current) {
                activeRequest.current.abort();
            }
        };
    }, []);

    return (
        <>
            <nav className="topbar" aria-label="Primary">
                <div className="brand">
                    <img src={YGOlogo} alt="Yu-Gi-Oh! Logo" />
                    <div className="brand-mark">
                        <span className="brand-title">YGO Project</span>
                        <span className="brand-subtitle">Card API Search</span>
                    </div>
                </div>

                <div className="searchbar" role="search">
                    <input 
                        value={inputSearch}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        aria-label="Search cards" 
                        placeholder="Search cards by name"
                    />
                    <select 
                        className="select" 
                        aria-label="Language" 
                        value={language} 
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        <option value="">🇬🇧 English</option>
                        <option value="fr">🇫🇷 French</option>
                        <option value="de">🇩🇪 German</option>
                        <option value="it">🇮🇹 Italian</option>
                    </select>
                    <button 
                        className="search-button" 
                        type="button" 
                        onClick={handleSearch} 
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                <button 
                    className="icon-button" 
                    type="button" 
                    onClick={handleOpenHelp} 
                    aria-label="Help" 
                    title="Help"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"></circle>
                        <path d="M9.7 9a2.5 2.5 0 1 1 4.4 1.6c-.9.8-1.7 1.3-1.7 2.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                        <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
                    </svg>
                </button>
            </nav>

            <Dialog
                fullWidth={true}
                maxWidth={'xs'}
                open={openHelp}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseHelp}
                scroll={'paper'}
                PaperProps={{
                    style: {
                        backgroundColor: 'var(--panel)',
                        boxShadow: 'none',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                    },
                }}
            >
                <DialogContent>
                    <h2 style={{ marginTop: 0, color: 'var(--text)' }}>Welcome to YGO Project</h2>
                    <p style={{ color: 'var(--muted)' }}>
                        A professional card search tool for Yu-Gi-Oh! players.
                    </p>
                    <p style={{ color: 'var(--muted)', fontWeight: 'bold' }}>
                        📝 Search examples:
                    </p>
                    <ul style={{ color: 'var(--muted)' }}>
                        <li>Dark Magician</li>
                        <li>Blue-Eyes</li>
                        <li>Exodia</li>
                        <li>Dragon</li>
                        <li>Warrior</li>
                    </ul>
                    <div style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        fontSize: '0.9rem',
                        color: 'var(--muted)',
                        borderTop: '1px solid var(--line)',
                        paddingTop: '1rem',
                    }}>
                        Made with ❤️ by Francis <br />
                        Modify with ❤️ by Khryztiam
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
