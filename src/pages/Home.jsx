import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react'
import api, { getImageUrl } from '../utils/api.js'
import { addCartItem } from '../features/cartadd/cartSlice.js'
import Loader from '../components/Loader.jsx'

function CarouselHero({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', containScroll: 'trimSnaps' })

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/30">
      <div className="embla h-[430px]" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide._id || slide.id || slide.title} className="min-w-full flex-shrink-0 relative">
              {slide.image ? (
                <img src={getImageUrl(slide.image)} alt={slide.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-700">No image available</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-transparent to-transparent" />
              <div className="absolute inset-y-0 right-0 flex w-1/2 items-end justify-end p-6">
                {slide.tagline && <span className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">{slide.tagline}</span>}
              </div>
            </div>
          ))}
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
    </div>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [carouselSlides, setCarouselSlides] = useState([])
  const [banners, setBanners] = useState([])
  const [featured, setFeatured] = useState([])
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
        const [categoryRes, carouselRes, bannerRes, featuredRes] = await Promise.all([
          api.get('/categories'),
          api.get('/carousel'),
          api.get('/banners'),
          api.get('/products?limit=12'),
        ])

        setCategories(categoryRes.data)
        setCarouselSlides(carouselRes.data)
        setBanners(bannerRes.data)
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

  const heroSlides = carouselSlides.length > 0 ? carouselSlides : [
    {
      title: 'Limited Time Offer! Up to 50% OFF!',
      subtitle: 'Big Fashion Sale',
      description: 'Redefine your everyday style with curated categories and premium deals.',
      image: banners[0]?.image || categories[0]?.image,
      buttonText: 'Shop now',
      link: '/products',
    },
  ]

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
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">#Big Fashion Sale</p>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Limited Time Offer! <span className="text-emerald-600">Up to 50% OFF!</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Redefine Your Everyday Style with curated categories and fast delivery from premium storefronts.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
              >
                Shop now
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Sign up
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold">Free shipping</p>
                <p className="mt-2 text-slate-500">On orders over $99</p>
              </div>
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold">24/7 support</p>
                <p className="mt-2 text-slate-500">Always available</p>
              </div>
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold">Verified sellers</p>
                <p className="mt-2 text-slate-500">Top-rated stores</p>
              </div>
              <div className="rounded-[28px] bg-white p-5 text-sm text-slate-700 shadow-sm">
                <p className="font-semibold">Easy returns</p>
                <p className="mt-2 text-slate-500">Hassle-free policy</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[36px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-6">
              <CarouselHero slides={heroSlides} />
            </div>
            <div className="rounded-[36px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/20">
              <div className="grid gap-4 sm:grid-cols-2">
                {heroSlides.slice(0, 2).map((slide, index) => (
                  <div key={index} className="overflow-hidden rounded-[28px] bg-slate-100 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{slide.subtitle || 'Featured'}</p>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{slide.title}</h3>
                    {slide.description && <p className="mt-2 text-sm leading-6 text-slate-600">{slide.description}</p>}
                    {slide.buttonText && (
                      <Link
                        to={slide.link}
                        className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        {slide.buttonText}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Browse categories</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">All Categories</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">
                View all categories →
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
              <div className="embla" ref={categoryEmblaRef}>
                <div className="flex gap-4 p-4">
                  {categories.slice(0, 9).map((category) => (
                    <Link
                      key={category.slug}
                      to={`/category/${category.slug}`}
                      className="min-w-[220px] flex-shrink-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
                        {category.image ? (
                          <img src={getImageUrl(category.image)} alt={category.title} className="h-full w-full object-cover" />
                        ) : (
                          <span className="uppercase">{category.title?.charAt(0) || 'C'}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{category.title}</p>
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
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-600">Flash Sale</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Shop hot deals before they disappear</h2>
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
                const stockPercent = Math.min(Math.max(product.stock ?? 20, 0), 100)

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
                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stockPercent}%` }} />
                        </div>
                        <p className="text-xs text-slate-500">Stock availability</p>
                      </div>
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
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-600">Todays For You!</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Personalized recommendations</h2>
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
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{product.stock || 0}+ sold</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[40px] bg-slate-950 px-8 py-14 text-center text-white shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">BeliBeli.com</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Lets Shop Beyond Boundaries</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">From the best seller collections to curated local storefronts, find what you love faster with trusted sellers and premium deals.</p>
        </div>
      </section>
    </div>
  )
}
