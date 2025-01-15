import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import './App.css';

import React, { Suspense } from 'react';

// Toast support
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';

import Header from './components/Header'
import Navigation from "./components/Navigation";
import { Footer } from "./components/Footer";
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from "./shared/View/RequireAuth";
import { AboutPage } from "./pages/AboutPage";

import { useIsFetching } from "@tanstack/react-query";
import Spinner from "./shared/Spinner";
import WalkThrough from "./components/WalkThrough";
import SSOLoginCallback from "./components/SSOLoginCallback";


// Lazy load the pages for production this will mean that each page will be it's own js
// that is loaded in instead of one large js file.
const ResourcePage = React.lazy(() => import("./pages/ResourcePage/ResourcePage"));
const TodoPage = React.lazy(() => import("./pages/TodoPage/TodoPage"));
const TodoDetailPage = React.lazy(() => import("./pages/TodoDetailPage/TodoDetailPage"));
const MyNotesPage = React.lazy(() => import("./pages/MyNotesPage/MyNotesPage"));
const GlossaryPage = React.lazy(() => import("./pages/Glossary/Glossary"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const TokenLoginPage = React.lazy(() => import("./pages/TokenLoginPage"));
const HowItWorksPage = React.lazy(() => import("./pages/HowItWorksPage"));
const LogoutPage = React.lazy(() => import("./pages/LogoutPage"));
const UnderConstruction = React.lazy(() => import("./pages/UnderConstruction"));
const SetupPage = React.lazy(() => import("./pages/SetupPage/SetupPage"));
const VideosListPage = React.lazy(() => import("./pages/VideosListPage/VideosListPage"));
const ClipPage = React.lazy(() => import("./pages/ClipPage"));
const MainPagePreAuth = React.lazy(() => import("./pages/MainPagePreAuth"));
const AccountPage = React.lazy(() => import("./pages/AccountPage/AccountPage"));
const AccountRecovery = React.lazy(() => import("./pages/AccountRecovery"));
const AccountReset = React.lazy(() => import("./pages/AccountReset"));


function App(): JSX.Element {

  const isFetching = useIsFetching()
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Navigation />
        {isFetching > 0 && <Spinner />}
        <WalkThrough />
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<MainPagePreAuth />} />
            <Route path="/videos" element={<RequireAuth><VideosListPage /></RequireAuth>} />
            <Route path='/resources' element={<RequireAuth><ResourcePage /></RequireAuth>} />
            <Route path='/my-notes' element={<RequireAuth><MyNotesPage /></RequireAuth>} />
            <Route path='/videos/:id' element={<RequireAuth><ClipPage /></RequireAuth>} />
            <Route path='/glossary' element={<RequireAuth><GlossaryPage /></RequireAuth>} />
            <Route path='/about' element={<UnderConstruction />} />
            <Route path='/todos' element={<RequireAuth><TodoPage /></RequireAuth>} />
            <Route path='/todos/:id' element={<RequireAuth><TodoDetailPage /></RequireAuth>} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/token-login' element={<TokenLoginPage />} />
            <Route path='/logout' element={<LogoutPage />} />
            <Route path='/setup' element={<SetupPage />} />
            <Route path='/account' element={<RequireAuth><AccountPage /></RequireAuth>} />
            <Route path='/account/recover' element={<AccountRecovery />} />
            <Route path='/account/recover/reset' element={<AccountReset />} />
            <Route path='/account/provider/callback' element={<SSOLoginCallback />} />
            <Route path='/how-it-works' element={<RequireAuth><HowItWorksPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </Suspense>
        <Footer />
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
