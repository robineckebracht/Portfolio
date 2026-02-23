const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".nav-links a");
const isActivationKey = (event) => event.key === "Enter" || event.key === " ";

const observer = new IntersectionObserver(
	(entries, currentObserver) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
				currentObserver.unobserve(entry.target);
			}
		});
	},
	{ threshold: 0.2 }
);

revealItems.forEach((item) => observer.observe(item));

const setActiveLink = () => {
	let activeId = "";
	revealItems.forEach((section) => {
		const top = section.getBoundingClientRect().top;
		if (top <= 120) {
			activeId = section.id;
		}
	});
	navLinks.forEach((link) => {
		link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
	});
};

document.addEventListener("scroll", setActiveLink);
setActiveLink();

const focusToggle = document.querySelector(".focus-toggle");
if (focusToggle) {
	const focusText = focusToggle.querySelector(".focus-text");
	if (focusText) {
		const originalText = focusText.textContent.trim();
		const altText = focusText.dataset.alt || "";
		let showingAlt = false;
		let isAnimating = false;

		const toggleFocusText = () => {
			if (!altText) {
				return;
			}
			if (isAnimating) {
				return;
			}
			isAnimating = true;
			focusText.classList.add("slide-out");
			window.setTimeout(() => {
				showingAlt = !showingAlt;
				focusText.textContent = showingAlt ? altText : originalText;
				focusText.classList.remove("slide-out");
				focusText.classList.add("slide-in");
				window.requestAnimationFrame(() => {
					focusText.classList.remove("slide-in");
				});
				window.setTimeout(() => {
					isAnimating = false;
				}, 260);
			}, 200);
		};

		focusToggle.addEventListener("click", toggleFocusText);
		focusToggle.addEventListener("keydown", (event) => {
			if (isActivationKey(event)) {
				event.preventDefault();
				toggleFocusText();
			}
		});
	}
}

const aboutCards = document.querySelectorAll(".about-card");
if (aboutCards.length > 0) {
	const unlockAll = () => {
		aboutCards.forEach((card) => {
			card.classList.remove("is-locked");
			card.setAttribute("aria-expanded", "false");
		});
	};

	const toggleLock = (card) => {
		const isLocked = card.classList.contains("is-locked");
		unlockAll();
		if (!isLocked) {
			card.classList.add("is-locked");
			card.setAttribute("aria-expanded", "true");
		}
	};

	aboutCards.forEach((card) => {
		card.addEventListener("click", () => toggleLock(card));
		card.addEventListener("keydown", (event) => {
			if (isActivationKey(event)) {
				event.preventDefault();
				toggleLock(card);
			}
		});
	});
}

const emailCopyButton = document.querySelector(".email-copy");
if (emailCopyButton) {
	const hint = emailCopyButton.querySelector(".email-hint");
	const defaultHint = hint ? hint.textContent : "Copy";

	const showCopied = () => {
		if (!hint) {
			return;
		}
		hint.textContent = "Copied";
		emailCopyButton.classList.add("copied");
		window.setTimeout(() => {
			hint.textContent = defaultHint;
			emailCopyButton.classList.remove("copied");
		}, 1500);
	};

	const fallbackCopy = (text) => {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "absolute";
		textarea.style.left = "-9999px";
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand("copy");
		textarea.remove();
	};

	emailCopyButton.addEventListener("click", async () => {
		const email = emailCopyButton.dataset.email || "";
		if (!email) {
			return;
		}
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(email);
			} else {
				fallbackCopy(email);
			}
			showCopied();
		} catch (error) {
			fallbackCopy(email);
			showCopied();
		}
	});
}

