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

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
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
                    <span class="github-repo-language">${escapeHtml(repo.language || 'Mixed')}</span>
                    <span class="github-repo-stars">${formatNumber(repo.stargazers_count)} stars</span>
                    <span class="github-repo-updated">Updated ${formatDate(repo.updated_at)}</span>
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

    const startOfWeekSunday = (date) => {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        result.setDate(result.getDate() - result.getDay());
        return result;
    };

    const intensityLevel = (count, maxCount) => {
        if (!count) {
            return 0;
        }
        if (maxCount <= 1) {
            return 4;
        }

        const ratio = count / maxCount;
        if (ratio < 0.25) {
            return 1;
        }
        if (ratio < 0.5) {
            return 2;
        }
        if (ratio < 0.75) {
            return 3;
        }
        return 4;
    };

    const sumCounts = (dailyCounts) => {
        return Object.values(dailyCounts).reduce((total, count) => total + count, 0);
    };

    const mergeDailyCounts = (baseCounts, nextCounts) => {
        const merged = { ...baseCounts };
        Object.entries(nextCounts).forEach(([day, count]) => {
            merged[day] = (merged[day] || 0) + count;
        });
        return merged;
    };

    const renderCommitHeatmap = (dailyCommitCounts, rangeDays = 365) => {
        if (!githubCommitGrid || !githubCommitSummary) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rangeStart = new Date(today);
        rangeStart.setDate(today.getDate() - (rangeDays - 1));

        const gridStart = startOfWeekSunday(rangeStart);
        const gridEnd = new Date(today);

        githubCommitGrid.innerHTML = '';

        let maxCount = 0;
        let totalCommits = 0;

        Object.values(dailyCommitCounts).forEach((count) => {
            totalCommits += count;
            if (count > maxCount) {
                maxCount = count;
            }
        });

        for (let day = new Date(gridStart); day <= gridEnd; day.setDate(day.getDate() + 1)) {
            const isoDate = formatIsoDate(day);
            const count = dailyCommitCounts[isoDate] || 0;
            const level = intensityLevel(count, maxCount);
            const cell = document.createElement('div');

            cell.className = `commit-cell level-${level}`;
            cell.title = `${count} commits on ${formatDate(day.toISOString())}`;
            githubCommitGrid.appendChild(cell);
        }

        if (totalCommits === 0) {
            githubCommitSummary.textContent = `No public commits found in the last ${rangeDays} days`;
            return;
        }

        githubCommitSummary.textContent = `${formatNumber(totalCommits)} commits in the last ${rangeDays} days`;
    };

    const fetchCommitCountsFromEvents = async (rangeStartDate) => {
        const dailyCounts = {};
        const rangeStartTimestamp = rangeStartDate.getTime();

        for (let page = 1; page <= 10; page++) {
            const eventsResponse = await fetch(`${GITHUB_API_BASE}/events/public?per_page=100&page=${page}`, {
                headers: { 'Accept': 'application/vnd.github+json' }
            });

            if (!eventsResponse.ok) {
                throw new Error('GitHub events request failed');
            }

            const events = await eventsResponse.json();
            if (!events.length) {
                break;
            }

            const oldestEventDate = events[events.length - 1]?.created_at;
            let hasOlderEvents = false;

            events.forEach((event) => {
                if (event.type !== 'PushEvent') {
                    return;
                }

                const createdAt = event.created_at ? new Date(event.created_at) : null;
                if (!createdAt) {
                    return;
                }

                if (createdAt.getTime() < rangeStartTimestamp) {
                    hasOlderEvents = true;
                    return;
                }

                const isoDay = event.created_at.slice(0, 10);
                if (!isoDay) {
                    return;
                }

                const commitCount = Math.max(event.payload?.size || 0, event.payload?.commits?.length || 0, 1);
                dailyCounts[isoDay] = (dailyCounts[isoDay] || 0) + commitCount;
            });

            if (oldestEventDate && new Date(oldestEventDate).getTime() < rangeStartTimestamp && hasOlderEvents) {
                break;
            }
        }

        return dailyCounts;
    };

    const fetchCommitCountsFromRepos = async (repos, rangeStartDate) => {
        const dailyCounts = {};
        const rangeStartIso = rangeStartDate.toISOString();
        const candidateRepos = repos
            .filter(repo => !repo.fork && repo.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase())
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
            .slice(0, 12);

        for (const repo of candidateRepos) {
            for (let page = 1; page <= 3; page++) {
                const commitsResponse = await fetch(
                    `https://api.github.com/repos/${repo.full_name}/commits?author=${GITHUB_USERNAME}&since=${encodeURIComponent(rangeStartIso)}&per_page=100&page=${page}`,
                    { headers: { 'Accept': 'application/vnd.github+json' } }
                );

                if (!commitsResponse.ok) {
                    break;
                }

                const commits = await commitsResponse.json();
                if (!Array.isArray(commits) || commits.length === 0) {
                    break;
                }

                commits.forEach((commit) => {
                    const commitDate = commit?.commit?.author?.date || commit?.commit?.committer?.date;
                    if (!commitDate) {
                        return;
                    }

                    const isoDay = commitDate.slice(0, 10);
                    dailyCounts[isoDay] = (dailyCounts[isoDay] || 0) + 1;
                });

                if (commits.length < 100) {
                    break;
                }
            }
        }

        return dailyCounts;
    };

    const loadGitHubActivity = async () => {
        if (!githubSummary || !githubRepos) {
            return;
        }

        try {
            const [profileResponse, reposResponse] = await Promise.all([
                fetch(GITHUB_API_BASE, { headers: { 'Accept': 'application/vnd.github+json' } }),
                fetch(`${GITHUB_API_BASE}/repos?per_page=100&sort=updated`, { headers: { 'Accept': 'application/vnd.github+json' } })
            ]);

            if (!profileResponse.ok || !reposResponse.ok) {
                throw new Error('GitHub API request failed');
            }

            const profile = await profileResponse.json();
            const allRepos = await reposResponse.json();
            const rangeDays = 365;
            const rangeStartDate = new Date();
            rangeStartDate.setHours(0, 0, 0, 0);
            rangeStartDate.setDate(rangeStartDate.getDate() - (rangeDays - 1));

            const eventCommitCounts = await fetchCommitCountsFromEvents(rangeStartDate);
            let dailyCommitCounts = { ...eventCommitCounts };

            // Events are limited; repo commit history helps fill in accurate activity when events are sparse.
            if (sumCounts(dailyCommitCounts) < 10) {
                const repoCommitCounts = await fetchCommitCountsFromRepos(allRepos, rangeStartDate);
                dailyCommitCounts = mergeDailyCounts(dailyCommitCounts, repoCommitCounts);
            }

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
            renderCommitHeatmap(dailyCommitCounts, rangeDays);
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
