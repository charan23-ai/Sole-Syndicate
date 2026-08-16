import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, Mail, Pause, Play, X } from 'lucide-react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSubscriberCountQueryKey, useGetSubscriberCount, useSubscribeToNewsletter } from '@workspace/api-client-react';
import coverImage from '@assets/cover-hero_1786818239475.png';
import resaleImage from '@assets/piece1-resale-economy_1786818239476.png';
import aj1Image from '@assets/piece2-aj1-review_1786818239476.png';
import customizerImage from '@assets/piece3-customizer-workbench_1786818239477.png';
import cricketImage from '@assets/piece4-cricket-streetwear_1786818239477.png';
import rehanImage from '@assets/piece5-rehan-studio_1786818239478.png';
import bannerImage from '@assets/banner-newsletter_1786818239473.png';
import mastheadTexture from '@assets/masthead-texture_1786818239475.png';
import quoteCardBackground from '@assets/quote-card-bg_1786818239479.png';

export const images = {
  cover: coverImage,
  resale: resaleImage,
  aj1: aj1Image,
  customizer: customizerImage,
  cricket: cricketImage,
  rehan: rehanImage,
};
export const textures = { banner: bannerImage, masthead: mastheadTexture, quote: quoteCardBackground };

export function Nav({ reader = false }: { reader?: boolean }) {
  return (
    <nav className={reader ? 'reader-nav' : 'site-nav'}>
      {reader && <div className="progress-track"><div className="progress-bar" id="reading-progress" /></div>}
      <div className={reader ? 'reader-nav-inner' : 'nav-inner'}>
        <Link href="/" className="nav-mark" data-testid="link-home">UNDERSOLE<span className="orange">.</span></Link>
        {!reader && <div className="nav-right"><Link href="/issue-1" className="nav-link" data-testid="link-read-issue">Read issue 01</Link><span className="nav-link orange">India / 2024</span></div>}
        {reader && <div className="toc"><a href="#piece-1">01 Resale</a><a href="#piece-2">02 Review</a><a href="#piece-3">03 Ranking</a><a href="#piece-4">04 Cricket</a><a href="#piece-5">05 Rehan</a></div>}
        {reader && <Link href="/" className="nav-link" data-testid="link-close-reader">Close issue ×</Link>}
      </div>
    </nav>
  );
}

export function Newsletter() {
  const subscribeMode =
    (import.meta.env.VITE_SUBSCRIBE_MODE as string) ||
    (import.meta.env.SUBSCRIBE_MODE as string) ||
    'substack';

  const rawSubstackUrl =
    (import.meta.env.VITE_SUBSTACK_URL as string) ||
    (import.meta.env.SUBSTACK_URL as string) ||
    'https://undersole.substack.com';

  const cleanSubstackUrl = rawSubstackUrl.startsWith('http')
    ? rawSubstackUrl
    : `https://${rawSubstackUrl}`;

  const embedUrl = cleanSubstackUrl.endsWith('/embed')
    ? cleanSubstackUrl
    : `${cleanSubstackUrl.replace(/\/$/, '')}/embed`;

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const subscriber = useGetSubscriberCount({
    query: {
      queryKey: getGetSubscriberCountQueryKey(),
      enabled: subscribeMode === 'custom',
    },
  });
  const subscribe = useSubscribeToNewsletter();
  const count = subscriber.data?.count ?? 0;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setMessage('Enter a real email address.'); return; }
    setMessage('');
    subscribe.mutate({ data: { email } }, {
      onSuccess: (result) => { setMessage(result.message); setEmail(''); queryClient.setQueryData(getGetSubscriberCountQueryKey(), { count: result.subscriberCount }); },
      onError: () => setMessage('Could not save that address. Try again.'),
    });
  };
  return <section className="newsletter" style={{backgroundImage:`url(${textures.banner})`}} data-testid="section-newsletter">
    {subscribeMode === 'custom' && <div className="subscriber"><strong data-testid="text-subscriber-count">{count.toLocaleString()}</strong> readers inside</div>}
    <div className="newsletter-inner">
      <div><span className="kicker">The dispatch / once a month</span><h2>No hype.<br />Just signal.</h2></div>
      <div>
        {subscribeMode === 'substack' ? (
          <div data-testid="substack-embed-container" style={{ width: '100%', maxWidth: '480px' }}>
            <iframe
              src={embedUrl}
              width="100%"
              height="150"
              style={{ border: '0', background: 'transparent', borderRadius: '4px' }}
              frameBorder="0"
              scrolling="no"
              title="Subscribe on Substack"
              data-testid="iframe-substack-embed"
            />
          </div>
        ) : (
          <>
            <form className="newsletter-form" onSubmit={submit}>
              <Mail size={15} className="orange" />
              <input data-testid="input-newsletter-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" />
              <button data-testid="button-newsletter-submit" type="submit">{subscribe.isPending ? 'Joining' : 'Join'}</button>
            </form>
            {message && <div className="form-message" data-testid="status-newsletter">{message}</div>}
          </>
        )}
      </div>
    </div>
  </section>;
}

