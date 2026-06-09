import re
import os

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useSearchParams
content = content.replace(
    "import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';",
    "import { Routes, Route, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';"
)

# Add searchParams to App component
content = content.replace(
    "const view = location.pathname;",
    "const view = location.pathname;\n  const [searchParams] = useSearchParams();"
)

# Replace handleSearch
handle_search_from = """  const handleSearch = (query: string, state: string, municipality: string) => {
    setSearchFilters({ query, state, municipality, category: null, verifiedOnly: false, minRating: 0 });
    setView('SEARCH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };"""
handle_search_to = """  const handleSearch = (query: string, state: string, municipality: string) => {
    navigate(`/buscar?q=${encodeURIComponent(query)}&state=${state}&muni=${municipality}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };"""
content = content.replace(handle_search_from, handle_search_to)

# Replace handleCategorySelect
handle_cat_from = """  const handleCategorySelect = (category: string) => {
    setSearchFilters({ query: '', state: 'all', municipality: 'all', category, verifiedOnly: false, minRating: 0 });
    setView('SEARCH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };"""
handle_cat_to = """  const handleCategorySelect = (category: string) => {
    navigate(`/buscar?cat=${encodeURIComponent(category)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };"""
content = content.replace(handle_cat_from, handle_cat_to)

# Replace view conditionals in Main
main_block_from = """      <main className="flex-1">
        {view === '/' && (
          <>"""

main_block_to = """      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <>"""
content = content.replace(main_block_from, main_block_to)

# Replace Testimonials closing
end_home_from = """            <Testimonials />
          </>
        )}

        {(view === '/buscar' || view === '/favoritos') && ("""
end_home_to = """            <Testimonials />
            </>
          } />
          
          <Route path="/buscar" element={"""
content = content.replace(end_home_from, end_home_to)

# Adjust SearchFilters passing
searchFilters_passing_from = """          <SearchResults
            filters={searchFilters}"""
searchFilters_passing_to = """          <SearchResults
            filters={{
              query: searchParams.get('q') || '',
              state: searchParams.get('state') || 'all',
              municipality: searchParams.get('muni') || 'all',
              category: searchParams.get('cat') || null,
              verifiedOnly: searchParams.get('verified') === 'true',
              minRating: Number(searchParams.get('rating')) || 0
            }}"""
content = content.replace(searchFilters_passing_from, searchFilters_passing_to)

# Favoritos Route
end_buscar_from = """            isFavoritesView={view === '/favoritos'}
          />
        )}

        {view === '/perfil' && selectedProId && getSelectedPro() && ("""
end_buscar_to = """            isFavoritesView={false}
          />
          } />
          <Route path="/favoritos" element={
            <SearchResults
              filters={{ query: '', state: 'all', municipality: 'all', category: null, verifiedOnly: false, minRating: 0 }}
              onViewProfile={handleViewProfile}
              professionals={professionals.filter(p => favorites.includes(p.id))}
              onSuggestTrade={() => setModal('SUGGEST_TRADE')}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              isFavoritesView={true}
            />
          } />

          <Route path="/perfil" element={
            selectedProId && getSelectedPro() ? ("""
content = content.replace(end_buscar_from, end_buscar_to)

# After Perfil
end_perfil_from = """            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {view === '/privacidad' && <PrivacyPolicy onBack={handleBackToHome} />}"""
end_perfil_to = """            onUpdateProfile={handleUpdateProfile}
          />
            ) : <Navigate to="/" />
          } />

          <Route path="/privacidad" element={<PrivacyPolicy onBack={handleBackToHome} />} />"""
content = content.replace(end_perfil_from, end_perfil_to)

end_rest_from = """        {view === '/terminos' && <TermsConditions onBack={handleBackToHome} />}
        {view === '/nosotros' && <AboutUs onBack={handleBackToHome} onRegisterClick={() => setModal('PRO_REGISTER')} />}
        {view === '/blog' && <Blog onBack={handleBackToHome} />}
      </main>"""
end_rest_to = """          <Route path="/terminos" element={<TermsConditions onBack={handleBackToHome} />} />
          <Route path="/nosotros" element={<AboutUs onBack={handleBackToHome} onRegisterClick={() => setModal('PRO_REGISTER')} />} />
          <Route path="/blog" element={<Blog onBack={handleBackToHome} />} />
        </Routes>
      </main>"""
content = content.replace(end_rest_from, end_rest_to)


with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
