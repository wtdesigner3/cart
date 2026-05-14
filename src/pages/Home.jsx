import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import useEmblaCarousel from 'embla-carousel-react'
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Heart,
  Mail,
} from 'lucide-react'
import api, { getImageUrl } from '../utils/api.js'
import { addCartItem } from '../features/cartadd/cartSlice.js'
import Loader from '../components/Loader.jsx'

/* ─── SERVICE HIGHLIGHTS ──────────────────────────────────────────────────── */
const SERVICE_ITEMS = [
  { icon: Truck,        title: 'FREE SHIPPING',   sub: 'On orders over $99'   },
  { icon: RotateCcw,    title: 'EASY RETURNS',    sub: '30-day return policy' },
  { icon: ShieldCheck,  title: 'SECURE PAYMENT',  sub: '100% secure checkout' },
  { icon: Headphones,   title: '24/7 SUPPORT',    sub: "We're here to help"   },
]

/* ─── HERO CAROUSEL ───────────────────────────────────────────────────────── */
function CarouselHero({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', containScroll: 'trimSnaps' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  const scrollTo  = (i) => emblaApi && emblaApi.scrollTo(i)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => emblaApi.off('select', onSelect)
  }, [emblaApi])

  if (!slides.length) return null

  return (
    <div className="relative overflow-hidden bg-[#f9f8f6]">
      <div className="embla h-[500px] lg:h-[620px]" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => {
            const isDark = !!(slide.bgImage || slide.bgColor === '#000' || slide.bgColor?.startsWith('#0') || slide.bgColor?.startsWith('#1'))
            const linkPath = slide.link || '/products'
            const isExternal = typeof slide.link === 'string' && slide.link.startsWith('http')
            const CTA = isExternal
              ? <a href={linkPath} target="_blank" rel="noreferrer" className="inline-block bg-[#0a0a0a] px-8 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3d3d3d]">{slide.buttonText || 'SHOP NOW'}</a>
              : <Link to={linkPath} className="inline-block bg-[#0a0a0a] px-8 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#3d3d3d]">{slide.buttonText || 'SHOP NOW'}</Link>

            if (isDark) return (
              <div key={slide._id || slide.title} className="relative min-w-full flex-shrink-0 h-full flex items-center overflow-hidden"
                style={{ backgroundColor: slide.bgColor || '#0f0f0f', backgroundImage: slide.bgImage ? `url(${getImageUrl(slide.bgImage)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/55" />
                <div className="relative z-10 mx-auto w-full max-w-7xl px-8 lg:px-16">
                  {slide.subtitle && <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/60">{slide.subtitle}</p>}
                  <h2 className="mt-4 max-w-2xl text-5xl font-black uppercase leading-[1.05] text-white lg:text-7xl">{slide.title || 'Discover your next favorite product'}</h2>
                  {slide.description && <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">{slide.description}</p>}
                  <div className="mt-8 flex flex-wrap gap-4">{CTA}</div>
                </div>
                {slide.image && (
                  <div className="absolute right-0 top-0 hidden h-full w-1/2 overflow-hidden lg:block">
                    <img src={getImageUrl(slide.image)} alt={slide.title} className="h-full w-full object-cover opacity-60 mix-blend-luminosity" />
                  </div>
                )}
              </div>
            )

            return (
              <div key={slide._id || slide.title} className="min-w-full flex-shrink-0 grid h-full grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: slide.bgColor || '#f9f8f6' }}>
                <div className="flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-20">
                  {slide.subtitle && <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#8a8a8a]">{slide.subtitle}</p>}
                  <h2 className="mt-4 text-5xl font-black uppercase leading-[1.05] text-[#0a0a0a] lg:text-6xl xl:text-7xl">{slide.title || 'Discover your next favorite product'}</h2>
                  {slide.description && <p className="mt-5 max-w-sm text-sm leading-7 text-[#3d3d3d]">{slide.description}</p>}
                  <div className="mt-8 flex flex-wrap gap-4">
                    {CTA}
                    <Link to="/products" className="inline-block border border-[#0a0a0a] px-8 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white">
                      Browse products
                    </Link>
                  </div>
                </div>
                <div className="hidden h-full overflow-hidden lg:block">
                  {slide.image
                    ? <img src={getImageUrl(slide.image)} alt={slide.title} className="h-full w-full object-contain object-center" />
                    : <div className="flex h-full items-center justify-center bg-[#f3f2f0] text-sm text-[#8a8a8a]">No image</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Arrows */}
      <button onClick={scrollPrev} type="button" aria-label="Previous slide" className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-[#e5e4e2] bg-white/90 text-[#0a0a0a] shadow-sm backdrop-blur-sm transition hover:bg-white">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button onClick={scrollNext} type="button" aria-label="Next slide" className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-[#e5e4e2] bg-white/90 text-[#0a0a0a] shadow-sm backdrop-blur-sm transition hover:bg-white">
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button key={i} type="button" onClick={() => scrollTo(i)} aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 ${selectedIndex === i ? 'h-[3px] w-8 bg-[#0a0a0a]' : 'h-[3px] w-3 bg-[#0a0a0a]/30'}`} />
        ))}
      </div>
    </div>
  )
}