export function CoverLightbox() {
  const [open, setOpen] = useState(false);
  return <>
    <div className="cover-frame rise delay-2" data-testid="cover-frame">
      <img src={images.cover} alt="Custom orange sneaker crossing a wet street" />
      <span className="cover-tag">Issue 01 / 2024</span>
      <button className="cover-button" onClick={() => setOpen(true)} data-testid="button-open-cover">View cover ↗</button>
    </div>
    {open && <div style={{position:'fixed',inset:0,zIndex:60,background:'#0d0c0bdf',display:'grid',placeItems:'center',padding:20}} role="dialog" aria-modal="true">
      <button onClick={() => setOpen(false)} aria-label="Close cover" data-testid="button-close-cover" style={{position:'absolute',right:24,top:24,background:'none',border:0,color:'#f3eee7'}}><X size={28}/></button>
      <img src={images.cover} alt="UNDERSOLE Issue 01 cover" style={{maxHeight:'88vh',maxWidth:'min(90vw,620px)',objectFit:'contain',boxShadow:'20px 20px 0 #ff5c16'}} />
    </div>}
  </>;
}

export function PullQuote({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(true); } };
  return <aside className="pullquote" style={{backgroundImage:`url(${textures.quote})`,backgroundSize:'cover',backgroundPosition:'center'}}><p>“{children}”</p><button onClick={copy} data-testid="button-copy-quote">{copied ? <><Check size={13} /> copied</> : <><Copy size={13} /> copy quote</>}</button></aside>;
}

export function AudioShell() {
  const [playing, setPlaying] = useState(false);
  return <div className="audio-shell" data-testid="audio-shell">
    <button className="play-button" onClick={() => setPlaying(v => !v)} aria-label={playing ? 'Pause interview' : 'Play interview'} data-testid="button-audio-toggle">{playing ? <Pause size={19}/> : <Play size={19}/>}</button>
    <div className="audio-copy"><strong>{playing ? 'Playing / Rehan in his own words' : 'Listen / Rehan in his own words'}</strong><span>Simulated interview · 08:14</span></div>
    <div className="audio-wave" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{height: playing ? undefined : 5}} />)}</div>
  </div>;
}

export const storyMeta = [
  { no:'01', title:"The rise of India's sneaker resale economy", type:'Deep-dive', image:images.resale, href:'/issue-1#piece-1' },
  { no:'02', title:'Lost & Found: worth the hype in India?', type:'Review', image:images.aj1, href:'/issue-1#piece-2' },
  { no:'03', title:'Top 10 Indian sneaker customizers right now', type:'Ranking', image:images.customizer, href:'/issue-1#piece-3' },
  { no:'04', title:'Cricket culture meets sneaker culture', type:'Trend analysis', image:images.cricket, href:'/issue-1#piece-4' },
  { no:'05', title:'The interview: Rehan, underground customizer', type:'Simulated interview', image:images.rehan, href:'/issue-1#piece-5' },
];

export function StoryCard({ story, index }: { story: typeof storyMeta[number]; index: number }) {
  return <a className="story-card rise" style={{animationDelay:`${index * .08}s`}} href={story.href} data-testid={`link-story-${story.no}`}>
    <img className="story-image" src={story.image} alt="" /><div className="story-shade" /><span className="arrow"><ArrowUpRight /></span>
    <div className="story-copy"><span className="story-no">{story.no} / {story.type}</span><h3>{story.title}</h3><p>Read the piece →</p></div>
  </a>;
}