import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react'
import api, { getImageUrl } from '../utils/api.js'
import { addCartItem } from '../features/cartadd/cartSlice.js'
import Loader from '../components/Loader.jsx'

function CarouselHero({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', containScroll: 'trimSnaps' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()
  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => emblaApi.off('select', onSelect)
  }, [emblaApi])

  return (
    <div className="relative overflow-hidden">
      <div className="embla h-[520px] lg:h-[560px]" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => {
            const hasExternalLink = typeof slide.link === 'string' && slide.link.startsWith('http')
            const linkPath = slide.link || '/products'

            return (
              <div
              key={slide._id || slide.id || slide.title}
              className="min-w-full flex-shrink-0 grid h-full grid-cols-1 items-center gap-0 lg:grid-cols-[1fr_1fr]"
              style={{
                backgroundColor: slide.bgColor || undefined,
                backgroundImage: slide.bgImage ? `url(${getImageUrl(slide.bgImage)})` : undefined,
                backgroundSize: slide.bgImage ? 'cover' : undefined,
                backgroundPosition: slide.bgImage ? 'center' : undefined,
                backgroundRepeat: slide.bgImage ? 'no-repeat' : undefined,
              }}
            >
                <div className="flex flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-12 lg:py-16 overflow-hidden">
                  {slide.subtitle && (
                    <span className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white w-fit">
                      {slide.subtitle}
                    </span>
                  )}
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={slide.textColor ? { color: slide.textColor } : undefined}>
                      {slide.title || 'Discover your next favorite product'}
                    </h2>
                    {slide.description && <p className="max-w-xl text-lg leading-8" style={slide.textColor ? { color: slide.textColor } : undefined}>{slide.description}</p>}
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {slide.buttonText && (
                      hasExternalLink ? (
                        <a
                          href={linkPath}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark sm:w-auto"
                        >
                          {slide.buttonText}
                        </a>
                      ) : (
                        <Link
                          to={linkPath}
                          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark sm:w-auto"
                        >
                          {slide.buttonText}
                        </Link>
                      )
                    )}
                    <Link
                      to="/products"
                      className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 sm:w-auto"
                    >
                      Browse products
                    </Link>
                  </div>
                </div>

                <div className="flex h-full items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-12 bg-transparent">
                  {slide.image ? (
                    <img
                      src={getImageUrl(slide.image)}
                      alt={slide.title}
                      className="max-h-full w-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full min-h-[340px] items-center justify-center p-8 text-center text-slate-500">
                      Image unavailable
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-between px-4">
        <button
          onClick={scrollPrev}
          type="button"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          type="button"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-100"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 px-4">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={
              selectedIndex === index
                ? 'h-2.5 w-10 rounded-full bg-primary transition'
                : 'h-2.5 w-2.5 rounded-full bg-slate-300 transition'
            }
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [carouselSlides, setCarouselSlides] = useState([])
  const [banners, setBanners] = useState([])
  const [featured, setFeatured] = useState([])
  const [homepageContent, setHomepageContent] = useState({
    categoriesSection: {
      label: 'Browse categories',
      title: 'All Categories',
      buttonText: 'View all categories →',
    },
    flashSaleSection: {
      label: 'Flash Sale',
      title: 'Shop hot deals before they disappear',
    },
    recommendationsSection: {
      label: "Today's For You!",
      title: 'Personalized recommendations',
    },
    promoSection: {
      title: 'Lets Shop Beyond Boundaries',
      subtitle:
        'From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.',
    },
  })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState({ hours: '00', minutes: '00', seconds: '00' })
  const [activeTab, setActiveTab] = useState('Best Seller')

  const [flashEmblaRef, flashEmblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })
  const [categoryEmblaRef, categoryEmblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })

  const dispatch = useDispatch()

  const scrollPrev = () => flashEmblaApi && flashEmblaApi.scrollPrev()
  const scrollNext = () => flashEmblaApi && flashEmblaApi.scrollNext()
  const scrollCategoryPrev = () => categoryEmblaApi && categoryEmblaApi.scrollPrev()
  const scrollCategoryNext = () => categoryEmblaApi && categoryEmblaApi.scrollNext()

  const handleAddToCart = (product) => {
    const item = { ...product, id: product.id || product._id }
    dispatch(addCartItem(item))
  }

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setStatus('loading')
        const [categoryRes, carouselRes, bannerRes, homepageRes, featuredRes] = await Promise.all([
          api.get('/categories'),
          api.get('/carousel'),
          api.get('/banners'),
          api.get('/homepage'),
          api.get('/products?limit=12'),
        ])

        setCategories(categoryRes.data)
        setCarouselSlides(carouselRes.data)
        setBanners(bannerRes.data)
        setHomepageContent((prev) => ({
          ...prev,
          ...homepageRes.data,
        }))
        setFeatured(featuredRes.data)
        setStatus('succeeded')
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || fetchError.message)
        setStatus('failed')
      }
    }

    loadHomeData()
  }, [])

  useEffect(() => {
    const saleEndsAt = new Date(Date.now() + 1000 * 60 * 60 * 8)
    const timer = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, saleEndsAt - now)
      const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0')
      const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0')
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0')
      setCountdown({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (status === 'loading') {
    return <Loader message="Loading homepage data..." />
  }

  if (status === 'failed') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-lg text-red-600">
        {error || 'Unable to load homepage content. Please try again later.'}
      </div>
    )
  }

  const heroSlides = [...(banners.length > 0 ? banners : carouselSlides)].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )

  const saleProducts = featured.slice(0, 6)
  const recommendationTabs = ['Best Seller', 'Keep Stylish', 'Special Discount', 'Official Store', 'Coveted Product']

  const filteredRecommendations = featured.filter((product, index) => {
    if (activeTab === 'Best Seller') return index < 8
    if (activeTab === 'Keep Stylish') return ['clothing', 'mens', 'women', 'shoes', 'fashion'].some((term) => product.category?.toLowerCase().includes(term)) || index < 4
    if (activeTab === 'Special Discount') return product.discountedPrice > 0 || index < 4
    if (activeTab === 'Official Store') return index % 2 === 0
    return index >= 2
  })

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="w-full">
        <CarouselHero slides={heroSlides} />
      </section>

      <section className="bg-slate-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">{homepageContent.categoriesSection.label}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{homepageContent.categoriesSection.title}</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-primary hover:text-primary-dark">
                {homepageContent.categoriesSection.buttonText}
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
              <div className="embla" ref={categoryEmblaRef}>
                <div className="flex gap-4 p-4">
                  {categories.slice(0, 9).map((category) => (
                    <Link
                      key={category.slug}
                      to={`/category/${category.slug}`}
                      className="min-w-[260px] flex-shrink-0 overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-5 shadow-xl transition hover:-translate-y-1"
                    >
                      <div className="flex h-full flex-col justify-between gap-4">
                        <div className="space-y-4 text-left">
                          <p className="text-xs uppercase tracking-[0.35em] text-indigo-600">{category.tagline || category.subtitle || 'Shop this collection'}</p>
                          <h3 className="text-2xl font-bold text-slate-900">{category.title}</h3>
                        </div>
                        <div className="flex items-end justify-between gap-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                            Go to
                            <ArrowRight className="h-4 w-4" />
                          </span>
                          <div className="relative h-24 w-24 overflow-hidden rounded-[28px] bg-slate-100">
                            {category.image ? (
                              <img src={getImageUrl(category.image)} alt={category.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-500">No image</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-3 px-4 pb-4">
                <button
                  onClick={scrollCategoryPrev}
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollCategoryNext}
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {homepageContent.flashSaleSection.label && (
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">{homepageContent.flashSaleSection.label}</p>
            )}
            {homepageContent.flashSaleSection.title && (
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{homepageContent.flashSaleSection.title}</h2>
            )}
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white">?</span>
            <span>{countdown.hours}</span>
            <span>:</span>
            <span>{countdown.minutes}</span>
            <span>:</span>
            <span>{countdown.seconds}</span>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
          <div className="embla" ref={flashEmblaRef}>
            <div className="flex gap-4 p-4">
              {saleProducts.map((product) => {
                const hasDiscount = product.discountedPrice > 0 && product.discountedPrice < product.price
                const salePrice = hasDiscount ? product.discountedPrice : product.price

                return (
                  <Link
                    key={product.id || product._id}
                    to={`/product/${product.id || product._id}`}
                    className="group min-w-[280px] flex-shrink-0 overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative overflow-hidden bg-white">
                      <img src={getImageUrl(product.thumbnail)} alt={product.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
                      <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
                        <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-900">Flash</span>
                        <span className="rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white">{product.stock || 0} left</span>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-indigo-600">{product.category || 'Trending'}</p>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{product.title}</h3>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          {hasDiscount && <p className="text-sm text-slate-500 line-through">{formatCurrency(product.price)}</p>}
                          <p className="text-2xl font-bold text-slate-900">{formatCurrency(salePrice)}</p>
                        </div>
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">{hasDiscount ? `${Math.round((1 - salePrice / product.price) * 100)}% off` : 'Deal'}</span>
                      </div>
                      <p className="text-xs text-slate-500">Limited stock available</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={scrollPrev}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {homepageContent.recommendationsSection.label && (
              <p className="text-sm uppercase tracking-[0.35em] text-indigo-600">{homepageContent.recommendationsSection.label}</p>
            )}
            {homepageContent.recommendationsSection.title && (
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{homepageContent.recommendationsSection.title}</h2>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {recommendationTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 shadow-sm hover:bg-slate-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {filteredRecommendations.slice(0, 8).map((product) => (
            <Link
              key={product.id || product._id}
              to={`/product/${product.id || product._id}`}
              className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative overflow-hidden bg-slate-100">
                <img src={getImageUrl(product.thumbnail)} alt={product.title} className="h-56 w-full object-cover transition duration-300 group-hover:scale-105" />
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleAddToCart(product)
                  }}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{product.title}</p>
                    <p className="text-xs uppercase tracking-[0.28em] text-indigo-600">{product.category || 'Style'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{product.rating?.toFixed(1) || '4.5'}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{product.description || 'High quality and stylish product for every occasion.'}</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {product.discountedPrice && product.discountedPrice < product.price && (
                      <p className="text-sm text-slate-500 line-through">{formatCurrency(product.price)}</p>
                    )}
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(product.discountedPrice && product.discountedPrice < product.price ? product.discountedPrice : product.price)}</p>
                  </div>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">{product.stock || 0}+ sold</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[40px] bg-slate-950 px-8 py-14 text-center text-white shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-soft">BeliBeli.com</p>
          {homepageContent.promoSection.title && (
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{homepageContent.promoSection.title}</h2>
          )}
          {homepageContent.promoSection.subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">{homepageContent.promoSection.subtitle}</p>
          )}
        </div>
      </section>
    </div>
  )
}
