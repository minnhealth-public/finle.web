import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import React from 'react';
import Header from './components/Header'
import Navigation from "./components/Navigation";
import ShortsListPage from './pages/ShortsListPage'
import ShortPage from "./pages/ShortPage";
import MainPagePreAuth from "./pages/MainPagePreAuth";
import { Footer } from "./components/Footer";
import { SetupUser } from "./components/SetupUser";
import { GlossaryPage } from "./pages/Glossary";
import { PartnersPage } from "./pages/PartnersPage";
import VideosListPage from "./pages/VideosListPage/VideosListPage";
import {AuthProvider} from './contexts/AuthContext';
import LoginPage from "./pages/LoginPage";
import { RequireAuth } from "./shared/View/RequireAuth";

function App(): JSX.Element {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Navigation />
        <Routes>
          <Route path="/" element={<MainPagePreAuth/>} />
          <Route path='/shorts' element={<RequireAuth><ShortsListPage/></RequireAuth>} />
          <Route path="/videos" element={<RequireAuth><VideosListPage/></RequireAuth>} />
          <Route path='/shorts/:id' element={<ShortPage />} />
          <Route path='/glossary' element={<GlossaryPage />} />
          <Route path='/partners' element={<PartnersPage/>} />
          <Route path='/login' element={<LoginPage/>}  />
        </Routes>
        <SetupUser/>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
