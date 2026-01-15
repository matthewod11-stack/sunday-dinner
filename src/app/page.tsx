export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <p className="mb-4 font-ui text-xs font-bold uppercase tracking-widest text-primary">
          Family Meal Planning
        </p>
        <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Sunday Dinner
        </h1>
        <p className="mx-auto max-w-2xl font-body text-lg leading-relaxed text-text-secondary">
          Plan and execute your family gatherings using cherished heirloom recipes. Upload your
          grandma&apos;s recipe cards, plan a 20-person feast, and cook with confidence.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="mb-16 grid gap-6 md:grid-cols-2">
        <a
          href="/recipes/new"
          className="group rounded-md border border-border bg-surface p-6 transition-all hover:border-neutral-300 hover:shadow-md"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-primary-light text-primary">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold text-text-primary group-hover:text-primary">
            Add a Recipe
          </h2>
          <p className="font-body text-text-tertiary">
            Upload a photo of a handwritten recipe card, paste a URL, or enter manually.
          </p>
        </a>

        <a
          href="/meals/new"
          className="group rounded-md border border-border bg-surface p-6 transition-all hover:border-neutral-300 hover:shadow-md"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-secondary-light text-secondary">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold text-text-primary group-hover:text-secondary">
            Plan a Meal
          </h2>
          <p className="font-body text-text-tertiary">
            Create a meal plan with scaled recipes, generate a timeline, and get your shopping list.
          </p>
        </a>
      </section>

      {/* Empty State */}
      <section className="rounded-md border border-dashed border-neutral-300 bg-surface-muted p-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-sm bg-accent-light text-accent">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold text-text-primary">
          Your Recipe Box is Empty
        </h3>
        <p className="mb-6 font-body text-text-tertiary">
          Start by adding your first family recipe. We&apos;ll help you digitize those precious
          handwritten cards.
        </p>
        <a
          href="/recipes/new"
          className="inline-flex items-center justify-center rounded-xs bg-primary px-6 py-3 font-ui text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
        >
          Add Your First Recipe
        </a>
      </section>
    </div>
  );
}
