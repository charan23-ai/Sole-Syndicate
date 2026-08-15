import { Link } from 'wouter';
import { CoverLightbox, Nav, Newsletter, StoryCard, storyMeta, textures } from '@/components/editorial';

export default function Home() {
  return <div className="page-in"><div className="grain" style={{backgroundImage:`url(${textures.masthead})`}} /><Nav />
    <main>
      <section className="hero" style={{backgroundImage:`url(${textures.masthead})`,backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className="hero-copy">
          <div className="kicker rise">Independent footwear culture / India</div>
          <h1 className="display rise delay-1">Under<br />sole<span className="orange">.</span></h1>
          <p className="hero-dek rise delay-2">The things beneath the hype. A field guide to the people, objects and quiet economies moving through India's streets.</p>
          <div className="hero-meta rise delay-3"><span>Issue 01</span><span>Five pieces</span><span>Free to read</span></div>
        </div>
        <CoverLightbox />
        <span className="scroll-cue">Scroll to inspect ↓</span>
      </section>

      <section className="section">
        <div className="section-top"><h2 className="section-title">The first issue</h2><p className="section-note">No moodboards. No brand decks.<br />Just the scene as it is.</p></div>
        <div className="story-grid">{storyMeta.map((story, index) => <StoryCard key={story.no} story={story} index={index} />)}</div>
      </section>

      <section className="section manifesto">
        <h2>Look<br />closer<span className="orange">.</span></h2>
        <p className="manifesto-copy">India does not need another <em>sneaker platform</em>. It needs a record of what happens after the product page: the 11:47 PM group chats, the bedroom workbenches, the dust on the outsole. <br /><br />Issue 01 is about <em>access</em> — who gets it, who sells it, and who makes something new from the leftovers.</p>
      </section>

      <div style={{padding:'0 clamp(18px, 7vw, 110px) 100px'}}><Newsletter /></div>
    </main>
    <footer className="footer"><span>© Undersole / Issue 01</span><span>Made for the in-between</span><Link href="/issue-1" className="orange" data-testid="link-footer-read">Read the full issue →</Link></footer>
  </div>;
}