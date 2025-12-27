# Sunday Dinner Roadmap Feedback

**Date:** December 26, 2025
**Reviewer:** Gemini (Google)

---

## 1. Structure & Detail Assessment

*   **Where is the roadmap too vague to be actionable?**
    *   **"Recalculate remaining steps"**: This is a non-trivial algorithmic problem (Critical Path Method). Does it just shift time, or does it compress steps? Does it suggest changing cooking temperatures? The logic here needs a technical spec of its own.
    *   **"Smart scaling... with chemistry warnings"**: This implies a deep database of chemical interactions (e.g., baking soda doesn't scale linearly like salt). Unless you have a specific API in mind, this is a massive research project disguised as a bullet point.

*   **Where is it over-specified?**
    *   **Specific AI Models ("Sonnet 4")**: You are building for the future. Don't lock into "Sonnet 4" (which implies a future release). Structure the backend to swap models easily as SOTA changes monthly.
    *   **Specific Hex Codes**: While the design system is lovely, putting it in the roadmap risks bikeshedding. A roadmap should define the *vibe* (Warm/Heirloom), not the hex.

*   **What's missing?**
    *   **Offline/Local-First Strategy**: Kitchens often have dead zones or poor WiFi. If the "Live Execution" fails because of a blip in connectivity, the dinner is ruined. The roadmap needs an explicit "Local-First" architecture phase.
    *   **Onboarding/Empty State**: How does the app feel when you have *zero* recipes? The "Drop in grandma's card" flow assumes you have it handy. Is there a starter pack?

*   **Dependencies**:
    *   **Data Structure vs. AI**: The "Smart Scaling" and "Conflict Detection" features depend entirely on the AI extracting *structured data* (time, temp, quantity) perfectly. If the OCR is 90% good, the conflict detection might be 50% accurate (garbage in, garbage out).

## 2. Existing Feature Enhancement

*   **Live Execution Mode**
    *   *Gap*: Currently assumes a linear flow. Real cooking is parallel.
    *   *Delightful*: **"Focus Mode"**. Don't show me the Gantt chart while I'm chopping. Show me *just* "Chop Onions" with a big button.
    *   *Edge Case*: **Resource Contention**. You have one oven. Two dishes need it at different temps. The planner needs to flag this *before* shopping.

*   **Recipe Ingestion**
    *   *Gap*: Handling "implicit" knowledge ("Cook until done").
    *   *Delightful*: **Interactive Overlay**. When reviewing the extraction, overlay the text boxes directly on the original image (like iOS Live Text) for rapid verification.
    *   *UX*: **"The Abbreviation Dictionary"**. Learn that "T" means Tablespoon for *this* user, but Teaspoon for *that* user.

*   **Shopping Lists**
    *   *Gap*: Buying things you already have.
    *   *Delightful*: **"Pantry Check"**. Before finalizing the list, ask: "Do you need Salt, Olive Oil, and Flour, or do you have these staples?"

## 3. New Ideas

1.  **"The Prep-Ahead Protocol" (High Leverage)**
    *   **Problem**: Doing everything on "Sunday" is stressful.
    *   **Solution**: An algorithm that tags every step as "Doable 2 days before," "Doable 1 day before," or "Must do live." The app then generates a "Saturday Prep List" automatically.
    *   **Why**: It flattens the stress curve. Compounds with existing recipe parsing.

2.  **"Potluck / Guest Portal" (Virality)**
    *   **Problem**: The host does everything.
    *   **Solution**: A "Magic Link" for guests. They don't download the app. They see the menu, can claim a "To-Bring" item (wine, dessert), or enter dietary restrictions directly.
    *   **Why**: Spreads brand awareness to guests without friction. Solves the "What can I bring?" dance.

3.  **"Post-Game Analysis" (Long-term Value)**
    *   **Problem**: You forget what went wrong last year.
    *   **Solution**: Automatic prompt 2 hours after "Serve Time": "Did the turkey dry out? Was the gravy salty?" Save these as "Warnings" that pop up *next time* you add that recipe.
    *   **Why**: Turns the app into a learning tool, not just a static record.

## 4. Jobs Innovation Lens

*   **How can I make the complex appear simple?**
    *   *Abstraction*: **"The 15-minute Buffer"**. Don't ask the user to pad times. The system should silently inject "changeover" time between tasks so the schedule never feels impossible.

*   **What would this be like if it just worked magically?**
    *   *Ideal*: I take a photo of the 3 handwritten cards I want to make. The app says, "Cool, start at 2:00 PM if you want to eat at 6:00 PM. Here's your shopping list." Zero typing.

*   **What's the one thing this absolutely must do perfectly?**
    *   **Sync**. If my phone says "Put in oven" and my partner's phone is lagging and says "Prep Salad," trust is destroyed. State synchronization must be sub-second and conflict-free.

*   **How would I make this insanely great instead of just good?**
    *   *The Gap*: "Good" manages the food. "Insanely Great" manages the **atmosphere**.
    *   *Idea*: Integration with Spotify/Sonos. The playlist starts "Chill" during prep and switches to "Dinner Party" mode when you hit "Serve."

## 5. Technical Considerations

*   **Architectural Choices**:
    *   **Next.js Server Actions vs. Long Tasks**: Parsing 5 recipes and generating a schedule is heavy. You might hit Vercel's serverless timeout (usually 10-60s). Move AI orchestration to a background job queue (e.g., Inngest, Trigger.dev) immediately.
    *   **Database**: Supabase is great, but for the "Killer Feature" (Live Execution), consider **Local-First** architecture (e.g., Replicache, ElectricSQL, or just robust distinct PouchDB/RxDB syncing). If the internet cuts out, the app *cannot* stop working.

*   **Mobile/Tablet Responsiveness**:
    *   **Gantt Charts on Mobile**: These are notoriously terrible on vertical screens. You need a dedicated "List View" or "Stack View" for mobile that abstracts the timeline into a linear queue. Don't try to squeeze the Gantt chart onto an iPhone.

*   **State-of-the-Art Check**:
    *   **Voice Interactivity**: SOTA is now low-latency voice-to-voice (like OpenAI Realtime API). In a messy kitchen, "Hey Sunday, what's next?" is better than touching a screen.

*   **Performance/Scalability**:
    *   **Image Storage**: High-res photos of recipes adds up. Ensure you're optimizing images on upload (Cloudinary/Uploadcare or sharp on a lambda) or you'll burn through storage limits and bandwidth.