const logoTrigger = document.querySelector("#logo-trigger");
if (logoTrigger) {
	const burstLayer = document.createElement("div");
	burstLayer.className = "bit-burst";
	document.body.appendChild(burstLayer);

	const spawnBits = (event) => {
		const rect = logoTrigger.getBoundingClientRect();
		const originX = rect.left + rect.width / 2;
		const originY = rect.top + rect.height / 2;
		const count = 140;
		const gravity = 0.18;
		const drag = 0.985;
		const lifetime = 1100;
		const bits = [];
		const startTime = performance.now();

		for (let i = 0; i < count; i += 1) {
			const bit = document.createElement("span");
			bit.className = "bit";
			bit.textContent = Math.random() > 0.5 ? "1" : "0";
			burstLayer.appendChild(bit);

			const angle = Math.random() * Math.PI * 2;
			const speed = 2.6 + Math.random() * 3.2;
			const vx = Math.cos(angle) * speed;
			const vy = Math.sin(angle) * speed;
			const spin = (Math.random() - 0.5) * 8;

			bits.push({
				el: bit,
				x: originX,
				y: originY,
				vx,
				vy,
				rotation: (Math.random() - 0.5) * 40,
				spin,
			});
		}

		const animateBits = (now) => {
			const elapsed = now - startTime;
			const fadeStart = lifetime * 0.8;
			let fade = 1;
			if (elapsed > fadeStart) {
				fade = Math.max(0, 1 - (elapsed - fadeStart) / (lifetime - fadeStart));
			}
			bits.forEach((bit) => {
				bit.vy += gravity;
				bit.vx *= drag;
				bit.vy *= drag;
				bit.x += bit.vx * 6;
				bit.y += bit.vy * 6;
				bit.rotation += bit.spin;
				bit.el.style.left = `${bit.x}px`;
				bit.el.style.top = `${bit.y}px`;
				bit.el.style.opacity = fade.toFixed(2);
				bit.el.style.transform = `translate(-50%, -50%) rotate(${bit.rotation}deg)`;
			});

			if (elapsed < lifetime) {
				window.requestAnimationFrame(animateBits);
			} else {
				bits.forEach((bit) => bit.el.remove());
			}
		};

		window.requestAnimationFrame(animateBits);
	};

	logoTrigger.addEventListener("click", spawnBits);
}

const username = "robineckebracht";
const projectsContainer = document.getElementById("github-projects");

if (projectsContainer) {
	const createProjectCard = (repo) => {
		const card = document.createElement("article");
		card.className = "card project-slide";

		card.innerHTML = `
			<h3>${repo.name}</h3>
			<p>${repo.description || "No description provided."}</p>
			<div class="pill-row">
				<span class="pill">${repo.language || "Code"}</span>
				<span class="pill">★ ${repo.stargazers_count}</span>
			</div>
			<a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="button ghost">
				View on GitHub
			</a>
		`;

		return card;
	};

	const renderProjectsCarousel = (repos) => {
		if (repos.length === 0) {
			projectsContainer.innerHTML = "<p>No public projects found right now.</p>";
			return;
		}

		projectsContainer.innerHTML = "";
		projectsContainer.classList.add("project-carousel");

		const previousButton = document.createElement("button");
		previousButton.type = "button";
		previousButton.className = "project-nav project-nav-prev";
		previousButton.setAttribute("aria-label", "Previous project");
		previousButton.textContent = "←";

		const nextButton = document.createElement("button");
		nextButton.type = "button";
		nextButton.className = "project-nav project-nav-next";
		nextButton.setAttribute("aria-label", "Next project");
		nextButton.textContent = "→";

		const viewport = document.createElement("div");
		viewport.className = "project-viewport";
		viewport.tabIndex = 0;
		viewport.setAttribute("aria-label", "Project showcase carousel");

		const track = document.createElement("div");
		track.className = "project-track";

		repos.forEach((repo) => {
			track.appendChild(createProjectCard(repo));
		});

		viewport.appendChild(track);
		projectsContainer.append(previousButton, viewport, nextButton);

		let currentIndex = 0;
		const visibleCards = 2;
		const maxIndex = Math.max(0, repos.length - visibleCards);

		const updateCarousel = () => {
			const firstSlide = track.querySelector(".project-slide");
			const gapValue = window.getComputedStyle(track).columnGap || "0";
			const parsedGap = Number.parseFloat(gapValue);
			const gap = Number.isNaN(parsedGap) ? 0 : parsedGap;
			const slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width : 0;
			const offset = currentIndex * (slideWidth + gap);
			track.style.transform = `translateX(-${offset}px)`;
			previousButton.disabled = currentIndex === 0;
			nextButton.disabled = currentIndex === maxIndex;
		};

		const goPrevious = () => {
			if (currentIndex > 0) {
				currentIndex -= 1;
				updateCarousel();
			}
		};

		const goNext = () => {
			if (currentIndex < maxIndex) {
				currentIndex += 1;
				updateCarousel();
			}
		};

		previousButton.addEventListener("click", goPrevious);
		nextButton.addEventListener("click", goNext);

		viewport.addEventListener("keydown", (event) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				goPrevious();
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				goNext();
			}
		});

		window.addEventListener("resize", updateCarousel);

		updateCarousel();
	};

	fetch(`https://api.github.com/users/${username}/repos?sort=updated`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Failed to load projects");
			}
			return response.json();
		})
		.then((repos) => {
			const projectRepos = repos.filter((repo) => !repo.fork).slice(0, 10);
			renderProjectsCarousel(projectRepos);
		})
		.catch(() => {
			projectsContainer.innerHTML = "<p>Unable to load projects right now.</p>";
		});
}
