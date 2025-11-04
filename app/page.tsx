
import { Suspense } from 'react';
import { Search, Sword, Shield, Sparkles, TrendingUp, Target, Zap, BookOpen, Users } from 'lucide-react';
import { GlobalSearch } from '@/components/global-search';
import { FeaturedItems } from '@/components/featured-items';
import { FeaturedMonsters } from '@/components/featured-monsters';
import { StatsOverview } from '@/components/stats-overview';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">Myth Wiki</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/items" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Items</span>
                </Button>
              </Link>
              <Link 
                href="/monsters" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Sword className="h-4 w-4" />
                  <span>Monsters</span>
                </Button>
              </Link>
              <Link 
                href="/crafts" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Crafts</span>
                </Button>
              </Link>
              <Link 
                href="/compare" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Button variant="ghost" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Compare</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Discover the World of <span className="text-blue-600">Yggdrasil</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Comprehensive database of items and monsters with detailed stats, drop rates, and cross-references
          </p>
          
          {/* Global Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <Suspense fallback={
              <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            }>
              <GlobalSearch />
            </Suspense>
          </div>
        </section>

        {/* Stats Overview */}
        <Suspense fallback={
          <div className="h-32 bg-slate-200 rounded-lg animate-pulse mb-12" />
        }>
          <StatsOverview />
        </Suspense>

        {/* Featured Content */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Featured Items */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span>Featured Items</span>
              </h3>
              <Link href="/items">
                <Button variant="outline">View All Items</Button>
              </Link>
            </div>
            <Suspense fallback={
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
                ))}
              </div>
            }>
              <FeaturedItems />
            </Suspense>
          </section>

          {/* Featured Monsters */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <Sword className="h-6 w-6 text-red-600" />
                <span>Featured Monsters</span>
              </h3>
              <Link href="/monsters">
                <Button variant="outline">View All Monsters</Button>
              </Link>
            </div>
            <Suspense fallback={
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
                ))}
              </div>
            }>
              <FeaturedMonsters />
            </Suspense>
          </section>
        </div>

        {/* Tools Section */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Game Tools & Utilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Farm Optimizer */}
            <Link href="/tools/optimizer" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Target className="h-7 w-7 text-orange-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    Farm Optimizer
                  </h4>
                  <span className="inline-block px-2 py-1 bg-orange-500/20 text-orange-700 text-xs font-bold rounded-full mb-2">
                    BETA
                  </span>
                  <p className="text-sm text-slate-600 mt-2">
                    Find the best monsters to farm
                  </p>
                </div>
              </div>
            </Link>

            {/* Character Builder */}
            <Link href="/tools/builder" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    Character Builder
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Create and manage builds
                  </p>
                </div>
              </div>
            </Link>

            {/* Farm Tracker */}
            <Link href="/tools/tracker" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-7 w-7 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    Farm Tracker
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Track drops and profits
                  </p>
                </div>
              </div>
            </Link>

            {/* MVP Timer */}
            <Link href="/tools/mvp-timer" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    MVP Timer
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Track MVP farm sessions
                  </p>
                </div>
              </div>
            </Link>

            {/* Refinement Calculator */}
            <Link href="/tools/refinement" className="group">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    Refinement Calculator
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Calculate refine costs
                  </p>
                </div>
              </div>
            </Link>

            {/* Element Table */}
            <Link href="/tools/elements" className="group">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-6">
                  <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="h-7 w-7 text-cyan-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    Element Table
                  </h4>
                  <p className="text-sm text-slate-600 mt-2">
                    Elemental multipliers
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Quick Navigation
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/items" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Browse Items</h4>
                <p className="text-slate-600">Explore weapons, armor, consumables and more</p>
              </div>
            </Link>
            
            <Link href="/monsters" className="group">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <Sword className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Monster Database</h4>
                <p className="text-slate-600">Discover creatures, stats, and locations</p>
              </div>
            </Link>
            
            <Link href="/compare" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Compare Items</h4>
                <p className="text-slate-600">Side-by-side item comparisons</p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-semibold">Myth Wiki</span>
          </div>
          <p className="text-slate-400">
            Comprehensive game database for Myth of Yggdrasil
          </p>
        </div>
      </footer>
    </div>
  );
}
