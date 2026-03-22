document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_USERNAME = 'NottRezz';
    const GITHUB_API_BASE = `https://api.github.com/users/${GITHUB_USERNAME}`;

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const themeToggle = document.querySelector('.theme-toggle');
    const githubSummary = document.querySelector('#github-summary');
    const githubRepos = document.querySelector('#github-repos');
    const githubCommitGrid = document.querySelector('#github-commit-grid');
    const githubCommitSummary = document.querySelector('#github-commit-summary');

    // Theme Toggle
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    themeToggle.addEventListener('click', (e) => {
        const willBeLight = !document.body.classList.contains('light-mode');
        const overlayColor = willBeLight ? '#faf3eb' : '#1a120d';

        // Get toggle button position for the reveal origin
        const rect = themeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Calculate the circle size needed to cover the whole screen
        const maxDist = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );
        const diameter = maxDist * 2;

        // Create circular overlay
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        overlay.style.background = overlayColor;
        overlay.style.width = diameter + 'px';
        overlay.style.height = diameter + 'px';
        overlay.style.left = (x - diameter / 2) + 'px';
        overlay.style.top = (y - diameter / 2) + 'px';
        document.body.appendChild(overlay);

        // Start expanding
        requestAnimationFrame(() => {
            overlay.classList.add('expanding');
        });

        // Switch theme once the circle covers the screen
        setTimeout(() => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        }, 500);

        // Remove overlay after animation finishes
        overlay.addEventListener('animationend', () => overlay.remove());
    });

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const navLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (navLink) {
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.style.color = '';
                    });
                    navLink.style.color = 'var(--primary)';
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.05}s`;
    });

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const registerScrollAnimations = (elements) => {
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            animateOnScroll.observe(el);
        });
    };

    registerScrollAnimations(document.querySelectorAll('.project-card, .skill-category, .stat'));

    const formatDate = (isoDate) => {
        if (!isoDate) {
            return 'Unknown';
        }
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(isoDate));
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value || 0);
    };

    const escapeHtml = (value = '') => {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const renderGitHubSummary = (profile) => {
        githubSummary.innerHTML = `
            <article class="github-summary-card">
                <h3>${formatNumber(profile.public_repos)}</h3>
                <span class="github-metric-label">Public Repositories</span>
            </article>
            <article class="github-summary-card">
                <h3>${formatDate(profile.updated_at)}</h3>
                <span class="github-metric-label">Last Profile Update</span>
            </article>
        `;
    };

    const languageIcons = {
        'lua': 'lua/lua-original',
        'java': 'java/java-original',
        'python': 'python/python-original',
        'javascript': 'javascript/javascript-original',
        'typescript': 'typescript/typescript-original',
        'c#': 'csharp/csharp-original',
        'c++': 'cplusplus/cplusplus-original',
        'c': 'c/c-original',
        'html': 'html5/html5-original',
        'css': 'css3/css3-original',
        'go': 'go/go-original',
        'rust': 'rust/rust-original',
        'ruby': 'ruby/ruby-original',
        'php': 'php/php-original',
        'swift': 'swift/swift-original',
        'kotlin': 'kotlin/kotlin-original',
    };

    const getLanguageIcon = (language) => {
        if (!language) return '';
        const key = language.toLowerCase();
        const icon = languageIcons[key];
        if (icon) {
            return `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon}.svg" alt="" class="meta-icon">`;
        }
        return '<svg class="meta-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>';
    };

    const starIcon = '<svg class="meta-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    const clockIcon = '<svg class="meta-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';

    const renderGitHubRepos = (repos) => {
        if (!repos.length) {
            githubRepos.innerHTML = '<p class="github-loading">No public repositories to show right now.</p>';
            return;
        }

        githubRepos.innerHTML = repos.map(repo => `
            <article class="github-repo-card">
                <h3>${escapeHtml(repo.name)}</h3>
                <p class="github-repo-description">${escapeHtml(repo.description || 'No description provided yet.')}</p>
                <div class="github-repo-meta">
                    <span class="github-repo-language">${getLanguageIcon(repo.language)}${escapeHtml(repo.language || 'Mixed')}</span>
                    <span class="github-repo-stars">${starIcon}${formatNumber(repo.stargazers_count)} stars</span>
                    <span class="github-repo-updated">${clockIcon}Updated ${formatDate(repo.updated_at)}</span>
                </div>
                <a class="github-repo-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">View Repository</a>
            </article>
        `).join('');
    };

    const formatIsoDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchContributionsFromGitHub = async () => {
        const response = await fetch(
            `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub contributions');
        }

        const data = await response.json();
        const dailyLevels = {};
        let totalCount = 0;

        if (Array.isArray(data.contributions)) {
            data.contributions.forEach(entry => {
                if (entry.date) {
                    dailyLevels[entry.date] = entry.level || 0;
                    totalCount += entry.count || 0;
                }
            });
        }

        return { dailyLevels, totalCount };
    };

    const renderContributionChart = (dailyLevels, totalCount) => {
        if (!githubCommitGrid || !githubCommitSummary) {
            return;
        }

        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        githubCommitGrid.innerHTML = '';

        const dates = Object.keys(dailyLevels).sort();
        if (!dates.length) {
            githubCommitSummary.textContent = 'No contributions in the last year';
            return;
        }

        // Build monthly buckets
        const monthlyData = {};
        dates.forEach(date => {
            const monthKey = date.slice(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { count: 0, activeDays: 0, totalDays: 0, maxLevel: 0 };
            }
            const level = dailyLevels[date] || 0;
            monthlyData[monthKey].totalDays++;
            if (level > 0) {
                monthlyData[monthKey].activeDays++;
                monthlyData[monthKey].count++;
            }
            if (level > monthlyData[monthKey].maxLevel) {
                monthlyData[monthKey].maxLevel = level;
            }
        });

        const sortedMonths = Object.keys(monthlyData).sort();

        // Month cards grid
        const grid = document.createElement('div');
        grid.className = 'contrib-months-grid';

        sortedMonths.forEach((monthKey, idx) => {
            const data = monthlyData[monthKey];
            const [year, month] = monthKey.split('-');
            const monthName = MONTH_NAMES[parseInt(month, 10) - 1];
            const isActive = data.activeDays > 0;

            const card = document.createElement('div');
            card.className = `contrib-month-card${isActive ? ' active' : ''}`;
            card.style.animationDelay = `${idx * 0.04}s`;

            // Activity ring — a circular progress indicator
            const ringSize = 44;
            const strokeWidth = 3;
            const radius = (ringSize - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            const progress = data.totalDays > 0 ? data.activeDays / data.totalDays : 0;
            const dashOffset = circumference * (1 - progress);

            const intensityClass = `intensity-${data.maxLevel}`;

            card.innerHTML = `
                <div class="contrib-month-ring ${intensityClass}">
                    <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
                        <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${radius}"
                            fill="none" stroke="var(--ring-bg)" stroke-width="${strokeWidth}" />
                        <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${radius}"
                            fill="none" stroke="var(--ring-color)" stroke-width="${strokeWidth}"
                            stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
                            stroke-linecap="round"
                            transform="rotate(-90 ${ringSize / 2} ${ringSize / 2})"
                            class="contrib-ring-progress" />
                    </svg>
                    <span class="contrib-month-count">${data.activeDays}</span>
                </div>
                <span class="contrib-month-name">${monthName}</span>
                <span class="contrib-month-year">${year}</span>
            `;

            // Hover detail
            const detail = document.createElement('div');
            detail.className = 'contrib-month-detail';
            detail.innerHTML = `<strong>${monthName} ${year}</strong><br>${data.activeDays} active day${data.activeDays !== 1 ? 's' : ''} of ${data.totalDays}`;
            card.appendChild(detail);

            grid.appendChild(card);
        });

        githubCommitGrid.appendChild(grid);

        githubCommitSummary.textContent = totalCount === 0
            ? 'No contributions in the last year'
            : `${totalCount} contributions in the last year`;
    };

    const loadGitHubActivity = async () => {
        if (!githubSummary || !githubRepos) {
            return;
        }

        try {
            const [profileResponse, reposResponse, contributionData] = await Promise.all([
                fetch(GITHUB_API_BASE, { headers: { 'Accept': 'application/vnd.github+json' } }),
                fetch(`${GITHUB_API_BASE}/repos?per_page=100&sort=updated`, { headers: { 'Accept': 'application/vnd.github+json' } }),
                fetchContributionsFromGitHub()
            ]);

            if (!profileResponse.ok || !reposResponse.ok) {
                throw new Error('GitHub API request failed');
            }

            const profile = await profileResponse.json();
            const allRepos = await reposResponse.json();

            const featuredRepos = allRepos
                .filter(repo => !repo.fork && repo.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase())
                .sort((a, b) => {
                    if (b.stargazers_count !== a.stargazers_count) {
                        return b.stargazers_count - a.stargazers_count;
                    }
                    return new Date(b.updated_at) - new Date(a.updated_at);
                })
                .slice(0, 6);

            renderGitHubSummary(profile);
            renderGitHubRepos(featuredRepos);
            renderContributionChart(contributionData.dailyLevels, contributionData.totalCount);
            registerScrollAnimations(document.querySelectorAll('.github-summary-card, .github-repo-card, .github-commit-history'));
        } catch (error) {
            githubSummary.innerHTML = '<p class="github-error">GitHub data is unavailable right now. Please try again in a little while.</p>';
            githubRepos.innerHTML = '<p class="github-error">Unable to load repositories from GitHub at the moment.</p>';
            if (githubCommitGrid) {
                githubCommitGrid.innerHTML = '<p class="github-error">Unable to load commit activity right now.</p>';
            }
            if (githubCommitSummary) {
                githubCommitSummary.textContent = 'Commit history is currently unavailable.';
            }
            console.error(error);
        }
    };

    loadGitHubActivity();

    setTimeout(() => {
        document.querySelectorAll('.project-card, .skill-category, .stat, .github-summary-card, .github-repo-card, .github-commit-history').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }, 100);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
});
