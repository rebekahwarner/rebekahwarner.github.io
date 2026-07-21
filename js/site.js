/* ============================================================
   Site data: the single source of truth for links and projects.

   The easy way to edit this: open editor.html in your browser.
   It gives you a form with live preview, then downloads a fresh
   copy of this file (and the project's standalone page) for you
   to drop into place.

   Hand-editing works too:
   - SITE: paste your GitHub/LinkedIn URLs. Links stay hidden on
     the page until a URL is filled in.
   - PROJECTS: add an object (copy the shape below) and create
     projects/<slug>.html from projects/_template.html.
   - Text fields support **bold** and `code` marks.
   ============================================================ */

const SITE = {
  email: "rebekahrwarner@protonmail.com",
  github: "https://github.com/rebekahwarner",
  linkedin: "https://www.linkedin.com/in/rebekah-warner-aa492b256/",
  resume: "assets/Rebekah-Warner-Resume.pdf",  // her exact résumé file, unmodified
};

const PROJECTS = [
  {
    slug: "schema-drift-monitor",
    title: "Schema-Drift Monitor & Environment Automation",
    oneLiner:
      "My current work at Guidehouse: an automated monitor that catches database schema drift before it breaks analytics, plus batch automation that cut environment setup from about three days to fifteen minutes.",
    metric: { value: "15 min", label: "env setup, down from 3 days" },
    tags: ["SQL", "Python", "JSON", "Excel"],
    wash: "wash-teal",
    // Guidehouse client work: the code stays with the client, on purpose.
    repo: null,
    repoNote: "Client work, so the code stays with Guidehouse. The design is the shareable part.",
    caseStudy: {
      problem: [
        "Government analytics programs live and die by their databases, and schemas do not sit still: upstream changes land without warning and break analyses downstream, usually discovered only after something fails. Onboarding had the same manual-work problem: standing up one analyst's environment took about three days by hand.",
        "It's a locked-down environment, so everything had to be built inside the fence with tools already approved.",
      ],
      approach: [
        "For the drift: snapshot every schema into a JSON baseline, diff the live databases against it on a schedule, and deliver changes as Excel reports, the format the team actually reads. Reactive firefighting became proactive detection.",
        "For the onboarding: batch automation that builds a complete analyst environment end to end, plus a test suite that proves each one works before handoff.",
        "Client code stays with the client, so this one has no public repo or snippet. The design is the shareable part.",
      ],
      code: { afterParagraph: null, snippet: "" },
      tools: "SQL, Python, JSON baselines, Excel reporting, batch automation and test suites.",
      outcome: [
        "Schema changes now surface **before** they break an analysis instead of after, and a new analyst is productive the same morning instead of on day three. This is my current day-to-day at Guidehouse: less flashy than a model, more valuable to the mission.",
        "The other half of the job was translation: I turned the underlying data-quality analysis into an executive briefing and delivered it to the client myself. Technical work only counts when the people who fund it understand what it bought them.",
      ],
      image: null,
    },
  },
  {
    slug: "joshua-project-widget",
    title: "Joshua Project iOS Widgets",
    oneLiner:
      "The daily people-group widget I wanted didn't exist, so I built it: a native iOS app with eleven home-screen widget styles on the Joshua Project public API.",
    metric: { value: "11", label: "widget styles, one API" },
    tags: ["Swift", "SwiftUI", "WidgetKit", "REST API"],
    wash: "wash-sand",
    // TODO: publish this repo, then flip published to true and rerun `node build.js`.
    repo: { url: "https://github.com/rebekahwarner/joshua-project-widget", published: false },
    caseStudy: {
      problem: [
        "Joshua Project publishes a daily unreached people group with photos, maps, and prayer points, but there was no iOS home-screen widget for it, and I knew I'd never open an app for it every morning. A widget would meet me where I already look. So: build the thing I wished existed, on their public API.",
        "I'm a data scientist, not an iOS developer. This project was also a bet that agentic AI tooling has made \"outside your lane\" projects genuinely shippable. It has.",
      ],
      approach: [
        "I worked up to native in stages: first a JavaScript mock in Scriptable to nail the API calls and layout, then a third-party widget app, and when both hit their ceilings, a real SwiftUI app with a WidgetKit extension.",
        "The interesting problems were the constraints. Widgets get a ~30 MB memory budget, so photos are downsampled before decode. Full-size images rendered fine in the simulator and blanked on a real device. Portraits are auto-framed with Vision face detection (largest face wins). Maps come from a live MapKit snapshot with the group's coordinates pinned. And because the API's \"daily\" flip sometimes runs late, the timeline detects stale data and quietly retries until it changes:",
        "For QA I rendered every layout against real data (15 people groups × 11 widget styles) into a gallery PDF and reviewed the lot. Old data-science habit: never trust a happy path you haven't sampled against messy inputs.",
      ],
      code: {
        afterParagraph: 2,
        snippet:
          "// The API flips at midnight, sometimes late. If today's group matches\n// yesterday's, retry every 15 minutes until fresh data lands.\nlet isStale = !groupKey.isEmpty && groupKey == lastKey\n\nif isStale {\n    completion(Timeline(entries: [entry], policy: .after(now + 15 * 60)))\n} else {\n    completion(Timeline(entries: [entry, midnightEntry], policy: .after(nextMidnight)))\n}",
      },
      tools: "Swift, SwiftUI, WidgetKit, Vision, MapKit, Scriptable (JS prototype), REST/JSON, built pairing with agentic AI.",
      outcome: [
        "A native app and **eleven widget styles**, from small photo cards to a full large layout with map, stats, and prayer points, refreshing daily on my own home screen. Not data science, but the same job: take a public data source and put it where people will actually see it.",
      ],
      image: {
        file: "joshua-project-widgets.png",
        alt: "One people group, the Broq-Pa of India, shown across four widget styles: the large classic layout with photo, stats, badges, map, and prayer points; a medium context card; a small stats-and-prayer card; and a small photo-flush card",
        caption: "One people group, four widget styles: the large classic, the medium context card, the small stats and prayer card, and the small flush layout.",
      },
    },
  },
  {
    slug: "nlp-sentiment-classifier",
    title: "NLP Sentiment Text Classifier",
    oneLiner:
      "An end-to-end binary sentiment classifier for 10,000 labeled documents: NLTK preprocessing, TF-IDF features, and a linear SVM.",
    metric: { value: "87%", label: "validation accuracy" },
    tags: ["Python", "scikit-learn", "NLTK"],
    wash: "wash-teal",
    // TODO: publish this repo, then flip published to true and rerun `node build.js`.
    repo: { url: "https://github.com/rebekahwarner/nlp-sentiment-classifier", published: false },
    caseStudy: {
      problem: [
        "Given 10,000 labeled documents, build a classifier that can tell positive sentiment from negative, and then actually use it, generating predictions for a 5,000-document test set with no labels. End to end: raw text in, defensible predictions out.",
      ],
      approach: [
        "Text models live or die in preprocessing, so I started there. I built an NLTK pipeline for tokenization and stopword removal, and because running it serially over 10,000 documents was the slowest part of the whole project, I parallelized it with joblib. That one change made iteration cheap, which mattered more than any single modeling decision.",
        "For features I used TF-IDF over unigrams **and** bigrams; the bigrams catch the negations and short phrases (\"not good\", \"worked great\") that unigrams flatten out. On top of that, a linear-kernel SVM: a well-earned default for high-dimensional sparse text, and fast enough to retrain constantly.",
      ],
      code: {
        afterParagraph: 2,
        snippet:
          'pipeline = Pipeline([\n    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),\n    ("svm",   LinearSVC()),\n])\n\npipeline.fit(X_train, y_train)            # 8,000 documents\nval_acc = pipeline.score(X_val, y_val)    # 2,000 held out -> 0.87',
      },
      tools: "Python, scikit-learn, NLTK, joblib, pandas.",
      outcome: [
        "**87% validation accuracy** on a 2,000-document held-out set (80/20 split), and a full set of predictions delivered for the 5,000-document test set. Just as important: a pipeline where every step (cleaning, features, model) is reproducible from one script.",
        "For calibration: human labelers only agree with each other on sentiment about 85 to 90 percent of the time, so high 80s is honest, solid territory for a classical model. A transformer would buy a few more points at far higher compute, a tradeoff I would weigh openly today.",
      ],
      image: null,
    },
  },
  {
    slug: "linkedin-job-market",
    title: "LinkedIn IT Job-Market Analysis",
    oneLiner:
      "Eight messy LinkedIn datasets merged, cleaned, and normalized into one honest picture of the U.S. IT & Services job market.",
    metric: { value: "8", label: "datasets, one clean picture" },
    tags: ["Python", "pandas", "seaborn"],
    wash: "wash-sand",
    // TODO: publish this repo, then flip published to true and rerun `node build.js`.
    repo: { url: "https://github.com/rebekahwarner/linkedin-job-market", published: false },
    caseStudy: {
      problem: [
        "LinkedIn job data doesn't arrive as one tidy table. It arrived as eight separate datasets (postings, companies, salaries, skills, and more) with the postings file alone over 60 MB. Salaries were reported hourly, monthly, or yearly depending on the row, and missing values were everywhere. The goal: merge it all into something trustworthy and explore what the U.S. IT & Services job market actually looks like.",
      ],
      approach: [
        "First, the joins. Each dataset keyed differently, so I mapped the relationships between all eight tables before writing a single merge, the kind of unglamorous step that saves you from silently duplicated rows later. Then the cleaning: deciding, column by column, whether missing values should be filled, inferred, or honestly left out of an analysis.",
        "The salary data was the interesting mess. A \"$45\" salary and a \"$95,000\" salary can describe the same job, depending on the pay period. I normalized everything to a yearly basis so distributions were comparable:",
        "With a clean, unified table, I built exploratory visualizations with seaborn: salary distributions, posting volume, and how roles and compensation vary across the IT & Services sector.",
      ],
      code: {
        afterParagraph: 2,
        snippet:
          'PERIOD_TO_YEARLY = {"HOURLY": 2080, "WEEKLY": 52, "MONTHLY": 12, "YEARLY": 1}\n\nsalary = df["med_salary"].fillna(df[["min_salary", "max_salary"]].mean(axis=1))\ndf["yearly_salary"] = salary * df["pay_period"].map(PERIOD_TO_YEARLY)',
      },
      tools: "Python, pandas, seaborn, matplotlib, Jupyter.",
      outcome: [
        "Eight raw files became **one analysis-ready dataset** with comparable salaries, plus a set of exploratory visualizations of the U.S. IT & Services market. The bigger takeaway is the one I bring to every project since: most of the value was created before any chart was drawn.",
      ],
      image: null,
    },
  },
];
