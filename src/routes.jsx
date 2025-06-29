import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Lazy load pages for better performance
const Homepage = React.lazy(() => import('./pages/Homepage.jsx'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard'));
const ProjectsPage = React.lazy(() => import('./pages/Projects'));
const ProjectDetailsPage = React.lazy(() => import('./pages/ProjectDetails'));
const AboutPage = React.lazy(() => import('./pages/About'));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorks'));
const ContactPage = React.lazy(() => import('./pages/Contact.jsx'));
const PrivacyPage = React.lazy(() => import('./pages/Privacy.jsx'));
const TermsPage = React.lazy(() => import('./pages/Terms.jsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFound'));

// Loading component wrapper
const PageWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Homepage
      {
        index: true,
        element: (
          <PageWrapper>
            <Homepage />
          </PageWrapper>
        ),
      },
      
      // Dashboard - Protected Route
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <PageWrapper>
              <DashboardPage />
            </PageWrapper>
          </ProtectedRoute>
        ),
      },
      
      // Projects
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: (
              <PageWrapper>
                <ProjectsPage />
              </PageWrapper>
            ),
          },
          {
            path: ':projectId',
            element: (
              <PageWrapper>
                <ProjectDetailsPage />
              </PageWrapper>
            ),
          },
        ],
      },
      
      // About
      {
        path: 'about',
        element: (
          <PageWrapper>
            <AboutPage />
          </PageWrapper>
        ),
      },
      
      // How It Works
      {
        path: 'how-it-works',
        element: (
          <PageWrapper>
            <HowItWorksPage />
          </PageWrapper>
        ),
      },
      
      // Contact
      {
        path: 'contact',
        element: (
          <PageWrapper>
            <ContactPage />
          </PageWrapper>
        ),
      },
      
      // Legal Pages
      {
        path: 'privacy',
        element: (
          <PageWrapper>
            <PrivacyPage />
          </PageWrapper>
        ),
      },
      {
        path: 'terms',
        element: (
          <PageWrapper>
            <TermsPage />
          </PageWrapper>
        ),
      },
      
      // Legacy redirects for old URLs
      {
        path: 'home',
        element: <Navigate to="/" replace />,
      },
      
      // Catch-all 404 route
      {
        path: '*',
        element: (
          <PageWrapper>
            <NotFoundPage />
          </PageWrapper>
        ),
      },
    ],
  },
]);

// Route configuration metadata for navigation
export const routes = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAILS: '/projects/:projectId',
  ABOUT: '/about',
  HOW_IT_WORKS: '/how-it-works',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
};

// Navigation menu configuration
export const navigationConfig = [
  {
    name: 'Home',
    path: routes.HOME,
    icon: 'home',
    public: true,
  },
  {
    name: 'Projects',
    path: routes.PROJECTS,
    icon: 'building',
    public: true,
  },
  {
    name: 'Dashboard',
    path: routes.DASHBOARD,
    icon: 'dashboard',
    public: false, // Requires authentication
    protected: true,
  },
  {
    name: 'About',
    path: routes.ABOUT,
    icon: 'info',
    public: true,
  },
  {
    name: 'How It Works',
    path: routes.HOW_IT_WORKS,
    icon: 'help',
    public: true,
  },
];

// Footer navigation for legal pages
export const footerNavigationConfig = [
  {
    name: 'Contact',
    path: routes.CONTACT,
    public: true,
  },
  {
    name: 'Privacy Policy',
    path: routes.PRIVACY,
    public: true,
  },
  {
    name: 'Terms of Service',
    path: routes.TERMS,
    public: true,
  },
];

// Helper functions for navigation
export const generateProjectPath = (projectId) => 
  routes.PROJECT_DETAILS.replace(':projectId', projectId);

export const isActiveRoute = (currentPath, routePath) => {
  if (routePath === routes.HOME) {
    return currentPath === routes.HOME;
  }
  return currentPath.startsWith(routePath);
};

// Breadcrumb configuration
export const getBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: routes.HOME }];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    switch (segment) {
      case 'dashboard':
        breadcrumbs.push({ name: 'Dashboard', path: routes.DASHBOARD });
        break;
      case 'projects':
        if (segments[index + 1]) {
          breadcrumbs.push({ name: 'Projects', path: routes.PROJECTS });
          breadcrumbs.push({ 
            name: `Project ${segments[index + 1]}`, 
            path: generateProjectPath(segments[index + 1]) 
          });
        } else {
          breadcrumbs.push({ name: 'Projects', path: routes.PROJECTS });
        }
        break;
      case 'about':
        breadcrumbs.push({ name: 'About', path: routes.ABOUT });
        break;
      case 'how-it-works':
        breadcrumbs.push({ name: 'How It Works', path: routes.HOW_IT_WORKS });
        break;
      case 'contact':
        breadcrumbs.push({ name: 'Contact', path: routes.CONTACT });
        break;
      case 'privacy':
        breadcrumbs.push({ name: 'Privacy Policy', path: routes.PRIVACY });
        break;
      case 'terms':
        breadcrumbs.push({ name: 'Terms of Service', path: routes.TERMS });
        break;
      default:
        // For unknown routes, use the segment as-is
        breadcrumbs.push({ 
          name: segment.charAt(0).toUpperCase() + segment.slice(1), 
          path: currentPath 
        });
    }
  });
  
  return breadcrumbs;
};

export default router;