/* ─── PRODUCT CARD ────────────────────────────────────────────────────────── */
function ProductCard({ product, onAddToCart }) {
  const [wishlisted, setWishlisted] = useState(false)
  const hasDiscount = product.discountedPrice > 0 && product.discountedPrice < product.price
  const salePrice   = hasDiscount ? product.discountedPrice : product.price
  const fmt         = (v) => `₹${Number(v).toFixed(2)}`
  const pid         = product.id || product._id

  return (
    <div className="group relative flex w-[240px] flex-shrink-0 flex-col bg-white sm:w-[260px]">
      {/* Image area */}
      <div className="relative overflow-hidden bg-[#f5f5f5]">
        <Link to={`/product/${pid}`} className="block">
          <img
            src={getImageUrl(product.thumbnail)}
            alt={product.title}
            className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 bg-[#0a0a0a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
            -{Math.round((1 - salePrice / product.price) * 100)}%
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={() => setWishlisted((w) => !w)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-white/95 text-[#0a0a0a] shadow-sm transition hover:bg-white"
        >
          <Heart className="h-[15px] w-[15px]" fill={wishlisted ? '#0a0a0a' : 'none'} strokeWidth={1.5} />
        </button>

        {/* Add-to-cart slide-up */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#0a0a0a]/95 py-2.5 transition-transform duration-300 group-hover:translate-y-0">
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="flex w-full items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 border-x border-b border-[#ebebeb] px-3 py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#aaa]">
          {product.category || 'Collection'}
        </p>
        <Link to={`/product/${pid}`} className="text-sm font-semibold leading-snug text-[#0a0a0a] line-clamp-1 hover:underline underline-offset-2">
          {product.title}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-black text-[#0a0a0a]">{fmt(salePrice)}</span>
          {hasDiscount && <span className="text-xs text-[#aaa] line-through">{fmt(product.price)}</span>}
        </div>
      </div>
    </div>
  )
}

/* ─── PRODUCT CAROUSEL (shared between Featured & New Arrivals) ───────────── */
function ProductCarousel({ products, onAddToCart }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  if (!products.length) return null

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>

      {/* Nav */}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={scrollPrev} type="button" aria-label="Scroll left" className="flex h-9 w-9 items-center justify-center border border-[#e5e4e2] bg-white text-[#0a0a0a] transition hover:bg-[#f3f2f0]">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button onClick={scrollNext} type="button" aria-label="Scroll right" className="flex h-9 w-9 items-center justify-center border border-[#e5e4e2] bg-white text-[#0a0a0a] transition hover:bg-[#f3f2f0]">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── SECTION HEADER ──────────────────────────────────────────────────────── */
function SectionHeader({ label, title, linkTo, linkText = 'View all' }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {label && <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#8a8a8a]">{label}</p>}
        {title && <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-[#0a0a0a] lg:text-3xl">{title}</h2>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0a0a0a] underline-offset-4 hover:underline">
          {linkText}
        </Link>
      )}
    </div>
  )
}

/* ─── HOME PAGE ───────────────────────────────────────────────────────────── */
export default function Home() {
  const [categories,      setCategories]      = useState([])
  const [carouselSlides,  setCarouselSlides]  = useState([])
  const [banners,         setBanners]         = useState([])
  const [featured,        setFeatured]        = useState([])
  const [homepageContent, setHomepageContent] = useState({
    categoriesSection:     { label: 'Browse categories', title: 'SHOP BY CATEGORY', buttonText: 'View all' },
    flashSaleSection:      { label: 'This Week',         title: 'FEATURED PRODUCTS' },
    recommendationsSection:{ label: "Editor's Pick",     title: 'NEW ARRIVALS'      },
    promoSection:          { title: 'UP TO 50% OFF',     subtitle: 'On selected items. Hurry up!' },
  })
  const [status,           setStatus]          = useState('loading')
  const [error,            setError]           = useState('')
  const [activeTab,        setActiveTab]       = useState('Best Seller')
  const [newsletterEmail,  setNewsletterEmail] = useState('')
  const [newsletterSent,   setNewsletterSent]  = useState(false)

  /* category carousel */
  const [categoryEmblaRef, categoryEmblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })
  const scrollCategoryPrev = () => categoryEmblaApi && categoryEmblaApi.scrollPrev()
  const scrollCategoryNext = () => categoryEmblaApi && categoryEmblaApi.scrollNext()

  const dispatch = useDispatch()
  const handleAddToCart = (product) => dispatch(addCartItem({ ...product, id: product.id || product._id }))

  useEffect(() => {
    const load = async () => {
      try {
        setStatus('loading')
        const [catR, carR, banR, homeR, featR] = await Promise.all([
          api.get('/categories'),
          api.get('/carousel'),
          api.get('/banners'),
          api.get('/homepage'),
          api.get('/products?limit=12'),
        ])
        setCategories(catR.data)
        setCarouselSlides(carR.data)
        setBanners(banR.data)
        setHomepageContent((prev) => ({
          ...prev,
          ...homeR.data,
          categoriesSection:      { ...prev.categoriesSection,      ...(homeR.data.categoriesSection      || {}) },
          flashSaleSection:       { ...prev.flashSaleSection,       ...(homeR.data.flashSaleSection       || {}) },
          recommendationsSection: { ...prev.recommendationsSection, ...(homeR.data.recommendationsSection || {}) },
          promoSection:           { ...prev.promoSection,           ...(homeR.data.promoSection           || {}) },
        }))
        setFeatured(featR.data)
        setStatus('succeeded')
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        setStatus('failed')
      }
    }
    load()
  }, [])

  if (status === 'loading') return <Loader message="Loading homepage data..." />
  if (status === 'failed')  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center text-lg text-red-600">
      {error || 'Unable to load homepage content. Please try again later.'}
    </div>
  )

  const heroSlides = [...(banners.length > 0 ? banners : carouselSlides)].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const recommendationTabs = ['Best Seller', 'Keep Stylish', 'Special Discount', 'Official Store', 'Coveted Product']
  const filteredRecommendations = featured.filter((product, index) => {
    if (activeTab === 'Best Seller')      return index < 10
    if (activeTab === 'Keep Stylish')     return ['clothing','mens','women','shoes','fashion'].some((t) => product.category?.toLowerCase().includes(t)) || index < 6
    if (activeTab === 'Special Discount') return product.discountedPrice > 0 || index < 6
    if (activeTab === 'Official Store')   return index % 2 === 0
    return index >= 2
  })

  return (
    <div className="bg-white text-[#0a0a0a]">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section>
        <CarouselHero slides={heroSlides} />
      </section>

      {/* ── 2. SERVICE BAR ──────────────────────────────────────────────────── */}
      <section className="border-b border-t border-[#e5e4e2] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-[#e5e4e2] lg:grid-cols-4">
            {SERVICE_ITEMS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center gap-2.5 px-4 py-6 text-center sm:flex-row sm:text-left lg:px-8">
                <div className="shrink-0"><Icon className="h-5 w-5 text-[#0a0a0a]" strokeWidth={1.5} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a0a0a]">{title}</p>
                  <p className="mt-0.5 text-[11px] text-[#8a8a8a]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SHOP BY CATEGORY ─────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            label={homepageContent.categoriesSection.label}
            title={homepageContent.categoriesSection.title || 'SHOP BY CATEGORY'}
            linkTo="/products"
            linkText={homepageContent.categoriesSection.buttonText || 'View all'}
          />

          <div className="mt-8 overflow-hidden" ref={categoryEmblaRef}>
            <div className="flex gap-4">
              {categories.slice(0, 12).map((cat) => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} className="group flex min-w-[110px] flex-shrink-0 flex-col items-center gap-3 sm:min-w-[120px]">
                  <div className="relative h-[110px] w-[110px] overflow-hidden border border-[#e5e4e2] bg-[#f9f8f6] transition-shadow duration-300 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] sm:h-[120px] sm:w-[120px]">
                    {cat.image
                      ? <img src={getImageUrl(cat.image)} alt={cat.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="flex h-full items-center justify-center text-xl font-black text-[#0a0a0a]">{cat.title?.charAt(0)}</div>}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a0a0a] transition-colors group-hover:text-[#555]">
                    {cat.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={scrollCategoryPrev} type="button" aria-label="Scroll categories left"  className="flex h-9 w-9 items-center justify-center border border-[#e5e4e2] bg-white text-[#0a0a0a] transition hover:bg-[#f3f2f0]"><ArrowLeft  className="h-4 w-4" /></button>
            <button onClick={scrollCategoryNext} type="button" aria-label="Scroll categories right" className="flex h-9 w-9 items-center justify-center border border-[#e5e4e2] bg-white text-[#0a0a0a] transition hover:bg-[#f3f2f0]"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>
      )}

      {/* ── 4. FEATURED PRODUCTS ────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-[#f9f8f6] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label={homepageContent.flashSaleSection.label}
              title={homepageContent.flashSaleSection.title || 'FEATURED PRODUCTS'}
              linkTo="/products"
            />
            <div className="mt-8">
              <ProductCarousel products={featured.slice(0, 10)} onAddToCart={handleAddToCart} />
            </div>
          </div>
        </section>
      )}

      {/* ── 5. PROMO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f0f0f]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-6 px-8 py-20 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/50">Limited Time Offer</p>
            <h2 className="mt-3 text-5xl font-black uppercase leading-[1.05] text-white lg:text-7xl">
              {homepageContent.promoSection.title || 'UP TO 50% OFF'}
            </h2>
            <p className="mt-3 text-sm text-white/50">{homepageContent.promoSection.subtitle || 'On selected items. Hurry up!'}</p>
          </div>
          <Link to="/products" className="shrink-0 inline-block border border-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.28em] text-white transition-colors hover:bg-white hover:text-[#0a0a0a]">
            SHOP NOW
          </Link>
        </div>
      </section>

      {/* ── 6. NEW ARRIVALS ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              label={homepageContent.recommendationsSection.label}
              title={homepageContent.recommendationsSection.title || 'NEW ARRIVALS'}
            />
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {recommendationTabs.map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${activeTab === tab ? 'bg-[#0a0a0a] text-white' : 'border border-[#e5e4e2] bg-white text-[#3d3d3d] hover:border-[#0a0a0a]'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <ProductCarousel products={filteredRecommendations.slice(0, 10)} onAddToCart={handleAddToCart} />
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/products" className="inline-block border border-[#0a0a0a] px-12 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a] hover:text-white">
              View All Products
            </Link>
          </div>
        </section>
      )}

      {/* ── 7. NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 shrink-0 text-white/30" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Stay in the loop</p>
                <h2 className="mt-1 text-lg font-black uppercase tracking-tight text-white lg:text-xl">Subscribe to our newsletter</h2>
                <p className="mt-1 text-xs text-white/40">Get the latest updates on new arrivals and exclusive offers.</p>
              </div>
            </div>

            {newsletterSent ? (
              <p className="text-sm font-semibold text-white/70">✓ You're subscribed! Thank you.</p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (newsletterEmail.trim()) { setNewsletterSent(true); setNewsletterEmail('') } }} className="flex w-full max-w-md">
                <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Enter your email"
                  className="flex-1 border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none" />
                <button type="submit" className="shrink-0 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#0a0a0a] transition-colors hover:bg-[#f3f2f0]">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
