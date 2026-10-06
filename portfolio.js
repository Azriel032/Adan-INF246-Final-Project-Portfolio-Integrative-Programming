"use strict";

(() => {
    document.documentElement.classList.add("has-motion");
    const themeToggle = document.querySelector("#theme-toggle");
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("portfolio-theme");
    } catch {
        
    }

    if (savedTheme === "dark") document.body.dataset.theme = "dark";

    const updateThemeToggle = () => {
        if (!themeToggle) return;
        const isDark = document.body.dataset.theme === "dark";
        themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
        themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
        themeToggle.setAttribute("aria-pressed", String(isDark));
    };

    updateThemeToggle();
    themeToggle?.addEventListener("click", () => {
        const isDark = document.body.dataset.theme !== "dark";
        if (isDark) document.body.dataset.theme = "dark";
        else delete document.body.dataset.theme;

        try {
            localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
        } catch {
            
        }
        updateThemeToggle();
    });

    const pane = document.querySelector("#portfolio-scroll");
    const sections = [...document.querySelectorAll(".page-section")];
    const links = [...document.querySelectorAll(".nav-links a")];

    if (!pane || sections.length === 0 || links.length === 0) return;

    const linkBySection = new Map(
        links.map((link) => [link.getAttribute("href").slice(1), link])
    );

    // Keep the selected navigation item in sync with the section in view.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });

        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        links.forEach((link) => {
            const selected = link === linkBySection.get(visible.target.id);
            link.classList.toggle("active", selected);
            if (selected) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
    }, {
        root: pane,
        threshold: [0.25, 0.5, 0.75]
    });

    sections.forEach((section) => observer.observe(section));

    // Scroll inside the portfolio pane and update the address hash on navigation.
    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;

            event.preventDefault();
            const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
            target.scrollIntoView({ behavior, block: "start" });
            history.replaceState(null, "", `#${target.id}`);
        });
    });

    const initialTarget = location.hash && document.querySelector(location.hash);
    if (initialTarget && pane.contains(initialTarget)) {
        requestAnimationFrame(() => initialTarget.scrollIntoView({ block: "start" }));
    }

    // A small class keeps the contact form's validation and feedback together.
    class ContactFormValidator {
        #form;
        #status;

        constructor(form, status) {
            this.#form = form;
            this.#status = status;
            this.#form.addEventListener("submit", (event) => this.#handleSubmit(event));
            this.#form.addEventListener("input", (event) => {
                if (event.target.matches("input, textarea")) {
                    event.target.removeAttribute("aria-invalid");
                    this.#setStatus("", "");
                }
            });
        }

        #setStatus(message, state) {
            this.#status.textContent = message;
            this.#status.className = `form-status${state ? ` ${state}` : ""}`;
        }

        #handleSubmit(event) {
            event.preventDefault();
            const fields = [...this.#form.querySelectorAll("input, textarea")];
            const invalid = fields.filter((field) => {
                const blank = field.required && field.value.trim() === "";
                const tooShort = field.minLength > 0 && field.value.trim().length < field.minLength;
                return blank || tooShort || !field.validity.valid;
            });

            fields.forEach((field) => {
                field.toggleAttribute("aria-invalid", invalid.includes(field));
            });

            if (invalid.length) {
                const first = invalid[0];
                this.#setStatus(`Please check your ${first.labels[0]?.textContent.toLowerCase() || "details"}.`, "error");
                first.focus();
                return;
            }

            this.#setStatus("Your message passes validation.", "success");
        }
    }

    const form = document.querySelector("#contact-form");
    const status = document.querySelector("#form-status");
    if (form && status) new ContactFormValidator(form, status);
})();
