import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import api, { getImageUrl } from '../utils/api.js'
import Loader from '../components/Loader.jsx'

function CarouselHero({ slides }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', containScroll: 'trimSnaps' })

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900 shadow-lg shadow-slate-900/10">
        <div className="embla h-[420px]" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide) => (
              <div key={slide._id || slide.id} className="min-w-full flex-shrink-0 relative">
                <img src={getImageUrl(slide.image)} alt={slide.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/10 to-slate-950/80" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16">
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-indigo-300">{slide.subtitle || 'Featured slide'}</p>
                  <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{slide.title}</h2>
                  {slide.buttonText && slide.link && (
                    <Link
                      to={slide.link}
                      className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/10 transition hover:bg-slate-100"
                    >
                      {slide.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex justify-between px-4">
          <button
            onClick={scrollPrev}
            type="button"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white shadow-sm transition hover:bg-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            type="button"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white shadow-sm transition hover:bg-slate-900"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

function BannerSection({ banners }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <div key={banner._id || banner.id} className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            {banner.image && (
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                <img src={getImageUrl(banner.image)} alt={banner.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="space-y-2 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">{banner.subtitle || 'Banner'}</p>
              <h3 className="text-xl font-semibold text-slate-900">{banner.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{banner.description || 'Special offers and announcements.'}</p>
              {banner.buttonText && banner.link && (
                <Link
                  to={banner.link}
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  {banner.buttonText}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CategoryProductsCarousel({ category, products }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">{category.title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{category.tagline || 'Top picks'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{category.description || 'Shop this collection for curated favorites.'}</p>
        </div>
        <Link to={`/category/${category.slug}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          View all in {category.title}
        </Link>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-4 p-4" ref={emblaRef}>
            {products?.length > 0 ? (
              products.map((product) => (
                <Link
                  key={product.id || product._id}
                  to={`/product/${product.id || product._id}`}
                  className="group min-w-[240px] flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-indigo-200"
                >
                  <div className="h-48 overflow-hidden bg-slate-100 relative">
                    <img src={getImageUrl(product.thumbnail)} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex h-full flex-col justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-indigo-600 font-medium">{product.category}</p>
                      <h3 className="mt-1 text-base font-bold text-slate-900 leading-tight">{product.title}</h3>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <span className="text-lg font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Buy now</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="min-w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No products found for this collection.
              </div>
            )}
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
      </div>
    </section>
  )
}

export default function Home() {
  const [categories, setCategories] = useState([])
  const [carouselSlides, setCarouselSlides] = useState([])
  const [banners, setBanners] = useState([])
  const [categoryProducts, setCategoryProducts] = useState({})
  const [featured, setFeatured] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })
  const [categoriesEmblaRef] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps' })
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setStatus('loading')
        const [categoryRes, carouselRes, bannerRes, featuredRes] = await Promise.all([
          api.get('/categories'),
          api.get('/carousel'),
          api.get('/banners'),
          api.get('/products?limit=8'),
        ])
        setCategories(categoryRes.data)
        setCarouselSlides(carouselRes.data)
        setBanners(bannerRes.data)
        setFeatured(featuredRes.data)

        const categorySet = categoryRes.data.slice(0, 4)
        const productsByCategory = {}
        await Promise.all(
          categorySet.map(async (category) => {
            const response = await api.get(`/products?category=${encodeURIComponent(category.slug)}&limit=6`)
            productsByCategory[category.slug] = response.data
          }),
        )
        setCategoryProducts(productsByCategory)
        setStatus('succeeded')
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || fetchError.message)
        setStatus('failed')
      }
    }

    loadHomeData()
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

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-white/80">
                New arrivals
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Seasonal styles that stand out</h1>
              <p className="max-w-xl text-lg leading-8 text-white/80">Explore curated collections with premium deals for every look.</p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:bg-slate-100"
                >
                  Shop new arrivals
                </Link>
                <Link to="/user" className="inline-flex items-center justify-center rounded-3xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10">
                  My account
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[32px] bg-pink-600 p-10 shadow-2xl shadow-pink-500/20">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/80">Bold essentials</p>
                <h2 className="mt-4 text-3xl font-bold text-white">Refresh your wardrobe with statement pieces.</h2>
              </div>
              <div className="rounded-[32px] bg-indigo-600 p-10 shadow-2xl shadow-indigo-500/20">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/80">Curated collections</p>
                <h2 className="mt-4 text-3xl font-bold text-white">Discover designer favorites for every occasion.</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {carouselSlides.length > 0 && <CarouselHero slides={carouselSlides} />}

      {banners.length > 0 && <BannerSection banners={banners} />}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Find your next favorite collection</h2>
            <p className="mt-2 text-sm text-slate-600">Categories designed for fast browsing, better performance, and strong merchandising.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Explore all categories →
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="embla" ref={categoriesEmblaRef}>
            <div className="flex gap-4 p-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  to={`/category/${category.slug}`}
                  key={category.slug}
                  className="group min-w-[280px] flex-shrink-0 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-48 overflow-hidden bg-slate-100">
                    {category.image ? (
                      <img src={getImageUrl(category.image)} alt={category.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-200 text-sm uppercase text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="flex h-full flex-col justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">{category.tagline || 'Collection'}</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{category.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{category.description || 'Explore the latest curated collection.'}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">View category</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured products</h2>
            <p className="mt-1 text-sm text-slate-600">Browse top products in a sleek, scrollable showcase.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all products
          </Link>
        </div>

        <div className="relative mt-8">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="embla" ref={emblaRef}>
              <div className="flex gap-4 pb-4">
                {featured.slice(0, 8).map((product) => (
                  <Link
                    key={product.id || product._id}
                    to={`/product/${product.id || product._id}`}
                    className="group min-w-[300px] flex-shrink-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_80px_-40px_rgba(15,23,42,0.35)]"
                  >
                    <div className="flex h-full flex-col">
                      <div className="relative overflow-hidden bg-slate-100">
                        <img
                          src={getImageUrl(product.thumbnail)}
                          alt={product.title}
                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 top-4 flex justify-end px-4">
                          <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white shadow-lg shadow-slate-950/10">
                            Premium
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">{product.category || 'Premium'}</p>
                          <h3 className="mt-3 text-xl font-semibold text-slate-900 leading-tight">{product.title}</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-600">Luxury</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-600">Fast shipping</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-600">In stock</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm text-slate-500 line-through opacity-70">${(product.price * 1.25).toFixed(2)}</p>
                              <p className="text-2xl font-semibold text-slate-900">${product.price.toFixed(2)}</p>
                            </div>
                            <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800">
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
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
        </div>
      </section>

      {categories.slice(0, 3).map((category) => (
        <CategoryProductsCarousel
          key={category.slug}
          category={category}
          products={categoryProducts[category.slug] || []}
        />
      ))}
    </div>
  )
}

